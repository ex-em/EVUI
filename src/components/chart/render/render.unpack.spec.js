import { describe, it, expect, vi } from 'vitest';
import { rasterSeries } from './render.unpack';

/**
 * worker rasterSeries 가 snapshot.selection 을 element.draw 의 {option, selected} 계약으로
 * 재구성하는지(= drawSeriesLayer 와 동형) 가드한다. inertSelect 고정 제거 회귀 방지.
 */
describe('render.unpack rasterSeries — selection 반영', () => {
  const makeSnapshot = (selection) => ({
    options: { horizontal: false },
    seriesOrder: { line: ['L1'], bar: [], heatMap: [] },
    chartRect: {},
    labelOffset: {},
    axesSteps: { x: [], y: [] },
    ...(selection ? { selection } : {}),
  });

  it('snapshot.selection 을 element.draw 에 {option, selected} 로 전달', () => {
    const draw = vi.fn();
    const snapshot = makeSnapshot({
      selectSeries: { use: true, selected: { seriesId: ['L1'] } },
      selectItem: {
        use: false, useSeriesOpacity: false, showBorder: true, borderStyle: { lineWidth: 2 }, selected: null,
      },
      selectLabel: {
        use: true, useSeriesOpacity: true, useBothAxis: false,
        selected: { dataIndex: [2], label: [], targetAxis: null },
      },
    });
    rasterSeries(snapshot, { L1: { show: true, draw } }, {});

    const param = draw.mock.calls[0][0];
    expect(param.selectSeries).toEqual({ option: { use: true }, selected: { seriesId: ['L1'] } });
    expect(param.selectLabel).toEqual({
      option: { use: true, useSeriesOpacity: true, useBothAxis: false },
      selected: { dataIndex: [2], label: [], targetAxis: null },
    });
    expect(param.selectItem).toEqual({
      option: { use: false, useSeriesOpacity: false, showBorder: true, borderStyle: { lineWidth: 2 } },
      selected: null,
    });
  });

  it('selection 없으면 use:false → normal 렌더(회귀)', () => {
    const draw = vi.fn();
    rasterSeries(makeSnapshot(null), { L1: { show: true, draw } }, {});

    const param = draw.mock.calls[0][0];
    expect(param.selectSeries.option.use).toBe(false);
    expect(param.selectItem.option.use).toBe(false);
    expect(param.selectLabel.option.use).toBe(false);
  });
});
