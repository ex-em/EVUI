import { describe, it, expect } from 'vitest';
import modules from './model.series';

describe('model.series', () => {
  describe('getOverlappingSeriesKeys', () => {
    it('bar 시리즈를 groups 역순으로 정렬한다', () => {
      const series = {
        s1: { type: 'bar' },
        s2: { type: 'bar' },
        s3: { type: 'bar' },
      };
      const groups = [['s1', 's2', 's3']];
      const result = modules.getOverlappingSeriesKeys(series, 'bar', groups);
      expect(result).toEqual(['s3', 's2', 's1']);
    });

    it('non-bar 시리즈는 bar 뒤에 위치한다', () => {
      const series = {
        line1: { type: 'line' },
        bar1: { type: 'bar' },
        bar2: { type: 'bar' },
      };
      const groups = [['bar1', 'bar2']];
      const result = modules.getOverlappingSeriesKeys(series, 'bar', groups);
      expect(result[result.length - 1]).toBe('line1');
    });

    it('groups가 비어있으면 모든 시리즈가 other로 분류된다', () => {
      const series = {
        s1: { type: 'bar' },
        s2: { type: 'bar' },
      };
      const result = modules.getOverlappingSeriesKeys(series, 'bar', []);
      expect(result).toHaveLength(2);
    });

    it('defaultType으로 타입이 결정된다', () => {
      const series = {
        s1: {},
        s2: { type: 'line' },
      };
      const groups = [['s1']];
      const result = modules.getOverlappingSeriesKeys(series, 'bar', groups);
      // s1은 default type이 bar이므로 bar로 분류
      expect(result[0]).toBe('s1');
      expect(result[1]).toBe('s2');
    });
  });
});
