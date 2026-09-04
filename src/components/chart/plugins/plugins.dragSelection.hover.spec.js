import { describe, it, expect, vi, beforeEach } from 'vitest';
import interactionModules from './plugins.interaction';
import tooltipModules from './plugins.tooltip';

/**
 * dragSelection 드래그 중 hover 갱신(#2340) 테스트.
 *
 * 드래그 중 overlay 는 dragMove 가 소유한다 — hover 아티팩트를 그린 뒤 밴드를 마지막에 그려야
 * 밴드가 hover 위에 남는다. 이 순서와, 드래그 구간이 커스텀 툴팁 formatter 로 전달되는지를 고정한다.
 */

const LABELS = ['L0', 'L1', 'L2', 'L3', 'L4'];

// 라벨 100px 간격. 드래그 시작 x=100 → L1, 이동 x=300 → L3.
const closestIndexByX = (x) => Math.min(Math.max(Math.round(x / 100), 0), LABELS.length - 1);

const HIT_ITEMS = {
  s1: { index: 2, data: { x: 'L2', y: 10 }, color: '#f00', name: 's1', id: 'd1' },
};

const createChart = (opts = {}) => {
  const calls = [];
  const record = (name) =>
    vi.fn(() => {
      calls.push(name);
    });

  const chart = Object.assign(Object.create(interactionModules), {
    isMobile: false,
    isInitTooltip: true,
    seriesList: { s1: { type: 'line', show: true } },
    listeners: {},
    data: { labels: LABELS },
    chartRect: { x1: 0, y1: 0, x2: 500, y2: 300 },
    labelOffset: { left: 50, right: 10, top: 10, bottom: 30 },
    overlayCtx: {},
    overlayCanvas: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
    tooltipDOM: { style: { display: 'none' } },
    target: { closest: () => null },
    options: {
      type: 'line',
      horizontal: false,
      title: { text: '' },
      indicator: { color: '#000' },
      tooltip: { use: true, formatter: { html: () => '<div>t</div>' } },
      dragSelection: {
        use: true,
        keepDisplay: false,
        fillColor: '#38ACEC',
        opacity: 0.65,
        startArea: '',
        displayFromStartArea: false,
      },
      ...opts,
    },

    getMousePosition: (e) => e.__pos,
    findClosestDataIndex: ([x]) => closestIndexByX(x),
    findHitItem: () => ({ items: { ...HIT_ITEMS }, hitId: 's1' }),
    findPlotLabelHitRegion: () => null,
    handlePlotLabelHover: vi.fn(),
    isNotUseIndicator: () => true,
    getTimeLabel: () => null,
    getCurMouseTargetVal: () => ({}),
    hideTooltipDOM: vi.fn(),
    drawIndicatorForTooltip: () => ({ labelValue: 'L2' }),

    calls,
    overlayClear: record('overlayClear'),
    drawItemsHighlight: record('drawItemsHighlight'),
    drawCustomTooltip: record('drawCustomTooltip'),
    setCustomTooltipLayoutPosition: record('setCustomTooltipLayoutPosition'),
    drawSelectionArea: record('drawSelectionArea'),
  });

  chart.createEventFunctions();
  return chart;
};

/** onMouseDown → dragStart 가 window 에 등록하는 dragMove/dragEnd 를 가로챈다. */
const startDrag = (chart, pos) => {
  const handlers = {};
  const spy = vi
    .spyOn(window, 'addEventListener')
    .mockImplementation((name, fn) => {
      handlers[name] = fn;
    });

  chart.onMouseDown({ __pos: pos });
  spy.mockRestore();

  return handlers;
};

const moveEvent = (pos) => ({ __pos: pos, preventDefault: vi.fn() });

describe('dragSelection 드래그 중 hover 갱신', () => {
  let chart;

  beforeEach(() => {
    chart = createChart();
  });

  it('드래그 중 mousemove 는 hover 를 그린 뒤 밴드를 마지막에 그린다', () => {
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.calls).toEqual([
      'overlayClear',
      'drawItemsHighlight',
      'drawCustomTooltip',
      'setCustomTooltipLayoutPosition',
      'drawSelectionArea',
    ]);
  });

  it('커서가 캔버스 밖이면 hover 없이 overlay 를 비우고 밴드만 그린다', () => {
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    mousemove(moveEvent([-40, 150, 500, 300]));

    expect(chart.calls).toEqual(['overlayClear', 'drawSelectionArea']);
  });

  it('모바일에서는 드래그 중 hover 를 그리지 않는다', () => {
    chart.isMobile = true;
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.calls).toEqual(['overlayClear', 'drawSelectionArea']);
  });

  it('드래그 중에는 mouse-move 리스너가 발화하지 않는다', () => {
    chart.listeners['mouse-move'] = vi.fn();
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));
    expect(chart.listeners['mouse-move']).not.toHaveBeenCalled();

    chart.drawHoverArtifacts({ __pos: [300, 150, 500, 300] });
    expect(chart.listeners['mouse-move']).toHaveBeenCalledTimes(1);
  });

  it('드래그 중이면 커스텀 툴팁에 구간 라벨이 전달되고, 아니면 전달되지 않는다', () => {
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));
    expect(chart.drawCustomTooltip).toHaveBeenLastCalledWith(expect.anything(), {
      fromLabel: 'L1',
      toLabel: 'L3',
    });

    chart.drawHoverArtifacts({ __pos: [300, 150, 500, 300] });
    expect(chart.drawCustomTooltip).toHaveBeenLastCalledWith(expect.anything(), undefined);
  });

  it('같은 데이터 포인트라도 드래그 진입 프레임에서는 fast path 로 스킵되지 않는다', () => {
    const hover = { __pos: [300, 150, 500, 300] };
    chart.tooltipDOM.style.display = 'block';

    chart.drawHoverArtifacts(hover);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(1);

    // 같은 hit → fast path 로 커스텀 툴팁 redraw 스킵
    chart.drawHoverArtifacts(hover);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(1);

    // 드래그 진입 → 구간 정보가 붙으므로 다시 그려야 한다
    chart.drawHoverArtifacts(hover, true);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(2);
  });
});

describe('getDragRangeLabels', () => {
  it('시작점은 dragInfo, 끝점은 전달된 커서 위치로 스냅한다', () => {
    const chart = createChart();
    chart.dragInfo = { xcp: 100, ycp: 100 };

    expect(chart.getDragRangeLabels([300, 150])).toEqual({ fromLabel: 'L1', toLabel: 'L3' });
  });

  it('역방향 드래그면 fromLabel 이 toLabel 보다 뒤 라벨이다', () => {
    const chart = createChart();
    chart.dragInfo = { xcp: 300, ycp: 150 };

    expect(chart.getDragRangeLabels([100, 100])).toEqual({ fromLabel: 'L3', toLabel: 'L1' });
  });

  it('드래그 중이 아니거나 라벨이 없으면 undefined', () => {
    const chart = createChart();
    expect(chart.getDragRangeLabels([300, 150])).toBeUndefined();

    chart.dragInfo = { xcp: 100, ycp: 100 };
    chart.data = { labels: [] };
    expect(chart.getDragRangeLabels([300, 150])).toBeUndefined();
  });
});

describe('formatter.html 인자', () => {
  const createTooltipChart = (html) =>
    Object.assign(Object.create(tooltipModules), {
      tooltipDOM: document.createElement('div'),
      options: {
        tooltip: {
          formatter: { html },
          backgroundColor: '#fff',
          borderColor: '#000',
          fontColor: { title: '#000' },
        },
      },
    });

  it('드래그 중이 아니면 seriesList 한 개만 넘긴다', () => {
    const html = vi.fn(() => '<div>t</div>');
    createTooltipChart(html).drawCustomTooltip(HIT_ITEMS);

    expect(html.mock.calls[0]).toHaveLength(1);
  });

  it('드래그 중이면 2번째 인자로 { dragRange } 를 넘긴다', () => {
    const html = vi.fn(() => '<div>t</div>');
    const dragRange = { fromLabel: 'L1', toLabel: 'L3' };
    createTooltipChart(html).drawCustomTooltip(HIT_ITEMS, dragRange);

    expect(html.mock.calls[0]).toHaveLength(2);
    expect(html.mock.calls[0][1]).toEqual({ dragRange });
  });
});
