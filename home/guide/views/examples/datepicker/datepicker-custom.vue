<template>
  <div>
    <ev-datepicker
      v-model="bindDay"
      :options="option"
      class="evui-datepicker-temp"
    />
    <br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        bindDay: '2018-06-09 00:00:00',
        option: {
          selectDayType: 'day',
          initSelectDayFlag: true,
          timeExpand: true,
          localeType: 'Y-m-d H:i:s',
        },
      };
    },
    methods: {
    },
  };
</script>

<style scoped>
  .evui-datepicker-temp {
    display: inline-block;
  }
</style>
