import { describe, it, expect } from 'vitest';
import EvContextMenu from './ContextMenu.vue';

describe('EvContextMenu Component', () => {
  describe('기본값', () => {
    it('컴포넌트 이름이 EvContextMenu이다', () => {
      expect(EvContextMenu.name).toBe('EvContextMenu');
    });

    it('기본 customClass는 빈 문자열이다', () => {
      expect(EvContextMenu.props.customClass.default).toBe('');
    });

    it('기본 isShowMenuOnClick는 false이다', () => {
      expect(EvContextMenu.props.isShowMenuOnClick.default).toBe(false);
    });

    it('기본 items는 빈 배열이다', () => {
      expect(EvContextMenu.props.items.default()).toEqual([]);
    });
  });
});
