<template>
  <div>
    <datepicker
      v-model="test"
      class="evui-datepicker-temp"
    />
    value: {{ test }}
    <datepicker
      v-model="bindDay"
      :options="option"
      class="evui-datepicker-temp"
    />
    value: {{ bindDay }}
    <datepicker
      v-model="bindDay2"
      :options="option2"
      :size="'fit'"
      class="evui-datepicker-temp"
    />
    value: {{ bindDay2 }}
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
        test: null,
        bindDay: '2018-07-09',
        option: {
          selectDayType: 'day',
          initSelectDayFlag: true,
        },
        bindDay2: '2019-04-09',
        option2: {
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
