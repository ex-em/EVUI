<template>
  <div>
    <div
      :style="styleObject"
      :class="wrapClasses"
    >
      <template v-if="type !== 'textarea'">
        <input
          :class="inputClasses"
          :value="currentValue"
          :placeholder="placeholder"
          spellcheck="false"
          @focus="onFocus"
          @input="change"
          @blur="onBlur"
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
        @input="change"
        @blur="onBlur"
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
    },
    data() {
      return {
        focus: false,
        cssError: false,
        maxError: false,
        textError: false,
        originValue: this.value,
        currentValue: null,
        errorMsgWrapper: this.errorMsg,
        totalLength: this.maxLength,
        currentLength: this.value.length,
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
        this.currentLength = value.length;
      },
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
        this.setChangingFlags();

        const targetValue = e.target.value;
        this.originValue = this.setOriginText(e, this.originValue, targetValue);

        if (!this.hideString && this.useRegExp) {
          this.validateRegExp(this.originValue);
        }

        if (this.useMaxLength && this.validateTextLength(targetValue)) {
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
            result += e.target.value.replace(/(\*)*/g, '');
          } else {
            result = '';
          }
        }
        return result;
      },
      changeStrToBullet(origin) {
        const result = [];
        const bullet = String.fromCharCode(0x2022);
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
<style scoped>
</style>

