import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EvNotification from './Notification.vue';

describe('EvNotification Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('렌더링', () => {
    it('기본 알림이 렌더링된다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림 메시지' },
      });

      expect(wrapper.find('.ev-notification').exists()).toBe(true);
      expect(wrapper.find('.message').text()).toBe('알림 메시지');
    });

    it('title이 있으면 제목이 렌더링된다', () => {
      const wrapper = mount(EvNotification, {
        props: { title: '알림 제목', message: '내용' },
      });

      expect(wrapper.find('.title').exists()).toBe(true);
      expect(wrapper.find('.title').text()).toBe('알림 제목');
    });

    it('showClose가 true이면 닫기 버튼이 렌더링된다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림', showClose: true },
      });

      expect(wrapper.find('.ev-notification-close').exists()).toBe(true);
      expect(wrapper.find('.ev-notification').classes()).toContain('show-close');
    });

    it('iconClass가 설정되면 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림', iconClass: 'ev-icon-info' },
      });

      expect(wrapper.find('.ev-notification-icon').exists()).toBe(true);
      expect(wrapper.find('.ev-notification').classes()).toContain('has-icon');
    });
  });

  describe('Props', () => {
    it('type prop에 따라 클래스가 적용된다', () => {
      const types = ['info', 'success', 'warning', 'error'];

      types.forEach((type) => {
        const wrapper = mount(EvNotification, {
          props: { message: '알림', type },
        });
        expect(wrapper.find('.ev-notification').classes()).toContain(`type-${type}`);
      });
    });

    it('useHTML이 true이면 HTML 렌더링된다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '<strong>굵은 알림</strong>', useHTML: true },
      });

      expect(wrapper.find('.message strong').exists()).toBe(true);
    });

    it('onClick이 있으면 has-click 클래스가 적용된다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림', onClick: vi.fn() },
      });

      expect(wrapper.find('.ev-notification').classes()).toContain('has-click');
    });
  });

  describe('Events', () => {
    it('닫기 버튼 클릭 시 isShow가 false가 된다', async () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림', showClose: true },
      });

      expect(wrapper.vm.isShow).toBe(true);

      await wrapper.find('.ev-notification-close').trigger('click');

      expect(wrapper.vm.isShow).toBe(false);
    });

    it('닫기 시 onClose 콜백이 호출된다', async () => {
      const onClose = vi.fn();
      const wrapper = mount(EvNotification, {
        props: { message: '알림', showClose: true, onClose },
      });

      await wrapper.find('.ev-notification-close').trigger('click');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('기본값', () => {
    it('기본 type은 info이다', () => {
      const wrapper = mount(EvNotification, {
        props: { message: '알림' },
      });

      expect(wrapper.find('.ev-notification').classes()).toContain('type-info');
    });

    it('기본 showClose는 true이다', () => {
      expect(EvNotification.props.showClose.default).toBe(true);
    });

    it('기본 position은 top-right이다', () => {
      expect(EvNotification.props.position.default).toBe('top-right');
    });

    it('컴포넌트 이름이 EvNotification이다', () => {
      expect(EvNotification.name).toBe('EvNotification');
    });
  });
});
