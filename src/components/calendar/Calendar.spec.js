import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvCalendar from './Calendar.vue';

describe('EvCalendar Component', () => {
  describe('렌더링', () => {
    it('기본 캘린더가 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      expect(wrapper.find('.ev-calendar-wrapper').exists()).toBe(true);
    });

    it('헤더에 년/월이 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      expect(wrapper.find('.ev-calendar-header').exists()).toBe(true);
      expect(wrapper.find('.ev-calendar-year').exists()).toBe(true);
      expect(wrapper.find('.ev-calendar-month').exists()).toBe(true);
    });

    it('요일 헤더가 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      const headers = wrapper.findAll('.ev-calendar-table th');
      expect(headers).toHaveLength(7);
    });

    it('날짜 테이블이 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      expect(wrapper.find('.ev-calendar-table').exists()).toBe(true);
      const dateCells = wrapper.findAll('.ev-calendar-date-td');
      expect(dateCells.length).toBeGreaterThan(0);
    });

    it('이전/다음 버튼이 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      const arrows = wrapper.findAll('.move-month-arrow');
      expect(arrows).toHaveLength(2);
    });
  });

  describe('Props', () => {
    it('dateRange 모드에서 캘린더가 2개 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: ['2024-01-15', '2024-02-15'], mode: 'dateRange' },
      });

      const dateAreas = wrapper.findAll('.ev-calendar-date-area');
      expect(dateAreas).toHaveLength(2);
    });

    it('dateTime 모드에서 시간 영역이 렌더링된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15 10:30:00', mode: 'dateTime' },
      });

      expect(wrapper.find('.ev-calendar-time-area').exists()).toBe(true);
    });

    it('선택된 날짜에 selected 클래스가 적용된다', () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      const selectedCells = wrapper.findAll('.ev-calendar-date-td.selected');
      expect(selectedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Events', () => {
    it('년도 클릭 시 년도 선택기가 표시된다', async () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      await wrapper.find('.ev-calendar-year').trigger('click');

      expect(wrapper.find('.ev-calendar-year-range').exists()).toBe(true);
    });

    it('월 클릭 시 월 선택기가 표시된다', async () => {
      const wrapper = mount(EvCalendar, {
        props: { modelValue: '2024-01-15' },
      });

      await wrapper.find('.ev-calendar-month').trigger('click');

      expect(wrapper.find('.ev-calendar-selector-table--month').exists()).toBe(true);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvCalendar이다', () => {
      expect(EvCalendar.name).toBe('EvCalendar');
    });

    it('기본 mode는 date이다', () => {
      expect(EvCalendar.props.mode.default).toBe('date');
    });

    it('기본 monthNotation은 fullName이다', () => {
      expect(EvCalendar.props.monthNotation.default).toBe('fullName');
    });

    it('기본 dayOfTheWeekNotation은 abbrUpperName이다', () => {
      expect(EvCalendar.props.dayOfTheWeekNotation.default).toBe('abbrUpperName');
    });
  });
});
