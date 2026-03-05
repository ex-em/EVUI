import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvToggle from './Toggle.vue';

describe('EvToggle Component', () => {
  describe('렌더링', () => {
    it('기본 토글이 렌더링된다', () => {
      const wrapper = mount(EvToggle);

      expect(wrapper.find('.ev-toggle').exists()).toBe(true);
    });

    it('modelValue가 true이면 checked 클래스가 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: true },
      });

      expect(wrapper.classes()).toContain('checked');
    });

    it('modelValue가 false이면 checked 클래스가 없다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false },
      });

      expect(wrapper.classes()).not.toContain('checked');
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain('disabled');
    });

    it('readonly prop이 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { readonly: true },
      });

      expect(wrapper.classes()).toContain('readonly');
    });

    it('width prop이 스타일에 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { width: 60 },
      });

      expect(wrapper.element.style.width).toBe('60px');
    });

    it('activeColor prop이 활성 상태에서 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: true, activeColor: '#FF0000' },
      });

      expect(wrapper.element.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('inactiveColor prop이 비활성 상태에서 적용된다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false, inactiveColor: '#333333' },
      });

      expect(wrapper.element.style.backgroundColor).toBe('rgb(51, 51, 51)');
    });
  });

  describe('Events', () => {
    it('클릭 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true);
    });

    it('클릭 시 change 이벤트가 발생한다', async () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0][0]).toBe(true);
    });

    it('disabled 상태에서는 이벤트가 발생하지 않는다', async () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false, disabled: true },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('readonly 상태에서는 이벤트가 발생하지 않는다', async () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false, readonly: true },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('기본값', () => {
    it('기본 modelValue는 false이다', () => {
      const wrapper = mount(EvToggle);

      expect(wrapper.classes()).not.toContain('checked');
    });

    it('기본 width는 40이다', () => {
      const wrapper = mount(EvToggle);

      expect(wrapper.element.style.width).toBe('40px');
    });

    it('기본 activeColor는 #409EFF이다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: true },
      });

      expect(wrapper.element.style.backgroundColor).toBe('rgb(64, 158, 255)');
    });

    it('기본 inactiveColor는 #DCDFE6이다', () => {
      const wrapper = mount(EvToggle, {
        props: { modelValue: false },
      });

      expect(wrapper.element.style.backgroundColor).toBe('rgb(220, 223, 230)');
    });
  });
});
