import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvLoading from './Loading.vue';

describe('EvLoading Component', () => {
  const globalStubs = {
    global: {
      stubs: { teleport: true },
    },
  };

  describe('렌더링', () => {
    it('modelValue가 true이면 로딩이 렌더링된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading').exists()).toBe(true);
    });

    it('modelValue가 false이면 로딩이 렌더링되지 않는다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading').exists()).toBe(false);
    });

    it('spinner가 렌더링된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading-spinner').exists()).toBe(true);
    });

    it('기본 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading-icon').exists()).toBe(true);
      expect(wrapper.find('.ev-icon-refresh2').exists()).toBe(true);
    });

    it('slot 내용이 렌더링되면 기본 아이콘은 표시되지 않는다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true },
        slots: { default: '<span class="custom-spinner">로딩중</span>' },
        ...globalStubs,
      });

      expect(wrapper.find('.custom-spinner').exists()).toBe(true);
      expect(wrapper.find('.ev-loading-icon').exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('fullscreen이 true이면 full-screen 클래스가 적용된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true, fullscreen: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading.full-screen').exists()).toBe(true);
    });

    it('iconClass prop이 적용된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true, iconClass: 'ev-icon-spinner' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-icon-spinner').exists()).toBe(true);
    });

    it('iconStyle prop이 아이콘에 적용된다', () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true, iconStyle: { fontSize: '40px' } },
        ...globalStubs,
      });

      const icon = wrapper.find('.ev-loading-icon');
      expect(icon.element.style.fontSize).toBe('40px');
    });
  });

  describe('Events', () => {
    it('clickOutside가 true일 때 클릭하면 update:modelValue가 발생한다', async () => {
      const wrapper = mount(EvLoading, {
        props: { modelValue: true, clickOutside: true },
        ...globalStubs,
      });

      await wrapper.find('.ev-loading').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });
  });

  describe('기본값', () => {
    it('기본 modelValue는 false이다', () => {
      const wrapper = mount(EvLoading, {
        ...globalStubs,
      });

      expect(wrapper.find('.ev-loading').exists()).toBe(false);
    });

    it('컴포넌트 이름이 EvLoading이다', () => {
      expect(EvLoading.name).toBe('EvLoading');
    });
  });
});
