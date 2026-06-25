import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  normalizeAxisValue,
  resolveStepIndex,
  stepValueToPixel,
  axisValueToPixel,
} from './annotation.axis';

describe('annotation.axis', () => {
  describe('normalizeAxisValue', () => {
    it('linear coerces to number', () => {
      expect(normalizeAxisValue('15000', { type: 'linear' })).toBe(15000);
      expect(normalizeAxisValue(42, { type: 'linear' })).toBe(42);
    });
    it('linear rejects non-numeric', () => {
      expect(normalizeAxisValue('abc', { type: 'linear' })).toBeNull();
      expect(normalizeAxisValue(null, { type: 'linear' })).toBeNull();
    });
    it('time parses date string to timestamp', () => {
      const expected = dayjs('2026-06-18').valueOf();
      expect(normalizeAxisValue('2026-06-18', { type: 'time' })).toBe(expected);
    });
    it('time passes through numeric timestamp', () => {
      expect(normalizeAxisValue(1718641200000, { type: 'time' })).toBe(1718641200000);
    });
    it('time rejects invalid date', () => {
      expect(normalizeAxisValue('not-a-date', { type: 'time' })).toBeNull();
    });
  });

  describe('resolveStepIndex', () => {
    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    it('finds label index', () => {
      expect(resolveStepIndex('Q2', labels)).toBe(1);
    });
    it('treats integer as raw index when not a label', () => {
      expect(resolveStepIndex(2, labels)).toBe(2);
    });
    it('returns -1 for unknown', () => {
      expect(resolveStepIndex('Q9', labels)).toBe(-1);
    });
    it('numeric labels matched by value', () => {
      expect(resolveStepIndex(2020, [2018, 2019, 2020, 2021])).toBe(2);
    });
    it('tolerates non-array labels without throwing', () => {
      expect(resolveStepIndex('Q2', undefined)).toBe(-1);
      expect(resolveStepIndex('Q2', { x: [], y: [] })).toBe(-1);
      expect(resolveStepIndex(1, { x: [] })).toBe(1); // 정수는 raw 인덱스로
    });
  });

  describe('stepValueToPixel', () => {
    // 4 categories over area 400 from startPoint 100 => slot 100, centers at 150,250,350,450
    const axis = { type: 'step', labels: ['Q1', 'Q2', 'Q3', 'Q4'], minIndex: 0, maxIndex: 3 };
    it('places category at slot center (x)', () => {
      expect(stepValueToPixel('Q1', axis, 400, 100, true)).toBe(150);
      expect(stepValueToPixel('Q2', axis, 400, 100, true)).toBe(250);
      expect(stepValueToPixel('Q4', axis, 400, 100, true)).toBe(450);
    });
    it('y axis goes upward from bottom startPoint', () => {
      // startPoint 500 (bottom), slot 100, Q1 center => 500 - 50 = 450
      expect(stepValueToPixel('Q1', axis, 400, 500, false)).toBe(450);
    });
    it('hides when index outside visible window', () => {
      const zoomed = { type: 'step', labels: ['Q1', 'Q2', 'Q3', 'Q4'], minIndex: 1, maxIndex: 2 };
      expect(stepValueToPixel('Q1', zoomed, 400, 100, true)).toBeNull();
      expect(stepValueToPixel('Q4', zoomed, 400, 100, true)).toBeNull();
      expect(stepValueToPixel('Q2', zoomed, 400, 100, true)).not.toBeNull();
    });
    it('hides unknown label', () => {
      expect(stepValueToPixel('Q9', axis, 400, 100, true)).toBeNull();
    });
  });

  describe('axisValueToPixel', () => {
    it('linear matches calculateX (value 50 over [0,100], area 300, start 100 => 250)', () => {
      const axis = { type: 'linear', graphMin: 0, graphMax: 100 };
      expect(axisValueToPixel(50, axis, 300, 100, true)).toBe(250);
    });
    it('linear out of range -> null', () => {
      const axis = { type: 'linear', graphMin: 0, graphMax: 100 };
      expect(axisValueToPixel(200, axis, 300, 100, true)).toBeNull();
    });
    it('time string maps within range', () => {
      // 프로덕션과 동일하게 dayjs 로 경계 계산(시간대 일관성)
      const min = dayjs('2026-06-01').valueOf();
      const max = dayjs('2026-06-30').valueOf();
      const axis = { type: 'time', graphMin: min, graphMax: max };
      const px = axisValueToPixel('2026-06-01', axis, 290, 0, true);
      expect(px).toBe(0); // at min
      expect(axisValueToPixel('2026-07-15', axis, 290, 0, true)).toBeNull(); // beyond max
    });
    it('defaults to linear when type omitted (axesSteps fallback compat)', () => {
      const axis = { graphMin: 0, graphMax: 100 };
      expect(axisValueToPixel(50, axis, 300, 100, true)).toBe(250);
    });
    it('null axis -> null', () => {
      expect(axisValueToPixel(1, null, 100, 0, true)).toBeNull();
    });
  });
});
