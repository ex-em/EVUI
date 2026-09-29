import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import modules from './plugins.tooltip';

/**
 * EvChartGroup options.sharedTooltip — 그룹 내 차트들이 툴팁 DOM 1벌을 공유하고 내용만 교체한다.
 * 그룹이 provide 하는 홀더({ elements, owner })를 직접 만들어 차트 간 소유권 전환을 검증한다.
 */

const createChart = (sharedTooltip, tooltip = {}) =>
  Object.assign(Object.create(modules), {
    options: { tooltip: { use: true, ...tooltip } },
    sharedTooltip,
    pixelRatio: 1,
  });

const tooltipCount = () => document.body.querySelectorAll('.ev-chart-tooltip').length;

describe('sharedTooltip (그룹 공유 툴팁)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn() });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('공유 홀더가 없으면 차트마다 툴팁 DOM 을 만든다(기존 동작)', () => {
    createChart(null).createTooltipDOM();
    createChart(null).createTooltipDOM();

    expect(tooltipCount()).toBe(2);
  });

  it('공유 홀더가 있으면 차트 수와 무관하게 툴팁 DOM 은 1개이고 같은 참조를 쓴다', () => {
    const shared = { elements: null, owner: null };
    const charts = Array.from({ length: 5 }, () => createChart(shared));
    charts.forEach((c) => c.createTooltipDOM());

    expect(tooltipCount()).toBe(1);
    charts.forEach((c) => {
      expect(c.tooltipDOM).toBe(charts[0].tooltipDOM);
      expect(c.tooltipCtx).toBe(charts[0].tooltipCtx);
    });
  });

  it('acquireTooltip 으로 소유권이 hover 차트로 옮겨간다', () => {
    const shared = { elements: null, owner: null };
    const a = createChart(shared);
    const b = createChart(shared);
    a.createTooltipDOM();
    b.createTooltipDOM();

    b.acquireTooltip();
    expect(shared.owner).toBe(b);
    expect(b.isTooltipOwner()).toBe(true);
    expect(a.isTooltipOwner()).toBe(false);
  });

  it('이전 소유 차트의 debounce 숨김이 늦게 발화해도 새 소유 차트의 툴팁을 끄지 않는다', () => {
    vi.useFakeTimers();
    const shared = { elements: null, owner: null };
    const a = createChart(shared, { debouncedHide: true });
    const b = createChart(shared, { debouncedHide: true });
    a.createTooltipDOM();
    b.createTooltipDOM();

    a.acquireTooltip();
    a.hideTooltipDOM(); // 셀 A 이탈 — 200ms 뒤 숨김 예약
    b.acquireTooltip(); // 셀 B 진입
    b.tooltipDOM.style.display = 'block';

    vi.advanceTimersByTime(300);
    expect(b.tooltipDOM.style.display).toBe('block');
  });

  it('소유하지 않은 차트의 tooltipClear/hideTooltipDOM 은 no-op 이다', () => {
    const shared = { elements: null, owner: null };
    const a = createChart(shared);
    const b = createChart(shared);
    a.createTooltipDOM();
    b.createTooltipDOM();
    b.acquireTooltip();
    b.tooltipDOM.style.display = 'block';

    a.tooltipClear();
    a.hideTooltipDOM();
    expect(b.tooltipDOM.style.display).toBe('block');

    b.tooltipClear();
    expect(b.tooltipDOM.style.display).toBe('none');
  });

  it('소유권 전환 시 이전 차트의 내용·인라인 스타일을 비우고 새 차트 레이아웃으로 재구성한다', () => {
    const shared = { elements: null, owner: null };
    const def = createChart(shared);
    const custom = createChart(shared, { formatter: { html: () => '<div>x</div>' } });
    def.createTooltipDOM();
    custom.createTooltipDOM();
    const dom = def.tooltipDOM;
    dom.style.boxShadow = '2px 2px 2px red';

    custom.acquireTooltip();
    expect(dom.children.length).toBe(0);
    expect(dom.style.boxShadow).toBe('');
    expect(dom.style.display).toBe('none');

    def.acquireTooltip();
    expect(dom.firstElementChild).toBe(def.tooltipHeaderDOM);
    expect(dom.lastElementChild).toBe(def.tooltipBodyDOM);
  });

  it('소유권 전환 시 이전 소유 차트의 가상 스크롤 세션을 정리한다', () => {
    const shared = { elements: null, owner: null };
    const a = createChart(shared);
    const b = createChart(shared);
    a.createTooltipDOM();
    b.createTooltipDOM();
    a.acquireTooltip();
    a._teardownCustomTooltipVirtualScroll = vi.fn();

    b.acquireTooltip();
    expect(a._teardownCustomTooltipVirtualScroll).toHaveBeenCalledTimes(1);
  });

  it('차트 destroy 는 공유 DOM 을 제거하지 않고 소유권만 내려놓는다', () => {
    const shared = { elements: null, owner: null };
    const a = createChart(shared);
    const b = createChart(shared);
    a.createTooltipDOM();
    b.createTooltipDOM();
    b.acquireTooltip();

    a.tooltipDestroy();
    expect(tooltipCount()).toBe(1);
    expect(shared.owner).toBe(b);

    b.tooltipDestroy();
    expect(tooltipCount()).toBe(1);
    expect(shared.owner).toBe(null);
    expect(shared.elements.tooltipDOM.style.display).toBe('none');
  });
});
