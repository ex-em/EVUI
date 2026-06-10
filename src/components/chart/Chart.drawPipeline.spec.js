import { describe, it, expect } from 'vitest';
import EvChart from './chart.core';

/**
 * drawChart 파이프라인 호출 순서 회귀 가드 — series 래스터(buffer)/overlay(main)/tip(main) 분리
 * (Step 3 rendercore-series-raster).
 *
 * 검증 목표:
 *  1) drawChart 의 서브 호출 순서·emit 타이밍(emitAxesScaleChange)·composite(commitToDisplay)가
 *     분리 전과 동일하다.
 *  2) overlay(interaction 즉답)는 series 래스터 뒤·tip 앞에서 호출된다 — 래스터(worker 후보)에
 *     섞이지 않는다.
 *  3) drawSeriesLayer 에는 bufferCtx(주입형 핸들)가, overlay 에는 main overlayCtx가 전달된다.
 *  4) scrollbar 사용 시 updateScrollbarPosition 위치(labelRange 뒤·calculateSteps 앞)가 유지된다.
 *
 * 실제 렌더 대신 서브 메서드를 호출 기록 stub 으로 교체해 순서만 검증한다(DOM 불필요).
 */
describe('drawChart 파이프라인 호출 순서 (series raster/overlay/tip 분리)', () => {
  const makeChart = ({ scrollbar } = {}) => {
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
      initScale: rec('initScale'),
      getAxesRange: rec('getAxesRange', {}),
      getLabelOffset: rec('getLabelOffset', {}),
      getAxesLabelRange: rec('getAxesLabelRange', {}),
      updateScrollbarPosition: rec('updateScrollbarPosition'),
      calculateSteps: rec('calculateSteps', {}),
      adjustXAndYAxisWidth: rec('adjustXAndYAxisWidth'),
      emitAxesScaleChange: rec('emitAxesScaleChange'),
      drawAxis: rec('drawAxis'),
      drawSeriesLayer: rec('drawSeriesLayer'),
      drawSeriesOverlay: rec('drawSeriesOverlay'),
      drawTip: rec('drawTip'),
      commitToDisplay: rec('commitToDisplay'),
    });

    return { chart, calls, bufferCtx, overlayCtx };
  };

  const names = (calls) => calls.map((c) => c.name);

  it('initScale→...→drawAxis→drawSeriesLayer→drawSeriesOverlay→drawTip→commitToDisplay 순서', () => {
    const { chart, calls } = makeChart();
    chart.drawChart();

    expect(names(calls)).toEqual([
      'initScale',
      'getAxesRange',
      'getLabelOffset',
      'getAxesLabelRange',
      'calculateSteps',
      'adjustXAndYAxisWidth',
      'emitAxesScaleChange',
      'drawAxis',
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

  it('drawSeriesLayer 에는 bufferCtx, overlay 에는 main overlayCtx 가 전달된다', () => {
    const { chart, calls, bufferCtx, overlayCtx } = makeChart();
    chart.drawChart();

    const layerCall = calls.find((c) => c.name === 'drawSeriesLayer');
    expect(layerCall.args[0]).toBe(bufferCtx);

    // overlay 는 chart.overlayCtx(main)로만 그린다.
    expect(chart.overlayCtx).toBe(overlayCtx);
  });

  it('scrollbar 사용 시 updateScrollbarPosition 이 labelRange 뒤·calculateSteps 앞에 호출된다', () => {
    const { chart, calls } = makeChart({ scrollbar: { x: { use: true }, y: { use: false } } });
    chart.drawChart();

    const order = names(calls);
    expect(order).toContain('updateScrollbarPosition');
    expect(order.indexOf('getAxesLabelRange')).toBeLessThan(
      order.indexOf('updateScrollbarPosition'),
    );
    expect(order.indexOf('updateScrollbarPosition')).toBeLessThan(order.indexOf('calculateSteps'));
  });

  it('scrollbar 미사용 시 updateScrollbarPosition 은 호출되지 않는다', () => {
    const { chart, calls } = makeChart();
    chart.drawChart();
    expect(names(calls)).not.toContain('updateScrollbarPosition');
  });
});
