import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

/**
 * Chart.vue 가 `.ev-chart` 요소에 콘솔 조회 진입점을 달고 unmount 때 떼는지 검증한다. EvChart 는 mock 으로 대체한다.
 */

vi.mock('./chart.core', () => ({
  default: vi.fn().mockImplementation(function EvChartMock(target, data, options) {
    this.data = data;
    this.options = options;
    this.init = vi.fn();
    this.update = vi.fn();
    this.resetRealTimeScatterDataSet = vi.fn();
    this.destroy = vi.fn();
    this.emitLegendData = vi.fn();
    this.selectItemByData = vi.fn();
    this.selectLabelByData = vi.fn();
    this.selectSeriesByData = vi.fn();
  }),
}));

// eslint-disable-next-line import/first
import EvChartCore from './chart.core';
// eslint-disable-next-line import/first
import EvChartComponent from './Chart.vue';

const RTS_OPTIONS = { type: 'scatter', realTimeScatter: { use: true, range: 300 } };

const batch = (data, seriesIds = Object.keys(data)) => ({
  series: Object.fromEntries(seriesIds.map((id) => [id, { name: id }])),
  data,
});

const mountChart = ({ data = batch({ s1: [] }), deferUntil = 0, options = RTS_OPTIONS } = {}) =>
  mount(EvChartComponent, {
    props: { data, options },
    attachTo: document.body,
    global: {
      provide: { isChartGroup: true, groupInteraction: { deferUntil } },
      directives: { resize: {} },
    },
  });


const chartElementOf = (wrapper) => wrapper.find('.ev-chart').element;
const lastInstance = () => EvChartCore.mock.instances.at(-1);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  EvChartCore.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete window.__EVUI_CHART__;
});

describe('Chart.vue 콘솔 조회 진입점', () => {
  it('차트가 둘이면 각 요소 안쪽에서 찾은 진입점이 자기 차트를 가리킨다', async () => {
    const first = mountChart();
    await flushPromises();
    const firstChart = lastInstance();
    const second = mountChart();
    await flushPromises();
    const secondChart = lastInstance();

    // 실제 차트처럼 canvas 를 안쪽에 두고 그 요소($0)로 찾는다.
    const canvasOf = (wrapper) =>
      chartElementOf(wrapper).appendChild(document.createElement('canvas'));

    expect(window.__EVUI_CHART__(canvasOf(first)).chart).toBe(firstChart);
    expect(window.__EVUI_CHART__(canvasOf(second)).chart).toBe(secondChart);
    expect(chartElementOf(first).__evuiChart__.chart).toBe(firstChart);

    first.unmount();
    second.unmount();
  });

  it('로그의 차트 번호로도 그 차트를 찾는다', async () => {
    const first = mountChart();
    await flushPromises();
    const firstChart = lastInstance();
    const second = mountChart();
    await flushPromises();
    const secondChart = lastInstance();
    vi.spyOn(console, 'table').mockImplementation(() => {});

    const [a, b] = window.__EVUI_CHART__.list();

    expect(a.no).not.toBe(b.no);
    expect(window.__EVUI_CHART__(a.no).chart).toBe(firstChart);
    expect(window.__EVUI_CHART__(b.no).chart).toBe(secondChart);
    first.unmount();
    second.unmount();
  });

  it('list() 는 realTimeScatter.label 을 title 열로 보여준다', async () => {
    const wrapper = mountChart({
      options: { ...RTS_OPTIONS, realTimeScatter: { use: true, label: 'Postgresql Slow Query Monitor' } },
    });
    await flushPromises();
    const table = vi.spyOn(console, 'table').mockImplementation(() => {});

    const [row] = window.__EVUI_CHART__.list();

    expect(row).toMatchObject({ title: 'Postgresql Slow Query Monitor' });
    expect(table.mock.calls[0][0][0]).toHaveProperty('title', 'Postgresql Slow Query Monitor');
    wrapper.unmount();
  });

  it('unmount 뒤에는 요소에 진입점이 남지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();
    const element = chartElementOf(wrapper);

    wrapper.unmount();

    expect('__evuiChart__' in element).toBe(false);
    expect(window.__EVUI_CHART__(element)).toBeNull();
  });
});
