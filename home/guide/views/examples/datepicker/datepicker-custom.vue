<template>
  <div>
    <ev-datepicker
      v-model="bindDay1"
      :options="option1"
      class="ev-datepicker-temp"
    />
    <ev-datepicker
      v-model="bindDay2"
      :options="option2"
      class="ev-datepicker-temp"
    />
    <ev-datepicker
      v-model="bindDay3"
      :options="option3"
      class="ev-datepicker-temp"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        bindDay1: '2018-06-09 22:11:33',
        option1: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH:mm:ss',
        },
        bindDay2: '2018-06-09 11:01',
        option2: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH:mm',
        },
        bindDay3: '2018-06-09 09',
        option3: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH',
        },
      };
    },
    methods: {
    },
  };
</script>

<style scoped>
  .ev-datepicker-temp {
    display: inline-block;
  }
</style>
