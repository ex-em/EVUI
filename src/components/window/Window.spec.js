import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvWindow from './Window.vue';

describe('EvWindow Component', () => {
  const globalStubs = {
    global: {
      stubs: { teleport: true },
    },
  };

  describe('렌더링', () => {
    it('visible이 true이면 창이 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window').exists()).toBe(true);
    });

    it('visible이 false이면 창이 렌더링되지 않는다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window').exists()).toBe(false);
    });

    it('title이 있으면 제목이 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, title: '창 제목' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-title').exists()).toBe(true);
      expect(wrapper.find('.ev-window-title').text()).toBe('창 제목');
    });

    it('닫기 버튼이 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-close').exists()).toBe(true);
    });

    it('slot 내용이 content 영역에 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true },
        slots: { default: '<div class="test-content">내용</div>' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-content .test-content').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('fullscreen이 true이면 fullscreen 클래스가 적용된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, fullscreen: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window.fullscreen').exists()).toBe(true);
    });

    it('isModal이 true이면 dim 레이어가 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, isModal: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-dim-layer').exists()).toBe(true);
    });

    it('isModal이 false이면 dim 레이어가 없다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, isModal: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-dim-layer').exists()).toBe(false);
    });

    it('iconClass가 설정되면 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, iconClass: 'ev-icon-setting' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-icon').exists()).toBe(true);
    });

    it('maximizable이 true이면 최대화 버튼이 렌더링된다', () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true, maximizable: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-window-maximizable').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('닫기 버튼 클릭 시 update:visible 이벤트가 발생한다', async () => {
      const wrapper = mount(EvWindow, {
        props: { visible: true },
        ...globalStubs,
      });

      await wrapper.find('.ev-window-close').trigger('click');

      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')[0][0]).toBe(false);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvWindow이다', () => {
      expect(EvWindow.name).toBe('EvWindow');
    });

    it('기본 isModal은 true이다', () => {
      expect(EvWindow.props.isModal.default).toBe(true);
    });

    it('기본 draggable은 false이다', () => {
      expect(EvWindow.props.draggable.default).toBe(false);
    });

    it('기본 resizable은 false이다', () => {
      expect(EvWindow.props.resizable.default).toBe(false);
    });

    it('기본 fullscreen은 false이다', () => {
      expect(EvWindow.props.fullscreen.default).toBe(false);
    });
  });
});
