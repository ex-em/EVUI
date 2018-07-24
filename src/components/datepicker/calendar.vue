<template>
  <div
    ref="datepickerRef"
    :style="{width: `${dataObj.width}px`, height: `${dataObj.height}px`}"
    class="evui-calendar"
  />
</template>

<script>
  import Calendar from '@/components/datepicker/calendar.core';

  export default {
    components: {
      Calendar,
    },
    props: {
      dataObj: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        calendar: null,
      };
    },
    computed: {
    },
    created() {
    },
    mounted() {
      this.calendar = new Calendar(this.$refs.datepickerRef, this.$props.dataObj);
    },
    beforeDestroy() {
    },
    methods: {
    },
  };
</script>

<style scoped>
</style>
