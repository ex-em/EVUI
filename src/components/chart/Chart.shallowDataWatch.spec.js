import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * options.shallowDataWatch opt-in 의 watcher semantics 회귀 가드.
 *
 * Chart.vue 의 props.data watch 는 기본 deep:true(중첩 in-place mutation 자동 감지) 이고,
 * shallowDataWatch:true 면 deep:false(top-level 참조 교체 시에만 발화)로 등록된다. 실제 canvas 렌더는
 * 불필요하므로 EvChart 를 mock 으로 대체해 evChart.update() 호출 여부만으로 발화를 검증한다.
 * (isChartGroup 을 provide 해 zoom 머신/ setDataForUseZoom 경로를 우회한다 — data watch 발화는 동일.)
 */

const updateSpy = vi.fn();

vi.mock('./chart.core', () => ({
  default: vi.fn().mockImplementation(function EvChartMock(target, data, options) {
    this.data = data;
    this.options = options;
    this.init = vi.fn();
    this.update = updateSpy;
    this.destroy = vi.fn();
    this.emitLegendData = vi.fn();
    this.selectItemByData = vi.fn();
    this.selectLabelByData = vi.fn();
    this.selectSeriesByData = vi.fn();
  }),
}));

// eslint-disable-next-line import/first
import EvChartComponent from './Chart.vue';

const makeData = () => ({
  series: { s1: { name: 's1' } },
  data: { s1: [1, 2, 3] },
  labels: ['a', 'b', 'c'],
  groups: [],
});

const mountChart = (options) =>
  mount(EvChartComponent, {
    props: { data: reactive(makeData()), options: { type: 'line', ...options } },
    global: { provide: { isChartGroup: true }, directives: { resize: {} } },
  });

const settle = async () => {
  await flushPromises();
  vi.runAllTimers();
  await flushPromises();
};

beforeEach(() => {
  vi.useFakeTimers();
  updateSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('options.shallowDataWatch — data watch 발화 semantics', () => {
  it('기본(deep): 중첩 in-place mutation 이 update 를 발화시킨다', async () => {
    const wrapper = mountChart();
    await settle();
    updateSpy.mockClear();

    wrapper.props().data.data.s1.push(4);
    await settle();

    expect(updateSpy).toHaveBeenCalled();
  });

  it('shallowDataWatch:true: 중첩 in-place mutation 은 발화 안 하고, top-level 참조 교체는 발화한다', async () => {
    const wrapper = mountChart({ shallowDataWatch: true });
    await settle();
    updateSpy.mockClear();

    // in-place mutation → deep 추적 없음 → 미발화
    wrapper.props().data.data.s1.push(4);
    await settle();
    expect(updateSpy).not.toHaveBeenCalled();

    // top-level 참조 교체 → 발화
    await wrapper.setProps({ data: makeData() });
    await settle();
    expect(updateSpy).toHaveBeenCalled();
  });
});
