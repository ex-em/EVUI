import { describe, it, expect } from 'vitest';

// chart.core.js의 labelsForWidth increment 계산 로직 (인라인 헬퍼)
const calcWidthIncrement = (value) => {
  const decimalPlaces = (String(value).split('.')[1] ?? '').length;
  return 10 ** -(decimalPlaces + 1);
};

describe('chart.core', () => {
  describe('labelsForWidth increment 계산 (widestNumeric 너비 팽창 보정)', () => {
    it('정수는 소수 1자리(0.1) increment를 반환한다', () => {
      expect(calcWidthIncrement(100)).toBeCloseTo(0.1);
    });

    it('소수 1자리는 소수 2자리(0.01) increment를 반환한다', () => {
      expect(calcWidthIncrement(10.5)).toBeCloseTo(0.01);
    });

    it('소수 2자리는 소수 3자리(0.001) increment를 반환한다', () => {
      expect(calcWidthIncrement(1.23)).toBeCloseTo(0.001);
    });

    it('음수 정수도 양수와 동일한 increment를 반환한다', () => {
      expect(calcWidthIncrement(-100)).toBeCloseTo(0.1);
    });

    it('음수 소수 1자리도 양수와 동일한 increment를 반환한다', () => {
      expect(calcWidthIncrement(-10.5)).toBeCloseTo(0.01);
    });

    it('음수 정수에 increment를 더하면 소수 1자리가 생긴다', () => {
      const v = -100;
      expect(v + calcWidthIncrement(v)).toBeCloseTo(-99.9, 10);
    });

    it('음수 소수에 increment를 더하면 소수 자리가 하나 늘어난다', () => {
      const v = -10.5;
      expect(v + calcWidthIncrement(v)).toBeCloseTo(-10.49, 10);
    });
  });
});
