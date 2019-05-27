<template>
  <div>
    <div
      class="ev-calendar-temp-wrapper"
    >
      <calendar
        ref="calendarRef"
        :datepicker-options="obj1"
        class="evui-calendar-temp"
      />
      <calendar
        ref="calendarRef"
        :datepicker-options="obj2"
        class="evui-calendar-temp"
      />
      <calendar
        ref="calendarRef"
        :datepicker-options="obj3"
        class="evui-calendar-temp"
      />
      <calendar
        ref="calendarRef"
        :datepicker-options="obj4"
        class="evui-calendar-temp"
      />
      <br>
      날짜 클릭 제한 없음<br>
      selectDayType: 'day', selectDayLimit: 1,<br>
      selectDayType: 'weekday', selectDayLimit: 1,<br>
      selectDayType: 'week', selectDayLimit: 1,<br>
      selectDayType: 'day', selectDayLimit: 7,<br>
      <br><br>
      <calendar
        ref="calendarRef"
        :datepicker-options="obj5"
        class="evui-calendar-temp"
      />
      <calendar
        ref="calendarRef"
        :datepicker-options="obj6"
        class="evui-calendar-temp"
      />
      <br>
      날짜 클릭 제한 있음 (selectDayType: 'day' 일 때만 가능 / limitToday: true)<br>
      initSelectDayFlag: false, initLimitDay: 어제<br>
      initSelectDayFlag: true(default), initLimitDay: 어제, initSelectDay: 어제<br>
      <br><br>
    </div>
  </div>
</template>

<script>
  import datepicker from '@/components/datepicker';
  import calendar from '@/components/datepicker/calendar';

  export default {
    components: {
      datepicker,
      calendar,
    },
    data() {
      return {
        obj1: {
          dropdownFlag: false,
        },
        obj2: {
          selectDayType: 'weekday',
          dropdownFlag: false,
        },
        obj3: {
          selectDayType: 'week',
          dropdownFlag: false,
        },
        obj4: {
          dropdownFlag: false,
          selectDayType: 'day',
          selectDayLimit: 7,
          initSelectDayFlag: false,
          titleType: {
            month: 'numberName',
            dayOfTheWeek: 'abbrLowerName',
          },
        },
        obj5: {
          dropdownFlag: false,
          limitToday: true,
          initSelectDayFlag: false,
          initLimitDay: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
        obj6: {
          dropdownFlag: false,
          limitToday: true,
          initSelectDay: new Date(new Date().setDate(new Date().getDate() - 1)),
          initLimitDay: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      };
    },
    methods: {
    },
  };
</script>

<style>
  .ev-calendar-temp-wrapper {
    user-select: none;
  }
  .evui-calendar-temp {
    display: inline-block;
  }
</style>
