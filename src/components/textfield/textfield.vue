<template>
  <div>
    <div
      :style="styleObject"
      :class="wrapClasses"
    >
      <input
        v-if="type === 'input'"
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
  const prefixCls = 'evui-input-text';

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
        currentValue: '',
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
      wrapClasses() {
        return [
          `${prefixCls}`,
          { [`${prefixCls}-disabled`]: this.disabled },
          { focus: this.focus },
          { error: this.cssError },
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
    created() {
      this.textError = false;
      this.cssError = false;
      this.maxError = false;

      if (this.useRegExp) {
        this.validateRegExp(this.value);
      }

      if (this.useMaxLength && this.validateTextLength(this.value)) {
        this.currentValue = this.value.slice(0, this.maxLength);
      } else {
        this.currentValue = this.value;
      }
    },
    methods: {
      onFocus() {
        this.focus = true;
      },
      onBlur() {
        this.focus = false;
      },
      change(e) {
        this.textError = false;
        this.cssError = false;
        this.maxError = false;

        const targetValue = e.target.value;

        if (this.useRegExp) {
          this.validateRegExp(targetValue);
        }

        if (this.useMaxLength && this.validateTextLength(targetValue)) {
          this.currentValue = targetValue.slice(0, this.maxLength);
        } else {
          this.currentValue = targetValue;
        }

        e.target.value = this.currentValue;
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
    border: 2px solid #dddee1;
    color: #495060;
    font-size: 12px;
    line-height: 2;
    cursor: text;
    background-image: none;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .evui-input-text:hover {
    border-color : #adaeb1;
  }

  .evui-input-text.focus, .evui-input-text.focus:hover {
    border-color : #2d8cf0;
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

  .evui-input-text-input[disabled] {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #495060;
  }

  .evui-input-text-disabled .evui-input-text-input {
    background-color: #f3f3f3;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .evui-input-text-disabled .evui-input-text-input.evui-input-text-textarea {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: not-allowed;
    color: #5f5d5d;
  }

  .evui-input-text-disabled:hover, .evui-input-text:hover.error,
  .evui-input-text.focus.error, .evui-input-text.error {
    border-color : #d77f7f;
  }

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
    color: #5f5d5d !important;
    cursor: not-allowed;
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
    color: #5f5d5d;
  }

  .evui-input-text-valid-check {
    font-size: 12px;
  }

  .evui-input-text-valid-error {
    padding-left: 3px;
    padding-right: 5px;
    color: #ed1313;
    float:left
  }

  .evui-input-text-valid-max-length {
    padding-left: 5px;
    padding-right: 3px;
    float:right
  }

  .evui-input-text-valid-max-length.error {
    color: #ed1313;
  }
</style>

