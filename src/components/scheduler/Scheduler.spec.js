import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvScheduler from './Scheduler.vue';

describe('EvScheduler Component', () => {
  const createModelValue = (rows = 24, cols = 7) =>
    Array.from({ length: rows }, () => Array(cols).fill(false));

  describe('렌더링', () => {
    it('기본 스케줄러가 렌더링된다', () => {
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue() },
      });

      expect(wrapper.find('.ev-scheduler').exists()).toBe(true);
    });

    it('헤더 라벨이 렌더링된다', () => {
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue() },
      });

      const headers = wrapper.findAll('.ev-scheduler-header-label');
      expect(headers).toHaveLength(7);
    });

    it('바디 라벨이 렌더링된다', () => {
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue() },
      });

      const bodyLabels = wrapper.findAll('.ev-scheduler-body-label');
      expect(bodyLabels).toHaveLength(24);
    });

    it('셀 박스들이 렌더링된다', () => {
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue() },
      });

      const boxes = wrapper.findAll('.ev-scheduler-body-box');
      expect(boxes).toHaveLength(24 * 7);
    });
  });

  describe('Props', () => {
    it('커스텀 colLabels가 적용된다', () => {
      const colLabels = ['월', '화', '수'];
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue(24, 3), colLabels },
      });

      const headers = wrapper.findAll('.ev-scheduler-header-label');
      expect(headers).toHaveLength(3);
    });

    it('커스텀 rowLabels가 적용된다', () => {
      const rowLabels = ['오전', '오후'];
      const wrapper = mount(EvScheduler, {
        props: { modelValue: createModelValue(2), rowLabels },
      });

      const bodyLabels = wrapper.findAll('.ev-scheduler-body-label');
      expect(bodyLabels).toHaveLength(2);
    });

    it('선택된 셀에 selected 클래스가 적용된다', () => {
      const mv = createModelValue();
      mv[0][0] = true;
      const wrapper = mount(EvScheduler, {
        props: { modelValue: mv },
      });

      const selectedBoxes = wrapper.findAll('.ev-scheduler-body-box.selected');
      expect(selectedBoxes.length).toBeGreaterThan(0);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvScheduler이다', () => {
      expect(EvScheduler.name).toBe('EvScheduler');
    });
  });
});
