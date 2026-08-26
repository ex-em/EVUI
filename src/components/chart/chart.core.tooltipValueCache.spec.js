import { describe, it, expect } from 'vitest';
import EvChart from './chart.core';

/**
 * update() 의 툴팁 값 포맷 캐시(_tooltipValueCache) 무효화 회귀 가드.
 *
 * 배경: getFormattedTooltipValue 는 point 객체를 키로 한 WeakMap 에 포맷 결과를 캐시하는데,
 * createDataSet 은 점객체 풀을 재사용(addData 의 target in-place 덮어쓰기)하므로
 * "데이터 갱신 → 새 객체 → 자동 GC" 가정이 성립하지 않는다. update() 가 updateData/updateSeries
 * 시 캐시를 명시적으로 비우지 않으면, 폴링 등으로 값이 바뀐 뒤에도 최초 hover 시점의 포맷
 * 결과가 반환된다(사용자 formatter 미진입 + 차트 데이터와 다른 툴팁).
 *
 * canvas/DOM 없이 prototype 메서드를 stub this 로 검증한다(blitGate spec 과 동일 전략).
 */
const noop = () => {};

const makeCore = (overrides = {}) =>
  Object.assign(Object.create(EvChart.prototype), {
    isInit: true,
    data: { data: {}, labels: [], groups: [], series: {} },
    options: {
      realTimeScatter: { use: false },
      title: { show: false },
      legend: { show: false, external: false },
      tooltip: {},
      axesX: [],
      axesY: [],
    },
    legendHover: null,
    dragDisplayCanvas: null,
    dragInfo: null,
    dragInfoBackup: null,
    updateScrollbar: noop,
    resetProps: noop,
    createDataSet: noop,
    reconcileSeriesSet: noop,
    getStoreMinMax: () => ({}),
    createAxes: () => [],
    initDefaultSelectInfo: noop,
    render: noop,
    ...overrides,
  });

const baseUpdateInfo = {
  updateSeries: false,
  updateSelTip: { update: false, keepDomain: false },
  updateData: false,
  updateLegend: false,
  updateTooltip: false,
};

describe('EvChart.update — 툴팁 값 포맷 캐시 무효화', () => {
  it('updateData 시 _tooltipValueCache 와 _lastHoverSig 를 함께 비운다', () => {
    const core = makeCore();
    core._tooltipValueCache = new WeakMap();
    core._lastHoverSig = 'h=s1|s1:3';

    core.update({ ...baseUpdateInfo, updateData: true });

    expect(core._tooltipValueCache).toBeNull();
    expect(core._lastHoverSig).toBe('');
  });

  it('updateSeries 시에도 비운다 (범례 토글 등도 createDataSet 재실행으로 점객체 풀을 덮어씀)', () => {
    const core = makeCore();
    core._tooltipValueCache = new WeakMap();
    core._lastHoverSig = 'h=s1|s1:3';

    core.update({ ...baseUpdateInfo, updateSeries: true });

    expect(core._tooltipValueCache).toBeNull();
    expect(core._lastHoverSig).toBe('');
  });

  it('데이터가 변하지 않는 갱신(scrollbar lightUpdate 등)에서는 캐시를 유지한다', () => {
    const core = makeCore();
    const cache = new WeakMap();
    core._tooltipValueCache = cache;
    core._lastHoverSig = 'h=s1|s1:3';

    core.update({ ...baseUpdateInfo, lightUpdate: true, updateByScrollbar: true });

    expect(core._tooltipValueCache).toBe(cache);
    expect(core._lastHoverSig).toBe('h=s1|s1:3');
  });
});
