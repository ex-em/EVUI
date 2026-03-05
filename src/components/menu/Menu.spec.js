import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvMenu from './Menu.vue';

describe('EvMenu Component', () => {
  const defaultItems = [
    { text: '메뉴1', value: 'menu1' },
    { text: '메뉴2', value: 'menu2' },
    { text: '메뉴3', value: 'menu3' },
  ];

  describe('렌더링', () => {
    it('기본 메뉴가 렌더링된다', () => {
      const wrapper = mount(EvMenu, {
        props: { items: defaultItems },
      });

      expect(wrapper.find('.ev-menu').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled prop이 전달된다', () => {
      expect(EvMenu.props.disabled.default).toBe(false);
    });

    it('expandable prop이 전달된다', () => {
      expect(EvMenu.props.expandable.default).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvMenu이다', () => {
      expect(EvMenu.name).toBe('EvMenu');
    });

    it('기본 expandable은 true이다', () => {
      expect(EvMenu.props.expandable.default).toBe(true);
    });

    it('기본 disabled는 false이다', () => {
      expect(EvMenu.props.disabled.default).toBe(false);
    });
  });
});
