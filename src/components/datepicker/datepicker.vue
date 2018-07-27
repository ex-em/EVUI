<template>
  <div
    v-click-outside="hideDatepicker"
    class="evui-datepicker"
    @click="showDatepicker"
  >
    <div
      :class="wrapClasses"
      class="evui-datepicker-input-wrapper"
    >
      <input
        ref="datepickerText"
        v-model="dataValue"
        :class="inputClasses"
        class="evui-datepicker-input"
        type="text"
        placeholder=" yyyy-mm-dd "
      >
    </div>
    <div
      ref="calendarWrapperRef"
      :class="options.twoPageShow ? 'expand' : ''"
      class="evui-calendar-wrapper"
    >
      <calendar
        v-model="dataValue"
        :datepicker-options="mergedOption"
      />
    </div>
  </div>
</template>

<script>
  import calendar from '@/components/datepicker/calendar';
  import moment from 'moment';

  const prefixCls = 'evui-input-text';

  export default {
    components: {
      calendar,
      moment,
    },
    directives: {
      // 해당 element 외의 클릭 시
      'click-outside': {
        bind(el, binding) {
          const element = el;
          const bind = binding;
          // Define Handler and cache it on the element
          const bubble = bind.modifiers.bubble;
          const handler = (e) => {
            if (bubble || (!element.contains(e.target) && element !== e.target)) {
              bind.value(e);
            }
          };
          element.__vueClickOutside__ = handler;
          // add Event Listeners
          document.addEventListener('click', handler);
        },
        unbind(el) {
          const element = el;
          // Remove Event Listeners
          document.removeEventListener('click', element.__vueClickOutside__);
          element.__vueClickOutside__ = null;
        },
      },
    },
    props: {
      value: {
        type: String,
        default() {
          return null;
        },
      },
      options: {
        type: Object,
        default() {
          return {
            initSelectDay: this.$props.value ? new Date(this.$props.value) : null,
          };
        },
      },
    },
    data() {
      return {
        dataValue: this.value,
      };
    },
    computed: {
      wrapClasses() {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-disabled`]: this.disabled,
          },
        ];
      },
      inputClasses() {
        return `${prefixCls}-input`;
      },
      mergedOption() {
        let flag = false;
        if (this.$props.value) {
          flag = true;
        }
        return Object.assign(this.$props.options, {
          initSelectDayFlag: flag,
          initSelectDay: this.$props.value ? new Date(this.$props.value) : new Date(),
        });
      },
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
      showDatepicker() {
        this.$refs.calendarWrapperRef.style.height = '220px';
      },
      hideDatepicker() {
        this.$refs.calendarWrapperRef.style.height = '0px';
      },
    },
  };
</script>

<style scoped>
  .evui-datepicker {
    width: 235px;
  }
  .evui-datepicker-input {
    width: 235px;
    height: 32px;
    line-height: 32px;
  }
  .evui-datepicker-input-wrapper {
    width: 235px;
    height: 32px;
  }
  .evui-calendar-wrapper {
    position: absolute;
    width: 235px;
    height: 0px;
    overflow: hidden;
    transition: height .3s ease-in-out;
  }
  .evui-calendar-wrapper.expand {
    width: 470px;
  }
</style>
