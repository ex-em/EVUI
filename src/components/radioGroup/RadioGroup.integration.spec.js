import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvRadioGroup from './RadioGroup.vue';
import EvRadio from '../radio/Radio.vue';

describe('EvRadioGroup Integration', () => {
  describe('렌더링', () => {
    it('라디오 그룹이 렌더링된다', () => {
      const wrapper = mount(EvRadioGroup);

      expect(wrapper.find('.ev-radio-group').exists()).toBe(true);
      expect(wrapper.attributes('role')).toBe('group');
    });

    it('자식 라디오들이 렌더링된다', () => {
      const wrapper = mount(EvRadioGroup, {
        props: { modelValue: 'a' },
        slots: {
          default: [
            '<ev-radio label="a">옵션A</ev-radio>',
            '<ev-radio label="b">옵션B</ev-radio>',
          ].join(''),
        },
        global: {
          components: { EvRadio },
        },
      });

      expect(wrapper.findAllComponents(EvRadio)).toHaveLength(2);
    });
  });

  describe('Props', () => {
    it('type이 button이면 type-button 클래스가 적용된다', () => {
      const wrapper = mount(EvRadioGroup, {
        props: { type: 'button' },
      });

      expect(wrapper.classes()).toContain('type-button');
    });

    it('type이 radio이면 type-button 클래스가 없다', () => {
      const wrapper = mount(EvRadioGroup, {
        props: { type: 'radio' },
      });

      expect(wrapper.classes()).not.toContain('type-button');
    });
  });

  describe('provide/inject 통합', () => {
    it('그룹의 modelValue가 자식 라디오에 전달된다', () => {
      const wrapper = mount(EvRadioGroup, {
        props: { modelValue: 'a' },
        slots: {
          default: [
            '<ev-radio label="a">옵션A</ev-radio>',
            '<ev-radio label="b">옵션B</ev-radio>',
          ].join(''),
        },
        global: {
          components: { EvRadio },
        },
      });

      const radios = wrapper.findAllComponents(EvRadio);
      expect(radios[0].classes()).toContain('checked');
      expect(radios[1].classes()).not.toContain('checked');
    });
  });

  describe('Events', () => {
    it('자식 라디오 선택 시 update:modelValue가 발생한다', async () => {
      const wrapper = mount(EvRadioGroup, {
        props: { modelValue: 'a' },
        slots: {
          default: [
            '<ev-radio label="a">옵션A</ev-radio>',
            '<ev-radio label="b">옵션B</ev-radio>',
          ].join(''),
        },
        global: {
          components: { EvRadio },
        },
      });

      const radios = wrapper.findAllComponents(EvRadio);
      const input = radios[1].find('input');
      await input.setValue('b');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });
  });

  describe('기본값', () => {
    it('기본 type은 radio이다', () => {
      const wrapper = mount(EvRadioGroup);

      expect(wrapper.classes()).not.toContain('type-button');
    });

    it('컴포넌트 이름이 EvRadioGroup이다', () => {
      expect(EvRadioGroup.name).toBe('EvRadioGroup');
    });
  });
});
