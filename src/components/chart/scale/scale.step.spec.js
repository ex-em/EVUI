import { describe, it, expect } from 'vitest';
import StepScale from './scale.step';

const createScale = (overrides = {}) => {
  const scale = Object.create(StepScale.prototype);
  scale.labels = [];
  scale.interval = null;
  Object.assign(scale, overrides);
  return scale;
};

describe('StepScale', () => {
  describe('getIndexInterval', () => {
    it('labels 수를 step으로 나눈 인터벌을 반환한다', () => {
      const scale = createScale({
        labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      });
      const result = scale.getIndexInterval({ maxSteps: 5 });
      expect(result).toBe(2);
    });

    it('사용자 지정 interval이 있으면 그대로 반환한다', () => {
      const scale = createScale({
        labels: ['a', 'b', 'c', 'd', 'e'],
        interval: 3,
      });
      expect(scale.getIndexInterval({ maxSteps: 5 })).toBe(3);
    });

    it('labels가 step보다 적으면 1을 반환한다', () => {
      const scale = createScale({
        labels: ['a', 'b'],
      });
      expect(scale.getIndexInterval({ maxSteps: 5 })).toBe(1);
    });

    it('labels가 비어있으면 0을 반환한다', () => {
      const scale = createScale({ labels: [] });
      expect(scale.getIndexInterval({ maxSteps: 5 })).toBe(0);
    });
  });
});
