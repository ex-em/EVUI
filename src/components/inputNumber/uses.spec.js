import { describe, it, expect } from 'vitest';
import { getValueCloseToStep } from './uses';

describe('getValueCloseToStep', () => {
  describe('정수 step', () => {
    it('정확한 step 값은 그대로 반환한다', () => {
      expect(getValueCloseToStep(50, { min: 0, max: 100, step: 10 })).toBe(50);
    });

    it('step 절반보다 큰 나머지는 다음 step으로 올린다', () => {
      expect(getValueCloseToStep(56, { min: 0, max: 100, step: 10 })).toBe(60);
    });

    it('step 절반보다 작은 나머지는 이전 step으로 내린다', () => {
      expect(getValueCloseToStep(54, { min: 0, max: 100, step: 10 })).toBe(50);
    });

    it('min보다 작으면 min을 반환한다', () => {
      expect(getValueCloseToStep(-5, { min: 0, max: 100, step: 10 })).toBe(0);
    });

    it('max보다 크면 max에 가장 가까운 step 값을 반환한다', () => {
      expect(getValueCloseToStep(105, { min: 0, max: 100, step: 10 })).toBe(100);
    });

    it('min이 0이 아닌 경우에도 올바르게 계산한다', () => {
      expect(getValueCloseToStep(15, { min: 10, max: 50, step: 10 })).toBe(10);
      expect(getValueCloseToStep(26, { min: 10, max: 50, step: 10 })).toBe(30);
    });

    it('step이 1인 경우 값을 그대로 반환한다', () => {
      expect(getValueCloseToStep(7, { min: 0, max: 100, step: 1 })).toBe(7);
    });
  });

  describe('소수 step', () => {
    it('소수점 step을 올바르게 계산한다', () => {
      expect(getValueCloseToStep(0.3, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    });

    it('소수점에서 반올림이 올바르게 동작한다', () => {
      const result = getValueCloseToStep(0.15, { min: 0, max: 1, step: 0.1 });
      expect(result).toBe(0.1);
    });

    it('소수점 min과 함께 동작한다', () => {
      expect(getValueCloseToStep(0.5, { min: 0.1, max: 1, step: 0.2 })).toBe(0.5);
    });
  });
});
