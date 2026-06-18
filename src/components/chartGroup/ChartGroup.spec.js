import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EvChartGroup from './ChartGroup.vue';

describe('EvChartGroup Component', () => {
  describe('기본값', () => {
    it('컴포넌트 이름이 EvChartGroup이다', () => {
      expect(EvChartGroup.name).toBe('EvChartGroup');
    });

    it('기본 options는 빈 객체이다', () => {
      expect(EvChartGroup.props.options.default()).toEqual({});
    });

    it('기본 zoomStartIdx는 0이다', () => {
      expect(EvChartGroup.props.zoomStartIdx.default).toBe(0);
    });

    it('기본 zoomEndIdx는 0이다', () => {
      expect(EvChartGroup.props.zoomEndIdx.default).toBe(0);
    });

    it('기본 groupSelectedLabel은 null이다', () => {
      expect(EvChartGroup.props.groupSelectedLabel.default).toBeNull();
    });
  });

  describe('deferPollingRedraw', () => {
    // 슬롯 자식이 그룹의 provide('groupInteraction') 를 inject 하도록 실제 중첩 구조를 재현한다.
    const Capture = {
      name: 'Capture',
      inject: ['groupInteraction'],
      render: () => null,
    };
    const Root = {
      components: { EvChartGroup, Capture },
      template: '<ev-chart-group><Capture /></ev-chart-group>',
    };

    const mountGroup = () => {
      const wrapper = mount(Root, { global: { directives: { resize: {} } } });
      const gi = wrapper.findComponent(Capture).vm.groupInteraction;
      const deferPollingRedraw = wrapper.findComponent(EvChartGroup).vm.deferPollingRedraw;
      return { wrapper, gi, deferPollingRedraw };
    };

    // 시계가 performance.now() 라 fake timer 로 고정해 정확 비교한다(시간 진행 없음).
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date', 'performance'] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('인자 없으면 기본 800ms 양보(deferUntil = now+800)', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw();
      expect(gi.deferUntil).toBe(now + 800);
    });

    it('durationMs 인자를 반영한다', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw(1200);
      expect(gi.deferUntil).toBe(now + 1200);
    });

    it('상한(MAX_DEFER_MS=2000) 으로 clamp 된다', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw(5000);
      expect(gi.deferUntil).toBe(now + 2000);
    });

    it('음수는 0 으로 clamp 된다(deferUntil = now)', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw(-100);
      expect(gi.deferUntil).toBe(now);
    });

    it('NaN/비유한값은 기본 800ms 로 대체된다', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw(NaN);
      expect(gi.deferUntil).toBe(now + 800);
    });

    it('Math.max 로 연장만 하고 더 짧은 호출로 줄어들지 않는다', () => {
      const { gi, deferPollingRedraw } = mountGroup();
      const now = performance.now();
      deferPollingRedraw(500);
      deferPollingRedraw(300);
      expect(gi.deferUntil).toBe(now + 500);
    });

    it('return 노출(expose 미사용): 기존 멤버 + deferPollingRedraw 가 모두 접근 가능', () => {
      const { wrapper } = mountGroup();
      const vm = wrapper.findComponent(EvChartGroup).vm;
      expect(typeof vm.deferPollingRedraw).toBe('function');
      expect(typeof vm.onClickToolbar).toBe('function');
      expect('zoomOptions' in vm).toBe(true);
      expect('evChartGroupRef' in vm).toBe(true);
    });
  });
});
