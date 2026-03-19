import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import EvTabPanel from './TabPanel.vue';

describe('EvTabPanel Component', () => {
  const mountWithTabs = (props = {}, selectedValue = 'tab1') =>
    mount(EvTabPanel, {
      props: { value: 'tab1', text: '탭1', ...props },
      slots: { default: '<div class="panel-content">패널 내용</div>' },
      global: {
        provide: {
          evTabs: ref(selectedValue),
        },
      },
    });

  describe('렌더링', () => {
    it('선택된 탭 패널이 렌더링된다', () => {
      const wrapper = mountWithTabs({ value: 'tab1' }, 'tab1');

      expect(wrapper.find('.ev-tab-panel').exists()).toBe(true);
      expect(wrapper.find('.ev-tab-panel').isVisible()).toBe(true);
    });

    it('선택되지 않은 탭 패널은 숨겨진다', () => {
      const wrapper = mountWithTabs({ value: 'tab1' }, 'tab2');

      expect(wrapper.find('.ev-tab-panel').exists()).toBe(true);
      expect(wrapper.find('.ev-tab-panel').isVisible()).toBe(false);
    });

    it('slot 내용이 렌더링된다', () => {
      const wrapper = mountWithTabs();

      expect(wrapper.find('.panel-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('패널 내용');
    });
  });

  describe('Props', () => {
    it('value prop이 선택 상태를 결정한다', () => {
      const wrapper = mountWithTabs({ value: 'tab2' }, 'tab2');

      expect(wrapper.find('.ev-tab-panel').isVisible()).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvTabPanel이다', () => {
      expect(EvTabPanel.name).toBe('EvTabPanel');
    });

    it('기본 disabled는 false이다', () => {
      expect(EvTabPanel.props.disabled.default).toBe(false);
    });
  });
});
