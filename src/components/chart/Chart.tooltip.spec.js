import { describe, it, expect, vi } from 'vitest';
import modules from './plugins/plugins.interaction';
import storeModules from './model/model.store';

/**
 * Tooltip 값 정확성(기능 회귀) 테스트 — 시각 회귀(Chart.visual.spec.js)와 분리된 별도 축.
 *
 * 목적: hit test(`findClosestDataIndex`/`findHitItem`) 최적화가 **tooltip이 가리키는 값·hover 대상**을
 * 바꾸지 않는지 잡는다. 그림이 아니라 **값**을 검증한다.
 *   - findClosestDataIndex: 마우스 좌표 → 공유 라벨 인덱스(raw 데이터 인덱스 기준)
 *   - findHitItem: 그 인덱스에서 시리즈별 값 수집 → 각 값이 raw 원본 데이터와 일치
 *
 * 현재 동작을 기준선(baseline)으로 고정한다(현재 값 = 정답). hit/tooltip은 항상 raw 기준이다.
 */

// 라벨 5개, 라벨 간 픽셀 간격 100px (avgInterval=100, snapThreshold=100).
const LABELS = ['L0', 'L1', 'L2', 'L3', 'L4'];
const XPS = [50, 150, 250, 350, 450];

/**
 * raw 원본 값 배열 → createDataSet 산출물과 동일 형태(point 객체 배열)로 변환한 시리즈.
 * o(원본값)/xp/yp 를 가지며, findGraphData 는 공유 targetDataIndex 의 point 를 그대로 돌려준다
 * (모든 시리즈가 같은 라벨 인덱스를 공유한다는 실제 동작을 충실히 모방).
 */
const makeSeries = ({ id, raw, show = true, interpolation = 'linear' }) => {
  const data = raw.map((o, i) => ({
    x: LABELS[i],
    y: o,
    o,
    xp: XPS[i],
    yp: o === null ? null : 100 - o,
  }));

  return {
    id,
    name: id,
    show,
    interpolation,
    xAxisIndex: 0,
    yAxisIndex: 0,
    isExistGrp: false,
    data,
    findGraphData: (offset, isHorizontal, targetDataIndex) => ({
      data: data[targetDataIndex],
      hit: true,
      directHit: false,
      index: targetDataIndex,
    }),
  };
};

const createChart = (seriesList) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false },
    tooltipCtx: null,
    getFormattedTooltipLabel: ({ seriesName }) => seriesName,
    getFormattedTooltipValue: ({ value }) => String(value),
    isNotUseIndicator: () => false,
    // findClosestDataIndex 는 모듈의 실제 구현을 그대로 사용한다(여기서 회귀를 잡는 게 목적).
  });

describe('findClosestDataIndex 공유 라벨 인덱스', () => {
  it('마우스 x가 라벨 픽셀에 정확히 떨어지면 그 라벨 인덱스를 반환한다', () => {
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: [10, 20, 30, 25, 35] }),
      s2: makeSeries({ id: 's2', raw: [15, 25, 20, 30, 40] }),
    });

    const sIds = ['s1', 's2'];
    expect(chart.findClosestDataIndex([50, 0], sIds)).toBe(0);
    expect(chart.findClosestDataIndex([150, 0], sIds)).toBe(1);
    expect(chart.findClosestDataIndex([250, 0], sIds)).toBe(2);
    expect(chart.findClosestDataIndex([450, 0], sIds)).toBe(4);
  });

  it('마우스 x가 라벨 사이에 있으면 더 가까운 라벨 인덱스를 반환한다', () => {
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: [10, 20, 30, 25, 35] }),
    });

    // 240 → 라벨2(250)에 더 가까움, 160 → 라벨1(150)에 더 가까움.
    expect(chart.findClosestDataIndex([240, 0], ['s1'])).toBe(2);
    expect(chart.findClosestDataIndex([160, 0], ['s1'])).toBe(1);
  });

  it('해당 라벨의 모든 가시 시리즈 값이 null이면 그 라벨은 건너뛴다(per-label 유효성)', () => {
    // index 2가 모든 시리즈에서 null → hit 후보에서 제외되어야 한다.
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: [10, 20, null, 25, 35] }),
      s2: makeSeries({ id: 's2', raw: [15, 25, null, 30, 40] }),
    });

    // 마우스 260 → null인 라벨2(250)가 더 가깝지만 건너뛰고, 다음으로 가까운 라벨3(350)을 반환.
    expect(chart.findClosestDataIndex([260, 0], ['s1', 's2'])).toBe(3);
  });
});

describe('findHitItem 시리즈별 값이 raw 원본과 일치', () => {
  it('공유 라벨 인덱스에서 각 시리즈 값(o)이 raw 원본값과 일치한다', () => {
    const raw1 = [10, 20, 30, 25, 35];
    const raw2 = [15, 25, 20, 30, 40];
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: raw1 }),
      s2: makeSeries({ id: 's2', raw: raw2 }),
    });

    // 라벨1(xp=150) hover.
    const result = chart.findHitItem([150, 80]);

    // 두 시리즈 모두 같은 공유 라벨 인덱스를 가리켜야 한다.
    expect(result.items.s1.index).toBe(1);
    expect(result.items.s2.index).toBe(1);

    // 각 시리즈의 값이 raw 원본값과 정확히 일치해야 한다.
    expect(result.items.s1.data.o).toBe(raw1[1]);
    expect(result.items.s2.data.o).toBe(raw2[1]);

    // 라벨도 raw 라벨과 일치.
    expect(result.items.s1.label).toBe(LABELS[1]);
  });

  it('음수 값도 raw 원본 그대로 수집된다', () => {
    const raw1 = [-10, -20, 30, -5, 15];
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: raw1 }),
    });

    const result = chart.findHitItem([250, 50]);
    expect(result.items.s1.index).toBe(2);
    expect(result.items.s1.data.o).toBe(30);

    const resultNeg = chart.findHitItem([150, 50]);
    expect(resultNeg.items.s1.data.o).toBe(-20);
  });

  it('show=false 시리즈는 items에서 제외되고, 공유 인덱스는 가시 시리즈가 결정한다', () => {
    const raw1 = [10, 20, 30, 25, 35];
    const raw2 = [15, 25, 20, 30, 40];
    const chart = createChart({
      s1: makeSeries({ id: 's1', raw: raw1, show: false }),
      s2: makeSeries({ id: 's2', raw: raw2, show: true }),
    });

    const result = chart.findHitItem([350, 70]);

    expect(result.items.s1).toBeUndefined();
    expect(result.items.s2.index).toBe(3);
    expect(result.items.s2.data.o).toBe(raw2[3]);
  });
});

/**
 * 폴링 갱신 시나리오 통합 회귀 — model.store(실물 createDataSet 의 점객체 풀 재사용)와
 * interaction(실물 getFormattedTooltipValue 의 WeakMap 캐시 + _dataEpoch 무효화)을 한
 * 컨텍스트에 mixin 해서, "hover 포맷 → 데이터 갱신 → 재포맷 시 새 값" 의 실제 체인을 검증한다.
 * (각 모듈 단위 spec 은 반쪽씩만 보므로, 필드명 오타·호출 순서 변경은 여기서 잡힌다.)
 */
describe('툴팁 값 포맷 캐시 — 점객체 풀 재사용과 _dataEpoch 무효화 (store↔interaction 통합)', () => {
  const buildChart = (formatter) => {
    const seriesList = {
      s1: {
        show: true,
        xAxisIndex: 0,
        yAxisIndex: 0,
        isExistGrp: false,
        interpolation: 'linear',
      },
    };

    const chart = Object.assign(Object.create(Object.assign({}, storeModules, modules)), {
      seriesList,
      seriesInfo: { charts: { line: ['s1'] } },
      options: {
        horizontal: false,
        sunburst: false,
        type: 'line',
        tooltip: { formatter: { value: formatter } },
      },
    });

    return chart;
  };

  const callArgs = (point) => ({
    dataId: 's1',
    seriesId: 's1',
    seriesName: 's1',
    value: point.o,
    itemData: point,
  });

  it('hover 포맷 → 데이터 갱신(createDataSet 풀 덮어쓰기) → 재포맷 시 새 값이 반환된다(회귀)', () => {
    const formatter = vi.fn(({ y }) => `fmt:${y}`);
    const chart = buildChart(formatter);

    chart.createDataSet({ s1: [10, 20, 30] }, ['L0', 'L1', 'L2']);
    const point = chart.seriesList.s1.data[1];

    expect(chart.getFormattedTooltipValue(callArgs(point))).toBe('fmt:20');
    expect(formatter).toHaveBeenCalledTimes(1);

    // 폴링 갱신: createDataSet 재실행 — 풀 재사용으로 같은 point 객체가 새 값으로 덮어써진다
    chart.createDataSet({ s1: [10, 99, 30] }, ['L0', 'L1', 'L2']);

    // 이 테스트가 의미 있으려면 풀 재사용(identity 유지)이 실제로 일어나야 한다 — 전제 고정.
    // (풀링이 제거되면 이 단언이 깨지며, 그때는 epoch 무효화와 이 테스트를 함께 단순화하면 된다)
    expect(chart.seriesList.s1.data[1]).toBe(point);
    expect(point.o).toBe(99);

    expect(chart.getFormattedTooltipValue(callArgs(point))).toBe('fmt:99');
    expect(formatter).toHaveBeenCalledTimes(2);
  });

  it('createDataSet 재실행이 없으면(scrollbar lightUpdate 등) 캐시가 유지된다', () => {
    const formatter = vi.fn(({ y }) => `fmt:${y}`);
    const chart = buildChart(formatter);

    chart.createDataSet({ s1: [10, 20, 30] }, ['L0', 'L1', 'L2']);
    const point = chart.seriesList.s1.data[1];

    expect(chart.getFormattedTooltipValue(callArgs(point))).toBe('fmt:20');
    expect(chart.getFormattedTooltipValue(callArgs(point))).toBe('fmt:20');
    expect(formatter).toHaveBeenCalledTimes(1);
  });
});
