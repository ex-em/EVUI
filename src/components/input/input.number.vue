<template>
  <div
    :style="styleObject"
    :class="wrapClasses"
  >
    <div :class="handlerClasses">
      <a
        :class="upClasses"
        @click="up"
        @mousedown="preventDefault"
      >
        <span
          :class="innerUpClasses"
          @click="preventDefault"
        />
        <icon
          class="fa-sort-up"
        />
      </a>
      <a
        :class="downClasses"
        @click="down"
        @mousedown="preventDefault"
      >
        <span
          :class="innerDownClasses"
          @click="preventDefault"
        />
        <icon class="fa-sort-down"/>
      </a>
    </div>
    <div
      :class="inputWrapClasses"
    >
      <input
        :min="min"
        :max="max"
        :step="step"
        :parser="parser"
        :disabled="disabled"
        :readonly="readonly"
        :precision="precision"
        :value="formatterValue"
        :class="inputClasses"
        @keydown.stop="keyDown"
        @focus="focus"
        @blur="blur"
        @mouseup="preventDefault"
        @change="change"
        @input="change"
      >
    </div>
  </div>
</template>

<script>
  import icon from '@/components/icon/icon';

  const prefixCls = 'evui-input-number';

  function parsedStyle(value) {
    let val = value;

    val = val.toString();

    if (val.match(/[1-9]*?[0-9]+/gi)) {
      if (val.match(/[px|%]/gi) === null) {
        val = val.concat('px');
      }
    } else {
      val = null;
    }
    return val;
  }
  function addNum(num1, num2) {
    let sq1;
    let sq2;
    try {
      sq1 = num1.toString().split('.')[1].length;
    } catch (e) {
      sq1 = 0;
    } try {
      sq2 = num2.toString().split('.')[1].length;
    } catch (e) {
      sq2 = 0;
    }
    const sf = 10 ** Math.max(sq1, sq2);
    return (Math.round(num1 * sf) + Math.round(num2 * sf)) / sf;
  }

  export default {
      name: 'InputNumber',
      components: {
        icon,
      },
      props: {
        max: {
          type: Number,
          default: Infinity,
        },
        min: {
          type: Number,
          default: -Infinity,
        },
        step: {
          type: Number,
          default: 0.1,
        },
        inputWidth: {
          type: [String, Number],
          default: '100%',
        },
        inputHeight: {
          type: [String, Number],
          default: '100%',
        },
        width: {
          type: [String, Number],
          default: '100%',
        },
        height: {
          type: [String, Number],
          default: '100%',
        },
        value: {
          type: Number,
          default: null,
        },
        disabled: {
          type: Boolean,
          default: false,
        },
        useZeroDigit: {
          type: Boolean,
          default: false,
        },
        editable: {
          type: Boolean,
          default: true,
        },
        precisionMax: {
          type: Number,
          default: Infinity,
        },
        precisionMin: {
          type: Number,
          default: -Infinity,
        },
        precision: {
          type: Number,
          default: 1,
        },
        formatter: {
          type: Function,
          default: null,
        },
        parser: {
          type: Function,
          default: null,
        },
        readonly: {
          type: Boolean,
          default: false,
        },
      },
      data() {
        return {
          focused: false,
          upDisabled: false,
          downDisabled: false,
          currentValue: this.setValue(this.value),
        };
      },
      computed: {
        styleObject: function styleObject() {
          return {
            width: parsedStyle(this.width),
            height: parsedStyle(this.height),
          };
        },
        formatterValue: function formatterValue() {
          return this.currentValue;
        },
        wrapClasses: function wrapClasses() {
          return [
            `${prefixCls}`,
            {
              [`${prefixCls}-disabled`]: this.disabled,
            },
          ];
        },
        handlerClasses: function handlerClasses() {
          return `${prefixCls}-handler-wrap`;
        },
        upClasses: function upClasses() {
          return [
            `${prefixCls}-handler`,
            `${prefixCls}-handler-up`,
          ];
        },
        innerUpClasses: function innerUpClasses() {
          return `${prefixCls}-handler-up-inner icon`;
        },
        downClasses: function downClasses() {
          return [
            `${prefixCls}-handler`,
            `${prefixCls}-handler-down`,
          ];
        },
        innerDownClasses: function innerDownClasses() {
          return `${prefixCls}-handler-down-inner icon`;
        },
        inputWrapClasses: function inputWrapClasses() {
          return `${prefixCls}-input-wrap`;
        },
        inputClasses: function inputClasses() {
          return `${prefixCls}-input`;
        },
      },
      watch: {
        value(val) {
          this.currentValue = val;
        },
      },
      created() {
      },
      mounted() {
      },
      methods: {
        preventDefault(e) {
          e.preventDefault();
        },
        up(e) {
          const targetValue = Number(e.target.value);
          if (this.upDisabled && isNaN(targetValue)) {
            return false;
          }
          this.changeStep('up', e);
          return true;
        },
        down(e) {
          const targetValue = Number(e.target.value);
          if (this.downDisabled && isNaN(targetValue)) {
            return false;
          }
          this.changeStep('down', e);
          return true;
        },
        changeStep(type, e) {
          if (this.disabled || this.readonly) {
            return false;
          }
          const step = Number(this.step);
          const targetValue = Number(e.target.value);
          let val = Number(this.currentValue);
          if (isNaN(val)) {
            return false;
          }

          if (!isNaN(targetValue)) {
            if (type === 'up') {
              if (addNum(targetValue, val) <= this.max) {
                val = targetValue;
              } else {
                return false;
              }
            } else if (type === 'down') {
              if (addNum(targetValue, -val) >= this.min) {
                val = targetValue;
              } else {
                return false;
              }
            }
          }

          if (type === 'up') {
            val = addNum(val, step);
          } else if (type === 'down') {
            val = addNum(val, -step);
          }
          this.setValue(val);
          return true;
        },
        setValue(value) {
          let val = value;
          if (!isNaN(this.precision)) {
            // if (this.useZeroDigit) {
            //   val = toFixedWithZero(val, this.precision);
            // } else {
            //   val = Number(val).toFixed(this.precision);
            // }
            val = Number(Number(val).toFixed(this.precision));
          }
          this.$nextTick(() => {
              this.currentValue = val;
            });
          return val;
        },
        change(e) {
          let value = e.target.value.trim();

          if (this.parser) {
            this.parser(value);
          }
          if (e.type === 'input' && value.match(/^-?\.?$|\.$/)) return;

          const { min, max } = this;
          const isEmptyString = value.length === 0;
          value = Number(value);

          if (isEmptyString) {
            this.setValue(null);
            return;
          }

          if (e.type === 'change' && value === this.currentValue && value > min && value < max) return;

          if (!isNaN(value) && !isEmptyString) {
            this.currentValue = value;
            if (e.type === 'input' && value < min) return;
            if (value > max) {
              this.setValue(max);
            } else if (value < min) {
              this.setValue(min);
            } else {
              this.setValue(value);
            }
          } else {
            e.target.value = this.setValue(this.currentValue);
            return;
          }

          this.currentValue = value;
        },
        focus() {
          this.focused = true;
        },
        blur() {
          this.focused = false;
        },
        keyDown(e) {
            if (e.keyCode === 38) {
              e.preventDefault();
              this.up(e);
            } else if (e.keyCode === 40) {
              e.preventDefault();
              this.down(e);
            }
        },
      },
      init() {
      },
    };
</script>
<style scoped>
  /*base class*/
  .evui-input-number {
    display: inline-block;
    width: 100%;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    color: #495060;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    margin: 0;
    padding: 0;
    width: 80px;
    height: 32px;
    line-height: 32px;
    vertical-align: middle;
    border: 1px solid #dddee1;
    border-radius: 4px;
    overflow: hidden;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  .evui-input-number-handler-wrap {
    width: 22px;
    height: 100%;
    border-left: 1px solid #dddee1;
    border-radius: 0 4px 4px 0;
    background: #fff;
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  /*border color when mouse hover*/
  .evui-input-number:hover {
    border-color : #2d8cf0;
  }
  .evui-input-number:hover .evui-input-number-handler-wrap {
    border-color : #2d8cf0;
    opacity: 1;
  }

  .evui-input-number:hover i{
    color : #2d8cf0;
  }

  /*inner input div class*/
  .evui-input-number-input-wrap {
    overflow: hidden;
    height: 32px;
  }
  .evui-input-number-input {
    width: 100%;
    height: 32px;
    line-height: 32px;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }
  /*handler line class*/
  .evui-input-number-handler  {
    display: block;
    width: 100%;
    height: 16px;
    line-height: 0;
    text-align: center;
    overflow: hidden;
    color: #999;
    position: relative;
  }
  .evui-input-number-handler-up {
    cursor: pointer;
  }
  .evui-input-number-handler-down {
    border-top: 1px solid #dddee1;
    top: -1px;
    cursor: pointer;
  }
  /*disable base class*/
  .evui-input-number-disabled {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
  }
  /*use border color when mouse hover*/
  .evui-input-number-disabled:hover {
    border-color : #D77F7F;
  }
  /*inner input div class*/
  .evui-input-number-disabled .evui-input-number {
    opacity: .72;
    cursor: not-allowed;
    background-color: #f3f3f3;
  }
  /*handler line class*/
  .evui-input-number-disabled .evui-input-number-handler-wrap {
    display: none;
  }
  .evui-input-number-disabled .evui-input-number-handler {
    opacity: .72;
    color: #ccc!important;
    cursor: not-allowed;
  }
  .evui-input-number-input[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
  }
  /*handler class*/
  .evui-input-number-handler-up-inner {
  }
  .evui-input-number-handler-down-inner {
  }
  /*TODO SET ICON CLASS*/
  .fa-sort-up {
    margin-top: 4px;
  }
  .evui-icon-arrow-up {
  }
</style>
