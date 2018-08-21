<template>
  <div>
    <div>
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
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import datepicker from '@/components/datepicker';
  import calendar from '@/components/datepicker/calendar';

  export default {
    components: {
      datepicker,
      calendar,
    },
    data() {
      return {
        toggleFlag: true,
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
      };
    },
    methods: {
    },
  };
</script>

<style>
  .evui-calendar-temp {
    display: inline-block;
  }
</style>
