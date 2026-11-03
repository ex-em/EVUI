import { describe, it, expect, vi, afterEach } from 'vitest';
import interaction from './plugins/plugins.interaction';
import store from './model/model.store';
import Line from './element/element.line';
import Bar from './element/element.bar';
import TimeBar from './element/element.bar.time';

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

const createMixedChart = ({ order, types, labels = [] }) => {
  const seriesList = {};
  const charts = { line: [], bar: [], scatter: [], pie: [], heatMap: [] };

  order.forEach((id, idx) => {
    seriesList[id] = createSeries(types[id], id, idx);
    charts[types[id] === 'line' ? 'line' : 'bar'].push(id);
  });

  const chart = Object.assign(Object.create(interaction), store, {
    seriesList,
    seriesInfo: { charts },
    options: { horizontal: false },
    tooltipCtx: null,
    getFormattedTooltipLabel: ({ seriesName }) => seriesName,
    getFormattedTooltipValue: ({ value }) => String(value),
    isNotUseIndicator: () => false,
  });

  const data = Object.fromEntries(order.map((id) => [
    id,
    SOURCE[id].secs.map((sec) => ({ x: at(sec), y: SOURCE[id].valueOf(sec) })),
  ]));
  chart.createDataSet(data, labels);

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

const ORDERS = [['s1', 's5'], ['s5', 's1']];

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

describe('혼합 interval — 클릭(getHitItemByPosition)', () => {
  it.each(ORDERS)('line 두 시리즈, 순서 %s → %s: 10초 1초 점을 클릭하면 10초가 선택된다', (first, second) => {
    const chart = createMixedChart({
      order: [first, second],
      types: { s1: 'line', s5: 'line' },
    });
    const hit = chart.getHitItemByPosition([xpOf(at(10)), Y0 - 20], false, undefined, false, true);

    expect(hit.sId).toBe('s1');
    expect(hit.label).toBe(at(10));
    expect(hit.value).toBe(20);
  });
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
        isExistGrp: true, stackIndex: 0, groupIndex: 0,
      }),
      top: Object.assign(new Line('top', { name: 'top' }, 1), {
        isExistGrp: true, stackIndex: 1, groupIndex: 0,
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

    expect(line.size.comboOffset).toBe(10);
  });
});

describe('혼합 interval — 범주형 축 일반 bar 배치', () => {
  // 단언이 실패해도 다음 테스트에 console.warn spy 호출 수가 넘어가지 않게 한다.
  afterEach(() => vi.restoreAllMocks());

  const LABELS_60 = SEC_1.map(at);
  // 60칸 = 600px → 한 칸 10px. categoryMode 축처럼 라벨 인덱스 윈도우(0~59)를 준다.
  const categoryParam = (extra) => ({
    chartRect: { x1: 0, x2: 600, y1: 0, y2: 300, chartWidth: 600, chartHeight: 300 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ graphMin: at(0), graphMax: at(59), minIndex: 0, maxIndex: 59 }],
      y: [{ graphMin: 0, graphMax: 200 }],
    },
    isHorizontal: false,
    thickness: 1,
    cPadRatio: 0,
    showSeriesCount: 2,
    ...extra,
  });

  it('5초 막대가 자기 배열 순서가 아니라 같은 시각의 라벨 칸에 놓인다', () => {
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: LABELS_60,
    });
    ['s1', 's5'].forEach((id, showIndex) => {
      chart.seriesList[id].computeGeometry(
        categoryParam({ showIndex, mixedLabels: chart.mixedLabels }),
      );
    });

    const s1At10 = chart.seriesList.s1.data[10];
    const s5At10 = chart.seriesList.s5.data[2];
    expect(s5At10.xp).toBe(s1At10.xp + s1At10.w);
    expect(Math.floor(s5At10.xp / 10)).toBe(10);
  });

  it('labels 에 없는 x 의 막대는 그리지 않고 경고를 한 번 남긴다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
      labels: LABELS_60.slice(0, 30),
    });
    chart.seriesList.s5.computeGeometry(
      categoryParam({ showIndex: 1, mixedLabels: chart.mixedLabels }),
    );

    expect(chart.seriesList.s5.data[6].xp).toBe(null); // 30초 — labels 밖
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('labels 가 없으면 배치 맵 없이 경고한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = createMixedChart({
      order: ['s1', 's5'],
      types: { s1: 'categoryBar', s5: 'categoryBar' },
    });

    expect(chart.mixedLabels).toBe(null);
    expect(warn).toHaveBeenCalledTimes(1);
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
      sId: 's5', value: 105, index: 1, domain: at(5),
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
