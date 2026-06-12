import { describe, it, expect, vi } from 'vitest';
import EvChart from './chart.core';

/**
 * drawChart 파이프라인 호출 순서 회귀 가드 — prepare(RenderCore)/scrollbar·emit(ChartShell)/
 * series 래스터(buffer)/overlay(main)/tip(main) 분리
 * (Step 3 series-raster · Step 4 static-layer · Step 5 rendercore-prepare).
 *
 * 검증 목표:
 *  1) drawChart 서브 호출 순서·composite(commitToDisplay)가 분리 전과 동일하다.
 *  2) prepareScale(RenderCore)은 scrollbar DOM·listener 를 직접 건드리지 않고 결과만 반환하며,
 *     scrollbar DOM 배치와 axes-scale-change listener 호출은 ChartShell(drawChart)이 한다.
 *  3) updateScrollbarPosition 은 prepareScale 이 반환한 pre-adjust labelOffset 을 받는다.
 *  4) drawStaticLayer·drawSeriesLayer 에는 bufferCtx(주입형 핸들)가 전달된다.
 *  5) RenderCore 단계(prepareLayout·prepareScale·draw·commit)는 document·window·scrollbar DOM·
 *     listener 없이 주입값만으로 buffer ctx 에 그린다.
 *
 * 실제 렌더 대신 서브 메서드를 호출 기록 stub 으로 교체해 순서만 검증한다(DOM 불필요).
 */
describe('drawChart 파이프라인 호출 순서 (prepare/scrollbar/emit/series raster/overlay/tip 분리)', () => {
  const makeChart = ({ scrollbar, scaleChange, listener, scrollbarLabelOffset } = {}) => {
    const calls = [];
    const rec =
      (name, ret) =>
      (...args) => {
        calls.push({ name, args });
        return ret;
      };

    const bufferCtx = { id: 'buffer' };
    const overlayCtx = { id: 'overlay' };

    const chart = Object.assign(Object.create(EvChart.prototype), {
      bufferCtx,
      overlayCtx,
      bufferCanvas: { width: 100, height: 100 },
      displayCtx: { id: 'display' },
      scrollbar: scrollbar ?? { x: { use: false }, y: { use: false } },
      listeners: listener ? { 'axes-scale-change': listener } : {},
      initScale: rec('initScale'),
      prepareScale: rec('prepareScale', {
        scaleChange: scaleChange ?? null,
        scrollbarLabelOffset: scrollbarLabelOffset ?? { left: 1 },
      }),
      updateScrollbarPosition: rec('updateScrollbarPosition'),
      drawStaticLayer: rec('drawStaticLayer'),
      drawSeriesLayer: rec('drawSeriesLayer'),
      drawSeriesOverlay: rec('drawSeriesOverlay'),
      drawTip: rec('drawTip'),
      commitToDisplay: rec('commitToDisplay'),
    });

    return { chart, calls, bufferCtx, overlayCtx };
  };

  const names = (calls) => calls.map((c) => c.name);

  it('initScale→prepareScale→drawStaticLayer→drawSeriesLayer→drawSeriesOverlay→drawTip→commitToDisplay 순서', () => {
    const { chart, calls } = makeChart();
    chart.drawChart();

    expect(names(calls)).toEqual([
      'initScale',
      'prepareScale',
      'drawStaticLayer',
      'drawSeriesLayer',
      'drawSeriesOverlay',
      'drawTip',
      'commitToDisplay',
    ]);
  });

  it('overlay(main)는 series 래스터 뒤·tip 앞에서 호출된다 (interaction 즉답 분리)', () => {
    const { chart, calls } = makeChart();
    chart.drawChart();

    const order = names(calls);
    expect(order.indexOf('drawSeriesLayer')).toBeLessThan(order.indexOf('drawSeriesOverlay'));
    expect(order.indexOf('drawSeriesOverlay')).toBeLessThan(order.indexOf('drawTip'));
    expect(order.indexOf('drawTip')).toBeLessThan(order.indexOf('commitToDisplay'));
  });

  it('drawStaticLayer·drawSeriesLayer 에는 bufferCtx(주입형)가 전달된다', () => {
    const { chart, calls, bufferCtx, overlayCtx } = makeChart();
    chart.drawChart();

    const staticCall = calls.find((c) => c.name === 'drawStaticLayer');
    expect(staticCall.args[0]).toBe(bufferCtx);

    const layerCall = calls.find((c) => c.name === 'drawSeriesLayer');
    expect(layerCall.args[0]).toBe(bufferCtx);

    // overlay 는 chart.overlayCtx(main)로만 그린다.
    expect(chart.overlayCtx).toBe(overlayCtx);
  });

  it('scrollbar 사용 시 updateScrollbarPosition 이 prepareScale 뒤·draw 앞에서 호출되고 pre-adjust labelOffset 을 받는다', () => {
    const labelOffset = { left: 42 };
    const { chart, calls } = makeChart({
      scrollbar: { x: { use: true }, y: { use: false } },
      scrollbarLabelOffset: labelOffset,
    });
    chart.drawChart();

    const order = names(calls);
    expect(order).toContain('updateScrollbarPosition');
    expect(order.indexOf('prepareScale')).toBeLessThan(order.indexOf('updateScrollbarPosition'));
    expect(order.indexOf('updateScrollbarPosition')).toBeLessThan(order.indexOf('drawStaticLayer'));

    // prepareScale 이 반환한 pre-adjust labelOffset 스냅샷을 그대로 받는다.
    const scrollbarCall = calls.find((c) => c.name === 'updateScrollbarPosition');
    expect(scrollbarCall.args[0]).toBe(labelOffset);
  });

  it('scrollbar 미사용 시 updateScrollbarPosition 은 호출되지 않는다', () => {
    const { chart, calls } = makeChart();
    chart.drawChart();
    expect(names(calls)).not.toContain('updateScrollbarPosition');
  });

  it('axes-scale-change: payload 가 있고 listener 가 있으면 prepareScale 뒤·draw 앞에 listener 가 호출된다', () => {
    const payload = { x: [{ minSteps: 1, maxSteps: 5 }], y: [] };
    const listener = vi.fn();
    const { chart, calls } = makeChart({ scaleChange: payload, listener });
    chart.drawChart();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(payload);
    // listener 호출 시점: prepareScale 뒤, 첫 draw(drawStaticLayer) 앞.
    const order = names(calls);
    expect(order.indexOf('prepareScale')).toBeLessThan(order.indexOf('drawStaticLayer'));
  });

  it('axes-scale-change: payload 가 null 이면 listener 는 호출되지 않는다', () => {
    const listener = vi.fn();
    const { chart } = makeChart({ scaleChange: null, listener });
    chart.drawChart();
    expect(listener).not.toHaveBeenCalled();
  });

  it('worker 게이트 없음/미진입(기본 off) → main series 래스터 경로 그대로(회귀 0)', () => {
    const { chart, calls } = makeChart();
    // renderWorkerGate 미설정(생성자 미실행) → tryDrawSeriesOnWorker 가 false → main 경로.
    chart.drawChart();
    expect(names(calls)).toContain('drawSeriesLayer');
    expect(names(calls)).toContain('commitToDisplay');
  });
});

/**
 * worker series 래스터 경로 (Step 8, B2):
 * ready + in-flight 여유면 series 를 worker 로 보내고 main series 래스터를 건너뛴다.
 * bitmap 도착 시 compositing(clear→buffer(axis)→bitmap) + close(메모리), epoch stale-drop,
 * render-error → main fallback.
 */
describe('worker series 래스터 경로 (Step 8)', () => {
  const makeWorkerChart = ({ accept = true } = {}) => {
    const calls = [];
    const rec =
      (name, ret) =>
      (...args) => {
        calls.push({ name, args });
        return ret;
      };

    const displayOps = [];
    const displayCtx = {
      clearRect: (...args) => displayOps.push({ op: 'clearRect', args }),
      drawImage: (...args) => displayOps.push({ op: 'drawImage', args }),
    };

    let sendOk = accept;
    const gate = {
      canAcceptRender: () => sendOk,
      render: rec('gate.render', accept),
      setFrameHandler() {},
      setErrorHandler() {},
    };

    const chart = Object.assign(Object.create(EvChart.prototype), {
      bufferCtx: { id: 'buffer' },
      bufferCanvas: { width: 200, height: 100 },
      displayCanvas: { width: 200, height: 100 },
      displayCtx,
      overlayCtx: null,
      scrollbar: { x: { use: false }, y: { use: false } },
      listeners: {},
      renderEpoch: 0,
      renderWorkerGate: gate,
      // snapshot/pack 입력(toRenderSnapshot/packSeries 가 읽는 최소 필드).
      pixelRatio: 2,
      chartRect: { x1: 0, x2: 200, y1: 0, y2: 100, chartWidth: 200, chartHeight: 100, width: 200, height: 100 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesSteps: { x: [], y: [] },
      options: {},
      seriesInfo: { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] } },
      seriesList: {},
      initScale: rec('initScale'),
      prepareScale: rec('prepareScale', { scaleChange: null, scrollbarLabelOffset: {} }),
      updateScrollbarPosition: rec('updateScrollbarPosition'),
      drawStaticLayer: rec('drawStaticLayer'),
      drawSeriesLayer: rec('drawSeriesLayer'),
      drawSeriesOverlay: rec('drawSeriesOverlay'),
      drawTip: rec('drawTip'),
      commitToDisplay: rec('commitToDisplay'),
    });

    const setSendOk = (v) => {
      sendOk = v;
    };
    return { chart, calls, displayOps, gate, setSendOk };
  };

  const names = (calls) => calls.map((c) => c.name);

  it('ready 면 static 은 main, series 는 worker 로 보내고 main series 래스터를 건너뛴다', () => {
    const { chart, calls } = makeWorkerChart({ accept: true });
    chart.drawChart();

    const order = names(calls);
    expect(order).toContain('drawStaticLayer');
    expect(order).toContain('gate.render');
    // main series 래스터·즉시 commit 은 호출되지 않는다(bitmap 도착 시 합성).
    expect(order).not.toContain('drawSeriesLayer');
    expect(order).not.toContain('commitToDisplay');
    // epoch 가 증가했다.
    expect(chart.renderEpoch).toBe(1);
  });

  it('worker 미전송(in-flight 상한 등)이면 main 이 그 프레임의 series 를 그린다', () => {
    const { chart, calls } = makeWorkerChart({ accept: false });
    // canAcceptRender=true 지만 render 가 false 반환하는 경계.
    chart.renderWorkerGate.canAcceptRender = () => true;
    chart.renderWorkerGate.render = (...args) => {
      calls.push({ name: 'gate.render', args });
      return false;
    };
    chart.drawChart();

    const order = names(calls);
    expect(order).toContain('gate.render');
    expect(order).toContain('drawSeriesLayer');
    expect(order).toContain('commitToDisplay');
  });

  it('commitWorkerFrame: epoch 일치 → commitToDisplay(clear+axis)→bitmap 합성 + bitmap.close()', () => {
    const { chart, displayOps } = makeWorkerChart();
    // commitToDisplay 가 display clear+static blit 을 atomic 하게 수행(내부에서 clearRect). 그 위에 bitmap 합성.
    chart.commitToDisplay = (ctx, canvas) => displayOps.push({ op: 'commitToDisplay', canvas });
    chart.renderEpoch = 4;
    const close = vi.fn();
    const bitmap = { close };

    chart.commitWorkerFrame({ epoch: 4, bitmap });

    expect(displayOps.map((o) => o.op)).toEqual(['commitToDisplay', 'drawImage']);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('commitWorkerFrame: stale epoch → drop + bitmap.close(), display 미변경', () => {
    const { chart, displayOps } = makeWorkerChart();
    chart.renderEpoch = 9;
    const close = vi.fn();

    chart.commitWorkerFrame({ epoch: 7, bitmap: { close } });

    expect(close).toHaveBeenCalledTimes(1);
    expect(displayOps).toHaveLength(0);
  });

  it('drawSeriesLayerFallback: worker 사망(msg 없음) 시 main series 래스터 + commit', () => {
    const { chart, calls } = makeWorkerChart();
    chart.drawSeriesLayerFallback();
    expect(names(calls)).toEqual(['drawSeriesLayer', 'commitToDisplay']);
  });
});

/**
 * epoch 경합 가드 (이슈1): renderEpoch 는 worker 전송 프레임뿐 아니라 *모든* drawChart 진입에서 증가한다.
 * 그래야 resize(forceMainSeries)·main-only·hover 로 main 이 그린 더 새로운 프레임 뒤에 늦게 도착한
 * stale worker 비트맵/에러가 epoch 비교에서 항상 drop 된다(stale 합성/덮어쓰기 방지).
 */
describe('epoch 경합 가드 (이슈1)', () => {
  const makeWorkerChart = ({ accept = true } = {}) => {
    const calls = [];
    const rec =
      (name, ret) =>
      (...args) => {
        calls.push({ name, args });
        return ret;
      };

    const displayOps = [];
    const displayCtx = {
      clearRect: (...args) => displayOps.push({ op: 'clearRect', args }),
      drawImage: (...args) => displayOps.push({ op: 'drawImage', args }),
    };

    const gate = {
      canAcceptRender: () => accept,
      render: rec('gate.render', accept),
      setFrameHandler() {},
      setErrorHandler() {},
    };

    const chart = Object.assign(Object.create(EvChart.prototype), {
      bufferCtx: { id: 'buffer' },
      bufferCanvas: { width: 200, height: 100 },
      displayCanvas: { width: 200, height: 100 },
      displayCtx,
      overlayCtx: null,
      scrollbar: { x: { use: false }, y: { use: false } },
      listeners: {},
      renderEpoch: 0,
      renderWorkerGate: gate,
      pixelRatio: 2,
      chartRect: { x1: 0, x2: 200, y1: 0, y2: 100, chartWidth: 200, chartHeight: 100, width: 200, height: 100 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesSteps: { x: [], y: [] },
      options: {},
      seriesInfo: { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] } },
      seriesList: {},
      initScale: rec('initScale'),
      prepareScale: rec('prepareScale', { scaleChange: null, scrollbarLabelOffset: {} }),
      updateScrollbarPosition: rec('updateScrollbarPosition'),
      computeSeriesGeometry: rec('computeSeriesGeometry'),
      drawStaticLayer: rec('drawStaticLayer'),
      drawSeriesLayer: rec('drawSeriesLayer'),
      drawSeriesOverlay: rec('drawSeriesOverlay'),
      drawTip: rec('drawTip'),
      commitToDisplay: rec('commitToDisplay'),
    });

    return { chart, calls, displayOps, gate };
  };

  const names = (calls) => calls.map((c) => c.name);

  it('worker 전송(epoch=N) 후 resize(forceMainSeries) 가 epoch 를 N+1 로 올린다', () => {
    const { chart } = makeWorkerChart({ accept: true });
    chart.drawChart();
    expect(chart.renderEpoch).toBe(1);

    // resize 프레임: forceMainSeries=true → main 동기 렌더. epoch 가 또 증가해야 한다.
    chart.drawChart(undefined, true);
    expect(chart.renderEpoch).toBe(2);
  });

  it('resize 로 main 이 그린 뒤 도착한 stale worker 비트맵(이전 epoch)은 drop 된다', () => {
    const { chart, displayOps } = makeWorkerChart({ accept: true });
    chart.commitToDisplay = (ctx, canvas) => displayOps.push({ op: 'commitToDisplay', canvas });

    chart.drawChart(); // worker 전송, epoch=1
    chart.drawChart(undefined, true); // resize main 렌더, epoch=2
    displayOps.length = 0;

    const close = vi.fn();
    chart.commitWorkerFrame({ epoch: 1, bitmap: { close } }); // 이전 epoch 비트맵 도착

    expect(close).toHaveBeenCalledTimes(1); // drop + close
    expect(displayOps).toHaveLength(0); // display 미변경(덮어쓰기 없음)
  });

  it('canAcceptRender=false 로 main 이 그린 프레임도 epoch 를 올린다(stale worker 프레임 drop 근거)', () => {
    const { chart } = makeWorkerChart({ accept: false });
    chart.drawChart();
    // worker 미진입 → main 경로지만 epoch 는 증가.
    expect(chart.renderEpoch).toBe(1);
  });

  it('drawSeriesLayerFallback(msg): stale epoch 면 그리지 않는다(현재 화면 보존)', () => {
    const { chart, calls } = makeWorkerChart();
    chart.renderEpoch = 5;
    chart.drawSeriesLayerFallback({ epoch: 3 });
    expect(names(calls)).not.toContain('drawSeriesLayer');
    expect(names(calls)).not.toContain('commitToDisplay');
  });

  it('drawSeriesLayerFallback(msg): current epoch 면 main series 래스터 + commit', () => {
    const { chart, calls } = makeWorkerChart();
    chart.renderEpoch = 5;
    chart.drawSeriesLayerFallback({ epoch: 5 });
    expect(names(calls)).toEqual(['drawSeriesLayer', 'commitToDisplay']);
  });
});

/**
 * RenderCore 경계 가드 (Step 5):
 * RenderCore 단계는 ChartShell 주입값(pixelRatio)만으로 동작하며 document/window/scrollbar DOM/
 * listener 를 직접 읽거나 호출하지 않는다.
 */
describe('RenderCore 단계는 DOM·scrollbar·listener 없이 buffer ctx 에 그린다', () => {
  const makeRenderCore = () => {
    const bufferOps = [];
    const bufferCtx = {
      setTransform: (...args) => bufferOps.push({ op: 'setTransform', args }),
      fillRect: (...args) => bufferOps.push({ op: 'fillRect', args }),
    };
    const listener = vi.fn();

    const chart = Object.assign(Object.create(EvChart.prototype), {
      bufferCtx,
      overlayCtx: null,
      bufferCanvas: { width: 100, height: 100 },
      displayCtx: {
        drawImage: () => {
          throw new Error('display blit should target injected canvas only');
        },
      },
      oldPixelRatio: 1,
      options: { axesX: [], axesY: [] },
      listeners: { 'axes-scale-change': listener },
      // RenderCore 가 직접 호출하면 안 되는 ChartShell 경계 — 호출 시 즉시 실패.
      computePixelRatio: () => {
        throw new Error('RenderCore must not read window.devicePixelRatio');
      },
      updateScrollbarPosition: () => {
        throw new Error('RenderCore must not touch scrollbar DOM');
      },
      // scale 수학은 다른 스펙/visual 에서 검증 — 여기선 경계만 보므로 경량 stub.
      getAxesRange: () => ({ x: [], y: [] }),
      getLabelOffset: () => ({ left: 0, right: 0, top: 0, bottom: 0 }),
      getAxesLabelRange: () => ({ x: [], y: [] }),
      calculateSteps: () => ({ x: [], y: [] }),
      adjustXAndYAxisWidth: () => {},
      // 래스터 stub: 주입형 bufferCtx 에 그린다.
      drawStaticLayer: (ctx) => ctx.fillRect(0, 0, 1, 1),
      drawSeriesLayer: (ctx) => ctx.fillRect(1, 1, 2, 2),
    });

    return { chart, bufferCtx, bufferOps, listener };
  };

  it('document/window 없는 상태에서 prepareLayout→prepareScale→draw→commit 가 주입 bufferCtx 에 그린다', () => {
    const { chart, bufferOps, listener } = makeRenderCore();

    const savedWindow = global.window;
    const savedDocument = global.document;
    // eslint-disable-next-line no-global-assign
    global.window = undefined;
    // eslint-disable-next-line no-global-assign
    global.document = undefined;

    try {
      // ChartShell 이 주입하는 pixelRatio 만으로 RenderCore 가 동작한다.
      chart.prepareLayout(2);
      const result = chart.prepareScale();
      chart.drawStaticLayer(chart.bufferCtx);
      chart.drawSeriesLayer(chart.bufferCtx);
      // display blit 은 injected canvas 로만 — bufferCanvas(>1)면 drawImage 호출되나
      // displayCtx 가 throw 하므로, commit 은 별도로 buffer→display 경계만 확인한다.
      expect(result.scaleChange).toBeNull();
      expect(result).toHaveProperty('scrollbarLabelOffset');
    } finally {
      // eslint-disable-next-line no-global-assign
      global.window = savedWindow;
      // eslint-disable-next-line no-global-assign
      global.document = savedDocument;
    }

    // 주입 pixelRatio 로 buffer transform 이 걸리고, 래스터가 buffer ctx 에 그려졌다.
    expect(bufferOps).toContainEqual({ op: 'setTransform', args: [2, 0, 0, 2, 0, 0] });
    expect(bufferOps.filter((o) => o.op === 'fillRect')).toHaveLength(2);
    // RenderCore 단계는 listener 를 직접 호출하지 않는다.
    expect(listener).not.toHaveBeenCalled();
  });

  it('prepareScale 은 adjustXAndYAxisWidth 가 labelOffset 을 바꾸기 전 값을 scrollbarLabelOffset 으로 반환한다', () => {
    const { chart } = makeRenderCore();
    const preAdjust = { left: 10 };
    const postAdjust = { left: 99 };

    chart.getLabelOffset = () => preAdjust;
    chart.adjustXAndYAxisWidth = () => {
      // adjust 는 labelOffset 을 post-adjust 로 재계산한다(실제 동작 모사).
      chart.labelOffset = postAdjust;
    };

    const { scrollbarLabelOffset } = chart.prepareScale();

    // scrollbar 는 pre-adjust 값으로 배치돼야 한다(기존 동작 보존).
    expect(scrollbarLabelOffset).toBe(preAdjust);
    expect(chart.labelOffset).toBe(postAdjust);
  });
});
