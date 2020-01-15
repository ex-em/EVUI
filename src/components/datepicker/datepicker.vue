<template>
  <div
    v-click-outside="hideDatepicker"
    :class="size + inputTextMaxLength"
    class="ev-datepicker"
    @click="showDatepicker"
  >
    <div
      :class="[{wrapClasses}, size + inputTextMaxLength]"
      class="ev-datepicker-input-wrapper"
    >
      <input
        ref="datepickerText"
        :value="computedValue"
        :class="[{inputClasses}, size + inputTextMaxLength]"
        :placeholder="options.localeType"
        class="ev-datepicker-input"
        type="text"
        v-on="allListeners"
      >
    </div>
  </div>
</template>

<script>
  import Calendar from '@/components/datepicker/calendar.core';
  import moment from 'moment';

  const prefixCls = 'ev-input-text';

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
            if (bubble || element !== e.target) {
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
            theme: 'light',
          };
        },
      },
      size: {
        type: String,
        default: '',
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
        onceSetDateTime: true,
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
        return Object.assign(this.options, {
          // moment타입에 맞을 경우 초기input setting
          initSelectDayFlag: !isNaN(moment(this.value, this.options.localeType)),
          // bindDay가 있는 경우 표시, 없는 경우 today
          initSelectDay: this.value
            ? new Date(moment(this.value, this.options.localeType)) : new Date(),
          // localeType이 없는 경우 YYYY-MM-DD가 default
          localeType: this.options.localeType
            ? this.options.localeType : 'YYYY-MM-DD',
          theme: this.options.theme,
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
            vm.lastKeyPressSpell = keyValue;
            if (keyValue >= 48 && keyValue <= 57) {
              // console.log('0 ~ 9');
            } else if (keyValue >= 96 && keyValue <= 105) {
              // console.log('keynum 0 ~ 9');
            } else if (keyValue === 8
              || (keyValue >= 35 && keyValue <= 40) || keyValue === 46) {
              // console.log('backspace
              // end, home, left, up, right, down, delete');
            } else {
              e.preventDefault();
            }
          },
          input(e) {
            // init values
            let setValue = null;
            let targetValue = e.target.value;
            const exceptKoreanValue = targetValue.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
            const currCursor = vm.$refs.datepickerText.selectionStart;
            // prevent kor language
            if (targetValue !== exceptKoreanValue) {
              targetValue = exceptKoreanValue;
            }
            const numberValue = vm.removeSpecialSymbols(targetValue);
            const numberValueLength = numberValue.length;
            // set mouse cursor
            let numberValueCursor = 0;
            if (currCursor >= 17) {
              numberValueCursor = currCursor - 5;
            } else if (currCursor >= 14) {
              numberValueCursor = currCursor - 4;
            } else if (currCursor >= 11) {
              numberValueCursor = currCursor - 3;
            } else if (currCursor >= 8) {
              numberValueCursor = currCursor - 2;
            } else if (currCursor >= 5) {
              numberValueCursor = currCursor - 1;
            } else {
              numberValueCursor = currCursor;
            }
            let preText = '';
            let postText = '';
            // 8칸보다 오버해서 숫자를 입력하는 경우
            if (numberValueLength > vm.inputNumberMaxLength) {
              // 인풋박스 마지막에 글씨 쓰는 경우
              if (numberValueLength - vm.inputNumberMaxLength === 1) {
                // 인풋박스 맥스까지 글씨가 있고 그 뒤에 한글자 더 입력한 경우
                if ((vm.lastKeyPressSpell >= 48 && vm.lastKeyPressSpell <= 57)
                  || (vm.lastKeyPressSpell >= 96 && vm.lastKeyPressSpell <= 105)) {
                  // 숫자 입력 시
                  let afterSpecialSymbolTerm = 0;
                  let beforeSpecialSymbolTerm = 0;
                  if (currCursor === 4 || currCursor === 7 || currCursor === 10
                    || currCursor === 13 || currCursor === 16) {
                    // '-', ' ', ':' 특수문자 부분을 +1칸 커서 왼쪽 자동이동 시킴
                    afterSpecialSymbolTerm = 1;
                  } else if (currCursor === 5 || currCursor === 8 || currCursor === 11
                    || currCursor === 14 || currCursor === 17) {
                    // '-', ' ', ':' 특수문자 전에 값을 입력하면 +1칸 커서 왼쪽 자동이동 후 값이 변환됨
                    beforeSpecialSymbolTerm = 1;
                  }
                  preText = numberValue.slice(0, numberValueCursor + beforeSpecialSymbolTerm);
                  postText = numberValue.slice(numberValueCursor + beforeSpecialSymbolTerm + 1,
                    numberValueLength);
                  setValue = vm.addSpecialSymbols(vm.validNumber(preText + postText));
                  vm.calendar.setDateTime(moment(setValue, vm.options.localeType));
                  vm.$refs.datepickerText.value = setValue;
                  vm.dataValue = setValue;
                  vm.$refs.datepickerText.selectionStart = (currCursor + afterSpecialSymbolTerm)
                    + beforeSpecialSymbolTerm;
                  vm.$refs.datepickerText.selectionEnd = (currCursor + afterSpecialSymbolTerm)
                    + beforeSpecialSymbolTerm;
                } else {
                  // 숫자 입력이 아닌경우
                  preText = numberValue.slice(0, numberValueCursor);
                  postText = numberValue.slice(numberValueCursor + 1, numberValueLength);
                  setValue = vm.addSpecialSymbols(vm.validNumber(preText + postText));
                  vm.$refs.datepickerText.value = setValue;
                  vm.dataValue = setValue;
                  vm.$refs.datepickerText.selectionStart = currCursor;
                  vm.$refs.datepickerText.selectionEnd = currCursor;
                }
              }
            } else {
              // 숫자 입력 값이 max이거나 그보다 작은 경우
              setValue = vm.addSpecialSymbols(vm.validNumber(targetValue));
              vm.$refs.datepickerText.value = setValue;
              if (numberValueLength === vm.inputNumberMaxLength) {
                vm.dataValue = setValue;
              }
              vm.$refs.datepickerText.selectionStart = currCursor;
              vm.$refs.datepickerText.selectionEnd = currCursor;
              let specialSymbolTerm = 0;
              if ((vm.lastKeyPressSpell >= 48 && vm.lastKeyPressSpell <= 57)
                || (vm.lastKeyPressSpell >= 96 && vm.lastKeyPressSpell <= 105)) {
                if (currCursor === 5 || currCursor === 8 || currCursor === 11
                  || currCursor === 14 || currCursor === 17) {
                  // '-', ' ', ':' 특수문자 부분을 +1칸 커서 왼쪽 자동이동 시킴
                  specialSymbolTerm = 1;
                }
                vm.$refs.datepickerText.selectionStart = currCursor + specialSymbolTerm;
                vm.$refs.datepickerText.selectionEnd = currCursor + specialSymbolTerm;
              }
              // YYYY, MM, DD가 모두 끝까지 입력되어야지만 set하도록 조건 변경
              if (numberValueLength > 3 && numberValueLength !== 5 && numberValueLength !== 7) {
                vm.calendar.setDateTime(moment(setValue, vm.options.localeType));
              }
              if (!numberValueLength) {
                vm.calendar.setDateTime(null);
                vm.dataValue = null;
              }
            }
          },
        });
      },
    },
    watch: {
      value(v) {
        this.calendar.setDateTime(moment(v));
        this.dataValue = v;
      },
      computedValue(v) {
        this.$emit('input', v);
      },
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
      this.calendar.removeDropdown();
    },
    methods: {
      showDatepicker(e) {
        if (this.onceSetDateTime) {
          this.onceSetDateTime = false;
          this.calendar.setDateTime(moment(this.value));
        }
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
          const valueLength = v.length;
          if (valueLength === 19 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]')) {
            return v;
          } else if (valueLength === 16 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]')) {
            return v;
          } else if (valueLength === 13 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9])')) {
            return v;
          } else if (valueLength === 10 && v.match('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])')) {
            return v;
          }
          return '';
        }
        return '';
      },
      removeSpecialSymbols(val) {
//        const localeType = this.options.localeType || 'YYYY-MM-DD';
//        if (localeType === 'YYYY-MM-DD HH:mm:ss') {
//          return moment(val, 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDDHHmmss');
//        } else if (localeType === 'YYYY-MM-DD HH:mm') {
//          return moment(val, 'YYYY-MM-DD HH:mm').format('YYYYMMDDHHmm');
//        } else if (localeType === 'YYYY-MM-DD HH') {
//          return moment(val, 'YYYY-MM-DD HH').format('YYYYMMDDHH');
//        } else if (localeType === 'YYYY-MM-DD') {
//          return moment(val, 'YYYY-MM-DD').format('YYYYMMDD');
//        }
        return val.replace(/( *)(:*)(-*)/g, '');
      },
      addSpecialSymbols(val) {
        const number = this.removeSpecialSymbols(val);
        const numberLength = number.length;
        const localeType = this.options.localeType || 'YYYY-MM-DD';
        let returnVal = '';
        if (localeType === 'YYYY-MM-DD HH:mm:ss') {
          if (numberLength <= 4) {
            returnVal = number.slice(0);
          } else if (numberLength <= 6) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4)}`;
          } else if (numberLength <= 8) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6)}`;
          } else if (numberLength <= 10) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8)}`;
          } else if (numberLength <= 12) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10)}`;
          } else if (numberLength <= 14) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12)}`;
          } else {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12, 14)}`;
          }
        } else if (localeType === 'YYYY-MM-DD HH:mm') {
          if (numberLength <= 4) {
            returnVal = number.slice(0);
          } else if (numberLength <= 6) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4)}`;
          } else if (numberLength <= 8) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6)}`;
          } else if (numberLength <= 10) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8)}`;
          } else if (numberLength <= 12) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10)}`;
          } else {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12, 14)}`;
          }
        } else if (localeType === 'YYYY-MM-DD HH') {
          if (numberLength <= 4) {
            returnVal = number.slice(0);
          } else if (numberLength <= 6) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4)}`;
          } else if (numberLength <= 8) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6)}`;
          } else if (numberLength <= 10) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8)}`;
          } else {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12, 14)}`;
          }
        } else if (localeType === 'YYYY-MM-DD') {
          if (numberLength <= 4) {
            returnVal = number.slice(0);
          } else if (numberLength <= 6) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4)}`;
          } else if (numberLength <= 8) {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6)}`;
          } else {
            returnVal = `${number.slice(0, 4)}-${number.slice(4, 6)}-${number.slice(6, 8)} ${number.slice(8, 10)}:${number.slice(10, 12)}:${number.slice(12, 14)}`;
          }
        }
        return returnVal;
      },
      validNumber(val) {
        let numberVal = this.removeSpecialSymbols(val);
        const numberValLength = numberVal.length;
        let lastDay = 31;
        const currentYear = new Date().getFullYear();
        const prevLimitYear = currentYear - 100;
        const postLimitYear = currentYear + 100;
        if (numberValLength <= 6) {
          if (numberValLength === 6) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 6)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 6)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01`;
            }
          } else if (numberValLength >= 4) {
            numberVal = `${numberVal}`;
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 6)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 6)}`;
            }
          } else {
            numberVal = `${numberVal}`;
          }
        } else if (numberValLength <= 8) {
          if (numberValLength === 8) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 8)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 8)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 8)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 8)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01`;
            }
          } else if (numberValLength === 7) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 8)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 8)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 8)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 8)}`;
            }
          }
        } else if (numberValLength <= 10) {
          if (numberValLength === 10) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 10)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 10)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 10)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 10)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 10)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 10)}`;
            }
            if (+numberVal.slice(8, 10) > +23) {
              numberVal = `${numberVal.slice(0, 8)}23`;
            }
          } else if (numberValLength === 9) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 10)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 10)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 10)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 10)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 10)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 10)}`;
            }
          }
        } else if (numberValLength <= 12) {
          if (numberValLength === 12) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 12)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 12)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 12)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 12)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 12)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 12)}`;
            }
            if (+numberVal.slice(8, 10) > +23) {
              numberVal = `${numberVal.slice(0, 8)}23${numberVal.slice(10, 12)}`;
            }
            if (+numberVal.slice(10, 12) > +59) {
              numberVal = `${numberVal.slice(0, 10)}59`;
            }
          } else if (numberValLength === 11) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 12)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 12)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 12)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 12)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 12)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 12)}`;
            }
            if (+numberVal.slice(8, 10) > +23) {
              numberVal = `${numberVal.slice(0, 8)}23${numberVal.slice(10, 12)}`;
            }
          }
        } else if (numberValLength <= 14) {
          if (numberValLength === 14) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 14)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 14)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 14)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 14)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 14)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 14)}`;
            }
            if (+numberVal.slice(8, 10) > +23) {
              numberVal = `${numberVal.slice(0, 8)}23${numberVal.slice(10, 14)}`;
            }
            if (+numberVal.slice(10, 12) > +59) {
              numberVal = `${numberVal.slice(0, 10)}59${numberVal.slice(12, 14)}`;
            }
            if (+numberVal.slice(12, 14) > +59) {
              numberVal = `${numberVal.slice(0, 12)}59`;
            }
          } else if (numberValLength === 13) {
            if (+numberVal.slice(0, 4) < +prevLimitYear) {
              numberVal = `${prevLimitYear + numberVal.slice(4, 14)}`;
            } else if (+numberVal.slice(0, 4) > +postLimitYear) {
              numberVal = `${postLimitYear + numberVal.slice(4, 14)}`;
            }
            if (+numberVal.slice(4, 6) > +12) {
              numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 14)}`;
            } else if (+numberVal.slice(4, 6) < +1) {
              numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 14)}`;
            }
            lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
            if (+numberVal.slice(6, 8) > +lastDay) {
              numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 14)}`;
            } else if (+numberVal.slice(6, 8) < +1) {
              numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 14)}`;
            }
            if (+numberVal.slice(8, 10) > +23) {
              numberVal = `${numberVal.slice(0, 8)}23${numberVal.slice(10, 14)}`;
            }
            if (+numberVal.slice(10, 12) > +59) {
              numberVal = `${numberVal.slice(0, 10)}59${numberVal.slice(12, 14)}`;
            }
          }
        } else {
          if (+numberVal.slice(0, 4) < +prevLimitYear) {
            numberVal = `${prevLimitYear + numberVal.slice(4, 14)}`;
          } else if (+numberVal.slice(0, 4) > +postLimitYear) {
            numberVal = `${postLimitYear + numberVal.slice(4, 14)}`;
          }
          if (+numberVal.slice(4, 6) > +12) {
            numberVal = `${numberVal.slice(0, 4)}12${numberVal.slice(6, 14)}`;
          } else if (+numberVal.slice(4, 6) < +1) {
            numberVal = `${numberVal.slice(0, 4)}01${numberVal.slice(6, 14)}`;
          }
          lastDay = this.getLastDay(numberVal.slice(0, 4), numberVal.slice(4, 6));
          if (+numberVal.slice(6, 8) > +lastDay) {
            numberVal = `${numberVal.slice(0, 6) + lastDay + numberVal.slice(8, 14)}`;
          } else if (+numberVal.slice(6, 8) < +1) {
            numberVal = `${numberVal.slice(0, 6)}01${numberVal.slice(8, 14)}`;
          }
          if (+numberVal.slice(8, 10) > +23) {
            numberVal = `${numberVal.slice(0, 8)}23${numberVal.slice(10, 14)}`;
          }
          if (+numberVal.slice(10, 12) > +59) {
            numberVal = `${numberVal.slice(0, 10)}59${numberVal.slice(12, 14)}`;
          }
          if (+numberVal.slice(12, 14) > +59) {
            numberVal = `${numberVal.slice(0, 12)}59`;
          }
        }
        return numberVal;
      },
      getLastDay(year, month) {
        const lastDate = new Date(year, month, '');
        return lastDate.getDate();
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-datepicker {
    width: 235px;

    @include evThemify() {
      color: evThemed('font-color-base');
    }
  }

  .ev-datepicker-input-wrapper {
    width: 100%;
    height: 32px;
  }

  .ev-datepicker-input {
    width: 100%;
    height: 32px;
    line-height: 32px;
    border-radius: $border-radius-base;
    padding: 0 5px 0 5px;
    background-color: transparent;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('datepicker-input-border');
    }
  }

  .fit10,
  .fit13,
  .fit16,
  .fit19 {
    height: 23px;
    line-height: 23px;
  }
  .fit10 {
    width: 85px;
  }
  .fit13 {
    width: 105px;
  }
  .fit16 {
    width: 125px;
  }
  .fit19 {
    width: 145px;
  }
</style>
