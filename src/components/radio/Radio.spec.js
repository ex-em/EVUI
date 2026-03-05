import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvRadio from './Radio.vue';

describe('EvRadio Component', () => {
  describe('렌더링', () => {
    it('기본 라디오가 렌더링된다', () => {
      const wrapper = mount(EvRadio);

      expect(wrapper.find('.ev-radio').exists()).toBe(true);
      expect(wrapper.find('.ev-radio-input').exists()).toBe(true);
      expect(wrapper.find('.ev-radio-label').exists()).toBe(true);
    });

    it('label prop이 텍스트로 표시된다', () => {
      const wrapper = mount(EvRadio, {
        props: { label: '옵션1' },
      });

      expect(wrapper.find('.ev-radio-label').text()).toBe('옵션1');
    });

    it('slot 내용이 label 대신 렌더링된다', () => {
      const wrapper = mount(EvRadio, {
        props: { label: '옵션1' },
        slots: { default: '커스텀 라벨' },
      });

      expect(wrapper.find('.ev-radio-label').text()).toBe('커스텀 라벨');
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvRadio, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('input').element.disabled).toBe(true);
    });

    it('size prop이 클래스로 적용된다', () => {
      const wrapper = mount(EvRadio, {
        props: { size: 'small' },
      });

      expect(wrapper.classes()).toContain('small');
    });

    it('modelValue와 label이 같으면 checked 클래스가 적용된다', () => {
      const wrapper = mount(EvRadio, {
        props: { modelValue: 'a', label: 'a' },
      });

      expect(wrapper.classes()).toContain('checked');
    });

    it('modelValue와 label이 다르면 checked 클래스가 없다', () => {
      const wrapper = mount(EvRadio, {
        props: { modelValue: 'a', label: 'b' },
      });

      expect(wrapper.classes()).not.toContain('checked');
    });
  });

  describe('Events', () => {
    it('변경 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvRadio, {
        props: { modelValue: 'a', label: 'b' },
      });

      const input = wrapper.find('input');
      await input.setValue('b');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });
  });

  describe('기본값', () => {
    it('기본 disabled는 false이다', () => {
      const wrapper = mount(EvRadio);

      expect(wrapper.classes()).not.toContain('disabled');
    });

    it('컴포넌트 이름이 EvRadio이다', () => {
      expect(EvRadio.name).toBe('EvRadio');
    });
  });
});
