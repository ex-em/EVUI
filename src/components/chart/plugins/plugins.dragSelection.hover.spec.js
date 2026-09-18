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

// plot 영역 x 50~490 이 축 값 0~1000 에 대응. 픽셀 하나가 라벨 격자보다 잘게 값에 반영되는지 본다.
const AXES_STEPS = { x: [{ graphMin: 0, graphMax: 1000 }], y: [{ graphMin: 0, graphMax: 100 }] };
const axisValueAt = (posX) => +(((posX - 50) / 440) * 1000).toFixed(3);
const DRAG_RANGE = { x1: 50, x2: 490, y1: 10, y2: 270 };

/** dragMove 가 세우는 것과 같은 모양의 dragInfo (line: y 는 plot 전체 높이 고정) */
const dragInfoAt = (xcp, cursorX) => ({
  xcp,
  ycp: 100,
  range: DRAG_RANGE,
  isMove: true,
  xsp: Math.min(xcp, cursorX),
  ysp: DRAG_RANGE.y1,
  width: Math.ceil(Math.abs(cursorX - xcp)),
  height: DRAG_RANGE.y2 - DRAG_RANGE.y1,
});

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
    axesSteps: AXES_STEPS,
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
        // 이 스펙의 드래그 hover 케이스는 전부 이 옵션을 전제로 한다(기본값은 false).
        updateHoverOnDrag: true,
        fillColor: '#38ACEC',
        opacity: 0.65,
        startArea: '',
        displayFromStartArea: false,
      },
      ...opts,
    },

    getMousePosition: (e) => e.__pos,
    findClosestDataIndex: () => 2,
    findHitItem: () => ({ items: { ...HIT_ITEMS }, hitId: 's1' }),
    findPlotLabelHitRegion: () => null,
    handlePlotLabelHover: vi.fn(),
    isNotUseIndicator: () => true,
    getTimeLabel: () => null,
    getCurMouseTargetVal: () => ({}),
    hideTooltipDOM: vi.fn(),
    // 드래그 경로는 debouncedHide 를 우회한 즉시 hide 를 쓴다 (chart.core 의 hideTooltip)
    hideTooltip: vi.fn(),
    drawIndicatorForTooltip: () => ({ labelValue: 'L2' }),
    findSelectedItems: () => [],
    minMax: { x: [{ min: 0, max: 1000 }], y: [{ min: 0, max: 100 }] },
    tooltipClear: vi.fn(),
    invalidateClientRectCache: vi.fn(),

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
  const spy = vi.spyOn(window, 'addEventListener').mockImplementation((name, fn) => {
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

  // 기본값(false)은 기저 동작 — overlay 를 비우고 밴드만 그린다. 툴팁도 건드리지 않는다.
  it('updateHoverOnDrag 를 끄면 hover 없이 밴드만 그린다', () => {
    chart.options.dragSelection.updateHoverOnDrag = false;
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.calls).toEqual(['overlayClear', 'drawSelectionArea']);
    expect(chart.lastDragHoverEvent).toBeFalsy();
    expect(chart.hideTooltip).not.toHaveBeenCalled();
  });

  // 게이트가 넓어져도(수직 bar·콤보) 드래그 프레임은 line 과 같은 경로를 탄다 — 타입 분기가 없다.
  it.each([
    ['수직 bar', 'bar'],
    ['콤보(options.type 없음)', undefined],
  ])('%s 도 같은 순서로 hover 를 그리고 구간을 전달한다', (_, type) => {
    const barChart = createChart({ type });
    barChart.seriesList = { s1: { type: 'bar', show: true } };

    const { mousemove } = startDrag(barChart, [100, 100, 500, 300]);
    barChart.calls.length = 0;

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(barChart.calls).toEqual([
      'overlayClear',
      'drawItemsHighlight',
      'drawCustomTooltip',
      'setCustomTooltipLayoutPosition',
      'drawSelectionArea',
    ]);
    expect(barChart.drawCustomTooltip).toHaveBeenLastCalledWith(expect.anything(), {
      from: axisValueAt(100),
      to: axisValueAt(300),
    });
  });

  // 재렌더가 overlay·tooltipDOM 을 비우면 update() 가 이 이벤트로 hover 를 되살린다.
  it('hover 를 그린 프레임의 이벤트만 lastDragHoverEvent 로 남긴다', () => {
    const { mousemove, mouseup } = startDrag(chart, [100, 100, 500, 300]);

    const inside = moveEvent([300, 150, 500, 300]);
    mousemove(inside);
    expect(chart.lastDragHoverEvent).toBe(inside);

    mousemove(moveEvent([-40, 150, 500, 300]));
    expect(chart.lastDragHoverEvent).toBeNull();

    mousemove(inside);
    mouseup({});
    expect(chart.lastDragHoverEvent).toBeNull();
  });

  // 밴드는 clamp 된 좌표로 계속 갱신되므로, 툴팁을 남기면 밴드와 다른 구간을 가리킨다.
  it('커서가 캔버스 밖이면 툴팁을 감추고 밴드만 그린다', () => {
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    mousemove(moveEvent([-40, 150, 500, 300]));

    expect(chart.calls).toEqual(['overlayClear', 'drawSelectionArea']);
    expect(chart.hideTooltip).toHaveBeenCalled();
  });

  // 예외가 올라오면 overlayClear 뒤라 hover 도 밴드도 없는 빈 프레임이 된다.
  it('커스텀 툴팁 formatter 가 던져도 밴드는 그린다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    chart.tooltipDOM = document.createElement('div');
    chart.drawCustomTooltip = tooltipModules.drawCustomTooltip;
    chart.resetTooltipPlacement = tooltipModules.resetTooltipPlacement;
    chart.options.tooltip.formatter.html = () => {
      throw new Error('boom');
    };

    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);
    chart.calls.length = 0;

    expect(() => mousemove(moveEvent([300, 150, 500, 300]))).not.toThrow();
    expect(chart.calls).toContain('drawSelectionArea');

    warn.mockRestore();
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
      from: axisValueAt(100),
      to: axisValueAt(300),
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

    // 드래그 중에는 같은 hit 라도 매번 다시 그린다 — 헤더가 커서 픽셀에 연속으로 의존한다
    chart.dragInfo = dragInfoAt(100, 300);
    chart.drawHoverArtifacts(hover, true);
    chart.drawHoverArtifacts(hover, true);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(3);
  });

  it('mouseleave 로 시그니처가 무효화되어 다음 첫 hover 는 다시 그린다', () => {
    const hover = { __pos: [300, 150, 500, 300] };
    chart.listeners['mouse-leave'] = vi.fn();
    chart.tooltipDOM.style.display = 'block';

    chart.drawHoverArtifacts(hover);
    chart.drawHoverArtifacts(hover);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(1);

    chart.onMouseLeave({});
    chart.tooltipDOM.style.display = 'block';

    chart.drawHoverArtifacts(hover);
    expect(chart.drawCustomTooltip).toHaveBeenCalledTimes(2);
  });

  // throttledMove 는 드래그가 끝난 뒤 trailing 호출을 남길 수 있다 — 그 호출이 도착했을 때의
  // 최종 상태(밴드 유지 + 단일 지점 툴팁)를 고정한다.
  it('드래그 종료 후의 hover 는 keepDisplay 밴드를 유지하고 구간 정보 없이 그린다', () => {
    chart.options.dragSelection.keepDisplay = true;
    chart.listeners['drag-select'] = vi.fn();

    const { mousemove, mouseup } = startDrag(chart, [100, 100, 500, 300]);
    mousemove(moveEvent([300, 150, 500, 300]));
    mouseup({});

    expect(chart.dragInfoBackup).toBeTruthy();
    chart.calls.length = 0;

    chart.onMouseMove(moveEvent([300, 150, 500, 300]));

    expect(chart.calls.at(-1)).toBe('drawSelectionArea');
    expect(chart.drawSelectionArea).toHaveBeenLastCalledWith(chart.dragInfoBackup);
    expect(chart.drawCustomTooltip).toHaveBeenLastCalledWith(expect.anything(), undefined);
  });
});

describe('getDragRange', () => {
  // 라이브 헤더와 mouseup 페이로드가 갈리면 안 된다 — 같은 dragInfo 로 두 값이 정확히 같아야 한다.
  it('drag-select 가 내보낼 range 의 x 성분과 정확히 일치한다', () => {
    const chart = createChart();
    chart.dragInfo = dragInfoAt(100, 300);

    const { xMin, xMax } = chart.getSelectionRange(chart.dragInfo);
    expect(chart.getDragRange([300, 150])).toEqual({ from: xMin, to: xMax });
  });

  it('라벨 격자로 스냅하지 않는다 — 1px 만 움직여도 값이 달라진다', () => {
    const chart = createChart();

    chart.dragInfo = dragInfoAt(100, 300);
    const a = chart.getDragRange([300, 150]).to;
    chart.dragInfo = dragInfoAt(100, 301);
    const b = chart.getDragRange([301, 150]).to;

    expect(b).not.toBe(a);
  });

  it('시작/현재 순서를 유지한다 — 역방향 드래그면 from > to', () => {
    const chart = createChart();
    chart.dragInfo = dragInfoAt(300, 100);

    const { from, to } = chart.getDragRange([100, 100]);
    expect(from).toBeGreaterThan(to);
  });

  // 분기 라우팅과 from/to 순서만 고정한다 — 블록 스냅 계산 자체는 element.heatMap 의 몫이다.
  it('heatMap 은 블록 스냅 분기로 라우팅한다', () => {
    const chart = createChart({ type: 'heatMap' });
    chart.getSelectionRangeForHeatMap = vi.fn(() => ({ xMin: 'L1', xMax: 'L3' }));
    chart.dragInfo = dragInfoAt(100, 300);

    expect(chart.getDragRange([300, 150])).toEqual({ from: 'L1', to: 'L3' });
    expect(chart.getSelectionRangeForHeatMap).toHaveBeenCalledWith(chart.dragInfo);
  });

  it('heatMap 도 역방향 드래그면 순서를 뒤집는다', () => {
    const chart = createChart({ type: 'heatMap' });
    chart.getSelectionRangeForHeatMap = () => ({ xMin: 'L1', xMax: 'L3' });
    chart.dragInfo = dragInfoAt(300, 100);

    expect(chart.getDragRange([100, 150])).toEqual({ from: 'L3', to: 'L1' });
  });

  it('scatter 는 heatMap 분기를 타지 않는다', () => {
    const chart = createChart({ type: 'scatter' });
    chart.getSelectionRangeForHeatMap = vi.fn();
    chart.dragInfo = dragInfoAt(100, 300);

    const { xMin, xMax } = chart.getSelectionRange(chart.dragInfo);
    expect(chart.getDragRange([300, 150])).toEqual({ from: xMin, to: xMax });
    expect(chart.getSelectionRangeForHeatMap).not.toHaveBeenCalled();
  });

  it('드래그 전이거나 축 스텝이 없으면 undefined', () => {
    const chart = createChart();
    expect(chart.getDragRange([300, 150])).toBeUndefined();

    chart.dragInfo = dragInfoAt(100, 300);
    chart.axesSteps = { x: [], y: [] };
    expect(chart.getDragRange([300, 150])).toBeUndefined();
  });
});

describe('showTooltipOnEmpty', () => {
  // 막대 사이 간격·값이 null 인 라벨 위에서는 hit 이 0개다. 드래그 중 그 프레임에서도
  // 어느 구간을 잡고 있는지는 남아야 한다.
  const createEmptyHitChart = (showTooltipOnEmpty = false) => {
    const chart = createChart();
    chart.options.dragSelection.showTooltipOnEmpty = showTooltipOnEmpty;
    chart.findHitItem = () => ({ items: {}, hitId: null });
    return chart;
  };

  it('켜면 드래그 중 무히트 프레임에서 빈 seriesList 로 구간만 그린다', () => {
    const chart = createEmptyHitChart(true);
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.drawCustomTooltip).toHaveBeenCalledWith(
      {},
      { from: axisValueAt(100), to: axisValueAt(300) },
    );
    expect(chart.setCustomTooltipLayoutPosition).toHaveBeenCalled();
    expect(chart.hideTooltip).not.toHaveBeenCalled();
  });

  // debouncedHide 는 trailing 이라 프레임마다 부르면 타이머가 리셋돼 끝까지 감춰지지 않는다.
  it('기본값에서는 툴팁을 감춘다 — 드래그 중이므로 debounce 를 타지 않는다', () => {
    const chart = createEmptyHitChart();
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.hideTooltip).toHaveBeenCalled();
    expect(chart.hideTooltipDOM).not.toHaveBeenCalled();
    expect(chart.drawCustomTooltip).not.toHaveBeenCalled();
  });

  it('드래그 중이 아닌 무히트 hover 는 켜져 있어도 감추고, debounce 도 그대로 탄다', () => {
    const chart = createEmptyHitChart(true);

    chart.drawHoverArtifacts({ __pos: [300, 150, 500, 300] });

    expect(chart.hideTooltipDOM).toHaveBeenCalled();
    expect(chart.hideTooltip).not.toHaveBeenCalled();
    expect(chart.drawCustomTooltip).not.toHaveBeenCalled();
  });

  // keepDisplay: false 면 mouseup 때 밴드까지 지워져, 남은 헤더에는 근거가 하나도 없다.
  it('드래그가 끝나면 데이터 없이 띄운 구간 툴팁을 감춘다', () => {
    const chart = createEmptyHitChart(true);
    const { mousemove, mouseup } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));
    expect(chart.hideTooltip).not.toHaveBeenCalled();

    mouseup({});
    expect(chart.hideTooltip).toHaveBeenCalled();
  });

  it('returnValue 를 쓰면 그리지 않는다 — 소비처가 직접 렌더하는 경로다', () => {
    const chart = createEmptyHitChart(true);
    chart.options.tooltip.returnValue = vi.fn();
    const { mousemove } = startDrag(chart, [100, 100, 500, 300]);

    mousemove(moveEvent([300, 150, 500, 300]));

    expect(chart.options.tooltip.returnValue).toHaveBeenCalledWith([], expect.anything());
    expect(chart.drawCustomTooltip).not.toHaveBeenCalled();
    expect(chart.hideTooltip).toHaveBeenCalled();
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
    const dragRange = { from: 100, to: 300 };
    createTooltipChart(html).drawCustomTooltip(HIT_ITEMS, dragRange);

    expect(html.mock.calls[0]).toHaveLength(2);
    expect(html.mock.calls[0][1]).toEqual({ dragRange });
  });

  // 빈 seriesList 는 itemsCount 가 0이라 가상 경로 게이트를 통과할 수 없다 — 항상 이 경로다.
  it('formatter 가 던져도 예외를 올리지 않고 툴팁만 감춘다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = createTooltipChart(() => {
      throw new Error('boom');
    });
    chart.tooltipDOM.style.display = 'block';

    expect(() => chart.drawCustomTooltip(HIT_ITEMS)).not.toThrow();
    expect(chart.tooltipDOM.style.display).toBe('none');

    // 드래그 중에는 프레임마다 불리므로 경고가 쌓이면 안 된다
    chart.drawCustomTooltip(HIT_ITEMS);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });

  it('첫 항목을 참조하는 기존 formatter 가 빈 seriesList 에서 던져도 같다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chart = createTooltipChart((list) => `<div>${list[0].name}</div>`);

    expect(() => chart.drawCustomTooltip({}, { from: 1, to: 2 })).not.toThrow();
    expect(chart.tooltipDOM.style.display).toBe('none');

    warn.mockRestore();
  });

  // 텍스트 노드로 시작하는 마크업은 htmlToElement 가 그 노드만 돌려줘 루트가 비어 보인다 —
  // setCustomTooltipLayoutPosition 의 복구 재draw 조건이다.
  it('드래그 중에는 루트가 비어도 복구 재draw 를 하지 않는다', () => {
    const html = vi.fn(() => 'text<div>t</div>');
    const chart = createTooltipChart(html);
    chart.dragInfo = { isMove: true };

    chart.drawCustomTooltip(HIT_ITEMS, { from: 1, to: 2 });
    chart.setCustomTooltipLayoutPosition({ items: HIT_ITEMS }, {});

    expect(html).toHaveBeenCalledTimes(1);
  });

  it('드래그가 아니면 복구 재draw 로 한 번 더 그린다', () => {
    const html = vi.fn(() => 'text<div>t</div>');
    const chart = createTooltipChart(html);

    chart.drawCustomTooltip(HIT_ITEMS);
    chart.setCustomTooltipLayoutPosition({ items: HIT_ITEMS }, {});

    expect(html).toHaveBeenCalledTimes(2);
  });
});
