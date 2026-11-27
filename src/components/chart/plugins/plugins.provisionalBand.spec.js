import { describe, it, expect, vi } from 'vitest';
import TimeBar from '../element/element.bar.time';
import EvChartZoom from '../chartZoom.core';
import modules, {
  isProvisionalBandTarget,
  getMinDoubleBorderWidth,
  findTargetPoint,
  getTimeRegion,
  getSlotRange,
  getTimeBarRange,
} from './plugins.provisionalBand';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 20, 9, 0, 0);
const at = (minutes) => T0 + minutes * MIN;

const createOptions = (overrides = {}, partial = {}) => ({
  type: 'line',
  horizontal: false,
  axesX: [{ type: 'time' }],
  provisionalBand: {
    use: true,
    x: null,
    color: 'rgba(128, 128, 128, 0.12)',
    border: { color: '#8A8F98', width: 1, segments: null },
    ...partial,
  },
  ...overrides,
});

const createCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
});

const createSeries = (minutes, overrides = {}) => ({
  show: true,
  xAxisIndex: 0,
  data: minutes.map((m) => ({ x: at(m), y: 1 })),
  ...overrides,
});

const createTimeBar = (minutes) =>
  Object.assign(new TimeBar('s1', { timeMode: true }, 0, false), {
    data: createSeries(minutes).data,
  });

const LINE_MINUTES = [0, 10, 20, 30, 40, 50, 60];

// 플롯 영역: x 100~1100(1000px), y 20~420. 축 범위 09:00~10:10 → 1분당 1000/70 px
const createChart = ({ seriesList, type = 'line', partial, ...overrides } = {}) => {
  const list = seriesList ?? { s1: createSeries(LINE_MINUTES) };
  return Object.assign(Object.create(modules), {
    options: createOptions({ type }, partial),
    seriesList: list,
    seriesInfo: { charts: { line: [], bar: [], [type]: Object.keys(list) } },
    axesSteps: { x: [{ graphMin: at(0), graphMax: at(70) }] },
    chartRect: { x1: 60, x2: 1120, y1: 10, y2: 450, chartWidth: 1060 },
    labelOffset: { left: 40, right: 20, top: 10, bottom: 30 },
    ...overrides,
  });
};

const pxOf = (minutes, { xArea = 1000, xsp = 100 } = {}) =>
  Math.ceil(xsp + (xArea / (70 * MIN)) * (minutes * MIN));

describe('isProvisionalBandTarget', () => {
  it('time x축 line·bar 에서 use 가 켜졌을 때만 대상이다', () => {
    expect(isProvisionalBandTarget(createOptions())).toBe(true);
    expect(isProvisionalBandTarget(createOptions({ type: 'bar' }))).toBe(true);
  });

  it('use 가 꺼져 있으면 대상이 아니다', () => {
    expect(isProvisionalBandTarget(createOptions({}, { use: false }))).toBe(false);
  });

  it('time 축이 없거나 가로 차트·지원하지 않는 타입이면 대상이 아니다', () => {
    expect(isProvisionalBandTarget(createOptions({ axesX: [{ type: 'step' }] }))).toBe(false);
    expect(isProvisionalBandTarget(createOptions({ type: 'bar', horizontal: true }))).toBe(false);
    expect(isProvisionalBandTarget(createOptions({ type: 'scatter' }))).toBe(false);
  });
});

describe('getMinDoubleBorderWidth', () => {
  it.each([
    { name: '기본 1px·[4, 4]', border: { width: 1, segments: null }, expected: 6 },
    { name: '굵기 2px', border: { width: 2, segments: null }, expected: 8 },
    { name: '간격 넓은 점선 [6, 6]', border: { width: 1, segments: [6, 6] }, expected: 8 },
    { name: '실선은 기본 간격', border: { width: 1, segments: [] }, expected: 6 },
    // Canvas 는 [2] 를 [2, 2] 로 이어 그린다
    { name: '홀수 길이 패턴 [2]', border: { width: 1, segments: [2] }, expected: 4 },
  ])('$name → $expected px', ({ border, expected }) => {
    expect(getMinDoubleBorderWidth(border)).toBe(expected);
  });
});

describe('findTargetPoint', () => {
  it('x 가 없으면 표시 중인 시리즈 중 마지막 데이터가 가장 늦은 시리즈의 마지막 점을 고른다', () => {
    const early = createSeries([0, 10]);
    const late = createSeries([0, 10, 20]);
    expect(findTargetPoint([early, late])).toEqual({
      series: late,
      index: 2,
      curX: at(20),
      prevX: at(10),
      nextX: null,
    });
  });

  it('x 가 있으면 그 시각의 점과 앞뒤 점을 고른다', () => {
    const series = createSeries([0, 10, 20, 30]);
    expect(findTargetPoint([series], at(10))).toEqual({
      series,
      index: 1,
      curX: at(10),
      prevX: at(0),
      nextX: at(20),
    });
  });

  it('x 를 문자열·Date 로 넘겨도 같은 시각으로 찾는다', () => {
    const series = createSeries([0, 10, 20]);
    expect(findTargetPoint([series], new Date(at(10)).toISOString())?.index).toBe(1);
  });

  // drawChart 는 범례 호버·스크롤에도 불린다 — 목표가 범위 밖이어도 시리즈를 훑지 않아야 한다
  it.each([
    ['중간 시각', 5000],
    ['모든 데이터보다 앞선 시각', -10],
    ['없는 시각', 5000.5],
  ])('x 를 이진 탐색으로 찾아 1만 점에서도 몇 점만 읽는다 (%s)', (_, minute) => {
    const series = createSeries(Array.from({ length: 10_000 }, (__, i) => i));
    const xGetter = vi.fn();
    series.data = series.data.map((item) =>
      Object.defineProperty({ ...item }, 'x', {
        get() {
          xGetter();
          return item.x;
        },
      }),
    );

    findTargetPoint([series], at(minute));
    expect(xGetter.mock.calls.length).toBeLessThanOrEqual(20);
  });

  it('accept 를 통과하지 못한 시리즈는 건너뛰고 다음 시리즈에서 찾는다', () => {
    const linear = createSeries([0, 10, 20], { xAxisIndex: 1 });
    const time = createSeries([0, 10, 20]);
    expect(findTargetPoint([linear, time], at(10), (series) => series.xAxisIndex === 0)?.series).toBe(
      time,
    );
  });

  it('x 에 해당하는 점이 없으면 null 이다', () => {
    expect(findTargetPoint([createSeries([0, 10, 20])], at(15))).toBeNull();
  });

  it('숨긴 시리즈는 고르지 않는다', () => {
    const shown = createSeries([0, 10]);
    const hidden = createSeries([0, 10, 20], { show: false });
    expect(findTargetPoint([shown, hidden])?.series).toBe(shown);
    expect(findTargetPoint([hidden], at(20))).toBeNull();
  });

  it('데이터가 없으면 null 이다', () => {
    expect(findTargetPoint([createSeries([]), undefined])).toBeNull();
  });

  it('최신 시각이 같은 다른 시리즈의 직전 점은 읽지 않는다', () => {
    const first = createSeries([0, 10, 20]);
    const second = createSeries([0, 10, 20]);
    const readUnusedNeighbor = vi.fn(() => at(10));
    Object.defineProperty(second.data[1], 'x', { get: readUnusedNeighbor });

    expect(findTargetPoint([first, second])?.series).toBe(first);
    expect(readUnusedNeighbor).not.toHaveBeenCalled();
  });
});

describe('getTimeRegion', () => {
  const axis = { graphMin: at(0), graphMax: at(70) };
  const base = { axis, xArea: 1000, xsp: 100, minX: 100, maxX: 1100 };

  it('line 의 마지막 점은 직전 점과의 중간부터 플롯 끝까지다', () => {
    expect(
      getTimeRegion({ ...base, curX: at(60), prevX: at(50), nextX: null }),
    ).toEqual({ startX: pxOf(55), endX: 1100, isClipped: false });
  });

  it('line 의 중간 점은 앞뒤 점과의 중간 사이만이다', () => {
    expect(
      getTimeRegion({ ...base, curX: at(30), prevX: at(20), nextX: at(40) }),
    ).toEqual({ startX: pxOf(25), endX: pxOf(35), isClipped: false });
  });

  it('점이 축 범위보다 뒤면 그리지 않는다', () => {
    expect(
      getTimeRegion({ ...base, curX: at(80), prevX: at(70), nextX: null }),
    ).toBeNull();
  });

  // 데이터가 09:20 에 끝나고 축이 09:30~09:40 이면 빈 플롯 전체가 칠해지던 문제
  it('line 의 점이 축 범위보다 앞이면 그리지 않는다', () => {
    const later = { graphMin: at(30), graphMax: at(40) };
    expect(
      getTimeRegion({
        ...base,
        axis: later,
        curX: at(20),
        prevX: at(10),
        nextX: null,
      }),
    ).toBeNull();
  });

  it('끝 경계가 축 최대값을 넘으면 플롯 끝에서 자른다', () => {
    const narrow = { graphMin: at(0), graphMax: at(32) };
    expect(
      getTimeRegion({
        ...base,
        axis: narrow,
        curX: at(30),
        prevX: at(20),
        nextX: at(40),
      })?.endX,
    ).toBe(1100);
  });
});

describe('getTimeBarRange', () => {
  const axis = { graphMin: at(0), graphMax: at(70) };
  const base = { axis, xArea: 1000, minX: 100, maxX: 1100, slotWidth: 100, barWidth: 96 };

  // 막대는 시각 간격이 아니라 플롯 폭 / 데이터 개수 칸에 그려진다(element.bar.time)
  it('막대 시각부터 플롯 폭을 데이터 개수로 나눈 칸만큼이다', () => {
    expect(getTimeBarRange({ ...base, curX: at(30) })).toEqual({
      startX: Math.ceil(pxOf(30)),
      endX: Math.ceil(pxOf(30) + 100),
      isClipped: false,
    });
  });

  it('칸이 축 시작 이전에 끝나면 그리지 않는다', () => {
    const later = { graphMin: at(30), graphMax: at(40) };
    expect(getTimeBarRange({ ...base, axis: later, curX: at(20) })).toBeNull();
  });

  it('칸이 축 시작에 걸치면 플롯 왼쪽부터 칠하고 잘렸다고 알린다', () => {
    const later = { graphMin: at(21), graphMax: at(40) };
    expect(
      getTimeBarRange({ ...base, axis: later, curX: at(20), slotWidth: 500, barWidth: 496 }),
    ).toEqual({
      startX: 100,
      endX: Math.ceil(100 - 1000 / 19 + 500),
      isClipped: true,
    });
  });

  it('막대가 플롯 오른쪽 끝 이후에 시작하면 그리지 않는다', () => {
    expect(getTimeBarRange({ ...base, curX: at(80) })).toBeNull();
  });

  it('칸이 플롯 끝을 넘으면 플롯 끝에서 자른다', () => {
    expect(getTimeBarRange({ ...base, curX: at(65) })?.endX).toBe(1100);
  });
});

describe('getSlotRange', () => {
  it('가시 구간이 없으면 전체 데이터를 슬롯으로 나눠 index 번째 슬롯 범위를 준다', () => {
    expect(getSlotRange({ index: 3, count: 4, xArea: 400, minX: 100 })).toEqual({
      startX: 400,
      endX: 500,
    });
    expect(getSlotRange({ index: 6, count: 7, xArea: 1000, minX: 100 })).toEqual({
      startX: 958,
      endX: 1100,
    });
  });

  it('중간 막대는 그 슬롯만이다', () => {
    expect(getSlotRange({ index: 1, count: 4, xArea: 400, minX: 100 })).toEqual({
      startX: 200,
      endX: 300,
    });
  });

  it('스크롤 가시 구간 안에서 슬롯을 나눈다', () => {
    expect(
      getSlotRange({ index: 9, count: 10, minIndex: 5, maxIndex: 9, xArea: 500, minX: 0 }),
    ).toEqual({ startX: 400, endX: 500 });
  });

  it('슬롯이 가시 구간 밖이거나 데이터가 없으면 null 이다', () => {
    expect(
      getSlotRange({ index: 9, count: 10, minIndex: 0, maxIndex: 4, xArea: 500, minX: 0 }),
    ).toBeNull();
    expect(getSlotRange({ index: 0, count: 0, xArea: 500, minX: 0 })).toBeNull();
    expect(
      getSlotRange({ index: 2, count: 3, minIndex: 0, maxIndex: -1, xArea: 500, minX: 0 }),
    ).toBeNull();
  });
});

describe('drawProvisionalBand', () => {
  it('line 은 마지막 점 구간을 플롯 오른쪽 끝까지 칠하고 시작점에 점선을 긋는다', () => {
    const ctx = createCtx();
    createChart().drawProvisionalBand(ctx);

    const startX = pxOf(55);
    expect(ctx.fillStyle).toBe('rgba(128, 128, 128, 0.12)');
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
    expect(ctx.moveTo).toHaveBeenCalledWith(startX + 0.5, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(startX + 0.5, 420);
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  // 끝을 미래로 잡은 조회는 집계 중인 버킷이 중간에 있다 — 그 버킷만 칠한다
  it('x 로 지정한 중간 점은 앞뒤 점과의 중간 사이만 칠하고 양쪽 경계에 점선을 긋는다', () => {
    const ctx = createCtx();
    createChart({ partial: { x: at(30) } }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(25), 20, pxOf(35) - pxOf(25), 400);
    expect(ctx.moveTo.mock.calls).toEqual([
      [pxOf(25) + 0.5, 20],
      [pxOf(35) + 0.5, 20],
    ]);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  // 하루 범위의 10분 버킷처럼 좁으면 두 점선이 붙어 이중선처럼 보인다
  it('중간 버킷이라도 폭이 6px 보다 좁으면 왼쪽 경계에만 점선을 긋는다', () => {
    const ctx = createCtx();
    // 플롯 1000px 에 이틀(2880분) → 10분 버킷 약 3.5px
    const minutes = Array.from({ length: 289 }, (_, i) => i * 10);
    createChart({
      partial: { x: at(600) },
      seriesList: { s1: createSeries(minutes) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(2880) }] },
    }).drawProvisionalBand(ctx);

    const [[startX, , width]] = ctx.fillRect.mock.calls;
    expect(width).toBeLessThan(6);
    expect(ctx.moveTo.mock.calls).toEqual([[startX + 0.5, 20]]);
  });

  // 같은 폭이라도 선이 굵어지면 두 선이 붙어 보이는 폭도 커진다
  it('선 굵기가 커지면 그만큼 넓은 영역도 한 줄로 긋는다', () => {
    const ctx = createCtx();
    const minutes = Array.from({ length: 145 }, (_, i) => i * 10);
    createChart({
      partial: {
        x: at(600),
        border: { color: '#8A8F98', width: 2, segments: null },
      },
      seriesList: { s1: createSeries(minutes) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(1440) }] },
    }).drawProvisionalBand(ctx);

    // 플롯 1000px 에 하루 → 10분 버킷 약 7px: 1px 이면 양쪽(기준 6px), 2px 이면 한 줄(기준 8px)
    const [[startX, , width]] = ctx.fillRect.mock.calls;
    expect(width).toBeGreaterThanOrEqual(6);
    expect(width).toBeLessThan(8);
    expect(ctx.moveTo.mock.calls).toEqual([[startX, 20]]);
  });

  it('플롯 끝까지 칠하는 마지막 버킷은 왼쪽 경계에만 점선을 긋는다', () => {
    const ctx = createCtx();
    createChart().drawProvisionalBand(ctx);

    expect(ctx.moveTo.mock.calls).toEqual([[pxOf(55) + 0.5, 20]]);
  });

  it('왼쪽이 잘린 중간 버킷은 오른쪽 경계에만 점선을 긋는다', () => {
    const ctx = createCtx();
    createChart({
      partial: { x: at(10) },
      axesSteps: { x: [{ graphMin: at(5), graphMax: at(70) }] },
    }).drawProvisionalBand(ctx);

    const endX = Math.ceil(100 + (1000 / (65 * MIN)) * (10 * MIN));
    expect(ctx.moveTo.mock.calls).toEqual([[endX + 0.5, 20]]);
  });

  it('x 로 지정한 중간 막대는 그 슬롯만 칠한다', () => {
    const ctx = createCtx();
    createChart({ type: 'bar', partial: { x: at(30) } }).drawProvisionalBand(ctx);

    const slot = 1000 / 7;
    const startX = Math.ceil(100 + slot * 3);
    const endX = Math.ceil(100 + slot * 4);
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, endX - startX, 400);
  });

  it('x 에 해당하는 점이 없으면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({ partial: { x: at(35) } }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  // 줌은 data.labels 를 잘라 넘겨 잘린 구간의 끝을 최신 데이터로 오인하던 문제
  it('x 없이 마지막 데이터를 쓸 때 줌 구간이 원본의 끝을 포함하지 않으면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({ isLatestDataInView: () => false }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('x 를 지정하면 줌 판정과 무관하게 그 점이 화면 데이터에 있으면 그린다', () => {
    const ctx = createCtx();
    createChart({ partial: { x: at(30) }, isLatestDataInView: () => false }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  it('줌 구간이 마지막 데이터를 포함하면 그린다', () => {
    const ctx = createCtx();
    createChart({ isLatestDataInView: () => true }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  it.each([
    { name: '숨긴 시리즈의 원본 길이가 더 긴 경우', labels: [], hideLonger: true },
    { name: '객체 시계열보다 라벨이 짧은 경우', labels: [at(0), at(10)], hideLonger: false },
  ])('줌 후 표시 가능한 시리즈의 원본 최신 시각을 사용한다 ($name)', ({
    labels, hideLonger,
  }) => {
    // s1의 실제 최신 시각은 09:10, s2의 실제 최신 시각은 09:20이다.
    const original = {
      labels,
      series: { s1: {}, s2: {} },
      data: { s1: createSeries([0, 10]).data, s2: createSeries([0, 10, 20]).data },
    };
    const zoom = new EvChartZoom(
      { props: { data: [structuredClone(original)] }, dom: [] },
      { data: [original] },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );
    zoom.executeZoom(0, 1);

    const ctx = createCtx();
    createChart({
      seriesList: {
        s1: createSeries([0, 10], { sId: 's1' }),
        s2: createSeries([0, 10], { sId: 's2', show: !hideLonger }),
      },
      isLatestDataInView: () => zoom.isLatestDataInView(),
      getZoomSeriesSource: (id) => zoom.getZoomSeriesSource(id),
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(hideLonger ? 1 : 0);
  });

  // labels 없이 { x, y } 로 전달한 line 도 시리즈 데이터의 x 로 경계를 잡는다
  it('labels 없이 시리즈 데이터만 있어도 그린다', () => {
    const ctx = createCtx();
    createChart({ data: { labels: [] } }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(55), 20, 1100 - pxOf(55), 400);
  });

  // 첫 시리즈가 linear 축이면 뒤의 time 축 시리즈에 같은 점이 있어도 빠지던 문제
  it('time 축이 아닌 시리즈가 앞에 있어도 time 축 시리즈로 그린다', () => {
    const ctx = createCtx();
    createChart({
      partial: { x: at(30) },
      seriesList: {
        s1: createSeries(LINE_MINUTES, { xAxisIndex: 1 }),
        s2: createSeries(LINE_MINUTES),
      },
      options: createOptions({ axesX: [{ type: 'time' }, { type: 'linear' }] }, { x: at(30) }),
      axesSteps: {
        x: [
          { graphMin: at(0), graphMax: at(70) },
          { graphMin: 0, graphMax: 100 },
        ],
      },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(25), 20, pxOf(35) - pxOf(25), 400);
  });

  it('같은 대상 시각이 앞 시리즈의 축 범위 밖이면 다음 시리즈로 그린다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: {
        s1: createSeries(LINE_MINUTES, { xAxisIndex: 1 }),
        s2: createSeries(LINE_MINUTES),
      },
      options: createOptions({ axesX: [{ type: 'time' }, { type: 'time' }] }),
      axesSteps: {
        x: [
          { graphMin: at(0), graphMax: at(70) },
          { graphMin: at(0), graphMax: at(55) },
        ],
      },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(55), 20, 1100 - pxOf(55), 400);
  });

  it('최신 시각이 축 범위 밖이면 다른 시리즈의 과거 점을 칠하지 않는다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: {
        s1: createSeries([0, 10, 20]),
        s2: createSeries([0, 5, 10]),
      },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(15) }] },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('첫 후보가 플롯 오른쪽 끝에서 폭 0이면 같은 시각의 다음 후보를 그린다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: {
        s1: createSeries([10], { xAxisIndex: 1 }),
        s2: createSeries([0, 10, 20]),
      },
      options: createOptions({ axesX: [{ type: 'time' }, { type: 'time' }] }, { x: at(10) }),
      axesSteps: {
        x: [
          { graphMin: at(0), graphMax: at(30) },
          { graphMin: at(0), graphMax: at(10) },
        ],
      },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(267, 20, 333, 400);
  });

  it.each([
    { name: '불규칙 간격', start: 0, end: 1, xy: false },
    { name: '한 점만 남긴 객체 데이터', start: 1, end: 1, xy: true },
  ])('고정축 줌 후에도 원본 이웃으로 중간 버킷 경계를 유지한다 ($name)', ({
    start, end, xy,
  }) => {
    const minutes = [0, 10, 30];
    const data = {
      labels: xy ? [] : minutes.map(at),
      series: { s1: {} },
      data: { s1: xy ? minutes.map((minute) => ({ x: at(minute), y: 1 })) : [1, 1, 1] },
    };
    const display = structuredClone(data);
    const zoom = new EvChartZoom(
      { props: { data: [display] }, dom: [] },
      { data: [data] },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );
    zoom.executeZoom(start, end);
    const ctx = createCtx();
    createChart({
      partial: { x: at(10) },
      seriesList: {
        s1: createSeries(minutes.slice(start, end + 1), { sId: 's1' }),
      },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(40) }] },
      isLatestDataInView: () => zoom.isLatestDataInView(),
      getZoomSeriesSource: (seriesId) => zoom.getZoomSeriesSource?.(seriesId),
    }).drawProvisionalBand(ctx);

    expect(display.data.s1).toHaveLength(end - start + 1);
    expect(ctx.fillRect).toHaveBeenCalledWith(225, 20, 375, 400);
  });

  it('x 로 지정한 점이 원본의 마지막이면 플롯 끝까지 칠한다', () => {
    const ctx = createCtx();
    createChart({
      partial: { x: at(10) },
      seriesList: { s1: createSeries([0, 10]) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(30) }] },
      isLatestDataInView: () => true,
    }).drawProvisionalBand(ctx);

    const [[startX, , width]] = ctx.fillRect.mock.calls;
    expect(startX + width).toBe(1100);
  });

  it('같은 줌 구간을 다시 그릴 때 원본의 비어 있는 라벨 구간을 다시 훑지 않는다', () => {
    const ctx = createCtx();
    const source = {
      range: [3, 3],
      data: [1, 1, 1, 1],
      labels: [at(0), null, null, at(10)],
    };
    const readGap = vi.fn(() => null);
    Object.defineProperty(source.labels, 2, { get: readGap });
    const chart = createChart({
      partial: { x: at(10) },
      seriesList: { s1: createSeries([10]) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(40) }] },
      getZoomSeriesSource: () => ({ ...source }),
    });

    chart.drawProvisionalBand(ctx);
    chart.drawProvisionalBand(ctx);
    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    expect(readGap).toHaveBeenCalledTimes(1);
  });

  // 600px 에 24시간이면 1분 버킷의 두 경계가 같은 픽셀로 반올림된다
  it('두 경계가 같은 픽셀이면 배경 없이 점선 한 줄만 긋는다', () => {
    const ctx = createCtx();
    const minutes = Array.from({ length: 1441 }, (_, i) => i);
    createChart({
      // 1분 = 0.1px → 604.5분·605.5분 경계가 모두 161px
      partial: { x: at(605) },
      seriesList: { s1: createSeries(minutes) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(10_000) }] },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
  });

  it('두 번째 x축에 연결된 시리즈는 그 축의 범위로 계산한다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: { s1: createSeries([0, 10, 20], { xAxisIndex: 1 }) },
      options: createOptions({ axesX: [{ type: 'time' }, { type: 'time' }] }),
      axesSteps: {
        x: [
          { graphMin: at(0), graphMax: at(10) },
          { graphMin: at(0), graphMax: at(30) },
        ],
      },
    }).drawProvisionalBand(ctx);

    const startX = Math.ceil(100 + (1000 / (30 * MIN)) * (15 * MIN));
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('combo line 은 막대 슬롯 오프셋을 반영해 점 위치에 맞춘다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: { s1: createSeries(LINE_MINUTES, { combo: true }) },
    }).drawProvisionalBand(ctx);

    const slot = 1000 / LINE_MINUTES.length;
    const startX = pxOf(55, { xArea: 1000 - slot, xsp: 100 + slot / 2 });
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('slot bar 는 마지막 막대 슬롯을 칠한다', () => {
    const ctx = createCtx();
    createChart({ type: 'bar' }).drawProvisionalBand(ctx);

    // 데이터 7개 → 슬롯 폭 1000/7, 마지막 슬롯(인덱스 6) 왼쪽 끝(올림)
    const startX = Math.ceil(100 + (1000 / 7) * 6);
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
    expect(ctx.moveTo).toHaveBeenCalledWith(startX + 0.5, 20);
  });

  // 숨긴 timeMode 막대가 배치 방식 판정에 끼어 일반 막대의 강조를 없애던 문제
  it('숨긴 timeMode 막대는 일반 막대의 배치 판정에 끼지 않는다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      seriesList: {
        s1: createSeries(LINE_MINUTES),
        s2: createSeries([...LINE_MINUTES, 70], { show: false, timeMode: true }),
      },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(60) }] },
    }).drawProvisionalBand(ctx);

    const startX = Math.ceil(100 + (1000 / 7) * 6);
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('timeMode bar 는 마지막 시각부터 칠한다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      seriesList: { s1: createTimeBar(LINE_MINUTES) },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(60), 20, 1100 - pxOf(60), 400);
  });

  it('timeMode 막대가 두께 때문에 표시 범위에 닿지 않으면 칠하지 않는다', () => {
    const ctx = createCtx();
    const chart = createChart({
      type: 'bar',
      seriesList: { s1: createTimeBar([0, 10, 20]) },
      options: createOptions({ type: 'bar', thickness: 0.1 }),
      axesSteps: {
        x: [{ graphMin: at(21), graphMax: at(30) }],
        y: [{ graphMin: 0, graphMax: 2 }],
      },
    });
    const series = chart.seriesList.s1;
    series.computeGeometry({
      chartRect: chart.chartRect,
      labelOffset: chart.labelOffset,
      axesSteps: chart.axesSteps,
      showIndex: 0,
      showSeriesCount: 1,
      thickness: chart.options.thickness,
    });

    expect(series.data.at(-1).xp).toBeNull();
    chart.drawProvisionalBand(ctx);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('x 를 지정하지 않은 timeMode 막대는 축에 여유가 있어도 오른쪽 끝까지 칠한다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      seriesList: { s1: createTimeBar([0, 10, 20]) },
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(60) }] },
    }).drawProvisionalBand(ctx);

    const [[startX, , width]] = ctx.fillRect.mock.calls;
    expect(startX + width).toBe(1100);
  });

  it('timeMode 막대가 나란히 배치되며 플롯 오른쪽 밖으로 밀리면 칠하지 않는다', () => {
    const ctx = createCtx();
    const chart = createChart({
      type: 'bar',
      partial: { x: at(69) },
      seriesList: {
        s1: createTimeBar([0, 10, 20]),
        s2: createTimeBar([0, 10, 69]),
      },
      axesSteps: {
        x: [{ graphMin: at(0), graphMax: at(70) }],
        y: [{ graphMin: 0, graphMax: 2 }],
      },
    });
    const series = chart.seriesList.s2;
    series.computeGeometry({
      chartRect: chart.chartRect,
      labelOffset: chart.labelOffset,
      axesSteps: chart.axesSteps,
      showIndex: 1,
      showSeriesCount: 2,
      thickness: 1,
    });

    expect(series.data.at(-1).xp).toBeGreaterThan(1100);
    chart.drawProvisionalBand(ctx);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('slot bar 의 마지막 슬롯이 가시 구간 밖이면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(70), minIndex: 0, maxIndex: 3 }] },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('사용자가 지정한 점선 패턴을 그대로 쓴다', () => {
    const ctx = createCtx();
    const chart = createChart();
    chart.options.provisionalBand.border.segments = [];
    chart.drawProvisionalBand(ctx);

    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
  });

  it('border.width 가 0 이면 영역만 칠한다', () => {
    const ctx = createCtx();
    const chart = createChart();
    chart.options.provisionalBand.border.width = 0;
    chart.drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('color 가 null 이면 기본 배경색으로 칠한다', () => {
    const ctx = createCtx();
    createChart({ partial: { color: null } }).drawProvisionalBand(ctx);

    expect(ctx.fillStyle).toBe('rgba(128, 128, 128, 0.12)');
  });

  it('시작점이 축 최소값보다 앞이면 플롯 왼쪽 끝부터 칠하고 점선은 긋지 않는다', () => {
    const ctx = createCtx();
    createChart({ seriesList: { s1: createSeries([-20, 10]) } }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(100, 20, 1000, 400);
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('시리즈가 연결된 축이 time 이 아니면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: { s1: createSeries([0, 10, 20], { xAxisIndex: 1 }) },
      options: createOptions({ axesX: [{ type: 'time' }, { type: 'linear' }] }),
      axesSteps: {
        x: [
          { graphMin: at(0), graphMax: at(30) },
          { graphMin: at(0), graphMax: at(30) },
        ],
      },
    }).drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('대상 차트가 아니면 아무것도 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({ options: createOptions({ axesX: [{ type: 'step' }] }) }).drawProvisionalBand(ctx);

    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});

// 소비처는 이 값으로 툴팁 등 차트 밖 표시를 음영과 맞춘다(provisional-band-change)
describe('drawProvisionalBand — 칠한 x 기록', () => {
  it('칠한 점의 x 를 provisionalBandDrawnX 에 남긴다', () => {
    const chart = createChart();
    chart.drawProvisionalBand(createCtx());

    expect(chart.provisionalBandDrawnX).toBe(at(60));
  });

  it('x 로 지정한 점을 칠하면 그 x 를 남긴다', () => {
    const chart = createChart({ partial: { x: at(30) } });
    chart.drawProvisionalBand(createCtx());

    expect(chart.provisionalBandDrawnX).toBe(at(30));
  });

  it('x 에 해당하는 점이 없어 칠하지 못하면 null 이다', () => {
    const chart = createChart({ partial: { x: at(35) } });
    chart.drawProvisionalBand(createCtx());

    expect(chart.provisionalBandDrawnX).toBeNull();
  });

  // DST 가 끝나는 날 벽시계가 되돌아가 01:59 → 01:30 → 01:35 처럼 앞 점이 더 늦으면, 시작 경계(앞 점과의
  // 중간)가 끝 경계(뒤 점과의 중간)보다 뒤라 칠할 구간이 없다
  it('x 를 찾았어도 앞뒤 경계가 뒤집혀 칠하지 못하면 null 이다', () => {
    const chart = createChart({
      seriesList: { s1: createSeries([0, 59, 30, 35, 60]) },
      partial: { x: at(30) },
    });
    const ctx = createCtx();
    chart.drawProvisionalBand(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(chart.provisionalBandDrawnX).toBeNull();
  });

  it('대상 차트가 아니게 되면 직전에 남긴 x 를 지운다', () => {
    const chart = createChart();
    chart.drawProvisionalBand(createCtx());
    chart.options = createOptions({}, { use: false });
    chart.drawProvisionalBand(createCtx());

    expect(chart.provisionalBandDrawnX).toBeNull();
  });
});

describe('isProvisionalBandX', () => {
  it('직전 렌더에서 칠한 점의 x 면 true 다 — 숫자·Date 모두 같은 시각으로 본다', () => {
    const chart = createChart({ partial: { x: at(30) } });
    chart.drawProvisionalBand(createCtx());

    expect(chart.isProvisionalBandX(at(30))).toBe(true);
    expect(chart.isProvisionalBandX(new Date(at(30)))).toBe(true);
    expect(chart.isProvisionalBandX(at(20))).toBe(false);
  });

  it('칠하지 못한 프레임에는 어떤 점도 해당하지 않는다', () => {
    const chart = createChart({
      seriesList: { s1: createSeries([0, 59, 30, 35, 60]) },
      partial: { x: at(30) },
    });
    chart.drawProvisionalBand(createCtx());

    expect(chart.isProvisionalBandX(at(30))).toBe(false);
  });

  it('한 번도 그리지 않았거나 x 가 없으면 false 다', () => {
    const chart = createChart();

    expect(chart.isProvisionalBandX(at(60))).toBe(false);
    chart.drawProvisionalBand(createCtx());
    expect(chart.isProvisionalBandX(undefined)).toBe(false);
  });
});
