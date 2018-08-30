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
        :value="computedValue"
        :class="inputClasses"
        :placeholder="options.localeType"
        class="evui-datepicker-input"
        type="text"
        v-on="allListeners"
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
                  }
                }
              } else {
                outsideClickFlag = true;
              }
            }
            if (outsideClickFlag) {
              bind.value(e);
            } else if (vnode.context.calendar
              && vnode.context.calendar.overCanvas
              && e.target === vnode.context.calendar.overCanvas) {
              // 클릭한 overCanvas(e.target)가 어떤 vnode의 overCanvas인지 확인하여 데이터 가져옴
              vnode.context.setBindValue();
            }
          };
          element.__vueClickOutside__ = handler;
          // add Event Listeners
          document.addEventListener('mousedown', handler);
        },
        unbind(el) {
          const element = el;
          // Remove Event Listeners
          document.removeEventListener('mousedown', element.__vueClickOutside__);
          element.__vueClickOutside__ = null;
        },
      },
    },
    props: {
      value: {
        type: String,
        default: null,
      },
      options: {
        type: Object,
        default() {
          return {
            localeType: 'YYYY-MM-DD',
            initSelectDay: this.value ? new Date(moment(this.value)) : new Date(),
          };
        },
      },
    },
    data() {
      return {
        dataValue: this.value, // 최초 value에 computedValue get()의 validDateFormat적용을 위함
        lastKeyPressSpell: null, // 최근 입력한 스펠
        formattedText: null, // input text 에 들어갈 실제 내용
        inputTextMaxLength: 10, // default: YYYY-MM-DD
        inputNumberMaxLength: 8, // default: YYYYMMDD
        cursorPosition: 0,
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
        return Object.assign(this.$props.options, {
          // moment타입에 맞을 경우 초기input setting
          initSelectDayFlag: !isNaN(moment(this.$props.value, this.options.localeType)),
          // bindDay가 있는 경우 표시, 없는 경우 today
          initSelectDay: this.$props.value
            ? new Date(moment(this.$props.value, this.options.localeType)) : new Date(),
          // localeType이 없는 경우 YYYY-MM-DD가 default
          localeType: this.$props.options.localeType
            ? this.$props.options.localeType : 'YYYY-MM-DD',
        });
      },
      computedValue() {
        return this.validDateFormat(this.dataValue);
      },
      allListeners() {
        const vm = this;
        return Object.assign({}, this.$listeners, {
          keydown(e) {
            const keyValue = e.which || e.keyCode || 0;
            if (keyValue >= 48 && keyValue <= 57) {
              // console.log('0 ~ 9');
            } else if (keyValue >= 96 && keyValue <= 105) {
              // console.log('keynum 0 ~ 9');
            } else if (keyValue === 8 || (keyValue >= 16 && keyValue <= 18)
              || (keyValue >= 35 && keyValue <= 40) || keyValue === 46) {
              // console.log('backspace, shift, ctrl, alt,
              // end, home, left, up, right, down, delete');
            } else {
              e.preventDefault();
            }
          },
          input(e) {
            const typingFullValue = e.target.value;
            const exceptKoreanValue = typingFullValue.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
            let setValue = '';
            if (exceptKoreanValue !== typingFullValue) {
              // 한글 방지
              setValue = exceptKoreanValue;
            } else if (vm.removeSpecialSymbols(exceptKoreanValue).length
              > vm.inputNumberMaxLength) {
              // length limit
              setValue = exceptKoreanValue.slice(0, exceptKoreanValue.length - 1);
            } else {
              setValue = vm.addSpecialSymbols(exceptKoreanValue);
            }
            vm.$refs.datepickerText.value = setValue;
          },
        });
      },
    },
    watch: {
    },
    created() {
    },
    mounted() {
      this.calendar = new Calendar(this.$refs.datepickerRef, this.mergedOption);
      if (this.options.initSelectDayFlag) {
        this.setBindValue();
      }
      this.inputTextMaxLength = this.options.localeType.length;
      this.inputNumberMaxLength = this.removeSpecialSymbols(this.options.localeType).length;
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
      validDateFormat(v) {
        if (v && v.length) {
          if (v.length === 19 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]')) {
            return v;
          } else if (v.length === 16 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]')) {
            return v;
          } else if (v.length === 13 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9])')) {
            return v;
          } else if (v.length === 10 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])')) {
            return v;
          }
          return '';
        }
        return '';
      },
      removeSpecialSymbols(val) {
        return val.replace(/( *)(:*)(-*)/g, '');
      },
      addSpecialSymbols(val) {
        const number = this.removeSpecialSymbols(val);
        const localeType = this.options.localeType || 'YYYY-MM-DD';
        let returnVal = '';
        if (localeType === 'YYYY-MM-DD HH:mm:ss') {
          if (number.length <= 4) {
            returnVal = number.slice(0);
          } else if (number.length <= 6) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4)}`;
          } else if (number.length <= 8) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6)}`;
          } else if (number.length <= 10) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8)}`;
          } else if (number.length <= 12) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10)}`;
          } else if (number.length <= 14) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12)}`;
          } else {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12, 14)}`;
          }
        }
        return returnVal;
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
