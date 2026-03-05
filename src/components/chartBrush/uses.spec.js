import { describe, it, expect } from 'vitest';
import { useBrushModel } from './uses';

describe('chartBrush uses', () => {
  describe('getNormalizedBrushOptions', () => {
    const { getNormalizedBrushOptions } = useBrushModel();

    it('빈 옵션에 기본값을 적용한다', () => {
      const result = getNormalizedBrushOptions({});
      expect(result.show).toBe(true);
      expect(result.useDebounce).toBe(true);
      expect(result.chartIdx).toBe(0);
      expect(result.height).toBe(100);
      expect(result.showLabel).toBe(false);
      expect(result.useWheelMove).toBe(true);
    });

    it('사용자 옵션이 기본값을 덮어쓴다', () => {
      const result = getNormalizedBrushOptions({
        show: false,
        height: 200,
        chartIdx: 2,
      });
      expect(result.show).toBe(false);
      expect(result.height).toBe(200);
      expect(result.chartIdx).toBe(2);
    });

    it('selection 기본값이 적용된다', () => {
      const result = getNormalizedBrushOptions({});
      expect(result.selection.fillColor).toBe('#38ACEC');
      expect(result.selection.opacity).toBe(0.65);
    });

    it('selection 부분 덮어쓰기가 동작한다', () => {
      const result = getNormalizedBrushOptions({
        selection: { opacity: 0.8 },
      });
      expect(result.selection.fillColor).toBe('#38ACEC');
      expect(result.selection.opacity).toBe(0.8);
    });
  });
});
