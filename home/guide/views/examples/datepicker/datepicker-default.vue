<template>
  <div>
    <datepicker
      class="evui-datepicker-temp"
    />
    <datepicker
      v-model="bindDay"
      :options="option"
      class="evui-datepicker-temp"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import datepicker from '@/components/datepicker';

  export default {
    components: {
      datepicker,
    },
    data() {
      return {
        bindDay: '2018-07-09',
        option: {
          selectDayType: 'day',
          initSelectDayFlag: true,
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
