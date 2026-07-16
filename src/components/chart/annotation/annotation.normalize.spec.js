import { describe, it, expect } from 'vitest';
import { normalizeAnnotations, normalizePadding } from './annotation.normalize';

describe('annotation.normalize', () => {
  describe('normalizePadding', () => {
    it('number -> 4-tuple', () => {
      expect(normalizePadding(5)).toEqual([5, 5, 5, 5]);
    });
    it('[a] -> [a, a, a, a]', () => {
      expect(normalizePadding([5])).toEqual([5, 5, 5, 5]);
    });
    it('[v, h] -> [v, h, v, h]', () => {
      expect(normalizePadding([6, 10])).toEqual([6, 10, 6, 10]);
    });
    it('[t, h, b] -> [t, h, b, h]', () => {
      expect(normalizePadding([12, 8, 20])).toEqual([12, 8, 20, 8]);
    });
    it('[t, r, b, l] -> as-is', () => {
      expect(normalizePadding([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });
    it('clamps negative values to 0', () => {
      expect(normalizePadding(-5)).toEqual([0, 0, 0, 0]);
      expect(normalizePadding([-1, 4])).toEqual([0, 4, 0, 4]);
    });
    it('invalid -> zeros', () => {
      expect(normalizePadding(undefined)).toEqual([0, 0, 0, 0]);
      expect(normalizePadding('x')).toEqual([0, 0, 0, 0]);
    });
  });

  describe('normalizeAnnotations', () => {
    it('non-array input returns empty', () => {
      expect(normalizeAnnotations(null).annotations).toEqual([]);
      expect(normalizeAnnotations(undefined).annotations).toEqual([]);
    });

    it('applies type-based default config via deepMerge', () => {
      const { annotations } = normalizeAnnotations([{ type: 'badge', content: 'Hi' }]);
      const a = annotations[0];
      expect(a.style.backgroundColor).toBe('#FDF0F0');
      expect(a.style.borderRadius).toBe(6);
      expect(a.style.padding).toEqual([6, 10, 6, 10]);
    });

    it('user style overrides default but keeps untouched defaults', () => {
      const { annotations } = normalizeAnnotations([
        { type: 'badge', content: 'Hi', style: { backgroundColor: '#000' } },
      ]);
      expect(annotations[0].style.backgroundColor).toBe('#000');
      expect(annotations[0].style.borderColor).toBe('#B24C4C'); // default kept
    });

    it('user padding is not contaminated by default via array index merge', () => {
      // 사용자 [5](균일 의도) + badge 기본 [6,10] → 예전엔 [5,10,5,10] 로 오염됐다. 이제 [5,5,5,5].
      const { annotations } = normalizeAnnotations([
        { type: 'badge', content: 'Hi', style: { padding: [5] } },
      ]);
      expect(annotations[0].style.padding).toEqual([5, 5, 5, 5]);
    });

    it('user 3-value padding is preserved (not dropped to zeros)', () => {
      const { annotations } = normalizeAnnotations([
        { type: 'badge', content: 'Hi', style: { padding: [12, 8, 20] } },
      ]);
      expect(annotations[0].style.padding).toEqual([12, 8, 20, 8]);
    });

    it('clamps negative circle radius to 0 with warning', () => {
      const { annotations, warnings } = normalizeAnnotations([{ type: 'circle', style: { radius: -5 } }]);
      expect(annotations[0].style.radius).toBe(0);
      expect(warnings.some(w => w.includes('radius must be'))).toBe(true);
    });

    it('generates id when missing, preserves provided id', () => {
      const { annotations } = normalizeAnnotations([{ type: 'text' }, { id: 'x', type: 'text' }]);
      expect(annotations[0].id).toBe('annotation-0');
      expect(annotations[1].id).toBe('x');
    });

    it('unknown type falls back to text with warning', () => {
      const { annotations, warnings } = normalizeAnnotations([{ type: 'bogus' }]);
      expect(annotations[0].type).toBe('text');
      expect(warnings.some(w => w.includes('unknown type'))).toBe(true);
    });

    it('callout forces connector off with warning', () => {
      const { annotations, warnings } = normalizeAnnotations([
        { type: 'callout', content: 'C', connector: { enabled: true } },
      ]);
      expect(annotations[0].connector.enabled).toBe(false);
      expect(warnings.some(w => w.includes('connector is ignored'))).toBe(true);
    });

    it('non-callout keeps connector enabled', () => {
      const { annotations } = normalizeAnnotations([
        { type: 'badge', content: 'B', connector: { enabled: true } },
      ]);
      expect(annotations[0].connector.enabled).toBe(true);
    });

    it('circle ignores content', () => {
      const { annotations } = normalizeAnnotations([{ type: 'circle', content: 'ignored' }]);
      expect(annotations[0].content).toBe('');
    });

    it('keeps function content as-is', () => {
      const fn = () => 'dynamic';
      const { annotations } = normalizeAnnotations([{ type: 'text', content: fn }]);
      expect(annotations[0].content).toBe(fn);
    });

    it('warns on axis position without xValue/yValue', () => {
      const { warnings } = normalizeAnnotations([{ type: 'text', position: { type: 'axis' } }]);
      expect(warnings.some(w => w.includes('requires both xValue and yValue'))).toBe(true);
    });

    it('warns on axis position with only one of xValue/yValue (single-axis unsupported)', () => {
      const onlyX = normalizeAnnotations([{ type: 'text', position: { type: 'axis', xValue: 50 } }]);
      expect(onlyX.warnings.some(w => w.includes('requires both xValue and yValue'))).toBe(true);
      const onlyY = normalizeAnnotations([{ type: 'text', position: { type: 'axis', yValue: 50 } }]);
      expect(onlyY.warnings.some(w => w.includes('requires both xValue and yValue'))).toBe(true);
    });

    it('no axis warning when both xValue and yValue are given', () => {
      const { warnings } = normalizeAnnotations([
        { type: 'text', position: { type: 'axis', xValue: 10, yValue: 20 } },
      ]);
      expect(warnings.some(w => w.includes('requires both xValue and yValue'))).toBe(false);
    });

    it('warns on series position without seriesId and invalid location', () => {
      const { annotations, warnings } = normalizeAnnotations([
        { type: 'text', position: { type: 'series', location: 'middle' } },
      ]);
      expect(warnings.some(w => w.includes('requires seriesId'))).toBe(true);
      expect(annotations[0].position.location).toBe('end'); // fallback
    });

    it('warns on duplicate ids', () => {
      const { warnings } = normalizeAnnotations([
        { id: 'dup', type: 'text' },
        { id: 'dup', type: 'text' },
      ]);
      expect(warnings.some(w => w.includes('duplicate id'))).toBe(true);
    });

    it('defaults position type to pixel with offsets', () => {
      const { annotations } = normalizeAnnotations([{ type: 'text' }]);
      expect(annotations[0].position.type).toBe('pixel');
      expect(annotations[0].position.offsetX).toBe(0);
      expect(annotations[0].position.offsetY).toBe(0);
    });
  });
});
