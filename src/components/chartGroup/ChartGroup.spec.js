import { describe, it, expect } from 'vitest';
import EvChartGroup from './ChartGroup.vue';

describe('EvChartGroup Component', () => {
  describe('기본값', () => {
    it('컴포넌트 이름이 EvChartGroup이다', () => {
      expect(EvChartGroup.name).toBe('EvChartGroup');
    });

    it('기본 options는 빈 객체이다', () => {
      expect(EvChartGroup.props.options.default()).toEqual({});
    });

    it('기본 zoomStartIdx는 0이다', () => {
      expect(EvChartGroup.props.zoomStartIdx.default).toBe(0);
    });

    it('기본 zoomEndIdx는 0이다', () => {
      expect(EvChartGroup.props.zoomEndIdx.default).toBe(0);
    });

    it('기본 groupSelectedLabel은 null이다', () => {
      expect(EvChartGroup.props.groupSelectedLabel.default).toBeNull();
    });
  });
});
