import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvSelect from './Select.vue';

describe('EvSelect Component', () => {
  const defaultProps = {
    items: [
      { name: '옵션1', value: 'opt1' },
      { name: '옵션2', value: 'opt2' },
      { name: '옵션3', value: 'opt3' },
    ],
  };

  const globalConfig = {
    global: {
      directives: {
        clickoutside: {},
      },
    },
  };

  describe('렌더링', () => {
    it('기본 셀렉트가 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      expect(wrapper.find('.ev-select').exists()).toBe(true);
      expect(wrapper.find('.ev-input').exists()).toBe(true);
    });

    it('화살표 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input-suffix-arrow').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, disabled: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('.ev-input').element.disabled).toBe(true);
    });

    it('placeholder prop이 적용된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, placeholder: '선택하세요' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('선택하세요');
    });

    it('multiple prop이 적용되면 다중 선택 UI가 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, modelValue: [] },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-select-tag-wrapper').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('클릭 시 드롭박스가 열린다', async () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');

      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvSelect이다', () => {
      expect(EvSelect.name).toBe('EvSelect');
    });

    it('기본 multiple은 false이다', () => {
      expect(EvSelect.props.multiple.default).toBe(false);
    });

    it('기본 clearable은 false이다', () => {
      expect(EvSelect.props.clearable.default).toBe(false);
    });

    it('기본 filterable은 false이다', () => {
      expect(EvSelect.props.filterable.default).toBe(false);
    });
  });
});
