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

  describe('disableEmpty', () => {
    it('기본값(false)에서는 값을 비우면 null 이 된다', async () => {
      const wrapper = mount(EvInputNumber, { props: { modelValue: 80 } });
      const input = wrapper.find('.ev-input');
      await input.setValue('');
      await input.trigger('change');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe(null);
    });

    it('disableEmpty=true 이면 값을 비워도 0 이 된다', async () => {
      const wrapper = mount(EvInputNumber, { props: { modelValue: 80, disableEmpty: true } });
      const input = wrapper.find('.ev-input');
      await input.setValue('');
      await input.trigger('change');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe(0);
      expect(input.element.value).toBe('0');
    });

    it('disableEmpty=true 이고 값이 이미 0 일 때 비워도 화면에 0 이 표시된다', async () => {
      const wrapper = mount(EvInputNumber, { props: { modelValue: 0, disableEmpty: true } });
      const input = wrapper.find('.ev-input');
      await input.setValue('');
      await input.trigger('change');

      expect(input.element.value).toBe('0');
    });

    it('disableEmpty=true 이면 min 보다 0 이 작을 때 min 으로 보정된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 50, disableEmpty: true, min: 10 },
      });
      const input = wrapper.find('.ev-input');
      await input.setValue('');
      await input.trigger('change');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe(10);
    });

    it('disableEmpty=true 이고 stepStrictly 면 빈 값이 0 에 가장 가까운 step 값으로 스냅된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { modelValue: 5, disableEmpty: true, stepStrictly: true, min: -3, max: 10, step: 2 },
      });
      const input = wrapper.find('.ev-input');
      await input.setValue('');
      await input.trigger('change');

      // 허용 step 값: -3, -1, 1, ... → 0 에 가장 가까운 값은 -1
      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe(-1);
    });

    it('기본 disableEmpty는 false이다', () => {
      expect(EvInputNumber.props.disableEmpty.default).toBe(false);
    });
  });

  describe('clampOnStep', () => {
    it('clampOnStep + min 미설정 + 값이 없는 상태에서 step-up 버튼으로 값이 조절된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true },
      });

      await wrapper.find('.step-up').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([0]);
      expect(wrapper.find('.ev-input').element.value).toBe('0');
    });

    it('clampOnStep + min 미설정 + 값이 없는 상태에서 step-down 버튼으로 값이 조절된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true },
      });

      await wrapper.find('.step-down').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([0]);
      expect(wrapper.find('.ev-input').element.value).toBe('0');
    });

    it('clampOnStep + min 설정 + 값이 없는 상태에서 step-up 버튼으로 min부터 조절된다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, min: 5 },
      });

      await wrapper.find('.step-up').trigger('click');

      expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([5]);
      expect(wrapper.find('.ev-input').element.value).toBe('5');
    });

    it('clampOnStep이 max를 초과하는 값을 max로 고정한다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, max: 10, modelValue: 10 },
      });

      await wrapper.find('.step-up').trigger('click');

      expect(wrapper.find('.ev-input').element.value).toBe('10');
    });

    it('clampOnStep이 min 미만의 값을 min으로 고정한다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, min: 0, modelValue: 0 },
      });

      await wrapper.find('.step-down').trigger('click');

      expect(wrapper.find('.ev-input').element.value).toBe('0');
    });

    it('clampOnStep + 범위 내 값은 step만큼 증가/감소한다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, min: 0, max: 10, step: 2, modelValue: 4 },
      });

      await wrapper.find('.step-up').trigger('click');
      expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([6]);

      await wrapper.find('.step-down').trigger('click');
      expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([4]);
    });

    it('clampOnStep에서 max 도달 후 다시 step-up 해도 추가 emit이 발생하지 않는다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, max: 10, modelValue: 10 },
      });
      const before = wrapper.emitted('update:modelValue')?.length ?? 0;

      await wrapper.find('.step-up').trigger('click');

      expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(before);
      expect(wrapper.find('.ev-input').element.value).toBe('10');
    });

    it('clampOnStep에서 min 도달 후 다시 step-down 해도 추가 emit이 발생하지 않는다', async () => {
      const wrapper = mount(EvInputNumber, {
        props: { clampOnStep: true, min: 0, modelValue: 0 },
      });
      const before = wrapper.emitted('update:modelValue')?.length ?? 0;

      await wrapper.find('.step-down').trigger('click');

      expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(before);
      expect(wrapper.find('.ev-input').element.value).toBe('0');
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
