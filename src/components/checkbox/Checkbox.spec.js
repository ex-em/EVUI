import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvCheckbox from './Checkbox.vue';

describe('EvCheckbox Component', () => {
  describe('렌더링', () => {
    it('기본 체크박스가 렌더링된다', () => {
      const wrapper = mount(EvCheckbox);

      expect(wrapper.find('.ev-checkbox').exists()).toBe(true);
      expect(wrapper.find('.ev-checkbox-input').exists()).toBe(true);
      expect(wrapper.find('.ev-checkbox-label').exists()).toBe(true);
    });

    it('label prop이 텍스트로 표시된다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { label: '동의합니다' },
      });

      expect(wrapper.find('.ev-checkbox-label').text()).toBe('동의합니다');
    });

    it('slot 내용이 label 대신 렌더링된다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { label: '원래라벨' },
        slots: { default: '커스텀 라벨' },
      });

      expect(wrapper.find('.ev-checkbox-label').text()).toBe('커스텀 라벨');
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('input').element.disabled).toBe(true);
    });

    it('modelValue가 true이면 checked 클래스가 적용된다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { modelValue: true },
      });

      expect(wrapper.classes()).toContain('checked');
    });

    it('modelValue가 false이면 checked 클래스가 없다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { modelValue: false },
      });

      expect(wrapper.classes()).not.toContain('checked');
    });

    it('readonly prop이 input에 적용된다', () => {
      const wrapper = mount(EvCheckbox, {
        props: { readonly: true },
      });

      expect(wrapper.find('input').element.readOnly).toBe(true);
    });
  });

  describe('Events', () => {
    it('변경 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvCheckbox, {
        props: { modelValue: false },
      });

      const input = wrapper.find('input');
      await input.setValue(true);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('변경 시 change 이벤트가 발생한다', async () => {
      const wrapper = mount(EvCheckbox, {
        props: { modelValue: false },
      });

      const input = wrapper.find('input');
      await input.trigger('change');

      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });

  describe('기본값', () => {
    it('기본 disabled는 false이다', () => {
      const wrapper = mount(EvCheckbox);

      expect(wrapper.classes()).not.toContain('disabled');
    });

    it('기본 readonly는 false이다', () => {
      const wrapper = mount(EvCheckbox);

      expect(wrapper.find('input').element.readOnly).toBe(false);
    });

    it('컴포넌트 이름이 EvCheckbox이다', () => {
      expect(EvCheckbox.name).toBe('EvCheckbox');
    });
  });
});
