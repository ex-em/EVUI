import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvTimePicker from './TimePicker.vue';

describe('EvTimePicker Component', () => {
  describe('렌더링', () => {
    it('기본 타임피커가 렌더링된다 (range 타입)', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: ['09:00', '18:00'] },
      });

      expect(wrapper.find('.ev-time-picker').exists()).toBe(true);
      expect(wrapper.find('.ev-time-picker-range').exists()).toBe(true);
    });

    it('single 타입이면 single 레이아웃이 렌더링된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single' },
      });

      expect(wrapper.find('.ev-time-picker-single').exists()).toBe(true);
    });

    it('range 타입에서 물결표(~)가 렌더링된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: ['09:00', '18:00'] },
      });

      expect(wrapper.find('.tilde').exists()).toBe(true);
      expect(wrapper.find('.tilde').text()).toBe('~');
    });

    it('range 타입에서 입력 필드가 2개 렌더링된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: ['09:00', '18:00'] },
      });

      const inputs = wrapper.findAll('.ev-input');
      expect(inputs).toHaveLength(2);
    });

    it('single 타입에서 입력 필드가 1개 렌더링된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single' },
      });

      const inputs = wrapper.findAll('.ev-input');
      expect(inputs).toHaveLength(1);
    });
  });

  describe('Props', () => {
    it('disabled이면 disabled 클래스가 적용된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single', disabled: true },
      });

      expect(wrapper.find('.ev-time-picker-wrapper.disabled').exists()).toBe(true);
    });

    it('readonly이면 readonly 클래스가 적용된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single', readonly: true },
      });

      expect(wrapper.find('.ev-time-picker-wrapper.readonly').exists()).toBe(true);
    });

    it('clearable이면 클리어 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single', clearable: true },
      });

      expect(wrapper.find('.ev-input-suffix').exists()).toBe(true);
    });

    it('placeholder가 적용된다 (single)', () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single', placeholder: '시간 입력' },
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('시간 입력');
    });
  });

  describe('Events', () => {
    it('single 타입에서 focus 시 focus 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single' },
      });

      await wrapper.find('.ev-input').trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('single 타입에서 blur 시 blur 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTimePicker, {
        props: { modelValue: '09:00', type: 'single' },
      });

      await wrapper.find('.ev-input').trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvTimePicker이다', () => {
      expect(EvTimePicker.name).toBe('EvTimePicker');
    });

    it('기본 type은 range이다', () => {
      expect(EvTimePicker.props.type.default).toBe('range');
    });

    it('기본 clearable은 false이다', () => {
      expect(EvTimePicker.props.clearable.default).toBe(false);
    });

    it('기본 disabled는 false이다', () => {
      expect(EvTimePicker.props.disabled.default).toBe(false);
    });

    it('기본 readonly는 false이다', () => {
      expect(EvTimePicker.props.readonly.default).toBe(false);
    });
  });
});
