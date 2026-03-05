import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvDatePicker from './DatePicker.vue';

describe('EvDatePicker Component', () => {
  const globalConfig = {
    global: {
      directives: { clickoutside: {} },
    },
  };

  describe('렌더링', () => {
    it('기본 데이트피커가 렌더링된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-date-picker').exists()).toBe(true);
    });

    it('캘린더 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-icon-calendar').exists()).toBe(true);
    });

    it('입력 필드가 렌더링된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled이면 disabled 클래스가 적용된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15', disabled: true },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-date-picker.disabled').exists()).toBe(true);
    });

    it('placeholder가 적용된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '', placeholder: '날짜 선택' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('날짜 선택');
    });

    it('clearable이면 클리어 아이콘 영역이 존재한다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15', clearable: true },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input-suffix').exists()).toBe(true);
    });

    it('enableTextInput이 false이면 readonly 클래스가 적용된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: { modelValue: '2024-01-15', enableTextInput: false },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input.readonly').exists()).toBe(true);
    });

    it('dateMulti 모드에서 태그 래퍼가 렌더링된다', () => {
      const wrapper = mount(EvDatePicker, {
        props: {
          modelValue: ['2024-01-15', '2024-01-16'],
          mode: 'dateMulti',
        },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-date-picker-tag-wrapper').exists()).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvDatePicker이다', () => {
      expect(EvDatePicker.name).toBe('EvDatePicker');
    });

    it('기본 mode는 date이다', () => {
      expect(EvDatePicker.props.mode.default).toBe('date');
    });

    it('기본 disabled는 false이다', () => {
      expect(EvDatePicker.props.disabled.default).toBe(false);
    });

    it('기본 clearable은 false이다', () => {
      expect(EvDatePicker.props.clearable.default).toBe(false);
    });

    it('기본 enableTextInput은 false이다', () => {
      expect(EvDatePicker.props.enableTextInput.default).toBe(false);
    });

    it('기본 monthNotation은 fullName이다', () => {
      expect(EvDatePicker.props.monthNotation.default).toBe('fullName');
    });

    it('기본 placeholder는 빈 문자열이다', () => {
      expect(EvDatePicker.props.placeholder.default).toBe('');
    });
  });
});
