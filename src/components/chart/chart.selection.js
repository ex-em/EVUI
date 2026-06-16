/**
 * EvChart selectSeries 강조 부분 렌더(buffer-blit) 모듈.
 * chart.core.js 의 EvChart.prototype 에 Object.assign 으로 합쳐진다(메서드는 this 로 인스턴스에 접근).
 *
 * 배경: selectSeries 강조는 선택 안 된 시리즈를 unSelectedOpacity 로 흐리게 그려야 성립한다.
 * 기존 경로는 selection 이 바뀔 때마다 render()→clear()+drawChart() 로 전체 시리즈를 재렌더한다
 * (시리즈가 많으면 메인 스레드 블로킹). 이 모듈은 realtime scatter blit(chart.blit.js)과 같은 패턴으로,
 * 정상 opacity series 라스터를 오프스크린(seriesBaseCanvas)에 캐시해 두고, selection 만 바뀐 프레임에서는
 * base 를 globalAlpha=unSelectedOpacity 로 흐리게 합성 + 선택 시리즈만 진하게 redraw 한다.
 * (전체 N 시리즈 재렌더 → blit 1회 + 선택 시리즈만 redraw)
 *
 * base 가 stale(데이터/스케일/옵션 변경)이면 게이트가 막아 기존 full redraw 로 폴백한다(무회귀).
 */
const selection = {
  /**
   * selectSeries 부분 렌더 상태를 초기화한다(EvChart 생성자에서 1회 호출).
   * selectSeries.use 이고 비브러시일 때만 base 오프스크린을 생성한다(그 외엔 비용 0).
   * 치수는 setWidth/setHeight 가 bufferCanvas 와 동일하게 맞춘다.
   * @returns {undefined}
   */
  initSelectionBaseState() {
    this.seriesBaseCanvas = null;
    this.seriesBaseCtx = null;
    // base 라스터가 한 번이라도 그려졌는가. 무효화 키는 별도 플래그 없이 (epoch, scaleVersion, optionsRef)
    // 비교로 판정한다 — resize/데이터/show 토글은 scaleVersion·dataEpoch 가 자동으로 바꿔주므로
    // 명시적 무효화가 불필요하다(createDataSet→_dataEpoch++, computeScaleVersion→_scaleVersion++).
    this._seriesBaseBuilt = false;
    this._baseDataEpoch = null;
    this._baseScaleVersion = null;
    this._baseOptionsRef = null;

    // static(축/그리드/라벨) 라스터 캐시. 무효화 키는 series base 와 동일이나 별도 플래그로 추적.
    this.staticBaseCanvas = null;
    this.staticBaseCtx = null;
    this._staticBaseBuilt = false;
    this._staticBaseDataEpoch = null;
    this._staticBaseScaleVersion = null;
    this._staticBaseOptionsRef = null;

    if (this.options.selectSeries?.use && !this.options.brush) {
      this.seriesBaseCanvas = document.createElement('canvas');
      this.seriesBaseCtx = this.seriesBaseCanvas.getContext('2d');
      this.staticBaseCanvas = document.createElement('canvas');
      this.staticBaseCtx = this.staticBaseCanvas.getContext('2d');
    }
  },

  /**
   * base 오프스크린이 현재 buffer 치수와 일치하는지.
   * @returns {boolean}
   */
  seriesBaseSized() {
    if (!this.seriesBaseCanvas || !this.bufferCanvas) {
      return false;
    }
    return (
      this.seriesBaseCanvas.width === this.bufferCanvas.width &&
      this.seriesBaseCanvas.height === this.bufferCanvas.height &&
      this.seriesBaseCanvas.width > 1 &&
      this.seriesBaseCanvas.height > 1
    );
  },

  /**
   * static base 오프스크린이 현재 buffer 치수와 일치하는지(seriesBaseSized 미러).
   * @returns {boolean}
   */
  staticBaseSized() {
    if (!this.staticBaseCanvas || !this.bufferCanvas) {
      return false;
    }
    return (
      this.staticBaseCanvas.width === this.bufferCanvas.width &&
      this.staticBaseCanvas.height === this.bufferCanvas.height &&
      this.staticBaseCanvas.width > 1 &&
      this.staticBaseCanvas.height > 1
    );
  },

  /**
   * base 라스터가 현재 상태(데이터·스케일·옵션·치수)와 일치하는가.
   * @returns {boolean}
   */
  isSeriesBaseFresh() {
    return (
      this._seriesBaseBuilt &&
      this.seriesBaseSized() &&
      this._baseDataEpoch === this._dataEpoch &&
      this._baseScaleVersion === this._scaleVersion &&
      this._baseOptionsRef === this.options
    );
  },

  /**
   * static base 라스터가 현재 상태와 일치하는가(series base 와 동일 키, 별도 필드).
   * @returns {boolean}
   */
  isStaticBaseFresh() {
    return (
      this._staticBaseBuilt &&
      this.staticBaseSized() &&
      this._staticBaseDataEpoch === this._dataEpoch &&
      this._staticBaseScaleVersion === this._scaleVersion &&
      this._staticBaseOptionsRef === this.options
    );
  },

  /**
   * full redraw 직후(render 경로) series/static base 를 각자 stale 일 때만 재구성한다.
   * selectSeries.use 가 아니면 즉시 반환(비용 0).
   * @returns {undefined}
   */
  maybeRebuildSeriesBase() {
    const opt = this.options;
    if (!opt.selectSeries?.use || opt.brush || opt.realTimeScatter?.use || opt.workerRender) {
      return;
    }
    if (!this.seriesBaseCanvas || !this.seriesBaseSized()) {
      // 치수 미확보(초기/리사이즈 직후) — 다음 기회에 재시도.
      this._seriesBaseBuilt = false;
      this._staticBaseBuilt = false;
      return;
    }
    if (!this.isSeriesBaseFresh()) {
      this.rebuildSeriesBase();
    }
    if (!this.isStaticBaseFresh()) {
      this.rebuildStaticBase();
    }
  },

  /**
   * 무선택(정상 opacity) series 라스터를 seriesBaseCtx 에 그려 다음 partial 렌더의 baseline 으로 캐시한다.
   * buffer 에는 static(axis/grid)이 섞이므로 buffer 를 복사하지 않고 series 만 레이어에 직접 그린다
   * (rebuildPointsLayer 와 동일 원칙). 그린 시점의 (dataEpoch, scaleVersion, optionsRef)를 키로 기록한다.
   * @returns {undefined}
   */
  rebuildSeriesBase() {
    const ctx = this.seriesBaseCtx;
    if (!ctx || !this.seriesBaseSized()) {
      this._seriesBaseBuilt = false;
      return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.seriesBaseCanvas.width, this.seriesBaseCanvas.height);
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    // 무선택으로 그려 모든 시리즈가 정상 opacity(=base). selection/maxTip/selectItem 은 무력화된다.
    this.drawSeriesLayer(ctx, undefined, { noSelection: true });

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this._seriesBaseBuilt = true;
    this._baseDataEpoch = this._dataEpoch;
    this._baseScaleVersion = this._scaleVersion;
    this._baseOptionsRef = this.options;
  },

  /**
   * static(축/그리드/라벨)을 staticBaseCtx 에 hitInfo=undefined 로 그려 partial 렌더 baseline 으로 캐시.
   * 그린 시점의 무효화 키를 기록한다.
   * @returns {undefined}
   */
  rebuildStaticBase() {
    const ctx = this.staticBaseCtx;
    if (!ctx || !this.staticBaseSized()) {
      this._staticBaseBuilt = false;
      return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.staticBaseCanvas.width, this.staticBaseCanvas.height);
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    this.drawStaticLayer(ctx, undefined);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // drawStaticLayer 가 axis.ctx 를 staticBaseCtx 로 남기므로 bufferCtx 로 되돌린다.
    this.axesX.forEach((axis) => {
      axis.ctx = this.bufferCtx;
    });
    this.axesY.forEach((axis) => {
      axis.ctx = this.bufferCtx;
    });

    this._staticBaseBuilt = true;
    this._staticBaseDataEpoch = this._dataEpoch;
    this._staticBaseScaleVersion = this._scaleVersion;
    this._staticBaseOptionsRef = this.options;
  },

  /**
   * 이번 render(hitInfo) 가 selectSeries 강조-only 부분 렌더로 안전하게 처리 가능한지 판정한다.
   * 하나라도 위반하면 false → 호출부(render)가 기존 full redraw 로 폴백한다(무회귀).
   * @param {any} hitInfo   render 의 hitInfo (hover/legend hit → 있으면 full)
   * @returns {boolean}
   */
  canPartialSelectionRender(hitInfo) {
    const opt = this.options;
    // worker 렌더와는 1차에서 분리한다 — worker 비동기 commit(commitWorkerFrame)과 partial 동기
    // commit 의 epoch 경합을 피하기 위해, workerRender opt-in 시 selection 은 기존 full 경로로 처리한다.
    if (!opt.selectSeries?.use || opt.brush || opt.realTimeScatter?.use || opt.workerRender) {
      return false;
    }
    // hover/legend hit 프레임은 series 외형/가시성이 달라 full 로 처리한다.
    if (hitInfo || this.lastHitInfo || this.legendHover) {
      return false;
    }
    // base 라스터가 현재 상태와 일치해야 흐리게 합성이 정확하다.
    if (!this.isSeriesBaseFresh()) {
      return false;
    }
    // scrollbar/zoom 활성 프레임은 기하가 흔들릴 수 있어 full.
    if (this.scrollbar?.x?.use || this.scrollbar?.y?.use) {
      return false;
    }
    // selectItem/selectLabel downplay 가 동시 활성이면 opacity 중첩이 base 합성과 어긋난다 → full.
    if (
      opt.selectItem?.use &&
      (this.defaultSelectItemInfo?.dataIndex != null || this.lastHitInfo?.dataIndex != null)
    ) {
      return false;
    }
    if (
      opt.selectLabel?.use &&
      opt.selectLabel?.useSeriesOpacity &&
      this.defaultSelectInfo?.dataIndex?.length
    ) {
      return false;
    }
    // pie/sunburst 는 base 라스터(drawSeriesLayer)가 bufferCtx 로 하드코딩돼 base 가 부정확 → full.
    const charts = this.seriesInfo?.charts ?? {};
    if ((charts.pie?.length ?? 0) > 0) {
      return false;
    }
    // 무선택(해제)도 partial 로 처리한다 — base(정상 opacity 시리즈)를 그대로 합성하면 정상 차트가
    // 복원된다. base 가 stale 이면 위 isSeriesBaseFresh 체크가 이미 막으므로 안전.
    const selectedIds = this.defaultSelectInfo?.seriesId ?? [];
    // 위에 덧그리는 선택 시리즈는 단순 redraw 가능한 타입만(bar 는 showIndex 슬롯 의존, fill/stack 은
    // 알파 합성 비선형). base 에는 전체 타입이 흐리게 깔리므로, 제약은 '진하게 덧그리는' 선택 시리즈에만.
    for (let i = 0; i < selectedIds.length; i++) {
      const s = this.seriesList[selectedIds[i]];
      if (!s) {
        return false;
      }
      if (s.type !== 'line' && s.type !== 'scatter' && s.type !== 'heatMap') {
        return false;
      }
      if (s.fill || s.isExistGrp) {
        return false;
      }
    }
    return true;
  },

  /**
   * base 라스터(정상 opacity series)를 bufferCtx 에 globalAlpha=opacity 로 흐리게 합성한다.
   * device-px 직접 복사(identity transform)이며, save/restore 로 transform·globalAlpha 를 복원한다.
   * @param {number} opacity   unSelectedOpacity
   * @returns {undefined}
   */
  compositeSeriesBase(opacity) {
    const ctx = this.bufferCtx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.drawImage(this.seriesBaseCanvas, 0, 0);
    ctx.restore();
  },

  /**
   * static base 캐시를 blit 해도 안전한 프레임인지 판정한다.
   * blur(selectLabel.useLabelOpacity) 활성 시 라벨이 선택에 의존 → 캐시 부정확. hit 프레임도 제외.
   * @param {any} hitInfo
   * @returns {boolean}
   */
  canUseStaticBase(hitInfo) {
    const opt = this.options;
    if (opt.selectLabel?.use && opt.selectLabel?.useLabelOpacity) {
      return false;
    }
    if (hitInfo || this.lastHitInfo || this.legendHover) {
      return false;
    }
    return this.isStaticBaseFresh();
  },

  /**
   * static base 라스터를 bufferCtx 에 그대로 합성한다(compositeSeriesBase 미러, opacity 1).
   * @returns {undefined}
   */
  compositeStaticBase() {
    const ctx = this.bufferCtx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.staticBaseCanvas, 0, 0);
    ctx.restore();
  },

  /**
   * 선택된 시리즈만 정상 opacity(highlight)로 bufferCtx 에 덧그린다(흐린 base 위 → z-order 위).
   * @returns {undefined}
   */
  drawSelectedSeriesOnly() {
    const {
      maxTip,
      selectLabel,
      selectItem,
      selectSeries,
      brush,
      displayOverflow,
      unSelectedOpacity,
    } = this.options;

    const opt = {
      ctx: this.bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      maxTipOpt: { background: maxTip.background, color: maxTip.color },
      selectLabel: { option: selectLabel, selected: this.defaultSelectInfo },
      selectSeries: { option: selectSeries, selected: this.defaultSelectInfo },
      selectItem: { option: selectItem, selected: this.defaultSelectItemInfo },
      isBrush: !!brush,
      displayOverflow,
      unSelectedOpacity,
      isHorizontal: this.options.horizontal,
      dataEpoch: this._dataEpoch,
      scaleVersion: this._scaleVersion,
    };

    const selectedIds = this.defaultSelectInfo?.seriesId ?? [];
    for (let i = 0; i < selectedIds.length; i++) {
      const series = this.seriesList[selectedIds[i]];
      if (series && series.show) {
        series.draw({ ...opt });
      }
    }
  },

  /**
   * selectSeries 강조 부분 렌더. canPartialSelectionRender 통과 시 render 에서 호출된다.
   * static(정상) → base 흐리게 합성 → 선택 시리즈만 진하게 → overlay/tip → commit.
   * 출력 z-order/픽셀은 full redraw 와 동일해야 한다.
   * @param {any} hitInfo
   * @returns {undefined}
   */
  drawSelectionPartial(hitInfo) {
    this.clear();
    // partial 은 initScale(prepareLayout)을 거치지 않으므로 bufferCtx transform 을 명시 복원한다.
    this.bufferCtx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    // static 은 partial 프레임 간 불변이므로 캐시를 blit, 미사용이면 직접 재그린다.
    if (this.canUseStaticBase(hitInfo)) {
      this.compositeStaticBase();
    } else {
      this.drawStaticLayer(this.bufferCtx, hitInfo);
    }
    // 선택이 있으면 base 를 흐리게 깔고 선택 시리즈만 진하게 덧그린다. 해제(무선택)면 base 를
    // 정상 opacity(1) 로 그대로 합성해 정상 차트를 복원한다(덧그릴 선택 시리즈 없음).
    const hasSelection = (this.defaultSelectInfo?.seriesId ?? []).length > 0;
    this.compositeSeriesBase(hasSelection ? this.options.unSelectedOpacity : 1);
    if (hasSelection) {
      this.drawSelectedSeriesOnly();
    }

    this.drawSeriesOverlay();
    this.drawTip();

    this.commitToDisplay(this.displayCtx, this.bufferCanvas);
  },
};

export default selection;
