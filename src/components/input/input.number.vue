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
          class="ei-arrow-up"
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
        <icon class="ei-arrow-down"/>
      </a>
    </div>
    <div
      :class="inputWrapClasses"
    >
      <input
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :readonly="readonly"
        :precision="precision"
        :value="formatterValue"
        :class="inputClasses"
        @keydown.stop="keyDownEvent"
        @focus="focus"
        @blur="blur"
        @mousewheel="wheelEvent"
        @change="change"
        @input="change"
      >
    </div>
  </div>
</template>

<script>
  import icon from '@/components/icon/icon';

  const prefixCls = 'ev-input-number';

  function parsedStyle(value) {
    const mark = value.toString();
    let result = mark;
    if (!mark.match(/^(([1-9]+(?:\.\d+)?)(px|%+))$/g)) {
      result = mark.concat('px');
    }
    return result;
  }
  function addNum(num1, num2) {
    let sq1;
    let sq2;
    try {
      sq1 = num1.toString().split('.')[1].length;
    } catch (e) {
      sq1 = 0;
    }
    try {
      sq2 = num2.toString().split('.')[1].length;
    } catch (e) {
      sq2 = 0;
    }
    const sf = 10 ** Math.max(sq1, sq2);
    return (Math.round(num1 * sf) + Math.round(num2 * sf)) / sf;
  }
  export default {
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
      precision: {
        type: Number,
        default: 1,
        validator(value) {
          return typeof value === 'number' && !Number.isNaN(value) && value >= 0 && value <= 100;
        },
      },
      formatter: {
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
      styleObject() {
        return {
          width: parsedStyle(this.width),
          height: parsedStyle(this.height),
        };
      },
      formatterValue() {
        if (this.formatter) {
          this.$emit('input', this.formatter(this.currentValue));
          return this.formatter(this.currentValue);
        }
        this.$emit('input', this.currentValue);
        return this.currentValue;
      },
      wrapClasses() {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-disabled`]: this.disabled,
          },
        ];
      },
      handlerClasses() {
        return `${prefixCls}-handler-wrap`;
      },
      upClasses() {
        return [
          `${prefixCls}-handler`,
          `${prefixCls}-handler-up`,
        ];
      },
      innerUpClasses() {
        return `${prefixCls}-handler-up-inner icon`;
      },
      downClasses() {
        return [
          `${prefixCls}-handler`,
          `${prefixCls}-handler-down`,
        ];
      },
      innerDownClasses() {
        return `${prefixCls}-handler-down-inner icon`;
      },
      inputWrapClasses() {
        return `${prefixCls}-input-wrap`;
      },
      inputClasses() {
        return `${prefixCls}-input`;
      },
    },
    watch: {
      value(updatedValue) {
        this.currentValue = updatedValue;
      },
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
        let updatedValue = Number(this.currentValue);

        if (isNaN(updatedValue)) {
          return false;
        }
        if (!isNaN(targetValue) && type !== null) {
          if (e.wheelDeltaY === 120 && addNum(targetValue, step) <= this.max) {
            updatedValue = targetValue;
          } else if (e.wheelDeltaY === -120 && addNum(targetValue, -step) >= this.min) {
            updatedValue = targetValue;
          } else {
            return false;
          }
        }
        if (type === 'up') {
          updatedValue = addNum(updatedValue, step);
        } else if (type === 'down') {
          updatedValue = addNum(updatedValue, -step);
        }
        this.setValue(updatedValue);
        return true;
      },
      setValue(value) {
        const updatedValue = Number(Number(value).toFixed(this.precision));
        this.$nextTick(() => {
            this.currentValue = updatedValue;
          });
        return updatedValue;
      },
      change(e) {
        let updatedValue;
        const max = this.max;
        const min = this.min;
        const value = e.target.value.trim();
        const isEmptyString = value.length === 0;
        if (isEmptyString) {
          this.setValue(null);
          return false;
        }
        if (this.validateValue(e.type, value)) {
          return false;
        }
        if (isNaN(value)) {
          e.target.value = this.setValue(this.currentValue);
          return false;
        }
        if (!isNaN(value)) {
          updatedValue = Number(value);
          if (e.type === 'input' && value < min) {
            return false;
          }
          if (value > max || value < min) {
            updatedValue = value > max ? max : min;
          } else {
            updatedValue = value;
          }
          this.setValue(updatedValue);
        }
        this.setValue(updatedValue);
        this.currentValue = value;
        return true;
      },
      validateValue(type, value) {
        let result = false;
        if (type === 'input'
          && value.match(/^-?\.?$|\.$/)) {
          result = true;
        }
        if (type === 'change'
          && value === this.currentValue) {
          result = true;
        }
        return result;
      },
      focus() {
        this.focused = true;
      },
      blur() {
        this.focused = false;
      },
      keyDownEvent(e) {
        if (e.keyCode === 38) {
          e.preventDefault();
          this.up(e);
        } else if (e.keyCode === 40) {
          e.preventDefault();
          this.down(e);
        }
      },
      wheelEvent(e) {
        e.preventDefault();
        if (e.wheelDeltaY === 120) {
          this.up(e);
        } else if (e.wheelDeltaY === -120) {
          this.down(e);
        }
      },
    },
    init() {
    },
  };
</script>
<style lang="scss">
  @import '~@/styles/default';

  .ev-input-number {
    display: inline-block;
    width: 100%;
    line-height: 1.5;
    padding: 0px;
    font-size: 12px;
    color: #495060;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    margin: 0;
    height: 32px;
    vertical-align: middle;
    border: 1px solid #dddee1;
    border-radius: 4px;
    overflow: hidden;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('number-input-border');
      background-color: evThemed('number-input-background');
    }
  }
  .ev-input-number-handler-wrap {
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
  .ev-input-number:hover {
    border-color: #2d8cf0;
  }
  .ev-input-number:hover .ev-input-number-handler-wrap {
    border-color: #2d8cf0;
    opacity: 1;
  }

  .ev-input-number:hover i{
    color : #2d8cf0;
  }

  /*inner input div class*/
  .ev-input-number-input-wrap {
    overflow: hidden;
    height: 32px;
  }

  .ev-input-number-input {
    width: 100%;
    height: 32px;
    line-height: 32px;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    border: 0;
    border-radius: 4px;
    background-color: transparent;

    @include evThemify() {
      color: evThemed('font-color-base');
    }
  }

  /*handler line class*/
  .ev-input-number-handler {
    display: block;
    width: 100%;
    height: 16px;
    line-height: 0;
    text-align: center;
    overflow: hidden;
    color: #999;
    position: relative;
    padding-top: 1px;
    padding-left: 1px;
    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('number-input-border');
      background-color: evThemed('number-input-background');
    }
  }
  .ev-input-number-handler-up {
    cursor: pointer;
  }
  .ev-input-number-handler-down {
    border-top: 1px solid #dddee1;
    top: -1px;
    cursor: pointer;
  }
  /*disable base class*/
  .ev-input-number-disabled {
    cursor: not-allowed;
    @include evThemify() {
      color: evThemed('number-input-disabled');
      background-color: evThemed('number-input-disabled-background');
    }

    .ev-input-number-handler-wrap {
      display: none;
    }
    .ev-input-number-handler {
      opacity: .72;
      cursor: not-allowed;
    }
    .ev-input-number-input {
      opacity: 1;
      cursor: not-allowed;
      @include evThemify() {
        color: evThemed('textfield-input-disabled');
      }
    }
  }
  /*use border color when mouse hover*/
  .ev-input-number-disabled:hover {
    border-color: $color-not-allow;
  }

  .ev-input-number-input[disabled] {
    opacity: 1;
    cursor: not-allowed;
  }
</style>
