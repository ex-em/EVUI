<template>
  <div>
    <div>
      <datepicker
      />
      <datepicker
        :cal-obj="obj2"
      />
      <datepicker
        :cal-obj="obj3"
      />
    </div>
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
        toggleFlag: true,
        obj2: {
          selectDayType: 'weekday',
        },
        obj3: {
          selectDayType: 'week',
        },
      };
    },
    methods: {
    },
  };
</script>

<style>
</style>
