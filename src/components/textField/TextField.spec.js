import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvTextField from './TextField.vue';

describe('EvTextField Component', () => {
  describe('렌더링', () => {
    it('기본 텍스트 필드가 렌더링된다', () => {
      const wrapper = mount(EvTextField);

      expect(wrapper.find('.ev-text-field').exists()).toBe(true);
      expect(wrapper.find('.ev-input').exists()).toBe(true);
    });

    it('type이 textarea이면 textarea가 렌더링된다', () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'textarea' },
      });

      expect(wrapper.find('.ev-textarea').exists()).toBe(true);
      expect(wrapper.find('.ev-input').exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('placeholder prop이 적용된다', () => {
      const wrapper = mount(EvTextField, {
        props: { placeholder: '입력하세요' },
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('입력하세요');
    });

    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvTextField, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('.ev-input').element.disabled).toBe(true);
    });

    it('readonly prop이 적용된다', () => {
      const wrapper = mount(EvTextField, {
        props: { readonly: true },
      });

      expect(wrapper.classes()).toContain('readonly');
      expect(wrapper.find('.ev-input').element.readOnly).toBe(true);
    });

    it('clearable prop이 적용된다', () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'text', clearable: true },
      });

      expect(wrapper.classes()).toContain('clearable');
    });

    it('errorMsg prop이 에러 메시지를 표시한다', () => {
      const wrapper = mount(EvTextField, {
        props: { errorMsg: '필수 입력입니다' },
      });

      expect(wrapper.classes()).toContain('error');
      expect(wrapper.find('.ev-text-field-error').text()).toBe('필수 입력입니다');
    });

    it('type이 password이면 password input이 렌더링된다', () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'password' },
      });

      expect(wrapper.find('.ev-input').attributes('type')).toBe('password');
    });

    it('showPassword prop이 적용된다', () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'password', showPassword: true },
      });

      expect(wrapper.classes()).toContain('show-password');
      expect(wrapper.find('.icon-password').exists()).toBe(true);
    });

    it('type이 search이면 검색 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'search' },
      });

      expect(wrapper.find('.icon-search').exists()).toBe(true);
    });

    it('maxLength와 showMaxLength가 설정되면 길이 표시가 나타난다', () => {
      const wrapper = mount(EvTextField, {
        props: { maxLength: 100, showMaxLength: true, modelValue: 'hello' },
      });

      expect(wrapper.find('.ev-text-field-maxlength').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('입력 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTextField, {
        props: { modelValue: '' },
      });

      await wrapper.find('.ev-input').setValue('테스트');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('focus 시 focus 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTextField);

      await wrapper.find('.ev-input').trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('blur 시 blur 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTextField);

      await wrapper.find('.ev-input').trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('clearable 클릭 시 값이 초기화된다', async () => {
      const wrapper = mount(EvTextField, {
        props: { type: 'text', clearable: true, modelValue: '테스트' },
      });

      await wrapper.find('.icon-clear').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('');
    });
  });

  describe('기본값', () => {
    it('기본 type은 text이다', () => {
      const wrapper = mount(EvTextField);

      expect(wrapper.classes()).toContain('type-text');
    });

    it('기본 autocomplete는 off이다', () => {
      const wrapper = mount(EvTextField);

      expect(wrapper.find('.ev-input').attributes('autocomplete')).toBe('off');
    });

    it('컴포넌트 이름이 EvTextField이다', () => {
      expect(EvTextField.name).toBe('EvTextField');
    });
  });
});
