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
        v-if="useRegExp && isError"
        :class="errorClass"
        style="float:left"
      >
        <p>{{ customErrorMsg }}</p>
      </div>
      <div
        v-if="useMaxLength"
        :class="maxLengthClass"
        style="float:right">
        <p>{{ currentTextLength }} / {{ totalTextLength }}</p>
      </div>
    </div>
  </div>
</template>

<script>
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
      maxLength: {
        type: Number,
        default: Infinity,
      },
      useRegExp: {
        type: Boolean,
        default: true,
      },
      useMaxLength: {
        type: Boolean,
        default: true,
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
        isError: false,
        customErrorMsg: this.errorMsg,
        currentTextLength: this.value.length,
        totalTextLength: this.maxLength,
        currentValue: this.value,
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
      errorClass: function errorClass() {
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
        const value = e.target.value;
        let isMaxLength = false;

        if (this.useRegExp) {
          this.isError = false;
          this.cssError = false;
          this.validateRegExp(value);
        }

        if (this.useMaxLength) {
          this.maxError = false;
          isMaxLength = this.validateTextLength(value);
        }

        if (isMaxLength) {
          this.maxError = true;
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
        if (validValue.length > this.maxLength) {
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
          return result;
        }
        const filteredValue = checked[0];
        if (filteredValue.length === 0) {
          this.isError = true;
          this.cssError = true;
          result = true;
        } else {
          this.isError = false;
          this.cssError = false;
          result = true;
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

