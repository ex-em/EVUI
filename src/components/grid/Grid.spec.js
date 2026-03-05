import { describe, it, expect } from 'vitest';
import EvGrid from './Grid.vue';

describe('EvGrid Component', () => {
  describe('기본값', () => {
    it('컴포넌트 이름이 EvGrid이다', () => {
      expect(EvGrid.name).toBe('EvGrid');
    });

    it('기본 columns는 빈 배열이다', () => {
      expect(EvGrid.props.columns.default()).toEqual([]);
    });

    it('기본 rows는 빈 배열이다', () => {
      expect(EvGrid.props.rows.default()).toEqual([]);
    });

    it('기본 width는 100%이다', () => {
      expect(EvGrid.props.width.default).toBe('100%');
    });

    it('기본 height는 100%이다', () => {
      expect(EvGrid.props.height.default).toBe('100%');
    });

    it('기본 selected는 빈 배열이다', () => {
      expect(EvGrid.props.selected.default()).toEqual([]);
    });

    it('기본 checked는 빈 배열이다', () => {
      expect(EvGrid.props.checked.default()).toEqual([]);
    });

    it('기본 option은 빈 객체이다', () => {
      expect(EvGrid.props.option.default()).toEqual({});
    });

    it('기본 expanded는 빈 배열이다', () => {
      expect(EvGrid.props.expanded.default()).toEqual([]);
    });

    it('기본 disabledRows는 빈 배열이다', () => {
      expect(EvGrid.props.disabledRows.default()).toEqual([]);
    });

    it('기본 uncheckable은 빈 배열이다', () => {
      expect(EvGrid.props.uncheckable.default()).toEqual([]);
    });
  });
});
