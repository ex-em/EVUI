<template>
  <div>
    <div
      :style="styleObject"
      :class="wrapClasses"
    >
      <template v-if="type !== 'textarea'">
        <input
          :class="inputClasses"
          @keydown.stop="keyDown"
          @change="change"
          @input="change"
        >
      </template>
      <textarea
        v-else
        :style="styleObject"
        :value="currentValue"
        :class="inputClasses"
        :placeholder="placeholder"
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
        <p>{{ currentTextLength }} / {{ totalTextLength }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { Console } from '../../common/utils';

  const prefixCls = 'evui-input-text';

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
      type: {
        type: String,
        default: 'input',
      },
      placeholder: {
        type: String,
        default: '',
      },
      useAsterisk: {
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
    },
    data() {
      return {
        focus: false,
        cssError: false,
        maxError: false,
        useValid: true,
        textError: false,
        currentValue: this.value,
        errorMsgWrapper: this.errorMsg,
        totalTextLength: this.maxLength,
        currentTextLength: this.value.length,
      };
    },
    computed: {
      styleObject: function styleObject() {
        return {
          width: parsedStyle(this.width),
          height: parsedStyle(this.height),
        };
      },
      wrapTextClass: function wrapTextClass() {
        return [
          `${prefixCls}-valid-check`,
        ];
      },
      errorTextClass: function errorClass() {
        return [
          `${prefixCls}-valid-error`,
        ];
      },
      maxLengthClass: function maxLengthClass() {
        return [
          `${prefixCls}-valid-max-length`,
          {
            error: this.maxError,
          },
        ];
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
          {
            focus: this.focus,
          },
          {
            error: this.cssError,
          },
        ];
      },
      inputClasses: function inputClasses() {
        return `${prefixCls}-${this.type}`;
      },
    },
    watch: {
      currentValue(value) {
        this.currentValue = value;
        this.currentTextLength = value.length;
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
      onFocus(e) {
        this.preventDefault(e);
        this.focus = true;
      },
      onBlur(e) {
        this.preventDefault(e);
        this.focus = false;
      },
      change(e) {
        this.preventDefault(e);
        const value = e.target.value;
        let isMaxLength = false;
        this.cssError = false;
        Console.log(value);

        if (this.useRegExp) {
          this.validateRegExp(value);
        }

        if (this.useMaxLength) {
          this.maxError = false;
          isMaxLength = this.validateTextLength(value);
        }

        if (isMaxLength) {
          this.maxError = true;
          this.cssError = true;
          this.currentValue = value.slice(0, this.maxLength);
          e.target.value = this.currentValue;
        } else {
          this.currentValue = value;
          this.setValue(value);
        }
      },
      setValue(value) {
        const updateValue = value;
        this.$nextTick(() => {
          this.currentValue = updateValue;
        });
        return updateValue;
      },
      validateTextLength(value) {
        const validValue = value;
        let result = false;
        if (validValue.length >= this.maxLength) {
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
    },
  };
</script>
<style scoped>
</style>

