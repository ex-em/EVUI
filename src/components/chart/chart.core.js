import { mobileCheck, truthyNumber } from '@/common/utils';
import Util, { calcExtraWidthLabel } from './helpers/helpers.util';
import Model from './model';
import TimeScale from './scale/scale.time';
import LinearScale from './scale/scale.linear';
import LogarithmicScale from './scale/scale.logarithmic';
import StepScale from './scale/scale.step';
import TimeCategoryScale from './scale/scale.time.category';
import Title from './plugins/plugins.title';
import Legend from './plugins/plugins.legend';
import GradientLegend from './plugins/plugins.legend.gradient';
import Scrollbar from './plugins/plugins.scrollbar';
import Interaction from './plugins/plugins.interaction';
import Tooltip from './plugins/plugins.tooltip';
import TooltipVirtualScroll from './plugins/plugins.tooltip.virtualScroll';
import Pie from './plugins/plugins.pie';
import Tip from './element/element.tip';

// realtime scatter blit: 시프트 누적으로 생기는 sub-pixel 오차를 주기적으로 리셋하기 위해,
// 이 프레임 수마다 게이트 통과 여부와 무관하게 full redraw 로 돌아가 픽셀을 절대 좌표와 일치시킨다.
const BLIT_REFRESH_INTERVAL = 300;

class EvChart {
  constructor(
    target,
    data,
    options,
    listeners,
    defaultSelectItemInfo,
    defaultSelectInfo,
    brushSeries,
  ) {
    Object.keys(Model).forEach((key) => Object.assign(this, Model[key]));

    if (!options.brush) {
      Object.assign(this, Tooltip);
      Object.assign(this, TooltipVirtualScroll);
      Object.assign(this, Interaction);
      Object.assign(this, Tip);
      Object.assign(this, Legend);
      Object.assign(this, Pie);
      Object.assign(this, Title);
      Object.assign(this, Scrollbar);
    }

    if (options.type === 'heatMap' && options.legend.type === 'gradient') {
      Object.assign(this, GradientLegend);
    }

    this.isMobile = mobileCheck();
    this.brushSeries = brushSeries;
    this.target = target;
    this.data = data;
    this.options = options;
    this.listeners = listeners;

    this.wrapperDOM = document.createElement('div');
    this.wrapperDOM.className = options.brush ? 'ev-chart-brush-wrapper' : 'ev-chart-wrapper';
    this.chartDOM = document.createElement('div');
    this.chartDOM.className = options.brush ? 'ev-chart-brush-container' : 'ev-chart-container';
    this.wrapperDOM.appendChild(this.chartDOM);
    this.target.appendChild(this.wrapperDOM);

    const isPie = options.type === 'pie';
    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.setAttribute('style', 'display: block;');
    this.displayCtx = this.displayCanvas.getContext('2d', { willReadFrequently: isPie });
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.setAttribute('style', 'display: block;');
    this.bufferCtx = this.bufferCanvas.getContext('2d', { willReadFrequently: isPie });

    this.pixelRatio = window.devicePixelRatio || 1;
    this.oldPixelRatio = this.pixelRatio;

    this.chartDOM.appendChild(this.displayCanvas);

    if (!options.brush) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.setAttribute('style', 'display: block; z-index: 2;');
      this.overlayCanvas.setAttribute('class', 'overlay-canvas');
      this.overlayCtx = this.overlayCanvas.getContext('2d', { willReadFrequently: isPie });

      this.chartDOM.appendChild(this.overlayCanvas);

      this.overlayCanvas.style.position = 'absolute';
      this.overlayCanvas.style.top = '0px';
      this.overlayCanvas.style.left = '0px';
    }

    this.isInitLegend = false;
    this.isInitTitle = false;
    this.isInit = false;
    this.scrollbar = {
      x: { isInit: false },
      y: { isInit: false },
    };
    this.seriesList = {};
    this.lastTip = { pos: null, value: null };
    this.seriesInfo = {
      charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] },
      count: 0,
    };

    this.defaultSelectItemInfo = defaultSelectItemInfo;
    this.defaultSelectInfo = defaultSelectInfo;

    this.legendHover = null;

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

    if (options.realTimeScatter?.use) {
      this.createPointsLayers();
    }
  }

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
  }

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
  }

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
  }

  /**
   * Initialize chart object
   *
   * @returns {undefined}
   */
  init() {
    const { series, data, labels, groups } = this.data;
    const { type, axesX, axesY, tooltip, horizontal, realTimeScatter } = this.options;

    this.createSeriesSet(series, type, horizontal, groups);
    if (groups.length) {
      this.addGroupInfo(groups);
    }

    if (realTimeScatter?.use) {
      this.dataSet = {};
      this.createRealTimeScatterDataSet(data);
    } else {
      this.createDataSet(data, labels);
    }
    this.minMax = this.getStoreMinMax();

    this.initRect();

    this.axesX = this.createAxes('x', axesX);
    this.axesY = this.createAxes('y', axesY);

    if (axesX?.[0]?.scrollbar?.use || axesY?.[0]?.scrollbar?.use) {
      this.initScrollbar();
    }

    this.initDefaultSelectInfo();

    this.drawChart();

    if (tooltip.use && !this.isInitTooltip) {
      this.createTooltipDOM();
    }

    this.createEventFunctions?.();
    this.isInit = true;
  }

  _updateSeriesCount() {
    this.seriesInfo.count = Object.values(this.seriesList).filter((s) => s.show).length;
  }

  /**
   * Initialize chart rectangle
   *
   * @returns {undefined}
   */
  initRect() {
    const opt = this.options;
    if (opt.title.show) {
      if (!this.isInitTitle) {
        this.initTitle();
      }

      this.showTitle();
    }

    if (opt.legend.show && !opt.legend.external) {
      if (!this.isInitLegend) {
        this.initLegend();
      }

      this.setLegendPosition();
    } else if (opt.legend.show && opt.legend.external) {
      this._updateSeriesCount();
    }

    this.chartRect = this.getChartRect();
  }

  drawSyncedIndicator({ horizontal, label, mousePosition }) {
    this.drawSyncedIndicator({ horizontal, label, mousePosition });
  }

  adjustXAndYAxisWidth() {
    const getNotFormattedLabels = (axesSteps, axisType, axis) => {
      const {
        interval,
        graphMin,
        graphMax,
        steps = 0,
        minIndex,
        maxIndex,
        indexInterval,
      } = axesSteps ?? {};
      let result = [];

      // StepScale의 경우 실제로 표시될 모든 라벨들을 포함
      if (
        axis?.type === 'step' &&
        minIndex !== undefined &&
        maxIndex !== undefined &&
        indexInterval !== undefined
      ) {
        const { labels } = this.data;
        const axisLabels =
          axisType === 'x' ? (labels?.x ?? labels ?? []) : (labels?.y ?? labels ?? []);
        result = [];
        for (let i = minIndex; i <= maxIndex; i += indexInterval) {
          if (axisLabels[i] !== undefined) {
            result.push(axisLabels[i]);
          }
        }
      } else if (interval) {
        result = Array.from({ length: steps }, (_, i) => graphMin + i * interval);
        result.push(graphMax);
      } else {
        const { labels } = this.data;
        result = axisType === 'x' ? (labels?.x ?? labels ?? []) : (labels?.y ?? labels ?? []);
      }

      return result;
    };

    const adjustedRange = {
      x: this.axesRange?.x?.map((value, index) => {
        const axis = this.axesX[index];
        const axesSteps = this.axesSteps?.x[index];
        const notFormattedLabels = getNotFormattedLabels(axesSteps, 'x', axis);

        const fixWidth = truthyNumber(axis?.labelStyle?.fixWidth) ? axis.labelStyle.fixWidth : 0;

        // 숫자 라벨(linear)일 때만 적용하며, graphMin/graphMax 중 절댓값이 큰 쪽을 소수점 자리수+1로 포맷해
        // extraFormattedLabels로 전달해 렌더 너비를 측정한다.
        // 라벨의 소수점이 변경될때 너비 팽창을 사전에 반영한다.
        let extraFormattedLabels = [];
        const axesStepsX = this.axesSteps?.x[index];
        if (axis?.type === 'linear' && axesStepsX != null) {
          const { graphMin, graphMax } = axesStepsX;
          if (typeof graphMin === 'number' && typeof graphMax === 'number') {
            const widestNumeric = Math.abs(graphMin) >= Math.abs(graphMax) ? graphMin : graphMax;
            extraFormattedLabels = [calcExtraWidthLabel(widestNumeric)];
          }
        }
        const maxWidth =
          axis?.getLabelWidthHasMaxLength?.(
            notFormattedLabels,
            this.chartRect,
            extraFormattedLabels,
          ) ?? 0;

        return {
          ...value,
          size: {
            width: fixWidth || Math.max(maxWidth, value.size.width),
            height: value.size.height,
          },
        };
      }),
      y: this.axesRange?.y?.map((value, index) => {
        const axis = this.axesY[index];
        const axesSteps = this.axesSteps?.y[index];
        const notFormattedLabels = getNotFormattedLabels(axesSteps, 'y', axis);

        const fixWidth = truthyNumber(axis?.labelStyle?.fixWidth) ? axis.labelStyle.fixWidth : 0;
        const maxWidth = axis?.getLabelWidthHasMaxLength?.(notFormattedLabels, this.chartRect) ?? 0;

        return {
          ...value,
          size: {
            width: fixWidth || Math.max(maxWidth, value.size.width),
            height: value.size.height,
          },
        };
      }),
    };

    this.axesRange = adjustedRange;
    this.labelOffset = this.getLabelOffset(adjustedRange);
    this.labelRange = this.getAxesLabelRange();
    this.axesSteps = this.calculateSteps();
  }

  emitAxesScaleChange() {
    if (typeof this.listeners?.['axes-scale-change'] !== 'function') {
      return;
    }

    const prev = this._lastEmittedAxesRange;
    const curr = this.labelRange;

    const isSameAxis = (a, b) => a?.min === b?.min && a?.max === b?.max;

    const toPayloadAxis = ({ min, max }) => ({ minSteps: min, maxSteps: max });

    const xSame = curr.x.every((ax, i) => {
      const watch = !!this.options.axesX[i]?.scaleChange;
      return !watch || (!!prev && isSameAxis(ax, prev.x[i]));
    });

    const ySame = curr.y.every((ay, i) => {
      const watch = !!this.options.axesY[i]?.scaleChange;
      return !watch || (!!prev && isSameAxis(ay, prev.y[i]));
    });

    if (xSame && ySame) {
      return;
    }

    this._lastEmittedAxesRange = curr;

    const payload = {
      x: curr.x.map(toPayloadAxis),
      y: curr.y.map(toPayloadAxis),
    };
    this.listeners['axes-scale-change'](payload);
  }

  /**
   * show 된 series 의 실제 데이터 y 최대값을 외부로 올린다(realTimeScatter autoScale 등).
   * 차트 타입과 무관하게 동작하며, 소비처가 @axes-data-max-change 를 바인딩했을 때만 발생한다 —
   * 래퍼 리스너 자체가 구독 시에만 등록되므로(uses.js), 안 쓰는 차트는 집계 비용 0 이다.
   * 발생 시점엔 렌더마다(같은 값이어도) emit 한다 — 늦게 바인딩하는 소비처도 현재 최대값을 받게 하기 위함.
   * 비용은 EvChart 가 이미 계산해 둔 series.minMax.maxY 를 series 수만큼(점 수 아님) 읽는 게 전부라,
   * 소비처가 동일 데이터를 따로 스캔(O(N))해 max 를 구하지 않아도 된다.
   * maxY 는 show 된 전 series 의 통합 최대값(단일 y축·세로 차트 기준, 축 구분 없음)이다.
   *
   * @returns {undefined}
   */
  emitDataMaxChange() {
    const listener = this.listeners?.['axes-data-max-change'];
    if (typeof listener !== 'function') {
      return;
    }

    let maxY = -Infinity;
    Object.values(this.seriesList).forEach((series) => {
      if (!series?.show || !series.minMax) {
        return;
      }
      // minMax.maxY 가 유한수인 series 만 포함한다(0·음수 포함). 제외: show=false·minMax 미정의·
      // 비유한값(일반 차트의 빈 series 는 maxY=null, realtime scatter 는 전 series 무데이터 시 0 폴백).
      const m = series.minMax.maxY;
      if (Number.isFinite(m) && m > maxY) {
        maxY = m;
      }
    });

    listener(Number.isFinite(maxY) ? maxY : null);
  }

  /**
   * To draw canvas chart, it processes several sequential jobs
   * @param {any} [hitInfo=undefined]    from mousemove callback (object or object[] of undefined)
   *
   * @returns {undefined}
   */
  drawChart(hitInfo) {
    this.initScale();

    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.labelRange = this.getAxesLabelRange();

    if (this.scrollbar?.x?.use || this.scrollbar?.y?.use) {
      this.updateScrollbarPosition();
    }

    this.axesSteps = this.calculateSteps();

    this.adjustXAndYAxisWidth();

    this.emitAxesScaleChange();
    this.emitDataMaxChange();

    this.drawAxisAndSeries(hitInfo);

    this.drawTip();

    if (this.bufferCanvas && this.bufferCanvas?.width > 1 && this.bufferCanvas?.height > 1) {
      this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
    }

    // 다음 틱 게이트 비교용 스냅샷 (full/fast 어느 경로든 갱신).
    this._blitPrev = this.snapshotBlitState();
  }

  /**
   * 축과 series 를 buffer 에 그린다.
   *
   * realtime scatter 가 조건을 만족하면 이전 프레임 라스터를 재활용하는 blit fast-path 로,
   * 아니면 기존 full redraw 로 그린다. 어느 경로를 타든 화면 출력은 동일하다.
   * @param {any} hitInfo  click/hover 정보(있으면 blit 대신 full redraw)
   * @returns {undefined}
   */
  drawAxisAndSeries(hitInfo) {
    // realtime scatter blit fast-path 진입 가능 여부 평가.
    const blitGate = this.evaluateBlitGate(hitInfo);

    const forceOff = typeof window !== 'undefined' && window.__EVUI_BLIT_FORCE_OFF__ === true;
    // 디버그 override 는 0(매 틱 강제 full)도 유효값이므로 ||(falsy 무시) 대신 Number.isFinite 로 본다.
    const overrideInterval =
      typeof window !== 'undefined' ? window.__EVUI_BLIT_REFRESH_INTERVAL__ : undefined;
    const refreshInterval = Number.isFinite(overrideInterval)
      ? overrideInterval
      : this._blitRefreshInterval || BLIT_REFRESH_INTERVAL;
    const wantBlit =
      blitGate.ok &&
      !forceOff &&
      this.pointsLayerValid &&
      this.pointsLayersSized() &&
      this._framesSinceFullRedraw < refreshInterval;

    // 게이트 외 차단 사유(레이어 유효성/치수/주기 refresh)도 diag 에 집계한다 — 게이트는
    // 통과했는데 blit 이 안 도는 경우의 원인을 구분하기 위함.
    const blitBlockers = {
      blockedByForceOff: forceOff,
      blockedByLayerInvalid: !this.pointsLayerValid,
      blockedByLayerUnsized: !this.pointsLayersSized(),
      blockedByRefreshDue: this._framesSinceFullRedraw >= refreshInterval,
    };

    let didBlit = false;
    if (wantBlit) {
      didBlit = this.drawChartBlitFastPath(hitInfo, blitGate);
    }

    this.recordBlitDiag(blitGate, didBlit, blitBlockers);

    if (didBlit) {
      this._framesSinceFullRedraw++;
      // blit 도 레이어 내용을 현재 상태로 전진시킨다 — 스탬프를 갱신해야 직후의 데이터 불변
      // 폴백 렌더(legend hover 등)가 불필요한 rebuild 를 건너뛸 수 있다.
      this._pointsLayerStamp = this.computePointsLayerStamp();
      this._pointsLayerOptionsRef = this.options;
      // strip 밖 점들의 item.xp/yp 는 이번 시프트를 반영하지 못했다 — hit-test 진입 시 지연 재계산.
      this._hitCoordsDirty = true;
    } else {
      // full redraw 폴백. 점 외형이 기본 상태인 렌더(데이터 틱, hover 해제 등)는 scatter 점을
      // pointsLayer 에 1회만 raster 하고 buffer 에는 합성만 한다 — buffer 와 layer 에 같은 점을
      // 두 번 그리는 비용을 제거. legend hover 처럼 점 외형이 달라지는 렌더만 buffer 에 직접
      // 그리고, 그 경우에도 데이터가 그대로면(스탬프 불변) 레이어 재구성은 생략한다.
      this.drawAxis(hitInfo);
      let rebuilt = false;
      let coordsRefreshed = false;
      if (!forceOff && this.canRouteFallbackViaLayer(hitInfo)) {
        // 주기 강제 full(refreshDue)은 drift 리셋이 목적이므로 스탬프가 같아도 재raster 강제.
        rebuilt = this.maybeRebuildPointsLayer(blitBlockers.blockedByRefreshDue);
        if (this.pointsLayerValid) {
          this.compositePointsLayer(
            this.getPointsLayers().src,
            this.getMaxVisibleScatterPointSize(),
          );
        } else {
          this.drawSeries(hitInfo); // 레이어 사용 불가(치수 미확보 등) → 기존 직접 경로
          coordsRefreshed = true;
        }
      } else {
        this.drawSeries(hitInfo);
        rebuilt = this.maybeRebuildPointsLayer(false);
        // legend hover 렌더(hitInfo.legend)는 호버 series 만 calcItem 을 타므로 전체 좌표
        // 갱신이 아니다 — 그 외 직접 drawSeries 는 보이는 점 전체의 xp/yp 를 갱신한다.
        coordsRefreshed = !hitInfo?.legend;
      }
      if (rebuilt || coordsRefreshed) {
        // rebuild(전 series realTimeScatterDraw) 또는 전체 drawSeries 가 좌표를 새로 썼다.
        this._hitCoordsDirty = false;
      }
      if (rebuilt) {
        // baseline 이 실제로 재구성된 경우에만 drift 카운터를 리셋한다. 레이어를 보존한 폴백
        // 렌더(rebuild 생략)는 레이어의 누적 상태도 그대로이므로 카운터를 유지해야
        // 주기적 강제 full(REFRESH_INTERVAL)의 drift 상한이 깨지지 않는다.
        this._framesSinceFullRedraw = 0;
        this._blitCarry = 0;
      }
    }
  }

  /**
   * Collect duplicate point keys for scatter overlap detection
   * @param {Map<string, string>} duple
   * @param {string[]} chartTypeSet
   *
   * @returns {undefined}
   */
  collectDuplicatePoints(duple, chartTypeSet) {
    const isReverseOrder = !!this.options.seriesReverse;
    for (
      let jx = isReverseOrder ? chartTypeSet.length - 1 : 0;
      isReverseOrder ? jx >= 0 : jx < chartTypeSet.length;
      isReverseOrder ? jx-- : jx++
    ) {
      const series = this.seriesList[chartTypeSet[jx]];
      const shouldInclude = !!series?.show;
      if (shouldInclude) {
        if (this.options.realTimeScatter?.use) {
          const seriesDatas = series.data[series.sId]?.dataGroup;
          for (let i = 0; i < seriesDatas.length; i++) {
            const dataItems = seriesDatas[i]?.data || [];
            for (let j = 0; j < dataItems.length; j++) {
              const item = dataItems[j];
              // item.k 는 push 단계(model.store)에서 1회 생성·캐시한 좌표 키.
              // 렌더마다 문자열을 재생성하지 않고 재사용한다(없으면 폴백).
              duple.set(item.k ?? Util.coordinateKey(item.x, item.y), series.sId);
            }
          }
        } else {
          const seriesDatas = this.data.data[chartTypeSet[jx]] ?? [];
          for (let i = 0; i < seriesDatas.length; i++) {
            const item = seriesDatas[i];
            duple.set(Util.coordinateKey(item.x, item.y), series.sId);
          }
        }
      }
    }
  }

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
  }

  /**
   * realtime scatter에서 "보이는" series가 1개뿐이면 cross-series dedupe가 무의미하다.
   * - push 단계(model.store)에서 series 내부 (x,y) 유일성이 이미 보장되고,
   * - realTimeScatterDraw 에는 intra-series drawnKeys 필터가 없어 duple 은 오직 owner 판정용이다.
   * 따라서 단일 series 면 duple 을 채우거나 조회하지 않고 전부 그려도 결과가 동일하다.
   * 정지(non-realtime) 모드는 push-dedupe 가 없어 duple+drawnKeys 에 의존하므로 스킵 대상이 아니다
   * (duple 이 비면 모든 점이 owner 판정에서 탈락해 아무것도 안 그려진다).
   * coordinateDedupe 옵션 자체는 호출부(drawSeries)에서 함께 판정한다.
   * @param {string[]} scatterSeriesIds   this.seriesInfo.charts.scatter
   *
   * @returns {boolean}
   */
  canSkipRealtimeScatterDedupe(scatterSeriesIds) {
    if (!this.options.realTimeScatter?.use) {
      return false;
    }
    let shownCount = 0;
    for (let i = 0; i < scatterSeriesIds.length; i++) {
      if (this.seriesList[scatterSeriesIds[i]]?.show) {
        shownCount++;
        if (shownCount > 1) {
          return false;
        }
      }
    }
    return shownCount === 1;
  }

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
  }

  /**
   * blit fast-path 대표 scatter series(첫 show 시리즈). 축 인덱스/스냅샷 기준으로 쓴다.
   * @returns {{ sId: string, series: object, xi: number, yi: number } | null}
   */
  getBlitScatterSeries() {
    return this.getBlitScatterSeriesList()[0] ?? null;
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  /**
   * Draw each series
   * @param {any} [hitInfo=undefined]   legend mouseover callback (object or undefined)
   *
   * @returns {undefined}
   */
  drawSeries(hitInfo) {
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
      overlayCtx: this.overlayCtx,
      isBrush: !!brush,
      displayOverflow,
      unSelectedOpacity,
      isHorizontal: this.options.horizontal,
    };

    let showIndex = 0;
    let showSeriesCount = 0;

    this.seriesInfo.charts.bar.forEach((series) => {
      if (this.seriesList[series].show) {
        showSeriesCount++;
      }
    });

    /**
     * new Map<`${x}${y}`, seriesID>
     */
    const duple = new Map();

    const chartKeys = Object.keys(this.seriesInfo.charts);

    for (let ix = 0; ix < chartKeys.length; ix++) {
      const chartType = chartKeys[ix];
      const chartTypeSet = this.seriesInfo.charts[chartType];

      // scatter 의 이번 렌더 유효 dedupe 여부.
      // 단일 realtime series 면 dedupe 가 무의미하므로 수집/조회를 건너뛴다(전부 그림).
      let scatterDedupe = false;
      if (chartType === 'scatter') {
        scatterDedupe =
          this.options.coordinateDedupe !== false &&
          !this.canSkipRealtimeScatterDedupe(chartTypeSet);
        if (scatterDedupe) {
          this.collectDuplicatePoints(duple, chartTypeSet);
        }
      }

      for (let jx = 0; jx < chartTypeSet.length; jx++) {
        let series = this.seriesList[chartTypeSet[jx]];

        switch (chartType) {
          case 'line': {
            const legendHitInfo = hitInfo?.legend;

            series.draw({
              legendHitInfo,
              ...opt,
            });
            break;
          }
          case 'heatMap': {
            const legendHitInfo = hitInfo?.legend;

            series.draw({
              legendHitInfo,
              ...opt,
            });
            break;
          }
          case 'bar': {
            const legendHitInfo = hitInfo?.legend;
            const { thickness, cPadRatio, borderRadius } = this.options;

            series.draw({
              thickness,
              cPadRatio,
              borderRadius,
              showSeriesCount,
              showIndex,
              legendHitInfo,
              ...opt,
            });

            if (series.show) {
              showIndex++;
            }
            break;
          }
          case 'pie': {
            const selectInfo = this.lastHitInfo ?? { sId: this.defaultSelectItemInfo?.seriesID };
            const legendHitInfo = hitInfo?.legend;

            if (this.options.sunburst) {
              this.drawSunburst({
                selectInfo,
                legendHitInfo,
                unSelectedOpacity: opt.unSelectedOpacity,
              });
            } else {
              this.drawPie({
                selectInfo,
                legendHitInfo,
                unSelectedOpacity: opt.unSelectedOpacity,
              });
            }

            if (this.options.doughnutHoleSize > 0) {
              this.drawDoughnutHole();
            }
            break;
          }
          case 'scatter': {
            const legendHitInfo = hitInfo?.legend;

            let selectInfo;
            if (selectItem.use && selectItem.useSeriesOpacity) {
              const lastHitInfo = this.lastHitInfo;
              const defaultSelectInfo = this.defaultSelectItemInfo;

              if (lastHitInfo?.dataIndex || lastHitInfo?.dataIndex === 0) {
                selectInfo = {
                  seriesID: lastHitInfo.sId,
                  dataIndex: lastHitInfo.dataIndex,
                };
              } else if (defaultSelectInfo?.dataIndex || defaultSelectInfo?.dataIndex === 0) {
                selectInfo = { ...defaultSelectInfo };
              } else {
                selectInfo = null;
              }
            }

            if (this.options.seriesReverse) {
              series = this.seriesList[chartTypeSet.at(-1 - jx)];
            }

            series.draw({
              legendHitInfo,
              selectInfo,
              duple,
              coordinateDedupe: scatterDedupe,
              ...opt,
            });
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  }

  /**
   * Draw Tip with hitInfo and defaultSelectItemInfo
   */
  drawTip() {
    let tipLocationInfo;

    if (this.lastHitInfo) {
      tipLocationInfo = this.lastHitInfo;
    } else if (this.defaultSelectItemInfo) {
      tipLocationInfo = this.getItem(this.defaultSelectItemInfo, false);
    } else if (this.defaultSelectInfo && this.options.selectLabel.use) {
      tipLocationInfo = this.getItem(this.defaultSelectInfo, false);
    } else {
      tipLocationInfo = null;
    }

    this.drawTips?.(tipLocationInfo);
  }

  /**
   * Create axes
   * @param {string} dir    axis direction
   * @param {array}  axes   axes array
   *
   * @returns {array} axes objects in array
   */
  createAxes(dir, axes = []) {
    const ctx = this.bufferCtx;

    const isHeatMapType = this.options.type === 'heatMap';
    const labels = isHeatMapType ? this.data.labels[dir] : this.data.labels;

    const options = this.options;
    return axes.map((axis) => {
      switch (axis.type) {
        case 'linear':
          return new LinearScale(dir, axis, ctx, options);
        case 'time':
          if (axis.categoryMode) {
            return new TimeCategoryScale(dir, axis, ctx, labels, options);
          }
          return new TimeScale(dir, axis, ctx, options);
        case 'log':
          return new LogarithmicScale(dir, axis, ctx);
        case 'step':
          return new StepScale(dir, axis, ctx, labels, options);
        default:
          return false;
      }
    });
  }

  /**
   * Calculate min/max value, label and size information for each axis
   *
   * @returns {object} axes min/max information
   */
  getAxesRange() {
    /* eslint-disable max-len */
    const axesXMinMax = this.axesX.map((axis, index) =>
      axis.calculateScaleRange(this.minMax.x[index], this.scrollbar.x, this.chartRect),
    );
    const axesYMinMax = this.axesY.map((axis, index) =>
      axis.calculateScaleRange(this.minMax.y[index], this.scrollbar.y, this.chartRect),
    );
    /* eslint-enable max-len */

    return { x: axesXMinMax, y: axesYMinMax };
  }

  /**
   * Draw each axis
   *
   * @returns {undefined}
   */
  drawAxis(hitInfo) {
    this.axesX.forEach((axis, index) => {
      axis.draw(
        this.chartRect,
        this.labelOffset,
        this.axesSteps.x[index],
        hitInfo,
        this.defaultSelectInfo,
        this.data.labels,
      );
    });

    this.axesY.forEach((axis, index) => {
      axis.draw(
        this.chartRect,
        this.labelOffset,
        this.axesSteps.y[index],
        hitInfo,
        this.defaultSelectInfo,
      );
    });
  }

  /**
   * With each axis's min/max value and label information, calculate how many labels in each axis
   *
   * @returns {object} each axis's label steps in axes array
   */
  calculateSteps() {
    const axesXMinMax = this.axesX.map((axis, index) => {
      const range = {
        minValue: this.axesRange.x[index].min,
        maxValue: this.axesRange.x[index].max,
        minIndex: this.axesRange.x[index].minIndex,
        maxIndex: this.axesRange.x[index].maxIndex,
        minSteps: this.labelRange.x[index].min,
        maxSteps: this.labelRange.x[index].max,
      };
      return axis.calculateSteps(range);
    });

    const axesYMinMax = this.axesY.map((axis, index) => {
      const range = {
        minValue: this.axesRange.y[index].min,
        maxValue: this.axesRange.y[index].max,
        minIndex: this.axesRange.y[index].minIndex,
        maxIndex: this.axesRange.y[index].maxIndex,
        minSteps: this.labelRange.y[index].min,
        maxSteps: this.labelRange.y[index].max,
      };
      return axis.calculateSteps(range);
    });

    return { x: axesXMinMax, y: axesYMinMax };
  }

  /**
   * Calculate axis's min/max label steps
   *
   * @returns {object} axes's label range
   */
  getAxesLabelRange() {
    const axesXSteps = this.axesX.map((axis, index) => {
      const size = this.axesRange.x[index].size;
      return axis.calculateLabelRange('x', this.chartRect, this.labelOffset, size.width);
    });

    const axesYSteps = this.axesY.map((axis, index) => {
      const size = this.axesRange.y[index].size;
      return axis.calculateLabelRange('y', this.chartRect, this.labelOffset, size.height);
    });

    return { x: axesXSteps, y: axesYSteps };
  }

  /**
   * Reset devicePixelRatio for high DPI
   *
   * @returns {undefined}
   */
  initScale() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio ||
      1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;

    if (this.oldPixelRatio !== this.pixelRatio) {
      this.oldPixelRatio = this.pixelRatio;
    }

    // 누적형 scale() 대신 절대 변환(setTransform)을 사용해 idempotent하게 만든다.
    // 이렇게 하면 매 update마다 canvas.width 재대입(트랜스폼 리셋)에 의존하지 않아도 되어
    // setWidth/setHeight에서 크기 변경이 없을 때 비트맵 재할당을 건너뛸 수 있다.
    this.bufferCtx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    if (this.overlayCtx) {
      this.overlayCtx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }
  }

  /**
   * Get chart DOM size and set canvas size
   * @typedef {import('./model/index').ChartDOMSize} ChartDOMSize
   *
   * @returns {ChartDOMSize} chart size information
   */
  getChartDOMRect() {
    const rect = this.chartDOM?.getBoundingClientRect();
    const width = rect?.width || 10;
    const height = rect?.height || 10;

    this.setWidth(width);
    this.setHeight(height);

    return { width, height };
  }

  /**
   * Viewport 기준 overlayCanvas 위치/크기를 캐시해 반환한다.
   * mousemove마다 getBoundingClientRect를 호출하면 강제 동기 레이아웃이 발생하므로
   * resize/render/scroll/mouseleave 시점에만 무효화한다.
   *
   * @returns {DOMRect|undefined} cached overlay client rect
   */
  getOverlayClientRect() {
    if (!this.cachedOverlayRect && this.overlayCanvas) {
      this.cachedOverlayRect = this.overlayCanvas.getBoundingClientRect();
    }
    return this.cachedOverlayRect;
  }

  /**
   * Viewport 기준 chartDOM 위치/크기를 캐시해 반환한다. (indicator sync 경로용)
   *
   * @returns {DOMRect|undefined} cached chartDOM client rect
   */
  getChartDOMClientRect() {
    if (!this.cachedChartDOMRect && this.chartDOM) {
      this.cachedChartDOMRect = this.chartDOM.getBoundingClientRect();
    }
    return this.cachedChartDOMRect;
  }

  /**
   * 캐시된 client rect를 무효화한다.
   *
   * @returns {undefined}
   */
  invalidateClientRectCache() {
    this.cachedOverlayRect = null;
    this.cachedChartDOMRect = null;
  }

  /**
   * Calculate chart size
   * @typedef {import('./model/index').ChartRect} ChartRect
   *
   * @returns {ChartRect} chart size information
   */
  getChartRect() {
    const { width, height } = this.getChartDOMRect();

    const padding = this.options.padding;
    const xAxisTitleOpt = this.options.axesX?.[0]?.title;
    const yAxisTitleOpt = this.options.axesY?.[0]?.title;
    const titleMargin = 10;

    let xAxisTitleHeight = 0;
    if (xAxisTitleOpt?.use && xAxisTitleOpt?.text) {
      const fontSize = isNaN(xAxisTitleOpt?.fontSize) ? 12 : xAxisTitleOpt?.fontSize;
      xAxisTitleHeight = fontSize + titleMargin;
    }

    let yAxisTitleHeight = 0;
    if (yAxisTitleOpt?.use && yAxisTitleOpt?.text) {
      const fontSize = isNaN(yAxisTitleOpt?.fontSize) ? 12 : yAxisTitleOpt?.fontSize;
      yAxisTitleHeight = fontSize + titleMargin;
    }

    const xAxisScrollOpt = this.scrollbar.x;
    const yAxisScrollOpt = this.scrollbar.y;

    let xAxisScrollHeight = 0;
    if (xAxisScrollOpt?.use) {
      xAxisScrollHeight = xAxisScrollOpt?.height;
    }

    let yAxisScrollWidth = 0;
    if (yAxisScrollOpt?.use) {
      yAxisScrollWidth = yAxisScrollOpt?.width;
    }

    const horizontalPadding = padding.left + padding.right + yAxisScrollWidth;
    const verticalPadding =
      padding.top + padding.bottom + xAxisTitleHeight + yAxisTitleHeight + xAxisScrollHeight;
    const chartWidth = width > horizontalPadding ? width - horizontalPadding : width;
    const chartHeight = height > verticalPadding ? height - verticalPadding : height;

    const x1 = padding.left;
    const x2 = Math.max(width - padding.right - yAxisScrollWidth, x1 + 2);
    const y1 = padding.top + yAxisTitleHeight;
    const y2 = Math.max(height - padding.bottom - xAxisTitleHeight - xAxisScrollHeight, y1 + 2);

    return {
      x1,
      x2,
      y1,
      y2,
      chartWidth,
      chartHeight,
      width,
      height,
    };
  }

  /**
   * Set canvas width
   * @param {number} width    canvas width from chartDOM.width
   *
   * @returns {undefined}
   */
  setWidth(width) {
    if (!this.displayCanvas) {
      return;
    }

    // canvas.width 재대입은 크기가 같아도 비트맵 재할당+clear+컨텍스트 리셋을 유발한다.
    // 실제 device-pixel 폭이 바뀐 경우에만 재설정해 매 update마다의 재할당을 제거한다.
    // (clear()가 매 렌더에서 캔버스를 비우므로 재할당의 암묵적 clear는 불필요하다.)
    const deviceWidth = width * this.pixelRatio;
    if (this._deviceWidth === deviceWidth) {
      return;
    }
    this._deviceWidth = deviceWidth;

    this.displayCanvas.width = deviceWidth;
    this.displayCanvas.style.width = `${width}px`;
    this.bufferCanvas.width = deviceWidth;
    this.bufferCanvas.style.width = `${width}px`;

    if (this.overlayCanvas) {
      this.overlayCanvas.width = deviceWidth;
      this.overlayCanvas.style.width = `${width}px`;
    }

    // pointsLayer 는 치수가 실제로 바뀔 때만 재할당한다. canvas.width 대입은 값이 같아도 비트맵을
    // 전부 지우므로, render() 마다 호출되는 이 경로에서 무조건 대입하면 blit 누적 픽셀이 매 틱 사라진다.
    // 비교값은 canvas.width 대입 시의 정수 절삭 규칙과 동일하게 floor 한다 — DOM 폭이 소수(예: 590.5)면
    // float 비교는 영원히 불일치해 매 렌더 소거+무효화가 반복된다.
    if (this.pointsLayerA) {
      const dw = Math.floor(width * this.pixelRatio);
      if (this.pointsLayerA.width !== dw) {
        this.pointsLayerA.width = dw;
        this.pointsLayerB.width = dw;
        this.pointsLayerValid = false; // 치수 변경 → baseline 무효화(다음 full redraw 에서 재구성)
      }
    }
  }

  /**
   * Set canvas height
   * @param {number} height    canvas width from chartDOM.height
   *
   * @returns {undefined}
   */
  setHeight(height) {
    if (!this.displayCanvas) {
      return;
    }

    // setWidth와 동일하게 device-pixel 높이가 바뀐 경우에만 재설정한다.
    const deviceHeight = height * this.pixelRatio;
    if (this._deviceHeight === deviceHeight) {
      return;
    }
    this._deviceHeight = deviceHeight;

    this.displayCanvas.height = deviceHeight;
    this.displayCanvas.style.height = `${height}px`;
    this.bufferCanvas.height = deviceHeight;
    this.bufferCanvas.style.height = `${height}px`;

    if (this.overlayCanvas) {
      this.overlayCanvas.height = deviceHeight;
      this.overlayCanvas.style.height = `${height}px`;
    }

    // setWidth 와 동일 이유: 치수 변경 시에만 재할당(매 틱 clear 방지). floor 도 setWidth 와 동일.
    if (this.pointsLayerA) {
      const dh = Math.floor(height * this.pixelRatio);
      if (this.pointsLayerA.height !== dh) {
        this.pointsLayerA.height = dh;
        this.pointsLayerB.height = dh;
        this.pointsLayerValid = false;
      }
    }
  }

  /**
   * Calculate labels offset from chart rect (Axis 영역을 벗어나는 label 크기 계산)
   *
   * ex)
   * Y축 label의 넓이와 (X축 최소값 label 넓이 / 2) 중 넓은 값이 left label offset으로 처리됨
   *
   * 0 |
   *   |
   *   |
   * 0 ----------------------
   * hh:mm                 hh:mm
   *
   * @param {object} adjustedRange
   * {
   *  min: number, max: number, minLabel: string, maxLabel: string,
   *  size: {width: number, height: number}
   *  }
   * minLabel and maxLabel is formatted label
   * @returns {object} label offset for edge
   */
  getLabelOffset(adjustedRange = null) {
    const axesX = this.axesX;
    const axesY = this.axesY;
    const range = adjustedRange ?? this.axesRange;
    const labelOffset = { top: 2, left: 2, right: 2, bottom: 2 };
    const labelBuffer = { width: 14, height: 4 };

    let lw = 0;
    let lh = 0;

    axesX.forEach((axis, index) => {
      if (axis.labelStyle?.show) {
        lw = range.x[index].size.width + labelBuffer.width;
        lh = range.x[index].size.height + labelBuffer.height;

        if (axis.position === 'bottom') {
          if (lh > labelOffset.bottom) {
            labelOffset.bottom = lh;
          }
        } else if (axis.position === 'top') {
          if (lh > labelOffset.top) {
            labelOffset.top = lh;
          }
        }

        labelOffset.left = lw / 2 > labelOffset.left ? lw / 2 : labelOffset.left;
        labelOffset.right = lw / 2 > labelOffset.right ? lw / 2 : labelOffset.right;
      }
    });

    axesY.forEach((axis, index) => {
      if (axis.labelStyle?.show) {
        lw = range.y[index].size.width + labelBuffer.width;

        if (axis.position === 'left') {
          if (lw > labelOffset.left) {
            labelOffset.left = lw;
          }
        } else if (axis.position === 'right') {
          if (lw > labelOffset.right) {
            labelOffset.right = lw;
          }
        }

        labelOffset.top = lh / 2 > labelOffset.top ? lh / 2 : labelOffset.top;
        labelOffset.bottom = lh / 2 > labelOffset.bottom ? lh / 2 : labelOffset.bottom;
      }
    });

    return labelOffset;
  }

  /**
   * Update scrollbar information
   * @param {boolean} updateData is update data
   * @returns {undefined}
   */
  updateScrollbar(updateData, updateByScrollbar) {
    const isForceUpdate = updateByScrollbar || updateData;
    const xUse = this.options.axesX?.[0]?.scrollbar?.use ?? false;
    const yUse = this.options.axesY?.[0]?.scrollbar?.use ?? false;
    const prevXUse = this.scrollbar?.x?.use ?? false;
    const prevYUse = this.scrollbar?.y?.use ?? false;

    if (xUse !== prevXUse || xUse || (isForceUpdate && xUse)) {
      this.updateScrollbarInfo('x', updateData);
    }

    if (yUse !== prevYUse || yUse || (isForceUpdate && yUse)) {
      this.updateScrollbarInfo('y', updateData);
    }
  }

  /**
   * To re-render chart, reset properties, canvas and then render chart.
   * @param {object} updateInfo   information for each components are needed to update
   *
   * @returns {undefined}
   */
  update(updateInfo) {
    const options = this.options;
    const data = this.data.data;
    const labels = this.data.labels;
    const groups = this.data.groups;
    const series = this.data.series;

    const {
      updateSeries,
      updateSelTip,
      updateLegend,
      updateData,
      updateTooltip,
      lightUpdate,
      updateByScrollbar,
    } = updateInfo;

    if (!this.isInit) {
      return;
    }

    // 데이터 갱신 시 hover fast-path 시그니처를 무효화한다.
    if (updateData || updateSeries) {
      this._lastHoverSig = '';
    }

    this.updateScrollbar(updateData, updateByScrollbar);

    this.resetProps();

    this.updateSeries = updateSeries;
    // series 구성 변동(추가/삭제/legend toggle) → 점 baseline 무효화(다음 full redraw 에서 재구성).
    if (updateSeries) {
      this.pointsLayerValid = false;
    }
    // realTimeScatter 가 런타임에 켜졌는데 레이어가 없으면 생성한다.
    if (this.options.realTimeScatter?.use && !this.pointsLayerA) {
      this.createPointsLayers();
    }
    if (updateSeries) {
      this.seriesInfo = null;
      this.seriesList = null;
      this.lastTip = null;

      this.seriesInfo = {
        charts: {
          pie: [],
          bar: [],
          line: [],
          scatter: [],
          heatMap: [],
        },
        count: 0,
      };
      this.seriesList = {};
      this.lastTip = { pos: null, value: null };

      this.createSeriesSet(series, options.type, options.horizontal, groups);

      if (this.legendDOM && !options.legend.external) {
        this.updateLegend();
      }
    }

    if (updateSelTip.update) {
      this.lastTip.value = null;

      if (!updateSelTip.keepDomain) {
        this.lastTip.pos = null;
        this.lastHitInfo = null;
      }
    }

    if (!lightUpdate) {
      // group update
      if (groups.length) {
        this.addGroupInfo(groups);
      }

      // dataSet update
      if (this.options.realTimeScatter?.use) {
        if (!this.dataSet) {
          this.dataSet = {};
        }
        this.createRealTimeScatterDataSet(data);
      } else {
        this.createDataSet(data, labels);
      }

      // title update
      if (options.title.show) {
        if (!this.isInitTitle) {
          this.initTitle();
        } else {
          this.updateTitle();
        }

        this.showTitle();
      } else if (this.isInitTitle) {
        this.hideTitle();
      }

      // legend Update
      if (options.legend.show && !options.legend.external) {
        const useTable =
          !!options.legend?.table?.use && options.type !== 'heatMap' && options.type !== 'scatter';

        if (!this.isInitLegend) {
          this.initLegend();
        } else if (updateSeries) {
          this.updateLegend();
        } else if (updateLegend) {
          this.forceUpdateLegend();
        } else if (useTable && updateData) {
          this.updateLegendTableValues();
        }

        this.setLegendPosition();
        this.updateLegendContainerSize();
        this.showLegend();
      } else if (options.legend.show && options.legend.external) {
        if (updateSeries || updateData) {
          this._updateSeriesCount();
          this.emitLegendData();
        }
      } else if (this.isInitLegend) {
        this.hideLegend();
      }
    }

    // Tooltip Update
    if (updateTooltip) {
      if (!this.isInitTooltip) {
        this.createTooltipDOM();
      }

      this.tooltipDOM.innerHTML = '';

      if (!options.tooltip?.formatter?.html) {
        this.setDefaultTooltipLayout();
      }
    }

    this.minMax = this.getStoreMinMax();
    this.axesX = this.createAxes('x', options.axesX);
    this.axesY = this.createAxes('y', options.axesY);

    this.initDefaultSelectInfo();

    let renderHitInfo = updateInfo?.hitInfo;
    if (!renderHitInfo?.legend && this.legendHover?.sId) {
      renderHitInfo = { ...(renderHitInfo || {}), legend: this.legendHover };
    }

    this.render(renderHitInfo);

    const isDragMove = this.dragInfo && this.drawSelectionArea;
    if (isDragMove) {
      this.drawSelectionArea(this.dragInfo);
    } else if (this.dragInfoBackup) {
      if (lightUpdate) {
        this.drawSelectionArea(this.dragInfoBackup);
      } else {
        this.dragInfoBackup = null;
      }
    }
  }

  /**
   * To re-render chart, reset properties
   *
   * @returns {undefined}
   */
  resetProps() {
    this.axesX[0] = null;
    this.axesY[0] = null;
    this.axesX = null;
    this.axesY = null;
    this.minMax = null;
    this.axesRange = null;
    this.labelOffset = null;
    this.chartRect = null;
  }

  /**
   * Clear overlay canvas
   *
   * @returns {undefined}
   */
  overlayClear() {
    this.clearRectRatio = this.pixelRatio < 1 ? this.pixelRatio : 1;

    this.overlayCtx.clearRect(
      0,
      0,
      this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio,
    );
  }

  /**
   * Clear display and buffer canvas
   *
   * @returns {undefined}
   */
  clear() {
    this.clearRectRatio = this.pixelRatio < 1 ? this.pixelRatio : 1;
    if (this.displayCanvas) {
      this.displayCtx.clearRect(
        0,
        0,
        this.displayCanvas.width / this.clearRectRatio,
        this.displayCanvas.height / this.clearRectRatio,
      );
    }
    if (this.bufferCanvas) {
      this.bufferCtx.clearRect(
        0,
        0,
        this.bufferCanvas.width / this.clearRectRatio,
        this.bufferCanvas.height / this.clearRectRatio,
      );
    }
    if (this.overlayCanvas) {
      this.overlayCtx.clearRect(
        0,
        0,
        this.overlayCanvas.width / this.clearRectRatio,
        this.overlayCanvas.height / this.clearRectRatio,
      );
    }
  }

  /**
   * Resize chart
   * @param {Function} promiseRes After evChart resize completes,
   *   callback completion status with promiseRes to draw a Brush over it.
   *
   * @returns {undefined}
   */
  resize(promiseRes) {
    this.invalidateClientRectCache();
    this.clear();
    this.bufferCtx.restore();
    this.bufferCtx.save();

    // 리사이즈는 기하가 바뀌므로 점 baseline 을 무효화한다(아래 drawChart 에서 full redraw 로 재구성).
    this.pointsLayerValid = false;

    if (this.options.axesX?.[0]?.scrollbar?.use || this.options.axesY?.[0]?.scrollbar?.use) {
      this.initScrollbar();
    }

    this.initRect();

    this.initScale();
    this.chartRect = this.getChartRect();
    this.drawChart();
    if (this.dragInfoBackup) {
      this.drawSelectionArea?.(this.dragInfoBackup);
    }

    if (promiseRes) {
      promiseRes(true);
    }
  }

  /**
   * Render chart
   * @param {any} [hitInfo=undefined]   hit item from mouse click/dblclick
   *
   * @returns {undefined}
   */
  render(hitInfo) {
    if (this.isInit) {
      this.invalidateClientRectCache();
      // 데이터/옵션 변경으로 formatter.html 마크업이 달라질 수 있으므로 가상 스크롤
      // row 탐지 실패 플래그를 리셋해 다음 hover에서 다시 시도한다.
      this._vsDetectFailed = false;
      this.clear();
      this.chartRect = this.getChartRect();
      this.drawChart(hitInfo);
    }
  }

  /**
   * Get legend series list respecting group order
   *
   * @returns {Array} array of [sId, series] pairs
   */
  _getLegendSeries() {
    const groups = this.data.groups?.at(0);
    if (groups) {
      return groups
        .filter((sId) => this.seriesList[sId]?.showLegend)
        .map((sId) => [sId, this.seriesList[sId]]);
    }
    return Object.entries(this.seriesList).filter(([, series]) => series.showLegend);
  }

  /**
   * Convert series object to plain legend item
   *
   * @param {object} series  series object
   * @returns {object} legend item
   */
  _seriesToLegendItem(series) {
    const color =
      typeof series.color !== 'string' ? series.color[series.color.length - 1][1] : series.color;
    return {
      sId: series.sId,
      name: series.name,
      color,
      type: series.type,
      show: series.show,
      fill: series.fill,
      fillColor: series.fillColor,
    };
  }

  /**
   * Build legend data array from current seriesList
   *
   * @returns {Array} legend items
   */
  buildLegendData() {
    return this._getLegendSeries().map(([, series]) => this._seriesToLegendItem(series));
  }

  /**
   * Emit legend data through listeners
   *
   * @returns {undefined}
   */
  emitLegendData() {
    if (typeof this.listeners['update:legendData'] === 'function') {
      this.listeners['update:legendData'](this.buildLegendData());
    }
  }

  /**
   * Toggle series visibility (for external legend)
   *
   * @param {string} sId  series ID to toggle
   * @returns {undefined}
   */
  toggleSeries(sId) {
    const series = this.seriesList[sId];
    if (!series) {
      return;
    }

    const opt = this.options.legend;
    const legendSeries = this._getLegendSeries();

    if (opt.clickMode === 'active') {
      const isActiveAll = legendSeries.every(([, s]) => s.show);

      if (isActiveAll) {
        legendSeries.forEach(([, s]) => {
          s.show = false;
        });
        series.show = true;
        this.seriesInfo.count = 1;
      } else if (series.show) {
        series.show = false;
        this.seriesInfo.count--;
      } else {
        series.show = true;
        this.seriesInfo.count++;
      }

      const isInactiveAll = legendSeries.every(([, s]) => !s.show);
      if (isInactiveAll) {
        legendSeries.forEach(([, s]) => {
          s.show = true;
        });
        this.seriesInfo.count = legendSeries.length;
      }
    } else {
      if (series.show && this.seriesInfo.count === 1) {
        return;
      }

      if (series.show) {
        series.show = false;
        this.seriesInfo.count--;
      } else {
        series.show = true;
        this.seriesInfo.count++;
      }
    }

    if (this.brushSeries) {
      const { chartIdx } = this.data;
      const seriesList = [...this.brushSeries.list];
      seriesList[chartIdx] = this.seriesList;
      this.brushSeries.list = seriesList;
      this.brushSeries.chartIdx = chartIdx;
    }

    if (this.options.eventBehavior?.legendClick !== 'emitOnly') {
      this.update({
        updateSeries: false,
        updateSelTip: { update: true, keepDomain: true },
      });
    }

    const activeSeries = Object.values(this.seriesList).filter((s) => s.show);
    const activeSeriesIds = activeSeries.map((s) => s.sId);
    const isActiveAll = activeSeriesIds.length === Object.values(this.seriesList).length;
    const args = {
      data: {
        seriesIds: isActiveAll ? [] : activeSeriesIds,
        isActiveAll,
      },
    };

    if (typeof this.listeners['click-legend'] === 'function') {
      this.listeners['click-legend'](args);
    }

    if (this.options.legend.show && this.options.legend.external) {
      this.emitLegendData();
    }
  }

  /**
   * Highlight a series (for external legend hover)
   *
   * @param {string} sId  series ID to highlight
   * @returns {undefined}
   */
  highlightSeries(sId) {
    const legendHitInfo = { sId, type: this.options.type };
    this.legendHover = legendHitInfo;

    this.update({
      updateSeries: false,
      updateSelTip: { update: false, keepDomain: false },
      hitInfo: {
        legend: legendHitInfo,
      },
      lightUpdate: true,
    });
  }

  /**
   * Remove series highlight (for external legend mouse leave)
   *
   * @returns {undefined}
   */
  unhighlightSeries() {
    this.legendHover = null;

    this.update({
      updateSeries: false,
      updateSelTip: { update: false, keepDomain: false },
      hitInfo: {
        legend: null,
      },
      lightUpdate: true,
    });
  }

  /**
   * destroy chart component
   *
   * @returns {undefined}
   */
  destroy() {
    if (!this.isInit) {
      return;
    }

    const target = this.target;

    if (this.options.legend.show && !this.options.legend.external) {
      if (this.legendBoxDOM) {
        this.legendBoxDOM.removeEventListener('click', this.onLegendBoxClick);
        this.legendBoxDOM.removeEventListener('mouseover', this.onLegendBoxOver);
        this.legendBoxDOM.removeEventListener('mouseleave', this.onLegendBoxLeave);
        if (this.options.legend.type === 'gradient') {
          this.legendBoxDOM.removeEventListener('mousedown', this.onLegendMouseDown);
        }
        if (this.options.legend.virtualScroll && !this.useTable) {
          this.legendBoxDOM.removeEventListener('resize', this.updateVisibleRowCount);
          this.legendBoxDOM.removeEventListener('scroll', this.renderVisibleLegends);
        }
      }

      if (this.resizeDOM) {
        this.resizeDOM.removeEventListener('mousedown', this.onResizeMouseDown);
      }
    }

    if (this.overlayCanvas) {
      this.overlayCanvas.removeEventListener('mousemove', this.onMouseMove);
      this.overlayCanvas.removeEventListener('mouseleave', this.onMouseLeave);
      this.overlayCanvas.removeEventListener('dblclick', this.onDblClick);
      this.overlayCanvas.removeEventListener('click', this.onClick);
      this.overlayCanvas.removeEventListener('mousedown', this.onMouseDown);
      this.overlayCanvas.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('click', this.dragTouchSelectionEvent);
      if (this.invalidateRectOnScroll) {
        window.removeEventListener('scroll', this.invalidateRectOnScroll, { capture: true });
      }
    }

    if (this.isInitTooltip) {
      this.tooltipDestroy();
    }

    if (this.renderVisibleLegendsFrameId != null) {
      cancelAnimationFrame(this.renderVisibleLegendsFrameId);
      this.renderVisibleLegendsFrameId = null;
    }
    if (this.updateVisibleRowCountFrameId != null) {
      cancelAnimationFrame(this.updateVisibleRowCountFrameId);
      this.updateVisibleRowCountFrameId = null;
    }

    this.wrapperDOM = null;
    this.chartDOM = null;
    this.legendDOM = null;
    this.legendBoxDOM = null;
    this.resizeDOM = null;
    this.ghostDOM = null;
    this.titleDOM = null;
    this.displayCanvas = null;
    this.bufferCanvas = null;
    this.overlayCanvas = null;

    while (target.hasChildNodes()) {
      target.removeChild(target.firstChild);
    }
  }

  /**
   * hide chart tooltip
   *
   * @returns {undefined}
   */
  hideTooltip() {
    if (this.options.tooltip.use && this.tooltipDOM?.style) {
      this.tooltipDOM.style.display = 'none';
    }
  }

  /**
   * init defaultSelectInfo (for selectLabel, selectSeries options)
   */
  initDefaultSelectInfo() {
    const { type: chartType, selectLabel, selectSeries } = this.options;

    if (selectLabel.use) {
      let targetAxis = null;
      if (chartType === 'heatMap' && selectLabel?.useBothAxis) {
        targetAxis = this.defaultSelectInfo?.targetAxis;
      }

      this.defaultSelectInfo = !this.defaultSelectInfo?.dataIndex
        ? { dataIndex: [], label: [], data: [] }
        : this.getSelectedLabelInfoWithLabelData(this.defaultSelectInfo.dataIndex, targetAxis);
    }

    if (selectSeries.use && !this.defaultSelectInfo) {
      this.defaultSelectInfo = { seriesId: [] };
    }
  }
}

export default EvChart;
