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

// jsdom 은 레이아웃이 없어 rect 가 모두 0 이다 — list() 가 화면에 보이는 차트로 보도록 크기를 준다.
const VISIBLE_RECT = { top: 0, bottom: 200, width: 300, height: 200 };

const mountChart = ({ data = batch({ s1: [] }), deferUntil = 0, options = RTS_OPTIONS } = {}) => {
  const wrapper = mount(EvChartComponent, {
    props: { data, options },
    attachTo: document.body,
    global: {
      provide: { isChartGroup: true, groupInteraction: { deferUntil } },
      directives: { resize: {} },
    },
  });
  wrapper.find('.ev-chart').element.getBoundingClientRect = () => VISIBLE_RECT;
  return wrapper;
};

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
      options: {
        ...RTS_OPTIONS,
        realTimeScatter: { use: true, label: 'Postgresql Slow Query Monitor' },
      },
    });
    await flushPromises();
    const table = vi.spyOn(console, 'table').mockImplementation(() => {});

    const [row] = window.__EVUI_CHART__.list();

    expect(row).toMatchObject({ title: 'Postgresql Slow Query Monitor' });
    expect(table.mock.calls[0][0][0]).toHaveProperty('title', 'Postgresql Slow Query Monitor');
    wrapper.unmount();
  });

  it('화면 전환으로 차트가 모두 바뀌면 반납된 번호를 작은 것부터 다시 쓴다', async () => {
    const mountTwo = async () => {
      const pair = [mountChart(), mountChart()];
      await flushPromises();
      return pair;
    };
    vi.spyOn(console, 'table').mockImplementation(() => {});
    const before = await mountTwo();
    const beforeNos = window.__EVUI_CHART__.list().map((row) => row.no);

    before.forEach((wrapper) => wrapper.unmount());
    const after = await mountTwo();
    const afterNos = window.__EVUI_CHART__.list().map((row) => row.no);

    expect(afterNos).toEqual(beforeNos);
    after.forEach((wrapper) => wrapper.unmount());
  });

  it('unmount 뒤에는 요소에 진입점이 남지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();
    const element = chartElementOf(wrapper);

    wrapper.unmount();

    expect('__evuiChart__' in element).toBe(false);
    expect(window.__EVUI_CHART__(element)).toBeNull();
  });

  it('unmount 전에 콘솔에 받아 둔 조회 객체는 unmount 뒤 차트를 놓는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mountChart();
    await flushPromises();
    const inspector = window.__EVUI_CHART__(chartElementOf(wrapper));

    wrapper.unmount();

    expect(inspector.chart).toBeNull();
    expect(inspector.query()).toBeNull();
    expect(warn).toHaveBeenLastCalledWith(expect.stringContaining('언마운트된 차트다'));
  });

  it('list() 반환 행에는 요소를 넣지 않는다', async () => {
    const wrapper = mountChart();
    await flushPromises();
    vi.spyOn(console, 'table').mockImplementation(() => {});

    const [row] = window.__EVUI_CHART__.list();

    expect(row).not.toHaveProperty('element');
    wrapper.unmount();
  });

  it.each([
    ['화면 아래로 벗어난', (h) => ({ ...VISIBLE_RECT, top: h + 100, bottom: h + 400 })],
    ['화면 위로 벗어난', () => ({ ...VISIBLE_RECT, top: -400, bottom: -100 })],
    ['display: none 으로 숨긴', () => ({ top: 0, bottom: 0, width: 0, height: 0 })],
  ])('list() 는 %s 차트를 보여주지 않는다', async (_, rectOf) => {
    vi.spyOn(console, 'table').mockImplementation(() => {});
    const shown = mountChart();
    await flushPromises();
    const shownNo = lastInstance()._inspectNo;
    const hidden = mountChart();
    await flushPromises();
    chartElementOf(hidden).getBoundingClientRect = () => rectOf(window.innerHeight);

    const rows = window.__EVUI_CHART__.list();

    expect(rows.map((row) => row.no)).toEqual([shownNo]);
    shown.unmount();
    hidden.unmount();
  });

  describe('realTimeScatter 가 아닌 차트', () => {
    const LINE_OPTIONS = { type: 'line' };

    it('list() 에 나오지 않고 차트 번호도 받지 않는다', async () => {
      vi.spyOn(console, 'table').mockImplementation(() => {});
      const rts = mountChart();
      await flushPromises();
      const line = mountChart({ options: LINE_OPTIONS });
      await flushPromises();
      const lineChart = lastInstance();

      const rows = window.__EVUI_CHART__.list();

      expect(rows).toHaveLength(1);
      expect(lineChart._inspectNo).toBeUndefined();
      rts.unmount();
      line.unmount();
    });

    it('요소로 골라도 경고하고 조회 객체를 주지 않는다', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const line = mountChart({ options: LINE_OPTIONS });
      await flushPromises();

      expect(window.__EVUI_CHART__(chartElementOf(line))).toBeNull();
      expect(warn).toHaveBeenLastCalledWith(
        expect.stringContaining('realTimeScatter 차트가 아니다'),
      );
      expect(chartElementOf(line).__evuiChart__).toBeNull();
      line.unmount();
    });

    it('realTimeScatter 를 끈 뒤 언마운트돼도 받은 번호를 반납한다', async () => {
      const first = mountChart();
      await flushPromises();
      const firstChart = lastInstance();
      const no = firstChart._inspectNo;
      firstChart.options = { ...firstChart.options, realTimeScatter: { use: false } };

      first.unmount();
      const second = mountChart();
      await flushPromises();

      expect(lastInstance()._inspectNo).toBe(no);
      second.unmount();
    });
  });
});
