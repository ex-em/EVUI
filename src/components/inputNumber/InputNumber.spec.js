import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvInputNumber from './InputNumber.vue';

describe('EvInputNumber Component', () => {
  describe('렌더링', () => {
    it('기본 숫자 입력이 렌더링된다', () => {
      const wrapper = mount(EvInputNumber);

      expect(wrapper.find('.ev-input-number').exists()).toBe(true);
      expect(wrapper.find('.ev-input').exists()).toBe(true);
    });

    it('step up/down 버튼이 렌더링된다', () => {
      const wrapper = mount(EvInputNumber);

      expect(wrapper.find('.step-up').exists()).toBe(true);
      expect(wrapper.find('.step-down').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvInputNumber, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('.ev-input').element.disabled).toBe(true);
    });

    it('readonly prop이 적용된다', () => {
      const wrapper = mount(EvInputNumber, {
        props: { readonly: true },
      });

      expect(wrapper.classes()).toContain('readonly');
      expect(wrapper.find('.ev-input').element.readOnly).toBe(true);
    });

    it('placeholder prop이 적용된다', () => {
      const wrapper = mount(EvInputNumber, {
        props: { placeholder: '숫자를 입력하세요' },
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('숫자를 입력하세요');
    });
  });

  describe('Events', () => {
    it('focus 시 focus 이벤트가 발생한다', async () => {
      const wrapper = mount(EvInputNumber);

      await wrapper.find('.ev-input').trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('blur 시 blur 이벤트가 발생한다', async () => {
      const wrapper = mount(EvInputNumber);

      await wrapper.find('.ev-input').trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('Precision', () => {
    it('precision 설정 시 소수점 자릿수가 맞춰진다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 1.5, precision: 3 },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('1.500');
    });

    it('precision 설정 시 값이 0이면 0.000으로 표시된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 0, precision: 3 },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('0.000');
    });

    it('trimTrailingZero가 true이면 후행 0이 제거된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 1.5, precision: 3, trimTrailingZero: true },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('1.5');
    });

    it('trimTrailingZero가 true이고 값이 0이면 0으로 표시된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 0, precision: 3, trimTrailingZero: true },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('0');
    });

    it('trimTrailingZero가 false(기본값)이면 후행 0이 유지된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 1.5, precision: 3 },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('1.500');
    });

    it('trimTrailingZero가 true이고 소수점이 정확히 맞으면 그대로 표시된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 1.123, precision: 3, trimTrailingZero: true },
      });

      expect(wrapper.find('.ev-input').element.value).toBe('1.123');
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvInputNumber이다', () => {
      expect(EvInputNumber.name).toBe('EvInputNumber');
    });

    it('기본 step은 1이다', () => {
      expect(EvInputNumber.props.step.default).toBe(1);
    });

    it('기본 precision은 0이다', () => {
      expect(EvInputNumber.props.precision.default).toBe(0);
    });
  });
});
