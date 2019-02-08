<template>
  <div>
    <div
      :style="wrapStyle"
      :class="wrapClasses"
    >
      <input
        v-if="type !== 'textarea'"
        :type="type"
        :style="wrapStyle"
        :value="currentValue"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        spellcheck="false"
        @keyup.enter="handleEnter"
        @keyup="handleKeyUp"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
      >
      <textarea
        v-else
        :style="wrapStyle"
        :value="currentValue"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        spellcheck="false"
        @keyup.enter="handleEnter"
        @keyup="handleKeyUp"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
      />
    </div>
    <div :class="wrapTextClass">
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
  import { getQuantity, getSize } from '@/common/utils';

  const prefixCls = 'ev-input';

  export default {
    name: 'TextField',
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
        validator(value) {
          const supportType = ['text', 'password', 'textarea'];
          return !!supportType.filter(item => value === item).length;
        },
        default: 'text',
      },
      placeholder: {
        type: String,
        default: '',
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
        currentValue: this.value,
        currentLength: this.value.length,
        totalLength: this.maxLength,
        focus: false,
        cssError: false,
        maxError: false,
        textError: false,
        errorMsgWrapper: this.errorMsg,
      };
    },
    computed: {
      wrapClasses() {
        return [
          `${prefixCls}`,
          { [`${prefixCls}-disabled`]: this.disabled },
          { focus: this.focus },
          { error: this.cssError },
        ];
      },
      wrapStyle() {
        return {
          width: getSize(getQuantity(this.width)),
          height: getSize(getQuantity(this.height)),
          background: this.disabled ? '#f3f3f3' : '#fff',
        };
      },
      wrapTextClass() {
        return `${prefixCls}-valid-check`;
      },
      errorTextClass() {
        return `${prefixCls}-valid-error`;
      },
      maxLengthClass() {
        return [
          `${prefixCls}-valid-max-length`,
          { error: this.maxError },
        ];
      },
      inputClasses() {
        return `${prefixCls}-${this.type}`;
      },
    },
    watch: {
      value(val) {
        this.setCurrentValue(val);
      },
    },
    created() {
      this.validateError(this.currentValue);
    },
    methods: {
      handleEnter(e) {
        this.$emit('on-enter', e);
      },
      handleKeyDown(e) {
        this.$emit('on-keydown', e);
      },
      handleKeyUp(e) {
        this.$emit('on-keyup', e);
      },
      handleFocus(e) {
        this.focus = true;
        this.$emit('on-focus', e);
      },
      handleBlur(e) {
        this.focus = false;
        this.$emit('on-blur', e);
      },
      handleInput(e) {
        const value = e.target.value;

        this.$emit('input', value);
        this.setCurrentValue(value);
        this.$emit('on-input-change', e);
      },
      handleChange(e) {
        this.$emit('on-change', e);
      },
      setCurrentValue(value) {
        if (value === this.currentValue) {
          return;
        }

        this.validateError(value);
      },
      validateError(value) {
        this.textError = false;
        this.cssError = false;
        this.maxError = false;

        if (this.useRegExp) {
          this.validateRegExp(value);
        }

        if (this.useMaxLength) {
          this.validateTextLength(value);
        }

        this.currentValue = value;
        this.currentLength = value.length;
      },
      validateTextLength(value) {
        if (value.length >= this.maxLength) {
          this.maxError = true;
          this.cssError = true;
          return true;
        }

        return false;
      },
      validateRegExp(value) {
        const validValue = value;
        if (this.regExp === null) {
          return false;
        }

        const checked = this.regExp.exec(validValue);
        if (checked === null) {
          this.textError = false;
          this.cssError = false;
          return false;
        }

        const filteredValue = checked[0];
        if (filteredValue.length !== 0) {
          this.textError = true;
          this.cssError = true;
          return true;
        }

        this.textError = false;
        this.cssError = false;
        return false;
      },
    },
  };
</script>
<style>
  .ev-input {
    display: inline-block;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 2px solid #dddee1;
    color: #495060;
    font-size: 12px;
    line-height: 2;
    cursor: text;
    background-image: none;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .ev-input:hover {
    border-color : #adaeb1;
  }

  .ev-input.focus, .ev-input.focus:hover {
    border-color : #2d8cf0;
    opacity: 1;
  }

  .ev-input-text {
    width: 100%;
    height: 100%;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }

  .ev-input-text[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #495060;
  }

  .ev-input-disabled .ev-input-text {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-disabled .ev-input-text.evui-input-textarea.ev-input-password {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-password {
    width: 100%;
    height: 100%;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }

  .ev-input-password[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #495060;
  }

  .ev-input-disabled .ev-input-password {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-disabled:hover, .ev-input:hover.error,
  .ev-input.focus.error, .ev-input.error {
    border-color : #d77f7f;
  }

  .ev-input-disabled .ev-input {
    opacity: .72;
    cursor: not-allowed;
    background-color: #f3f3f3;
  }

  .ev-input.ev-input-disabled {
    background-color: #f3f3f3;
  }

  .ev-input-disabled {
    opacity: .72;
    color: #5f5d5d !important;
    cursor: not-allowed;
  }

  .ev-input-textarea {
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

  .ev-input-textarea[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-valid-check {
    font-size: 12px;
  }

  .ev-input-valid-error {
    padding-left: 3px;
    padding-right: 5px;
    color: #ed1313;
    float:left
  }

  .ev-input-valid-max-length {
    padding-left: 5px;
    padding-right: 3px;
    float:right
  }

  .ev-input-valid-max-length.error {
    color: #ed1313;
  }
</style>

