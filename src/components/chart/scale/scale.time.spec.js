import dayjs from 'dayjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Util from '../helpers/helpers.util';
import TimeScale from './scale.time';

const createScale = (overrides = {}) => {
  const scale = Object.create(TimeScale.prototype);
  scale.interval = null;
  scale.range = null;
  scale.labelStyle = {};
  scale.options = { type: 'line' };
  Object.assign(scale, overrides);
  return scale;
};

beforeEach(() => {
  vi.spyOn(Util, 'calcTextSizeCanvas').mockReturnValue({ width: 2, height: 2 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TimeScale', () => {
  describe('calculateScaleRange', () => {
    it('데이터 범위가 없고 사용자 range도 없으면 빈 축 범위를 반환한다', () => {
      const scale = createScale();

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBeNull();
      expect(result.max).toBeNull();
      expect(result.minLabel).toBe('');
      expect(result.maxLabel).toBe('');
    });

    it('사용자 range가 있으면 데이터가 없어도 지정 범위를 유지한다', () => {
      const scale = createScale({
        range: [0, 3600000],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(0);
      expect(result.max).toBe(3600000);
    });

    it('사용자 range가 dayjs 객체여도 timestamp로 정규화한다', () => {
      const start = dayjs().subtract(1, 'hour');
      const end = dayjs();
      const scale = createScale({
        range: [start, end],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(start.valueOf());
      expect(result.max).toBe(end.valueOf());
    });

    it('사용자 range가 문자열이어도 timestamp로 정규화한다', () => {
      const start = '2026-04-07 13:00:00';
      const end = '2026-04-07 14:00:00';
      const scale = createScale({
        range: [start, end],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(dayjs(start).valueOf());
      expect(result.max).toBe(dayjs(end).valueOf());
    });
  });

  describe('calculateSteps', () => {
    it('축 범위가 비어 있으면 tick을 생성하지 않는다', () => {
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: null,
        maxValue: null,
        maxSteps: 5,
      });

      expect(result).toEqual({
        steps: 0,
        interval: 0,
        graphMin: null,
        graphMax: null,
      });
    });
  });
});
