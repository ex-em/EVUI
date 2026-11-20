import { describe, it, expect, vi } from 'vitest';
import modules, {
  isPartialDataTarget,
  findLatestSeries,
  getTimeRegionStart,
  getLastSlotStartX,
} from './plugins.partialData';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 20, 9, 0, 0);
const at = (minutes) => T0 + minutes * MIN;

const createOptions = (overrides = {}) => ({
  type: 'line',
  horizontal: false,
  axesX: [{ type: 'time' }],
  partialData: {
    use: true,
    color: 'rgba(214, 170, 98, 0.16)',
    border: { color: '#C9A063', width: 1, segments: null },
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

const LINE_MINUTES = [0, 10, 20, 30, 40, 50, 60];

// 플롯 영역: x 100~1100(1000px), y 20~420. 축 범위 09:00~10:10 → 1분당 1000/70 px
const createChart = ({ seriesList, type = 'line', ...overrides } = {}) => {
  const list = seriesList ?? { s1: createSeries(LINE_MINUTES) };
  return Object.assign(Object.create(modules), {
    options: createOptions({ type }),
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

describe('isPartialDataTarget', () => {
  it('time x축 line·bar 에서 use 가 켜졌을 때만 대상이다', () => {
    expect(isPartialDataTarget(createOptions())).toBe(true);
    expect(isPartialDataTarget(createOptions({ type: 'bar' }))).toBe(true);
  });

  it('use 가 꺼져 있으면 대상이 아니다', () => {
    const options = createOptions();
    options.partialData.use = false;
    expect(isPartialDataTarget(options)).toBe(false);
  });

  it('time 축이 없거나 가로 차트·지원하지 않는 타입이면 대상이 아니다', () => {
    expect(isPartialDataTarget(createOptions({ axesX: [{ type: 'step' }] }))).toBe(false);
    expect(isPartialDataTarget(createOptions({ type: 'bar', horizontal: true }))).toBe(false);
    expect(isPartialDataTarget(createOptions({ type: 'scatter' }))).toBe(false);
  });
});

describe('findLatestSeries', () => {
  it('표시 중인 시리즈 중 마지막 데이터가 가장 늦은 시리즈를 고른다', () => {
    const early = createSeries([0, 10]);
    const late = createSeries([0, 10, 20]);
    expect(findLatestSeries([early, late])).toEqual({ series: late, lastX: at(20), prevX: at(10) });
  });

  it('숨긴 시리즈는 마지막 데이터가 더 늦어도 고르지 않는다', () => {
    const shown = createSeries([0, 10]);
    const hidden = createSeries([0, 10, 20], { show: false });
    expect(findLatestSeries([shown, hidden])?.series).toBe(shown);
  });

  it('데이터가 없으면 null 이다', () => {
    expect(findLatestSeries([createSeries([]), undefined])).toBeNull();
  });
});

describe('getTimeRegionStart', () => {
  const axis = { graphMin: at(0), graphMax: at(70) };
  const base = { axis, xArea: 1000, xsp: 100, minX: 100 };

  it('line 은 직전 점과 마지막 점의 중간에서 시작한다', () => {
    expect(getTimeRegionStart({ ...base, lastX: at(60), prevX: at(50), isTimeBar: false })).toEqual(
      { startX: pxOf(55), isClipped: false },
    );
  });

  it('timeMode bar 는 마지막 막대의 왼쪽 끝(마지막 시각)에서 시작한다', () => {
    expect(getTimeRegionStart({ ...base, lastX: at(60), prevX: at(50), isTimeBar: true })).toEqual({
      startX: pxOf(60),
      isClipped: false,
    });
  });

  it('마지막 점이 축 범위보다 뒤면 그리지 않는다', () => {
    expect(
      getTimeRegionStart({ ...base, lastX: at(80), prevX: at(70), isTimeBar: false }),
    ).toBeNull();
  });

  // 데이터가 09:20 에 끝나고 축이 09:30~09:40 이면 빈 플롯 전체가 칠해지던 문제
  it('line 의 마지막 점이 축 범위보다 앞이면 그리지 않는다', () => {
    const later = { graphMin: at(30), graphMax: at(40) };
    expect(
      getTimeRegionStart({ ...base, axis: later, lastX: at(20), prevX: at(10), isTimeBar: false }),
    ).toBeNull();
  });

  it('timeMode bar 의 마지막 막대가 축 시작 이전에 끝나면 그리지 않는다', () => {
    const later = { graphMin: at(30), graphMax: at(40) };
    expect(
      getTimeRegionStart({ ...base, axis: later, lastX: at(20), prevX: at(10), isTimeBar: true }),
    ).toBeNull();
  });

  it('timeMode bar 의 마지막 막대가 축 시작에 걸치면 플롯 왼쪽부터 칠하고 잘렸다고 알린다', () => {
    const later = { graphMin: at(25), graphMax: at(40) };
    expect(
      getTimeRegionStart({ ...base, axis: later, lastX: at(20), prevX: at(10), isTimeBar: true }),
    ).toEqual({ startX: 100, isClipped: true });
  });
});

describe('getLastSlotStartX', () => {
  it('가시 구간이 없으면 전체 데이터를 슬롯으로 나눠 마지막 슬롯의 왼쪽 끝을 준다', () => {
    expect(getLastSlotStartX({ labelCount: 4, xArea: 400, minX: 100 })).toBe(400);
    expect(getLastSlotStartX({ labelCount: 7, xArea: 1000, minX: 100 })).toBe(958);
  });

  it('스크롤 가시 구간 안에서 슬롯을 나눈다', () => {
    expect(
      getLastSlotStartX({ labelCount: 10, minIndex: 5, maxIndex: 9, xArea: 500, minX: 0 }),
    ).toBe(400);
  });

  it('마지막 슬롯이 가시 구간 밖이거나 데이터가 없으면 null 이다', () => {
    expect(
      getLastSlotStartX({ labelCount: 10, minIndex: 0, maxIndex: 4, xArea: 500, minX: 0 }),
    ).toBeNull();
    expect(getLastSlotStartX({ labelCount: 0, xArea: 500, minX: 0 })).toBeNull();
    expect(
      getLastSlotStartX({ labelCount: 3, minIndex: 0, maxIndex: -1, xArea: 500, minX: 0 }),
    ).toBeNull();
  });
});

describe('drawPartialData', () => {
  it('line 은 시작점부터 플롯 오른쪽 끝까지 칠하고 시작점에 점선을 긋는다', () => {
    const ctx = createCtx();
    createChart().drawPartialData(ctx);

    const startX = pxOf(55);
    expect(ctx.fillStyle).toBe('rgba(214, 170, 98, 0.16)');
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
    expect(ctx.moveTo).toHaveBeenCalledWith(startX + 0.5, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(startX + 0.5, 420);
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  // 줌은 data.labels 를 잘라 넘겨 잘린 구간의 끝을 최신 데이터로 오인하던 문제
  it('줌 구간이 원본의 마지막 데이터를 포함하지 않으면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({ isLatestDataInView: () => false }).drawPartialData(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('줌 구간이 마지막 데이터를 포함하면 그린다', () => {
    const ctx = createCtx();
    createChart({ isLatestDataInView: () => true }).drawPartialData(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  // labels 없이 { x, y } 로 전달한 line 도 시리즈 데이터의 x 로 경계를 잡는다
  it('labels 없이 시리즈 데이터만 있어도 그린다', () => {
    const ctx = createCtx();
    createChart({ data: { labels: [] } }).drawPartialData(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(55), 20, 1100 - pxOf(55), 400);
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
    }).drawPartialData(ctx);

    const startX = Math.ceil(100 + (1000 / (30 * MIN)) * (15 * MIN));
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('combo line 은 막대 슬롯 오프셋을 반영해 점 위치에 맞춘다', () => {
    const ctx = createCtx();
    createChart({
      seriesList: { s1: createSeries(LINE_MINUTES, { combo: true }) },
    }).drawPartialData(ctx);

    const slot = 1000 / LINE_MINUTES.length;
    const startX = pxOf(55, { xArea: 1000 - slot, xsp: 100 + slot / 2 });
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('slot bar 는 마지막 막대 슬롯의 왼쪽 끝부터 칠한다', () => {
    const ctx = createCtx();
    createChart({ type: 'bar' }).drawPartialData(ctx);

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
    }).drawPartialData(ctx);

    const startX = Math.ceil(100 + (1000 / 7) * 6);
    expect(ctx.fillRect).toHaveBeenCalledWith(startX, 20, 1100 - startX, 400);
  });

  it('timeMode bar 는 마지막 시각부터 칠한다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      seriesList: { s1: createSeries(LINE_MINUTES, { timeMode: true }) },
    }).drawPartialData(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(pxOf(60), 20, 1100 - pxOf(60), 400);
  });

  it('slot bar 의 마지막 슬롯이 가시 구간 밖이면 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({
      type: 'bar',
      axesSteps: { x: [{ graphMin: at(0), graphMax: at(70), minIndex: 0, maxIndex: 3 }] },
    }).drawPartialData(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('사용자가 지정한 점선 패턴을 그대로 쓴다', () => {
    const ctx = createCtx();
    const chart = createChart();
    chart.options.partialData.border.segments = [];
    chart.drawPartialData(ctx);

    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
  });

  it('border.width 가 0 이면 영역만 칠한다', () => {
    const ctx = createCtx();
    const chart = createChart();
    chart.options.partialData.border.width = 0;
    chart.drawPartialData(ctx);

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('color 가 null 이면 기본 배경색으로 칠한다', () => {
    const ctx = createCtx();
    const chart = createChart();
    chart.options.partialData.color = null;
    chart.drawPartialData(ctx);

    expect(ctx.fillStyle).toBe('rgba(214, 170, 98, 0.16)');
  });

  it('시작점이 축 최소값보다 앞이면 플롯 왼쪽 끝부터 칠하고 점선은 긋지 않는다', () => {
    const ctx = createCtx();
    createChart({ seriesList: { s1: createSeries([-20, 10]) } }).drawPartialData(ctx);

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
    }).drawPartialData(ctx);

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('대상 차트가 아니면 아무것도 그리지 않는다', () => {
    const ctx = createCtx();
    createChart({ options: createOptions({ axesX: [{ type: 'step' }] }) }).drawPartialData(ctx);

    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
