<template>
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
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxLength"
      spellcheck="false"
      autocomplete="autoComplete"
      required
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
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxLength"
      spellcheck="false"
      required
      @keyup.enter="handleEnter"
      @keyup="handleKeyUp"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      @change="handleChange"
    />
    <label class="loginLabel">{{ placeholder }}</label>
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
  // import '@/styles/evui.css';

  const prefixCls = 'ev-login';

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
        autoComplete: this.type === 'password' ? 'new-password' : null,
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

<style lang="scss">
  @import '~evui/styles/default';

  .ev-login {
    font-family: 'NanumGothic';
    display: inline-block;
    position: relative;
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
  }
  .ev-login.focus, .ev-login.focus:hover {
    border-color : #2d8cf0;
    opacity: 1;
  }
  .ev-login-text, .ev-login-password {
    width: 100%;
    height: 100%;
    font-size:18px;
    padding:10px 10px 10px 12px;
    display:block;
    border: 1px solid #dadce0;
    border-radius: 3px;
  }
  .ev-login-text:focus, .ev-login-password:focus {
    outline:none;
    border: 2px solid #2d8cf0;
    border-radius: 3px;
  }

  /* LABEL ======================================= */
  .loginLabel {
    color:#999;
    font-size:18px;
    font-weight:normal;
    position:absolute;
    pointer-events:none;
    left:12px;
    top:10px;
    transition:0.1s ease all;
    -moz-transition:0.1s ease all;
    -webkit-transition:0.1s ease all;
  }
  /* active state */
  .ev-login-text:focus ~ .loginLabel, .ev-login-text:valid ~ .loginLabel,
  .ev-login-password:focus ~ .loginLabel, .ev-login-password:valid ~ .loginLabel {
    top:-13px;
    left:7px;
    font-size:14px;
    padding: 0 5px 0 5px;
    color:#2d8cf0;
    background-color: #ffffff;
    font-weight:600;
  }

</style>

