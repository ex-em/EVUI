import { describe, it, expect, vi, afterEach } from 'vitest';
import interaction from './plugins/plugins.interaction';
import store from './model/model.store';
import Line from './element/element.line';
import Bar from './element/element.bar';
import TimeBar from './element/element.bar.time';
import tip from './element/element.tip';

/**
 * 수집 간격이 다른 시리즈(1초 60점 · 5초 12점)를 { x, y } 로 넘긴 차트의 hit-test 계약 (#2352).
 * 실제 createDataSet·findHitItem·getHitItemByPosition·element.findGraphData 를 그대로 쓰고,
 * 픽셀 기하만 computeGeometry 대신 1초 = 10px 로 채운다(hit-test 는 xp/yp/w/h 만 소비한다).
 */
const BASE = Date.UTC(2026, 0, 1, 0, 0, 0);
const X0 = 100;
const PX_PER_SEC = 10;
const Y0 = 300;

const SEC_1 = Array.from({ length: 60 }, (_, i) => i);
const SEC_5 = SEC_1.filter((sec) => sec % 5 === 0);

const SOURCE = {
  s1: { secs: SEC_1, valueOf: (sec) => 10 + sec },
  s5: { secs: SEC_5, valueOf: (sec) => 100 + sec },
};

const at = (sec) => BASE + sec * 1000;
const xpOf = (x) => X0 + ((x - BASE) / 1000) * PX_PER_SEC;

const createSeries = (type, id, idx) => {
  if (type === 'line') return new Line(id, { name: id }, idx);
  if (type === 'categoryBar') return new Bar(id, { name: id }, idx, false);
  return new TimeBar(id, { name: id, timeMode: true }, idx, false);
};

const createMixedChart = ({ order, types, labels = [], axesX, source = SOURCE }) => {
  const seriesList = {};
  const charts = { line: [], bar: [], scatter: [], pie: [], heatMap: [] };

  order.forEach((id, idx) => {
    seriesList[id] = createSeries(types[id], id, idx);
    charts[types[id] === 'line' ? 'line' : 'bar'].push(id);
  });

  const chart = Object.assign(Object.create(interaction), store, {
    seriesList,
    seriesInfo: { charts },
    options: { horizontal: false, axesX },
    tooltipCtx: null,
    getFormattedTooltipLabel: ({ seriesName }) => seriesName,
    getFormattedTooltipValue: ({ value }) => String(value),
    isNotUseIndicator: () => false,
  });

  const data = Object.fromEntries(
    order.map((id) => [
      id,
      source[id].secs.map((sec) => ({ x: at(sec), y: source[id].valueOf(sec) })),
    ]),
  );
  chart.createDataSet(data, labels);
  chart.data = { series: Object.fromEntries(order.map((id) => [id, {}])), data, labels };

  // timeMode bar: 1초 폭 칸을 bar 시리즈 수로 나눠 나란히 놓는다.
  const barIds = order.filter((id) => types[id] !== 'line');
  const barW = PX_PER_SEC / (barIds.length || 1);
  order.forEach((id) => {
    seriesList[id].data.forEach((p) => {
      if (types[id] === 'line') {
        p.xp = xpOf(p.x);
        p.yp = Y0 - p.y;
      } else {
        p.xp = xpOf(p.x) + barIds.indexOf(id) * barW;
        p.w = barW;
        p.yp = Y0;
        p.h = -p.y;
      }
    });
  });

  return chart;
};

const xOf = (items, id) => items[id]?.data?.x;

const createLineChart = ({ data, labels = [], horizontal = false }) => {
  const ids = Object.keys(data);
  const chart = Object.assign(Object.create(interaction), store, {
    seriesList: Object.fromEntries(ids.map((id, idx) => [id, new Line(id, { name: id }, idx)])),
    seriesInfo: { charts: { line: ids, bar: [], scatter: [], pie: [], heatMap: [] } },
    options: { horizontal },
  });
  chart.createDataSet(data, labels);
  return chart;
};

describe('혼합 interval — 정렬 판정(createDataSet)', () => {
  it('원시값 + labels 는 판정 없이 aligned 다', () => {
    const chart = createLineChart({
      data: { a: [1, 2, 3], b: [4, 5] },
      labels: [at(0), at(1), at(2)],
    });
    expect(chart.isMixedX).toBe(false);
  });

  it('x 가 같은 시각이면 Date 객체가 서로 달라도 aligned 다', () => {
    const points = () => [0, 1, 2].map((sec) => ({ x: new Date(at(sec)), y: sec }));
    const chart = createLineChart({ data: { a: points(), b: points() } });
    expect(chart.isMixedX).toBe(false);
  });

  it.each([
    ['길이가 다르면', [0, 1, 2, 3, 4, 5], [0, 5]],
    ['길이가 같아도 x 가 다르면', [0, 1, 2], [0, 5, 10]],
  ])('%s mixed 다', (_, secsA, secsB) => {
    const toPoints = (secs) => secs.map((sec) => ({ x: at(sec), y: sec }));
    const chart = createLineChart({ data: { a: toPoints(secsA), b: toPoints(secsB) } });
    expect(chart.isMixedX).toBe(true);
  });

  it('가로 차트는 판정하지 않는다', () => {
    const chart = createLineChart({
      data: { a: [{ x: at(0), y: 1 }], b: [{ x: at(5), y: 2 }] },
      horizontal: true,
    });
    expect(chart.isMixedX).toBe(false);
  });

  it('시리즈 간격은 중앙값이라 중복 수집 한 쌍에 흔들리지 않는다', () => {
    const fiveSec = [0, 5, 10, 15, 20].map((sec) => ({ x: at(sec), y: sec }));
    fiveSec.splice(3, 0, { x: at(10) + 10, y: 99 }); // 10초 직후 10ms 중복
    const oneSec = [0, 1, 2, 3].map((sec) => ({ x: at(sec), y: sec }));
    const chart = createLineChart({ data: { five: fiveSec, one: oneSec } });

    expect(chart.xIntervalBySeries).toEqual({ five: 5000, one: 1000 });
  });
});

const ORDERS = [
  ['s1', 's5'],
  ['s5', 's1'],
];

describe('혼합 interval — hover(findHitItem)', () => {
  describe.each(ORDERS)('line 두 시리즈, 순서 %s → %s', (first, second) => {
    const types = { s1: 'line', s5: 'line' };

    it('두 시리즈가 모두 점을 가진 10초에서는 둘 다 10초 점을 보여준다', () => {
      const chart = createMixedChart({ order: [first, second], types });
      const { items } = chart.findHitItem([xpOf(at(10)), Y0 - 20]);

      expect(xOf(items, 's1')).toBe(at(10));
      expect(xOf(items, 's5')).toBe(at(10));
    });

    it('1초에만 점이 있는 3초에서는 5초 시리즈가 툴팁에서 빠진다', () => {
      const chart = createMixedChart({ order: [first, second], types });
      const { items } = chart.findHitItem([xpOf(at(3)), Y0 - 13]);

      expect(xOf(items, 's1')).toBe(at(3));
      expect(items.s5).toBeUndefined();
    });
  });

  describe.each(ORDERS)('line(1초) + timeMode bar(5초) 콤보, 순서 %s → %s', (first, second) => {
    it('10초에서 bar 시리즈도 10초 막대를 보여준다', () => {
      const chart = createMixedChart({
        order: [first, second],
        types: { s1: 'line', s5: 'bar' },
      });
      const { items } = chart.findHitItem([xpOf(at(10)), Y0 - 20]);

      expect(xOf(items, 's1')).toBe(at(10));
      expect(xOf(items, 's5')).toBe(at(10));
    });
  });

  describe('timeMode bar 만 있는 차트', () => {
    const types = { s1: 'bar', s5: 'bar' };

    it('커서 아래 막대 하나만 그 막대의 시각으로 잡힌다', () => {
      const chart = createMixedChart({ order: ['s1', 's5'], types });

      // 1초 시리즈 3초 막대 안쪽 (칸 [130, 135))
      const onS1 = chart.findHitItem([xpOf(at(3)) + 2, Y0 - 5]).items;
      expect(xOf(onS1, 's1')).toBe(at(3));
      expect(onS1.s5).toBeUndefined();

      // 5초 시리즈 10초 막대 안쪽 (칸 [205, 210))
      const onS5 = chart.findHitItem([xpOf(at(10)) + 7, Y0 - 5]).items;
      expect(xOf(onS5, 's5')).toBe(at(10));
      expect(onS5.s1).toBeUndefined();
    });
  });
});

describe('혼합 interval — x 를 Date 로 넘길 때', () => {
  it('hover 와 스택이 epoch ms 와 같은 결과를 낸다', () => {
    const asDate = (secs, valueOf) =>
      secs.map((sec) => ({ x: new Date(at(sec)), y: valueOf(sec) }));
    const chart = createLineChart({
      data: { s1: asDate(SEC_1, SOURCE.s1.valueOf), s5: asDate(SEC_5, SOURCE.s5.valueOf) },
    });
    Object.values(chart.seriesList).forEach((series) => {
      series.data.forEach((p) => {
        p.xp = xpOf(+p.x); // eslint-disable-line no-param-reassign
        p.yp = Y0 - p.y; // eslint-disable-line no-param-reassign
      });
    });

    expect(chart.isMixedX).toBe(true);
    const { items } = chart.findHitItem([xpOf(at(10)), Y0 - 20]);
    expect(+xOf(items, 's1')).toBe(at(10));
    expect(+xOf(items, 's5')).toBe(at(10));
    expect(chart.xIntervalBySeries).toEqual({ s1: 1000, s5: 5000 });
  });
});

describe('혼합 interval — 클릭(getHitItemByPosition)', () => {
  it.each(ORDERS)(
    'line 두 시리즈, 순서 %s → %s: 10초 1초 점을 클릭하면 10초가 선택된다',
    (first, second) => {
      const chart = createMixedChart({
        order: [first, second],
        types: { s1: 'line', s5: 'line' },
      });
      const hit = chart.getHitItemByPosition(
        [xpOf(at(10)), Y0 - 20],
        false,
        undefined,
        false,
        true,
      );

      expect(hit.sId).toBe('s1');
      expect(hit.label).toBe(at(10));
      expect(hit.value).toBe(20);
    },
  );
});

describe('혼합 interval — selectItem(getItem)', () => {
  it('선택한 점과 같은 시각의 점만 합산한다', () => {
    const chart = createMixedChart({ order: ['s5', 's1'], types: { s1: 'line', s5: 'line' } });

    // 1초 시리즈 3초 점(값 13) — 5초 시리즈에는 3초 점이 없다
    const [atThree] = chart.getItem({ seriesID: 's1', dataIndex: 3 });
    expect(atThree.label).toBe(at(3));
    expect(atThree.acc).toBe(13);

    // 1초 시리즈 10초 점(값 20) + 5초 시리즈 10초 점(값 110)
    const [atTen] = chart.getItem({ seriesID: 's1', dataIndex: 10 });
    expect(atTen.acc).toBe(130);
  });
});

describe('혼합 interval — 스택(같은 시각에서만 쌓기)', () => {
  // groups: [[base, top]] 를 model.series addGroupInfo 가 남기는 메타로 흉내 낸다.
  const createStackChart = ({ base, top, labels = [] }) => {
    const ids = ['base', 'top'];
    const seriesList = {
      base: Object.assign(new Line('base', { name: 'base' }, 0), {
        isExistGrp: true,
        stackIndex: 0,
        groupIndex: 0,
      }),
      top: Object.assign(new Line('top', { name: 'top' }, 1), {
        isExistGrp: true,
        stackIndex: 1,
        groupIndex: 0,
      }),
    };
    const chart = Object.assign(Object.create(interaction), store, {
      seriesList,
      seriesInfo: { charts: { line: ids, bar: [], scatter: [], pie: [], heatMap: [] } },
      options: { horizontal: false },
    });
    chart.createDataSet({ base, top }, labels);
    return chart;
  };
  const points = (secs, valueOf) => secs.map((sec) => ({ x: at(sec), y: valueOf(sec) }));
  const pick = (chart, id) => chart.seriesList[id].data.map(({ x, y, o, b }) => ({ x, y, o, b }));

  it('x 가 같은 { x, y } 스택은 labels 없이도 아래 값 위에 쌓인다', () => {
    const chart = createStackChart({
      base: points([0, 1], (sec) => 10 + sec),
      top: points([0, 1], () => 5),
    });
    expect(pick(chart, 'top')).toEqual([
      { x: at(0), y: 15, o: 5, b: 10 },
      { x: at(1), y: 16, o: 5, b: 11 },
    ]);
  });

  it('아래 5초 · 위 1초: 아래 점이 없는 시각은 0 위에 쌓는다', () => {
    const chart = createStackChart({
      base: points([0, 5], (sec) => 100 + sec),
      top: points([0, 1, 5], () => 5),
    });
    expect(pick(chart, 'top')).toEqual([
      { x: at(0), y: 105, o: 5, b: 100 },
      { x: at(1), y: 5, o: 5, b: 0 },
      { x: at(5), y: 110, o: 5, b: 105 },
    ]);
  });

  it('아래 1초 · 위 5초: 5초 점마다 같은 시각의 1초 값 위에 쌓는다', () => {
    const chart = createStackChart({
      base: points([0, 1, 2, 3, 4, 5], (sec) => 10 + sec),
      top: points([0, 5], () => 100),
    });
    expect(pick(chart, 'top')).toEqual([
      { x: at(0), y: 110, o: 100, b: 10 },
      { x: at(5), y: 115, o: 100, b: 15 },
    ]);
  });
});

describe('혼합 interval — timeMode bar 폭·콤보 line 오프셋', () => {
  // x 축 60초 = 600px → 1초 = 10px
  const geometryParam = (extra) => ({
    chartRect: { x1: 0, x2: 600, y1: 0, y2: 300, chartWidth: 600, chartHeight: 300 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ graphMin: BASE, graphMax: at(60) }],
      y: [{ graphMin: 0, graphMax: 200 }],
    },
    isHorizontal: false,
    thickness: 1,
    ...extra,
  });

  it('공통 칸 폭은 보이는 bar 시리즈 간격 중 최솟값이고 aligned 면 없다', () => {
    const mixed = createMixedChart({ order: ['s1', 's5'], types: { s1: 'bar', s5: 'bar' } });
    expect(mixed.getMixedBarInterval()).toBe(1000);

    const aligned = createLineChart({ data: { a: [1, 2], b: [3, 4] }, labels: [at(0), at(1)] });
    expect(aligned.getMixedBarInterval()).toBe(null);
  });

  it('1초·5초 막대가 같은 폭으로 같은 1초 칸 안에 나란히 놓인다', () => {
    const chart = createMixedChart({ order: ['s1', 's5'], types: { s1: 'bar', s5: 'bar' } });
    const mixedXInterval = chart.getMixedBarInterval();
    ['s1', 's5'].forEach((id, showIndex) => {
      chart.seriesList[id].computeGeometry(
        geometryParam({ showSeriesCount: 2, showIndex, mixedXInterval }),
      );
    });

    const s1At10 = chart.seriesList.s1.data[10];
    const s5At10 = chart.seriesList.s5.data[2];
    expect(s5At10.w).toBe(s1At10.w);
    expect(s5At10.xp).toBe(s1At10.xp + s1At10.w);
    expect(s5At10.xp + s5At10.w).toBeLessThanOrEqual(xpOf(at(11)) - X0);
  });

  it('combo line 오프셋도 공통 칸 폭을 쓴다', () => {
    const chart = createMixedChart({ order: ['s1', 's5'], types: { s1: 'bar', s5: 'line' } });
    const line = chart.seriesList.s5;
    line.combo = true;
    line.computeGeometry(geometryParam({ mixedXInterval: chart.getMixedBarInterval() }));

    // 60초 구간 + 축 끝 시각 한 칸 = 1초 칸 61개
    expect(line.size.comboOffset).toBeCloseTo(600 / 61);
  });
});

// 일반 bar 두 시리즈(s1 → showIndex 0, s5 → 1)의 기하를 차트의 mixed 배치 정보로 채운다.
const layoutBars = (chart, param, ids = ['s1', 's5']) => {
  ids.forEach((id, showIndex) => {
    chart.seriesList[id].computeGeometry({
      ...param,
      showIndex,
      showSeriesCount: ids.length,
      mixedXLayout: chart.getMixedXLayout(),
      mixedXInterval: chart.getMixedBarInterval(),
    });
  });
};

const isDrawn = (p) => p.xp !== null && p.xp !== undefined;

// 그리기 호출은 모두 무시하는 canvas context
const createStubCtx = () =>
  new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })) });

describe('혼합 interval — 범주형 축(time categoryMode) 일반 bar 배치', () => {
  afterEach(() => vi.restoreAllMocks());

  const CATEGORY_AXIS = [{ type: 'time', categoryMode: true }];
  // 600px 를 라벨 칸 수로 나눈다. categoryMode 축처럼 라벨 인덱스 윈도우를 준다.
  const categoryParam = (labelCount, graphMax) => ({
    chartRect: { x1: 0, x2: 600, y1: 0, y2: 300, chartWidth: 600, chartHeight: 300 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ graphMin: at(0), graphMax, minIndex: 0, maxIndex: labelCount - 1 }],
      y: [{ graphMin: 0, graphMax: 200 }],
    },
    isHorizontal: false,
    thickness: 1,
    cPadRatio: 0,
  });

  it('5초 막대가 자기 배열 순서가 아니라 같은 시각의 라벨 칸에 놓인다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: SEC_1.map(at),
      axesX: CATEGORY_AXIS,
    });
    layoutBars(chart, categoryParam(60, at(59)));

    const s1At10 = chart.seriesList.s1.data[10];
    const s5At10 = chart.seriesList.s5.data[2];
    expect(s5At10.xp).toBe(s1At10.xp + s1At10.w);
    expect(Math.floor(s5At10.xp / 10)).toBe(10);
  });

  it('labels 에 없는 시각(5초 격자 + 끼어든 시각, 1초 시리즈)도 앞뒤 칸 사이에 시간 순으로 모두 그린다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 5초 격자 12칸 + 32.5초에 끼어든 시각 하나 = 13칸
    const labels = [...SEC_5.map(at), at(32) + 500].sort((a, b) => a - b);
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels,
      axesX: CATEGORY_AXIS,
    });
    layoutBars(chart, categoryParam(labels.length, at(55)));

    const s1 = chart.seriesList.s1.data;
    const s5 = chart.seriesList.s5.data;
    expect(s1.every(isDrawn)).toBe(true);
    expect(s5.every(isDrawn)).toBe(true);
    // 1초 막대끼리 시간 순으로 놓이고 겹치지 않는다
    s1.slice(1).forEach((p, i) => expect(p.xp).toBeGreaterThanOrEqual(s1[i].xp + s1[i].w));

    // 10초: 5초 막대는 같은 시각 1초 막대 바로 옆, 둘 다 10초 라벨 칸(2번 칸) 안
    const slot = 600 / labels.length;
    expect(s5[2].xp).toBeGreaterThanOrEqual(s1[10].xp + s1[10].w);
    expect(s5[2].xp + s5[2].w).toBeLessThanOrEqual(s1[11].xp);
    expect(Math.floor(s1[10].xp / slot)).toBe(2);
    // 3초(labels 에 없음)는 0초 칸 안
    expect(Math.floor(s1[3].xp / slot)).toBe(0);
    expect(warn).not.toHaveBeenCalled();
  });

  it('labels 가 없으면 경고 없이 x 값 위치로 그린다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      axesX: CATEGORY_AXIS,
    });

    expect(chart.getMixedXLayout()).toEqual({ byValue: true });
    expect(warn).not.toHaveBeenCalled();
  });

  it('combo line 점은 같은 시각 막대의 labels 칸 가운데에 찍힌다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'line', s5: 'categoryBar' },
      labels: SEC_1.map(at),
      axesX: CATEGORY_AXIS,
    });
    const param = categoryParam(60, at(59));
    layoutBars(chart, param, ['s5']);
    const line = chart.seriesList.s1;
    line.combo = true;
    line.draw({
      ...param,
      ctx: createStubCtx(),
      mixedXLayout: chart.getMixedXLayout(),
      mixedXInterval: chart.getMixedBarInterval(),
    });

    // 5초 막대도 1초 labels 칸(10px)에 놓인다. 0초 · 25초 · 55초
    const bars = chart.seriesList.s5.data;
    [0, 5, 11].forEach((k) => {
      const centerOfBar = bars[k].xp + bars[k].w / 2;
      expect(Math.abs(line.data[k * 5].xp - centerOfBar)).toBeLessThan(1);
    });
    expect(line.size.comboOffset).toBeCloseTo(600 / 60);
  });
});

describe('혼합 interval — 값 기반 축 일반 bar(x 값 위치)', () => {
  // time 축(값 기반)처럼 라벨 인덱스 윈도우가 없다. 60초 = 600px.
  const valueAxisParam = (graphMax = at(60)) => ({
    chartRect: { x1: 0, x2: 600, y1: 0, y2: 300, chartWidth: 600, chartHeight: 300 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ graphMin: BASE, graphMax }],
      y: [{ graphMin: 0, graphMax: 200 }],
    },
    isHorizontal: false,
    thickness: 1,
    cPadRatio: 0,
  });

  const createComboChart = () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'line', s5: 'categoryBar' },
    });
    layoutBars(chart, valueAxisParam(), ['s5']);
    return chart;
  };

  it('5초 00초 막대가 1초 00초 막대 옆에 놓이고 hover 헤더가 시간 순으로만 움직인다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
    });
    layoutBars(chart, valueAxisParam());

    const s1 = chart.seriesList.s1.data;
    const s5 = chart.seriesList.s5.data;
    expect(s1.every(isDrawn)).toBe(true);
    expect(s5.every(isDrawn)).toBe(true);
    expect(s5[0].xp).toBeGreaterThanOrEqual(s1[0].xp + s1[0].w);
    expect(s5[0].xp + s5[0].w).toBeLessThanOrEqual(s1[1].xp);

    const headers = [];
    for (let px = 0; px <= 60; px += 1) {
      const { items, hitId } = chart.findHitItem([px, 290]);
      const x = items[hitId]?.data?.x;
      if (x !== undefined && headers[headers.length - 1] !== x) headers.push(x);
    }
    expect(headers).toEqual([...headers].sort((a, b) => a - b));
    expect(headers).toEqual(expect.arrayContaining([at(0), at(1), at(2), at(5)]));
  });

  it('축 끝 시각(graphMax)의 막대도 그래프 영역 안에 그린다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
    });
    layoutBars(chart, valueAxisParam(at(59)));

    const last = chart.seriesList.s1.data[59];
    expect(isDrawn(last)).toBe(true);
    expect(last.xp + last.w).toBeLessThanOrEqual(600);
  });

  it('축 끝 시각의 두 시리즈 막대가 한 자리에 겹치지 않고 나란히 놓인다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
    });
    // 막대를 칸 몫보다 좁게 둬 반올림 1px 겹침과 구분한다.
    layoutBars(chart, { ...valueAxisParam(at(55)), thickness: 0.5 });

    const [s1At54, s1At55] = chart.seriesList.s1.data.slice(54, 56);
    const s5At55 = chart.seriesList.s5.data[11];
    expect(s5At55.xp).toBeGreaterThanOrEqual(s1At55.xp + s1At55.w);
    expect(s5At55.xp + s5At55.w).toBeLessThanOrEqual(600);
    expect(s1At54.xp + s1At54.w).toBeLessThanOrEqual(s1At55.xp);
  });

  // 같은 시각 격자를 labels 로 넘긴 정렬 차트. 5초 시리즈는 자기 시각이 아닌 칸이 null 이다.
  const createAlignedBars = (source, secs) => {
    const ids = ['s1', 's5'];
    const chart = Object.assign(Object.create(interaction), store, {
      seriesList: Object.fromEntries(ids.map((id, idx) => [id, new Bar(id, { name: id }, idx)])),
      seriesInfo: { charts: { line: [], bar: ids, scatter: [], pie: [], heatMap: [] } },
      options: { horizontal: false, axesX: [{ type: 'time' }] },
    });
    const data = Object.fromEntries(
      ids.map((id) => [
        id,
        secs.map((sec) => (source[id].secs.includes(sec) ? source[id].valueOf(sec) : null)),
      ]),
    );
    chart.createDataSet(data, secs.map(at));
    return chart;
  };

  it.each([
    { name: '1초 60점 · 5초 12점', source: SOURCE, lastSec: 59 },
    {
      name: '점이 적은 구간(1초 3점 · 5초 1점)',
      source: { s1: { secs: [0, 1, 2], valueOf: (sec) => 10 + sec }, s5: SOURCE.s5 },
      lastSec: 2,
    },
  ])('고른 간격이면 정렬 차트와 같은 칸에 같은 폭으로 놓인다 — $name', ({ source, lastSec }) => {
    const secs = Array.from({ length: lastSec + 1 }, (_, i) => i);
    const inRange = {
      ...source,
      s5: { ...source.s5, secs: source.s5.secs.filter((s) => s <= lastSec) },
    };
    const types = { s1: 'categoryBar', s5: 'categoryBar' };
    const mixed = createMixedChart({ order: ['s1', 's5'], types, source: inRange });
    const aligned = createAlignedBars(inRange, secs);
    expect(mixed.isMixedX).toBe(true);
    expect(aligned.isMixedX).toBe(false);

    const param = valueAxisParam(at(lastSec));
    layoutBars(mixed, param);
    layoutBars(aligned, param);

    ['s1', 's5'].forEach((id) => {
      mixed.seriesList[id].data.forEach((p) => {
        const a = aligned.seriesList[id].data[(p.x - BASE) / 1000];
        expect([p.xp, p.w]).toEqual([a.xp, a.w]);
      });
    });
  });

  it('line 콤보 점은 같은 시각 막대 칸 가운데에 찍힌다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'line', s5: 'categoryBar' },
    });
    const param = valueAxisParam(at(59));
    layoutBars(chart, param, ['s5']);
    const line = chart.seriesList.s1;
    line.combo = true;
    line.draw({ ...param, ctx: createStubCtx(), mixedXInterval: chart.getMixedBarInterval() });

    const bars = chart.seriesList.s5.data;
    // 0초 · 25초 · 55초
    [0, 5, 11].forEach((k) => {
      const centerOfBar = bars[k].xp + bars[k].w / 2;
      expect(Math.abs(line.data[k * 5].xp - centerOfBar)).toBeLessThan(1);
    });
    // 툴팁·tip 위치가 쓰는 오프셋(그리기 경로에서 다시 정한다)도 막대 칸 폭과 같다.
    expect(line.size.comboOffset).toBeCloseTo(chart.seriesList.s5.size.cat);
  });

  it('line 콤보 툴팁·selectItem 에 같은 시각 막대가 함께 담긴다', () => {
    const chart = createComboChart();

    expect(Object.keys(chart.findHitItem([xpOf(at(10)), 200]).items)).toEqual(['s1', 's5']);
    // 1초 10초 점(20) + 5초 10초 막대(110)
    expect(chart.getItem({ seriesID: 's1', dataIndex: 10 })[0].acc).toBe(130);
  });

  it('그리지 못한 막대(기하 없음)는 같은 시각이어도 툴팁·selectItem 에서 빠진다', () => {
    const chart = createComboChart();
    Object.assign(chart.seriesList.s5.data[2], { xp: null, yp: null, w: null, h: null });

    expect(Object.keys(chart.findHitItem([xpOf(at(10)), 200]).items)).toEqual(['s1']);
    expect(chart.getItem({ seriesID: 's1', dataIndex: 10 })[0].acc).toBe(20);
  });

  it('maxTip 은 배열 인덱스 칸이 아니라 그려진 막대 위에 놓인다', () => {
    const chart = Object.assign(
      createMixedChart({ order: ['s1', 's5'], types: { s1: 'categoryBar', s5: 'categoryBar' } }),
      tip,
    );
    const param = valueAxisParam();
    layoutBars(chart, param);
    Object.assign(chart, {
      chartRect: param.chartRect,
      labelOffset: param.labelOffset,
      axesSteps: param.axesSteps,
      lastTip: { pos: null, value: null, label: null },
      scrollbar: { x: {}, y: {} },
    });

    // 5초 시리즈 최댓값 = 55초(155, data[11])
    const maxBar = chart.seriesList.s5.data[11];
    const { dp } = chart.calculateTipInfo(chart.seriesList.s5, 'max');
    expect(dp).toBe(maxBar.xp + Math.round(maxBar.w / 2));
  });
});

describe('혼합 interval — step 축(문자열 범주)', () => {
  const clockOf = (sec) => `09:00:${String(sec).padStart(2, '0')}`;

  const createStepChart = ({ types, labels, extra = {} }) => {
    const ids = Object.keys(types);
    const seriesList = Object.fromEntries(
      ids.map((id, idx) => [id, createSeries(types[id], id, idx)]),
    );
    const charts = { line: [], bar: [], scatter: [], pie: [], heatMap: [] };
    ids.forEach((id) => charts[types[id] === 'line' ? 'line' : 'bar'].push(id));
    const chart = Object.assign(Object.create(interaction), store, {
      seriesList,
      seriesInfo: { charts },
      options: { horizontal: false, axesX: [{ type: 'step' }] },
    });
    const source = {
      s1: SEC_1.map((sec) => ({ x: clockOf(sec), y: 10 + sec })),
      s5: SEC_5.map((sec) => ({ x: clockOf(sec), y: 100 + sec })),
      ...extra,
    };
    const data = Object.fromEntries(ids.map((id) => [id, source[id]]));
    chart.data = { series: Object.fromEntries(ids.map((id) => [id, {}])), data, labels };
    chart.createDataSet(data, labels);
    return chart;
  };

  // 60칸 = 600px → 한 칸 10px.
  const stepParam = (count = 60) => ({
    chartRect: { x1: 0, x2: 600, y1: 0, y2: 300, chartWidth: 600, chartHeight: 300 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ graphMin: clockOf(0), graphMax: clockOf(59), minIndex: 0, maxIndex: count - 1 }],
      y: [{ graphMin: 0, graphMax: 200 }],
    },
    isHorizontal: false,
    thickness: 1,
    cPadRatio: 0,
  });

  it('labels 에 없는 x 를 시리즈 앞 범주 뒤에 끼워 시간 순 범주로 늘린다', () => {
    const chart = createStepChart({
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: SEC_5.map(clockOf),
    });

    expect(chart.data.labels).toEqual(SEC_1.map(clockOf));
    expect(chart.getMixedXLayout()).toMatchObject({ count: 60, times: null });
  });

  it('정렬 차트에서도 그리지 않는 step 축 line·timeMode bar 의 x 로는 범주를 늘리지 않는다', () => {
    const labels = SEC_5.map(clockOf);
    const chart = createStepChart({ types: { s1: 'line', s5: 'timeBar' }, labels });

    expect(chart.isMixedX).toBe(true);
    expect(chart.data.labels).toBe(labels);
  });

  it('labels 가 없어도 시리즈 x 로 범주를 만든다', () => {
    const chart = createStepChart({ types: { s1: 'categoryBar', s5: 'categoryBar' }, labels: [] });

    expect(chart.data.labels).toEqual(SEC_1.map(clockOf));
  });

  it('일반 bar 는 늘어난 범주 칸에 모두 그린다', () => {
    const chart = createStepChart({
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: SEC_5.map(clockOf),
    });
    layoutBars(chart, stepParam());

    const s1 = chart.seriesList.s1.data;
    const s5 = chart.seriesList.s5.data;
    expect(s1.every(isDrawn)).toBe(true);
    expect(s5.every(isDrawn)).toBe(true);
    expect(Math.floor(s1[3].xp / 10)).toBe(3);
    expect(Math.floor(s5[2].xp / 10)).toBe(10);
  });

  it('범주를 늘린 labels 로 다시 데이터셋을 만들어도(옵션만 바뀐 갱신) 원시값 시리즈가 밀리지 않는다', () => {
    const labels = SEC_5.map(clockOf);
    const chart = createStepChart({
      types: { s1: 'categoryBar', r: 'categoryBar' },
      labels,
      extra: { r: SEC_5.map((sec) => 200 + sec) },
    });
    chart.createDataSet(chart.data.data, chart.data.labels);

    expect(chart.seriesList.r.data[1].x).toBe(clockOf(5));
    expect(chart.data.labels).toEqual(SEC_1.map(clockOf));
  });

  it('다시 판정해 혼합이 아니게 되면 늘린 범주를 원래 labels 로 되돌린다', () => {
    const labels = SEC_5.map(clockOf);
    const chart = createStepChart({ types: { s1: 'categoryBar', s5: 'categoryBar' }, labels });
    chart.seriesList.s5.show = false;
    chart.createDataSet(chart.data.data, chart.data.labels);

    expect(chart.isMixedX).toBe(false);
    expect(chart.data.labels).toBe(labels);
  });

  it('x 가 같은 기존 step 차트는 labels 를 바꾸지 않는다', () => {
    const labels = SEC_1.map(clockOf);
    const chart = createStepChart({
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels,
      extra: { s5: SEC_1.map((sec) => ({ x: clockOf(sec), y: sec })) },
    });

    expect(chart.isMixedX).toBe(false);
    expect(chart.data.labels).toBe(labels);
  });

  const pointsAt = (secs) => secs.map((sec) => ({ x: clockOf(sec), y: sec }));
  // 각 시리즈 점의 범주 칸이 data 순서대로 오름차순이어야 hover·클릭의 이진 탐색이 맞는다.
  const expectSlotsAscending = (chart, ids) => {
    const { indexByX } = chart.getMixedXLayout();
    ids.forEach((id) => {
      const slots = chart.seriesList[id].data.map((p) => indexByX.get(p.x));
      expect(slots).toEqual([...slots].sort((a, b) => a - b));
    });
  };

  it.each([
    {
      name: '성긴 시리즈가 먼저 와도',
      types: { s5: 'categoryBar', s1: 'categoryBar' },
      labels: [],
      extra: {},
      expected: SEC_1,
    },
    {
      name: '서로 다른 시리즈가 같은 라벨 구간에 끼워도',
      types: { s4: 'categoryBar', s3: 'categoryBar' },
      labels: [clockOf(0), clockOf(10)],
      extra: { s4: pointsAt([0, 4, 8]), s3: pointsAt([0, 3, 6, 9]) },
      expected: [0, 3, 4, 6, 8, 9, 10],
    },
    {
      name: '시리즈가 라벨을 건너뛰어도',
      types: { s7: 'categoryBar', s5: 'categoryBar' },
      labels: [clockOf(0), clockOf(5), clockOf(10)],
      extra: { s7: pointsAt([0, 7, 14]), s5: pointsAt([0, 5, 10]) },
      expected: [0, 5, 7, 10, 14],
    },
  ])('늘린 범주는 시간 순이다 — $name', ({ types, labels, extra, expected }) => {
    const chart = createStepChart({ types, labels, extra });

    expect(chart.data.labels).toEqual(expected.map(clockOf));
    expectSlotsAscending(chart, Object.keys(types));
  });

  it('labels 순서와 시리즈 x 순서는 x 문자열 비교보다 앞선다', () => {
    // 자릿수가 다른 문자열은 사전순('10:00' < '9:59')이 시간 순과 반대다.
    const chart = createStepChart({
      types: { a: 'categoryBar', b: 'categoryBar' },
      labels: ['9:59', '10:00'],
      extra: {
        a: [
          { x: '9:59', y: 1 },
          { x: '9:59:30', y: 2 },
          { x: '10:00', y: 3 },
        ],
        b: [
          { x: '9:58', y: 1 },
          { x: '10:00', y: 2 },
        ],
      },
    });

    expect(chart.data.labels).toEqual(['9:58', '9:59', '9:59:30', '10:00']);
  });

  it('시리즈가 잇지 않는 labels 끼리도 순서를 바꾸지 않는다', () => {
    const labels = ['9:59', '10:00'];
    const chart = createStepChart({
      types: { a: 'categoryBar', b: 'categoryBar' },
      labels,
      extra: {
        a: [
          { x: '9:59', y: 1 },
          { x: '9:59:30', y: 2 },
        ],
        b: [
          { x: '10:00', y: 1 },
          { x: '10:00:30', y: 2 },
        ],
      },
    });

    expect(chart.data.labels.filter((value) => labels.includes(value))).toEqual(labels);
  });

  it('시리즈 x 순서가 labels 와 어긋나도 모든 값을 한 번씩 담는다', () => {
    const chart = createStepChart({
      types: { a: 'categoryBar', b: 'categoryBar' },
      labels: ['A', 'B'],
      extra: {
        a: [
          { x: 'B', y: 1 },
          { x: 'A', y: 2 },
          { x: 'C', y: 3 },
        ],
        b: [
          { x: 'A', y: 1 },
          { x: 'B', y: 2 },
        ],
      },
    });

    expect(chart.data.labels).toEqual(['A', 'B', 'C']);
  });

  it('그리지 않는 step 축 line 만 있으면 정렬 차트처럼 hover·클릭에 잡히지 않는다', () => {
    const chart = createStepChart({
      types: { s1: 'line', s5: 'line' },
      labels: SEC_5.map(clockOf),
    });
    ['s1', 's5'].forEach((id) => chart.seriesList[id].computeGeometry(stepParam(12)));

    expect(chart.isMixedX).toBe(true);
    for (let px = 0; px <= 600; px += 25) {
      expect(Object.keys(chart.findHitItem([px, 150]).items)).toEqual([]);
      expect(chart.getHitItemByPosition([px, 150], false)).toMatchObject({ sId: '', label: null });
    }
  });

  it('bar 콤보에서는 정렬 차트처럼 같은 시각의 그리지 않는 line 값도 툴팁에 담는다', () => {
    const chart = createStepChart({
      types: { s1: 'line', s5: 'categoryBar' },
      labels: SEC_5.map(clockOf),
    });
    layoutBars(chart, stepParam(12), ['s5']);
    chart.seriesList.s1.computeGeometry(stepParam(12));

    // 12칸 = 칸 50px, 25px 는 00초 칸 가운데
    const { hitId, items } = chart.findHitItem([25, 150]);
    expect(hitId).toBe('s5');
    expect(Object.keys(items).sort()).toEqual(['s1', 's5']);
  });

  it('라벨 윈도우(축 range·스크롤바)가 걸려도 윈도우 안 막대를 hover·클릭으로 찾는다', () => {
    const chart = createStepChart({
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: SEC_1.map(clockOf),
    });
    // 0~20 칸만 보인다. 그리기 경로도 hit 범위를 정하므로 draw 까지 돌린다.
    const param = {
      ...stepParam(21),
      ctx: createStubCtx(),
      showSeriesCount: 2,
      mixedXLayout: chart.getMixedXLayout(),
      mixedXInterval: chart.getMixedBarInterval(),
    };
    ['s1', 's5'].forEach((id, showIndex) => chart.seriesList[id].draw({ ...param, showIndex }));

    // 5초 시리즈 10초 막대(data 2). 그 뒤 막대들은 윈도우 밖이라 기하가 없다.
    const bar = chart.seriesList.s5.data[2];
    expect(isDrawn(chart.seriesList.s5.data[5])).toBe(false);
    const offset = [bar.xp + 1, 290];
    expect(chart.findHitItem(offset).hitId).toBe('s5');
    expect(chart.getHitItemByPosition(offset)).toMatchObject({ sId: 's5', label: clockOf(10) });
  });

  it('범주를 늘려도 원시값 시리즈의 selectLabel 값은 원래 labels 의 같은 시각 값이다', () => {
    const chart = createStepChart({
      types: { s0: 'categoryBar', s1: 'categoryBar' },
      labels: SEC_5.map(clockOf),
      extra: { s0: SEC_5.map((sec) => 1000 + sec) },
    });
    chart.options = { ...chart.options, type: 'bar', selectLabel: { use: true, limit: 5 } };
    chart.defaultSelectInfo = { dataIndex: [] };
    expect(chart.data.labels).toHaveLength(60);

    // 10초는 원래 labels 에 있고, 11초는 1초 시리즈 x 로 끼운 범주다.
    const { data } = chart.getSelectedLabelInfoWithLabelData([10, 11]);
    expect(data[0]).toEqual({ s0: 1010, s1: { x: clockOf(10), y: 20 } });
    expect(data[1]).toEqual({ s0: undefined, s1: { x: clockOf(11), y: 21 } });
    // tip 위치를 정하는 시리즈별 인덱스도 같은 시각의 원소를 가리킨다.
    expect(chart.getMixedSelectedIndices([10, 11]).get('s0')).toEqual([2]);
  });
});

describe('혼합 interval — maxTip 윈도우(범주형 축 라벨 인덱스)', () => {
  it('라벨 인덱스 윈도우 안의 시각에 있는 점 중에서 최댓값을 고른다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'line', s5: 'line' },
      labels: SEC_1.map(at),
    });

    // 라벨 0~9초: 5초 시리즈는 0·5초 점(100·105)만 윈도우 안이다
    expect(chart.getVisibleWindowMaxSeries(0, 9)).toMatchObject({
      sId: 's5',
      value: 105,
      index: 1,
      domain: at(5),
    });
  });

  it('labels 에 없는 시각의 점도 그 시각이 그려지는 칸의 윈도우에 든다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'line', s5: 'line' },
      labels: SEC_5.map(at),
    });
    chart.seriesList.s5.show = false;

    // 라벨 칸 0~1(0초·5초 칸 = 0~10초 전): 1초 시리즈 9초 점(19)이 최댓값이다
    expect(chart.getVisibleWindowMaxSeries(0, 1)).toMatchObject({ sId: 's1', value: 19, index: 9 });
  });
});

describe('혼합 interval — selectLabel(labels = 공통 시간 격자)', () => {
  const LABELS_60 = SEC_1.map(at);
  const createSelectChart = () => {
    const chart = createMixedChart({
      order: ['s5', 's1'],
      types: { s1: 'line', s5: 'line' },
      labels: LABELS_60,
    });
    chart.options = { ...chart.options, type: 'line', selectLabel: { use: true, limit: 5 } };
    chart.defaultSelectInfo = { dataIndex: [] };
    return chart;
  };

  it('값 기반 축에서 클릭한 점의 시각으로 labels 칸을 고른다', () => {
    const chart = createSelectChart();
    Object.assign(chart, {
      chartRect: { x1: 0, x2: 800, y1: 0, y2: 400 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesX: [{ units: { rectStart: 'x1', rectEnd: 'x2' } }],
      scrollbar: { x: {} },
    });

    // 5초 시리즈 10초 점(5초 시리즈 data 인덱스 2) 클릭 → labels 칸 10
    const { labelIndex } = chart.getLabelInfoByPosition([xpOf(at(10)), Y0 - 110], 'xAxis');
    expect(labelIndex).toBe(10);
  });

  it('선택 결과 data 는 그 시각과 x 가 같은 원소만 담는다', () => {
    const chart = createSelectChart();
    const result = chart.getSelectedLabelInfoWithLabelData([10, 3]);

    expect(result.label).toEqual([at(10), at(3)]);
    expect(result.data[0]).toEqual({ s5: { x: at(10), y: 110 }, s1: { x: at(10), y: 20 } });
    expect(result.data[1]).toEqual({ s5: undefined, s1: { x: at(3), y: 13 } });
  });

  it('시리즈별 선택 인덱스·tip 위치 정보도 같은 시각의 점을 쓴다', () => {
    const chart = createSelectChart();

    const selected = chart.getMixedSelectedIndices([3, 10]);
    expect(selected.get('s1')).toEqual([3, 10]);
    expect(selected.get('s5')).toEqual([2]);

    const [atTen, atThree] = chart.getItem({ dataIndex: [10, 3] });
    expect(atTen.acc).toBe(130);
    expect(atThree.acc).toBe(13);
  });

  it('원시값 시리즈가 섞여도 그 시리즈 값은 labels 인덱스로 담는다', () => {
    const chart = createSelectChart();
    const data = { ...chart.data.data, s1: SEC_1.map((sec) => 10 + sec) };
    chart.data = { ...chart.data, data };
    chart.createDataSet(data, LABELS_60);
    expect(chart.isMixedX).toBe(true);

    expect(chart.getSelectedLabelInfoWithLabelData([10]).data[0]).toEqual({
      s5: { x: at(10), y: 110 },
      s1: 20,
    });
  });
});

describe('혼합 interval — 인디케이터', () => {
  const ctx = {
    beginPath() {},
    save() {},
    setLineDash() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    restore() {},
    closePath() {},
  };

  it('툴팁 헤더와 같은 hit 시리즈 위치에 긋는다', () => {
    // 앞 시리즈가 bar 라 첫 아이템 기준이면 막대 중심(205)에 그어진다
    const chart = createMixedChart({ order: ['s5', 's1'], types: { s1: 'line', s5: 'bar' } });
    Object.assign(chart, {
      overlayCtx: ctx,
      chartRect: { x1: 0, x2: 800, y1: 0, y2: 400 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    });

    const hitInfo = chart.findHitItem([xpOf(at(10)), Y0 - 20]);
    expect(hitInfo.hitId).toBe('s1');

    const indicator = chart.drawIndicatorForTooltip(hitInfo, '#000');
    expect(indicator.position[0]).toBe(xpOf(at(10)));
    expect(indicator.labelValue).toBe(at(10));
  });
});
