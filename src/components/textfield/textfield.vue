<template>
  <div>
    <div
      :style="styleObject"
      :class="wrapClasses"
    >
      <template
        v-if="type !== 'textarea'"
      >
        <input
          :class="inputClasses"
          :value="currentValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          spellcheck="false"
          @focus.prevent="onFocus"
          @blur.prevent="onBlur"
          @change.prevent="change"
          @input.prevent="change"
        >
      </template>
      <textarea
        v-else
        :style="styleObject"
        :value="currentValue"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        spellcheck="false"
        @focus="onFocus"
        @blur="onBlur"
        @change="change"
        @input="change"
      />
    </div>
    <div
      :class="wrapTextClass"
    >
      <div
        v-show="useRegExp && textError"
        :class="errorTextClass"
      >
        <p>{{ errorMsgWrapper }}</p>
      </div>
      <div
        v-show="useMaxLength"
        :class="maxLengthClass"
      >
        <p>{{ currentLength }} / {{ totalLength }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  const prefixCls = 'evui-input-text';
  const bulletChar = String.fromCharCode(0x2022);

  function parsedStyle(value) {
    const mark = value.toString();
    let result = mark;
    if (!mark.match(/([1-9]+)([0-9]*)(px|%+)/g)) {
       result = mark.concat('px');
    }
    return result;
  }

  export default {
    name: 'TextField',
    components: {
    },
    props: {
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: '100%',
      },
      value: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'input',
      },
      placeholder: {
        type: String,
        default: '',
      },
      hideString: {
        type: Boolean,
        default: false,
      },
      maxLength: {
        type: Number,
        default: Infinity,
      },
      useRegExp: {
        type: Boolean,
        default: false,
      },
      useMaxLength: {
        type: Boolean,
        default: false,
      },
      regExp: {
        type: RegExp,
        default: null,
      },
      errorMsg: {
        type: String,
        default: 'Wrong Message',
      },
      borderColor: {
        type: String,
        default: '#dddee1',
      },
    },
    data() {
      return {
        focus: false,
        cssError: false,
        maxError: false,
        textError: false,
        currentValue: null,
        originValue: this.value,
        totalLength: this.maxLength,
        currentLength: this.value.length,
        errorMsgWrapper: this.errorMsg,
      };
    },
    computed: {
      styleObject() {
        return {
          width: parsedStyle(this.width),
          height: parsedStyle(this.height),
          border: `1px solid ${this.borderColor}`,
        };
      },
      wrapTextClass() {
        return [
          `${prefixCls}-valid-check`,
        ];
      },
      errorTextClass() {
        return [
          `${prefixCls}-valid-error`,
        ];
      },
      maxLengthClass() {
        return [
          `${prefixCls}-valid-max-length`,
          {
            error: this.maxError,
          },
        ];
      },
      formatterValue() {
        return this.currentValue;
      },
      wrapClasses() {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-disabled`]: this.disabled,
          },
          {
            focus: this.focus,
          },
          {
            error: this.cssError,
          },
        ];
      },
      inputClasses() {
        return `${prefixCls}-${this.type}`;
      },
    },
    watch: {
      currentValue(value) {
        this.currentValue = value;
        this.currentLength = value.length;
      },
    },
    methods: {
      onFocus() {
        this.focus = true;
      },
      onBlur() {
        this.focus = false;
      },
      change(e) {
        this.setChangingFlags();

        const targetValue = e.target.value;

        if (!this.hideString && this.useRegExp) {
          this.validateRegExp(this.originValue);
        }
        this.originValue = this.setOriginText(e, this.originValue, targetValue);
        if (this.useMaxLength && this.validateTextLength(targetValue)) {
          this.originValue = this.originValue.slice(0, this.maxLength);
          this.currentValue = targetValue.slice(0, this.maxLength);
        } else {
          this.currentValue = targetValue;
      }
        if (this.hideString) {
          this.currentValue = this.changeStrToBullet(this.currentValue);
        }

        e.target.value = this.currentValue;
      },
      setChangingFlags() {
        this.textError = false;
        this.cssError = false;
        this.maxError = false;
      },
      setOriginText(e, origin, target) {
        let result = origin;
        if (e.type === 'input') {
          if (e.data !== null) {
            result += e.data;
          } else if (target.length !== 0) {
            result += e.target.value.replace(/(\u2022)*/g, '');
          } else {
            result = '';
          }
        }
        return result;
      },
      changeStrToBullet(origin) {
        const result = [];
        const bullet = bulletChar;
        let length = origin.length;
        while (length--) {
          result.push(bullet);
        }
        return result.join('');
      },
      validateTextLength(value) {
        const validValue = value;
        let result = false;

        if (validValue.length >= this.maxLength) {
          this.maxError = true;
          this.cssError = true;
          result = true;
        }
        return result;
      },
      validateRegExp(value) {
        const validValue = value;
        let result = false;
        if (this.regExp === null) {
          return result;
        }
        const checked = this.regExp.exec(validValue);
        if (checked === null) {
          this.textError = false;
          this.cssError = false;
          return result;
        }
        const filteredValue = checked[0];
        if (filteredValue.length !== 0) {
          this.textError = true;
          this.cssError = true;
          result = true;
        } else {
          this.textError = false;
          this.cssError = false;
          result = false;
        }
        return result;
      },
    },
    init() {
      if (this.hideString) {
        this.currentValue = this.changeStrToBullet(this.value);
      } else {
        this.currentValue = this.value;
      }
    },
  };
</script>
<style>
  /* base class */
  .evui-input-text {
    display: inline-block;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    color: #495060;
    font-size: 12px;
    line-height: 2;
    cursor: text;
    background-image: none;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  /*border color when mouse hover*/
  .evui-input-text.focus, .evui-input-text.focus:hover {
    border-color : #2d8cf0;
    opacity: 1;
  }

  .evui-input-text:hover {
    border-color : #A6A6A6;
    opacity: 1;
  }

  .evui-input-text-input {
    width: 100%;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }

  /*disable base class*/
  .evui-input-text-disabled .evui-input-text-input.evui-input-text-textarea {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
  }
  /*use border color when mouse hover*/
  .evui-input-text-disabled:hover,.evui-input-text:hover.error,  .evui-input-text.focus.error {
    border-color : #D77F7F;
  }
  /*inner input div class*/
  .evui-input-text-disabled .evui-input-text {
    opacity: .72;
    cursor: not-allowed;
    background-color: #f3f3f3;
  }
  .evui-input-text.evui-input-text-disabled {
    background-color: #f3f3f3;
  }
  .evui-input-text-disabled {
    opacity: .72;
    color: #ccc!important;
    cursor: not-allowed;
  }
  .evui-input-text-input[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
  }

  .evui-input-text-textarea {
    display: block;
    text-align: left;
    line-height: 1.5;
    padding: 4px 7px;
    outline: 0;
    color: #666;
    border: 0;
    overflow: hidden;
    border-radius: 4px;
  }

  .evui-input-text-textarea[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
  }

  .evui-input-text-valid-check {
    font-size: 12px;
  }
  .evui-input-text-valid-error {
    padding-left: 3px;
    padding-right: 5px;
    color: #ED1313;
    float:left
  }
  .evui-input-text-valid-max-length {
    padding-left: 5px;
    padding-right: 3px;
    float:right
  }

  .evui-input-text-valid-max-length.error {
    color: #ED1313;
  }

  /*base class*/
  .evui-input-text {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #dddee1;
    color: #495060;
    font-size: 12px;
    line-height: 2;
    cursor: text;
    background-image: none;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  /*border color when mouse hover*/
  .evui-input-text:hover {
    border-color : #2d8cf0;
  }

  .evui-input-text-input {
    width: 100%;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }

  /*disable base class*/
  .evui-input-text-disabled .evui-input-text-input {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #ccc;
  }
  /*use border color when mouse hover*/
  .evui-input-text-disabled:hover {
    border-color : #D77F7F;
  }
  /*inner input div class*/
  .evui-input-text-disabled .evui-input-text {
    opacity: .72;
    cursor: not-allowed;
    background-color: #f3f3f3;
  }
  .evui-input-text.evui-input-text-disabled {
    background-color: #f3f3f3;
  }
  .evui-input-text-disabled {
    opacity: .72;
    color: #ccc!important;
    cursor: not-allowed;
  }
  .evui-input-text-input[disabled] {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #ccc;
  }
</style>

