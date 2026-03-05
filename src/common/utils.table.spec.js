import { describe, it, expect } from 'vitest';
import tableUtils from './utils.table';

describe('utils.table', () => {
  describe('quantity', () => {
    it('숫자 문자열을 파싱한다', () => {
      expect(tableUtils.quantity('100')).toEqual({ value: 100, unit: undefined });
    });

    it('px 단위를 파싱한다', () => {
      expect(tableUtils.quantity('100px')).toEqual({ value: 100, unit: 'px' });
    });

    it('% 단위를 파싱한다', () => {
      expect(tableUtils.quantity('50%')).toEqual({ value: 50, unit: '%' });
    });

    it('소수점을 파싱한다', () => {
      expect(tableUtils.quantity('10.5px')).toEqual({ value: 10.5, unit: 'px' });
    });

    it('숫자 타입을 파싱한다', () => {
      expect(tableUtils.quantity(100)).toEqual({ value: 100, unit: undefined });
    });

    it('유효하지 않은 문자열은 undefined를 반환한다', () => {
      expect(tableUtils.quantity('abc')).toBeUndefined();
    });

    it('객체는 undefined를 반환한다', () => {
      expect(tableUtils.quantity({})).toBeUndefined();
    });

    it('null은 undefined를 반환한다', () => {
      expect(tableUtils.quantity(null)).toBeUndefined();
    });
  });

  describe('numberToPixel', () => {
    it('숫자 문자열을 px로 변환한다', () => {
      expect(tableUtils.numberToPixel('100')).toBe('100px');
    });

    it('px 단위는 그대로 반환한다', () => {
      expect(tableUtils.numberToPixel('100px')).toBe('100px');
    });

    it('% 단위는 그대로 반환한다', () => {
      expect(tableUtils.numberToPixel('50%')).toBe('50%');
    });

    it('숫자 타입을 px로 변환한다', () => {
      expect(tableUtils.numberToPixel(200)).toBe('200px');
    });

    it('유효하지 않은 값은 undefined를 반환한다', () => {
      expect(tableUtils.numberToPixel('abc')).toBeUndefined();
    });

    it('객체는 undefined를 반환한다', () => {
      expect(tableUtils.numberToPixel({})).toBeUndefined();
    });
  });

  describe('isPercentValue', () => {
    it('% 포함 문자열은 true를 반환한다', () => {
      expect(tableUtils.isPercentValue('50%')).toBe(true);
    });

    it('% 없는 문자열은 false를 반환한다', () => {
      expect(tableUtils.isPercentValue('50px')).toBe(false);
    });

    it('숫자 타입은 false를 반환한다', () => {
      expect(tableUtils.isPercentValue(50)).toBe(false);
    });

    it('빈 문자열은 true를 반환한다 (edge case)', () => {
      // indexOf('%') === -1, length - 1 === -1 이므로 true 반환
      expect(tableUtils.isPercentValue('')).toBe(true);
    });
  });

  describe('checkColSize', () => {
    it('min보다 작으면 min을 반환한다', () => {
      expect(tableUtils.checkColSize(10, 50, 200)).toBe(50);
    });

    it('max보다 크면 max를 반환한다', () => {
      expect(tableUtils.checkColSize(300, 50, 200)).toBe(200);
    });

    it('범위 안이면 그대로 반환한다', () => {
      expect(tableUtils.checkColSize(100, 50, 200)).toBe(100);
    });

    it('min이 없으면 min 체크를 건너뛴다', () => {
      expect(tableUtils.checkColSize(10, null, 200)).toBe(10);
    });

    it('max가 없으면 max 체크를 건너뛴다', () => {
      expect(tableUtils.checkColSize(300, 50, null)).toBe(300);
    });
  });
});
