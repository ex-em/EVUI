<template>
  <div>
    <ev-datepicker
      v-model="bindDay1"
      :options="option1"
      :size="'fit'"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay1 }}
    <ev-datepicker
      v-model="bindDay2"
      :options="option2"
      :size="'fit'"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay2 }}
    <br><br><br><br><br>
    <ev-datepicker
      v-model="bindDay3"
      :options="option3"
      :size="'fit'"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay3 }}
    <ev-datepicker
      v-model="bindDay4"
      :options="option4"
      :size="'fit'"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay4 }}
    <br><br><br><br><br>
    <ev-datepicker
      v-model="bindDay5"
      :options="option5"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay5 }}
    <ev-datepicker
      v-model="bindDay6"
      :options="option6"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay6 }}
    <br><br><br><br><br>
    <ev-datepicker
      v-model="bindDay7"
      :options="option7"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay7 }}
    <ev-datepicker
      v-model="bindDay8"
      :options="option8"
      class="ev-datepicker-temp"
    />
    value: {{ bindDay8 }}
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
        bindDay4: '2018-06-09',
        option4: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
        },
        bindDay5: null,
        option5: {
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH:mm:ss',
        },
        bindDay6: '20180830',
        option6: {
          timeExpand: true,
          initSelectDayFlag: true,
          localeType: 'YYYY-MM-DD HH:mm:ss',
        },
        bindDay7: '20180830112233',
        option7: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH:mm:ss',
        },
        bindDay8: '20180830999999',
        option8: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'YYYY-MM-DD HH:mm:ss',
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
