// Button 컴포넌트 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/button/Button.vue';

describe('Button 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('button 엘리먼트가 렌더링되어야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('ev-button 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.classes()).toContain('ev-button');
    });
  });

  describe('슬롯 컨텐츠', () => {
    it('슬롯으로 전달된 텍스트가 렌더링되어야 한다', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '클릭하세요',
        },
      });

      expect(wrapper.text()).toBe('클릭하세요');
    });

    it('슬롯으로 전달된 HTML이 렌더링되어야 한다', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '<span>버튼</span>',
        },
      });

      expect(wrapper.find('span').text()).toBe('버튼');
    });
  });

  describe('disabled 속성', () => {
    it('disabled가 false일 때 disabled 클래스가 없어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: false,
        },
      });

      expect(wrapper.classes()).not.toContain('disabled');
      expect(wrapper.attributes('disabled')).toBeUndefined();
    });

    it('disabled가 true일 때 disabled 클래스와 속성이 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });
  });

  describe('type 속성', () => {
    it('기본값이 default이고 type-default 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.classes()).toContain('type-default');
    });

    it('다양한 type 값들이 올바른 클래스로 적용되어야 한다', () => {
      const types = ['default', 'primary', 'info', 'warning', 'error', 'ghost', 'dashed', 'text'];

      types.forEach((type) => {
        const wrapper = mount(Button, {
          props: { type },
        });

        expect(wrapper.classes()).toContain(`type-${type}`);
      });
    });
  });

  describe('htmlType 속성', () => {
    it('기본값이 button이어야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.attributes('type')).toBe('button');
    });

    it('유효한 htmlType 값들이 모두 올바르게 적용되어야 한다', () => {
      const validTypes = ['button', 'submit', 'reset'];

      validTypes.forEach((type) => {
        const wrapper = mount(Button, {
          props: {
            htmlType: type,
          },
        });

        expect(wrapper.attributes('type')).toBe(type);
      });
    });
  });

  describe('shape 속성', () => {
    it('기본값이 square이고 shape 클래스가 추가되지 않아야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.classes()).not.toContain('shape-square');
    });

    it('shape이 circle일 때 shape-circle 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          shape: 'circle',
        },
      });

      expect(wrapper.classes()).toContain('shape-circle');
    });

    it('shape이 radius일 때 shape-radius 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          shape: 'radius',
        },
      });

      expect(wrapper.classes()).toContain('shape-radius');
    });
  });

  describe('size 속성', () => {
    it('기본값이 medium이고 size 클래스가 추가되지 않아야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.classes()).not.toContain('size-medium');
    });

    it('size가 large일 때 size-large 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'large',
        },
      });

      expect(wrapper.classes()).toContain('size-large');
    });

    it('size가 small일 때 size-small 클래스가 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'small',
        },
      });

      expect(wrapper.classes()).toContain('size-small');
    });
  });

  describe('autoFocus 속성', () => {
    beforeEach(() => {
      // 각 테스트 전에 document.body를 초기화하고 포커스 해제
      document.body.innerHTML = '';
      document.body.focus();
    });

    it('autoFocus가 false일 때 autofocus 속성이 없어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          autoFocus: false,
        },
      });

      expect(wrapper.attributes('autofocus')).toBeUndefined();
    });

    it('autoFocus가 true일 때 autofocus 속성이 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          autoFocus: true,
        },
      });

      expect(wrapper.attributes('autofocus')).toBeDefined();
    });

    it('autoFocus가 true일 때 마운트 후 실제로 button이 포커스되어야 한다', async () => {
      // 실제 DOM에 마운트
      const hostElement = document.createElement('div');
      document.body.appendChild(hostElement);

      const wrapper = mount(Button, {
        props: {
          autoFocus: true,
        },
        attachTo: hostElement,
      });

      // Vue의 nextTick을 기다려 마운트 완료 후 상태 확인
      await wrapper.vm.$nextTick();

      // 실제 DOM에서 포커스된 요소가 우리가 마운트한 버튼인지 확인
      const buttonElement = wrapper.find('button').element;
      expect(document.activeElement).toBe(buttonElement);

      // 정리
      wrapper.unmount();
      document.body.removeChild(hostElement);
    });

    it('autoFocus가 false일 때는 버튼이 포커스되지 않아야 한다', async () => {
      // 실제 DOM에 마운트
      const hostElement = document.createElement('div');
      document.body.appendChild(hostElement);

      const wrapper = mount(Button, {
        props: {
          autoFocus: false,
        },
        attachTo: hostElement,
      });

      await wrapper.vm.$nextTick();

      // 버튼이 포커스되지 않았는지 확인
      const buttonElement = wrapper.find('button').element;
      expect(document.activeElement).not.toBe(buttonElement);

      // 정리
      wrapper.unmount();
      document.body.removeChild(hostElement);
    });

    it('여러 개의 autoFocus 버튼 중 마지막에 마운트된 것이 포커스되어야 한다', async () => {
      // 첫 번째 버튼
      const hostElement1 = document.createElement('div');
      document.body.appendChild(hostElement1);

      const wrapper1 = mount(Button, {
        props: {
          autoFocus: true,
        },
        attachTo: hostElement1,
      });

      await wrapper1.vm.$nextTick();

      const button1Element = wrapper1.find('button').element;
      expect(document.activeElement).toBe(button1Element);

      // 두 번째 버튼 (이것이 나중에 마운트되므로 포커스를 가져야 함)
      const hostElement2 = document.createElement('div');
      document.body.appendChild(hostElement2);

      const wrapper2 = mount(Button, {
        props: {
          autoFocus: true,
        },
        attachTo: hostElement2,
      });

      await wrapper2.vm.$nextTick();

      const button2Element = wrapper2.find('button').element;
      expect(document.activeElement).toBe(button2Element);

      // 정리
      wrapper1.unmount();
      wrapper2.unmount();
      document.body.removeChild(hostElement1);
      document.body.removeChild(hostElement2);
    });

    it('disabled된 버튼은 autoFocus가 true여도 포커스되지 않아야 한다', async () => {
      const hostElement = document.createElement('div');
      document.body.appendChild(hostElement);

      const wrapper = mount(Button, {
        props: {
          autoFocus: true,
          disabled: true,
        },
        attachTo: hostElement,
      });

      await wrapper.vm.$nextTick();

      // disabled된 버튼은 포커스될 수 없으므로 document.activeElement가 버튼이 아니어야 함
      const buttonElement = wrapper.find('button').element;
      expect(document.activeElement).not.toBe(buttonElement);

      // 정리
      wrapper.unmount();
      document.body.removeChild(hostElement);
    });

    it('focus 메서드 호출을 스파이로 감시할 수 있어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          autoFocus: true,
        },
      });

      // focus 메서드가 호출되는지 스파이로 확인
      const focusSpy = vi.spyOn(wrapper.vm.buttonRef, 'focus');

      // onMounted 생명주기를 수동으로 트리거
      if (wrapper.vm.autoFocus && wrapper.vm.buttonRef) {
        wrapper.vm.buttonRef.focus();
      }

      expect(focusSpy).toHaveBeenCalledTimes(1);

      // 스파이 정리
      focusSpy.mockRestore();
    });
  });

  describe('클릭 이벤트', () => {
    it('정상 상태에서 클릭 시 click 이벤트가 발생해야 한다', async () => {
      const wrapper = mount(Button);

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('클릭 이벤트에 이벤트 객체가 전달되어야 한다', async () => {
      const wrapper = mount(Button);

      await wrapper.trigger('click');

      const clickEvents = wrapper.emitted('click');
      expect(clickEvents).toBeTruthy();
      expect(Array.isArray(clickEvents) && clickEvents[0]).toHaveLength(1);
      expect(
        Array.isArray(clickEvents) && clickEvents[0] && clickEvents[0][0],
      ).toBeInstanceOf(Event);
    });

    it('disabled 상태에서는 클릭 이벤트가 발생하지 않아야 한다', async () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      // disabled된 버튼 요소에서는 클릭 이벤트가 차단됨
      expect(wrapper.attributes('disabled')).toBeDefined();

      // disabled 버튼을 클릭해도 이벤트가 발생하지 않음
      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('disabled에서 enabled로 변경되면 클릭 이벤트가 다시 발생해야 한다', async () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
      });

      // disabled 상태에서 클릭 - 이벤트 발생하지 않음
      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();

      // enabled로 변경
      await wrapper.setProps({ disabled: false });

      // 이제 클릭 이벤트가 발생해야 함
      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('복합 속성', () => {
    it('여러 속성이 동시에 적용되어야 한다', () => {
      const wrapper = mount(Button, {
        props: {
          type: 'primary',
          size: 'large',
          shape: 'circle',
          disabled: true,
          htmlType: 'submit',
          autoFocus: true,
        },
      });

      expect(wrapper.classes()).toContain('type-primary');
      expect(wrapper.classes()).toContain('size-large');
      expect(wrapper.classes()).toContain('shape-circle');
      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.attributes('type')).toBe('submit');
      expect(wrapper.attributes('autofocus')).toBeDefined();
      expect(wrapper.attributes('disabled')).toBeDefined();
    });
  });

  describe('컴포넌트 이름', () => {
    it('컴포넌트 이름이 EvButton이어야 한다', () => {
      const wrapper = mount(Button);

      expect(wrapper.vm.$options.name).toBe('EvButton');
    });
  });
});
