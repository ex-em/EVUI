import { mobileCheck, truthyNumber, Console } from '@/common/utils';
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
import Blit from './chart.blit';
import Selection from './chart.selection';
import { WorkerRenderGate } from './render/render.worker.gate';
import { toRenderSnapshot, packSeries } from './render/render.snapshot';

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

    this.initBlitState();
    this.initSelectionBaseState();

    // worker 렌더 게이트. 차트별 opt-in(`options.workerRender`, 기본 off)으로만 진입한다 →
    // opt-in 하지 않으면 worker 미진입 = 기존 main 경로 100% 유지(아래 drawChart 의 worker 분기는 ready 일 때만).
    this.renderWorkerGate = new WorkerRenderGate({
      isEnabled: () => !!this.options.workerRender,
      // worker 실패/예외를 Console.warn(worker-safe)으로 노출해 무신호 사망을 막는다.
      // opt-in-off(기능 미사용)는 정상 흐름이라 silent. unsupported 는 전용 hook 이 없어 onFallback 에서,
      // 그 외 실패는 onInitFailure/onRenderException 이 한 번씩만 알린다(중복 로깅 방지).
      hooks: {
        onInitFailure: (info) =>
          Console.warn('[EvChart] workerRender 비활성화 — main 렌더로 fallback:', info),
        onRenderException: (info) =>
          Console.warn('[EvChart] workerRender 렌더 예외 — main 렌더로 fallback:', info),
        onFallback: (reason) => {
          if (reason === 'unsupported') {
            Console.warn('[EvChart] workerRender 미지원 환경 — main 렌더 사용');
          }
        },
      },
    });
    // display frame ↔ hit-test model 일관성 / stale frame drop 용 단조 증가 epoch.
    this.renderEpoch = 0;
    this.renderWorkerGate.setFrameHandler((msg) => this.commitWorkerFrame(msg));
    this.renderWorkerGate.setErrorHandler((msg) => this.drawSeriesLayerFallback(msg));
    // opt-in off / 미지원 / 생성 실패 / 미준비는 gate 상태기계가 처리하고 drawChart 는 ready 일 때만
    // worker 분기하므로, 꺼져있거나 실패해도 main 경로(무회귀).
    this.renderWorkerGate.start();
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

  /**
   * Compute the axes-scale-change payload (RenderCore — DOM/listener-free).
   * listener 호출은 하지 않는다 — payload(또는 변경 없음 시 null)만 반환하고,
   * ChartShell(drawChart)이 그 결과로 listener 를 호출한다.
   *
   * @returns {?object} axes-scale-change payload, or null when nothing watched changed
   */
  computeAxesScaleChange() {
    // 구독자가 없으면 payload 계산 자체를 건너뛴다(3.4 emitAxesScaleChange 동작 보존 — 무구독 비용 0).
    if (typeof this.listeners?.['axes-scale-change'] !== 'function') {
      return null;
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
      return null;
    }

    this._lastEmittedAxesRange = curr;

    return {
      x: curr.x.map(toPayloadAxis),
      y: curr.y.map(toPayloadAxis),
    };
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
   * Prepare scale (RenderCore — DOM/scrollbar/listener-free).
   * axesRange→labelOffset→labelRange→steps→adjustXAndYAxisWidth 를 계산하고,
   * scrollbar DOM 배치(ChartShell)에 쓸 pre-adjust labelOffset 스냅샷과
   * axes-scale-change payload 를 반환한다(직접 listener 호출/ DOM write 안 함).
   *
   * 주의: scrollbar 배치는 adjustXAndYAxisWidth 가 labelOffset 을 재계산하기 *전* 값으로
   * 그려져 왔으므로(기존 동작), 그 시점 스냅샷을 따로 잡아 반환한다.
   *
   * @returns {{ scaleChange: ?object, scrollbarLabelOffset: object }}
   */
  prepareScale() {
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();
    this.labelRange = this.getAxesLabelRange();

    // scrollbar DOM 배치는 adjust 이전 labelOffset 으로 계산돼 왔다(동작 보존).
    const scrollbarLabelOffset = this.labelOffset;

    this.axesSteps = this.calculateSteps();

    this.adjustXAndYAxisWidth();

    return {
      scaleChange: this.computeAxesScaleChange(),
      scrollbarLabelOffset,
    };
  }

  /**
   * To draw canvas chart, it processes several sequential jobs.
   *
   * Orchestration layer — ChartShell(main 전용)과 RenderCore(DOM-free, worker 후보) 단계를 엮는다:
   *   - initScale       : ChartShell(window pixelRatio 읽기) → RenderCore prepareLayout(buffer transform)
   *                       + main 소유 overlay transform
   *   - prepareScale    : RenderCore(scale 계산) → scrollbar 기하·scale-change payload 반환(DOM/listener 없음)
   *   - updateScrollbarPosition : ChartShell(scrollbar DOM 스타일 write)
   *   - axes-scale-change       : ChartShell(payload 로 listener 호출)
   *   - drawStaticLayer/drawSeriesLayer : RenderCore(주입형 bufferCtx 래스터)
   *   - drawSeriesOverlay/drawTip       : ChartShell(main overlay/tip — interaction 즉답)
   *   - commitToDisplay : RenderCore 출력단(buffer→display blit)
   *
   * @param {any} [hitInfo=undefined]    from mousemove callback (object or object[] of undefined)
   *
   * @returns {undefined}
   */
  drawChart(hitInfo, forceMainSeries) {
    // epoch 는 *모든* drawChart 진입에서 증가시킨다(worker 전송 프레임뿐 아니라 resize·main-only·hover
    // 프레임 포함). 그래야 main 이 그린 더 새로운 프레임 뒤에 늦게 도착한 stale worker 비트맵/에러가
    // commitWorkerFrame·drawSeriesLayerFallback 의 epoch 비교에서 항상 drop 된다.
    this.renderEpoch += 1;
    this.initScale();

    const { scaleChange, scrollbarLabelOffset } = this.prepareScale();

    // geometry(xp/yp) 가 의존하는 스케일 입력(chartRect/labelOffset/axesSteps min·max/pixelRatio 등)이
    // 직전 프레임과 같은지 한 토큰으로 판정해 _scaleVersion 을 갱신한다. computeGeometry 가 (데이터 버전,
    // 스케일 버전) 키로 재계산을 skip 하는 데 쓴다(hover/스타일 변경 프레임은 둘 다 불변 → skip).
    this.computeScaleVersion();

    if (this.scrollbar?.x?.use || this.scrollbar?.y?.use) {
      this.updateScrollbarPosition(scrollbarLabelOffset);
    }

    if (scaleChange && typeof this.listeners?.['axes-scale-change'] === 'function') {
      this.listeners['axes-scale-change'](scaleChange);
    }

    this.emitDataMaxChange();

    // worker 분기: ready 이고 in-flight 여유가 있을 때만 series 를 worker 로.
    // 기본 off(start() 미호출)면 항상 false → 아래 main 경로로 fall through(기존 동작 불변).
    // forceMainSeries: resize 처럼 캔버스가 막 리사이즈(=자동 clear)된 프레임은 worker 의 비동기 합성을
    // 기다리면 display 가 blank 로 깜빡인다 → 이 프레임은 main 으로 동기 렌더해 즉시 채운다.
    if (!forceMainSeries && this.tryDrawSeriesOnWorker(hitInfo)) {
      return;
    }

    if (this.options.realTimeScatter?.use) {
      // realtime scatter 는 worker 미지원이라 항상 main 경로다. blit fast-path 통합
      // 진입점으로 보내 매 틱 strip-only 렌더(또는 조건 미달 시 내부에서 full 폴백)한다.
      this.drawAxisAndSeries(hitInfo);
    } else {
      this.drawStaticLayer(this.bufferCtx, hitInfo);
      this.drawSeriesLayer(this.bufferCtx, hitInfo);
    }
    this.drawSeriesOverlay();

    this.drawTip();

    this.commitToDisplay(this.displayCtx, this.bufferCanvas);
  }

  /**
   * worker series 래스터 경로. ready + in-flight 여유가 있을 때만 진입한다.
   *
   * 책임 분리: static(axis/grid) 는 main buffer 에, overlay/tip(interaction 즉답)도 main 에 그대로 그린다.
   * hit-test 기하(xp/yp/w/h)도 main 모델에 채운다. **series 래스터만** worker 로 보내고(자체
   * OffscreenCanvas → ImageBitmap), 도착 시 commitWorkerFrame 이 epoch 비교 후 합성한다. 디스플레이
   * 캔버스를 transfer 하지 않으므로 worker 가 실패/미응답이면 이 함수가 false 를 반환해 호출부가 main
   * 래스터로 fallback 한다.
   *
   * @param {any} [hitInfo]
   * @returns {boolean} worker 로 보냈으면 true(main series 래스터 생략), 아니면 false(main 경로)
   */
  tryDrawSeriesOnWorker(hitInfo) {
    if (!this.renderWorkerGate?.canAcceptRender()) {
      return false;
    }
    // 시리즈 타입/축/상호작용 상태가 worker 재구성(line·bar(non-time)·heatMap, 숫자 축, 무선택)으로
    // 동등 렌더 가능한 프레임만 worker 로 보낸다. 아니면 main 경로(무회귀).
    if (!this.canRenderSeriesOnWorker(hitInfo).ok) {
      return false;
    }

    // epoch 는 drawChart 진입부에서 이미 증가시켰다 — 여기서는 현재 값을 그대로 스냅샷에 싣는다.
    const epoch = this.renderEpoch;
    const snapshot = toRenderSnapshot(this, epoch);
    const { columns, transferList } = packSeries(snapshot);

    // static(axis/grid) 과 hit-test 기하는 두 경로(전송/미전송) 공통이라 먼저 그린다.
    // static 은 main buffer 에(worker bitmap 과 합성). 기하(xp/yp/w/h)는 래스터를 worker 가 하더라도
    // hover hit-test/tooltip 이 읽도록 main 모델에 채운다. computeGeometry 는 canvas 그리기 없음.
    this.drawStaticLayer(this.bufferCtx, hitInfo);
    this.computeSeriesGeometry();

    const sent = this.renderWorkerGate.render(snapshot, columns, transferList);
    if (!sent) {
      // in-flight 상한 등으로 미전송 → main 이 이 프레임을 그린다(main 경로와 동일 z-order:
      // series→overlay→tip→commit).
      this.drawSeriesLayer(this.bufferCtx, hitInfo);
      this.drawSeriesOverlay();
      this.drawTip();
      this.commitToDisplay(this.displayCtx, this.bufferCanvas);
    } else {
      // 전송 프레임: overlay(별도 canvas)만 그린다. series 는 worker, tip(maxTip/selectItem/selectLabel)은
      // commitWorkerFrame 이 series bitmap 위에 그린다(z-order). 여기서 tip 을 buffer 에 그리면 가려진다.
      this.drawSeriesOverlay();
    }
    return true;
  }

  /**
   * worker series 래스터 경로 진입 가능 여부. worker 재구성/기하(render.unpack·render.snapshot)는
   * line·bar(timeMode 제외)·heatMap 을 동등 렌더하며(time/step 축은 snapshot 이 좌표를 숫자로 정규화).
   * select/maxTip 은 selection 을 snapshot 으로 전달해 worker 가 raster 에 반영하고, tip 은 commitWorkerFrame
   * 이 series bitmap 위에 그린다(z-order). hover(hitInfo/lastHitInfo)만 main 전용 — series 를 안 바꾸고
   * overlayCanvas 만 갱신하므로 worker 왕복이 불필요. 하나라도 어긋나면 main 경로로 보내 무회귀를 보장한다.
   *
   * @param {any} [hitInfo]   legend/hover hit (drawChart 인자)
   * @returns {{ok:boolean, reason?:string}}
   */
  canRenderSeriesOnWorker(hitInfo) {
    // hover/legend hit — 이번 프레임(hitInfo) 또는 잔류(lastHitInfo). hover 강조는 overlay 소유지만
    // legendHitInfo 는 series raster 를 바꾸고 hover tip 도 매 프레임 갱신되므로 main 경로로 처리한다.
    if (hitInfo || this.lastHitInfo) {
      return { ok: false, reason: 'hit-info' };
    }

    const charts = this.seriesInfo?.charts ?? {};
    const supported = { line: true, bar: true, heatMap: true };

    // 미지원 타입(scatter/pie 등)에 visible 시리즈가 있으면 worker 가 그 시리즈를 무음 누락한다.
    const unsupported = Object.keys(charts).find(
      (type) => !supported[type] && (charts[type] ?? []).some((id) => this.seriesList[id]?.show !== false),
    );
    if (unsupported) {
      return { ok: false, reason: `unsupported-type:${unsupported}` };
    }

    // TimeBar(opt.timeMode)는 worker 가 일반 Bar 로 재구성한다 → 시간축 bar 가 깨진다.
    const hasVisibleTimeBar = (charts.bar ?? []).some((id) => {
      const s = this.seriesList[id];
      return s?.show !== false && s?.timeMode;
    });
    if (hasVisibleTimeBar) {
      return { ok: false, reason: 'time-bar' };
    }

    // time(Date)·step(string) 축은 render.snapshot 의 extractSeriesData 가 좌표를 숫자로 정규화한다
    // (time→타임스탬프, step→Number). worker 는 메인과 동일 element 코드로 좌표를 재계산하므로
    // bit-identical. timeMode bar 만 위에서 차단한다.
    return { ok: true };
  }

  /**
   * worker 프레임(ImageBitmap) 도착 시 display 에 합성한다.
   * 순서: clear(display) → static(axis/grid, main buffer) → series bitmap(worker) → tip(series 위).
   * epoch 가 현재와 다르면 stale frame 으로 drop 하고 bitmap 을 즉시 close(메모리).
   * tip 은 series bitmap 위에 그려야 z-order 가 맞으므로 여기서 displayCtx 에 그린다(buffer 가 아닌).
   * tip 은 main 인스턴스가 그리므로 maxTip/selectItem formatter 등 콜백이 그대로 동작한다.
   *
   * @param {{epoch:number, bitmap:ImageBitmap}} msg
   * @returns {undefined}
   */
  commitWorkerFrame(msg) {
    const bitmap = msg?.bitmap;
    if (!bitmap) {
      return;
    }
    if (msg.epoch !== this.renderEpoch) {
      bitmap.close();
      return;
    }

    // commitToDisplay 가 display clear + static(buffer) blit 을 atomic 하게 수행 → series bitmap 합성.
    const ctx = this.displayCtx;
    this.commitToDisplay(ctx, this.bufferCanvas);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    // series bitmap 위에 tip(maxTip/selectItem/selectLabel). bufferCtx 는 setTransform(pixelRatio)가
    // 걸려 있지만 displayCtx 는 transform 이 없으므로(commitToDisplay 는 device-px blit) tip 좌표(CSS-px)가
    // 어긋나지 않도록 동일 transform 을 걸고 그린다.
    ctx.save();
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.drawTip(ctx);
    ctx.restore();
  }

  /**
   * worker 렌더 예외/사망 시 main series 래스터로 fallback 한다.
   * static 은 이미 main buffer 에 있으므로 series 만 그려 합성한다.
   *
   * render-error 로 들어온 경우(msg 있음) stale 에러(이미 더 새 프레임이 그려짐)면 fallback 하지 않는다 —
   * 그리지 않으면 현재 화면을 stale series 로 덮지 않는다. worker 사망(_fail, msg 없음)으로
   * 들어온 경우는 현재 프레임을 그려야 하므로 epoch 비교 없이 항상 그린다.
   *
   * @param {{epoch:number}} [msg]   render-error 메시지(worker 사망 fallback 시 미전달)
   * @returns {undefined}
   */
  drawSeriesLayerFallback(msg) {
    if (msg && msg.epoch !== this.renderEpoch) {
      return;
    }
    this.drawSeriesLayer(this.bufferCtx, undefined);
    this.commitToDisplay(this.displayCtx, this.bufferCanvas);
  }

  /**
   * Commit the rendered buffer canvas to the display canvas (buffer→display blit).
   * Render pipeline의 출력단 경계 — RenderCore 단계 호출이 canvas 핸들을 주입받아
   * 호출할 수 있도록 별도 함수로 추출. (Worker 경로에선 ImageBitmap blit으로 치환될 자리)
   * @param {CanvasRenderingContext2D} displayCtx   destination display context
   * @param {HTMLCanvasElement} bufferCanvas        source buffer canvas
   *
   * @returns {undefined}
   */
  commitToDisplay(displayCtx, bufferCanvas) {
    // clear+blit 를 present 시점에 atomic 하게 수행(clear() 가 더 이상 display 를 비우지 않음).
    if (this.displayCanvas) {
      const ratio = this.pixelRatio < 1 ? this.pixelRatio : 1;
      displayCtx.clearRect(
        0,
        0,
        this.displayCanvas.width / ratio,
        this.displayCanvas.height / ratio,
      );
    }
    if (bufferCanvas && bufferCanvas?.width > 1 && bufferCanvas?.height > 1) {
      displayCtx.drawImage(bufferCanvas, 0, 0);
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
      this.drawStaticLayer(this.bufferCtx, hitInfo);
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
          this.drawSeriesLayer(this.bufferCtx, hitInfo); // 레이어 사용 불가(치수 미확보 등) → 기존 직접 경로
          coordsRefreshed = true;
        }
      } else {
        this.drawSeriesLayer(this.bufferCtx, hitInfo);
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
   * Draw each series raster (RenderCore series 래스터 레이어).
   * 순수 series 래스터만 bufferCtx(주입형 핸들)에 그린다 — overlay(interaction 즉답)·tip(formatter
   * 실행/hit state mutate)은 이 경로에 포함하지 않는다(worker 후보). overlay는 drawSeriesOverlay,
   * tip은 drawTip이 main에서 별도 처리한다.
   * @param {CanvasRenderingContext2D} bufferCtx     destination buffer context (worker 경로에선 주입됨)
   * @param {any} [hitInfo=undefined]   legend mouseover callback (object or undefined)
   *
   * @returns {undefined}
   */
  /**
   * geometry(xp/yp/w/h) 가 의존하는 스케일 입력을 한 토큰으로 직렬화해 직전과 비교, 바뀌었으면
   * _scaleVersion 을 올린다. axesSteps 의 graphMin/graphMax 와 bar 배치 인자(thickness/cPadRatio/
   * borderRadius)·horizontal 까지 포함해야 stale 좌표를 막는다(누락 시 캐시가 옛 스케일로 고정).
   * O(축 개수) 비용(점 개수와 무관)이라 매 프레임 호출해도 싸다.
   * @returns {undefined}
   */
  computeScaleVersion() {
    const cr = this.chartRect ?? {};
    const lo = this.labelOffset ?? {};
    const opt = this.options ?? {};
    const xs = this.axesSteps?.x ?? [];
    const ys = this.axesSteps?.y ?? [];

    let key =
      `${cr.x1},${cr.x2},${cr.y1},${cr.y2},${cr.chartWidth},${cr.chartHeight}|`
      + `${lo.left},${lo.right},${lo.top},${lo.bottom}|`
      + `${this.pixelRatio}|${opt.horizontal ? 1 : 0}|`
      + `${opt.thickness},${opt.cPadRatio},${opt.borderRadius}|`;
    for (let i = 0; i < xs.length; i++) {
      const a = xs[i];
      key += `${a?.graphMin}:${a?.graphMax}:${a?.minIndex}:${a?.maxIndex}:${a?.oriSteps};`;
    }
    key += '|';
    for (let i = 0; i < ys.length; i++) {
      const a = ys[i];
      key += `${a?.graphMin}:${a?.graphMax}:${a?.minIndex}:${a?.maxIndex}:${a?.oriSteps};`;
    }

    if (key !== this._scaleKey) {
      this._scaleKey = key;
      this._scaleVersion = (this._scaleVersion ?? 0) + 1;
    }
  }

  /**
   * worker 래스터 경로용 main hit-test 기하 패스. 래스터(stroke/fill)는 worker 가 하지만
   * hit-test 가 읽는 픽셀 기하(xp/yp/w/h)는 main 모델에 있어야 하므로, 여기서 series.computeGeometry 만
   * 돌려 채운다(canvas 그리기 없음 — 싸다). worker 지원 타입(line/bar/heatMap)과 동일 타입만 처리한다.
   * @returns {undefined}
   */
  computeSeriesGeometry() {
    const opt = {
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      isHorizontal: this.options.horizontal,
      dataEpoch: this._dataEpoch,
      scaleVersion: this._scaleVersion,
    };

    let showSeriesCount = 0;
    this.seriesInfo.charts.bar.forEach((id) => {
      if (this.seriesList[id]?.show) {
        showSeriesCount++;
      }
    });

    ['line', 'heatMap'].forEach((chartType) => {
      this.seriesInfo.charts[chartType].forEach((id) => {
        this.seriesList[id]?.computeGeometry?.(opt);
      });
    });

    const { thickness, cPadRatio, borderRadius } = this.options;
    let showIndex = 0;
    this.seriesInfo.charts.bar.forEach((id) => {
      const series = this.seriesList[id];
      if (series) {
        series.computeGeometry?.({
          ...opt,
          thickness,
          cPadRatio,
          borderRadius,
          showSeriesCount,
          showIndex,
        });
        if (series.show) {
          showIndex++;
        }
      }
    });
  }

  drawSeriesLayer(bufferCtx, hitInfo, layerOptions = {}) {
    const {
      maxTip,
      selectLabel,
      selectItem,
      selectSeries,
      brush,
      displayOverflow,
      unSelectedOpacity,
    } = this.options;

    // noSelection: chart.selection 의 base 라스터용. selection/maxTip/selectItem 을 무력화해
    // 모든 시리즈를 정상 opacity 로 그린다(partial 렌더에서 흐리게 합성할 baseline).
    const noSel = layerOptions.noSelection === true;
    const emptySel = { seriesId: [], dataIndex: [] };

    const opt = {
      ctx: bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      maxTipOpt: { background: maxTip.background, color: maxTip.color },
      selectLabel: { option: selectLabel, selected: noSel ? emptySel : this.defaultSelectInfo },
      selectSeries: { option: selectSeries, selected: noSel ? emptySel : this.defaultSelectInfo },
      selectItem: { option: selectItem, selected: noSel ? {} : this.defaultSelectItemInfo },
      isBrush: !!brush,
      displayOverflow,
      unSelectedOpacity,
      isHorizontal: this.options.horizontal,
      dataEpoch: this._dataEpoch,
      scaleVersion: this._scaleVersion,
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

    // line cross-series 픽셀 dedupe(opt-in: coordinateDedupe). 마커가 불투명이라 같은 픽셀엔
    // 1개만 보이므로, 그리기 전에 owner(그리는 순서상 마지막 = 최상위 시리즈) 맵을 만들어 그
    // 시리즈만 마커를 그린다(출력 불변, 마커 fill/stroke 비용↓). scatter 의 duple owner 규칙과 동일하되
    // 키만 데이터좌표 → 픽셀좌표다. 기본 off 라 미설정 line 차트는 무회귀.
    let markerOwners = null;
    const lineSet = this.seriesInfo.charts.line;
    if (this.options.coordinateDedupe === true && lineSet?.length) {
      markerOwners = new Map();
      const lineParam = { legendHitInfo: hitInfo?.legend, ...opt };
      for (let jx = 0; jx < lineSet.length; jx++) {
        this.seriesList[lineSet[jx]].collectMarkerOwners(lineParam, markerOwners);
      }
    }

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
              markerOwners,
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
              this.drawSunburst(
                {
                  selectInfo,
                  legendHitInfo,
                  unSelectedOpacity: opt.unSelectedOpacity,
                },
                bufferCtx,
              );
            } else {
              this.drawPie(
                {
                  selectInfo,
                  legendHitInfo,
                  unSelectedOpacity: opt.unSelectedOpacity,
                },
                bufferCtx,
              );
            }

            if (this.options.doughnutHoleSize > 0) {
              this.drawDoughnutHole(bufferCtx);
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
   * Draw series highlight onto the overlay layer (main 전용 interaction 즉답 레이어).
   * 래스터(drawSeriesLayer, worker 후보)에서 분리해 main의 overlayCtx에만 그린다.
   * 현재 series 래스터 경로에서 overlay highlight를 쓰는 타입은 heatMap뿐이다(line/bar/scatter의
   * 선택/crosshair overlay는 interaction 플러그인이, pie highlight도 interaction 경로가 담당).
   * brush 차트는 overlayCanvas가 없어 overlayCtx가 없다 → 각 series.drawOverlay에서 no-op.
   *
   * @returns {undefined}
   */
  drawSeriesOverlay() {
    const overlayCtx = this.overlayCtx;
    if (!overlayCtx) {
      return;
    }

    const opt = {
      overlayCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
    };

    const heatMapSeries = this.seriesInfo.charts.heatMap;
    for (let ix = 0; ix < heatMapSeries.length; ix++) {
      this.seriesList[heatMapSeries[ix]]?.drawOverlay?.(opt);
    }
  }

  /**
   * Draw Tip with hitInfo and defaultSelectItemInfo
   * @param {CanvasRenderingContext2D} [ctx]  그릴 ctx. worker 경로(commitWorkerFrame)는 series bitmap
   *   위에 합성하려고 displayCtx 를 넘긴다(미전달 시 drawTips 가 main buffer 사용).
   */
  drawTip(ctx) {
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

    this.drawTips?.(tipLocationInfo, ctx);
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
   * Draw the static layer (axis/grid/base labels) into the injected buffer context
   * (RenderCore static 레이어 경계). drawSeriesLayer 와 동일하게 bufferCtx를
   * 주입받아 worker가 자체 OffscreenCanvas ctx로 축을 래스터할 수 있게 한다(main 경로에선
   * this.bufferCtx와 동일하므로 픽셀 변화 없음).
   *
   * 캐시 결정: full 경로는 **캐시 안 함** — drawAxis가 상호작용 상태(hitInfo·selectItem.showLabelTip,
   * scale.js:374-442)와 동적 rescale·plotLines를 같은 패스에서 소비해 안전한 캐시 키 범위가 너무 넓다.
   * 단 selectSeries 부분 렌더(chart.selection.js)는 그 상태가 게이트로 배제돼 static 이 프레임 간 불변
   * → 그 경로 한정으로 staticBaseCanvas 에 캐시 후 blit 한다.
   * @param {CanvasRenderingContext2D} bufferCtx   destination buffer context (worker 경로에선 주입됨)
   * @param {any} [hitInfo=undefined]   hit/hover information for axis interaction labels
   *
   * @returns {undefined}
   */
  drawStaticLayer(bufferCtx, hitInfo) {
    this.axesX.forEach((axis, index) => {
      axis.ctx = bufferCtx;
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
      axis.ctx = bufferCtx;
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
   * Compute the device pixel ratio (window.devicePixelRatio + display ctx backing store).
   * ChartShell 경계 — window/ctx DOM-property 를 읽으므로 RenderCore(prepareLayout)에 주입할
   * 값을 main 에서 계산한다. Worker 경로엔 window 가 없으므로 RenderCore 가 직접 읽지 않는다.
   *
   * @returns {number} device pixel ratio
   */
  computePixelRatio() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio ||
      1;

    return devicePixelRatio / backingStoreRatio;
  }

  /**
   * Prepare layout transform on the injected buffer ctx (RenderCore — DOM-free).
   * pixelRatio 는 ChartShell(computePixelRatio)이 주입한다. buffer ctx 의 transform 만 소유하며
   * overlay ctx 의 transform 은 main(ChartShell) 소유이므로 여기서 건드리지 않는다.
   * @param {number} pixelRatio    injected device pixel ratio
   *
   * @returns {undefined}
   */
  prepareLayout(pixelRatio) {
    this.pixelRatio = pixelRatio;

    if (this.oldPixelRatio !== this.pixelRatio) {
      this.oldPixelRatio = this.pixelRatio;
    }

    // 누적형 scale() 대신 절대 변환(setTransform)을 사용해 idempotent하게 만든다.
    // 이렇게 하면 매 update마다 canvas.width 재대입(트랜스폼 리셋)에 의존하지 않아도 되어
    // setWidth/setHeight에서 크기 변경이 없을 때 비트맵 재할당을 건너뛸 수 있다.
    this.bufferCtx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  /**
   * Reset devicePixelRatio for high DPI (ChartShell layout entry — resize 등에서 직접 사용).
   * device pixel ratio 를 읽어 RenderCore(prepareLayout)에 주입하고, main 소유인
   * overlay ctx transform 을 함께 적용한다.
   *
   * @returns {undefined}
   */
  initScale() {
    const pixelRatio = this.computePixelRatio();

    this.prepareLayout(pixelRatio);

    if (this.overlayCtx) {
      this.overlayCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
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

    // selectSeries 부분 렌더 base(series/static) 도 동일하게 치수 변경 시에만 재할당하고 baseline 을 무효화한다.
    if (this.seriesBaseCanvas) {
      const dw = Math.floor(width * this.pixelRatio);
      if (this.seriesBaseCanvas.width !== dw) {
        this.seriesBaseCanvas.width = dw;
        this._seriesBaseBuilt = false;
      }
    }
    if (this.staticBaseCanvas) {
      const dw = Math.floor(width * this.pixelRatio);
      if (this.staticBaseCanvas.width !== dw) {
        this.staticBaseCanvas.width = dw;
        this._staticBaseBuilt = false;
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

    if (this.seriesBaseCanvas) {
      const dh = Math.floor(height * this.pixelRatio);
      if (this.seriesBaseCanvas.height !== dh) {
        this.seriesBaseCanvas.height = dh;
        this._seriesBaseBuilt = false;
      }
    }
    if (this.staticBaseCanvas) {
      const dh = Math.floor(height * this.pixelRatio);
      if (this.staticBaseCanvas.height !== dh) {
        this.staticBaseCanvas.height = dh;
        this._staticBaseBuilt = false;
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
      // 직전 인스턴스를 보관해 reconcileSeriesSet 이 변경분만 add/recreate 하고 나머지는 재사용한다
      // (점객체 풀 + geometry 메모이즈 보존). seriesInfo.charts 인덱스만 매번 새로 만든다.
      const prevSeriesList = this.seriesList;

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
      this.lastTip = { pos: null, value: null };

      this.reconcileSeriesSet(series, options.type, options.horizontal, groups, prevSeriesList);

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
    // display 는 여기서 비우지 않는다 — commit 시점(commitToDisplay/commitWorkerFrame)에 clear+blit 한다.
    // worker 경로는 series 를 비동기로 합성하므로, 미리 display 를 비우면 프레임 도착 전까지 blank 가 되고
    // (epoch drop 시 영구) "그려졌다 사라진다" 가 된다. 이전 프레임을 새 프레임 준비 시점까지 유지한다.
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
    // resize 는 캔버스를 막 리사이즈해 display 가 비워진 상태 → worker 비동기 합성을 기다리면 깜빡인다.
    // 이 프레임은 main 으로 동기 렌더한다(steady-state tick 은 계속 worker 사용).
    this.drawChart(undefined, true);
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
      // selectSeries 강조만 바뀐 프레임은 전체 재렌더 대신 base(정상 series)를 흐리게 합성하고
      // 선택 시리즈만 진하게 redraw 한다. 게이트(base fresh·hover/legend 없음·지원 타입 등) 미충족 시
      // 아래 full redraw 로 폴백한다(무회귀).
      if (this.canPartialSelectionRender(hitInfo)) {
        this.drawSelectionPartial(hitInfo);
        return;
      }
      this.clear();
      this.chartRect = this.getChartRect();
      this.drawChart(hitInfo);
      // full redraw 후 base 라스터를 최신화한다(다음 selection 프레임의 partial 진입 조건).
      this.maybeRebuildSeriesBase();
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

    if (this.renderWorkerGate) {
      this.renderWorkerGate.destroy();
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

// realtime scatter blit fast-path 메서드(chart.blit.js)를 합친다. 단위 테스트
// (chart.core.blitGate.spec.js)가 Object.create(EvChart.prototype) 로 인스턴스 없이 메서드를
// 호출하므로, 다른 plugin mixin 처럼 this(인스턴스)가 아니라 prototype 에 합쳐야 한다.
Object.assign(EvChart.prototype, Blit);
// selectSeries 강조 부분 렌더 메서드(chart.selection.js)를 prototype 에 합친다(Blit 과 동일 이유).
Object.assign(EvChart.prototype, Selection);

export default EvChart;
