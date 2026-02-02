import { describe, it, expect } from 'vitest';
import {
  getQuantity,
  truthyNumber,
  truthy,
  convertToPercent,
  convertToValue,
  millions,
  billions,
  trillion,
  quadrillion,
  numberWithComma,
  getPrecision,
  checkNullAndUndefined,
  getSize,
} from './utils';

describe('utils', () => {
  describe('getQuantity', () => {
    it('should parse number with px unit', () => {
      expect(getQuantity('100px')).toEqual({ value: 100, unit: 'px' });
      expect(getQuantity('50px')).toEqual({ value: 50, unit: 'px' });
    });

    it('should parse number with percent unit', () => {
      expect(getQuantity('100%')).toEqual({ value: 100, unit: '%' });
      expect(getQuantity('50%')).toEqual({ value: 50, unit: '%' });
    });

    it('should parse number without unit', () => {
      expect(getQuantity('100')).toEqual({ value: 100, unit: undefined });
      expect(getQuantity(100)).toEqual({ value: 100, unit: undefined });
    });

    it('should handle negative numbers', () => {
      expect(getQuantity('-50px')).toEqual({ value: -50, unit: 'px' });
      expect(getQuantity('-100%')).toEqual({ value: -100, unit: '%' });
    });

    it('should handle decimal numbers', () => {
      expect(getQuantity('12.5px')).toEqual({ value: 12.5, unit: 'px' });
      expect(getQuantity('33.33%')).toEqual({ value: 33.33, unit: '%' });
    });

    it('should handle "normal" keyword', () => {
      expect(getQuantity('normal')).toEqual({ value: NaN, unit: undefined });
    });

    it('should return null for invalid input', () => {
      expect(getQuantity('invalid')).toBe(null);
      expect(getQuantity('abc')).toBe(null);
      expect(getQuantity(null)).toBe(null);
      expect(getQuantity(undefined)).toBe(null);
    });
  });

  describe('getSize', () => {
    it('should return size with unit', () => {
      expect(getSize({ value: 100, unit: 'px' })).toBe('100px');
      expect(getSize({ value: 50, unit: '%' })).toBe('50%');
    });

    it('should add px as default unit if not specified', () => {
      expect(getSize({ value: 100 })).toBe('100px');
    });

    it('should return 100% if size is falsy', () => {
      expect(getSize(null)).toBe('100%');
      expect(getSize(undefined)).toBe('100%');
    });
  });

  describe('truthyNumber', () => {
    it('should return true for valid numbers', () => {
      expect(truthyNumber(0)).toBe(true);
      expect(truthyNumber(1)).toBe(true);
      expect(truthyNumber(-1)).toBe(true);
      expect(truthyNumber(0.5)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(truthyNumber(NaN)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(truthyNumber('1')).toBe(false);
      expect(truthyNumber(null)).toBe(false);
      expect(truthyNumber(undefined)).toBe(false);
    });
  });

  describe('truthy', () => {
    it('should return true if all arguments are valid numbers', () => {
      expect(truthy(1, 2, 3)).toBe(true);
      expect(truthy(0, 1, 2)).toBe(true);
    });

    it('should return false if any argument is not a valid number', () => {
      expect(truthy(1, NaN, 3)).toBe(false);
      expect(truthy(1, '2', 3)).toBe(false);
    });
  });

  describe('convertToPercent', () => {
    it('should convert value to percent', () => {
      expect(convertToPercent(50, 100)).toBe('50.00');
      expect(convertToPercent(25, 100)).toBe('25.00');
    });

    it('should handle decimal results', () => {
      expect(convertToPercent(1, 3)).toBe('33.33');
    });

    it('should return 0 for zero values', () => {
      expect(convertToPercent(0, 100)).toBe(0);
      expect(convertToPercent(50, 0)).toBe(0);
    });

    it('should return 0 for invalid values', () => {
      expect(convertToPercent(NaN, 100)).toBe(0);
      expect(convertToPercent(50, NaN)).toBe(0);
    });
  });

  describe('convertToValue', () => {
    it('should convert percent to value', () => {
      expect(convertToValue(50, 100)).toBe('50.00');
      expect(convertToValue(25, 200)).toBe('50.00');
    });

    it('should return 0 for zero values', () => {
      expect(convertToValue(0, 100)).toBe(0);
      expect(convertToValue(50, 0)).toBe(0);
    });
  });

  describe('unit multipliers', () => {
    describe('millions', () => {
      it('should multiply by 1,000,000', () => {
        expect(millions(1)).toBe(1000000);
        expect(millions(5)).toBe(5000000);
      });

      it('should return 0 for non-truthy numbers', () => {
        expect(millions(NaN)).toBe(0);
      });
    });

    describe('billions', () => {
      it('should multiply by 1,000,000,000', () => {
        expect(billions(1)).toBe(1000000000);
        expect(billions(2)).toBe(2000000000);
      });

      it('should return 0 for non-truthy numbers', () => {
        expect(billions(NaN)).toBe(0);
      });
    });

    describe('trillion', () => {
      it('should multiply by 1,000,000,000,000', () => {
        expect(trillion(1)).toBe(1000000000000);
      });

      it('should return 0 for non-truthy numbers', () => {
        expect(trillion(NaN)).toBe(0);
      });
    });

    describe('quadrillion', () => {
      it('should multiply by 1,000,000,000,000,000', () => {
        expect(quadrillion(1)).toBe(1000000000000000);
      });

      it('should return 0 for non-truthy numbers', () => {
        expect(quadrillion(NaN)).toBe(0);
      });
    });
  });

  describe('numberWithComma', () => {
    it('should add commas to large integers', () => {
      expect(numberWithComma(1000)).toBe('1,000');
      expect(numberWithComma(1000000)).toBe('1,000,000');
      expect(numberWithComma(1234567890)).toBe('1,234,567,890');
    });

    it('should handle decimal numbers', () => {
      expect(numberWithComma(1000.5)).toBe('1,000.5');
      expect(numberWithComma(1234567.89)).toBe('1,234,567.89');
    });

    it('should handle small numbers without commas', () => {
      expect(numberWithComma(100)).toBe('100');
      expect(numberWithComma(999)).toBe('999');
    });

    it('should return false for non-truthy numbers', () => {
      expect(numberWithComma(NaN)).toBe(false);
    });
  });

  describe('getPrecision', () => {
    it('should return decimal places count', () => {
      expect(getPrecision(1.5)).toBe(1);
      expect(getPrecision(1.23)).toBe(2);
      expect(getPrecision(1.234)).toBe(3);
    });

    it('should return 0 for integers', () => {
      expect(getPrecision(100)).toBe(0);
      expect(getPrecision(1)).toBe(0);
    });

    it('should handle null/undefined', () => {
      expect(getPrecision(null)).toBe(0);
      expect(getPrecision(undefined)).toBe(0);
    });
  });

  describe('checkNullAndUndefined', () => {
    it('should return true for null', () => {
      expect(checkNullAndUndefined(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(checkNullAndUndefined(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(checkNullAndUndefined(0)).toBe(false);
      expect(checkNullAndUndefined('')).toBe(false);
      expect(checkNullAndUndefined(false)).toBe(false);
      expect(checkNullAndUndefined({})).toBe(false);
    });
  });
});
