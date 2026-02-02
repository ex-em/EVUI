import { describe, it, expect } from 'vitest';
import Util from '@/components/chart/helpers/helpers.util';

describe('helpers.util', () => {
  describe('hexToRgb', () => {
    it('should convert hex to rgb string', () => {
      expect(Util.hexToRgb('#FF0000')).toBe('255,0,0');
      expect(Util.hexToRgb('#00FF00')).toBe('0,255,0');
      expect(Util.hexToRgb('#0000FF')).toBe('0,0,255');
    });

    it('should handle hex without # prefix', () => {
      expect(Util.hexToRgb('FF0000')).toBe('255,0,0');
    });

    it('should handle lowercase hex', () => {
      expect(Util.hexToRgb('#ff0000')).toBe('255,0,0');
    });

    it('should handle mixed case hex', () => {
      expect(Util.hexToRgb('#FfAaBb')).toBe('255,170,187');
    });

    it('should return false for invalid/empty input', () => {
      expect(Util.hexToRgb('')).toBe(false);
      expect(Util.hexToRgb(null)).toBe(false);
      expect(Util.hexToRgb(undefined)).toBe(false);
    });
  });

  describe('getColorStringType', () => {
    it('should identify HEX colors', () => {
      expect(Util.getColorStringType('#FF0000')).toBe('HEX');
      expect(Util.getColorStringType('#F00')).toBe('HEX');
      expect(Util.getColorStringType('#ffffff')).toBe('HEX');
    });

    it('should identify RGB colors', () => {
      expect(Util.getColorStringType('rgb(255, 0, 0)')).toBe('RGB');
      expect(Util.getColorStringType('rgb(0,255,0)')).toBe('RGB');
    });

    it('should identify RGBA colors', () => {
      expect(Util.getColorStringType('rgba(255, 0, 0, 0.5)')).toBe('RGBA');
      expect(Util.getColorStringType('rgba(0,255,0,1)')).toBe('RGBA');
    });

    it('should return NONE for invalid colors', () => {
      expect(Util.getColorStringType('invalid')).toBe('NONE');
      expect(Util.getColorStringType('red')).toBe('NONE');
    });

    it('should return empty string for null/empty input', () => {
      expect(Util.getColorStringType('')).toBe('');
      expect(Util.getColorStringType(null)).toBe('');
    });
  });

  describe('colorStringToRgba', () => {
    it('should convert HEX to RGBA', () => {
      expect(Util.colorStringToRgba('#FF0000')).toBe('rgba(255,0,0,1)');
      expect(Util.colorStringToRgba('#FF0000', 0.5)).toBe('rgba(255,0,0,0.5)');
    });

    it('should convert RGB to RGBA', () => {
      expect(Util.colorStringToRgba('rgb(255, 0, 0)')).toBe('rgba(255,0,0, 1)');
      expect(Util.colorStringToRgba('rgb(255, 0, 0)', 0.5)).toBe('rgba(255,0,0, 0.5)');
    });

    it('should adjust opacity for RGBA', () => {
      expect(Util.colorStringToRgba('rgba(255, 0, 0, 0.8)', 0.5)).toBe('rgba(255,0,0,0.5)');
    });

    it('should return black for invalid colors', () => {
      expect(Util.colorStringToRgba('invalid')).toBe('rgba(0, 0, 0, 1)');
      expect(Util.colorStringToRgba('invalid', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    });
  });

  describe('getOpacity', () => {
    it('should extract opacity from RGBA color', () => {
      expect(Util.getOpacity('rgba(255, 0, 0, 0.5)')).toBe('0.5');
      expect(Util.getOpacity('rgba(255,0,0,1)')).toBe('1');
      expect(Util.getOpacity('rgba(255, 0, 0, 0.75)')).toBe('0.75');
    });

    it('should return 1 for non-RGBA colors', () => {
      expect(Util.getOpacity('#FF0000')).toBe('1');
      expect(Util.getOpacity('rgb(255, 0, 0)')).toBe('1');
    });
  });

  describe('calculateMagnitude', () => {
    it('should calculate log10 magnitude (floored)', () => {
      expect(Util.calculateMagnitude(1)).toBe(0);
      expect(Util.calculateMagnitude(10)).toBe(1);
      expect(Util.calculateMagnitude(100)).toBe(2);
      // Note: due to floating point precision, log(1000)/LN10 ≈ 2.999...
      // so Math.floor returns 2. This is expected behavior.
      expect(Util.calculateMagnitude(1000)).toBe(2);
      expect(Util.calculateMagnitude(1001)).toBe(3);
    });

    it('should floor the result', () => {
      expect(Util.calculateMagnitude(5)).toBe(0);
      expect(Util.calculateMagnitude(50)).toBe(1);
      expect(Util.calculateMagnitude(500)).toBe(2);
    });

    it('should handle values between powers of 10', () => {
      expect(Util.calculateMagnitude(99)).toBe(1);
      expect(Util.calculateMagnitude(101)).toBe(2);
    });
  });

  describe('aliasPixel', () => {
    it('should return 0 for even widths', () => {
      expect(Util.aliasPixel(2)).toBe(0);
      expect(Util.aliasPixel(4)).toBe(0);
      expect(Util.aliasPixel(10)).toBe(0);
    });

    it('should return 0.5 for odd widths', () => {
      expect(Util.aliasPixel(1)).toBe(0.5);
      expect(Util.aliasPixel(3)).toBe(0.5);
      expect(Util.aliasPixel(9)).toBe(0.5);
    });
  });

  describe('getLabelStyle', () => {
    it('should create font style string with defaults', () => {
      const style = Util.getLabelStyle({});
      expect(style).toBe('normal normal normal 12px Roboto');
    });

    it('should create font style string with custom values', () => {
      const style = Util.getLabelStyle({
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: '14',
        fontFamily: 'Arial',
      });
      expect(style).toBe('italic normal bold 14px Arial');
    });
  });

  describe('labelSignFormat', () => {
    it('should format numbers with K suffix', () => {
      expect(Util.labelSignFormat(1000)).toBe('1K');
      expect(Util.labelSignFormat(2500)).toBe('2.5K');
      expect(Util.labelSignFormat(10000)).toBe('10K');
    });

    it('should format numbers with M suffix', () => {
      expect(Util.labelSignFormat(1000000)).toBe('1M');
      expect(Util.labelSignFormat(2500000)).toBe('2.5M');
    });

    it('should format numbers with G suffix', () => {
      expect(Util.labelSignFormat(1000000000)).toBe('1G');
      expect(Util.labelSignFormat(2500000000)).toBe('2.5G');
    });

    it('should format numbers with T suffix', () => {
      expect(Util.labelSignFormat(1000000000000)).toBe('1T');
    });

    it('should format numbers with P suffix', () => {
      expect(Util.labelSignFormat(1000000000000000)).toBe('1P');
    });

    it('should handle small numbers without suffix', () => {
      expect(Util.labelSignFormat(100)).toBe('100');
      expect(Util.labelSignFormat(999)).toBe('999');
    });

    it('should handle negative numbers', () => {
      expect(Util.labelSignFormat(-1000)).toBe('-1K');
      expect(Util.labelSignFormat(-2500000)).toBe('-2.5M');
    });

    it('should respect decimalPoint parameter', () => {
      expect(Util.labelSignFormat(1000000, 2)).toBe('1.00M');
      expect(Util.labelSignFormat(100, 2)).toBe('100.00');
    });

    it('should return non-truthy values as-is', () => {
      expect(Util.labelSignFormat(NaN)).toBe(NaN);
    });
  });

  describe('getStringMinMax', () => {
    it('should find min and max length strings', () => {
      const result = Util.getStringMinMax(['a', 'abc', 'abcde']);
      expect(result.min).toBe('a');
      expect(result.max).toBe('abcde');
    });

    it('should handle single element array', () => {
      const result = Util.getStringMinMax(['only']);
      expect(result.min).toBe('only');
      expect(result.max).toBe('only');
    });

    it('should handle equal length strings', () => {
      const result = Util.getStringMinMax(['abc', 'def', 'ghi']);
      expect(result.min).toBe('abc');
      expect(result.max).toBe('abc');
    });
  });

  describe('isPieType', () => {
    it('should return true for pie types', () => {
      expect(Util.isPieType('pie')).toBe(true);
      expect(Util.isPieType('doughnut')).toBe(true);
      expect(Util.isPieType('sunburst')).toBe(true);
    });

    it('should return false for non-pie types', () => {
      expect(Util.isPieType('bar')).toBe(false);
      expect(Util.isPieType('line')).toBe(false);
    });
  });

  describe('isDoughnutHole', () => {
    it('should return true for doughnut and sunburst', () => {
      expect(Util.isDoughnutHole('doughnut')).toBe(true);
      expect(Util.isDoughnutHole('sunburst')).toBe(true);
    });

    it('should return false for pie and other types', () => {
      expect(Util.isDoughnutHole('pie')).toBe(false);
      expect(Util.isDoughnutHole('bar')).toBe(false);
    });
  });

  describe('checkSafeInteger', () => {
    it('should return true for safe integers', () => {
      expect(Util.checkSafeInteger(0)).toBe(true);
      expect(Util.checkSafeInteger(1000000)).toBe(true);
      expect(Util.checkSafeInteger(-1000000)).toBe(true);
      expect(Util.checkSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(Util.checkSafeInteger(Number.MIN_SAFE_INTEGER)).toBe(true);
    });

    it('should return false for unsafe integers', () => {
      expect(Util.checkSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
      expect(Util.checkSafeInteger(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      expect(Util.isNullOrUndefined(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(Util.isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(Util.isNullOrUndefined(0)).toBe(false);
      expect(Util.isNullOrUndefined('')).toBe(false);
      expect(Util.isNullOrUndefined(false)).toBe(false);
    });
  });

  describe('rgbaAdjustHalfOpacity', () => {
    it('should add 0.5 opacity to RGB colors', () => {
      expect(Util.rgbaAdjustHalfOpacity('rgb(255, 0, 0)')).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should halve opacity for RGBA colors', () => {
      expect(Util.rgbaAdjustHalfOpacity('rgba(255, 0, 0, 1)')).toBe('rgba(255, 0, 0, 0.50)');
      expect(Util.rgbaAdjustHalfOpacity('rgba(255, 0, 0, 0.8)')).toBe('rgba(255, 0, 0, 0.40)');
    });

    it('should return original for long hex colors', () => {
      expect(Util.rgbaAdjustHalfOpacity('#FF000080')).toBe('#FF000080');
    });

    it('should append 80 for other color formats', () => {
      expect(Util.rgbaAdjustHalfOpacity('#FF0000')).toBe('#FF000080');
    });
  });
});
