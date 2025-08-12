import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Button from '@/components/button/Button';

describe('Button.vue', () => {
  describe('기본 렌더링', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
      const wrapper = shallowMount(Button);
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.element.tagName).toBe('BUTTON');
      expect(wrapper.classes()).toContain('ev-button');
    });

    it('슬롯 컨텐츠가 정상적으로 표시되어야 함', () => {
      const slotContent = 'Test Button';
      const wrapper = mount(Button, {
        slots: {
          default: slotContent,
        },
      });
      expect(wrapper.text()).toBe(slotContent);
    });
  });

  describe('Props 테스트', () => {
    describe('disabled prop', () => {
      it('disabled가 false일 때 버튼이 활성화되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { disabled: false },
        });
        expect(wrapper.attributes('disabled')).toBeUndefined();
        expect(wrapper.classes()).not.toContain('disabled');
      });

      it('disabled가 true일 때 버튼이 비활성화되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { disabled: true },
        });
        expect(wrapper.attributes('disabled')).toBeDefined();
        expect(wrapper.classes()).toContain('disabled');
      });
    });

    describe('type prop', () => {
      const types = ['default', 'primary', 'info', 'warning', 'error', 'ghost', 'dashed', 'text'];

      types.forEach((type) => {
        it(`type이 "${type}"일 때 적절한 클래스가 적용되어야 함`, () => {
          const wrapper = shallowMount(Button, {
            props: { type },
          });
          expect(wrapper.classes()).toContain(`type-${type}`);
        });
      });

      it('기본 type은 "default"이어야 함', () => {
        const wrapper = shallowMount(Button);
        expect(wrapper.classes()).toContain('type-default');
      });
    });

    describe('htmlType prop', () => {
      const htmlTypes = ['button', 'submit', 'reset'];

      htmlTypes.forEach((htmlType) => {
        it(`htmlType이 "${htmlType}"일 때 type 속성이 설정되어야 함`, () => {
          const wrapper = shallowMount(Button, {
            props: { htmlType },
          });
          expect(wrapper.attributes('type')).toBe(htmlType);
        });
      });

      it('기본 htmlType은 "button"이어야 함', () => {
        const wrapper = shallowMount(Button);
        expect(wrapper.attributes('type')).toBe('button');
      });

      it('잘못된 htmlType은 유효성 검사에 실패해야 함', () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        mount(Button, {
          props: { htmlType: 'invalid' },
        });
        expect(consoleWarn).toHaveBeenCalled();
        consoleWarn.mockRestore();
      });
    });

    describe('shape prop', () => {
      it('shape이 "square"일 때 추가 클래스가 없어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { shape: 'square' },
        });
        expect(wrapper.classes()).not.toContain('shape-square');
      });

      it('shape이 "radius"일 때 shape-radius 클래스가 적용되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { shape: 'radius' },
        });
        expect(wrapper.classes()).toContain('shape-radius');
      });

      it('shape이 "circle"일 때 shape-circle 클래스가 적용되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { shape: 'circle' },
        });
        expect(wrapper.classes()).toContain('shape-circle');
      });
    });

    describe('size prop', () => {
      it('size가 "medium"일 때 추가 클래스가 없어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { size: 'medium' },
        });
        expect(wrapper.classes()).not.toContain('size-medium');
      });

      it('size가 "small"일 때 size-small 클래스가 적용되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { size: 'small' },
        });
        expect(wrapper.classes()).toContain('size-small');
      });

      it('size가 "large"일 때 size-large 클래스가 적용되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { size: 'large' },
        });
        expect(wrapper.classes()).toContain('size-large');
      });
    });

    describe('autoFocus prop', () => {
      it('autoFocus가 false일 때 autofocus 속성이 없어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { autoFocus: false },
        });
        expect(wrapper.attributes('autofocus')).toBeUndefined();
      });

      it('autoFocus가 true일 때 autofocus 속성이 설정되어야 함', () => {
        const wrapper = shallowMount(Button, {
          props: { autoFocus: true },
        });
        expect(wrapper.attributes('autofocus')).toBeDefined();
      });

      it('autoFocus가 true일 때 마운트 후 포커스가 설정되어야 함', async () => {
        const wrapper = mount(Button, {
          props: { autoFocus: true },
          attachTo: document.body,
        });

        await nextTick();
        expect(wrapper.element).toBe(document.activeElement);
        wrapper.unmount();
      });
    });
  });

  describe('이벤트 테스트', () => {
    it('클릭 시 click 이벤트가 발생해야 함', async () => {
      const wrapper = shallowMount(Button);

      await wrapper.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('disabled 상태에서는 클릭 이벤트가 발생하지 않음', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
      });

      await wrapper.trigger('click');

      // disabled된 버튼에서는 브라우저가 이벤트 자체를 차단함
      expect(wrapper.emitted()).not.toHaveProperty('click');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('클릭 이벤트에 정확한 이벤트 객체가 전달되어야 함', async () => {
      const wrapper = shallowMount(Button);

      await wrapper.trigger('click');

      const clickEvents = wrapper.emitted('click');
      expect(clickEvents[0][0]).toBeInstanceOf(Event);
    });
  });

  describe('복합 Props 테스트', () => {
    it('여러 props를 조합했을 때 모든 클래스가 적용되어야 함', () => {
      const wrapper = shallowMount(Button, {
        props: {
          type: 'primary',
          shape: 'radius',
          size: 'large',
          disabled: true,
        },
      });

      expect(wrapper.classes()).toContain('ev-button');
      expect(wrapper.classes()).toContain('type-primary');
      expect(wrapper.classes()).toContain('shape-radius');
      expect(wrapper.classes()).toContain('size-large');
      expect(wrapper.classes()).toContain('disabled');
    });

    it('text 타입과 circle 모양이 함께 적용되어야 함', () => {
      const wrapper = shallowMount(Button, {
        props: {
          type: 'text',
          shape: 'circle',
        },
      });

      expect(wrapper.classes()).toContain('type-text');
      expect(wrapper.classes()).toContain('shape-circle');
    });
  });

  describe('접근성 테스트', () => {
    it('버튼 요소가 올바른 role을 가져야 함', () => {
      const wrapper = shallowMount(Button);
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('disabled 상태에서 키보드 접근이 제한되어야 함', () => {
      const wrapper = shallowMount(Button, {
        props: { disabled: true },
      });
      expect(wrapper.attributes('disabled')).toBeDefined();
    });
  });

  describe('에지 케이스 테스트', () => {
    it('빈 슬롯이어도 정상적으로 렌더링되어야 함', () => {
      const wrapper = shallowMount(Button);
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toBe('');
    });

    it('props 변경 시 반응형으로 업데이트되어야 함', async () => {
      const wrapper = shallowMount(Button, {
        props: { disabled: false },
      });

      expect(wrapper.classes()).not.toContain('disabled');

      await wrapper.setProps({ disabled: true });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('type prop 변경 시 클래스가 업데이트되어야 함', async () => {
      const wrapper = shallowMount(Button, {
        props: { type: 'default' },
      });

      expect(wrapper.classes()).toContain('type-default');
      expect(wrapper.classes()).not.toContain('type-primary');

      await wrapper.setProps({ type: 'primary' });

      expect(wrapper.classes()).toContain('type-primary');
      expect(wrapper.classes()).not.toContain('type-default');
    });
  });
});
