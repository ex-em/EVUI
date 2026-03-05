import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvProgress from './Progress.vue';

describe('EvProgress Component', () => {
  describe('렌더링', () => {
    it('기본 프로그레스가 렌더링된다', () => {
      const wrapper = mount(EvProgress);

      expect(wrapper.find('.ev-progress').exists()).toBe(true);
      expect(wrapper.find('.ev-progress-wrapper').exists()).toBe(true);
      expect(wrapper.find('.ev-progress-inner').exists()).toBe(true);
    });

    it('slot 내용이 label로 렌더링된다', () => {
      const wrapper = mount(EvProgress, {
        slots: {
          default: '50%',
        },
      });

      expect(wrapper.find('.ev-progress-label').exists()).toBe(true);
      expect(wrapper.text()).toContain('50%');
    });

    it('slot이 없으면 label이 렌더링되지 않는다', () => {
      const wrapper = mount(EvProgress);

      expect(wrapper.find('.ev-progress-label').exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('modelValue에 따라 inner 너비가 설정된다', () => {
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50 },
      });

      const inner = wrapper.find('.ev-progress-inner');
      expect(inner.element.style.width).toBe('50%');
    });

    it('color prop이 배경색으로 적용된다', () => {
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50, color: '#FF0000' },
      });

      const inner = wrapper.find('.ev-progress-inner');
      expect(inner.element.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('strokeWidth prop이 wrapper 높이에 적용된다', () => {
      const wrapper = mount(EvProgress, {
        props: { strokeWidth: 10 },
      });

      const wrapperEl = wrapper.find('.ev-progress-wrapper');
      expect(wrapperEl.element.style.height).toBe('10px');
    });

    it('innerText prop이 렌더링된다', () => {
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50, innerText: '50%' },
      });

      expect(wrapper.find('.ev-progress-inner-text').exists()).toBe(true);
      expect(wrapper.find('.ev-progress-inner-text').text()).toBe('50%');
    });

    it('innerText가 빈 문자열이면 inner-text가 렌더링되지 않는다', () => {
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50 },
      });

      expect(wrapper.find('.ev-progress-inner-text').exists()).toBe(false);
    });

    it('color가 배열이면 값에 따라 색상이 결정된다', () => {
      const colorList = [
        { value: 30, color: '#FF0000' },
        { value: 70, color: '#FFFF00' },
        { value: 100, color: '#00FF00' },
      ];
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50, color: colorList },
      });

      const inner = wrapper.find('.ev-progress-inner');
      expect(inner.element.style.backgroundColor).toBe('rgb(255, 255, 0)');
    });
  });

  describe('기본값', () => {
    it('기본 modelValue는 0이다', () => {
      const wrapper = mount(EvProgress);

      const inner = wrapper.find('.ev-progress-inner');
      expect(inner.element.style.width).toBe('0%');
    });

    it('기본 strokeWidth는 6이다', () => {
      const wrapper = mount(EvProgress);

      const wrapperEl = wrapper.find('.ev-progress-wrapper');
      expect(wrapperEl.element.style.height).toBe('6px');
    });

    it('기본 color는 #409EFF이다', () => {
      const wrapper = mount(EvProgress, {
        props: { modelValue: 50 },
      });

      const inner = wrapper.find('.ev-progress-inner');
      expect(inner.element.style.backgroundColor).toBe('rgb(64, 158, 255)');
    });
  });
});
