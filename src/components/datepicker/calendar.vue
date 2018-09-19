<template>
  <div>
    <div
      ref="datepickerRef"
      class="ev-calendar"
      @click.stop.prevent="updateSelectOneDay"
    />
  </div>
</template>

<script>
  import Calendar from '@/components/datepicker/calendar.core';

  export default {
    components: {
      Calendar,
    },
    props: {
      value: {
        type: String,
        default() {
          return null;
        },
      },
      datepickerOptions: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        calendar: null,
        selectDay: null,
      };
    },
    computed: {
      mergedOption() {
        return Object.assign(this.$props.datepickerOptions, {
          initSelectDay: this.$props.value ? new Date(this.$props.value) : null,
        });
      },
    },
    created() {
    },
    mounted() {
      let mergeOption = this.$props.datepickerOptions;
      if (this.$props.value) {
        mergeOption = Object.assign(this.$props.datepickerOptions, {
          initSelectDay: new Date(this.$props.value),
        });
      }
      this.calendar = new Calendar(this.$refs.datepickerRef, mergeOption);
    },
    beforeDestroy() {
    },
    methods: {
      updateSelectOneDay() {
        const selectDateTime = this.calendar.getSelectDateTime();
        this.$emit('input', selectDateTime);
      },
      lpad10(v) {
        let value = v;
        if (value < 10) {
          if (value.length) {
            value = `0${Number(value)}`;
          } else {
            value = `0${value}`;
          }
        } else {
          value = `${value}`;
        }
        return value;
      },
    },
  };
</script>

<style scoped>
  .ev-calendar {
    position: relative;
    width: inherit;
    height: 220px;
  }
</style>
