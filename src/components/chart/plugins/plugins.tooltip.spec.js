import { describe, it, expect } from 'vitest';
import modules, { calcDomainBounds } from './plugins.tooltip';

const step = (graphMin, graphMax) => ({ graphMin, graphMax });
const range = (min, max) => ({ min, max });

describe('calcDomainBounds', () => {
  describe('non-inverted (X축)', () => {
    it('정상 케이스: 데이터 범위가 스케일보다 좁으면 경계가 좁아진다', () => {
      // graphMin=0, graphMax=100, data: 10~90 → 10%~90% 위치
      const result = calcDomainBounds(step(0, 100), range(10, 90), 0, 200, false);
      expect(result).not.toBeNull();
      const [min, max] = result;
      expect(min).toBeGreaterThan(0);   // 0px보다 오른쪽
      expect(max).toBeLessThan(200);    // 200px보다 왼쪽
    });

    it('데이터가 스케일을 꽉 채우면 graphPos 그대로 반환한다', () => {
      const result = calcDomainBounds(step(0, 100), range(0, 100), 0, 200, false);
      expect(result).toEqual([0, 200]);
    });

    it('비율을 정확히 계산한다', () => {
      // graphMin=0, graphMax=100, range=25~75, start=0, size=100
      // minRatio=0.25 → floor(0+100*0.25)=25
      // maxRatio=0.75 → ceil(0+100*0.75)=75
      const [min, max] = calcDomainBounds(step(0, 100), range(25, 75), 0, 100, false);
      expect(min).toBe(25);
      expect(max).toBe(75);
    });

    it('소수점 start 값일 때 하한은 floor로 반내림된다', () => {
      // start=0.3이면 하한: floor(0.3+0)=0, 상한: ceil(0.3+99.7)=100
      // ceil이었다면 하한이 1이 되어 leftmost 픽셀이 히트 영역에서 제외됨
      const [min, max] = calcDomainBounds(step(0, 100), range(0, 100), 0.3, 99.7, false);
      expect(min).toBe(0);
      expect(max).toBe(100);
    });

    it('range.min === range.max(단일 값)이면 동일한 픽셀 경계를 반환한다', () => {
      // 함수 단독 동작 검증: min===max인 range는 동일 경계 [50, 50]을 반환한다.
      // 단, 실제 파이프라인에선 calculateScaleRange의 maxValue += 1 가드로
      // range.min === range.max(폭 0)가 생기지 않으므로 이 degenerate 입력은 들어오지 않는다.
      // 도메인 축은 호출부(updateIndicatorHitBounds)에서 tolerance를 더하지 않는다(narrowing 의도).
      // EDGE_TOLERANCE는 교차(비도메인) 축에만 적용된다.
      const [min, max] = calcDomainBounds(step(0, 100), range(50, 50), 0, 100, false);
      expect(min).toBe(50);
      expect(max).toBe(50);
    });
  });

  describe('inverted (Y축)', () => {
    it('Y축은 값이 클수록 픽셀이 작아지는 반전 계산을 한다', () => {
      // graphMin=0, graphMax=100, range=25~75, start=100(y2), size=100
      // maxRatio=0.75 → floor(100-100*0.75)=25  ← yMin
      // minRatio=0.25 → ceil(100-100*0.25)=75   ← yMax
      const [yMin, yMax] = calcDomainBounds(step(0, 100), range(25, 75), 100, 100, true);
      expect(yMin).toBe(25);
      expect(yMax).toBe(75);
    });

    it('non-inverted과 대칭 구조다', () => {
      // inverted: [floor(start - size*maxRatio), ceil(start - size*minRatio)]
      // non-inverted: [floor(start + size*minRatio), ceil(start + size*maxRatio)]
      // → yMax = ceil(start - size*minRatio) = start - floor(size*minRatio) = start - xMin (start_x=0)
      const size = 200;
      const start = size; // y2 = size (y1=0 기준)
      const [yMin, yMax] = calcDomainBounds(step(0, 100), range(10, 90), start, size, true);
      const [xMin, xMax] = calcDomainBounds(step(0, 100), range(10, 90), 0, size, false);
      expect(yMax).toBe(start - xMin);
      expect(yMin).toBe(start - xMax);
    });
  });

  describe('가드 조건 (null 반환)', () => {
    it('span이 0이면(graphMin === graphMax) null을 반환한다', () => {
      expect(calcDomainBounds(step(50, 50), range(50, 50), 0, 100, false)).toBeNull();
    });

    it('graphMin/graphMax가 문자열(category 축)이면 null을 반환한다', () => {
      expect(calcDomainBounds(step('a', 'z'), range(0, 10), 0, 100, false)).toBeNull();
    });

    it('step이 undefined이면 null을 반환한다', () => {
      expect(calcDomainBounds(undefined, range(0, 100), 0, 100, false)).toBeNull();
    });

    it('range가 null이면 null을 반환한다', () => {
      expect(calcDomainBounds(step(0, 100), null, 0, 100, false)).toBeNull();
    });

    it('graphMin/graphMax가 undefined이면 null을 반환한다', () => {
      expect(calcDomainBounds({}, range(0, 100), 0, 100, false)).toBeNull();
    });
  });

  describe('clamp 동작', () => {
    it('range가 스케일을 벗어나도 경계가 graphPos를 넘지 않는다', () => {
      // range.min < graphMin → clamp → minRatio=0 → min=start
      const [min, max] = calcDomainBounds(step(10, 90), range(0, 100), 0, 100, false);
      expect(min).toBe(0);
      expect(max).toBe(100);
    });
  });

  describe('range 역전 (min > max)', () => {
    it('range: [100, 0] 처럼 역전 설정이 들어와도 유효한 경계를 반환한다', () => {
      // range.min=90, range.max=10 → 역전 → 정상 케이스 range(10,90)과 동일해야 함
      const normal = calcDomainBounds(step(0, 100), range(10, 90), 0, 200, false);
      const reversed = calcDomainBounds(step(0, 100), range(90, 10), 0, 200, false);
      expect(reversed).toEqual(normal);
    });

    it('역전 시 boundMin <= boundMax를 보장한다', () => {
      const [min, max] = calcDomainBounds(step(0, 100), range(80, 20), 0, 100, false);
      expect(min).toBeLessThanOrEqual(max);
    });
  });
});

describe('updateIndicatorHitBounds', () => {
  const EDGE_TOLERANCE = 15; // 비도메인 축에 적용되는 tolerance (소스와 동일)

  // 마우스/캔버스 없이 mock this로 호출해 _indicatorHitBounds 계약만 검증한다.
  const makeCtx = (overrides = {}) => ({
    options: { horizontal: false },
    chartRect: { x1: 0, x2: 200, y1: 0, y2: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [], y: [] },
    axesRange: { x: [], y: [] },
    ...overrides,
  });

  const run = (ctx) => {
    modules.updateIndicatorHitBounds.call(ctx);
    return ctx._indicatorHitBounds;
  };

  describe('vertical (도메인 = X축)', () => {
    it('category/문자열 축(calcDomainBounds null)이면 도메인 X는 [x1,x2]로 fallback(tolerance 0)', () => {
      const ctx = makeCtx({
        axesSteps: { x: [step('a', 'z')], y: [] },
        axesRange: { x: [range(0, 10)], y: [] },
      });
      const b = run(ctx);
      // 도메인 축: tolerance 없이 차트 경계
      expect(b.hitXMin).toBe(0);
      expect(b.hitXMax).toBe(200);
      // 비도메인(Y)축: ±EDGE_TOLERANCE 유지
      expect(b.hitYMin).toBe(0 - EDGE_TOLERANCE);
      expect(b.hitYMax).toBe(100 + EDGE_TOLERANCE);
      expect(b.horizontal).toBe(false);
    });

    it('데이터가 스케일보다 좁으면 빈 구간을 제외하고 X 히트 영역이 좁아진다', () => {
      // 데이터 50~100 / 스케일 0~100 / 픽셀 0~200 → 데이터는 100~200px 구간에만 존재
      const ctx = makeCtx({
        axesSteps: { x: [step(0, 100)], y: [] },
        axesRange: { x: [range(50, 100)], y: [] },
      });
      const b = run(ctx);
      // 회귀 가드: Infinity 초기화 버그가 있으면 hitXMin이 0(=빈 구간 포함)으로 되돌아간다
      expect(b.hitXMin).toBe(100);
      expect(b.hitXMax).toBe(200);
    });

    it('다축이면 각 축 데이터 픽셀 구간의 합집합을 취한다', () => {
      // axis0: 60~80% → [120,160], axis1: 10~30% → [20,60]
      const ctx = makeCtx({
        axesSteps: { x: [step(0, 100), step(0, 100)], y: [] },
        axesRange: { x: [range(60, 80), range(10, 30)], y: [] },
      });
      const b = run(ctx);
      expect(b.hitXMin).toBe(20); // min(120, 20)
      expect(b.hitXMax).toBe(160); // max(160, 60)
    });

    it('chartRect에 labelOffset이 반영된다', () => {
      const ctx = makeCtx({
        chartRect: { x1: 10, x2: 210, y1: 5, y2: 105 },
        labelOffset: { left: 10, right: 10, top: 5, bottom: 5 },
        axesSteps: { x: [step('a', 'z')], y: [] }, // null → fallback [x1,x2]
        axesRange: { x: [range(0, 10)], y: [] },
      });
      const b = run(ctx);
      expect(b.x1).toBe(20);
      expect(b.x2).toBe(200);
      expect(b.y1).toBe(10);
      expect(b.y2).toBe(100);
      expect(b.hitXMin).toBe(20);
      expect(b.hitXMax).toBe(200);
    });
  });

  describe('horizontal (도메인 = Y축)', () => {
    it('도메인이 Y로 바뀌어 Y는 데이터로 좁히고(tolerance 0), X는 ±EDGE_TOLERANCE를 갖는다', () => {
      const ctx = makeCtx({
        options: { horizontal: true },
        axesSteps: { x: [], y: [step(0, 100)] },
        axesRange: { x: [], y: [range(25, 75)] },
      });
      const b = run(ctx);
      // 도메인(Y): inverted 계산 → [25,75], tolerance 없음
      expect(b.hitYMin).toBe(25);
      expect(b.hitYMax).toBe(75);
      // 비도메인(X): ±EDGE_TOLERANCE
      expect(b.hitXMin).toBe(0 - EDGE_TOLERANCE);
      expect(b.hitXMax).toBe(200 + EDGE_TOLERANCE);
      expect(b.horizontal).toBe(true);
    });

    it('category Y축(null)이면 도메인 Y가 [y1,y2]로 fallback된다', () => {
      const ctx = makeCtx({
        options: { horizontal: true },
        axesSteps: { x: [], y: [step('a', 'z')] },
        axesRange: { x: [], y: [range(0, 10)] },
      });
      const b = run(ctx);
      expect(b.hitYMin).toBe(0);
      expect(b.hitYMax).toBe(100);
    });
  });
});
