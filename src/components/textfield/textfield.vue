<template>
  <div>
    <div
      :style="wrapStyle"
      :class="wrapClasses"
    >
      <input
        v-if="type === 'input'"
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

  const prefixCls = 'ev-input-text';

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
        default: 'input',
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
          background: '#fff',
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
      handleEnter(event) {
        this.$emit('on-enter', event);
      },
      handleKeyDown(event) {
        this.$emit('on-keydown', event);
      },
      handleKeyUp(event) {
        this.$emit('on-keyup', event);
      },
      handleFocus(event) {
        this.focus = true;
        this.$emit('on-focus', event);
      },
      handleBlur(event) {
        this.focus = false;
        this.$emit('on-blur', event);
      },
      handleInput(event) {
        const value = event.target.value;

        this.$emit('input', value);
        this.setCurrentValue(value);
        this.$emit('on-input-change', event);
      },
      handleChange(event) {
        this.$emit('on-change', event);
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
  .ev-input-text {
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

  .ev-input-text:hover {
    border-color : #adaeb1;
  }

  .ev-input-text.focus, .ev-input-text.focus:hover {
    border-color : #2d8cf0;
    opacity: 1;
  }

  .ev-input-text-input {
    width: 100%;
    padding: 0 7px;
    text-align: left;
    outline: 0;
    -moz-appearance: textfield;
    color: #666;
    border: 0;
    border-radius: 4px;
  }

  .ev-input-text-input[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #495060;
  }

  .ev-input-text-disabled .ev-input-text-input {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-text-disabled .ev-input-text-input.evui-input-text-textarea {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-text-disabled:hover, .ev-input-text:hover.error,
  .ev-input-text.focus.error, .ev-input-text.error {
    border-color : #d77f7f;
  }

  .ev-input-text-disabled .ev-input-text {
    opacity: .72;
    cursor: not-allowed;
    background-color: #f3f3f3;
  }

  .ev-input-text.ev-input-text-disabled {
    background-color: #f3f3f3;
  }

  .ev-input-text-disabled {
    opacity: .72;
    color: #5f5d5d !important;
    cursor: not-allowed;
  }

  .ev-input-text-textarea {
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

  .ev-input-text-textarea[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .ev-input-text-valid-check {
    font-size: 12px;
  }

  .ev-input-text-valid-error {
    padding-left: 3px;
    padding-right: 5px;
    color: #ed1313;
    float:left
  }

  .ev-input-text-valid-max-length {
    padding-left: 5px;
    padding-right: 3px;
    float:right
  }

  .ev-input-text-valid-max-length.error {
    color: #ed1313;
  }
</style>

