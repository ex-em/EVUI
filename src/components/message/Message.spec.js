import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EvMessage from './Message.vue';

describe('EvMessage Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    el.id = 'ev-message-modal';
    document.body.appendChild(el);
  });

  afterEach(() => {
    vi.useRealTimers();
    const el = document.getElementById('ev-message-modal');
    if (el) {
      document.body.removeChild(el);
    }
  });

  const globalStubs = {
    global: {
      stubs: { teleport: true },
    },
  };

  describe('렌더링', () => {
    it('기본 메시지가 렌더링된다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '안녕하세요' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message').exists()).toBe(true);
      expect(wrapper.find('.ev-message-content').text()).toBe('안녕하세요');
    });

    it('showClose가 true이면 닫기 버튼이 렌더링된다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', showClose: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-close').exists()).toBe(true);
      expect(wrapper.find('.ev-message').classes()).toContain('show-close');
    });

    it('showClose가 false이면 닫기 버튼이 없다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', showClose: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-close').exists()).toBe(false);
    });

    it('iconClass가 설정되면 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', iconClass: 'ev-icon-info' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-icon').exists()).toBe(true);
      expect(wrapper.find('.ev-message').classes()).toContain('has-icon');
    });
  });

  describe('Props', () => {
    it('type prop에 따라 클래스가 적용된다', () => {
      const types = ['info', 'success', 'warning', 'error'];

      types.forEach((type) => {
        const wrapper = mount(EvMessage, {
          props: { message: '메시지', type },
          ...globalStubs,
        });
        expect(wrapper.find('.ev-message').classes()).toContain(`type-${type}`);
      });
    });

    it('useHTML이 true이면 HTML 렌더링된다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '<strong>굵은 메시지</strong>', useHTML: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-content strong').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('닫기 버튼 클릭 시 메시지가 숨겨진다', async () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', showClose: true },
        ...globalStubs,
      });

      await wrapper.find('.ev-message-close').trigger('click');

      expect(wrapper.find('.ev-message').isVisible()).toBe(false);
    });

    it('닫기 시 onClose 콜백이 호출된다', async () => {
      const onClose = vi.fn();
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', showClose: true, onClose },
        ...globalStubs,
      });

      await wrapper.find('.ev-message-close').trigger('click');

      expect(onClose).toHaveBeenCalled();
    });

    it('expose된 hide 메서드로 isShow 상태가 변경된다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지', duration: 0 },
        ...globalStubs,
      });

      expect(wrapper.vm.isShow).toBe(true);

      wrapper.vm.hide();

      expect(wrapper.vm.isShow).toBe(false);
    });
  });

  describe('기본값', () => {
    it('기본 type은 info이다', () => {
      const wrapper = mount(EvMessage, {
        props: { message: '메시지' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message').classes()).toContain('type-info');
    });

    it('기본 duration은 3000이다', () => {
      expect(EvMessage.props.duration.default).toBe(3000);
    });

    it('컴포넌트 이름이 EvMessage이다', () => {
      expect(EvMessage.name).toBe('EvMessage');
    });
  });
});
