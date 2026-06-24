import { describe, it, expect, beforeEach } from 'vitest';
import VirtualScroll from './plugins.tooltip.virtualScroll';

/**
 * 커스텀 툴팁 가상 스크롤 — 비-row 요소(그룹 헤더·구분선·marker) 순서 보존 테스트.
 *
 * 검증 축:
 *  1) 컨테이너 직속 자식 전체를 순서 보존 "아이템"으로 가상화한다(행 + 비-row).
 *  2) 비-row 요소가 bottom spacer 뒤로 적층되지 않는다(고아 헤더 0개).
 *  3) 스크롤 시 비-row가 자기 그룹 행과 함께 들어오고 나간다(통합 좌표계).
 *  4) 비-row 높이가 행 높이와 달라도 spacer 총합/스크롤 범위가 정확하다.
 *  5) 행만 있는 본문은 기존 동작과 동일(회귀 없음).
 *
 * jsdom은 offsetHeight=0이므로, 높이 의존 검증은 vsState에 명시 높이를 주입해
 * 순수 계산(prefixSums/visibleRange/spacer/render)을 직접 검증한다.
 */

// ---- 헬퍼 ---------------------------------------------------------------

const ROW_ATTR = 'data-evui-tooltip-row';

/** 그룹 구조 HTML 생성. groups: [{ header, rows }] */
const buildGroupedHtml = (groups) => {
  let body = '';
  groups.forEach((g, gi) => {
    if (g.header != null) {
      body += `<div class="series-name">${g.header}</div>`;
    }
    for (let r = 0; r < g.rows; r++) {
      body += `<div class="row" ${ROW_ATTR}>g${gi}r${r}</div>`;
    }
  });
  return (
    '<div class="ev-chart-tooltip-custom">' +
    '<div class="ev-chart-tooltip-custom__header">H</div>' +
    `<div class="ev-chart-tooltip-custom__body">${body}</div>` +
    '</div>'
  );
};

const countRows = (groups) => groups.reduce((acc, g) => acc + g.rows, 0);

/** hitInfoItems 모킹 — formatter는 무시하므로 키 개수만 맞으면 된다. */
const makeHitInfoItems = (n) => {
  const items = {};
  for (let i = 0; i < n; i++) {
    items[`s${i}`] = { data: { o: i }, color: '#000', name: `s${i}`, id: `s${i}`, index: i };
  }
  return items;
};

/** drawCustomTooltipVirtual 진입용 모킹 차트. */
const createChart = (html, vsOpt = { use: true, estimatedRowHeight: 25, overscan: 5 }) =>
  Object.assign(Object.create(VirtualScroll), {
    vsState: null,
    _vsLearnedAverageHeight: undefined,
    _vsDetectFailed: false,
    _vsWarnedFallback: false,
    tooltipDOM: document.createElement('div'),
    options: {
      tooltip: {
        maxHeight: 480,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        fontColor: { title: '#333' },
        virtualScroll: vsOpt,
        formatter: { html: () => html },
      },
    },
  });

/** 명시 높이로 vsState를 직접 구성(순수 계산 검증용). spec: [{ label, isRow, height }] */
const setupVsState = (chart, spec, { clientHeight = 100, scrollTop = 0, overscan = 0 } = {}) => {
  const items = spec.map((s) => {
    const el = document.createElement('div');
    if (s.isRow) el.setAttribute(ROW_ATTR, '');
    el.textContent = s.label;
    el.dataset.label = s.label;
    return el;
  });
  const scrollEl = document.createElement('div');
  Object.defineProperty(scrollEl, 'clientHeight', { value: clientHeight, configurable: true });
  scrollEl.scrollTop = scrollTop;

  chart.vsState = {
    scrollEl,
    topSpacer: document.createElement('div'),
    viewport: document.createElement('div'),
    bottomSpacer: document.createElement('div'),
    items,
    isRow: spec.map((s) => s.isRow),
    heights: spec.map((s) => s.height),
    measured: spec.map(() => true), // 사전 측정 처리 → render가 측정 패스를 타지 않음(jsdom offsetHeight=0)
    prefixSums: [],
    totalHeight: 0,
    range: { start: 0, end: -1 },
    estimatedRowHeight: 25,
    overscan,
    maxHeight: 480,
    rafPending: false,
    suppressScroll: false,
    measureDepth: 0,
  };
  chart._recomputeCustomTooltipPrefixSums();
  return chart.vsState;
};

const labelsOf = (parent) => Array.from(parent.children).map((c) => c.dataset.label);

// ---- 컨테이너 탐지 + 아이템 분류 ---------------------------------------

describe('_findCustomTooltipContainer + 아이템 분류', () => {
  it('마크된 행 부모를 컨테이너로 찾고, 비-row 형제도 컨테이너로 인정한다', () => {
    const chart = createChart('');
    const html = buildGroupedHtml([{ header: 'A', rows: 3 }, { header: 'B', rows: 2 }]);
    const root = document.createElement('template');
    root.innerHTML = html.trim();
    const parsed = root.content.firstChild;

    const container = chart._findCustomTooltipContainer(parsed, 5);
    expect(container).not.toBeNull();
    expect(container.classList.contains('ev-chart-tooltip-custom__body')).toBe(true);
    // 직속 자식 = 헤더2 + 행5 = 7
    expect(container.children.length).toBe(7);
  });

  it('마크가 없고 자식 수가 series 수와 일치하면 BFS로 컨테이너를 찾는다', () => {
    const chart = createChart('');
    const html =
      '<div class="body"><div>r0</div><div>r1</div><div>r2</div></div>';
    const root = document.createElement('template');
    root.innerHTML = html.trim();
    const parsed = root.content.firstChild;

    const container = chart._findCustomTooltipContainer(parsed, 3);
    expect(container).not.toBeNull();
    expect(container.children.length).toBe(3);
  });
});

// ---- 통합: drawCustomTooltipVirtual (순서/고아 검증) --------------------

describe('drawCustomTooltipVirtual — 혼합 아이템 순서 보존', () => {
  it('행+헤더가 섞인 본문에서 모든 아이템이 원래 순서대로 viewport에 들어간다', () => {
    const groups = [
      { header: 'A', rows: 3 },
      { header: 'B', rows: 2 },
      { header: 'C', rows: 2 },
    ];
    const html = buildGroupedHtml(groups);
    const chart = createChart(html);

    const ok = chart.drawCustomTooltipVirtual(makeHitInfoItems(countRows(groups)));
    expect(ok).toBe(true);

    const body = chart.tooltipDOM.querySelector('.ev-chart-tooltip-custom__body');
    // 컨테이너 직속 자식은 trio(top spacer / viewport / bottom spacer)뿐
    expect(body.children.length).toBe(3);
    expect(body.children[0].classList.contains('ev-chart-tooltip-virtual__spacer')).toBe(true);
    expect(body.children[1].classList.contains('ev-chart-tooltip-virtual__viewport')).toBe(true);
    expect(body.children[2].classList.contains('ev-chart-tooltip-virtual__spacer')).toBe(true);

    // 작은 본문(9 아이템<윈도우)이라 전부 viewport에 들어가며 원래 순서를 보존한다.
    const viewport = body.children[1];
    const texts = Array.from(viewport.children).map((c) => c.textContent);
    expect(texts).toEqual([
      'A', 'g0r0', 'g0r1', 'g0r2',
      'B', 'g1r0', 'g1r1',
      'C', 'g2r0', 'g2r1',
    ]);
  });

  it('헤더는 fixed 영역으로 보존되고, 본문에 고아 헤더가 0개다', () => {
    const groups = [{ header: 'A', rows: 2 }, { header: 'B', rows: 2 }];
    const html = buildGroupedHtml(groups);
    const chart = createChart(html);

    chart.drawCustomTooltipVirtual(makeHitInfoItems(countRows(groups)));

    const root = chart.tooltipDOM.querySelector('.ev-chart-tooltip-custom');
    // __header(차트 제목)는 __body 밖에 그대로 보존
    expect(root.querySelector(':scope > .ev-chart-tooltip-custom__header')).not.toBeNull();

    const body = chart.tooltipDOM.querySelector('.ev-chart-tooltip-custom__body');
    // 그룹 헤더(.series-name)가 컨테이너 직속(=spacer 뒤)에 적층되지 않음
    expect(body.querySelectorAll(':scope > .series-name').length).toBe(0);
    // 모든 .series-name 은 viewport 내부에 존재
    const viewport = body.querySelector('.ev-chart-tooltip-virtual__viewport');
    expect(viewport.querySelectorAll('.series-name').length).toBe(2);
    // bottom spacer 뒤에는 아무 형제도 없다(고아 0)
    const bottomSpacer = body.children[body.children.length - 1];
    expect(bottomSpacer.nextElementSibling).toBeNull();
  });

  it('vsState.isRow 가 속성 유무대로 분류된다(헤더=false, 행=true)', () => {
    const groups = [{ header: 'A', rows: 2 }, { header: 'B', rows: 1 }];
    const html = buildGroupedHtml(groups);
    const chart = createChart(html);

    chart.drawCustomTooltipVirtual(makeHitInfoItems(countRows(groups)));
    // 순서: A(header), g0r0, g0r1, B(header), g1r0
    expect(chart.vsState.isRow).toEqual([false, true, true, false, true]);
  });
});

// ---- 회귀: 행만 있는 본문 ----------------------------------------------

describe('회귀 — 행만 있는 본문', () => {
  it('마크된 행만 있는 본문은 전부 행으로 처리되고 순서 보존된다', () => {
    const groups = [{ header: null, rows: 6 }];
    const html = buildGroupedHtml(groups);
    const chart = createChart(html);

    const ok = chart.drawCustomTooltipVirtual(makeHitInfoItems(6));
    expect(ok).toBe(true);
    expect(chart.vsState.items.length).toBe(6);
    expect(chart.vsState.isRow).toEqual([true, true, true, true, true, true]);

    const viewport = chart.tooltipDOM.querySelector('.ev-chart-tooltip-virtual__viewport');
    expect(Array.from(viewport.children).map((c) => c.textContent)).toEqual([
      'g0r0', 'g0r1', 'g0r2', 'g0r3', 'g0r4', 'g0r5',
    ]);
  });

  it('마크가 없는 휴리스틱(BFS) 본문은 모든 아이템을 행으로 간주한다(학습 동작 보존)', () => {
    const html = '<div class="body"><div>r0</div><div>r1</div><div>r2</div><div>r3</div></div>';
    const chart = createChart(html);

    const ok = chart.drawCustomTooltipVirtual(makeHitInfoItems(4));
    expect(ok).toBe(true);
    expect(chart.vsState.isRow).toEqual([true, true, true, true]);
  });
});

// ---- 높이/스크롤 범위 정확성 (명시 높이 주입) ---------------------------

describe('통합 좌표계 — 비-row 높이≠행 높이', () => {
  // 3그룹 × [헤더(20), 행(30), 행(30)] → 인덱스 0..8
  const spec = [
    { label: 'H0', isRow: false, height: 20 },
    { label: 'g0r0', isRow: true, height: 30 },
    { label: 'g0r1', isRow: true, height: 30 },
    { label: 'H1', isRow: false, height: 20 },
    { label: 'g1r0', isRow: true, height: 30 },
    { label: 'g1r1', isRow: true, height: 30 },
    { label: 'H2', isRow: false, height: 20 },
    { label: 'g2r0', isRow: true, height: 30 },
    { label: 'g2r1', isRow: true, height: 30 },
  ];
  // total = 3*(20+30+30) = 240

  let chart;
  beforeEach(() => {
    chart = createChart('');
  });

  it('totalHeight 가 행+비-row 높이를 모두 합산한다', () => {
    setupVsState(chart, spec, { clientHeight: 100, scrollTop: 0 });
    expect(chart.vsState.totalHeight).toBe(240);
  });

  it('최상단에서 첫 윈도우가 헤더-행 순서를 정확히 잡는다', () => {
    setupVsState(chart, spec, { clientHeight: 100, scrollTop: 0, overscan: 0 });
    chart._renderVisibleCustomTooltipRows();
    const viewport = chart.vsState.viewport;
    // scrollTop=0, clientHeight=100 → prefixSums: 0,20,50,80,100,...
    // start=0, end: prefixSums[i]>=100 인 최소 i = 4 → [0..4]
    expect(labelsOf(viewport)).toEqual(['H0', 'g0r0', 'g0r1', 'H1', 'g1r0']);
    // 첫 헤더 H0 가 자기 행 위에 위치
    expect(viewport.firstChild.dataset.label).toBe('H0');
  });

  it('맨 아래로 스크롤하면 마지막 그룹 헤더가 자기 행 위에 들어온다(고아 없음)', () => {
    // scrollTop = total - clientHeight = 140
    setupVsState(chart, spec, { clientHeight: 100, scrollTop: 140, overscan: 0 });
    chart._renderVisibleCustomTooltipRows();
    const viewport = chart.vsState.viewport;
    // prefixSums: [0,20,50,80,100,130,160,180,210,240]
    // start: prefixSums[i+1]>140 → i=5(g1r1) ; end: prefixSums[i]>=240 → 8
    const labels = labelsOf(viewport);
    expect(labels).toEqual(['g1r1', 'H2', 'g2r0', 'g2r1']);
    // 마지막 헤더 H2 가 자기 그룹 행(g2r0)보다 앞에 위치
    expect(labels.indexOf('H2')).toBeLessThan(labels.indexOf('g2r0'));
  });

  it('spacer 총합 불변식: topSpacer + 가시영역 + bottomSpacer = totalHeight', () => {
    const s = setupVsState(chart, spec, { clientHeight: 100, scrollTop: 140, overscan: 0 });
    chart._renderVisibleCustomTooltipRows();
    const topH = parseFloat(s.topSpacer.style.height);
    const bottomH = parseFloat(s.bottomSpacer.style.height);
    let visibleH = 0;
    for (let i = s.range.start; i <= s.range.end; i++) visibleH += s.heights[i];
    expect(topH + visibleH + bottomH).toBe(s.totalHeight);
    // 맨 아래라 bottom spacer = 0 (적층 공간 없음)
    expect(bottomH).toBe(0);
  });

  it('overscan 이 가시 범위를 양쪽으로 확장한다', () => {
    setupVsState(chart, spec, { clientHeight: 100, scrollTop: 80, overscan: 1 });
    const range = chart._computeCustomTooltipVisibleRange();
    const rangeNoOverscan = (() => {
      chart.vsState.overscan = 0;
      return chart._computeCustomTooltipVisibleRange();
    })();
    expect(range.start).toBeLessThanOrEqual(rangeNoOverscan.start);
    expect(range.end).toBeGreaterThanOrEqual(rangeNoOverscan.end);
  });
});
