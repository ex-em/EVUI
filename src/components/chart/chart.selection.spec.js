import { describe, it, expect } from 'vitest';
import EvChart from './chart.core';

/**
 * selectSeries 강조 부분 렌더(buffer-blit, chart.selection.js) 검증.
 *
 * 목표:
 *  1) canPartialSelectionRender 게이트: selection-only 프레임만 partial 허용, 나머지는 full 폴백.
 *  2) render 라우팅: 게이트 통과 시 drawSelectionPartial(전체 drawChart 미호출), 미충족 시 full + base 갱신.
 *  3) drawSelectionPartial 호출 순서/대상(흐린 base 합성 → 선택 시리즈만 redraw).
 *  4) rebuildSeriesBase 계약: noSelection 으로 seriesBaseCtx 에 그리고 무효화 키 기록.
 *
 * 실제 렌더 대신 서브 메서드를 호출 기록 stub 으로 교체해 계약만 검증한다(DOM 불필요).
 */
const rec =
  (calls, name, ret) =>
  (...args) => {
    calls.push({ name, args });
    return ret;
  };

const makeSelChart = (overrides = {}) => {
  const calls = [];
  const baseOptions = {
    selectSeries: { use: true },
    selectItem: { use: false },
    selectLabel: { use: false },
    maxTip: { background: '#000', color: '#fff' },
    unSelectedOpacity: 0.3,
    horizontal: false,
    brush: false,
  };
  const options = { ...baseOptions, ...(overrides.options ?? {}) };
  delete overrides.options;

  const ctxStub = () => ({
    setTransform() {},
    clearRect() {},
    drawImage() {},
    save() {},
    restore() {},
    globalAlpha: 1,
  });

  const chart = Object.assign(Object.create(EvChart.prototype), {
    options,
    seriesInfo: { charts: { pie: [], bar: [], line: ['l1'], scatter: [], heatMap: [] } },
    seriesList: { l1: { type: 'line', show: true, fill: false, isExistGrp: false, draw: rec(calls, 'series.draw') } },
    defaultSelectInfo: { seriesId: ['l1'] },
    defaultSelectItemInfo: null,
    bufferCanvas: { width: 200, height: 100 },
    seriesBaseCanvas: { width: 200, height: 100 },
    seriesBaseCtx: ctxStub(),
    bufferCtx: ctxStub(),
    displayCtx: { id: 'display' },
    pixelRatio: 2,
    chartRect: { x1: 0, x2: 200, chartWidth: 200, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [], y: [] },
    isInit: true,
    _seriesBaseBuilt: true,
    _dataEpoch: 1,
    _baseDataEpoch: 1,
    _scaleVersion: 1,
    _baseScaleVersion: 1,
    scrollbar: { x: { use: false }, y: { use: false } },
    lastHitInfo: null,
    legendHover: null,
    // 라우팅/순서용 stub
    clear: rec(calls, 'clear'),
    drawStaticLayer: rec(calls, 'drawStaticLayer'),
    drawSeriesOverlay: rec(calls, 'drawSeriesOverlay'),
    drawTip: rec(calls, 'drawTip'),
    commitToDisplay: rec(calls, 'commitToDisplay'),
    drawSeriesLayer: rec(calls, 'drawSeriesLayer'),
    drawChart: rec(calls, 'drawChart'),
    getChartRect: rec(calls, 'getChartRect', {}),
    invalidateClientRectCache: rec(calls, 'invalidateClientRectCache'),
    ...overrides,
  });
  // fresh base: optionsRef 가 현재 options 와 동일해야 한다.
  chart._baseOptionsRef = chart.options;
  return { chart, calls };
};

const names = (calls) => calls.map((c) => c.name);

describe('canPartialSelectionRender 게이트', () => {
  it('selectSeries.use + fresh base + line 선택 + 무상태 → true', () => {
    const { chart } = makeSelChart();
    expect(chart.canPartialSelectionRender()).toBe(true);
  });

  it('selectSeries.use=false → false', () => {
    const { chart } = makeSelChart({ options: { selectSeries: { use: false } } });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('workerRender opt-in → false (worker 와 1차 분리)', () => {
    const { chart } = makeSelChart({ options: { workerRender: true } });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('hitInfo(hover/legend) 있으면 → false', () => {
    const { chart } = makeSelChart();
    expect(chart.canPartialSelectionRender({ some: 'hit' })).toBe(false);
  });

  it('lastHitInfo(잔류 hover) → false', () => {
    const { chart } = makeSelChart({ lastHitInfo: { x: 1 } });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('base stale(dataEpoch 불일치) → false', () => {
    const { chart } = makeSelChart({ _baseDataEpoch: 0 });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('base stale(scaleVersion 불일치) → false', () => {
    const { chart } = makeSelChart({ _baseScaleVersion: 0 });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('base 미build → false', () => {
    const { chart } = makeSelChart({ _seriesBaseBuilt: false });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('선택 시리즈가 bar → false (showIndex 슬롯 의존)', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'bar', show: true, fill: false, isExistGrp: false } },
    });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('선택 시리즈가 fill(area) → false (알파 합성 비선형)', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'line', show: true, fill: true, isExistGrp: false } },
    });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('선택 시리즈가 stack(isExistGrp) → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'line', show: true, fill: false, isExistGrp: true } },
    });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('pie 차트 존재 → false (base 가 bufferCtx 하드코딩이라 부정확)', () => {
    const { chart } = makeSelChart({
      seriesInfo: { charts: { pie: ['p1'], bar: [], line: ['l1'], scatter: [], heatMap: [] } },
    });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('선택 시리즈 없음(seriesId []) → false (full 로 base 갱신 겸)', () => {
    const { chart } = makeSelChart({ defaultSelectInfo: { seriesId: [] } });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });

  it('scrollbar 활성 → false', () => {
    const { chart } = makeSelChart({ scrollbar: { x: { use: true }, y: { use: false } } });
    expect(chart.canPartialSelectionRender()).toBe(false);
  });
});

describe('render 라우팅 (partial vs full 폴백)', () => {
  it('게이트 통과 → drawSelectionPartial, 전체 drawChart 미호출', () => {
    const { chart, calls } = makeSelChart();
    // drawSelectionPartial 자체는 실제 호출되므로 그 하위 stub(clear 등)이 기록된다.
    chart.render();
    expect(names(calls)).toContain('clear');
    expect(names(calls)).toContain('commitToDisplay');
    // 전체 재렌더 경로(drawChart)·전체 series 래스터(drawSeriesLayer)는 호출되지 않는다.
    expect(names(calls)).not.toContain('drawChart');
    expect(names(calls)).not.toContain('drawSeriesLayer');
    // 선택 시리즈만 redraw.
    expect(names(calls)).toContain('series.draw');
  });

  it('게이트 미충족(base stale) → full drawChart + maybeRebuildSeriesBase', () => {
    const { chart, calls } = makeSelChart({ _baseDataEpoch: 0 });
    chart.render();
    expect(names(calls)).toContain('drawChart');
    // drawSelectionPartial 의 흔적(clear before static)은 없고 full 경로 clear→getChartRect→drawChart.
    expect(names(calls)).toContain('getChartRect');
  });
});

describe('drawSelectionPartial 순서/대상', () => {
  it('clear → drawStaticLayer → (base 합성) → series.draw → overlay → tip → commit', () => {
    const { chart, calls } = makeSelChart();
    chart.drawSelectionPartial();

    const order = names(calls);
    expect(order.indexOf('clear')).toBeLessThan(order.indexOf('drawStaticLayer'));
    expect(order.indexOf('drawStaticLayer')).toBeLessThan(order.indexOf('series.draw'));
    expect(order.indexOf('series.draw')).toBeLessThan(order.indexOf('drawSeriesOverlay'));
    expect(order.indexOf('drawSeriesOverlay')).toBeLessThan(order.indexOf('drawTip'));
    expect(order.indexOf('drawTip')).toBeLessThan(order.indexOf('commitToDisplay'));
    // 전체 series 래스터는 호출되지 않는다.
    expect(order).not.toContain('drawSeriesLayer');
  });

  it('drawSelectedSeriesOnly 는 defaultSelectInfo.seriesId 의 시리즈만 draw 한다', () => {
    const calls = [];
    const { chart } = makeSelChart({
      seriesList: {
        l1: { type: 'line', show: true, fill: false, isExistGrp: false, draw: rec(calls, 'draw.l1') },
        l2: { type: 'line', show: true, fill: false, isExistGrp: false, draw: rec(calls, 'draw.l2') },
      },
      defaultSelectInfo: { seriesId: ['l1'] },
    });
    chart.drawSelectedSeriesOnly();
    expect(names(calls)).toEqual(['draw.l1']);
  });
});

describe('rebuildSeriesBase 계약', () => {
  it('noSelection 으로 seriesBaseCtx 에 그리고 무효화 키를 기록한다', () => {
    const { chart, calls } = makeSelChart({
      _seriesBaseBuilt: false,
      _baseDataEpoch: null,
      _dataEpoch: 7,
      _scaleVersion: 3,
    });
    chart.rebuildSeriesBase();

    const layerCall = calls.find((c) => c.name === 'drawSeriesLayer');
    expect(layerCall).toBeTruthy();
    // 첫 인자는 seriesBaseCtx, 세번째 인자는 { noSelection: true }.
    expect(layerCall.args[0]).toBe(chart.seriesBaseCtx);
    expect(layerCall.args[2]).toEqual({ noSelection: true });
    // 키 기록.
    expect(chart._seriesBaseBuilt).toBe(true);
    expect(chart._baseDataEpoch).toBe(7);
    expect(chart._baseScaleVersion).toBe(3);
    expect(chart._baseOptionsRef).toBe(chart.options);
  });

  it('maybeRebuildSeriesBase: fresh 면 재구성하지 않는다', () => {
    const { chart, calls } = makeSelChart();
    chart.maybeRebuildSeriesBase();
    expect(names(calls)).not.toContain('drawSeriesLayer');
  });

  it('maybeRebuildSeriesBase: selectSeries.use=false 면 즉시 반환', () => {
    const { chart, calls } = makeSelChart({
      options: { selectSeries: { use: false } },
      _seriesBaseBuilt: false,
    });
    chart.maybeRebuildSeriesBase();
    expect(names(calls)).not.toContain('drawSeriesLayer');
  });
});
