import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Tooltip from './plugins.tooltip';

/**
 * 툴팁 배치 — 가시 영역 기준 반전 + 폭 상한 단위 테스트.
 *
 * 검증 축:
 *  1) 반전 기준은 `document.body.clientWidth` 가 아니라 "문서 좌표계로 표현한 가시 영역"이다.
 *     (body 가 뷰포트보다 넓은 레이아웃에서 body 기준은 툴팁을 화면 밖으로 내보낸다)
 *  2) 배치 지점에서 가시 영역 끝까지 남은 폭을 `max-width` 상한으로 건다 — 배치 이후 내용이
 *     넓어져도 레이아웃 단계에서 넘지 못한다.
 *  3) 상한은 다음 배치의 측정을 누르지 않도록 측정 직전에 해제한다.
 *
 * jsdom 은 레이아웃이 없으므로 크기와 뷰포트·스크롤을 주입한다.
 */

const VIEW_W = 1280;
const VIEW_H = 800;
const TIP_W = 258;

const setViewport = (width, height) => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: height,
    configurable: true,
  });
};

const setScroll = (x, y) => {
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
};

const createChart = ({ width, height = 120 }) => {
  const tooltipDOM = document.createElement('div');
  const child = document.createElement('div');
  // hover 지점마다 폭이 달라지는 실제 툴팁을 흉내내기 위해 가변으로 둔다.
  let currentWidth = width;
  Object.defineProperty(child, 'offsetWidth', { get: () => currentWidth, configurable: true });
  Object.defineProperty(child, 'offsetHeight', { value: height, configurable: true });
  tooltipDOM.appendChild(child);
  tooltipDOM.getBoundingClientRect = () => ({ width: currentWidth, height });

  return Object.assign(Object.create(Tooltip), {
    tooltipDOM,
    tooltipBodyDOM: document.createElement('div'),
    options: { tooltip: {} },
    setTooltipWidth: (next) => {
      currentWidth = next;
    },
  });
};

/**
 * 반전 배치는 `translateX(-100%)` 로 우단을 앵커에 고정하므로, 실효 좌측은 앵커에서 폭을 뺀 값이다.
 * 폭이 나중에 커져도 우단(앵커)은 움직이지 않는다 — 그 성질을 테스트에서도 그대로 본다.
 */
const getPlacement = (dom) => {
  const [, x, y] = dom.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px/);
  const flipped = dom.style.transform.includes('translateX(-100%)');
  const anchorX = Number(x);
  const width = dom.getBoundingClientRect().width;

  return {
    flipped,
    anchorX,
    x: flipped ? anchorX - width : anchorX,
    y: Number(y),
    right: flipped ? anchorX : anchorX + Number.parseFloat(dom.style.maxWidth),
  };
};
const getTranslate = getPlacement;

describe('setCustomTooltipLayoutPosition 배치', () => {
  beforeEach(() => {
    setViewport(VIEW_W, VIEW_H);
    setScroll(0, 0);
    Object.defineProperty(document.body, 'clientWidth', { value: VIEW_W, configurable: true });
  });
  afterEach(() => {
    setViewport(0, 0);
    setScroll(0, 0);
  });

  it('반전이 필요 없으면 커서 오른쪽에 배치한다', () => {
    const chart = createChart({ width: TIP_W });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).x).toBe(420);
  });

  it('body 가 뷰포트보다 넓어도 가시 영역 기준으로 반전한다', () => {
    // 대시보드 레이아웃: body 는 2000px 인데 실제 보이는 폭은 1280px 이다.
    Object.defineProperty(document.body, 'clientWidth', { value: 2000, configurable: true });
    const chart = createChart({ width: TIP_W });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).x).toBe(1100 - TIP_W - 20);
  });

  it('가로로 스크롤된 문서에서는 스크롤된 가시 영역이 기준이다', () => {
    setScroll(1200, 0);
    const chart = createChart({ width: TIP_W });
    // 가시 영역은 문서 좌표 [1200, 2480]. 커서(pageX 1500) 오른쪽 20px 에 놓일 여유가 있다.
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1500, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).x).toBe(1520);
  });

  it('배치 지점에서 가시 영역 끝까지 남은 폭을 상한으로 건다', () => {
    const chart = createChart({ width: TIP_W });

    for (let pageX = 0; pageX <= VIEW_W; pageX += 7) {
      chart.setCustomTooltipLayoutPosition({}, { pageX, pageY: 100 });

      // 폭이 나중에 얼마나 커져도 우단을 넘을 수 없다 — 오른쪽 배치는 상한이, 반전 배치는
      // 우단 고정(translateX(-100%))이 막는다.
      expect(getPlacement(chart.tooltipDOM).right).toBeLessThanOrEqual(VIEW_W);
    }
  });

  it('다음 배치의 측정이 직전 상한에 눌리지 않도록 먼저 해제한다', () => {
    const chart = createChart({ width: TIP_W });
    chart.tooltipDOM.style.maxWidth = '120px';
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 100 });

    expect(chart.tooltipDOM.style.maxWidth).toBe(`${VIEW_W - 420}px`);
  });
});

describe('가로 반전 방향 유지', () => {
  beforeEach(() => {
    setViewport(VIEW_W, VIEW_H);
    setScroll(0, 0);
  });
  afterEach(() => {
    setViewport(0, 0);
    setScroll(0, 0);
  });

  it('반전된 뒤에는 폭이 줄어도 방향을 유지한다', () => {
    const chart = createChart({ width: TIP_W });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });
    expect(getTranslate(chart.tooltipDOM).x).toBe(1100 - TIP_W - 20);

    // 폭이 줄면 커서 오른쪽에도 들어가지만, 방향이 바뀌면 툴팁이 좌우로 튄다.
    chart.setTooltipWidth(100);
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).x).toBe(1100 - 100 - 20);
  });

  it('커서가 왼쪽 가장자리라 왼쪽에 못 놓으면 오른쪽으로 되돌린다', () => {
    const chart = createChart({ width: TIP_W });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });
    expect(getTranslate(chart.tooltipDOM).x).toBe(1100 - TIP_W - 20);

    chart.setCustomTooltipLayoutPosition({}, { pageX: 50, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).x).toBe(70);
  });

  it('양쪽 모두 안 들어가면 남은 폭이 넓은 쪽을 택한다', () => {
    const chart = createChart({ width: VIEW_W + 200 });
    // 커서가 가시 영역 중앙 왼쪽이라 오른쪽 여유(660)가 왼쪽(580)보다 넓다.
    chart.setCustomTooltipLayoutPosition({}, { pageX: 600, pageY: 100 });
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(false);
    expect(chart.tooltipDOM.style.maxWidth).toBe(`${VIEW_W - 620}px`);

    chart.setCustomTooltipLayoutPosition({}, { pageX: 700, pageY: 100 });
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);
    expect(chart.tooltipDOM.style.maxWidth).toBe('680px');
  });

  it('양쪽 모두 안 들어갈 때 커서가 우단 20px 안이어도 상한이 0 이 되지 않는다', () => {
    // 폭 판정만으로 오른쪽을 고집하면 남은 폭이 음수라 max-width: 0 → 테두리만 남고 내용이 사라진다.
    const chart = createChart({ width: VIEW_W + 200 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: VIEW_W - 5, pageY: 100 });

    expect(Number.parseFloat(chart.tooltipDOM.style.maxWidth)).toBe(VIEW_W - 25);
  });

  it('양쪽 모두 안 들어가는 구간에서는 폭이 흔들려도 커서 위치로만 방향이 정해진다', () => {
    // 폭 기준으로 판정하면 hover 지점마다 폭이 달라지는 차트에서 좌우가 번갈아 뒤집힌다.
    const chart = createChart({ width: VIEW_W + 200 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 700, pageY: 100 });
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);

    chart.setTooltipWidth(VIEW_W + 900);
    chart.setCustomTooltipLayoutPosition({}, { pageX: 700, pageY: 100 });

    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);
  });
});

describe('방향 기억 초기화', () => {
  beforeEach(() => {
    setViewport(VIEW_W, VIEW_H);
    setScroll(0, 0);
  });
  afterEach(() => {
    setViewport(0, 0);
    setScroll(0, 0);
  });

  it('마우스가 차트를 벗어나면(tooltipClear) 방향 기억을 버린다', () => {
    // mouse-leave 의 주 경로는 hideTooltipDOM 이 아니라 tooltipClear 다(plugins.interaction.js).
    const chart = createChart({ width: TIP_W });
    chart.tooltipCtx = { clearRect: () => {} };
    chart.tooltipCanvas = Object.assign(document.createElement('canvas'), {
      width: 1,
      height: 1,
    });
    chart.pixelRatio = 1;

    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);

    chart.tooltipClear();
    chart.setCustomTooltipLayoutPosition({}, { pageX: 600, pageY: 100 });

    expect(getPlacement(chart.tooltipDOM).flipped).toBe(false);
    expect(getPlacement(chart.tooltipDOM).x).toBe(620);
  });

  it('debouncedHide 예약 중에 다시 표시되면 방향 기억이 유지된다', () => {
    // 트레일링 콜백이 살아있으면 보이는 툴팁을 숨기고 방향까지 지워, 다음 배치가 반대편으로 튄다.
    vi.useFakeTimers();
    const chart = Object.assign(Object.create(Tooltip), {
      options: { tooltip: { debouncedHide: true, formatter: { html: () => '' } } },
    });
    chart.createTooltipDOM();

    const child = document.createElement('div');
    Object.defineProperty(child, 'offsetHeight', { value: 120, configurable: true });
    chart.tooltipDOM.appendChild(child);
    chart.tooltipDOM.getBoundingClientRect = () => ({ width: TIP_W, height: 120 });

    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);

    chart.hideTooltipDOM();
    chart.setCustomTooltipLayoutPosition({}, { pageX: 1100, pageY: 100 });
    vi.advanceTimersByTime(500);

    expect(chart.tooltipDOM.style.display).toBe('block');
    expect(getPlacement(chart.tooltipDOM).flipped).toBe(true);

    chart.tooltipDOM.remove();
    vi.useRealTimers();
  });
});

describe('측정 시점에는 폭 상한이 걸려 있지 않다', () => {
  beforeEach(() => {
    setViewport(VIEW_W, VIEW_H);
    setScroll(0, 0);
  });
  afterEach(() => setViewport(0, 0));

  /** 크기를 읽는 순간의 max-width 를 기록하는 tooltipDOM. */
  const createRecordingChart = () => {
    const seen = [];
    const tooltipDOM = document.createElement('div');
    const record = (value) => {
      seen.push(tooltipDOM.style.maxWidth);
      return value;
    };
    const child = document.createElement('div');
    Object.defineProperty(child, 'offsetWidth', { get: () => record(TIP_W), configurable: true });
    Object.defineProperty(child, 'offsetHeight', { get: () => record(120), configurable: true });
    tooltipDOM.appendChild(child);
    Object.defineProperty(tooltipDOM, 'offsetHeight', { get: () => record(120), configurable: true });
    tooltipDOM.getBoundingClientRect = () => ({ width: record(TIP_W), height: 120 });

    const chart = Object.assign(Object.create(Tooltip), {
      tooltipDOM,
      tooltipBodyDOM: document.createElement('div'),
      tooltipHeaderDOM: document.createElement('div'),
      tooltipCanvas: document.createElement('canvas'),
      tooltipCtx: {
        save: () => {},
        restore: () => {},
        measureText: (text) => ({ width: String(text).length * 7 }),
      },
      pixelRatio: 1,
      axesX: [{}],
      axesY: [{}],
      options: {
        horizontal: false,
        tooltip: { showHeader: false, maxWidth: 400, maxHeight: 200, useScrollbar: false },
      },
    });

    return { chart, seen };
  };

  const hitInfo = {
    hitId: 's0',
    maxTip: ['series-0', '123'],
    items: { s0: { data: { x: 0, y: 1 }, axis: { x: 0, y: 0 }, name: 'series-0' } },
  };

  it('캔버스 툴팁 — 직전 상한이 측정을 누르지 않는다', () => {
    const { chart, seen } = createRecordingChart();
    chart.tooltipDOM.style.maxWidth = '120px';
    chart.setTooltipLayoutPosition(hitInfo, { pageX: 400, pageY: 100 });

    expect(seen.length).toBeGreaterThan(0);
    expect(seen).not.toContain('120px');
  });

  it('커스텀 툴팁 — 직전 상한이 측정을 누르지 않는다', () => {
    const { chart, seen } = createRecordingChart();
    chart.tooltipDOM.style.maxWidth = '120px';
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 100 });

    expect(seen.length).toBeGreaterThan(0);
    expect(seen).not.toContain('120px');
  });

  it('커스텀 툴팁 내용을 만들기 전에 상한이 해제된다', () => {
    // 가상 스크롤은 formatter 결과를 붙인 뒤 행 높이를 실측하므로, 그 전에 풀려 있어야 한다.
    const { chart } = createRecordingChart();
    chart.tooltipDOM.style.maxWidth = '120px';
    let atFormatterCall = null;
    chart.options.tooltip.formatter = {
      html: () => {
        atFormatterCall = chart.tooltipDOM.style.maxWidth;
        return '<div class="custom"></div>';
      },
    };

    chart.drawCustomTooltip({ s0: { data: {}, name: 's0' } });

    expect(atFormatterCall).toBe('');
  });
});

describe('세로 배치', () => {
  beforeEach(() => {
    setViewport(VIEW_W, VIEW_H);
    setScroll(0, 0);
    Object.defineProperty(document.body, 'clientWidth', { value: VIEW_W, configurable: true });
  });
  afterEach(() => {
    setViewport(0, 0);
    setScroll(0, 0);
  });

  it('아래에 들어가면 커서 아래에 둔다', () => {
    const chart = createChart({ width: TIP_W, height: 120 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).y).toBe(120);
  });

  it('아래 공간이 모자라면 위로 반전한다', () => {
    const chart = createChart({ width: TIP_W, height: 120 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 750 });

    expect(getTranslate(chart.tooltipDOM).y).toBe(750 - 120 - 20);
  });

  it('반전해도 위 공간이 모자라면 가시 영역 상단 밖으로 나가지 않는다', () => {
    const chart = createChart({ width: TIP_W, height: 700 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 700 });

    expect(getTranslate(chart.tooltipDOM).y).toBe(0);
  });

  it('세로로 스크롤된 문서에서는 하한도 스크롤된 가시 영역 상단이다', () => {
    setScroll(0, 500);
    const chart = createChart({ width: TIP_W, height: 700 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 1200 });

    expect(getTranslate(chart.tooltipDOM).y).toBe(500);
  });

  it('툴팁이 가시 영역보다 높으면 남은 공간이 넓은 쪽에 둔다', () => {
    // 위(80px)보다 아래(680px)가 넓으므로, 위로 반전해 커서를 덮지 않고 아래에 그대로 둔다.
    const chart = createChart({ width: TIP_W, height: 900 });
    chart.setCustomTooltipLayoutPosition({}, { pageX: 400, pageY: 100 });

    expect(getTranslate(chart.tooltipDOM).y).toBe(120);
  });
});
