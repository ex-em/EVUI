import { describe, it, expect } from 'vitest';
import Bar from './element.bar';

const createBar = (overrides = {}) => {
  const bar = Object.create(Bar.prototype);
  Object.assign(bar, overrides);
  return bar;
};

describe('Bar Element', () => {
  describe('calculateBarSize', () => {
    it('px 문자열을 파싱하여 크기를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('30px', 50)).toBe(30);
    });

    it('px 값이 bArea보다 크면 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('100px', 50)).toBe(50);
    });

    it('0~1 사이 숫자는 비율로 계산한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0.5, 100)).toBe(50);
    });

    it('비율 0은 0을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0, 100)).toBe(0);
    });

    it('비율 1은 전체 영역을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(1, 100)).toBe(100);
    });

    it('유효하지 않은 값은 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('auto', 80)).toBe(80);
      expect(bar.calculateBarSize(null, 80)).toBe(80);
      expect(bar.calculateBarSize(2, 80)).toBe(80);
    });
  });

  describe('isPointInBar', () => {
    it('바 영역 내 점은 true를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      // bar: x 10~30, y 20~50
      expect(bar.isPointInBar([15, 40], barData)).toBe(true);
    });

    it('바 영역 밖 점은 false를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      expect(bar.isPointInBar([5, 40], barData)).toBe(false);
      expect(bar.isPointInBar([35, 40], barData)).toBe(false);
    });
  });

  describe('findGraphData directHit 플래그', () => {
    // bar: x 10~30, y 20~50
    const barData = { xp: 10, yp: 50, w: 20, h: -30, index: 0 };

    const createBarWithData = () =>
      createBar({
        data: [barData],
        show: true,
        color: '#000',
        visibleStartIndex: 0,
        filteredCount: 1,
      });

    it('bar 박스 내부 클릭은 hit=true, directHit=true를 반환한다', () => {
      const bar = createBarWithData();
      const item = bar.findGraphData([15, 40], false, 0, true);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
    });

    it('bar 박스 밖 클릭은 hit=false, directHit=false를 반환한다', () => {
      const bar = createBarWithData();
      const item = bar.findGraphData([5, 40], false, 0, true);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBe(false);
    });

    it('binarySearchBar 경로(findGraphRange)에서도 directHit를 세팅한다', () => {
      // useIndicatorOnLabel=false로 두면 findGraphRange → binarySearchBar 경로 진입
      const bar = createBarWithData();
      const item = bar.findGraphData([15, 40], false, undefined, false);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
    });

    it('binarySearchBar에서 x범위 밖 클릭은 directHit가 세팅되지 않는다', () => {
      // binarySearchBar는 inRange 조건을 만족해야 item이 세팅됨.
      // 범위 밖이면 초기값 { hit: false } 유지 (directHit 없음 = falsy).
      const bar = createBarWithData();
      const item = bar.findGraphData([50, 40], false, undefined, false);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });
  });

  describe('axis range 밖 데이터 — clamp 회귀 방지', () => {
    // commit 2a1c2d0c 가 도입한 _barValue / _baseValue 의 Math.min/max clamp 가 다시 들어오면
    // range 를 초과한 막대가 chart edge 까지 늘어지고 hover/tooltip 에 잡혀 회귀가 발생한다.
    // axis range 밖 값은 calculateY/X 가 null 을 반환하고, minimum* 보정에서도 제외돼야 한다.
    const makeStubCtx = () => ({
      calls: [],
      save() {},
      restore() {},
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      arcTo() {},
      clip() {},
      fillRect(x, y, w, h) { this.calls.push(['fillRect', x, y, w, h]); },
      createLinearGradient: () => ({ addColorStop() {} }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    });

    const drawVerticalBars = (
      data,
      { yMin = 0, yMax = 100, displayOverflow = false } = {},
    ) => {
      const bar = new Bar('s1', { interpolation: 'none' }, 0, false);
      bar.show = true;
      bar.data = data.map((d) => ({ ...d }));
      bar.showValue = { use: false };
      bar.xAxisIndex = 0;
      bar.yAxisIndex = 0;
      const ctx = makeStubCtx();
      bar.draw({
        ctx,
        chartRect: { x1: 0, x2: 200, y1: 0, y2: 200, chartWidth: 200, chartHeight: 200 },
        labelOffset: { top: 0, bottom: 0, left: 0, right: 0 },
        axesSteps: {
          x: [{ graphMin: 0, graphMax: bar.data.length - 1 }],
          y: [{ graphMin: yMin, graphMax: yMax }],
        },
        isHorizontal: false,
        showIndex: 0,
        thickness: 'auto',
        showSeriesCount: 1,
        cPadRatio: 0,
        borderRadius: 0,
        displayOverflow,
      });
      return { bar, ctx };
    };

    it('값이 graphMax 를 초과한 막대는 h=null 로 세팅된다 (clamp 미적용)', () => {
      const { bar } = drawVerticalBars([
        { x: 0, y: 50 },
        { x: 1, y: 500 }, // graphMax(100) 초과
      ]);
      expect(bar.data[0].h).not.toBe(null);
      expect(bar.data[1].h).toBe(null);
    });

    it('값이 graphMin 미만인 막대도 h=null 로 세팅된다', () => {
      const { bar } = drawVerticalBars([
        { x: 0, y: 50 },
        { x: 1, y: -50 }, // graphMin(0) 미만
      ]);
      expect(bar.data[1].h).toBe(null);
    });

    it('range 밖 막대는 minimumBarHeight (-1/1) 로 덮어쓰이지 않는다', () => {
      const { bar } = drawVerticalBars([
        { x: 0, y: 50 },
        { x: 1, y: 500 },
      ]);
      expect(bar.data[1].h).not.toBe(-1);
      expect(bar.data[1].h).not.toBe(1);
    });

    it('range 밖 막대는 fillRect 가 음수/0 또는 null 폭/높이로 호출되어 시각적 영향이 없다', () => {
      const { ctx } = drawVerticalBars([
        { x: 0, y: 50 },
        { x: 1, y: 500 },
      ]);
      const fillRectsForOutOfRange = ctx.calls.filter(([op, , , , h]) => op === 'fillRect' && (h === null || h === 0));
      // axis range 밖 데이터의 fillRect 호출은 null h 또는 0 h 로 들어와 실제로 그려지지 않아야 함.
      expect(fillRectsForOutOfRange.length).toBeGreaterThanOrEqual(1);
    });

    describe('displayOverflow — 값 축(Y) 초과 경계 표시', () => {
      it('displayOverflow=true 면 값>graphMax 막대가 경계로 clamp 되어 h 가 non-null', () => {
        const { bar } = drawVerticalBars(
          [{ x: 0, y: 50 }, { x: 1, y: 500 }],
          { displayOverflow: true },
        );
        expect(bar.data[1].h).not.toBe(null);
      });

      it('displayOverflow=true 면 overflow 막대는 -1/1 minimum 이 아니라 경계 높이로 그려진다', () => {
        const { bar } = drawVerticalBars(
          [{ x: 0, y: 50 }, { x: 1, y: 500 }],
          { displayOverflow: true },
        );
        // graphMax(100) 경계까지 = 정상 막대 높이의 2배(50→100) 수준, 절댓값이 1보다 큼
        expect(Math.abs(bar.data[1].h)).toBeGreaterThan(1);
      });

      it('displayOverflow=false(기본)면 값>graphMax 는 h=null (숨김 유지)', () => {
        const { bar } = drawVerticalBars([{ x: 0, y: 50 }, { x: 1, y: 500 }]);
        expect(bar.data[1].h).toBe(null);
      });
    });
  });

  describe('null 데이터 안전 fall-through (회귀 가드)', () => {
    // bar 박스 비교는 null 좌표에서 NaN 으로 false fall-through.
    const nullBar = { xp: null, yp: null, w: null, h: null, o: null, index: 0 };
    const createBarWithNullData = () =>
      createBar({
        data: [nullBar],
        show: true,
        color: '#000',
        visibleStartIndex: 0,
        filteredCount: 1,
      });

    it('isPointInBar 는 null 박스 좌표에서 false 를 반환한다', () => {
      const bar = createBar();
      expect(bar.isPointInBar([40, 10], { xp: null, yp: null, w: null, h: null })).toBe(false);
    });

    it('dataIndex 분기(useIndicatorOnLabel=true) + null 데이터 → hit=false', () => {
      const bar = createBarWithNullData();
      const item = bar.findGraphData([40, 10], false, 0, true);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });

    it('binarySearchBar 경로(useIndicatorOnLabel=false) + null 데이터 → hit=false', () => {
      const bar = createBarWithNullData();
      const item = bar.findGraphData([40, 10], false, undefined, false);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });
  });
});
