import { describe, it, expect } from 'vitest';
import { calcDomainBounds } from './plugins.tooltip';

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
      // 모든 데이터가 x=50 → ratio=0.5, 결과는 [50, 50]
      // 호출부에서 EDGE_TOLERANCE를 더해 실제 히트 영역을 확보한다
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
