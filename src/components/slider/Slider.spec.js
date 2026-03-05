import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvSlider from './Slider.vue';

describe('EvSlider Component', () => {
  describe('렌더링', () => {
    it('기본 슬라이더가 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50 },
      });

      expect(wrapper.find('.ev-slider').exists()).toBe(true);
    });

    it('슬라이더 라인이 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50 },
      });

      expect(wrapper.find('.ev-slider-line').exists()).toBe(true);
    });

    it('핸들이 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50 },
      });

      expect(wrapper.find('.ev-slider-handle').exists()).toBe(true);
    });

    it('range일 때 핸들이 2개 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: [20, 80], range: true },
      });

      const handles = wrapper.findAll('.ev-slider-handle');
      expect(handles).toHaveLength(2);
    });

    it('툴팁이 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50 },
      });

      expect(wrapper.find('.ev-slider-tooltip').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled이면 disabled 클래스가 적용된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50, disabled: true },
      });

      expect(wrapper.find('.ev-slider.disabled').exists()).toBe(true);
    });

    it('readonly이면 readonly 클래스가 적용된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50, readonly: true },
      });

      expect(wrapper.find('.ev-slider.readonly').exists()).toBe(true);
    });

    it('showTooltip이 false이면 hide-tooltip 클래스가 적용된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50, showTooltip: false },
      });

      expect(wrapper.find('.ev-slider.hide-tooltip').exists()).toBe(true);
    });

    it('showStep이 true이고 step이 있으면 step이 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: { modelValue: 50, showStep: true, step: 25 },
      });

      expect(wrapper.find('.ev-slider-step-wrapper').exists()).toBe(true);
    });

    it('mark가 설정되면 마크가 렌더링된다', () => {
      const wrapper = mount(EvSlider, {
        props: {
          modelValue: 50,
          mark: { 0: '0', 50: '50', 100: '100' },
        },
      });

      expect(wrapper.find('.ev-slider.show-mark').exists()).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvSlider이다', () => {
      expect(EvSlider.name).toBe('EvSlider');
    });

    it('기본 min은 0이다', () => {
      expect(EvSlider.props.min.default).toBe(0);
    });

    it('기본 max는 100이다', () => {
      expect(EvSlider.props.max.default).toBe(100);
    });

    it('기본 step은 1이다', () => {
      expect(EvSlider.props.step.default).toBe(1);
    });

    it('기본 disabled는 false이다', () => {
      expect(EvSlider.props.disabled.default).toBe(false);
    });

    it('기본 readonly는 false이다', () => {
      expect(EvSlider.props.readonly.default).toBe(false);
    });

    it('기본 range는 false이다', () => {
      expect(EvSlider.props.range.default).toBe(false);
    });

    it('기본 showTooltip은 true이다', () => {
      expect(EvSlider.props.showTooltip.default).toBe(true);
    });

    it('기본 showInput은 false이다', () => {
      expect(EvSlider.props.showInput.default).toBe(false);
    });

    it('기본 showStep은 false이다', () => {
      expect(EvSlider.props.showStep.default).toBe(false);
    });
  });
});
