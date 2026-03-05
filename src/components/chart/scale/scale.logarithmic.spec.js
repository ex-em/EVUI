import { describe, it, expect } from 'vitest';
import LogarithmicScale from './scale.logarithmic';

const createScale = (overrides = {}) => {
  const scale = Object.create(LogarithmicScale.prototype);
  scale.interval = null;
  scale.decimalPoint = null;
  scale.startToZero = false;
  scale.range = null;
  scale.formatter = null;
  Object.assign(scale, overrides);
  return scale;
};

describe('LogarithmicScale', () => {
  describe('getInterval', () => {
    it('범위에 따라 로그 스케일 인터벌을 계산한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 1000, minValue: 0 });
      // 10^calculateMagnitude(1000) = 10^3 = 1000 or similar
      expect(result).toBeGreaterThan(0);
    });

    it('작은 범위에 대해 작은 인터벌을 반환한다', () => {
      const scale = createScale();
      const small = scale.getInterval({ maxValue: 10, minValue: 0 });
      const large = scale.getInterval({ maxValue: 1000, minValue: 0 });
      expect(small).toBeLessThan(large);
    });

    it('같은 min/max는 0을 반환한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 50, minValue: 50 });
      // calculateMagnitude(0) = -Infinity → 10^(-Infinity) = 0
      expect(result).toBe(0);
    });
  });

  describe('getLabelFormat', () => {
    it('formatter가 없으면 기본 포맷을 사용한다', () => {
      const scale = createScale();
      const result = scale.getLabelFormat(1000);
      expect(typeof result).toBe('string');
    });

    it('formatter가 있으면 formatter를 사용한다', () => {
      const scale = createScale({
        formatter: (v) => `${v}K`,
      });
      expect(scale.getLabelFormat(100)).toBe('100K');
    });

    it('formatter가 문자열을 반환하지 않으면 기본 포맷을 사용한다', () => {
      const scale = createScale({
        formatter: () => 123,
      });
      const result = scale.getLabelFormat(100);
      expect(typeof result).toBe('string');
    });
  });
});
