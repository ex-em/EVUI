import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EvCheckboxGroup from './CheckboxGroup.vue';
import EvCheckbox from '../checkbox/Checkbox.vue';

describe('EvCheckboxGroup + EvCheckbox Integration', () => {
  // 헬퍼: 실제 컴포넌트로 마운트 (slots 문자열 대신)
  const mountWithRealCheckboxes = (groupProps = {}, checkboxConfigs = []) =>
    mount({
      template: `
        <EvCheckboxGroup v-model="selected" @change="onChange">
          <EvCheckbox
            v-for="item in items"
            :key="item.label"
            :label="item.label"
            :disabled="item.disabled"
          />
        </EvCheckboxGroup>
      `,
      components: { EvCheckboxGroup, EvCheckbox },
      data() {
        return {
          selected: groupProps.modelValue || [],
          items: checkboxConfigs,
        };
      },
      methods: {
        onChange: groupProps.onChange || (() => {}),
      },
    });

  describe('기본 연동', () => {
    it('체크박스 클릭 시 그룹의 modelValue가 업데이트된다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple' },
        { label: 'Banana' },
        { label: 'Cherry' },
      ]);

      // 첫 번째 체크박스 클릭
      const checkboxes = wrapper.findAllComponents(EvCheckbox);
      await checkboxes[0].find('input').setValue(true);

      expect(wrapper.vm.selected).toContain('Apple');
    });

    it('여러 체크박스를 선택할 수 있다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple' },
        { label: 'Banana' },
        { label: 'Cherry' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      // 여러 개 선택
      await checkboxes[0].find('input').setValue(true);
      await checkboxes[2].find('input').setValue(true);

      expect(wrapper.vm.selected).toContain('Apple');
      expect(wrapper.vm.selected).toContain('Cherry');
      expect(wrapper.vm.selected).not.toContain('Banana');
    });

    it('선택된 체크박스를 다시 클릭하면 해제된다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: ['Apple'] }, [
        { label: 'Apple' },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      // Apple 해제
      await checkboxes[0].find('input').setValue(false);

      expect(wrapper.vm.selected).not.toContain('Apple');
    });
  });

  describe('초기값 반영', () => {
    it('그룹의 초기 modelValue가 체크박스에 반영된다', () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: ['Banana', 'Cherry'] }, [
        { label: 'Apple' },
        { label: 'Banana' },
        { label: 'Cherry' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      expect(checkboxes[0].find('input').element.checked).toBe(false);
      expect(checkboxes[1].find('input').element.checked).toBe(true);
      expect(checkboxes[2].find('input').element.checked).toBe(true);
    });

    it('빈 초기값에서 모든 체크박스가 해제 상태이다', () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple' },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      checkboxes.forEach((checkbox) => {
        expect(checkbox.find('input').element.checked).toBe(false);
      });
    });
  });

  describe('change 이벤트', () => {
    it('체크박스 변경 시 그룹의 change 이벤트가 발생한다', async () => {
      const onChange = vi.fn();
      const wrapper = mountWithRealCheckboxes({ modelValue: [], onChange }, [
        { label: 'Apple' },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);
      await checkboxes[0].find('input').setValue(true);
      await nextTick();

      expect(onChange).toHaveBeenCalled();
    });

    it('change 이벤트에 현재 선택된 값 배열이 전달된다', async () => {
      const onChange = vi.fn();
      const wrapper = mountWithRealCheckboxes({ modelValue: ['Apple'], onChange }, [
        { label: 'Apple' },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);
      await checkboxes[1].find('input').setValue(true);
      await nextTick();

      // change 이벤트의 첫 번째 인자가 선택된 값 배열
      const callArgs = onChange.mock.calls[0];
      expect(callArgs[0]).toContain('Apple');
      expect(callArgs[0]).toContain('Banana');
    });
  });

  describe('disabled 상태', () => {
    it('disabled 체크박스는 선택할 수 없다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple', disabled: true },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      // disabled된 체크박스의 input은 disabled 속성을 가짐
      expect(checkboxes[0].find('input').element.disabled).toBe(true);
      expect(checkboxes[1].find('input').element.disabled).toBe(false);
    });

    it('disabled 체크박스는 초기값으로 선택된 상태를 유지한다', () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: ['Apple'] }, [
        { label: 'Apple', disabled: true },
        { label: 'Banana' },
      ]);

      const checkboxes = wrapper.findAllComponents(EvCheckbox);

      expect(checkboxes[0].find('input').element.checked).toBe(true);
      expect(checkboxes[0].find('input').element.disabled).toBe(true);
    });
  });

  describe('동적 변경', () => {
    it('외부에서 modelValue를 변경하면 체크박스에 반영된다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple' },
        { label: 'Banana' },
      ]);

      // 외부에서 값 변경
      wrapper.vm.selected = ['Banana'];
      await nextTick();

      const checkboxes = wrapper.findAllComponents(EvCheckbox);
      expect(checkboxes[0].find('input').element.checked).toBe(false);
      expect(checkboxes[1].find('input').element.checked).toBe(true);
    });

    it('전체 선택/해제가 동작한다', async () => {
      const wrapper = mountWithRealCheckboxes({ modelValue: [] }, [
        { label: 'Apple' },
        { label: 'Banana' },
        { label: 'Cherry' },
      ]);

      // 전체 선택
      wrapper.vm.selected = ['Apple', 'Banana', 'Cherry'];
      await nextTick();

      const checkboxes = wrapper.findAllComponents(EvCheckbox);
      checkboxes.forEach((checkbox) => {
        expect(checkbox.find('input').element.checked).toBe(true);
      });

      // 전체 해제
      wrapper.vm.selected = [];
      await nextTick();

      checkboxes.forEach((checkbox) => {
        expect(checkbox.find('input').element.checked).toBe(false);
      });
    });
  });
});
