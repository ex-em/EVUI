import { describe, it, expect } from 'vitest';
import TimeCategoryScale from './scale.time.category';

const createScale = (overrides = {}) => {
  const scale = Object.create(TimeCategoryScale.prototype);
  scale.interval = null;
  scale.labels = [];
  Object.assign(scale, overrides);
  return scale;
};

describe('TimeCategoryScale', () => {
  describe('getInterval', () => {
    it('사용자 지정 interval이 숫자이면 그대로 반환한다', () => {
      const scale = createScale({ interval: 3600000 });
      const result = scale.getInterval({ maxValue: 100000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(3600000);
    });

    it('사용자 지정 interval이 문자열이면 TIME_INTERVALS에서 조회한다', () => {
      const scale = createScale({ interval: 'second' });
      const result = scale.getInterval({ maxValue: 10000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(1000);
    });

    it('사용자 지정 interval이 객체이면 time * unit size로 계산한다', () => {
      const scale = createScale({ interval: { time: 5, unit: 'minute' } });
      const result = scale.getInterval({ maxValue: 600000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(5 * 60000);
    });

    it('interval이 없으면 범위/step으로 계산한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(20);
    });

    it('나누어 떨어지지 않으면 ceil 처리한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 3 });
      expect(result).toBe(34);
    });
  });
});
