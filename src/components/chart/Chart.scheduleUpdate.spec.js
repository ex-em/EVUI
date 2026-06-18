import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * Chart.vue scheduleUpdate 의 폴링 redraw 양보(deferUntil) semantics 회귀 가드.
 *
 * scheduleUpdate 는 데이터/옵션 변경(폴링 포함)을 받아 evChart.update() 를 예약하는데,
 * groupInteraction.deferUntil(deferPollingRedraw 가 설정) 까지 polling 재렌더를 미룬다.
 * 또한 타이머가 떠 있는 사이 deferUntil 이 연장되면 fire 시점에 재무장한다.
 * 실제 canvas 렌더는 불필요하므로 EvChart 를 mock 으로 대체해 update() 호출 타이밍만 검증한다.
 * 시계가 performance.now() 이므로 fake timer 가 performance 까지 fake 하도록 toFake 를 명시한다.
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

// 폴링 데이터 변경을 모사한다(deep watch 가 in-place mutation 을 감지).
const pushData = async (wrapper, v) => {
  wrapper.props().data.data.s1.push(v);
  await flushPromises();
};

const mountChart = (provide) =>
  mount(EvChartComponent, {
    props: { data: reactive(makeData()), options: { type: 'line' } },
    global: { provide: { isChartGroup: true, ...provide }, directives: { resize: {} } },
  });

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'],
  });
  updateSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Chart.vue scheduleUpdate — deferUntil 폴링 양보', () => {
  it('deferUntil 미설정: 데이터 변경이 즉시 update 를 발화한다', async () => {
    const gi = { deferUntil: 0 };
    const wrapper = mountChart({ groupInteraction: gi });
    await flushPromises();
    updateSpy.mockClear();

    await pushData(wrapper, 4);
    vi.advanceTimersByTime(0);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('deferUntil = now+1000: 1000ms 까지 미호출 후 정확히 1회 update', async () => {
    const gi = { deferUntil: performance.now() + 1000 };
    const wrapper = mountChart({ groupInteraction: gi });
    await flushPromises();
    updateSpy.mockClear();

    await pushData(wrapper, 4);
    vi.advanceTimersByTime(999);
    expect(updateSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('재무장: 타이머가 떠 있는 사이 deferUntil 을 연장하면 그만큼 더 지연된다', async () => {
    const gi = { deferUntil: performance.now() + 500 };
    const wrapper = mountChart({ groupInteraction: gi });
    await flushPromises();
    updateSpy.mockClear();

    await pushData(wrapper, 4);
    // 타이머(500ms)가 떠 있는 동안 deferUntil 을 now+1000 으로 연장한다(deferPollingRedraw 모사).
    gi.deferUntil = performance.now() + 1000;

    vi.advanceTimersByTime(500); // 원래 타이머 fire → 재무장만, update 미호출
    expect(updateSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500); // 재무장 타이머 fire → update
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('coalesce: 보류 중 데이터 2회 변경 → update 는 1회만', async () => {
    const gi = { deferUntil: performance.now() + 1000 };
    const wrapper = mountChart({ groupInteraction: gi });
    await flushPromises();
    updateSpy.mockClear();

    await pushData(wrapper, 4);
    await pushData(wrapper, 5);
    vi.advanceTimersByTime(1000);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('deferUntil 이 과거면 즉시 update(기존 동일)', async () => {
    const gi = { deferUntil: performance.now() - 100 };
    const wrapper = mountChart({ groupInteraction: gi });
    await flushPromises();
    updateSpy.mockClear();

    await pushData(wrapper, 4);
    vi.advanceTimersByTime(0);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('단일 차트(groupInteraction 미제공): defer 경로 미진입, 즉시 update', async () => {
    const wrapper = mountChart();
    await flushPromises();
    updateSpy.mockClear();
    // 인터랙션이 한참 전이라 양보가 끝난 상태를 모사한다(시계를 충분히 진행).
    vi.advanceTimersByTime(1000);

    await pushData(wrapper, 4);
    vi.advanceTimersByTime(0);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
});
