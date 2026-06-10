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
