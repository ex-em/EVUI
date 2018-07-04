<template>
  <div
    v-click-outside="hideTimePicker"
    ref="timePickerDiv"
    class="evui-timepicker"
    @click="showTimePicker"
    @mouseover="suffixFadeFlag = true"
    @mouseleave="suffixFadeFlag = false"
  >
    <div
      class="evui-timepicker-prefix"
    />
    <div
      v-show="suffixShowFlag"
      ref="suffix"
      :class="suffixFadeFlag ? 'suffix-fadein' : 'suffix-fadeout'"
      class="evui-timepicker-suffix"
      @click.stop="hideTimePicker"
    />
    <input
      ref="timePickerText"
      v-model="timeText"
      type="text"
      placeholder=" hh:mi:ss "
      @keydown.stop="validKeyDown"
    >
    <div
      ref="timePickerPanel"
      class="evui-timepicker-panel"
    >
      <div class="evui-timepicker-content">
        <div class="evui-timepicker-spinner">
          <spinner
            v-for="(item, index) in spinnerArr"
            v-show="spinnerArr"
            ref="timePickerSpinner"
            :key="index"
            :from="item.from"
            :to="item.to"
            :mid="(index === 0 || index === spinnerArr.length - 1) ? false : true"
            :selected-number="lpad10(item.initNumber)"
            :selection-start-index="index"
            @setInput="setInputText"
            @setRange="selectionRangeWord"
            @setFocus="timePickerFirstFocus"
          />
        </div>
      </div>
      <div class="evui-timepicker-footer">
        <button class="evui-timepicker-btn-cancel">Cancel</button>
        <button class="evui-timepicker-btn-ok">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
  import spinner from '@/components/timepicker/spinner';

  export default {
    components: {
      spinner,
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
      name: {
        type: String,
        default: null,
      },
      spinnerArr: {
        type: Array,
        default: null,
      },
    },
    data() {
      return {
        lastKeyPressSpell: null, // 최근 입력한 스펠
        formattedText: null, // input text 에 들어갈 실제 내용
        inputTextMaxLength: 8,
        inputNumberMaxLength: 6,
        selectedLiIndex: null, // 선택된 spinner의 index(ul의 index cf> 0, 1, 2)
        cursorPosition: 0,
        suffixFadeFlag: false,
        timePickerFadeFlag: false,
        suffixShowFlag: false,
      };
    },
    computed: {
      timeText: {
        get() {
          return this.formattedText;
        },
        set(text) {
          let numberText = this.removeColon(text);
          this.cursorPosition = this.$refs.timePickerText.selectionStart;

          // input text에 모두 채우지 않은 상태에서 ul, li 클릭 시 값 보정
          if (this.selectedLiIndex && numberText.length < (this.selectedLiIndex + +1) * 2) {
            if (numberText.length === 3) {
              if (this.selectedLiIndex === 1) {
                numberText = `0${numberText}`;
              } else if (this.selectedLiIndex === 2) {
                numberText = `0${numberText.slice(0, 1)}00${numberText.slice(1)}`;
              }
            } else if (numberText.length === 5) {
              if (this.selectedLiIndex === 2) {
                numberText = `${numberText.slice(0, 2)}0${numberText.slice(2)}`;
              }
            }
          }
          this.selectedLiIndex = null;

          // hh:mi:ss format에서 :로 인한 커서 위치 보정
          let changedCursorPosition = 0;
          if (this.cursorPosition >= 7) {
            changedCursorPosition = this.cursorPosition - 2;
          } else if (this.cursorPosition >= 4) {
            changedCursorPosition = this.cursorPosition - 1;
          } else {
            changedCursorPosition = this.cursorPosition;
          }

          const preText = numberText.slice(0, changedCursorPosition);

          // maxLength만큼 hhmiss가 모두 있는 경우 숫자를 입력 시 insert Mode처럼 덮어씌우기
          const postText = numberText.slice(
            numberText.length > this.inputNumberMaxLength ?
              changedCursorPosition + +1 : changedCursorPosition,
          );

          this.formattedText = null; // 필수
          const validNumberText = this.validNumber(preText + postText);
          this.formattedText = this.addColon(validNumberText);

          // input text에 값을 set할 때 마우스 커서 조정
          // change event로 처리하면 중간에 숫자 삽입 시 커서가 맨 뒤로 감
          if (this.cursorPosition <= this.inputTextMaxLength) {
            this.$nextTick(() => {
              if (this.formattedText) {
                if (this.formattedText.length <= this.inputTextMaxLength) {
                  this.$refs.timePickerText.selectionStart = this.cursorPosition;
                  this.$refs.timePickerText.selectionEnd = this.cursorPosition;
                  if ((this.lastKeyPressSpell >= 48 && this.lastKeyPressSpell <= 57)
                    || (this.lastKeyPressSpell >= 96 && this.lastKeyPressSpell <= 105)) {
                    // : 때문에 숫자 입력 시 cursor position에 +1
                    if (this.cursorPosition === 3 || this.cursorPosition === 6) {
                      this.$refs.timePickerText.selectionStart = this.cursorPosition + +1;
                      this.$refs.timePickerText.selectionEnd = this.cursorPosition + +1;
                    }
                  }
                }
              }
            });
            // 숫자 2단위마다 li 변견
            if (this.formattedText && this.formattedText.length <= this.inputTextMaxLength) {
              if (validNumberText.slice(0, 2) && validNumberText.slice(0, 2).length === 2) {
                this.keyDownSetNumber(0, validNumberText.slice(0, 2));
              }
              if (validNumberText.slice(2, 4) && validNumberText.slice(2, 4).length === 2) {
                this.keyDownSetNumber(1, validNumberText.slice(2, 4));
              }
              if (validNumberText.slice(4, 6) && validNumberText.slice(4, 6).length === 2) {
                this.keyDownSetNumber(2, validNumberText.slice(4, 6));
              }
            }
          }
        },
      },
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
      showTimePicker() {
        this.$refs.timePickerPanel.style.display = 'block';
        for (let ix = 0, ixLen = this.$refs.timePickerSpinner.length; ix < ixLen; ix++) {
          this.$refs.timePickerSpinner[ix].liClick(true);
        }
        this.timePickerFadeFlag = true;
      },
      hideTimePicker() {
        this.$refs.timePickerPanel.style.display = 'none';
        this.timePickerFadeFlag = false;
      },
      removeColon(val) {
        if (val && val.indexOf(':') > -1) {
          return val.replace(/:/gi, '');
        }
        return val;
      },
      addColon(val) {
        const number = this.removeColon(val);
        let returnVal = '';
        if (number.length <= 2) {
          returnVal = number.slice(0);
        } else if (number.length <= 4) {
          returnVal = `${number.slice(0, 2)}:${number.slice(2)}`;
        } else if (number.length <= 6) {
          returnVal = `${number.slice(0, 2)}:${number.slice(2, 4)}:${number.slice(4)}`;
        } else {
          returnVal = `${number.slice(0, 2)}:${number.slice(2, 4)}:${number.slice(4, 6)}`;
        }
        return returnVal;
      },
      validNumber(val) {
        let numberVal = this.removeColon(val);
        if (numberVal.length <= 2) {
          if (numberVal.length === 2) {
            if (numberVal.slice(0, 2) > 23) {
              numberVal = '23';
            }
          } else if (numberVal.length === 1) {
//            if (numberVal > 2) {
//              numberVal = `0${numberVal}`;
//            }
            numberVal = `${numberVal}`;
          }
        } else if (numberVal.length <= 4) {
          if (numberVal.length === 4) {
            if (numberVal.slice(0, 2) > 23) {
              numberVal = `23${numberVal.slice(2, 4)}`;
            }
            if (numberVal.slice(2, 4) > 59) {
              numberVal = `${numberVal.slice(0, 2)}59`;
            }
          } else if (numberVal.length === 3) {
            if (numberVal.slice(0, 2) > 23) {
              numberVal = `23${numberVal.slice(2)}`;
            }
//            if (numberVal.slice(2, 3) > 5) {
//              numberVal = `${numberVal.slice(0, 2)}0${numberVal.slice(2, 3)}`;
//            }
          }
        } else if (numberVal.length <= 6) {
          if (numberVal.length === 6) {
            if (numberVal.slice(0, 2) > 23) {
              numberVal = `23${numberVal.slice(2, 6)}`;
            }
            if (numberVal.slice(2, 4) > 59) {
              numberVal = `${numberVal.slice(0, 2)}59${numberVal.slice(4, 6)}`;
            }
            if (numberVal.slice(4, 6) > 59) {
              numberVal = `${numberVal.slice(0, 4)}59`;
            }
          } else if (numberVal.length === 5) {
            if (numberVal.slice(0, 2) > 23) {
              numberVal = `23${numberVal.slice(2, 6)}`;
            }
            if (numberVal.slice(2, 4) > 59) {
              numberVal = `${numberVal.slice(0, 2)}59${numberVal.slice(4, 5)}`;
            }
//            if (numberVal.slice(4, 5) > 5) {
//              numberVal = `${numberVal.slice(0, 4)}0${numberVal.slice(4, 5)}`;
//            }
          }
        } else {
          if (numberVal.slice(0, 2) > 23) {
            numberVal = `23${numberVal.slice(2, 6)}`;
          }
          if (numberVal.slice(2, 4) > 59) {
            numberVal = `${numberVal.slice(0, 2)}59${numberVal.slice(4, 6)}`;
          }
          if (numberVal.slice(4, 6) > 59) {
            numberVal = `${numberVal.slice(0, 4)}59`;
          }
        }
        return numberVal;
      },
      /**
       * @notes input text에 입력된 값 validation
       *        48 ~ 59 : number 0-9
       *        96 ~ 105 : numberpad 0-9
       *        8 : backspace
       *        35 : End
       *        36 : Home
       *        37 : left arrow
       *        39 : right arrow
       *        46 : delete
       */
      validKeyDown(e) {
        const keycode = e.keyCode;
        if (!(!e.shiftKey
            && (keycode === 46 || keycode === 8 || keycode === 37 || keycode === 39
              || keycode === 35 || keycode === 36
              || (keycode >= 48 && keycode <= 57)
              || (keycode >= 96 && keycode <= 105)))) {
          e.preventDefault();
        }
        this.lastKeyPressSpell = keycode;
      },
      /**
       * @param ulIdx : ul의 인덱스 (selectionStartIndex에 적용)
       * @param number : li의 값
       * @notes ul li에서 선택된 hh:mi:ss를 input text에 적용
       */
      setInputText(ulIdx, liNumber) {
        let numberText = '000000';
        const lpadNumber = this.lpad10(liNumber) || '00';
        this.selectedLiIndex = ulIdx || 0;
        if (this.timeText) {
          numberText = this.removeColon(this.timeText);
        }
        let hourText = '00';
        let minText = '00';
        let secText = '00';
        let totalText = '';
        hourText = numberText.slice(0, 2);
        minText = numberText.slice(2, 4);
        secText = numberText.slice(4, 6);
        if (this.selectedLiIndex === 2) {
          totalText = hourText + minText + lpadNumber;
        } else if (this.selectedLiIndex === 1) {
          totalText = hourText + lpadNumber + secText;
        } else if (this.selectedLiIndex === 0) {
          totalText = lpadNumber + minText + secText;
        }
        this.timeText = totalText;
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
      selectionRangeWord(cursorIdx) {
        this.$refs.timePickerText.focus();
        this.$refs.timePickerText.setSelectionRange(
          (cursorIdx * 2) + +cursorIdx,
          (cursorIdx * 2) + +2 + +cursorIdx,
        );
      },
      timePickerFirstFocus(cursorIdx) {
        this.$refs.timePickerText.setSelectionRange(
          (cursorIdx * 2) + +cursorIdx,
          (cursorIdx * 2) + +cursorIdx,
        );
      },
      keyDownSetNumber(index, number) {
        if (this.spinnerArr && this.spinnerArr[index]) {
          this.spinnerArr[index].selectedNumber = number;
        }
      },
    },
  };
</script>

<style scoped>

  .evui-timepicker {
    width: 220px;
    height: 40px;
  }

  .evui-timepicker input[type=text]{
    display: inline-block;
    width: 100%;
    height: 100%;
    padding: 0 30px 0 30px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #ffffff;
    background-image: none;
  }

  .evui-timepicker input[type=text]:focus,
  .evui-timepicker input[type=text]:hover{
    outline: none;
    border-color: #409eff;
  }

  .evui-timepicker div.evui-timepicker-prefix {
    position: absolute;
    width: 26px;
    height: 26px;
    margin: 7px 3px 7px 3px;
    background-image: url(../../images/evui_icon.png);
    background-position: -196px -102px;
  }

  .evui-timepicker div.evui-timepicker-suffix {
    position: absolute;
    left: 190px;
    width: 26px;
    height: 10px;
    margin: 15px 3px 15px 3px;
    background-image: url(../../images/evui_icon.png);
    background-position: 7px -362px;
  }
  .evui-timepicker div.evui-timepicker-suffix.suffix-fadein {
    display: block;
    cursor: pointer;
  }
  .evui-timepicker div.evui-timepicker-suffix.suffix-fadeout {
    display: none;
    cursor: default;
  }

  .evui-timepicker-panel {
    display: none;
    position: absolute;
    z-index: 300;
    width: 180px;
    height: 224px;
    margin: 12px 0 0 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }

  .evui-timepicker-content {
    display: block;
    overflow: hidden;
    position: relative;
    height: 188px;
  }
  .evui-timepicker-content .evui-timepicker-spinner {
    width: 100%;
    height: 100%;
    padding-left: 5px;
    font-size: 0; /*필수 width:33.3%*/
    white-space: nowrap;
  }
  .evui-timepicker-footer {
    display: block;
    height: 34px;
    background-color: #f5f7fa;
    text-align: right;
  }
  .evui-timepicker-footer .evui-timepicker-btn-cancel {
    padding: 8px 8px 0 0;
    border: none;
    background-color: transparent;
    font-size: 12px;
    cursor: pointer;
  }
  .evui-timepicker-footer .evui-timepicker-btn-ok {
    padding: 8px 8px 0 0;
    border: none;
    background-color: transparent;
    color: #409eff;
    font-size: 12px;
    cursor: pointer;
  }
</style>
