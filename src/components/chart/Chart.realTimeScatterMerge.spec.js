import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * Chart.vue scheduleUpdate 가 flush 전에 들어온 realTimeScatter 증분을 버리지 않는지 검증한다(#2346).
 * realTimeScatter 는 배치마다 서로 다른 구간의 증분이라, 최신 배치로 덮으면 앞선 배치가 링에 들어가지 않는다.
 * EvChart 는 mock 으로 대체하고 update() 호출 시점의 data.data 만 본다.
 */

const updateCalls = [];
const resetSpy = vi.fn();

vi.mock('./chart.core', () => ({
  default: vi.fn().mockImplementation(function EvChartMock(target, data, options) {
    this.data = data;
    this.options = options;
    this.init = vi.fn();
    // 인스턴스 data 는 이후 재할당되므로 호출 시점에 스냅샷한다.
    this.update = vi.fn(function update() {
      updateCalls.push(this.data.data);
    });
    this.resetRealTimeScatterDataSet = resetSpy;
    this.destroy = vi.fn();
    this.emitLegendData = vi.fn();
    this.selectItemByData = vi.fn();
    this.selectLabelByData = vi.fn();
    this.selectSeriesByData = vi.fn();
  }),
}));

// eslint-disable-next-line import/first
import EvChartComponent from './Chart.vue';

const RTS_OPTIONS = { type: 'scatter', realTimeScatter: { use: true, range: 300 } };
const pt = (x) => ({ x, y: 1 });

const batch = (data, seriesIds = Object.keys(data)) => ({
  series: Object.fromEntries(seriesIds.map((id) => [id, { name: id }])),
  data,
});

const mountChart = ({ options = RTS_OPTIONS, data = batch({ s1: [] }), deferUntil = 0 } = {}) =>
  mount(EvChartComponent, {
    props: { data, options },
    global: {
      provide: { isChartGroup: true, groupInteraction: { deferUntil } },
      directives: { resize: {} },
    },
  });

const feed = async (wrapper, props) => {
  await wrapper.setProps(props);
  await flushPromises();
};

const lastUpdateData = () => updateCalls.at(-1);

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'],
  });
  updateCalls.length = 0;
  resetSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Chart.vue realTimeScatter 증분 병합', () => {
  it('deferUntil 보류 중 들어온 증분을 series 별로 모두 이어 한 번에 넘긴다', async () => {
    const wrapper = mountChart({ deferUntil: performance.now() + 1000 });
    await flushPromises();

    const first = [pt(1)];
    await feed(wrapper, { data: batch({ s1: first }) });
    await feed(wrapper, { data: batch({ s1: [pt(2)], s2: [pt(3)] }) });
    vi.advanceTimersByTime(1000);

    expect(updateCalls).toHaveLength(1);
    expect(lastUpdateData()).toEqual({ s1: [pt(1), pt(2)], s2: [pt(3)] });
    // 소비자 배열은 그대로다(realTimeScatter 는 props 참조를 클론 없이 쓴다).
    expect(first).toEqual([pt(1)]);
  });

  it('setTimeout(0) 이 돌기 전에 연달아 들어온 증분도 모두 넘긴다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)] }) });
    await feed(wrapper, { data: batch({ s1: [pt(2)] }) });
    vi.advanceTimersByTime(0);

    expect(updateCalls).toHaveLength(1);
    expect(lastUpdateData()).toEqual({ s1: [pt(1), pt(2)] });
  });

  it('flush 뒤 options 만 바뀌어 보류 중이어도, 이미 넘긴 배치를 다시 싣지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)] }) });
    vi.advanceTimersByTime(0);
    await feed(wrapper, { options: { ...RTS_OPTIONS, title: { text: 't' } } });
    await feed(wrapper, { data: batch({ s1: [pt(2)] }) });
    vi.advanceTimersByTime(0);

    expect(lastUpdateData()).toEqual({ s1: [pt(2)] });
  });

  it('최신 배치 series 에서 빠진 키의 보류 증분은 싣지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)], s2: [pt(2)] }) });
    await feed(wrapper, { data: batch({ s1: [pt(3)] }) });
    vi.advanceTimersByTime(0);

    expect(lastUpdateData()).toEqual({ s1: [pt(1), pt(3)] });
  });

  it('최신 배치에 점이 없어도 series 에 남은 키의 보류 증분은 싣는다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)], s2: [pt(2)] }) });
    await feed(wrapper, { data: batch({ s1: [pt(3)] }, ['s1', 's2']) });
    vi.advanceTimersByTime(0);

    expect(lastUpdateData()).toEqual({ s1: [pt(1), pt(3)], s2: [pt(2)] });
  });

  it('일반 차트는 지금처럼 최신 배치 기준으로 넘긴다', async () => {
    const lineData = (values) => ({
      series: { s1: { name: 's1' } },
      data: { s1: values },
      labels: [],
    });
    const wrapper = mountChart({ options: { type: 'line' }, data: lineData([0]) });
    await flushPromises();

    await feed(wrapper, { data: lineData([1, 2]) });
    await feed(wrapper, { data: lineData([3, 4]) });
    vi.advanceTimersByTime(0);

    expect(lastUpdateData()).toEqual({ s1: [3, 4] });
  });
});

describe('Chart.vue realTimeScatterReset — 리셋 전 배치 폐기', () => {
  it('보류 중 리셋이 오면 리셋 전 배치를 버리고 이후 배치만 넘긴다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)] }) });
    await feed(wrapper, { realTimeScatterReset: true });
    await feed(wrapper, { data: batch({ s1: [pt(2)] }) });
    vi.advanceTimersByTime(0);

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(lastUpdateData()).toEqual({ s1: [pt(2)] });
  });

  it('리셋과 같은 tick 에 들어온 배치는 리셋 이후 데이터로 남는다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)] }) });
    await feed(wrapper, { realTimeScatterReset: true, data: batch({ s1: [pt(2)] }) });
    vi.advanceTimersByTime(0);

    expect(lastUpdateData()).toEqual({ s1: [pt(2)] });
  });

  it('리셋 뒤 새 배치 없이 flush 돼도 리셋 전 배치를 다시 싣지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();

    await feed(wrapper, { data: batch({ s1: [pt(1)] }) });
    await feed(wrapper, { realTimeScatterReset: true });
    vi.advanceTimersByTime(0);

    // 키는 남긴다 — 키가 하나도 없으면 링 루프가 돌지 않아 X축이 epoch 로 계산된다.
    expect(lastUpdateData()).toEqual({ s1: [] });
  });
});
