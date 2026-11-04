import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import EvChartZoom from './chartZoom.core';

const LABELS = Array.from({ length: 5 }, (_, ix) => dayjs('2026-08-21T00:00:00').add(ix, 'hour'));

/**
 * dragZoom 은 생성자가 툴바 DOM·애니메이션 캔버스를 요구하므로 프로토타입만 빌려
 * 이 메서드가 실제로 읽는 필드만 세운다.
 */
const createZoom = (labels = LABELS) => {
  const zoom = Object.create(EvChartZoom.prototype);

  Object.assign(zoom, {
    evChartProps: {
      options: [{ title: { text: 'chart' }, axesX: [{ type: 'time' }] }],
      data: [{ labels }],
    },
    evChartCloneData: [{ labels }],
    evChartZoomOptions: { useAnimation: false, bufferMemoryCnt: 100 },
    zoomAreaMemory: { previous: [], current: [[0, labels.length - 1]], latest: [] },
    executeZoom: vi.fn(),
    setZoomAreaMemory: vi.fn(),
  });

  return zoom;
};

/** Bar.findItems 가 돌려주는 모양 — x 는 라벨(dayjs)이다. */
const barItems = (...indexes) => [
  { seriesId: 'series1', items: indexes.map((ix) => ({ x: LABELS[ix], y: 10, o: 10 })) },
];

const dragArgs = (data, { dragXsp = 100, dragXep = 300 } = {}) => ({
  data,
  range: {
    dragSelectionInfo: {
      dragXsp,
      dragXep,
      exceptAxesYChartWidth: 400,
      exceptAxesXChartHeight: 200,
      chartRange: { x1: 0, x2: 400, y1: 0, y2: 200 },
      chartTitle: 'chart',
    },
  },
});

describe('dragZoom (bar 시리즈)', () => {
  it('막대 x(라벨)로 줌 구간을 계산한다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(1, 2, 3)));

    expect(zoom.executeZoom).toHaveBeenCalledWith(1, 3);
    expect(zoom.setZoomAreaMemory).toHaveBeenCalledWith(1, 3);
  });

  // Bar.findItems 는 부분 겹침을 담으므로, 완전히 든 막대가 없는 드래그도 줌으로 이어진다.
  // 대가로 줌 창이 시각적 밴드보다 양쪽 최대 한 막대씩 넓다 — 의도된 트레이드오프다.
  it('걸치기만 한 막대 2개로도 줌이 실행된다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(1, 2)));

    expect(zoom.executeZoom).toHaveBeenCalledWith(1, 2);
  });

  it('막대 1개만 걸리면 드래그 위치에 가까운 쪽으로 한 칸 넓힌다', () => {
    const zoom = createZoom();

    // 라벨 간격 100px 기준 index 2 는 200px. 드래그가 그보다 오른쪽이면 오른쪽으로 넓어진다.
    zoom.dragZoom(dragArgs(barItems(2), { dragXsp: 190, dragXep: 260 }));

    expect(zoom.executeZoom).toHaveBeenCalledWith(2, 3);
  });

  it('줌 구간이 현재와 같으면 실행하지 않는다', () => {
    const zoom = createZoom();

    zoom.dragZoom(dragArgs(barItems(0, 1, 2, 3, 4)));

    expect(zoom.executeZoom).not.toHaveBeenCalled();
  });

  // dragZoom 은 time 축에서만 동작한다(SPEC.md 「줌 규칙」). bar 도 이 제약을 그대로 물려받는다.
  it('step 축이면 아무것도 하지 않는다', () => {
    const zoom = createZoom();
    zoom.evChartProps.options[0].axesX = [{ type: 'step' }];

    zoom.dragZoom(dragArgs(barItems(1, 2, 3)));

    expect(zoom.executeZoom).not.toHaveBeenCalled();
  });
});

/**
 * 수집 간격이 다른 { x, y } 시리즈(1초·5초)의 줌 — labels 를 공통 시간 격자로 쓰고,
 * 줌 인덱스(labels 인덱스)는 그대로 둔 채 각 시리즈를 그 시각 구간으로 자른다(#2352).
 */
describe('혼합 interval 줌', () => {
  const BASE = Date.UTC(2026, 0, 1);
  const at = (sec) => BASE + sec * 1000;
  const SEC_LABELS = Array.from({ length: 60 }, (_, sec) => at(sec));
  const points = (step) =>
    SEC_LABELS.filter((_, sec) => sec % step === 0).map((x, ix) => ({ x, y: ix }));

  it('dragZoom 은 모든 시리즈 항목의 시각 범위로 labels 인덱스를 잡는다', () => {
    const zoom = createZoom(SEC_LABELS);
    const data = [
      { seriesId: 's5', items: points(5).filter(({ x }) => x >= at(10) && x <= at(15)) },
      { seriesId: 's1', items: points(1).filter(({ x }) => x >= at(8) && x <= at(17)) },
    ];

    zoom.dragZoom(dragArgs(data));

    expect(zoom.executeZoom).toHaveBeenCalledWith(8, 17);
  });

  it('executeZoom 은 시리즈를 인덱스가 아니라 labels 시각 구간으로 자른다', () => {
    const zoom = Object.create(EvChartZoom.prototype);
    const evChartData = { data: {}, labels: SEC_LABELS };
    Object.assign(zoom, {
      evChartCloneData: [{
        data: { s1: points(1), s5: points(5) },
        labels: SEC_LABELS,
        series: { s1: {}, s5: {} },
      }],
      evChartProps: { data: [evChartData] },
      brushIdx: { isUseButton: false, isUseScroll: false },
    });

    zoom.executeZoom(10, 20);

    expect(evChartData.labels).toEqual(SEC_LABELS.slice(10, 21));
    expect(evChartData.data.s1.map(({ x }) => x)).toEqual(SEC_LABELS.slice(10, 21));
    expect(evChartData.data.s5.map(({ x }) => x)).toEqual([at(10), at(15), at(20)]);
  });

  const createExecuteZoom = (data, labels) => {
    const zoom = Object.create(EvChartZoom.prototype);
    const evChartData = { data: {}, labels };
    Object.assign(zoom, {
      evChartCloneData: [{
        data,
        labels,
        series: Object.fromEntries(Object.keys(data).map((id) => [id, {}])),
      }],
      evChartProps: { data: [evChartData] },
      brushIdx: { isUseButton: false, isUseScroll: false },
    });
    return { zoom, evChartData };
  };

  it('step 축(문자열 labels)은 labels 와 어긋난 { x, y } 시리즈를 범주 순서 구간으로 자른다', () => {
    const clock = (sec) => `09:00:${String(sec).padStart(2, '0')}`;
    const labels = Array.from({ length: 12 }, (_, i) => clock(i * 5));
    const s1 = Array.from({ length: 60 }, (_, sec) => ({ x: clock(sec), y: sec }));
    const s5 = labels.map((x, i) => ({ x, y: i }));
    const { zoom, evChartData } = createExecuteZoom({ s1, s5 }, labels);

    zoom.executeZoom(2, 4);

    expect(evChartData.labels).toEqual([clock(10), clock(15), clock(20)]);
    expect(evChartData.data.s1.map(({ x }) => x)).toEqual(
      Array.from({ length: 11 }, (_, i) => clock(10 + i)),
    );
    expect(evChartData.data.s5.map(({ x }) => x)).toEqual([clock(10), clock(15), clock(20)]);
  });

  it('x 가 labels 와 자리마다 같은 step { x, y } 시리즈는 지금처럼 인덱스로 자른다(중복 라벨·null 포함)', () => {
    const labels = ['a', 'b', 'a', 'c'];
    const s = [{ x: 'a', y: 0 }, null, { x: 'a', y: 2 }, { x: 'c', y: 3 }];
    const { zoom, evChartData } = createExecuteZoom({ s }, labels);

    zoom.executeZoom(2, 3);

    expect(evChartData.data.s).toEqual([{ x: 'a', y: 2 }, { x: 'c', y: 3 }]);
  });

  it.each([
    ['앞에 같은 값이 있는 끝 경계', ['a', 'b', 'c', 'b']],
    ['앞에 같은 값이 있는 시작 경계', ['a', 'b', 'a', 'c']],
  ])('step 축 줌 경계는 labels 에 같은 값이 있어도 그 자리의 칸이다 — %s', (_, labels) => {
    const r = [1, 2, 3, 4];
    const s1 = ['a', 'x', 'b', 'c'].map((x, y) => ({ x, y }));
    const { zoom, evChartData } = createExecuteZoom({ r, s1 }, labels);

    zoom.executeZoom(2, 3);

    expect(evChartData.data.r).toEqual([3, 4]);
    expect(evChartData.data.s1.map(({ x }) => x)).toEqual(['c']);
  });

  it('범주를 늘리지 않는 step 축 줌(x 가 모두 labels 에 있음)도 경계는 그 자리의 칸이다', () => {
    const s1 = ['a', 'c', 'b', 'd'].map((x, y) => ({ x, y }));
    const { zoom, evChartData } = createExecuteZoom({ s1 }, ['a', 'b', 'c', 'b', 'd']);

    zoom.executeZoom(2, 3);

    expect(evChartData.data.s1.map(({ x }) => x)).toEqual(['c']);
  });

  it('x 가 labels 와 자리마다 같은 { x, y } 시리즈는 시각 labels 에서도 인덱스로 잘라 null 자리를 지킨다', () => {
    const labels = [0, 5, 10, 15].map(at);
    const a = [{ x: at(0), y: 1 }, { x: at(5), y: 2 }, null, { x: at(15), y: 4 }];
    const b = labels.map((x, y) => ({ x, y }));
    const r = [1, 2, 3]; // labels 보다 짧은 원시값
    const { zoom, evChartData } = createExecuteZoom({ a, b, r }, labels);

    zoom.executeZoom(1, 3);

    expect(evChartData.data.a).toEqual([{ x: at(5), y: 2 }, null, { x: at(15), y: 4 }]);
    expect(evChartData.data.b).toEqual(b.slice(1, 4));
    expect(evChartData.data.r).toEqual([2, 3]);
  });

  it('가로 차트는 { x, y } 시리즈도 인덱스로 자른다(x 가 값 축, 그룹이면 차트마다 옵션을 본다)', () => {
    const labels = ['a', 'b', 'c', 'd'];
    // 세로 차트는 labels 사이에 x 가 낀 시리즈라 인덱스로 자르면(가로 판정이 새면) 결과가 갈린다.
    const vertical = ['a', 'a2', 'b', 'c', 'd'].map((x, y) => ({ x, y }));
    const horizontal = labels.map((y, i) => ({ x: 10 * (i + 1), y }));
    // 런타임처럼 data·options 모두 차트마다 하나씩 담긴 배열이다.
    const charts = [{ s: vertical }, { s: horizontal }];
    const evChartData = charts.map(() => ({ data: {}, labels }));
    const zoom = Object.create(EvChartZoom.prototype);
    Object.assign(zoom, {
      evChartCloneData: charts.map((data) => ({ data, labels, series: { s: {} } })),
      evChartProps: { data: evChartData, options: [{}, { horizontal: true }] },
      brushIdx: { isUseButton: false, isUseScroll: false },
    });

    zoom.executeZoom(1, 2);

    expect(evChartData[0].data.s).toEqual(vertical.slice(2, 4));
    expect(evChartData[1].data.s).toEqual([{ x: 20, y: 'b' }, { x: 30, y: 'c' }]);
  });

  it('labels 보다 짧아도 앞부분이 labels 와 자리마다 같은 { x, y } 는 인덱스로 잘라 null 자리를 지킨다', () => {
    const labels = [0, 5, 10, 15, 20].map(at);
    const a = [{ x: at(0), y: 1 }, { x: at(5), y: 2 }, null, { x: at(15), y: 4 }];
    const { zoom, evChartData } = createExecuteZoom({ a, b: [...a] }, labels);

    zoom.executeZoom(1, 3);

    expect(evChartData.data.a).toEqual([{ x: at(5), y: 2 }, null, { x: at(15), y: 4 }]);
  });
});
