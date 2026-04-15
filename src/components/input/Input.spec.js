import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EvInput from './Input.vue';
import EvInputRoot from './InputRoot.vue';
import EvInputLabel from './InputLabel.vue';
import EvInputDescription from './InputDescription.vue';
import EvInputErrorMessage from './InputErrorMessage.vue';

describe('EvInput', () => {
  describe('단독 사용', () => {
    it('기본 input이 렌더링된다', () => {
      const wrapper = mount(EvInput);
      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('v-model이 동작한다', async () => {
      const wrapper = mount(EvInput, {
        props: { modelValue: '' },
      });

      await wrapper.find('input').setValue('hello');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('native attrs가 input에 전달된다', () => {
      const wrapper = mount(EvInput, {
        attrs: {
          name: 'email',
          type: 'email',
          'data-testid': 'my-input',
          placeholder: '입력하세요',
        },
      });

      const input = wrapper.find('input');
      expect(input.attributes('name')).toBe('email');
      expect(input.attributes('type')).toBe('email');
      expect(input.attributes('data-testid')).toBe('my-input');
      expect(input.attributes('placeholder')).toBe('입력하세요');
    });

    it('focus 이벤트가 발생한다', async () => {
      const wrapper = mount(EvInput);
      await wrapper.find('input').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('blur 이벤트가 발생한다', async () => {
      const wrapper = mount(EvInput);
      await wrapper.find('input').trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('context 없이 aria 속성이 생략된다', () => {
      const wrapper = mount(EvInput);
      const input = wrapper.find('input');
      expect(input.attributes('aria-labelledby')).toBeUndefined();
      expect(input.attributes('aria-describedby')).toBeUndefined();
    });
  });

  describe('v-model.trim modifier', () => {
    it('trim modifier가 있으면 blur 시 앞뒤 공백이 제거된다', async () => {
      const wrapper = mount(EvInput, {
        props: { modelModifiers: { trim: true }, modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('  hello  ');
      await input.trigger('blur');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe('hello');
    });

    it('trim modifier가 없으면 blur 시 공백이 유지된다', async () => {
      const wrapper = mount(EvInput, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('  hello  ');
      await input.trigger('blur');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted[emitted.length - 1][0]).toBe('  hello  ');
    });

    it('trim modifier가 있어도 입력 중 DOM 값은 유지된다', async () => {
      const wrapper = mount(EvInput, {
        props: { modelModifiers: { trim: true }, modelValue: '' },
      });

      const input = wrapper.find('input');
      input.element.value = 'test ';
      await input.trigger('input');

      expect(input.element.value).toBe('test ');
    });
  });

  describe('Compound 사용', () => {
    const CompoundInput = {
      components: {
        EvInputRoot,
        EvInput,
        EvInputLabel,
        EvInputDescription,
        EvInputErrorMessage,
      },
      template: `
        <ev-input-root v-bind="rootProps">
          <ev-input-label v-if="showLabel">이메일</ev-input-label>
          <ev-input v-model="value" />
          <ev-input-description v-if="showDescription">
            설명 텍스트
          </ev-input-description>
          <ev-input-error-message v-if="showError">
            에러 메시지
          </ev-input-error-message>
        </ev-input-root>
      `,
      props: {
        rootProps: { type: Object, default: () => ({}) },
        showLabel: { type: Boolean, default: true },
        showDescription: { type: Boolean, default: false },
        showError: { type: Boolean, default: false },
      },
      data() {
        return { value: '' };
      },
    };

    it('Label과 Input이 자동 연결된다', async () => {
      const wrapper = mount(CompoundInput);
      await nextTick();

      const label = wrapper.find('label');
      const input = wrapper.find('input');

      expect(label.attributes('for')).toBe(input.attributes('id'));
      expect(label.attributes('id')).toBeTruthy();
    });

    it('ErrorMessage가 aria-describedby로 연결된다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { showError: true },
      });
      await nextTick();

      const input = wrapper.find('input');
      const error = wrapper.find('[role="alert"]');

      expect(input.attributes('aria-describedby')).toContain(
        error.attributes('id'),
      );
    });

    it('Description과 ErrorMessage가 모두 aria-describedby에 포함된다',
      async () => {
        const wrapper = mount(CompoundInput, {
          props: { showDescription: true, showError: true },
        });
        await nextTick();

        const input = wrapper.find('input');
        const describedby = input.attributes('aria-describedby');
        expect(describedby).toBeTruthy();

        const ids = describedby.split(' ');
        expect(ids.length).toBe(2);
      },
    );

    it('Root의 disabled가 Input에 전파된다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { rootProps: { disabled: true } },
      });
      await nextTick();

      expect(wrapper.find('input').element.disabled).toBe(true);
    });

    it('Root의 required가 Input에 전파된다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { rootProps: { required: true } },
      });
      await nextTick();

      const input = wrapper.find('input');
      expect(input.element.required).toBe(true);
      expect(input.attributes('aria-required')).toBe('true');
    });

    it('Root의 invalid가 aria-invalid로 설정된다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { rootProps: { invalid: true } },
      });
      await nextTick();

      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('ErrorMessage가 role="alert"과 aria-live를 갖는다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { showError: true },
      });
      await nextTick();

      const error = wrapper.find('[role="alert"]');
      expect(error.exists()).toBe(true);
      expect(error.attributes('aria-live')).toBe('assertive');
    });

    it('Description unmount 시 aria-describedby에서 제거된다', async () => {
      const wrapper = mount(CompoundInput, {
        props: { showDescription: true },
      });
      await nextTick();

      expect(wrapper.find('input').attributes('aria-describedby'))
        .toBeTruthy();

      await wrapper.setProps({ showDescription: false });
      await nextTick();

      const describedby = wrapper.find('input')
        .attributes('aria-describedby');
      expect(!describedby || describedby === '').toBe(true);
    });
  });
});
