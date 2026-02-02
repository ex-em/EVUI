import { describe, it, expect } from 'vitest';
import { bnPlus, bnMinus, bnMultiply, bnDivide, bnFloor } from './utils.bignumber';

describe('utils.bignumber', () => {
  describe('bnPlus', () => {
    it('should add two positive numbers', () => {
      expect(bnPlus(1, 2)).toBe(3);
      expect(bnPlus(100, 200)).toBe(300);
    });

    it('should handle negative numbers', () => {
      expect(bnPlus(-1, 2)).toBe(1);
      expect(bnPlus(-1, -2)).toBe(-3);
    });

    it('should handle decimal numbers without floating point errors', () => {
      // 0.1 + 0.2 should be exactly 0.3 with BigNumber
      expect(bnPlus(0.1, 0.2)).toBe(0.3);
      expect(bnPlus(0.1, 0.7)).toBe(0.8);
    });

    it('should handle zero', () => {
      expect(bnPlus(0, 5)).toBe(5);
      expect(bnPlus(5, 0)).toBe(5);
    });

    it('should handle very large numbers', () => {
      expect(bnPlus(1e15, 1e15)).toBe(2e15);
    });
  });

  describe('bnMinus', () => {
    it('should subtract two positive numbers', () => {
      expect(bnMinus(5, 3)).toBe(2);
      expect(bnMinus(100, 50)).toBe(50);
    });

    it('should handle negative results', () => {
      expect(bnMinus(3, 5)).toBe(-2);
    });

    it('should handle decimal numbers without floating point errors', () => {
      expect(bnMinus(0.3, 0.1)).toBe(0.2);
      expect(bnMinus(1, 0.1)).toBe(0.9);
    });

    it('should handle zero', () => {
      expect(bnMinus(5, 0)).toBe(5);
      expect(bnMinus(0, 5)).toBe(-5);
    });
  });

  describe('bnMultiply', () => {
    it('should multiply two positive numbers', () => {
      expect(bnMultiply(3, 4)).toBe(12);
      expect(bnMultiply(10, 10)).toBe(100);
    });

    it('should handle negative numbers', () => {
      expect(bnMultiply(-3, 4)).toBe(-12);
      expect(bnMultiply(-3, -4)).toBe(12);
    });

    it('should handle decimal numbers without floating point errors', () => {
      expect(bnMultiply(0.1, 0.2)).toBe(0.02);
      expect(bnMultiply(0.1, 3)).toBe(0.3);
    });

    it('should handle zero', () => {
      expect(bnMultiply(5, 0)).toBe(0);
      expect(bnMultiply(0, 5)).toBe(0);
    });

    it('should handle very large numbers', () => {
      expect(bnMultiply(1e7, 1e7)).toBe(1e14);
    });
  });

  describe('bnDivide', () => {
    it('should divide two positive numbers', () => {
      expect(bnDivide(12, 4)).toBe(3);
      expect(bnDivide(100, 10)).toBe(10);
    });

    it('should handle negative numbers', () => {
      expect(bnDivide(-12, 4)).toBe(-3);
      expect(bnDivide(-12, -4)).toBe(3);
    });

    it('should handle decimal results', () => {
      expect(bnDivide(1, 3)).toBeCloseTo(0.3333, 3);
      expect(bnDivide(10, 4)).toBe(2.5);
    });

    it('should handle decimal numbers without floating point errors', () => {
      expect(bnDivide(0.3, 0.1)).toBe(3);
    });

    it('should handle division by zero', () => {
      expect(bnDivide(5, 0)).toBe(Infinity);
    });
  });

  describe('bnFloor', () => {
    it('should floor to specified decimal places', () => {
      expect(bnFloor(3.14159, 2)).toBe(3.14);
      expect(bnFloor(3.14159, 3)).toBe(3.141);
      expect(bnFloor(3.14159, 0)).toBe(3);
    });

    it('should round down (not round nearest)', () => {
      expect(bnFloor(3.999, 0)).toBe(3);
      expect(bnFloor(3.999, 2)).toBe(3.99);
    });

    it('should handle negative numbers', () => {
      expect(bnFloor(-3.14159, 2)).toBe(-3.14);
    });

    it('should handle whole numbers', () => {
      expect(bnFloor(5, 2)).toBe(5);
    });
  });
});
