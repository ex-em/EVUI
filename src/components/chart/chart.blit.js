/**
 * EvChart realtime scatter blit fast-path 모듈.
 * chart.core.js 의 EvChart.prototype 에 Object.assign 으로 합쳐진다(메서드는 this 로 인스턴스에 접근).
 * 일반 차트 경로는 이 모듈을 타지 않는다 — realTimeScatter.use 전용 최적화이다.
 */
const blit = {
  /**
   * realtime scatter blit fast-path 상태를 초기화한다(EvChart 생성자에서 1회 호출).
   * @returns {undefined}
   */
  initBlitState() {
    // realtime scatter blit fast-path 상태.
    // blit = 매 틱 전체 점을 다시 그리는 대신, 이전 점 라스터를 왼쪽으로 밀고(drawImage)
    // 새로 들어온 시간대(strip)만 다시 그리는 최적화. 조건이 깨지면 기존 full redraw 로 폴백한다.
    // _blitPrev: 직전 렌더의 축/기하 스냅샷(진입 게이트 비교용). _blitDiag: 진입률 진단(개발용).
    this._blitPrev = null;
    this._blitDiag = null;
    // 점 라스터 전용 오프스크린 레이어 — series 별 ping-pong 2장(Map: sId → {a,b,actx,bctx,cur}).
    // series 마다 분리해야 full redraw 와 동일한 z-order(seriesReverse 면 series1 이 전역 위)를 합성
    // 단계에서 재현할 수 있다. 단일 라스터면 매 틱 strip 을 위에 덧그려 틱 경계마다 newer series 가
    // older series 를 덮는 seam(세로 색줄)이 생긴다. 공유 setWidth/setHeight 가 매 렌더 clear 하는
    // bufferCanvas 와 달리, 치수가 실제로 바뀔 때만 재할당해 프레임 간 픽셀을 보존한다.
    this.pointsLayers = new Map();
    this.pointsLayerValid = false; // full redraw 로 baseline 이 세워졌는가
    this._blitCarry = 0; // 정수 CSS px 시프트의 잔차 carry([-0.5,0.5]). full/strip 의 startPoint 위상으로 반영
    this._framesSinceFullRedraw = 0; // 주기적 강제 full redraw(BLIT_REFRESH_INTERVAL) 카운터
    // points layer 가 어떤 (데이터·축 매핑·기하·옵션) 상태를 그린 것인지의 스탬프.
    // full 폴백 렌더라도 스탬프가 현재 상태와 일치하면(예: legend hover 처럼 데이터가 그대로인
    // 렌더) 레이어 재구성(전체 점 재raster)을 생략해 폴백 비용을 기존 full 수준으로 유지한다.
    this._pointsLayerStamp = null;
    this._pointsLayerOptionsRef = null;
    // blit 틱은 strip 밖 점들의 calcItem 을 건너뛰므로 hit-test 용 item.xp/yp 가 점점 어긋난다.
    // 매 틱 전체를 보정하는 대신 hit-test 진입 시 1회만 지연 재계산한다(ensureHitCoordsFresh).
    this._hitCoordsDirty = false;

    if (this.options.realTimeScatter?.use) {
      this.createPointsLayers();
    }
  },

  /**
   * scatter series 별 ping-pong 레이어(미부착 오프스크린 canvas 2장)를 생성/조정한다. 현재 scatter
   * series 집합과 레이어 sId 집합이 같으면 재사용하고, 다르면 전부 재생성한다(런타임 series add/remove).
   * 신규 canvas 는 bufferCanvas 치수로 즉시 맞춘다(레이어가 layout 이후 생성돼도 사이즈가 0 으로 남지
   * 않도록). 치수 유지는 setWidth/setHeight 가 담당. realTimeScatter.use 일 때만 의미가 있다.
   * @returns {undefined}
   */
  createPointsLayers() {
    const scatterIds = this.seriesInfo?.charts?.scatter ?? [];
    const same =
      this.pointsLayers.size === scatterIds.length &&
      scatterIds.every((sId) => this.pointsLayers.has(sId));
    if (same && this.pointsLayers.size) {
      return;
    }
    const w = this.bufferCanvas?.width ?? 0;
    const h = this.bufferCanvas?.height ?? 0;
    const next = new Map();
    for (let i = 0; i < scatterIds.length; i++) {
      const a = document.createElement('canvas');
      const b = document.createElement('canvas');
      if (w > 1 && h > 1) {
        a.width = w;
        a.height = h;
        b.width = w;
        b.height = h;
      }
      next.set(scatterIds[i], {
        a,
        b,
        actx: a.getContext('2d'),
        bctx: b.getContext('2d'),
        cur: 'A',
      });
    }
    this.pointsLayers = next;
    this.pointsLayerValid = false;
  },

  /**
   * 한 series 의 현재 유효 라스터(src) 와 반대편 쓰기 대상(dst) 레이어를 반환한다.
   * @param {string} sId  series id
   * @returns {{ src, srcCtx, dst, dstCtx, dstName, layer } | null}
   */
  getSeriesLayer(sId) {
    const layer = this.pointsLayers.get(sId);
    if (!layer) {
      return null;
    }
    const isA = layer.cur === 'A';
    return {
      src: isA ? layer.a : layer.b,
      srcCtx: isA ? layer.actx : layer.bctx,
      dst: isA ? layer.b : layer.a,
      dstCtx: isA ? layer.bctx : layer.actx,
      dstName: isA ? 'B' : 'A',
      layer,
    };
  },

  /**
   * 모든 series 레이어 canvas 를 device 치수(dw,dh)로 맞춘다(setWidth/setHeight 에서 호출).
   * canvas.width/height 대입은 비트맵을 지우므로 치수가 실제로 바뀔 때만 호출해야 한다.
   * @param {number} dw   device width
   * @param {number} dh   device height
   * @returns {boolean}   하나라도 재할당(=픽셀 소거)됐으면 true → baseline 무효화 필요
   */
  resizePointsLayers(dw, dh) {
    let changed = false;
    this.pointsLayers.forEach((layer) => {
      if (layer.a.width !== dw || layer.a.height !== dh) {
        layer.a.width = dw;
        layer.a.height = dh;
        layer.b.width = dw;
        layer.b.height = dh;
        changed = true;
      }
    });
    return changed;
  },

  /**
   * 모든 점 레이어가 현재 bufferCanvas device 치수로 할당되어 있는지 확인한다.
   * @returns {boolean}
   */
  pointsLayersSized() {
    if (!this.pointsLayers.size || !this.bufferCanvas) {
      return false;
    }
    const bw = this.bufferCanvas.width;
    const bh = this.bufferCanvas.height;
    if (!(bw > 1) || !(bh > 1)) {
      return false;
    }
    let ok = true;
    this.pointsLayers.forEach((layer) => {
      if (layer.a.width !== bw || layer.a.height !== bh) {
        ok = false;
      }
    });
    return ok;
  },

  /**
   * blit fast-path 후보 scatter series(축 인덱스 포함) 전체를 show 순서대로 반환한다.
   * multi-series blit: 보이는 모든 scatter series 가 대상이다(ring 정렬은 areBlitSeriesAligned 가 판정).
   * @returns {Array<{ sId: string, series: object, xi: number, yi: number }>}
   */
  getBlitScatterSeriesList() {
    const scatterIds = this.seriesInfo?.charts?.scatter ?? [];
    const list = [];
    for (let i = 0; i < scatterIds.length; i++) {
      const series = this.seriesList[scatterIds[i]];
      if (series?.show) {
        list.push({
          sId: scatterIds[i],
          series,
          xi: series.xAxisIndex ?? 0,
          yi: series.yAxisIndex ?? 0,
        });
      }
    }
    return list;
  },

  /**
   * blit fast-path 대표 scatter series(첫 show 시리즈). 축 인덱스/스냅샷 기준으로 쓴다.
   * @returns {{ sId: string, series: object, xi: number, yi: number } | null}
   */
  getBlitScatterSeries() {
    return this.getBlitScatterSeriesList()[0] ?? null;
  },

  /**
   * multi-series blit 진입 조건: 보이는 scatter series 들의 ring buffer 가 정렬돼 있는가.
   * 모든 series 의 lastTick 이 동일한 (gapCount, toTime, endIndex, length) 을 가져야 공통 strip 으로
   * 안전하게 blit 할 수 있다(시간축·시프트량 일치). 하나라도 lastTick 이 없거나 어긋나면 false → full 폴백.
   * 단일 series 는 비교 대상이 자기뿐이라 lastTick 만 있으면 통과한다.
   * series 별 데이터 도착이 어긋나는 틱은 여기서 막혀 full 로 폴백한다(정합성 우선).
   * @param {Array<{sId:string}>} scatterList   getBlitScatterSeriesList 결과
   * @returns {boolean}
   */
  areBlitSeriesAligned(scatterList) {
    if (!scatterList || scatterList.length < 1) {
      return false;
    }
    const base = this.dataSet?.[scatterList[0].sId]?.lastTick;
    if (!base) {
      return false;
    }
    for (let i = 1; i < scatterList.length; i++) {
      const t = this.dataSet?.[scatterList[i].sId]?.lastTick;
      if (
        !t ||
        t.gapCount !== base.gapCount ||
        t.toTime !== base.toTime ||
        t.endIndex !== base.endIndex ||
        t.length !== base.length
      ) {
        return false;
      }
    }
    return true;
  },

  /**
   * blit fast-path 진입 게이트. 하나라도 위반하면 ok=false → full redraw 폴백.
   * 진단(instrumentation) 목적으로 각 게이트 항목을 개별 boolean(parts)으로 분해해 반환한다.
   * 게이트는 drawChart 가 adjustXAndYAxisWidth 로 axesSteps/labelOffset/chartRect 를 확정한 뒤 평가한다.
   * @param {any} hitInfo   drawChart 의 hitInfo (click/dblclick/legend hit → 있으면 full)
   * @returns {{ ok: boolean, parts: object, shiftMs: number, gapCount: number, length: number,
   *            scatterList: Array<{sId:string}> }}
   */
  evaluateBlitGate(hitInfo) {
    const opt = this.options;
    const prev = this._blitPrev;

    // A. 모드/구성
    const modeOk =
      this.isInit === true &&
      opt.realTimeScatter?.use === true &&
      !opt.brush &&
      this.updateSeries !== true &&
      !hitInfo &&
      !(this.scrollbar?.x?.use || this.scrollbar?.y?.use);

    // multi-series blit: 보이는 scatter series 들의 ring buffer 가 정렬(동일 gapCount/toTime/endIndex/
    // length)돼 있으면 공통 strip 으로 안전하게 blit 한다. 어긋나면 full 폴백(areBlitSeriesAligned).
    const scatterList = this.getBlitScatterSeriesList();
    const seriesAligned = this.areBlitSeriesAligned(scatterList);

    // E. 선택/downplay opacity 비활성 (전체 점 색·투명도가 흔들리면 blit 불가)
    const selectionOk =
      !(
        opt.selectItem?.use &&
        (this.defaultSelectItemInfo?.dataIndex != null || this.lastHitInfo?.dataIndex != null)
      ) &&
      !(opt.selectSeries?.use && this.defaultSelectInfo) &&
      !this.legendHover;

    const parts = {
      modeOk,
      seriesAligned,
      selectionOk,
      // blit 은 realtime scatter 전용이다.
      scatterOnly: this.hasOnlyVisibleScatter(),
      hasPrev: !!prev,
      // 옵션 변화(색·스타일 등)는 레이어 픽셀을 바꿀 수 있다. Chart.vue options watcher 가
      // 변화 시 options 참조를 통째 교체하므로 참조 비교 1회로 보수적으로 차단한다.
      optionsStable: !!prev && prev.optionsRef === this.options,
      yFixed: false,
      xWidthStable: false,
      xAreaStable: false,
      labelOffsetStable: false,
      xMonotonic: false,
      deviceStable: false,
      gapOk: false,
    };

    let shiftMs = 0;
    let gapCount = 0;
    let length = 0;

    // 축/기하 게이트는 축 step + prev 스냅샷이 있어야 평가 가능.
    // 대표 series(첫 show)의 축 인덱스로 x/y step 을 읽는다(정렬 전제상 모든 series 동일 축).
    const target = scatterList[0] ?? null;
    const sx = target ? this.axesSteps?.x?.[target.xi] : null;
    const sy = target ? this.axesSteps?.y?.[target.yi] : null;

    if (target && sx && sy && this.chartRect && this.labelOffset) {
      const cr = this.chartRect;
      const xArea = cr.chartWidth - (this.labelOffset.left + this.labelOffset.right);

      if (prev) {
        // B. y 매핑 고정 (= maxValue 불변). autoScale 로 max 가 오르면 여기서 막혀 full redraw.
        parts.yFixed = sy.graphMin === prev.graphMinY && sy.graphMax === prev.graphMaxY;

        // C. x = 순수 수평 이동
        parts.xWidthStable = sx.graphMax - sx.graphMin === prev.graphMaxX - prev.graphMinX;
        parts.xAreaStable = xArea === prev.xArea;
        parts.labelOffsetStable =
          this.labelOffset.left === prev.labelOffsetLeft &&
          this.labelOffset.right === prev.labelOffsetRight;
        shiftMs = sx.graphMin - prev.graphMinX;
        parts.xMonotonic = Number.isFinite(shiftMs) && shiftMs > 0;

        // D. 기하/디바이스 불변
        parts.deviceStable =
          this.pixelRatio === prev.pixelRatio &&
          cr.chartWidth === prev.chartWidth &&
          cr.chartHeight === prev.chartHeight &&
          cr.x1 === prev.x1 &&
          cr.y2 === prev.y2;
      }

      // F. 데이터 틱 형태 — data-layer 가 기록한 lastTick 메타. 없으면 gapOk=false.
      const lastTick = this.dataSet?.[target.sId]?.lastTick;
      if (lastTick) {
        gapCount = lastTick.gapCount ?? 0;
        length = lastTick.length ?? 0;
        parts.gapOk = gapCount > 0 && gapCount < length;
      }
    }

    const ok =
      parts.modeOk &&
      parts.seriesAligned &&
      parts.selectionOk &&
      parts.scatterOnly &&
      parts.hasPrev &&
      parts.optionsStable &&
      parts.yFixed &&
      parts.xWidthStable &&
      parts.xAreaStable &&
      parts.labelOffsetStable &&
      parts.xMonotonic &&
      parts.deviceStable &&
      parts.gapOk;

    return { ok, parts, shiftMs, gapCount, length, scatterList };
  },

  /**
   * 보이는 series 가 전부 scatter 인가.
   * blit 은 scatter 점만 합성하므로, line/bar 등 비-scatter series 가 보이면(combo) 누락된다.
   * fast-path 진입(evaluateBlitGate)과 layer 합성 폴백(canRouteFallbackViaLayer) 모두 이 조건을 요구한다.
   * @returns {boolean}
   */
  hasOnlyVisibleScatter() {
    const charts = this.seriesInfo?.charts ?? {};
    const typeKeys = Object.keys(charts);
    for (let i = 0; i < typeKeys.length; i++) {
      if (typeKeys[i] === 'scatter') {
        // eslint-disable-next-line no-continue
        continue;
      }
      const ids = charts[typeKeys[i]];
      for (let j = 0; j < ids.length; j++) {
        if (this.seriesList[ids[j]]?.show) {
          return false;
        }
      }
    }
    return true;
  },

  /**
   * 다음 틱 게이트 비교용 스냅샷. realtime scatter 이고 대표(첫 show) scatter series 가 있을 때만 의미가 있다.
   * 정렬 전제상 모든 보이는 series 가 동일 축을 쓰므로 대표 series 의 축 step 으로 비교한다(series 개수 무관).
   * @returns {object | null}
   */
  snapshotBlitState() {
    if (!this.options.realTimeScatter?.use) {
      return null;
    }
    const target = this.getBlitScatterSeries();
    if (!target) {
      return null;
    }
    const sx = this.axesSteps?.x?.[target.xi];
    const sy = this.axesSteps?.y?.[target.yi];
    if (!sx || !sy || !this.chartRect || !this.labelOffset) {
      return null;
    }
    const cr = this.chartRect;
    return {
      sId: target.sId,
      graphMinX: sx.graphMin,
      graphMaxX: sx.graphMax,
      graphMinY: sy.graphMin,
      graphMaxY: sy.graphMax,
      xArea: cr.chartWidth - (this.labelOffset.left + this.labelOffset.right),
      labelOffsetLeft: this.labelOffset.left,
      labelOffsetRight: this.labelOffset.right,
      pixelRatio: this.pixelRatio,
      chartWidth: cr.chartWidth,
      chartHeight: cr.chartHeight,
      x1: cr.x1,
      y2: cr.y2,
      // 옵션 변화 감지용 참조. Chart.vue options watcher 는 변화 시 options 객체를 통째로
      // 교체(cloneDeep)하므로 참조 비교 1회로 모든 옵션 변화를 보수적으로 잡는다.
      optionsRef: this.options,
    };
  },

  /**
   * blit 게이트 진입률 진단(개발용). window.__EVUI_BLIT_DEBUG__ 가 truthy 일 때만 집계한다.
   * 프로덕션에선 플래그 체크 1회로 비용 0. 결과는 window.__EVUI_BLIT_DIAG__ 에서 확인.
   * @param {object} gate     evaluateBlitGate 결과
   * @param {boolean} didBlit  이번 틱 fast-path 가 실제로 수행됐는가(게이트 통과 ≠ 실행: late-data 등으로 폴백 가능)
   * @param {object} blockers 게이트는 통과했으나 fast-path 가 막힌 사유(force-off/레이어 무효·미확보/주기 refresh)
   * @returns {undefined}
   */
  recordBlitDiag(gate, didBlit, blockers) {
    if (typeof window === 'undefined' || !window.__EVUI_BLIT_DEBUG__) {
      return;
    }
    if (this.options.realTimeScatter?.use) {
      window.__EVUI_BLIT_CHART__ = this; // 라이브 인스턴스 점검용(디버그 한정)
    }
    if (!this._blitDiag) {
      this._blitDiag = {
        ticks: 0,
        eligible: 0,
        blitted: 0,
        fail: {},
        rate: 0,
        lastShiftMs: 0,
        lastGap: 0,
      };
    }
    const diag = this._blitDiag;
    diag.ticks++;
    diag.lastShiftMs = gate.shiftMs;
    diag.lastGap = gate.gapCount;
    if (gate.ok) {
      diag.eligible++;
    } else {
      const keys = Object.keys(gate.parts);
      for (let i = 0; i < keys.length; i++) {
        if (!gate.parts[keys[i]]) {
          diag.fail[keys[i]] = (diag.fail[keys[i]] || 0) + 1;
        }
      }
    }
    // 게이트는 통과했지만 fast-path 가 실행되지 못한 사유(게이트 외 차단) 집계.
    if (gate.ok && !didBlit && blockers) {
      const bKeys = Object.keys(blockers);
      for (let i = 0; i < bKeys.length; i++) {
        if (blockers[bKeys[i]]) {
          diag.fail[bKeys[i]] = (diag.fail[bKeys[i]] || 0) + 1;
        }
      }
    }
    if (didBlit) {
      diag.blitted++;
    }
    diag.rate = diag.blitted / diag.ticks;
    window.__EVUI_BLIT_DIAG__ = diag;
  },

  /**
   * blit fast-path 본체. 게이트 통과 시 호출된다.
   * 이전 점 라스터를 왼쪽으로 dx 만큼 밀고(drawImage), 신규 시간대(strip)만 다시 그려 buffer 에
   * 합성한다. draw 라스터 비용을 "전체 점"에서 "신규 strip"으로 줄인다. 픽셀 복사라 좌표는 불변.
   * @param {any} hitInfo
   * @param {object} gate   evaluateBlitGate 결과(shiftMs·scatterList 사용)
   * @returns {boolean}     fast-path 수행 성공 여부(false 면 호출자가 full redraw 로 폴백)
   */
  drawChartBlitFastPath(hitInfo, gate) {
    const scatterList = gate.scatterList ?? this.getBlitScatterSeriesList();
    const target = scatterList[0] ?? null;
    const lastTick = this.dataSet?.[target?.sId]?.lastTick;
    if (!target || !lastTick) {
      return false;
    }

    const pr = this.pixelRatio;
    const cr = this.chartRect;
    const lo = this.labelOffset;
    const sx = this.axesSteps.x[target.xi];

    const xArea = cr.chartWidth - (lo.left + lo.right);
    const wMs = sx.graphMax - sx.graphMin;
    if (!(wMs > 0) || !(xArea > 0)) {
      return false;
    }

    // calcItem 과 동일한 시간→px 매핑: 시간이 shiftMs 전진하면 점이 dxCss 만큼 왼쪽으로 이동한다.
    // 시프트는 *정수 CSS px* 로만 한다(소수부는 _blitCarry 에 누산). calcItem 은 CSS px 에서 ceil 로
    // 양자화하므로, 정수 CSS px 시프트만이 ceil 과 교환돼 full redraw 와 픽셀이 일치한다(정수 device
    // px 시프트는 pr 그리드와 어긋나 점마다 ≤1px 스냅 발생 → legend hover 시 구름이 튐).
    // device 시프트 = gCss·pr (항상 pr 배수). 잔차 carry(_blitCarry, [-0.5,0.5] CSS px)는 full
    // redraw·strip 의 calcItem 이 startPoint 오프셋으로 그대로 반영한다(rtXOffsetCss).
    const dxCss = (xArea / wMs) * gate.shiftMs;
    const accCss = this._blitCarry + dxCss;
    const gCss = Math.round(accCss);
    if (gCss < 1) {
      return false; // sub-pixel 이동 → full redraw 가 안전(아주 넓은 윈도우 등 드문 경우)
    }
    const dxInt = gCss * pr;

    // 신규 점이 우측단에서 떨어진 최대 버킷 거리(maxDirtyAge)까지 strip 으로 다시 그린다. 신규 점은
    // 보통 brand-new 슬롯(age 0..gapCount-1)에 떨어지지만, x 가 초 경계 직전(graphMax floor 초과)이라
    // 도착 틱엔 범위 밖(xp=null)이고 다음 틱에야 age=gapCount 경계 버킷에서 그려지는 점이 흔하다
    // (데모: x=now ± 3초). 이를 strip 에 포함하지 않으면 영영 누락된다. strip 범위(gapCount+1)를
    // 넘는 지연/역순 데이터만 full redraw 로 폴백한다. multi-series: visible series 중 maxDirtyAge 최댓값.
    // 동시에 합성 clip 에 쓸 pointSize 최댓값을 구한다.
    let maxDirtyAge = lastTick.maxDirtyAge;
    let maxPointSize =
      typeof target.series.pointSize === 'number'
        ? target.series.pointSize
        : target.series.pointSize.value;
    for (let i = 1; i < scatterList.length; i++) {
      const t = this.dataSet?.[scatterList[i].sId]?.lastTick;
      if (t && t.maxDirtyAge > maxDirtyAge) {
        maxDirtyAge = t.maxDirtyAge;
      }
      const ps = scatterList[i].series.pointSize;
      const psVal = typeof ps === 'number' ? ps : ps.value;
      if (psVal > maxPointSize) {
        maxPointSize = psVal;
      }
    }
    if (maxDirtyAge > lastTick.gapCount + 1) {
      return false;
    }

    const wDev = this.bufferCanvas.width;
    const hDev = this.bufferCanvas.height;
    if (dxInt >= wDev) {
      return false;
    }

    // 모든 가드 통과 → 이번 시프트를 확정하고 잔차를 적립([-0.5,0.5] CSS px).
    this._blitCarry = accCss - gCss;

    // dirty 버킷(신규 strip) 인덱스 — 모든 series 공통(정렬 전제).
    //
    // 흰줄(comb) 불가 보장: 흰줄은 "픽셀을 지웠는데 다시 안 그리는" 경우(clear + clip 의 결손 컬럼)에만
    // 생긴다. 아래 시프트는 OLD 픽셀을 비트단위 무손실로 옮긴 뒤(정수좌표·동일크기 drawImage → 재양자화
    // 없음) 그 위에 strip 버킷을 덧그리기만 한다 — 픽셀 제거 연산이 없으므로 세로 흰줄이 원천 불가.
    const { gapCount, endIndex, length } = lastTick;
    // 최소 gapCount+1: 시프트로 비워진 strip(gapCount 버킷) + 경계 버킷(age gapCount) 1개.
    // 경계 버킷은 직전 틱 graphMax(=floor(maxX)) 초과로 그려지지 못한 점(x 가 초 경계 직전)이 이번 틱
    // 범위 안으로 들어와 그려지는 자리라 반드시 포함해야 한다. maxDirtyAge 가 더 멀면(지연 데이터) 거기까지.
    const dirtyCount = Math.min(length, Math.max(gapCount + 1, maxDirtyAge + 1));
    const dirtyBuckets = new Array(dirtyCount);
    for (let k = 0; k < dirtyCount; k++) {
      let idx = (endIndex - k) % length;
      if (idx < 0) {
        idx += length;
      }
      dirtyBuckets[k] = idx;
    }

    // series 별 레이어이므로 cross-series dedupe 가 필요 없다 — 겹침에서 "어느 series 가 위"인지는
    // 합성 순서(compositePointsLayer)가 full redraw 와 동일하게 결정한다. 각 series 는 자기 점만 자기
    // 레이어에 그린다(intra-series 좌표 유일성은 push 단계 dedupe 가 보장).
    const param = {
      chartRect: cr,
      labelOffset: lo,
      axesSteps: this.axesSteps,
      displayOverflow: this.options.displayOverflow,
      selectInfo: null,
      legendHitInfo: null,
      unSelectedOpacity: this.options.unSelectedOpacity,
      duple: null,
      coordinateDedupe: false,
      // 시프트 후 잔차 carry. strip 신규 점도 시프트된 옛 점과 동일 위상으로 찍어 라스터 정합 유지.
      rtXOffsetCss: this._blitCarry,
    };

    // visible series 마다 독립적으로: 1) dxInt 무손실 시프트, 2) 자기 신규 strip 덧그림, 3) ping-pong swap.
    for (let i = 0; i < scatterList.length; i++) {
      const entry = scatterList[i];
      const ly = this.getSeriesLayer(entry.sId);
      if (!ly) {
        return false; // 레이어 누락(series 셋 desync) → full 폴백
      }
      ly.dstCtx.setTransform(1, 0, 0, 1, 0, 0);
      ly.dstCtx.clearRect(0, 0, wDev, hDev);
      ly.dstCtx.drawImage(ly.src, dxInt, 0, wDev - dxInt, hDev, 0, 0, wDev - dxInt, hDev);
      ly.dstCtx.setTransform(pr, 0, 0, pr, 0, 0);
      entry.series.realTimeScatterDrawStrip(ly.dstCtx, dirtyBuckets, param);
      ly.dstCtx.setTransform(1, 0, 0, 1, 0, 0);
      ly.layer.cur = ly.dstName;
      // mousemove(findGraphData)용 전체 카운트 갱신(점 수 무관 O(버킷)).
      entry.series.refreshRtTotalCount();
    }

    // buffer 재구성: 축 새로 그리고 series 레이어들을 z-order 순서로 plot 영역에 합성.
    this.drawStaticLayer(this.bufferCtx, hitInfo);
    this.compositePointsLayer(maxPointSize);

    return true;
  },

  /**
   * 현재 점 레이어를 bufferCtx 의 plot 영역에 합성한다.
   * clip 은 plot 사각형을 네 변 모두 pointSize 만큼 확장한다 — 마커는 중심이 plot 안에 있어도
   * 반경(pointSize)만큼 경계 밖으로 스필하므로, full redraw(직접 drawSeries, clip 없음)와 동일하게
   * 좌단 점(중심이 xsp)도 좌측 절반까지 온전히 보여야 한다. 좌측만 xsp 로 hard-clip 하면 좌단 점이
   * 잘린다(#blit 좌단 회귀). 윈도우를 벗어나 좌측으로 흐른 이탈 점 픽셀은 시프트량(dxInt)이 통상
   * pointSize 의 수 배라 한 틱에 이 좁은 마진 밖으로 빠져나가고, 장기 잔재는 REFRESH_INTERVAL 강제
   * full 이 정리한다.
   * bufferCtx 는 합성 후 drawTip 을 위해 scale(pr)·unclip 상태로 복구되어야 하므로 save/restore 로 감싼다.
   *
   * series 별 레이어를 full redraw 와 *동일한 그리기 순서*(seriesReverse 면 [..., series1] 로 마지막이
   * 위)로 겹쳐 합성한다 → 겹친 픽셀에서 위에 오는 series 가 full 과 일치(z-order 동등, seam 색줄 제거).
   * @param {number} pointSize                clip 확장에 쓸 pointSize(multi-series 면 visible MAX)
   * @returns {undefined}
   */
  compositePointsLayer(pointSize) {
    const pr = this.pixelRatio;
    const cr = this.chartRect;
    const lo = this.labelOffset;
    const xArea = cr.chartWidth - (lo.left + lo.right);
    const yArea = cr.chartHeight - (lo.top + lo.bottom);

    const xsp = cr.x1 + lo.left;
    const plotBottom = cr.y2 - lo.bottom;
    const plotTop = plotBottom - yArea;
    const plotRight = xsp + xArea;

    const clipLeft = (xsp - pointSize) * pr;
    const clipTop = (plotTop - pointSize) * pr;
    // 우측 경계는 정수 device px 로 올림 정렬하고 carry bump 만큼 넉넉히 넓힌다. realtime 점은
    // startPoint 에 carry(rtXOffsetCss, |·|<1)가 더해져 graphMax 경계 마커 중심이 ceil(plotRight+carry)
    // = 최대 ceil(plotRight)+1 까지, 반경 pointSize 만큼 더 우측을 칠한다. full redraw 는 clip 이 없어
    // 그 픽셀을 온전히 그리므로, clip 이 소수 경계에서 그 컬럼을 반쪽(AA 반감)으로 자르면 blit≠full
    // 이 된다. ceil + (pointSize+2) 로 정수 정렬·충분 마진을 줘 경계 마커를 온전히 합성한다(우측엔
    // 신규 점만 있어 over-clip 마진이 노출하는 stale 픽셀이 없다).
    const clipRight = (Math.ceil(plotRight) + pointSize + 2) * pr;
    const clipBottom = (plotBottom + pointSize) * pr;

    // full(drawSeriesLayer)의 scatter 그리기 순서와 동일하게: seriesReverse 면 show 목록을 뒤집어
    // 마지막에 그린 series 가 위에 오게 한다. 합성도 같은 순서로 겹쳐 z-order 를 일치시킨다.
    const scatterList = this.getBlitScatterSeriesList();
    const reverse = !!this.options.seriesReverse;

    this.bufferCtx.save();
    this.bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.bufferCtx.beginPath();
    this.bufferCtx.rect(clipLeft, clipTop, clipRight - clipLeft, clipBottom - clipTop);
    this.bufferCtx.clip();
    for (let i = 0; i < scatterList.length; i++) {
      const entry = reverse ? scatterList[scatterList.length - 1 - i] : scatterList[i];
      const layer = this.pointsLayers.get(entry.sId);
      if (layer) {
        this.bufferCtx.drawImage(layer.cur === 'A' ? layer.a : layer.b, 0, 0);
      }
    }
    this.bufferCtx.restore();
  },

  /**
   * points layer 가 그려야 할 현재 상태의 스탬프. 레이어 픽셀을 결정하는 모든 입력 —
   * 데이터 틱 seq·축 매핑(graphMin/Max)·plot 기하·디바이스 — 을 문자열로 직렬화한다.
   * (옵션 객체는 참조 비교가 정확해 별도 필드(_pointsLayerOptionsRef)로 본다.)
   * @returns {string | null}  realtime scatter 가 아니거나 산출 불가면 null
   */
  computePointsLayerStamp() {
    if (!this.options.realTimeScatter?.use) {
      return null;
    }
    const scatterList = this.getBlitScatterSeriesList();
    if (!scatterList.length || !this.chartRect || !this.labelOffset || !this.axesSteps) {
      return null;
    }
    const cr = this.chartRect;
    const lo = this.labelOffset;
    const parts = [
      this.pixelRatio,
      this.bufferCanvas?.width,
      this.bufferCanvas?.height,
      cr.chartWidth,
      cr.chartHeight,
      cr.x1,
      cr.y2,
      lo.left,
      lo.right,
      lo.top,
      lo.bottom,
    ];
    for (let i = 0; i < scatterList.length; i++) {
      const { sId, xi, yi } = scatterList[i];
      const t = this.dataSet?.[sId]?.lastTick;
      const sx = this.axesSteps.x?.[xi];
      const sy = this.axesSteps.y?.[yi];
      if (!sx || !sy) {
        return null;
      }
      parts.push(
        sId,
        t ? `${t.seq}/${t.toTime}/${t.endIndex}/${t.length}` : 'nt',
        sx.graphMin,
        sx.graphMax,
        sy.graphMin,
        sy.graphMax,
      );
    }
    return parts.join('|');
  },

  /**
   * full 폴백 렌더에서 점 레이어 baseline 을 필요할 때만 재구성한다.
   * 스탬프(데이터 seq·매핑·기하)와 옵션 참조가 레이어 구축 시점과 동일하면 — 즉 legend hover,
   * selection 등 데이터 불변 hitInfo 렌더 — 전체 점 재raster 를 생략한다(폴백 비용 ≈ 기존 full).
   * @param {boolean} [force=false]  스탬프가 같아도 재구성(주기 강제 full 의 drift 리셋용)
   * @returns {boolean}  레이어를 실제로 재구성했으면 true
   */
  maybeRebuildPointsLayer(force = false) {
    if (!this.options.realTimeScatter?.use) {
      return false;
    }
    const stamp = this.computePointsLayerStamp();
    if (
      !force &&
      stamp &&
      this.pointsLayerValid &&
      this._pointsLayerStamp === stamp &&
      this._pointsLayerOptionsRef === this.options
    ) {
      return false; // 레이어가 현재 상태와 일치 — 재구성 불필요
    }
    this.rebuildPointsLayer();
    this._pointsLayerStamp = this.pointsLayerValid ? stamp : null;
    this._pointsLayerOptionsRef = this.pointsLayerValid ? this.options : null;
    return this.pointsLayerValid;
  },

  /**
   * 폴백 full 렌더를 "layer 에 1회 raster + buffer 합성"으로 처리할 수 있는지 판정한다.
   * 점 외형이 기본 상태(= rebuildPointsLayer 가 그리는 baseline 과 동일)여야 한다:
   *  - hitInfo 렌더(legend hover 진입 등)는 점 외형/가시성이 달라 직접 그린다.
   *  - selection downplay 활성도 직접 그린다.
   *  - 보이는 series 가 전부 scatter 여야 drawSeries 생략이 안전하다(combo 차트 방어).
   * legendHover 상태 자체는 무방 — hitInfo 없는 렌더(hover 중 데이터 틱)는 기본 외형으로 그린다.
   * @param {any} hitInfo
   * @returns {boolean}
   */
  canRouteFallbackViaLayer(hitInfo) {
    const opt = this.options;
    if (!opt.realTimeScatter?.use || hitInfo) {
      return false;
    }
    if (
      (opt.selectItem?.use &&
        (this.defaultSelectItemInfo?.dataIndex != null || this.lastHitInfo?.dataIndex != null)) ||
      (opt.selectSeries?.use && this.defaultSelectInfo)
    ) {
      return false;
    }
    if (!this.pointsLayersSized()) {
      return false;
    }
    // 보이는 비-scatter series 가 있으면 drawSeries 를 건너뛸 수 없다(combo 차트 누락 방지).
    if (!this.hasOnlyVisibleScatter()) {
      return false;
    }
    return this.getBlitScatterSeriesList().length > 0;
  },

  /**
   * blit 틱으로 어긋난 hit-test 좌표(item.xp/yp)를 현재 축 매핑으로 재계산한다.
   * raster 없이 calcItem 산술만 수행하므로 점 수 대비 비용이 작고, blit 틱당 최대 1회
   * (hover 가 없으면 0회)만 호출된다 — findHitItem/findSelectedItems 진입부에서 호출.
   * 참고: dedupe 로 그려지지 않는 중복 좌표 점도 좌표를 갖게 되지만, owner 와 동일 px 위치라
   * 시각·위치 차이는 없다(드문 정확-중복 시 tooltip series 표기만 달라질 수 있음).
   * @returns {undefined}
   */
  ensureHitCoordsFresh() {
    if (!this._hitCoordsDirty || !this.options.realTimeScatter?.use) {
      return;
    }
    if (!this.chartRect || !this.labelOffset || !this.axesSteps) {
      return; // 기하 미확정 — dirty 유지(다음 기회에 재시도)
    }
    const scatterList = this.getBlitScatterSeriesList();
    const param = {
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      displayOverflow: this.options.displayOverflow,
      // hit-test 좌표도 그려진 위치와 동일 위상으로 — tooltip/select 가 화면 점과 일치하게.
      rtXOffsetCss: this._blitCarry,
    };
    for (let i = 0; i < scatterList.length; i++) {
      scatterList[i].series.refreshRtHitCoords?.(param);
    }
    this._hitCoordsDirty = false;
  },

  /**
   * 보이는 scatter series 의 최대 pointSize(합성 clip 확장용).
   * @returns {number}
   */
  getMaxVisibleScatterPointSize() {
    const scatterList = this.getBlitScatterSeriesList();
    let max = 0;
    for (let i = 0; i < scatterList.length; i++) {
      const ps = scatterList[i].series.pointSize;
      const v = typeof ps === 'number' ? ps : (ps?.value ?? 0);
      if (v > max) {
        max = v;
      }
    }
    return max;
  },

  /**
   * 점 레이어를 현재 점 그림으로 재구성한다(다음 fast-path 의 baseline).
   * buffer 에는 grid 가 섞여 있으므로 buffer 를 복사하지 않고 점을 레이어에 직접 다시 그린다.
   * @returns {undefined}
   */
  rebuildPointsLayer() {
    if (!this.options.realTimeScatter?.use || !this.pointsLayersSized()) {
      this.pointsLayerValid = false;
      return;
    }
    const scatterList = this.getBlitScatterSeriesList();
    if (!scatterList.length) {
      this.pointsLayerValid = false;
      return;
    }

    const pr = this.pixelRatio;
    // series 별 레이어에 자기 점만 그린다 — cross-series dedupe 불필요(z-order 는 합성 순서가 담당).
    // 각 series 의 현재 유효 라스터(cur)에 직접 다시 그려 다음 fast-path 의 baseline 을 세운다.
    for (let i = 0; i < scatterList.length; i++) {
      const entry = scatterList[i];
      const layer = this.pointsLayers.get(entry.sId);
      if (!layer) {
        this.pointsLayerValid = false;
        return;
      }
      const canvas = layer.cur === 'A' ? layer.a : layer.b;
      const layerCtx = layer.cur === 'A' ? layer.actx : layer.bctx;
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
      layerCtx.clearRect(0, 0, canvas.width, canvas.height);
      layerCtx.setTransform(pr, 0, 0, pr, 0, 0);

      const baseParam = {
        ctx: layerCtx,
        chartRect: this.chartRect,
        labelOffset: this.labelOffset,
        axesSteps: this.axesSteps,
        displayOverflow: this.options.displayOverflow,
        duple: null,
        coordinateDedupe: false,
        selectInfo: null,
        legendHitInfo: null,
        unSelectedOpacity: this.options.unSelectedOpacity,
        // baseline 도 현재 carry 위상으로 그린다 — 직전 blit 프레임과 위치 연속(REFRESH rebuild 무-스냅).
        rtXOffsetCss: this._blitCarry,
      };

      // 기하 패스를 먼저 돌려 item.xp/yp 를 채운다 — realTimeScatterDraw 는 좌표를 읽기만 하므로
      // element.draw() 를 거치지 않는 이 직접 호출 경로에선 computeGeometry 를 명시 호출해야 한다.
      entry.series.computeGeometry(baseParam);
      entry.series.realTimeScatterDraw(baseParam);
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.pointsLayerValid = true;
  },
};

export default blit;
