import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EvMessageBox from './MessageBox.vue';

describe('EvMessageBox Component', () => {
  const globalStubs = {
    global: {
      stubs: { teleport: true },
    },
  };

  describe('렌더링', () => {
    it('기본 메시지 박스가 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인하시겠습니까?' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box').exists()).toBe(true);
      expect(wrapper.find('.ev-message-box-message').text()).toBe('확인하시겠습니까?');
    });

    it('title이 있으면 제목이 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { title: '확인', message: '내용' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-title').exists()).toBe(true);
      expect(wrapper.find('.ev-message-box-title').text()).toBe('확인');
    });

    it('확인 버튼이 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-confirm').exists()).toBe(true);
    });

    it('취소 버튼이 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-cancel').exists()).toBe(true);
    });

    it('닫기 버튼이 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', showClose: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-close').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('showConfirmBtn이 false이면 확인 버튼이 없다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', showConfirmBtn: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-confirm').exists()).toBe(false);
    });

    it('showCancelBtn이 false이면 취소 버튼이 없다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', showCancelBtn: false },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-cancel').exists()).toBe(false);
    });

    it('confirmBtnText prop이 적용된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', confirmBtnText: '예' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-confirm').text()).toBe('예');
    });

    it('cancelBtnText prop이 적용된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', cancelBtnText: '아니오' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-cancel').text()).toBe('아니오');
    });

    it('useHTML이 true이면 HTML 렌더링된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '<strong>중요</strong>', useHTML: true },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box-message strong').exists()).toBe(true);
    });

    it('type prop에 따라 클래스가 적용된다', () => {
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', type: 'warning' },
        ...globalStubs,
      });

      expect(wrapper.find('.ev-message-box').classes()).toContain('type-warning');
    });
  });

  describe('Events', () => {
    it('확인 버튼 클릭 시 onClose가 ok로 호출된다', async () => {
      const onClose = vi.fn();
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', onClose },
        ...globalStubs,
      });

      await wrapper.find('.ev-message-box-confirm').trigger('click');

      expect(onClose).toHaveBeenCalledWith('ok');
    });

    it('취소 버튼 클릭 시 onClose가 cancel로 호출된다', async () => {
      const onClose = vi.fn();
      const wrapper = mount(EvMessageBox, {
        props: { message: '확인', onClose },
        ...globalStubs,
      });

      await wrapper.find('.ev-message-box-cancel').trigger('click');

      expect(onClose).toHaveBeenCalledWith('cancel');
    });
  });

  describe('기본값', () => {
    it('기본 showClose는 true이다', () => {
      expect(EvMessageBox.props.showClose.default).toBe(true);
    });

    it('기본 showConfirmBtn은 true이다', () => {
      expect(EvMessageBox.props.showConfirmBtn.default).toBe(true);
    });

    it('기본 showCancelBtn은 true이다', () => {
      expect(EvMessageBox.props.showCancelBtn.default).toBe(true);
    });

    it('기본 confirmBtnText는 OK이다', () => {
      expect(EvMessageBox.props.confirmBtnText.default).toBe('OK');
    });

    it('기본 cancelBtnText는 Cancel이다', () => {
      expect(EvMessageBox.props.cancelBtnText.default).toBe('Cancel');
    });

    it('컴포넌트 이름이 EvMessageBox이다', () => {
      expect(EvMessageBox.name).toBe('EvMessageBox');
    });
  });
});
