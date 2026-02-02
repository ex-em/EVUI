import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EvButton from './Button.vue';

describe('EvButton Component', () => {
  // 1. 기본 렌더링 테스트
  describe('렌더링', () => {
    it('기본 버튼이 렌더링된다', () => {
      const wrapper = mount(EvButton);

      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ev-button');
    });

    it('slot 내용이 렌더링된다', () => {
      const wrapper = mount(EvButton, {
        slots: {
          default: '클릭하세요',
        },
      });

      expect(wrapper.text()).toBe('클릭하세요');
    });
  });

  // 2. Props 테스트
  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvButton, {
        props: { disabled: true },
      });

      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('disabled');
    });

    it('type prop에 따라 클래스가 적용된다', () => {
      const types = ['default', 'primary', 'info', 'warning', 'error'];

      types.forEach((type) => {
        const wrapper = mount(EvButton, {
          props: { type },
        });
        expect(wrapper.classes()).toContain(`type-${type}`);
      });
    });

    it('shape prop에 따라 클래스가 적용된다', () => {
      const wrapper = mount(EvButton, {
        props: { shape: 'circle' },
      });

      expect(wrapper.classes()).toContain('shape-circle');
    });

    it('size prop에 따라 클래스가 적용된다', () => {
      const sizes = ['large', 'small'];

      sizes.forEach((size) => {
        const wrapper = mount(EvButton, {
          props: { size },
        });
        expect(wrapper.classes()).toContain(`size-${size}`);
      });
    });

    it('htmlType prop이 button 속성으로 적용된다', () => {
      const wrapper = mount(EvButton, {
        props: { htmlType: 'submit' },
      });

      expect(wrapper.attributes('type')).toBe('submit');
    });
  });

  // 3. 이벤트 테스트
  describe('Events', () => {
    it('클릭 시 click 이벤트가 발생한다', async () => {
      const wrapper = mount(EvButton);

      await wrapper.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('클릭 이벤트에 MouseEvent가 전달된다', async () => {
      const wrapper = mount(EvButton);

      await wrapper.trigger('click');

      const clickEvents = wrapper.emitted('click');
      expect(clickEvents[0][0]).toBeInstanceOf(MouseEvent);
    });

    it('disabled 상태에서는 클릭 이벤트가 발생하지 않는다', async () => {
      const onClick = vi.fn();
      const wrapper = mount(EvButton, {
        props: { disabled: true },
        attrs: { onClick },
      });

      await wrapper.trigger('click');

      // disabled button은 native click이 발생하지 않음
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // 4. 기본값 테스트
  describe('기본값', () => {
    it('기본 type은 default이다', () => {
      const wrapper = mount(EvButton);

      expect(wrapper.classes()).toContain('type-default');
    });

    it('기본 htmlType은 button이다', () => {
      const wrapper = mount(EvButton);

      expect(wrapper.attributes('type')).toBe('button');
    });

    it('기본 size는 medium이다 (size 클래스 없음)', () => {
      const wrapper = mount(EvButton);

      expect(wrapper.classes()).not.toContain('size-medium');
      expect(wrapper.classes()).not.toContain('size-large');
      expect(wrapper.classes()).not.toContain('size-small');
    });
  });
});
