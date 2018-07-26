<template>
  <div>
    <div
      ref="datepickerRef"
      class="evui-calendar"
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
//      this.selectDay = this.calendar.setSelectDays();
//      this.updateSelectDay();
    },
    beforeDestroy() {
    },
    methods: {
      updateSelectOneDay() {
        const selectDayObj = this.calendar.setSelectDays();
        this.$emit('input', `${selectDayObj[0].year}-${this.lpad10(selectDayObj[0].month)}-${this.lpad10(selectDayObj[0].day)}`);
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
  .evui-calendar {
    position: relative;
    width: 235px;
    height: 200px;
  }
</style>
