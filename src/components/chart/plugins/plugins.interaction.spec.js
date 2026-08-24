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

describe('plugins.interaction buildLabelValidMask', () => {
  it('가시 시리즈 중 유효(non-null) o 값을 가진 라벨만 1로 표시한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ data: [{ o: 1 }, { o: null }, { o: 3 }] }),
      s2: createClosestSeries({ data: [{ o: null }, { o: 2 }, { o: null }] }),
    });

    // 라벨0: s1, 라벨1: s2, 라벨2: s1 이 각각 유효 → 모두 1
    expect(Array.from(chart.buildLabelValidMask())).toEqual([1, 1, 1]);
  });

  it('모든 가시 시리즈가 null/undefined 인 라벨은 0이다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ data: [{ o: 1 }, { o: null }, { o: undefined }] }),
      s2: createClosestSeries({ data: [{ o: 5 }, { o: null }, { o: null }] }),
    });

    expect(Array.from(chart.buildLabelValidMask())).toEqual([1, 0, 0]);
  });

  it('show=false 시리즈의 값은 mask 에 반영되지 않는다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ show: false, data: [{ o: 1 }, { o: 2 }] }),
      s2: createClosestSeries({ data: [{ o: null }, { o: 9 }] }),
    });

    // 라벨0: 값을 가진 건 show=false 인 s1 뿐 → 0, 라벨1: 가시 s2 가 유효 → 1
    expect(Array.from(chart.buildLabelValidMask())).toEqual([0, 1]);
  });

  it('mask 길이는 가시 시리즈의 최대 데이터 길이를 따른다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ data: [{ o: 1 }] }),
      s2: createClosestSeries({ data: [{ o: 1 }, { o: 2 }, { o: 3 }] }),
    });

    expect(chart.buildLabelValidMask().length).toBe(3);
  });

  it('결과를 this.labelValidMask 에 캐시하고 동일 Uint8Array 참조를 반환한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ data: [{ o: 1 }] }),
    });

    const mask = chart.buildLabelValidMask();
    expect(mask).toBeInstanceOf(Uint8Array);
    expect(chart.labelValidMask).toBe(mask);
  });

  it('sIds 미지정 시 전체 시리즈를 대상으로 한다', () => {
    const chart = createChartForClosestIndex({
      s1: createClosestSeries({ data: [{ o: null }] }),
      s2: createClosestSeries({ data: [{ o: 7 }] }),
    });

    expect(Array.from(chart.buildLabelValidMask())).toEqual([1]);
  });
});

/**
 * displayFromStartArea(전용 드래그 캔버스) 회귀 테스트.
 * drawSelectionArea 시그니처 변경(구조분해 → dragInfo 객체)과,
 * 전용 캔버스에 raw rect를 그릴 때의 좌표 오프셋 가산(xsp + offsetX) 로직을 격리 검증한다.
 */
const makeCtx = () => ({
  fillStyle: '',
  globalAlpha: 1,
  fillRect: vi.fn(),
  clearRect: vi.fn(),
});

const createDrawChart = (overrides = {}) =>
  Object.assign(Object.create(modules), {
    options: { dragSelection: { fillColor: '#ff0000', opacity: 0.3 } },
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    overlayCtx: makeCtx(),
    pixelRatio: 1,
    ...overrides,
  });

describe('plugins.interaction drawSelectionArea 시그니처 호환 (overlay 경로)', () => {
  it('단일 dragInfo 객체를 받아 overlayCtx에 clamped rect를 그린다', () => {
    // 전용 캔버스가 없으면(기존 동작) overlayCtx에 오프셋 없이 그대로 그린다.
    const chart = createDrawChart();
    // labelOffset 0 + chartRect 0..100 → newRange === range 이므로 재스케일 없이 그대로.
    const range = { x1: 0, x2: 100, y1: 0, y2: 100 };

    chart.drawSelectionArea({ xsp: 10, ysp: 20, width: 30, height: 40, range });

    expect(chart.overlayCtx.fillRect).toHaveBeenCalledTimes(1);
    expect(chart.overlayCtx.fillRect).toHaveBeenCalledWith(10, 20, 30, 40);
    expect(chart.overlayCtx.fillStyle).toBe('#ff0000');
    expect(chart.overlayCtx.globalAlpha).toBe(1); // 그린 뒤 1로 복원
  });
});

describe('plugins.interaction drawSelectionArea displayFromStartArea 좌표 오프셋', () => {
  it('raw displayRect를 전용 캔버스에 (raw + offset) 위치로 그린다 (리사이즈 없음)', () => {
    // startArea가 캔버스 위/왼쪽이라 raw 좌표가 음수여도 offset 가산 후 캔버스 내부 양수로 매핑된다.
    const range = { x1: 0, x2: 100, y1: 0, y2: 100 };
    const chart = createDrawChart({
      dragDisplayCanvas: { width: 200, height: 150 },
      dragDisplayCtx: makeCtx(),
      dragDisplayOffset: { x: 20, y: 10 },
    });

    chart.drawSelectionArea({
      // 선택/range 계산용 clamped rect (캔버스 안)
      xsp: 0,
      ysp: 0,
      width: 60,
      height: 50,
      range,
      // 그리기용 raw rect (startArea까지 뻗어 음수 시작)
      displayRect: { xsp: -20, ysp: -10, width: 80, height: 60, range },
    });

    // raw.xsp + offsetX = -20 + 20 = 0, raw.ysp + offsetY = -10 + 10 = 0, 크기는 raw 그대로
    expect(chart.dragDisplayCtx.fillRect).toHaveBeenCalledWith(0, 0, 80, 60);
    // overlay에는 그리지 않는다
    expect(chart.overlayCtx.fillRect).not.toHaveBeenCalled();
    // 그리기 전 전용 캔버스를 항상 clear (opacity 누적 방지)
    expect(chart.dragDisplayCtx.clearRect).toHaveBeenCalledWith(0, 0, 200, 150);
  });

  it('dragDisplayOffset이 없으면 오프셋 0으로 동작한다 (?? 0 fallback)', () => {
    const range = { x1: 0, x2: 100, y1: 0, y2: 100 };
    const chart = createDrawChart({
      dragDisplayCanvas: { width: 200, height: 150 },
      dragDisplayCtx: makeCtx(),
      // dragDisplayOffset 미설정
    });

    chart.drawSelectionArea({
      xsp: 0,
      ysp: 0,
      width: 60,
      height: 50,
      range,
      displayRect: { xsp: -20, ysp: -10, width: 80, height: 60, range },
    });

    expect(chart.dragDisplayCtx.fillRect).toHaveBeenCalledWith(-20, -10, 80, 60);
  });

  it('keepDisplay 리사이즈 시 chart portion만 재스케일하고 startArea 꼬리는 픽셀 유지 (#3 드리프트 보정)', () => {
    // chartRect를 2배(0..200)로 키워 리사이즈 발생. dragInfo.range는 리사이즈 전(0..100).
    const range = { x1: 0, x2: 100, y1: 0, y2: 100 };
    const chart = createDrawChart({
      chartRect: { x1: 0, x2: 200, y1: 0, y2: 200 },
      dragDisplayCanvas: { width: 400, height: 400 },
      dragDisplayCtx: makeCtx(),
      dragDisplayOffset: { x: 100, y: 50 },
    });

    chart.drawSelectionArea({
      // clamped rect: 옛 chart(0..100) 안에서 x 20..70, y 20..70
      xsp: 20,
      ysp: 20,
      width: 50,
      height: 50,
      range,
      // raw rect: startArea로 뻗어 x -10..80, y -5..70
      // leftExt=30, topExt=25, rightExt=10, bottomExt=0
      displayRect: { xsp: -10, ysp: -5, width: 90, height: 75, range },
    });

    // clamped 2x 재스케일 → (40,40,100,100), 꼬리(30/25/10/0) 픽셀 유지, offset(100,50) 가산
    // x = 40 - 30 + 100 = 110, y = 40 - 25 + 50 = 65
    // w = 100 + 30 + 10 = 140, h = 100 + 25 + 0 = 125
    expect(chart.dragDisplayCtx.fillRect).toHaveBeenCalledWith(110, 65, 140, 125);
  });
});

describe('plugins.interaction 전용 드래그 캔버스 라이프사이클', () => {
  it('refreshDragDisplayCanvas는 overlay와 전용 캔버스 rect 차이로 오프셋을 캐시한다', () => {
    const chart = createDrawChart({
      dragStartTarget: { getBoundingClientRect: () => ({ width: 200, height: 150 }) },
      dragDisplayCanvas: {
        width: 0,
        height: 0,
        style: {},
        getBoundingClientRect: () => ({ left: 60, top: 20 }),
      },
      dragDisplayCtx: { setTransform: vi.fn(), clearRect: vi.fn() },
      overlayCanvas: { getBoundingClientRect: () => ({ left: 100, top: 50 }) },
    });

    chart.refreshDragDisplayCanvas();

    // offset = overlayRect - canvasRect = (100-60, 50-20)
    expect(chart.dragDisplayOffset).toEqual({ x: 40, y: 30 });
    // startArea 크기에 맞춰 device 픽셀로 리사이즈 (pixelRatio 1)
    expect(chart.dragDisplayCanvas.width).toBe(200);
    expect(chart.dragDisplayCanvas.height).toBe(150);
    expect(chart.dragDisplayCtx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
  });

  it('refreshDragDisplayCanvas는 전용 캔버스가 없으면 아무 일도 하지 않는다', () => {
    const chart = createDrawChart({
      dragStartTarget: { getBoundingClientRect: () => ({ width: 10, height: 10 }) },
    });
    expect(() => chart.refreshDragDisplayCanvas()).not.toThrow();
    expect(chart.dragDisplayOffset).toBeUndefined();
  });

  it('dragDisplayClear는 ctx/canvas가 없으면 아무 일도 하지 않는다', () => {
    const chart = createDrawChart({ dragDisplayCtx: null, dragDisplayCanvas: null });
    expect(() => chart.dragDisplayClear()).not.toThrow();
  });

  it('removeSelectionArea는 backup을 비우고 전용 캔버스도 clear 한다', () => {
    const dragDisplayCtx = { clearRect: vi.fn() };
    const overlayClear = vi.fn();
    const chart = createDrawChart({
      dragInfoBackup: { xsp: 1 },
      overlayClear,
      dragDisplayCanvas: { width: 100, height: 80 },
      dragDisplayCtx,
    });

    chart.removeSelectionArea();

    expect(chart.dragInfoBackup).toBeNull();
    expect(overlayClear).toHaveBeenCalled();
    expect(dragDisplayCtx.clearRect).toHaveBeenCalledWith(0, 0, 100, 80);
  });

  it('createDragDisplayCanvas는 startArea가 overlayCanvas와 같으면 전용 캔버스를 만들지 않는다', () => {
    // 가드는 overlayCanvas와의 동일성 비교뿐이라 실제 canvas가 필요 없다.
    const overlayCanvas = {};
    const chart = createDrawChart({
      dragStartTarget: overlayCanvas,
      overlayCanvas,
    });

    chart.createDragDisplayCanvas();

    expect(chart.dragDisplayCanvas).toBeUndefined();
  });
});

describe('plugins.interaction getFormattedTooltipValue — 값 포맷 캐시', () => {
  const createFormatterChart = (valueFormatter, dataEpoch = 1) =>
    Object.assign(Object.create(modules), {
      _dataEpoch: dataEpoch,
      options: {
        horizontal: false,
        type: 'line',
        tooltip: { formatter: { value: valueFormatter } },
      },
    });

  const callArgs = (point, value) => ({
    dataId: 'd1',
    seriesId: 's1',
    seriesName: 's1',
    value,
    itemData: point,
  });

  it('같은 epoch 에서 같은 point 객체를 재-hover 하면 formatter 를 재호출하지 않는다(캐시 히트)', () => {
    const formatter = vi.fn(({ y }) => `fmt:${y}`);
    const chart = createFormatterChart(formatter);
    const point = { x: 'a', y: 1, o: 1 };

    expect(chart.getFormattedTooltipValue(callArgs(point, 1))).toBe('fmt:1');
    expect(chart.getFormattedTooltipValue(callArgs(point, 1))).toBe('fmt:1');
    expect(formatter).toHaveBeenCalledTimes(1);
  });

  it('점객체 풀 재사용(in-place 갱신) 후 _dataEpoch 증가로 캐시가 폐기되고 새 값으로 재계산된다(회귀)', () => {
    // 회귀 배경: addData(target)가 점객체 풀을 재사용해 데이터 갱신 시 같은 객체의 값만
    // 덮어쓰므로, WeakMap 자동 GC 가정이 깨져 갱신 전 포맷 결과가 반환되고 사용자
    // formatter 에 진입하지 않는 버그가 있었다. createDataSet 진입 시 +1 되는 _dataEpoch
    // 와 캐시 epoch 비교로 무효화한다.
    const formatter = vi.fn(({ y }) => `fmt:${y}`);
    const chart = createFormatterChart(formatter);
    const point = { x: 'a', y: 1, o: 1 };

    expect(chart.getFormattedTooltipValue(callArgs(point, 1))).toBe('fmt:1');

    // 데이터 갱신: createDataSet 이 풀의 같은 객체를 새 값으로 덮어쓴 상황
    point.y = 2;
    point.o = 2;

    // 계약이 아니라 현재 기전의 스냅샷: identity 키 WeakMap 은 값 변화를 알 수 없다
    // (값/epoch 기반 키로 캐시를 개선하면 이 단언은 지워도 된다 — epoch 무효화가 필요한 이유의 기록)
    expect(chart.getFormattedTooltipValue(callArgs(point, 2))).toBe('fmt:1');

    // createDataSet 재실행에 해당하는 epoch 증가 → 캐시 폐기 → 재계산
    chart._dataEpoch += 1;

    expect(chart.getFormattedTooltipValue(callArgs(point, 2))).toBe('fmt:2');
    expect(formatter).toHaveBeenCalledTimes(2);
  });

  it('epoch 가 그대로면(createDataSet 미실행 — scrollbar lightUpdate 등) 캐시가 유지된다', () => {
    const formatter = vi.fn(({ y }) => `fmt:${y}`);
    const chart = createFormatterChart(formatter);
    const point = { x: 'a', y: 1, o: 1 };

    chart.getFormattedTooltipValue(callArgs(point, 1));
    chart.getFormattedTooltipValue(callArgs(point, 1));

    expect(formatter).toHaveBeenCalledTimes(1);
    expect(chart._tooltipValueCacheEpoch).toBe(chart._dataEpoch);
  });

  it('_dataEpoch 미정의 경로(realTimeScatter 등)에서는 캐시를 만들지 않아 formatter 교체가 즉시 반영된다', () => {
    // realTimeScatter 는 createRealTimeScatterDataSet 별도 경로라 _dataEpoch 가 undefined 로
    // 남는다. 이때 캐시가 만들어지면 epoch 비교(undefined !== undefined === false)로 영구히
    // 무효화되지 않아, formatter 런타임 교체 후에도 이전 formatter 결과가 반환된다 — 캐시
    // 자체를 만들지 않는 것으로 방어한다(computeGeometry 의 canMemo 가드와 동일 취지).
    const oldFormatter = vi.fn(({ y }) => `OLD:${y}`);
    const chart = Object.assign(Object.create(modules), {
      options: {
        horizontal: false,
        type: 'scatter',
        tooltip: { formatter: { value: oldFormatter } },
      },
    });
    const point = { x: 1, y: 5, o: 5 };

    expect(chart.getFormattedTooltipValue(callArgs(point, 5))).toBe('OLD:5');
    expect(chart._tooltipValueCache).toBeUndefined();

    // 사용자가 tooltip.formatter.value 를 런타임 교체 (단위 토글, 로케일 변경 등)
    const newFormatter = vi.fn(({ y }) => `NEW:${y}`);
    chart.options = {
      ...chart.options,
      tooltip: { formatter: { value: newFormatter } },
    };

    expect(chart.getFormattedTooltipValue(callArgs(point, 5))).toBe('NEW:5');
    expect(newFormatter).toHaveBeenCalledTimes(1);
  });

  it('value formatter 가 없으면 캐시를 만들지 않는다(기본 numberWithComma 경로 우회)', () => {
    const chart = Object.assign(Object.create(modules), {
      _dataEpoch: 1,
      options: { horizontal: false, type: 'line', tooltip: {} },
    });
    const point = { x: 'a', y: 1000, o: 1000 };

    expect(
      chart.getFormattedTooltipValue({
        dataId: 'd1',
        seriesId: 's1',
        seriesName: 's1',
        value: 1000,
        itemData: point,
      }),
    ).toBe('1,000');
    expect(chart._tooltipValueCache).toBeUndefined();
  });
});

describe('plugins.interaction onMouseDown 드래그 진입 게이트', () => {
  const createDragCtx = (options, data = { groups: [] }) => {
    const ctx = Object.assign(Object.create(modules), {
      options: {
        horizontal: false,
        tooltip: {},
        dragSelection: { use: true },
        ...options,
      },
      data,
      overlayCanvas: { addEventListener: vi.fn() },
      target: { closest: () => null },
      dragStart: vi.fn(),
      removeSelectionArea: vi.fn(),
    });

    ctx.createEventFunctions();

    return ctx;
  };

  it.each(['scatter', 'line', 'heatMap', 'bar'])('%s 는 드래그가 시작된다', (type) => {
    const ctx = createDragCtx({ type });

    ctx.onMouseDown({});

    expect(ctx.dragStart).toHaveBeenCalledWith({}, type);
  });

  it('horizontal bar 는 드래그가 시작되지 않는다', () => {
    const ctx = createDragCtx({ type: 'bar', horizontal: true });

    ctx.onMouseDown({});

    expect(ctx.dragStart).not.toHaveBeenCalled();
  });

  it('dragSelection.use 가 false 면 bar 도 드래그가 시작되지 않는다', () => {
    const ctx = createDragCtx({ type: 'bar', dragSelection: { use: false } });

    ctx.onMouseDown({});

    expect(ctx.dragStart).not.toHaveBeenCalled();
  });

  // 누적은 차트 타입이 아니라 data.groups 로 표현된다. 게이트에 groups 조건이 끼어들면 red.
  it('누적(groups) 수직 bar 도 드래그가 시작된다', () => {
    const ctx = createDragCtx({ type: 'bar' }, { groups: [['series1', 'series2']] });

    ctx.onMouseDown({});

    expect(ctx.dragStart).toHaveBeenCalledWith({}, 'bar');
  });

  it('누적 bar 가 horizontal 이면 드래그가 시작되지 않는다', () => {
    const ctx = createDragCtx(
      { type: 'bar', horizontal: true },
      { groups: [['series1', 'series2']] },
    );

    ctx.onMouseDown({});

    expect(ctx.dragStart).not.toHaveBeenCalled();
  });
});

describe('dragEnd', () => {
  // dragEnd 는 dragStart 내부 클로저라 window mouseup 이 유일한 진입점이다.
  // getMousePosition 을 커서 객체로 스텁해 드래그 좌표를 주입한다.
  const createDragEndCtx = ({
    type = 'bar',
    listeners = {},
    zoom,
    seriesList = {},
    chartRect = { x1: 0, x2: 100, y1: 0, y2: 60 },
  } = {}) => {
    const cursor = { x: 0, y: 0 };

    const ctx = Object.assign(Object.create(modules), {
      options: {
        type,
        horizontal: false,
        title: { text: 'chart' },
        tooltip: {},
        dragSelection: { use: true, keepDisplay: true },
        ...(zoom ? { zoom } : {}),
      },
      listeners,
      seriesList,
      chartRect,
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesSteps: {
        x: [{ graphMin: 0, graphMax: 4 }],
        y: [{ graphMin: 0, graphMax: 50 }],
      },
      getMousePosition: () => [cursor.x, cursor.y, chartRect.x2, chartRect.y2],
      overlayClear: vi.fn(),
      drawSelectionArea: vi.fn(),
      removeSelectionArea: vi.fn(),
    });

    ctx.cursor = cursor;

    return ctx;
  };

  const dragTo = (ctx, [xFrom, yFrom], [xTo, yTo]) => {
    const handlers = {};
    const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((name, fn) => {
      handlers[name] = fn;
    });

    ctx.cursor.x = xFrom;
    ctx.cursor.y = yFrom;
    ctx.dragStart({}, ctx.options.type);
    addSpy.mockRestore();

    ctx.cursor.x = xTo;
    ctx.cursor.y = yTo;
    // dispatchEvent 는 리스너가 던진 예외를 삼켜 not.toThrow 검증이 무의미해지므로 직접 호출한다.
    handlers.mousemove(new MouseEvent('mousemove'));
    handlers.mouseup(new MouseEvent('mouseup'));
  };

  const barSeries = (items) => ({ series1: { name: 'series#1', findItems: () => items } });

  it('bar 는 y축 전체 높이를 밴드로 잡고 리스너에 { data, range } 를 넘긴다', () => {
    const items = [{ x: 1, y: 20, o: 20 }];
    const dragSelect = vi.fn();
    const ctx = createDragEndCtx({
      listeners: { 'drag-select': dragSelect },
      seriesList: barSeries(items),
    });

    dragTo(ctx, [20, 5], [60, 50]);

    const [args] = dragSelect.mock.calls[0];
    expect(args.data).toEqual([{ seriesName: 'series#1', seriesId: 'series1', items }]);
    expect(args.range).toEqual({ xMin: 0.8, xMax: 2.4, yMin: 0, yMax: 50 });
    // 세로 드래그 폭과 무관하게 y 밴드는 차트 전체 높이다.
    expect(ctx.dragInfoBackup.ysp).toBe(ctx.dragInfoBackup.range.y1);
    expect(ctx.dragInfoBackup.height).toBe(
      ctx.dragInfoBackup.range.y2 - ctx.dragInfoBackup.range.y1,
    );
  });

  it('range 값은 소수 3자리로 고정된다', () => {
    const dragSelect = vi.fn();
    const ctx = createDragEndCtx({
      type: 'scatter',
      listeners: { 'drag-select': dragSelect },
      seriesList: barSeries([{ x: 1, y: 20 }]),
      chartRect: { x1: 0, x2: 30, y1: 0, y2: 60 },
    });

    dragTo(ctx, [0, 5], [10, 50]);

    // xMax = 4 * (10/30) = 1.3333...
    expect(dragSelect.mock.calls[0][0].range.xMax).toBe(1.333);
  });

  it('zoom.use 면 리스너 대신 zoom.getRangeInfo 가 호출된다', () => {
    const dragSelect = vi.fn();
    const getRangeInfo = vi.fn();
    const ctx = createDragEndCtx({
      listeners: { 'drag-select': dragSelect },
      zoom: { use: true, getRangeInfo },
      seriesList: barSeries([{ x: 1, y: 20 }]),
    });

    dragTo(ctx, [20, 5], [60, 50]);

    expect(dragSelect).not.toHaveBeenCalled();
    expect(getRangeInfo).toHaveBeenCalledTimes(1);
    // dragZoom 이 줌 창을 계산하는 데 쓰는 좌표 메타가 실려야 한다.
    expect(getRangeInfo.mock.calls[0][0].range.dragSelectionInfo).toMatchObject({
      dragXsp: 20,
      dragXep: 60,
    });
  });

  // findSelectedItems 는 options.type 을 읽지 않는다 — line 차트에 시리즈 type 오버라이드로 섞은
  // bar 도 findItems 를 가지면 페이로드에 실린다. 아이템이 없는 시리즈는 제외된다.
  it('페이로드는 차트 타입을 가리지 않고 findItems 를 가진 시리즈를 담는다', () => {
    const items = [{ x: 1, y: 20, o: 20 }];
    const dragSelect = vi.fn();
    const ctx = createDragEndCtx({
      type: 'line',
      listeners: { 'drag-select': dragSelect },
      seriesList: {
        line1: { name: 'line#1', findItems: () => [] },
        bar1: { name: 'bar#1', findItems: () => items },
      },
    });

    dragTo(ctx, [20, 5], [60, 50]);

    expect(dragSelect.mock.calls[0][0].data).toEqual([
      { seriesName: 'bar#1', seriesId: 'bar1', items },
    ]);
  });

  // zoom 옵션에는 getRangeInfo 가 없고(DEFAULT_OPTIONS.zoom), 리스너도 없으면 이 분기로 떨어진다.
  it.each(['bar', 'scatter'])('%s: 리스너도 zoom 도 없으면 mouseup 이 터지지 않는다', (type) => {
    const ctx = createDragEndCtx({ type, seriesList: barSeries([{ x: 1, y: 20 }]) });

    expect(() => dragTo(ctx, [20, 5], [60, 50])).not.toThrow();
  });
});
