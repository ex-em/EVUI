import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * options.shallowOptionsWatch opt-in 의 options watch 발화 semantics 회귀 가드.
 *
 * Chart.vue 의 props.options watch 는 기본 deep:true(중첩 in-place 변경 자동 감지)이고,
 * shallowOptionsWatch:true 면 deep:false(top-level 참조 교체 시에만 발화)로 등록된다.
 * EvChart 를 mock 으로 대체해 evChart.update() 호출 여부로 발화를 검증한다.
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
    props: { data: reactive(makeData()), options: reactive({ type: 'line', ...options }) },
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

describe('options.shallowOptionsWatch — options watch 발화 semantics', () => {
  it('기본(deep): options 중첩 in-place 변경이 update 를 발화시킨다', async () => {
    const wrapper = mountChart();
    await settle();
    updateSpy.mockClear();

    wrapper.props().options.padding = { top: 99 };
    await settle();

    expect(updateSpy).toHaveBeenCalled();
  });

  it('shallowOptionsWatch:true: 중첩 in-place 는 미발화, top-level 참조 교체는 발화', async () => {
    const wrapper = mountChart({ shallowOptionsWatch: true });
    await settle();
    updateSpy.mockClear();

    // in-place 변경 → deep 추적 없음 → 미발화
    wrapper.props().options.padding = { top: 99 };
    await settle();
    expect(updateSpy).not.toHaveBeenCalled();

    // top-level 참조 교체 → 발화
    await wrapper.setProps({ options: { type: 'line', shallowOptionsWatch: true, padding: { top: 5 } } });
    await settle();
    expect(updateSpy).toHaveBeenCalled();
  });
});
