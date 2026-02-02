import { describe, it, expect } from 'vitest';
import Canvas from './helpers.canvas';

describe('helpers.canvas', () => {
  describe('calculateX', () => {
    it('should calculate X position within range', () => {
      // Area of 100 pixels, min 0, max 100
      // Value 50 should be at position 50
      expect(Canvas.calculateX(50, 0, 100, 100)).toBe(50);
      expect(Canvas.calculateX(0, 0, 100, 100)).toBe(0);
      expect(Canvas.calculateX(100, 0, 100, 100)).toBe(100);
    });

    it('should handle startPoint offset', () => {
      // Area of 100 pixels starting at position 50
      expect(Canvas.calculateX(0, 0, 100, 100, 50)).toBe(50);
      expect(Canvas.calculateX(50, 0, 100, 100, 50)).toBe(100);
    });

    it('should return null for null/undefined values', () => {
      expect(Canvas.calculateX(null, 0, 100, 100)).toBe(null);
      expect(Canvas.calculateX(undefined, 0, 100, 100)).toBe(null);
    });

    it('should return null for values outside range', () => {
      expect(Canvas.calculateX(150, 0, 100, 100)).toBe(null);
      expect(Canvas.calculateX(-10, 0, 100, 100)).toBe(null);
    });

    it('should handle negative min/max ranges', () => {
      // Range from -100 to 100, area of 200 pixels
      expect(Canvas.calculateX(0, -100, 100, 200)).toBe(100);
      expect(Canvas.calculateX(-100, -100, 100, 200)).toBe(0);
      expect(Canvas.calculateX(100, -100, 100, 200)).toBe(200);
    });

    it('should ceil the result', () => {
      // Value that would produce non-integer result
      expect(Canvas.calculateX(33, 0, 100, 100)).toBe(33);
      expect(Canvas.calculateX(33.3, 0, 100, 100)).toBe(34);
    });
  });

  describe('calculateSubX', () => {
    it('should calculate X position without range validation', () => {
      expect(Canvas.calculateSubX(50, 0, 100, 100)).toBe(50);
      expect(Canvas.calculateSubX(0, 0, 100, 100)).toBe(0);
    });

    it('should handle startPoint offset', () => {
      expect(Canvas.calculateSubX(0, 0, 100, 100, 50)).toBe(50);
      expect(Canvas.calculateSubX(50, 0, 100, 100, 50)).toBe(100);
    });

    it('should return null for null/undefined values', () => {
      expect(Canvas.calculateSubX(null, 0, 100, 100)).toBe(null);
      expect(Canvas.calculateSubX(undefined, 0, 100, 100)).toBe(null);
    });

    it('should NOT return null for values outside range (unlike calculateX)', () => {
      // calculateSubX doesn't validate range - it's for timebar
      expect(Canvas.calculateSubX(150, 0, 100, 100)).toBe(150);
      expect(Canvas.calculateSubX(-10, 0, 100, 100)).toBe(-10);
    });
  });

  describe('calculateY', () => {
    it('should calculate Y position (inverted) within range', () => {
      // Y is inverted (higher values = lower on screen)
      // Area of 100, startPoint at 100
      // Value 0 at min should be at startPoint (100)
      // Value 100 at max should be at 0
      expect(Canvas.calculateY(0, 0, 100, 100, 100)).toBe(100);
      expect(Canvas.calculateY(100, 0, 100, 100, 100)).toBe(0);
      expect(Canvas.calculateY(50, 0, 100, 100, 100)).toBe(50);
    });

    it('should return null for null/undefined values', () => {
      expect(Canvas.calculateY(null, 0, 100, 100)).toBe(null);
      expect(Canvas.calculateY(undefined, 0, 100, 100)).toBe(null);
    });

    it('should return null for values outside range', () => {
      expect(Canvas.calculateY(150, 0, 100, 100, 100)).toBe(null);
      expect(Canvas.calculateY(-10, 0, 100, 100, 100)).toBe(null);
    });

    it('should handle negative ranges', () => {
      // Range from -100 to 100, area of 200, startPoint 200
      expect(Canvas.calculateY(0, -100, 100, 200, 200)).toBe(100);
      expect(Canvas.calculateY(-100, -100, 100, 200, 200)).toBe(200);
      expect(Canvas.calculateY(100, -100, 100, 200, 200)).toBe(0);
    });

    it('should handle no startPoint (default 0)', () => {
      // Without startPoint, result is negative
      expect(Canvas.calculateY(50, 0, 100, 100)).toBe(-50);
      expect(Canvas.calculateY(100, 0, 100, 100)).toBe(-100);
    });

    it('should floor the result', () => {
      expect(Canvas.calculateY(33.7, 0, 100, 100, 100)).toBe(66);
    });
  });

  describe('roundedRect', () => {
    it('should handle no radius (draws regular rect)', () => {
      const ctx = {
        rect: () => {},
        moveTo: () => {},
        arc: () => {},
        closePath: () => {},
      };

      // Just verify it doesn't throw
      expect(() => Canvas.roundedRect(ctx, 0, 0, 100, 100, 0)).not.toThrow();
    });

    it('should handle radius larger than dimensions', () => {
      const ctx = {
        rect: () => {},
        moveTo: () => {},
        arc: () => {},
        closePath: () => {},
      };

      // Radius is clamped to half of smaller dimension
      expect(() => Canvas.roundedRect(ctx, 0, 0, 50, 100, 100)).not.toThrow();
    });
  });
});
