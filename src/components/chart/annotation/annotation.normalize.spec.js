import { describe, it, expect } from 'vitest';
import { normalizeAnnotations, normalizePadding } from './annotation.normalize';

describe('annotation.normalize', () => {
  describe('normalizePadding', () => {
    it('number -> 4-tuple', () => {
      expect(normalizePadding(5)).toEqual([5, 5, 5, 5]);
    });
    it('[v, h] -> [v, h, v, h]', () => {
      expect(normalizePadding([6, 10])).toEqual([6, 10, 6, 10]);
    });
    it('[t, r, b, l] -> as-is', () => {
      expect(normalizePadding([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
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
      expect(warnings.some(w => w.includes('requires xValue'))).toBe(true);
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
