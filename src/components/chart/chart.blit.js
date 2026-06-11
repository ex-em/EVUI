import Util from './helpers/helpers.util';

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
    // 점 라스터 전용 오프스크린 레이어(ping-pong 2장). 공유 setWidth/setHeight 가 매 렌더 clear 하는
    // bufferCanvas 와 달리, 치수가 실제로 바뀔 때만 재할당해 프레임 간 픽셀을 보존한다.
    this.pointsLayerA = null;
    this.pointsLayerB = null;
    this.pointsLayerACtx = null;
    this.pointsLayerBCtx = null;
    this.curPointsLayer = 'A'; // 현재 유효 점 라스터를 담은 레이어
    this.pointsLayerValid = false; // full redraw 로 baseline 이 세워졌는가
    this._blitCarry = 0; // 정수 px 시프트 후 남는 소수부 누산(장기 drift 방지)
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
   * 점 라스터 전용 ping-pong 레이어 2장을 생성한다(미부착 오프스크린 canvas). 치수는 setWidth/
   * setHeight 가 device px 로 맞춘다. realTimeScatter.use 일 때만 의미가 있다.
   * @returns {undefined}
   */
  createPointsLayers() {
    if (this.pointsLayerA) {
      return;
    }
    this.pointsLayerA = document.createElement('canvas');
    this.pointsLayerB = document.createElement('canvas');
    this.pointsLayerACtx = this.pointsLayerA.getContext('2d');
    this.pointsLayerBCtx = this.pointsLayerB.getContext('2d');
    this.curPointsLayer = 'A';
    this.pointsLayerValid = false;
  },

  /**
   * 현재 유효 점 라스터를 담은 레이어(canvas+ctx) 와 반대편(쓰기 대상) 레이어를 반환한다.
   * @returns {{ src: HTMLCanvasElement, srcCtx: CanvasRenderingContext2D,
   *            dst: HTMLCanvasElement, dstCtx: CanvasRenderingContext2D, dstName: string }}
   */
  getPointsLayers() {
    const isA = this.curPointsLayer === 'A';
    return {
      src: isA ? this.pointsLayerA : this.pointsLayerB,
      srcCtx: isA ? this.pointsLayerACtx : this.pointsLayerBCtx,
      dst: isA ? this.pointsLayerB : this.pointsLayerA,
      dstCtx: isA ? this.pointsLayerBCtx : this.pointsLayerACtx,
      dstName: isA ? 'B' : 'A',
    };
  },

  /**
   * 점 레이어가 현재 device 치수로 할당되어 있는지 확인한다.
   * @returns {boolean}
   */
  pointsLayersSized() {
    if (!this.pointsLayerA || !this.bufferCanvas) {
      return false;
    }
    return (
      this.pointsLayerA.width === this.bufferCanvas.width &&
      this.pointsLayerA.height === this.bufferCanvas.height &&
      this.pointsLayerA.width > 1 &&
      this.pointsLayerA.height > 1
    );
  },

  /**
   * blit fast-path 전용 strip-local owner 맵. dirtyBuckets(신규 strip) 버킷의 점만 순회해 duple 을 채운다.
   * 같은 좌표(=같은 ms=같은 버킷)는 strip 안에서 owner 가 닫히므로 전체 dedupe 없이 strip 만으로 정확하다.
   * 순서/owner 규칙은 collectDuplicatePoints(realtime 경로)와 동일하게 맞춰 full redraw 와 픽셀이 일치한다
   * (seriesReverse 면 역순 순회 → 마지막 set 이 owner).
   * @param {Map<string,string>} duple              owner 맵(coordKey → sId)
   * @param {number[]} dirtyBuckets                  strip 으로 다시 그릴 ring 버킷 인덱스 목록
   * @returns {undefined}
   */
  collectStripDuplicatePoints(duple, dirtyBuckets) {
    const scatterIds = this.seriesInfo?.charts?.scatter ?? [];
    const isReverseOrder = !!this.options.seriesReverse;
    for (
      let jx = isReverseOrder ? scatterIds.length - 1 : 0;
      isReverseOrder ? jx >= 0 : jx < scatterIds.length;
      isReverseOrder ? jx-- : jx++
    ) {
      const series = this.seriesList[scatterIds[jx]];
      if (!series?.show) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const dataGroup = series.data[series.sId]?.dataGroup;
      if (!dataGroup) {
        // eslint-disable-next-line no-continue
        continue;
      }
      for (let b = 0; b < dirtyBuckets.length; b++) {
        const group = dataGroup[dirtyBuckets[b]];
        if (!group?.data) {
          // eslint-disable-next-line no-continue
          continue;
        }
        for (let j = 0; j < group.data.length; j++) {
          const item = group.data[j];
          duple.set(item.k ?? Util.coordinateKey(item.x, item.y), series.sId);
        }
      }
    }
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
    // 시프트는 정수 px 로만 하고 소수부는 carry 에 누산해 장기 drift 를 막는다.
    const dxCss = (xArea / wMs) * gate.shiftMs;
    const dxDev = dxCss * pr;
    const dxTotal = dxDev + this._blitCarry;
    const dxInt = Math.floor(dxTotal);
    if (dxInt < 1) {
      return false; // sub-pixel 이동 → full redraw 가 안전(아주 넓은 윈도우 등 드문 경우)
    }

    // 신규 점이 우측 strip 보다 오래된 버킷에 떨어졌으면(지연/역순 데이터) strip-only 로는 누락 →
    // full redraw 로 폴백한다. strip 은 endIndex 부터 gapCount+1 버킷(age 0..gapCount+1)을 덮는다.
    // multi-series: visible series 중 maxDirtyAge 최댓값으로 판정(하나라도 strip 밖이면 full).
    // 동시에 seam pad·합성 clip 에 쓸 pointSize 최댓값을 구한다.
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

    // 모든 가드 통과 → 이번 시프트를 확정하고 잔차를 적립([0,1)).
    this._blitCarry = dxTotal - dxInt;

    const { src, dst, dstCtx, dstName } = this.getPointsLayers();

    // 1) shift: src[dxInt..W] → dst[0..W-dxInt] (device px, identity transform)
    dstCtx.setTransform(1, 0, 0, 1, 0, 0);
    dstCtx.clearRect(0, 0, wDev, hDev);
    dstCtx.drawImage(src, dxInt, 0, wDev - dxInt, hDev, 0, 0, wDev - dxInt, hDev);

    // 2) 신규 strip clear + redraw
    //
    // 경계 불변식: "지운 픽셀 영역에 그릴 수 있는 모든 점은 반드시 redraw 대상(dirty 버킷)이어야 한다."
    // 점 좌표는 매 프레임 ceil 로 재양자화되어 ±1px 움직일 수 있으므로, 경계가 버킷 내용을 관통하면
    // 경계 왼쪽으로 이동한 점이 clip 에 걸려 "지웠는데 다시 안 그려지는" 결손 컬럼이 매 틱 쌓인다
    // (누적 라스터에 세로 줄무늬로 노출). 이를 막기 위해 경계를 가장 오래된 dirty 버킷의 좌단에서
    // 안쪽(inset)으로 둔다 — 경계 오른쪽에 마커가 닿을 수 있는 점은 전부 dirty 버킷 소속이 되어
    // 완전 redraw 가 보장된다.
    const padDev = Math.ceil(maxPointSize * pr) + 1; // seam 마진(마커 반경 + AA, MAX pointSize)
    const plotRightDev = (cr.x1 + lo.left + xArea) * pr;
    const pxPerSecDev = (xArea / wMs) * 1000 * pr; // 1초 버킷의 device px 폭

    const { gapCount, endIndex, length } = lastTick;
    // 경계 안쪽 마진: 버킷 좌단 시각의 점이 경계 너머로 칠할 수 있는 최대 도달 거리.
    // ceil 라운딩(+1) + aliasPixel(+1) + 마커 반경(pointSize) + stroke/AA(+2) — 보수적으로 잡는다.
    const insetDev = padDev + Math.ceil(4 * pr);
    // 버킷 px 폭이 좁으면 dirty 버킷을 자동 확장해 경계 조건을 만족시킨다:
    // extra·pxPerSec ≥ inset + pad + 2 (좌측 완전성 마진 + 우측 신규 strip 커버 마진).
    const extraBuckets = Math.max(
      2,
      Math.ceil((insetDev + padDev + 2) / Math.max(1e-6, pxPerSecDev)),
    );
    const dirtyCount = Math.min(length, gapCount + extraBuckets);
    // clear/clip 경계는 정수 device px — 소수 경계 반복 clear 는 경계 픽셀 알파를 매 틱 감쇠시킨다.
    const oldestLeftDev = plotRightDev - dirtyCount * pxPerSecDev;
    const clearLeftDev = Math.max(0, Math.floor(oldestLeftDev + insetDev));
    dstCtx.clearRect(clearLeftDev, 0, wDev - clearLeftDev, hDev);

    const dirtyBuckets = new Array(dirtyCount);
    for (let k = 0; k < dirtyCount; k++) {
      let idx = (endIndex - k) % length;
      if (idx < 0) {
        idx += length;
      }
      dirtyBuckets[k] = idx;
    }

    // multi-series: strip-local owner 맵으로 cross-series dedupe(full redraw 와 픽셀 일치).
    // 단일 series 면 duple=null → realTimeScatterDrawStrip 이 전부 그린다.
    // 판정 술어는 full 경로(drawSeries·rebuildPointsLayer)와 동일해야 한다: coordinateDedupe
    // opt-out(#2011) 존중 + 2개 이상일 때만. series 개수만으로 판정하면 opt-out 시 픽셀이 어긋난다.
    const dedupeOn = this.options.coordinateDedupe !== false && scatterList.length > 1;
    const duple = dedupeOn ? new Map() : null;
    if (dedupeOn) {
      this.collectStripDuplicatePoints(duple, dirtyBuckets);
    }

    const param = {
      chartRect: cr,
      labelOffset: lo,
      axesSteps: this.axesSteps,
      displayOverflow: this.options.displayOverflow,
      selectInfo: null,
      legendHitInfo: null,
      unSelectedOpacity: this.options.unSelectedOpacity,
      duple,
      coordinateDedupe: dedupeOn,
    };

    // 3) 신규 strip redraw: 모든 visible series 를 drawSeries 와 동일 순서(seriesReverse 면 역순)로 그린다.
    // dirty 버킷(gapCount+2개)의 px 범위는 clear 폭(dxInt+pad)보다 넓다 — seam 버킷이 clear 경계
    // 왼쪽까지 걸친다. clip 없이 그리면 "안 지운 픽셀 위에 ±1px 재양자화된 점을 덧칠"하게 되어
    // 이미 쌓인 라스터 위로 다른 series 색이 새어 나오고(z-order 누적 오염), 윈도우가 흐르며 전 화면에
    // 퍼진다. clear 한 영역만 다시 그리도록 clip 으로 불변식을 강제한다(지운 곳 = 그리는 곳).
    dstCtx.save();
    dstCtx.beginPath();
    dstCtx.rect(clearLeftDev, 0, wDev - clearLeftDev, hDev);
    dstCtx.clip();
    dstCtx.setTransform(pr, 0, 0, pr, 0, 0);
    const reverse = !!this.options.seriesReverse;
    for (let i = 0; i < scatterList.length; i++) {
      const entry = reverse ? scatterList[scatterList.length - 1 - i] : scatterList[i];
      entry.series.realTimeScatterDrawStrip(dstCtx, dirtyBuckets, param);
    }
    dstCtx.restore();
    dstCtx.setTransform(1, 0, 0, 1, 0, 0);

    // 4) ping-pong swap → dst 가 현재 유효 레이어
    this.curPointsLayer = dstName;

    // 5) mousemove(findGraphData)용 전체 카운트 갱신(모든 series, 점 수 무관 O(버킷))
    for (let i = 0; i < scatterList.length; i++) {
      scatterList[i].series.refreshRtTotalCount();
    }

    // 6) buffer 재구성: 축 새로 그리고 점 레이어를 plot 영역에 합성(clip 확장 = MAX pointSize)
    this.drawAxis(hitInfo);
    this.compositePointsLayer(dst, maxPointSize);

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
   * @param {HTMLCanvasElement} layerCanvas   합성할 점 레이어 canvas
   * @param {number} pointSize                clip 확장에 쓸 pointSize(multi-series 면 visible MAX)
   * @returns {undefined}
   */
  compositePointsLayer(layerCanvas, pointSize) {
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
    const clipRight = (plotRight + pointSize) * pr;
    const clipBottom = (plotBottom + pointSize) * pr;

    this.bufferCtx.save();
    this.bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.bufferCtx.beginPath();
    this.bufferCtx.rect(clipLeft, clipTop, clipRight - clipLeft, clipBottom - clipTop);
    this.bufferCtx.clip();
    this.bufferCtx.drawImage(layerCanvas, 0, 0);
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
    const isA = this.curPointsLayer === 'A';
    const layer = isA ? this.pointsLayerA : this.pointsLayerB;
    const layerCtx = isA ? this.pointsLayerACtx : this.pointsLayerBCtx;

    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.clearRect(0, 0, layer.width, layer.height);
    layerCtx.setTransform(pr, 0, 0, pr, 0, 0);

    // drawSeries 의 scatter 경로와 동일 출력: multi-series 면 owner-dedupe(전체 duple), 단일이면 전부 그림.
    const scatterIds = this.seriesInfo?.charts?.scatter ?? [];
    const dedupeOn =
      this.options.coordinateDedupe !== false && !this.canSkipRealtimeScatterDedupe(scatterIds);
    const duple = new Map();
    if (dedupeOn) {
      this.collectDuplicatePoints(duple, scatterIds);
    }

    const baseParam = {
      ctx: layerCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      displayOverflow: this.options.displayOverflow,
      duple,
      coordinateDedupe: dedupeOn,
      selectInfo: null,
      legendHitInfo: null,
      unSelectedOpacity: this.options.unSelectedOpacity,
    };

    // seriesReverse 면 역순으로 그려 owner(마지막 set)가 위에 오도록 drawSeries 와 z-order 일치.
    const reverse = !!this.options.seriesReverse;
    for (let i = 0; i < scatterList.length; i++) {
      const entry = reverse ? scatterList[scatterList.length - 1 - i] : scatterList[i];
      entry.series.realTimeScatterDraw(baseParam);
    }

    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.pointsLayerValid = true;
  },
};

export default blit;
