import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvPagination from './Pagination.vue';

describe('EvPagination Component', () => {
  const defaultProps = {
    total: 100,
    perPage: 10,
    modelValue: 1,
  };

  describe('렌더링', () => {
    it('기본 페이지네이션이 렌더링된다', () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      expect(wrapper.find('.pagination').exists()).toBe(true);
      expect(wrapper.find('.pagination-list').exists()).toBe(true);
    });

    it('페이지 번호들이 렌더링된다', () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      const pages = wrapper.findAll('.is-page');
      expect(pages.length).toBeGreaterThan(0);
    });

    it('현재 페이지에 is-current 클래스가 적용된다', () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      expect(wrapper.find('.is-current').exists()).toBe(true);
    });

    it('이전/다음 버튼이 렌더링된다', () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      expect(wrapper.find('.pagination-previous').exists()).toBe(true);
      expect(wrapper.find('.pagination-next').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('첫 페이지에서 이전 버튼이 비활성화된다', () => {
      const wrapper = mount(EvPagination, {
        props: { ...defaultProps, modelValue: 1 },
      });

      const prevButton = wrapper.findAll('.step-button')[0];
      expect(prevButton.classes()).toContain('is-disabled');
    });

    it('마지막 페이지에서 다음 버튼이 비활성화된다', () => {
      const wrapper = mount(EvPagination, {
        props: { ...defaultProps, modelValue: 10 },
      });

      const stepButtons = wrapper.findAll('.step-button');
      const nextButton = stepButtons[stepButtons.length - 1];
      expect(nextButton.classes()).toContain('is-disabled');
    });

    it('showPageInfo가 true이면 페이지 정보가 표시된다', () => {
      const wrapper = mount(EvPagination, {
        props: { ...defaultProps, showPageInfo: true },
      });

      expect(wrapper.find('.pagination-info').exists()).toBe(true);
    });

    it('showPageInfo가 false이면 페이지 정보가 숨겨진다', () => {
      const wrapper = mount(EvPagination, {
        props: { ...defaultProps, showPageInfo: false },
      });

      expect(wrapper.find('.pagination-info').exists()).toBe(false);
    });
  });

  describe('Events', () => {
    it('페이지 클릭 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      const pages = wrapper.findAll('.is-page');
      const page2 = pages.find((p) => p.text().includes('2'));
      if (page2) {
        await page2.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      }
    });

    it('페이지 클릭 시 change 이벤트가 발생한다', async () => {
      const wrapper = mount(EvPagination, {
        props: defaultProps,
      });

      const pages = wrapper.findAll('.is-page');
      const page2 = pages.find((p) => p.text().includes('2'));
      if (page2) {
        await page2.trigger('click');
        expect(wrapper.emitted('change')).toBeTruthy();
      }
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvPagination이다', () => {
      expect(EvPagination.name).toBe('EvPagination');
    });

    it('기본 perPage는 20이다', () => {
      expect(EvPagination.props.perPage.default).toBe(20);
    });

    it('기본 visiblePage는 8이다', () => {
      expect(EvPagination.props.visiblePage.default).toBe(8);
    });

    it('기본 order는 left이다', () => {
      expect(EvPagination.props.order.default).toBe('left');
    });
  });
});
