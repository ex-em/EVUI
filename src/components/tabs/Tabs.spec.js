import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvTabs from './Tabs.vue';

describe('EvTabs Component', () => {
  const defaultPanels = [
    { text: '탭1', value: 'tab1' },
    { text: '탭2', value: 'tab2' },
    { text: '탭3', value: 'tab3' },
  ];

  const globalConfig = {
    global: {
      directives: {
        resize: {},
        observeVisibility: {},
      },
    },
  };

  describe('렌더링', () => {
    it('기본 탭이 렌더링된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-tabs').exists()).toBe(true);
      expect(wrapper.find('.ev-tabs-header').exists()).toBe(true);
      expect(wrapper.find('.ev-tabs-body').exists()).toBe(true);
    });

    it('탭 목록이 렌더링된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      expect(tabs).toHaveLength(3);
      expect(tabs[0].text()).toContain('탭1');
      expect(tabs[1].text()).toContain('탭2');
    });

    it('선택된 탭에 active 클래스가 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab2', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      expect(tabs[0].classes()).not.toContain('active');
      expect(tabs[1].classes()).toContain('active');
    });
  });

  describe('Props', () => {
    it('closable prop이 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels, closable: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('closable');
      expect(wrapper.findAll('.close-icon').length).toBeGreaterThan(0);
    });

    it('stretch prop이 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels, stretch: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('stretch');
    });
  });

  describe('Events', () => {
    it('탭 클릭 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      await tabs[1].trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('tab2');
    });

    it('탭 클릭 시 change 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      await tabs[1].trigger('click');

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0][0]).toBe('tab2');
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvTabs이다', () => {
      expect(EvTabs.name).toBe('EvTabs');
    });

    it('기본 closable은 false이다', () => {
      expect(EvTabs.props.closable.default).toBe(false);
    });

    it('기본 stretch는 false이다', () => {
      expect(EvTabs.props.stretch.default).toBe(false);
    });

    it('기본 draggable은 false이다', () => {
      expect(EvTabs.props.draggable.default).toBe(false);
    });
  });
});
