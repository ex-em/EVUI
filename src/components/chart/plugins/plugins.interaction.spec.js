import { describe, it, expect, vi } from 'vitest';
import modules from './plugins.interaction';

/**
 * findHitItem 테스트를 위한 가짜 차트 컨텍스트.
 * plugins.interaction의 메서드들은 차트 인스턴스의 this에 바인딩되어 사용되므로,
 * 필요한 속성과 최소한의 의존 메서드를 주입한 컨텍스트를 만들어 직접 호출한다.
 */
const createChart = (seriesList, opts = {}) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false, ...opts },
    tooltipCtx: null,
    getFormattedTooltipLabel: ({ seriesName }) => seriesName,
    getFormattedTooltipValue: ({ value }) => String(value),
    findClosestDataIndex: () => 0,
    isNotUseIndicator: () => false,
  });

const createChartForClosestIndex = (seriesList, opts = {}) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false, ...opts },
  });

const createOverlayCtx = () => ({
  beginPath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
});

const createIndicatorChart = (horizontal = false) => {
  const chartRect = { x1: 0, x2: 300, y1: 0, y2: 200 };
  const labelOffset = { left: 20, right: 20, top: 15, bottom: 20 };
  const graphPos = {
    x1: chartRect.x1 + labelOffset.left,
    x2: chartRect.x2 - labelOffset.right,
    y1: chartRect.y1 + labelOffset.top,
    y2: chartRect.y2 - labelOffset.bottom,
  };

  return {
    graphPos,
    chart: Object.assign(Object.create(modules), {
      chartRect,
      labelOffset,
      options: { horizontal },
      overlayCtx: createOverlayCtx(),
    }),
  };
};

/**
 * findGraphData가 고정된 item을 리턴하는 mock 시리즈.
 */
const mockSeries = ({
  show = true,
  data,
  hit = false,
  directHit = false,
  interpolation = 'linear',
  isExistGrp = false,
}) => ({
  show,
  id: 'mock-id',
  name: 'mock-name',
  xAxisIndex: 0,
  yAxisIndex: 0,
  interpolation,
  isExistGrp,
  findGraphData: () => ({
    data,
    hit,
    directHit,
    index: data?.index ?? 0,
  }),
});

const createClosestSeries = ({
  data,
  show = true,
  interpolation = 'none',
  passingValue = null,
  hasPassingValueInData = false,
}) => ({
  show,
  data,
  interpolation,
  passingValue,
  hasPassingValueInData,
});

describe('plugins.interaction drawIndicatorForTooltip', () => {
  it('수직 차트 indicator X 위치를 graph 영역 안으로 제한한다', () => {
    const { chart, graphPos } = createIndicatorChart();
    const hitInfo = {
      items: {
        series1: {
          data: { x: 'A', xp: graphPos.x2 + 50, w: 20 },
        },
      },
    };
    const rawXPosition = hitInfo.items.series1.data.xp + hitInfo.items.series1.data.w / 2;

    const result = chart.drawIndicatorForTooltip(hitInfo, '#000');
    const drawnX = chart.overlayCtx.moveTo.mock.calls[0][0];
    const drawnLineX = chart.overlayCtx.lineTo.mock.calls[0][0];

    expect(result.position[0]).toBe(graphPos.x2);
    expect(drawnX - 0.5).toBeLessThanOrEqual(graphPos.x2);
    expect(drawnX).toBe(graphPos.x2 + 0.5);
    expect(drawnLineX).toBe(graphPos.x2 + 0.5);
    expect(drawnX).not.toBe(rawXPosition + 0.5);
  });

  it('수평 차트 indicator Y 위치를 graph 영역 안으로 제한한다', () => {
    const { chart, graphPos } = createIndicatorChart(true);
    const hitInfo = {
      items: {
        series1: {
          data: { y: 'A', yp: graphPos.y2 + 50, h: 20 },
        },
      },
    };
    const rawYPosition = hitInfo.items.series1.data.yp + hitInfo.items.series1.data.h / 2;

    const result = chart.drawIndicatorForTooltip(hitInfo, '#000');
    const drawnY = chart.overlayCtx.moveTo.mock.calls[0][1];
    const drawnLineY = chart.overlayCtx.lineTo.mock.calls[0][1];

    expect(result.position[1]).toBe(graphPos.y2);
    expect(drawnY - 0.5).toBeLessThanOrEqual(graphPos.y2);
    expect(drawnY).toBe(graphPos.y2 + 0.5);
    expect(drawnLineY).toBe(graphPos.y2 + 0.5);
    expect(drawnY).not.toBe(rawYPosition + 0.5);
  });
});

describe('plugins.interaction findHitItem', () => {
  describe('directHit 우선순위', () => {
    it('bar directHit는 더 가까운 line 포인트보다 우선 선택된다', () => {
      // bar: directHit=true, 좌표는 클릭 지점에서 멀리 있음 (박스 꼭짓점 기준)
      // line: hit=true (directHit 아님), 좌표는 클릭 지점에 매우 가까움 (포인트)
      // 기존엔 거리만 봐서 line이 이겼으나, directHit 도입 후 bar가 이겨야 한다.
      const chart = createChart({
        bar1: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 90, o: 10 },
          hit: true,
          directHit: true,
        }),
        line1: mockSeries({
          data: { x: 0, y: 100, xp: 51, yp: 101, o: 100 },
          hit: true,
          directHit: false,
        }),
      });

      const result = chart.findHitItem([50, 100]);
      expect(result.hitId).toBe('bar1');
    });

    it('여러 bar에 directHit가 겹치면 클릭 좌표에 가장 가까운 bar가 선택된다', () => {
      const chart = createChart({
        far: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 20, o: 10 },
          hit: true,
          directHit: true,
        }),
        near: mockSeries({
          data: { x: 0, y: 20, xp: 48, yp: 52, o: 20 },
          hit: true,
          directHit: true,
        }),
      });

      const result = chart.findHitItem([50, 50]);
      expect(result.hitId).toBe('near');
    });

    it('같은 좌표에서 line 포인트 directHit는 bar 박스 directHit를 거리로 이긴다', () => {
      // combo 차트에서 line 포인트가 bar 박스 내부에 있어 둘 다 directHit인 경우.
      // line 포인트 중심이 클릭 좌표에 더 가까우므로 line이 선택되어야 한다.
      const chart = createChart({
        bar: mockSeries({
          data: { x: 0, y: 10, xp: 30, yp: 20, o: 10 },
          hit: true,
          directHit: true,
        }),
        line: mockSeries({
          data: { x: 0, y: 50, xp: 50, yp: 50, o: 50 },
          hit: true,
          directHit: true,
        }),
      });

      const result = chart.findHitItem([50, 50]);
      expect(result.hitId).toBe('line');
    });
  });

  describe('일반 line 차트 회귀 방지', () => {
    it('directHit가 없으면 거리 기반으로 가장 가까운 hit 시리즈가 선택된다', () => {
      const chart = createChart({
        far: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 10, o: 10 },
          hit: true,
        }),
        near: mockSeries({
          data: { x: 0, y: 20, xp: 49, yp: 51, o: 20 },
          hit: true,
        }),
      });

      const result = chart.findHitItem([50, 50]);
      expect(result.hitId).toBe('near');
    });
  });

  describe('hit 없을 때 fallback', () => {
    it('모든 시리즈가 hit=false면 거리가 가장 가까운 시리즈로 fallback 한다', () => {
      // 클릭 (1000, 1000) 에 s1 이 훨씬 가까운 좌표.
      const chart = createChart({
        s1: mockSeries({
          data: { x: 0, y: 10, xp: 990, yp: 990, o: 10 },
          hit: false,
        }),
        s2: mockSeries({
          data: { x: 0, y: 20, xp: 30, yp: 40, o: 20 },
          hit: false,
        }),
      });

      const result = chart.findHitItem([1000, 1000]);
      expect(result.hitId).toBe('s1');
    });
  });

  describe('items 수집', () => {
    it('hit 여부와 무관하게 유효한 data를 가진 모든 시리즈가 items에 포함된다 (tooltip용)', () => {
      const chart = createChart({
        bar1: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 20, o: 10 },
          hit: true,
          directHit: true,
        }),
        line1: mockSeries({
          data: { x: 0, y: 100, xp: 30, yp: 40, o: 100 },
          hit: true,
          directHit: false,
        }),
      });

      const result = chart.findHitItem([10, 20]);
      expect(Object.keys(result.items).sort()).toEqual(['bar1', 'line1']);
      expect(result.hitId).toBe('bar1');
    });
  });

  describe('Fill(with null) 8라벨 × 2시리즈 — onDblClick(findHitItem) 회귀', () => {
    // mock 은 element.line null 가드 적용 후의 결과(null 포인트 → hit=false) 모방.

    it('01/03 (series1 만 null) → hitId=series2, items 에 series2 만', () => {
      const series1 = mockSeries({
        interpolation: 'none',
        data: { x: '01/03', y: null, o: null, xp: 40, yp: null, index: 2 },
        hit: false,
        directHit: false,
      });
      const series2 = mockSeries({
        interpolation: 'none',
        data: { x: '01/03', y: 40, o: 40, xp: 40, yp: 120, index: 2 },
        hit: false,
        directHit: false,
      });

      const chart = createChart({ series1, series2 });
      chart.findClosestDataIndex = () => 2;

      const result = chart.findHitItem([40, 10], true);

      expect(result.hitId).toBe('series2');
      expect(Object.keys(result.items)).toEqual(['series2']);
    });

    it('01/04 (둘 다 null) → hitId="", items[""] synthetic (label/dataIndex 보존)', () => {
      const series1 = mockSeries({
        interpolation: 'none',
        data: { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
        hit: false,
      });
      const series2 = mockSeries({
        interpolation: 'none',
        data: { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
        hit: false,
      });

      // synthetic items[''] 는 series.data?.[targetDataIndex] 의 x/y 를 참조하므로
      // mock 시리즈에 series.data 배열을 명시 주입.
      series1.data = [
        { x: '01/01', y: 20, o: 20 },
        { x: '01/02', y: 45, o: 45 },
        { x: '01/03', y: null, o: null },
        { x: '01/04', y: null, o: null },
      ];

      const chart = createChart({ series1, series2 });
      chart.findClosestDataIndex = () => 3;

      const result = chart.findHitItem([60, 10], true);

      expect(result.hitId).toBe('');
      expect(result.items[''].label).toBe('01/04');
      expect(result.items[''].index).toBe(3);
    });

    it('01/07 (series1 만 null) → hitId=series2', () => {
      const series1 = mockSeries({
        interpolation: 'none',
        data: { x: '01/07', y: null, o: null, xp: 120, yp: null, index: 6 },
        hit: false,
      });
      const series2 = mockSeries({
        interpolation: 'none',
        data: { x: '01/07', y: 65, o: 65, xp: 120, yp: 70, index: 6 },
        hit: false,
      });

      const chart = createChart({ series1, series2 });
      chart.findClosestDataIndex = () => 6;

      const result = chart.findHitItem([120, 10], true);

      expect(result.hitId).toBe('series2');
      expect(Object.keys(result.items)).toEqual(['series2']);
    });

    it('01/01 (둘 다 값) → 거리 가까운 시리즈가 hitId', () => {
      // 클릭 (0, 85). series1.yp=160(거리 75), series2.yp=90(거리 5) → series2.
      const series1 = mockSeries({
        interpolation: 'none',
        data: { x: '01/01', y: 20, o: 20, xp: 0, yp: 160, index: 0 },
        hit: false,
      });
      const series2 = mockSeries({
        interpolation: 'none',
        data: { x: '01/01', y: 55, o: 55, xp: 0, yp: 90, index: 0 },
        hit: false,
      });

      const chart = createChart({ series1, series2 });
      chart.findClosestDataIndex = () => 0;

      const result = chart.findHitItem([0, 85], true);

      expect(result.hitId).toBe('series2');
    });
  });
});

describe('plugins.interaction findClosestDataIndex', () => {
  it('avgInterval < 6 이고 closestDistance < 6 이면 closestIndex를 반환한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({
        data: [
          { xp: 10, yp: 100, o: 1 },
          { xp: 14, yp: 100, o: 2 },
          { xp: 18, yp: 100, o: 3 },
        ],
      }),
    });

    const result = chart.findClosestDataIndex([16, 0], ['s1']);
    expect(result).toBe(1);
  });

  it('avgInterval > 6 이고 closestDistance < avgInterval 이면 closestIndex를 반환한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({
        data: [
          { xp: 10, yp: 100, o: 1 },
          { xp: 30, yp: 100, o: 2 },
          { xp: 50, yp: 100, o: 3 },
        ],
      }),
    });

    const result = chart.findClosestDataIndex([37, 0], ['s1']);
    expect(result).toBe(1);
  });

  it('closestDistance가 snapThreshold보다 크고 선형보간이 꺼져 있으면 -1을 반환한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({
        interpolation: 'none',
        data: [
          { xp: 10, yp: 100, o: 1 },
          { xp: 20, yp: 100, o: 2 },
        ],
      }),
    });

    const result = chart.findClosestDataIndex([100, 0], ['s1']);
    expect(result).toBe(-1);
  });

  it('모든 데이터가 null이고 disableNullLabelSnap=false면 -1을 반환한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({
        data: [
          { xp: 10, yp: null, o: null },
          { xp: 20, yp: null, o: null },
        ],
      }),
      s2: createClosestSeries({
        data: [
          { xp: 10, yp: null, o: null },
          { xp: 20, yp: null, o: null },
        ],
      }),
    });

    const result = chart.findClosestDataIndex([12, 0], ['s1', 's2'], false);
    expect(result).toBe(-1);
  });
});
