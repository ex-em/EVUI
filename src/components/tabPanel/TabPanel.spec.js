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

    it('기본 lazy는 false이다', () => {
      expect(EvTabPanel.props.lazy.default).toBe(false);
    });
  });

  describe('lazy', () => {
    const mountWithSelectedRef = (props, selectedRef) =>
      mount(EvTabPanel, {
        props: { value: 'tab1', text: '탭1', ...props },
        slots: { default: '<div class="panel-content">패널 내용</div>' },
        global: { provide: { evTabs: selectedRef } },
      });

    it('lazy=false면 비선택 패널도 slot이 mount된다(기존 동작)', () => {
      const wrapper = mountWithTabs({ value: 'tab1', lazy: false }, 'tab2');

      expect(wrapper.find('.ev-tab-panel').exists()).toBe(true);
      expect(wrapper.find('.panel-content').exists()).toBe(true);
      expect(wrapper.find('.ev-tab-panel').isVisible()).toBe(false);
    });

    it('lazy=true면 한 번도 선택되지 않은 패널은 mount되지 않는다', () => {
      const wrapper = mountWithTabs({ value: 'tab1', lazy: true }, 'tab2');

      expect(wrapper.find('.ev-tab-panel').exists()).toBe(false);
      expect(wrapper.find('.panel-content').exists()).toBe(false);
    });

    it('lazy=true에서 선택되면 mount되고, 비선택으로 바뀌어도 unmount되지 않는다(방문 캐시)', async () => {
      const selected = ref('tab1');
      const wrapper = mountWithSelectedRef({ value: 'tab1', lazy: true }, selected);

      // 초기 선택 → mount
      expect(wrapper.find('.ev-tab-panel').exists()).toBe(true);

      // 다른 탭으로 전환 → v-show로 숨겨지지만 unmount되지 않고 slot 유지
      selected.value = 'tab2';
      await wrapper.vm.$nextTick();

      const panel = wrapper.find('.ev-tab-panel');
      expect(panel.exists()).toBe(true);
      expect(panel.isVisible()).toBe(false);
      expect(wrapper.find('.panel-content').exists()).toBe(true);
    });

    it('lazy=true에서 미방문 패널이 뒤늦게 선택되면 그 때 mount된다', async () => {
      const selected = ref('tab2');
      const wrapper = mountWithSelectedRef({ value: 'tab1', lazy: true }, selected);

      // 아직 선택된 적 없음 → 미mount
      expect(wrapper.find('.ev-tab-panel').exists()).toBe(false);

      // 처음으로 선택됨 → mount + visible
      selected.value = 'tab1';
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ev-tab-panel').exists()).toBe(true);
      expect(wrapper.find('.ev-tab-panel').isVisible()).toBe(true);
    });
  });
});
