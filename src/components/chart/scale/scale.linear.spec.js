import { describe, it, expect } from 'vitest';
import LinearScale from './scale.linear';

// LinearScale의 순수 계산 메서드를 테스트하기 위해 최소 mock 생성
const createScale = (overrides = {}) => {
  const scale = Object.create(LinearScale.prototype);
  scale.interval = null;
  scale.decimalPoint = null;
  scale.startToZero = false;
  scale.fixedSteps = false;
  scale.formatter = null;
  Object.assign(scale, overrides);
  return scale;
};

describe('LinearScale', () => {
  describe('getInterval', () => {
    it('기본 interval을 계산한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(20);
    });

    it('사용자 지정 interval이 있으면 그대로 반환한다', () => {
      const scale = createScale({ interval: 25 });
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(25);
    });

    it('steps가 0이면 0을 반환한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 0 });
      expect(result).toBe(0);
    });

    it('소수점이 없으면 ceil 처리한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 3 });
      // 100/3 = 33.33... → ceil → 34
      expect(result).toBe(34);
    });

    it('소수점이 있으면 그대로 반환한다', () => {
      const scale = createScale({ decimalPoint: 2 });
      const result = scale.getInterval({ maxValue: 1, minValue: 0, maxSteps: 3 });
      expect(result).toBeCloseTo(0.333, 2);
    });

    it('startToZero이고 음수 포함 시 올바르게 계산한다', () => {
      const scale = createScale({ startToZero: true });
      const result = scale.getInterval({ maxValue: 80, minValue: -20, maxSteps: 5 });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getDecimalPointFromRange', () => {
    it('정수 범위는 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 100, numberOfSteps: 5 })).toBe(0);
    });

    it('소수점 범위의 자릿수를 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 1, numberOfSteps: 10 })).toBe(1);
    });

    it('매우 작은 범위의 자릿수를 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 0.01, numberOfSteps: 10 })).toBe(3);
    });

    it('numberOfSteps가 0이면 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 100, numberOfSteps: 0 })).toBe(0);
    });

    it('graphRange가 0이면 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 0, numberOfSteps: 5 })).toBe(0);
    });
  });

  describe('getNiceInterval', () => {
    it('양수 값에 대해 nice interval을 반환한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(33);
      // 33 → exponent=1, normalized=3.3 → fraction=5 → 50
      expect(result).toBe(50);
    });

    it('작은 양수에 대해 동작한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(0.7);
      expect(result).toBe(1);
    });

    it('음수 값에 대해 음수 nice interval을 반환한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(-33);
      expect(result).toBe(-50);
    });

    it('0은 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(0)).toBe(0);
    });

    it('Infinity는 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(Infinity)).toBe(0);
    });

    it('NaN은 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(NaN)).toBe(0);
    });

    it('1에 대해 1을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(1)).toBe(1);
    });

    it('10에 대해 10을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(10)).toBe(10);
    });

    it('15에 대해 20을 반환한다', () => {
      const scale = createScale();
      // 15 → exponent=1, normalized=1.5 → fraction=2 → 20
      expect(scale.getNiceInterval(15)).toBe(20);
    });
  });
});
