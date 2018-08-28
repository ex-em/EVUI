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
  </div>
</template>

<script>
  import Calendar from '@/components/datepicker/calendar.core';
  import moment from 'moment';

  const prefixCls = 'evui-input-text';

  export default {
    components: {
      moment,
    },
    directives: {
      // 해당 element 외의 클릭 시
      'click-outside': {
        bind(el, binding, vnode) {
          const element = el;
          const bind = binding;
          const calendarDropdown = document.getElementsByClassName('ev-calendar-dropdown');
          // Define Handler and cache it on the element
          const bubble = bind.modifiers.bubble;
          const handler = (e) => {
            let outsideClickFlag = false;
            if ((bubble || (!element.contains(e.target) && element !== e.target))) {
              if (e.target.getAttribute('class') === 'ev-calendar-overlay-canvas') {
                for (let ix = 0, ixLen = calendarDropdown.length; ix < ixLen; ix++) {
                  if (!calendarDropdown[ix].contains(e.target)
                    && calendarDropdown[ix] !== e.target) {
                    outsideClickFlag = false;
                    vnode.context.setBindValue();
                  }
                }
              } else {
                outsideClickFlag = true;
              }
            }
            if (outsideClickFlag) {
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
            initSelectDay: this.$props.value ? moment(this.$props.value) : null,
//            initSelectDay: this.$props.value ? new Date(this.$props.value) : null,
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
          initSelectDay: this.$props.value
            ? new Date(moment(this.$props.value, this.options.localeType)) : new Date(),
        });
      },
    },
    watch: {
      dataValue() {
      },
    },
    created() {
    },
    mounted() {
      this.calendar = new Calendar(this.$refs.datepickerRef, this.mergedOption);
    },
    beforeDestroy() {
    },
    methods: {
      showDatepicker(e) {
        this.calendar.showDropdown(e);
      },
      hideDatepicker() {
        this.calendar.hideDropdown();
      },
      setBindValue() {
        this.dataValue = this.calendar.getSelectDateTime();
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
