import { describe, it, expect } from 'vitest';
import modules from './plugins.scrollbar';

/**
 * plugins.scrollbar의 메서드들은 차트 인스턴스의 this 에 바인딩되어 동작하므로,
 * 필요한 속성과 의존 메서드를 가진 가짜 컨텍스트를 만들어 직접 호출한다.
 * (modules 를 프로토타입으로 두어 this.getScrollbarLimits 등 상호 호출도 동작하게 한다)
 */
const createChart = (overrides = {}) =>
  Object.assign(Object.create(modules), {
    options: { type: 'lineChart' },
    data: { labels: [] },
    minMax: { x: [{ min: null, max: null }], y: [{ min: null, max: null }] },
    scrollbar: { x: {}, y: {} },
    axesX: [{ range: null }],
    axesY: [{ range: null }],
    ...overrides,
  });

describe('getScrollbarLimits', () => {
  it('step 축은 labels 길이 기준 한계를 반환한다', () => {
    const chart = createChart({
      data: { labels: ['a', 'b', 'c', 'd'] },
      scrollbar: { x: { type: 'step' } },
    });
    expect(chart.getScrollbarLimits('x')).toEqual({ limitMin: 0, limitMax: 3 });
  });

  it('step 축에 labels 가 없으면 null 을 반환한다', () => {
    const chart = createChart({
      data: { labels: [] },
      scrollbar: { x: { type: 'step' } },
    });
    expect(chart.getScrollbarLimits('x')).toBeNull();
  });

  it('heatMap step 축은 data.labels[dir] 를 사용한다', () => {
    const chart = createChart({
      options: { type: 'heatMap' },
      data: { labels: { x: ['a', 'b', 'c'], y: ['p', 'q'] } },
      scrollbar: { x: { type: 'step' }, y: { type: 'step' } },
    });
    expect(chart.getScrollbarLimits('x')).toEqual({ limitMin: 0, limitMax: 2 });
    expect(chart.getScrollbarLimits('y')).toEqual({ limitMin: 0, limitMax: 1 });
  });

  it('비-step 축은 minMax 의 min/max 를 한계로 반환한다', () => {
    const chart = createChart({
      minMax: { x: [{ min: 10, max: 90 }] },
      scrollbar: { x: { type: 'time' } },
    });
    expect(chart.getScrollbarLimits('x')).toEqual({ limitMin: 10, limitMax: 90 });
  });

  // 회귀: minMax 가 아직 확정되지 않았을 때(+null === 0) [0,0] 으로 강제되는 것을 막는다.
  it('비-step 축에서 minMax.min/max 가 null 이면 null 을 반환한다 (heatMap 첫 로드 회귀)', () => {
    const chart = createChart({
      minMax: { x: [{ min: null, max: null }] },
      scrollbar: { x: { type: 'time' } },
    });
    expect(chart.getScrollbarLimits('x')).toBeNull();
  });

  it('비-step 축에서 minMax 값이 유한수가 아니면 null 을 반환한다', () => {
    const chart = createChart({
      minMax: { x: [{ min: 'foo', max: 'bar' }] },
      scrollbar: { x: { type: 'time' } },
    });
    expect(chart.getScrollbarLimits('x')).toBeNull();
  });
});

describe('initScrollbarRange', () => {
  const baseTimeChart = (range, minMax = { min: 0, max: 100 }) =>
    createChart({
      data: { labels: ['a', 'b'] },
      minMax: { x: [minMax] },
      scrollbar: { x: { type: 'time', range } },
    });

  it('한계 안의 윈도우는 그대로 둔다', () => {
    const chart = baseTimeChart([20, 50]);
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([20, 50]);
  });

  it('originalWidth 가 availableWidth 이상이면 [limitMin, limitMax] 로 맞춘다', () => {
    const chart = baseTimeChart([-10, 200]);
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([0, 100]);
  });

  it('왼쪽으로 벗어난 윈도우는 폭을 유지한 채 시작에 정렬한다', () => {
    const chart = baseTimeChart([-30, 0]); // width 30, 한계 밖(왼쪽)
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([0, 30]);
  });

  it('오른쪽으로 벗어난 윈도우는 폭을 유지한 채 끝에 정렬한다', () => {
    const chart = baseTimeChart([90, 130]); // width 40, max 초과
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([60, 100]);
  });

  // 회귀: 라이브 데이터로 윈도우가 한계 밖으로 완전히 밀렸을 때 range 가 역전되면 안 된다.
  it('윈도우가 한계보다 완전히 아래에 있어도 range 가 역전되지 않는다', () => {
    const chart = baseTimeChart([10, 40], { min: 200, max: 500 });
    chart.initScrollbarRange('x');
    const [lo, hi] = chart.scrollbar.x.range;
    expect(lo).toBeLessThanOrEqual(hi);
    expect(lo).toBeGreaterThanOrEqual(200);
    expect(hi).toBeLessThanOrEqual(500);
  });

  it('윈도우가 한계보다 완전히 위에 있어도 range 가 역전되지 않는다', () => {
    const chart = baseTimeChart([800, 830], { min: 200, max: 500 });
    chart.initScrollbarRange('x');
    const [lo, hi] = chart.scrollbar.x.range;
    expect(lo).toBeLessThanOrEqual(hi);
    expect(lo).toBeGreaterThanOrEqual(200);
    expect(hi).toBeLessThanOrEqual(500);
  });

  // 회귀: 한계 미확정(stale minMax)일 때 range 를 [0,0] 등으로 오염시키지 않는다.
  it('한계를 알 수 없으면(minMax null) range 를 건드리지 않는다', () => {
    const chart = createChart({
      data: { labels: ['a', 'b'] },
      minMax: { x: [{ min: null, max: null }] },
      scrollbar: { x: { type: 'time', range: [1000, 4000] } },
    });
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([1000, 4000]);
  });
});

describe('updateScrollbarAnchorEdge', () => {
  const anchorChart = (range, minMax = { min: 0, max: 100 }) =>
    createChart({
      minMax: { x: [minMax] },
      scrollbar: { x: { type: 'time', range, anchorEdge: undefined } },
    });

  it('range 가 시작 한계에 닿으면 start', () => {
    const chart = anchorChart([0, 40]);
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBe('start');
  });

  it('range 가 끝 한계에 닿으면 end', () => {
    const chart = anchorChart([60, 100]);
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBe('end');
  });

  it('range 가 중앙이면 null', () => {
    const chart = anchorChart([30, 70]);
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBeNull();
  });

  it('한계를 알 수 없으면 null', () => {
    const chart = anchorChart([30, 70], { min: null, max: null });
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBeNull();
  });
});

describe('updateScrollbarInfo - 리뷰 #2: anchorEdge 오탐 방지', () => {
  // 이미 init 된 time 축 스크롤바. 윈도우 [0,30] 은 시작 한계(0)에 닿아 있어,
  // updateScrollbarAnchorEdge 가 호출되면 anchorEdge 가 'start' 로 계산되는 상황.
  const createInitedChart = (axisRangeOpt) => {
    const scrollbarX = {
      isInit: true,
      use: true,
      type: 'time',
      range: [0, 30],
      anchorEdge: null,
      resetPosition: false,
    };
    return createChart({
      options: {
        type: 'heatMap',
        axesX: [{ type: 'time', range: axisRangeOpt, scrollbar: { use: true } }],
        axesY: [{}],
      },
      data: { labels: { x: ['a', 'b'], y: ['p'] } },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: scrollbarX, y: {} },
      // axisOpt(현재 그려진 축)의 range 는 [0,30]
      axesX: [{ range: [0, 30] }],
      axesY: [{ range: null }],
    });
  };

  it('데이터만 업데이트되면(range 옵션 동일) anchorEdge 를 재계산하지 않고 보존한다', () => {
    // range 옵션이 현재 축과 동일 -> isUpdateAxesRange=false, updateData=true
    const chart = createInitedChart([0, 30]);
    chart.updateScrollbarInfo('x', true);
    // 윈도우가 시작에 닿아 있어도, 데이터 업데이트 경로에서는 anchorEdge 를 새로 만들지 않는다
    expect(chart.scrollbar.x.anchorEdge).toBeNull();
  });

  it('range 옵션이 바뀌면(리사이즈/범위지정) anchorEdge 를 재계산한다', () => {
    // range 옵션이 현재 축과 달라짐 -> isUpdateAxesRange=true
    const chart = createInitedChart([10, 40]);
    chart.updateScrollbarInfo('x', false);
    expect(chart.scrollbar.x.anchorEdge).toBe('start');
  });

  it('의도적으로 끝에 붙여둔(anchorEdge=end) 윈도우는 데이터 업데이트에도 보존된다', () => {
    // 사용자가 끝으로 스크롤한 상태(anchorEdge=end)에서 데이터만 업데이트되면
    // anchorEdge 가 유지되어 다음 리사이즈 때 끝 붙임이 살아있어야 한다.
    const scrollbarX = {
      isInit: true,
      use: true,
      type: 'time',
      range: [70, 100],
      anchorEdge: 'end',
      resetPosition: false,
    };
    const chart = createChart({
      options: {
        type: 'heatMap',
        axesX: [{ type: 'time', range: [70, 100], scrollbar: { use: true } }],
        axesY: [{}],
      },
      data: { labels: { x: ['a', 'b'], y: ['p'] } },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: scrollbarX, y: {} },
      axesX: [{ range: [70, 100] }], // 동일 -> isUpdateAxesRange=false
      axesY: [{ range: null }],
    });
    chart.updateScrollbarInfo('x', true);
    expect(chart.scrollbar.x.anchorEdge).toBe('end');
  });
});

describe('updateScrollbarInfo - 리사이즈 시 anchorEdge 기준 위치 보존', () => {
  // range 옵션이 바뀌는(=isUpdateAxesRange) 리사이즈/범위지정 상황에서, 기존 anchorEdge 에
  // 따라 새 윈도우(newSize)를 시작/끝에 붙이거나 현재 시작점을 유지하는 핵심 동작.
  const createResizeChart = ({ anchorEdge, currentRange, newOptRange, resetPosition = false }) =>
    createChart({
      options: {
        type: 'heatMap',
        axesX: [{ type: 'time', range: newOptRange, scrollbar: { use: true, resetPosition } }],
        axesY: [{}],
      },
      data: { labels: { x: ['a', 'b'], y: ['p'] } },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: {
        x: { isInit: true, use: true, type: 'time', range: currentRange, anchorEdge },
        y: {},
      },
      axesX: [{ range: [60, 90] }], // 현재 그려진 축과 newOptRange 가 달라 isUpdateAxesRange=true
      axesY: [{ range: null }],
    });

  it('anchorEdge=end 면 새 윈도우를 끝(limitMax)에 붙인다', () => {
    const chart = createResizeChart({ anchorEdge: 'end', currentRange: [60, 90], newOptRange: [0, 40] });
    chart.updateScrollbarInfo('x', false);
    expect(chart.scrollbar.x.range).toEqual([60, 100]); // [limitMax-newSize, limitMax]
    expect(chart.scrollbar.x.anchorEdge).toBe('end');
  });

  it('anchorEdge=start 면 새 윈도우를 시작(limitMin)에 붙인다', () => {
    const chart = createResizeChart({ anchorEdge: 'start', currentRange: [60, 90], newOptRange: [0, 40] });
    chart.updateScrollbarInfo('x', false);
    expect(chart.scrollbar.x.range).toEqual([0, 40]); // [limitMin, limitMin+newSize]
    expect(chart.scrollbar.x.anchorEdge).toBe('start');
  });

  it('anchorEdge=null 이면 현재 시작점을 유지한다', () => {
    const chart = createResizeChart({ anchorEdge: null, currentRange: [20, 50], newOptRange: [0, 40] });
    chart.updateScrollbarInfo('x', false);
    expect(chart.scrollbar.x.range).toEqual([20, 60]); // [currentRange[0], currentRange[0]+newSize]
    expect(chart.scrollbar.x.anchorEdge).toBeNull();
  });

  it('resetPosition 이면 anchorEdge 와 무관하게 옵션 range 로 리셋한다', () => {
    const chart = createResizeChart({
      anchorEdge: 'end',
      currentRange: [60, 90],
      newOptRange: [10, 50],
      resetPosition: true,
    });
    chart.updateScrollbarInfo('x', false);
    expect(chart.scrollbar.x.range).toEqual([10, 50]);
  });
});

describe('initScrollbarInfo - 리뷰 #3: resetPosition 재진입 시 anchor 재계산', () => {
  it('isInit 상태에서 resetPosition 으로 range 를 리셋하면 anchorEdge 도 재계산된다', () => {
    const chart = createChart({
      options: { type: 'heatMap' },
      data: { labels: { x: ['a', 'b'], y: ['p'] } },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: { isInit: true, type: 'time', range: [60, 90], anchorEdge: 'end' }, y: {} },
    });
    chart.initScrollbarInfo(
      [{ type: 'time', range: [0, 40], scrollbar: { use: true, resetPosition: true } }],
      'x',
    );
    expect(chart.scrollbar.x.range).toEqual([0, 40]);
    // 시작 한계에 닿은 새 range 에 맞춰 stale 'end' 가 'start' 로 갱신되어야 한다.
    expect(chart.scrollbar.x.anchorEdge).toBe('start');
  });
});

describe('initScrollbarRange - step 축 / 가드', () => {
  const stepChart = (range, labelLen = 10) =>
    createChart({
      data: { labels: Array.from({ length: labelLen }, (_, i) => `L${i}`) },
      scrollbar: { x: { type: 'step', range } },
    });

  it('step 축: 한계 안의 인덱스 윈도우는 그대로', () => {
    const chart = stepChart([3, 7]);
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([3, 7]);
  });

  it('step 축: 끝 인덱스를 넘으면 폭 유지하며 끝에 정렬', () => {
    const chart = stepChart([6, 14]); // width 8, max index 9 초과
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([1, 9]);
  });

  it('range 가 없으면 아무것도 하지 않는다', () => {
    const chart = createChart({
      data: { labels: ['a', 'b'] },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: { type: 'time', range: null } },
    });
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toBeNull();
  });

  it('range 에 숫자가 아닌 값이 있으면 건드리지 않는다', () => {
    const chart = createChart({
      data: { labels: ['a', 'b'] },
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: { type: 'time', range: [null, 50] } },
    });
    chart.initScrollbarRange('x');
    expect(chart.scrollbar.x.range).toEqual([null, 50]);
  });
});

describe('updateScrollbarAnchorEdge - 스펙/가드', () => {
  // 리뷰 #1(양쪽 모두 닿을 때 기존 anchor 보존)은 스펙으로 롤백됨.
  // 양쪽 모두 닿으면 우선순위상 'start' 로 판정되는 것이 현재 스펙임을 고정한다.
  it('range 가 양쪽 한계 모두에 닿으면 우선순위에 따라 start 로 판정한다 (스펙)', () => {
    const chart = createChart({
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: { type: 'time', range: [0, 100], anchorEdge: 'end' } },
    });
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBe('start');
  });

  it('range 가 2개 원소가 아니면 anchorEdge 를 null 로 둔다', () => {
    const chart = createChart({
      minMax: { x: [{ min: 0, max: 100 }] },
      scrollbar: { x: { type: 'time', range: [5], anchorEdge: 'end' } },
    });
    chart.updateScrollbarAnchorEdge('x');
    expect(chart.scrollbar.x.anchorEdge).toBeNull();
  });
});
