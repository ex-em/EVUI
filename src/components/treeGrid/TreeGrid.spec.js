import { describe, it, expect } from 'vitest';
import EvTreeGrid from './TreeGrid.vue';

describe('EvTreeGrid Component', () => {
  describe('기본값', () => {
    it('컴포넌트 이름이 EvTreeGrid이다', () => {
      expect(EvTreeGrid.name).toBe('EvTreeGrid');
    });

    it('기본 columns는 빈 배열이다', () => {
      expect(EvTreeGrid.props.columns.default()).toEqual([]);
    });

    it('기본 rows는 null이다', () => {
      expect(EvTreeGrid.props.rows.default()).toBeNull();
    });

    it('기본 width는 100%이다', () => {
      expect(EvTreeGrid.props.width.default).toBe('100%');
    });

    it('기본 height는 100%이다', () => {
      expect(EvTreeGrid.props.height.default).toBe('100%');
    });

    it('기본 selected는 빈 배열이다', () => {
      expect(EvTreeGrid.props.selected.default()).toEqual([]);
    });

    it('기본 checked는 빈 배열이다', () => {
      expect(EvTreeGrid.props.checked.default()).toEqual([]);
    });

    it('기본 option은 빈 객체이다', () => {
      expect(EvTreeGrid.props.option.default()).toEqual({});
    });

    it('기본 expandIcon은 빈 문자열이다', () => {
      expect(EvTreeGrid.props.expandIcon.default).toBe('');
    });

    it('기본 collapseIcon은 빈 문자열이다', () => {
      expect(EvTreeGrid.props.collapseIcon.default).toBe('');
    });
  });
});
