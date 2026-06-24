import { describe, it, expect } from 'vitest';
import EvChart from './chart.core';

/**
 * selectSeries 선택 라인 최상위 보정(chart.selection.js) 검증.
 *
 * full redraw 는 선택 시리즈를 z-order 제자리에 그려 뒤(higher-z) dimmed 시리즈에 묻히므로,
 * drawSeriesLayer 뒤 선택 line 만 한 번 더 덧그려 항상 최상위로 올린다.
 *  1) shouldDrawSelectedOnTop 게이트: line-only 선택 프레임만 on-top 허용, 나머지는 미적용.
 *  2) drawSelectedSeriesOnly 대상: defaultSelectInfo.seriesId 의 시리즈만 draw.
 *  3) drawChart on-top 패스: drawSeriesLayer 뒤 선택 line 덧그리기 순서.
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

  const chart = Object.assign(Object.create(EvChart.prototype), {
    options,
    seriesList: {
      l1: { type: 'line', show: true, fill: false, isExistGrp: false, draw: rec(calls, 'series.draw') },
    },
    defaultSelectInfo: { seriesId: ['l1'] },
    defaultSelectItemInfo: null,
    bufferCtx: {},
    chartRect: { x1: 0, x2: 200, chartWidth: 200, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [], y: [] },
    _dataEpoch: 1,
    _scaleVersion: 1,
    legendHover: null,
    ...overrides,
  });
  return { chart, calls };
};

const names = (calls) => calls.map((c) => c.name);

describe('shouldDrawSelectedOnTop 게이트 (full redraw on-top)', () => {
  it('selectSeries.use + 단일 line 선택 + 무상태 → true', () => {
    const { chart } = makeSelChart();
    expect(chart.shouldDrawSelectedOnTop()).toBe(true);
  });

  it('다중 line 선택 → true', () => {
    const { chart } = makeSelChart({
      seriesList: {
        l1: { type: 'line', show: true, fill: false, isExistGrp: false },
        l2: { type: 'line', show: true, fill: false, isExistGrp: false },
      },
      defaultSelectInfo: { seriesId: ['l1', 'l2'] },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(true);
  });

  it('selectSeries.use=false → false', () => {
    const { chart } = makeSelChart({ options: { selectSeries: { use: false } } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('brush → false', () => {
    const { chart } = makeSelChart({ options: { brush: true } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('realTimeScatter → false', () => {
    const { chart } = makeSelChart({ options: { realTimeScatter: { use: true } } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('workerRender → false (worker 별도 z-order, 범위 밖)', () => {
    const { chart } = makeSelChart({ options: { workerRender: true } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('legend hit(hitInfo.legend) → false', () => {
    const { chart } = makeSelChart();
    expect(chart.shouldDrawSelectedOnTop({ legend: { sId: 'l1' } })).toBe(false);
  });

  it('legendHover 잔류 → false', () => {
    const { chart } = makeSelChart({ legendHover: { sId: 'l1' } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 없음(seriesId []) → false (덧그릴 것 없음, full redraw 가 이미 정상)', () => {
    const { chart } = makeSelChart({ defaultSelectInfo: { seriesId: [] } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 시리즈 scatter → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'scatter', show: true, fill: false, isExistGrp: false } },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 시리즈 heatMap → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'heatMap', show: true, fill: false, isExistGrp: false } },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 시리즈 bar → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'bar', show: true, fill: false, isExistGrp: false } },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 line + fill → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'line', show: true, fill: true, isExistGrp: false } },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 line + isExistGrp(stack) → false', () => {
    const { chart } = makeSelChart({
      seriesList: { l1: { type: 'line', show: true, fill: false, isExistGrp: true } },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('line + scatter 혼합 선택 → false (all-or-nothing)', () => {
    const { chart } = makeSelChart({
      seriesList: {
        l1: { type: 'line', show: true, fill: false, isExistGrp: false },
        s1: { type: 'scatter', show: true, fill: false, isExistGrp: false },
      },
      defaultSelectInfo: { seriesId: ['l1', 's1'] },
    });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });

  it('선택 id 가 seriesList 에 없음 → false', () => {
    const { chart } = makeSelChart({ defaultSelectInfo: { seriesId: ['nope'] } });
    expect(chart.shouldDrawSelectedOnTop()).toBe(false);
  });
});

describe('drawSelectedSeriesOnly 대상', () => {
  it('defaultSelectInfo.seriesId 의 시리즈만 draw 한다', () => {
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

/**
 * drawChart 의 on-top 패스(drawSeriesLayer 뒤 선택 line 덧그리기) 검증.
 * 실제 drawChart(EvChart.prototype)를 태우되 부수효과/DOM·worker 의존 서브메서드를 호출 기록 stub 으로
 * 교체한다(shouldDrawSelectedOnTop/selectedSeriesAllLineSafe 는 실제 메서드 사용).
 */
const makeDrawChartChart = (overrides = {}) => {
  const calls = [];
  const options = {
    selectSeries: { use: true },
    brush: false,
    realTimeScatter: { use: false },
    ...(overrides.options ?? {}),
  };
  delete overrides.options;

  const chart = Object.assign(Object.create(EvChart.prototype), {
    options,
    renderEpoch: 0,
    scrollbar: { x: { use: false }, y: { use: false } },
    legendHover: null,
    defaultSelectInfo: { seriesId: ['l1'] },
    seriesList: { l1: { type: 'line', show: true, fill: false, isExistGrp: false } },
    bufferCtx: {},
    bufferCanvas: {},
    displayCtx: {},
    listeners: {},
    initScale: rec(calls, 'initScale'),
    prepareScale: rec(calls, 'prepareScale', { scaleChange: false, scrollbarLabelOffset: 0 }),
    computeScaleVersion: rec(calls, 'computeScaleVersion'),
    emitDataMaxChange: rec(calls, 'emitDataMaxChange'),
    tryDrawSeriesOnWorker: rec(calls, 'tryDrawSeriesOnWorker', false),
    drawAxisAndSeries: rec(calls, 'drawAxisAndSeries'),
    drawStaticLayer: rec(calls, 'drawStaticLayer'),
    drawSeriesLayer: rec(calls, 'drawSeriesLayer'),
    drawSeriesOverlay: rec(calls, 'drawSeriesOverlay'),
    drawTip: rec(calls, 'drawTip'),
    commitToDisplay: rec(calls, 'commitToDisplay'),
    drawSelectedSeriesOnly: rec(calls, 'drawSelectedSeriesOnly'),
    ...overrides,
  });
  return { chart, calls };
};

describe('drawChart on-top 패스 (데이터 업데이트 프레임 묻힘 보정)', () => {
  it('selection(line) 활성 full redraw → drawSeriesLayer < drawSelectedSeriesOnly < drawSeriesOverlay', () => {
    const { chart, calls } = makeDrawChartChart();
    chart.drawChart();

    const order = names(calls);
    expect(order.indexOf('drawSeriesLayer')).toBeLessThan(order.indexOf('drawSelectedSeriesOnly'));
    expect(order.indexOf('drawSelectedSeriesOnly')).toBeLessThan(order.indexOf('drawSeriesOverlay'));
  });

  it('선택 없음 → drawSelectedSeriesOnly 미호출(평범한 full redraw)', () => {
    const { chart, calls } = makeDrawChartChart({ defaultSelectInfo: { seriesId: [] } });
    chart.drawChart();

    expect(names(calls)).toContain('drawSeriesLayer');
    expect(names(calls)).not.toContain('drawSelectedSeriesOnly');
  });

  it('realTimeScatter 프레임 → realtime 분기(drawAxisAndSeries), drawSelectedSeriesOnly 미호출', () => {
    const { chart, calls } = makeDrawChartChart({ options: { realTimeScatter: { use: true } } });
    chart.drawChart();

    expect(names(calls)).toContain('drawAxisAndSeries');
    expect(names(calls)).not.toContain('drawSelectedSeriesOnly');
  });
});
