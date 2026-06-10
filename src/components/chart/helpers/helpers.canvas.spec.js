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

  describe('drawPoint / drawPointBatch', () => {
    // 모든 그리기 명령을 순서대로 기록하는 mock ctx.
    const makeCtx = () => {
      const cmds = [];
      const rec =
        (name) =>
        (...args) =>
          cmds.push([name, ...args]);
      return {
        cmds,
        count: (name) => cmds.filter((c) => c[0] === name).length,
        beginPath: rec('beginPath'),
        closePath: rec('closePath'),
        moveTo: rec('moveTo'),
        lineTo: rec('lineTo'),
        arc: rec('arc'),
        fill: rec('fill'),
        stroke: rec('stroke'),
        fillRect: rec('fillRect'),
        strokeRect: rec('strokeRect'),
      };
    };

    it('drawPoint circle: beginPath→moveTo→arc→closePath→fill→stroke', () => {
      const ctx = makeCtx();
      Canvas.drawPoint(ctx, 'circle', 3, 10, 20);
      expect(ctx.cmds.map((c) => c[0])).toEqual([
        'beginPath',
        'moveTo',
        'arc',
        'closePath',
        'fill',
        'stroke',
      ]);
      // circle leading moveTo는 arc 시작점(x+radius, y)과 동일 → zero-length no-op (픽셀 불변).
      expect(ctx.cmds[1]).toEqual(['moveTo', 13, 20]);
    });

    it('drawPoint cross: stroke만 (fill 미호출)', () => {
      const ctx = makeCtx();
      Canvas.drawPoint(ctx, 'cross', 3, 10, 20);
      expect(ctx.count('fill')).toBe(0);
      expect(ctx.count('stroke')).toBe(1);
      expect(ctx.count('beginPath')).toBe(1);
    });

    it('drawPoint rect: fillRect/strokeRect, path 명령 없음', () => {
      const ctx = makeCtx();
      Canvas.drawPoint(ctx, 'rect', 3, 10, 20);
      expect(ctx.count('fillRect')).toBe(1);
      expect(ctx.count('strokeRect')).toBe(1);
      expect(ctx.count('beginPath')).toBe(0);
      expect(ctx.count('fill')).toBe(0);
      expect(ctx.count('stroke')).toBe(0);
    });

    it('drawPoint radius<=0/NaN: 아무 것도 그리지 않음', () => {
      const ctx = makeCtx();
      Canvas.drawPoint(ctx, 'circle', 0, 10, 20);
      Canvas.drawPoint(ctx, 'circle', -1, 10, 20);
      Canvas.drawPoint(ctx, 'circle', NaN, 10, 20);
      expect(ctx.cmds).toHaveLength(0);
    });

    it('drawPointBatch circle: N점이어도 beginPath/fill/stroke는 각 1회, arc는 N회', () => {
      const ctx = makeCtx();
      const points = [
        { xp: 1, yp: 2 },
        { xp: 3, yp: 4 },
        { xp: 5, yp: 6 },
      ];
      Canvas.drawPointBatch(ctx, 'circle', 3, points);
      expect(ctx.count('beginPath')).toBe(1);
      expect(ctx.count('fill')).toBe(1);
      expect(ctx.count('stroke')).toBe(1);
      expect(ctx.count('arc')).toBe(3);
      // 각 원마다 leading moveTo로 subpath를 끊어 연결선이 생기지 않게 한다.
      expect(ctx.count('moveTo')).toBe(3);
    });

    it('drawPointBatch cross: fill 미호출, stroke 1회', () => {
      const ctx = makeCtx();
      Canvas.drawPointBatch(ctx, 'cross', 3, [
        { xp: 1, yp: 2 },
        { xp: 3, yp: 4 },
      ]);
      expect(ctx.count('beginPath')).toBe(1);
      expect(ctx.count('fill')).toBe(0);
      expect(ctx.count('stroke')).toBe(1);
    });

    it('drawPointBatch rect: 점마다 fillRect/strokeRect, beginPath 없음', () => {
      const ctx = makeCtx();
      Canvas.drawPointBatch(ctx, 'rect', 3, [
        { xp: 1, yp: 2 },
        { xp: 3, yp: 4 },
      ]);
      expect(ctx.count('fillRect')).toBe(2);
      expect(ctx.count('strokeRect')).toBe(2);
      expect(ctx.count('beginPath')).toBe(0);
    });

    it('drawPointBatch 빈 배열/radius<=0: 아무 것도 그리지 않음', () => {
      const ctx = makeCtx();
      Canvas.drawPointBatch(ctx, 'circle', 3, []);
      Canvas.drawPointBatch(ctx, 'circle', 0, [{ xp: 1, yp: 2 }]);
      Canvas.drawPointBatch(ctx, 'circle', 3, undefined);
      expect(ctx.cmds).toHaveLength(0);
    });

    it('단일 점 drawPoint와 1점 batch의 path 명령 시퀀스가 동일', () => {
      const single = makeCtx();
      Canvas.drawPoint(single, 'circle', 3, 7, 8);
      const batch = makeCtx();
      Canvas.drawPointBatch(batch, 'circle', 3, [{ xp: 7, yp: 8 }]);
      expect(batch.cmds).toEqual(single.cmds);
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
