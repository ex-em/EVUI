<template>
  <div
    :style="styleObject"
    :class="wrappedOuterClass"
  >
    <div
      :class="wrappedValidClass"
    >
      <label
        ref="label"
        :class="wrappedLabelClass"
      >
        {{ currentValue }}
      </label>
    </div>
  </div>
</template>
<script>
  const prefixCls = 'evui-label';

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
  export default{
    props: {
      size: {
        type: String,
        default: 'medium',
      },
      value: {
        type: String,
        default: '',
      },
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: '100%',
      },
      fit: {
        type: Boolean,
        default: false,
      },
      mandatory: {
        type: Boolean,
        default: false,
      },
      checkValid: {
        type: Boolean,
        default: false,
      },
      isSuccess: {
        type: Boolean,
        default: false,
      },
      isFailed: {
        type: Boolean,
        default: false,
      },
      isError: {
        type: Boolean,
        default: false,
      },
      isAlarm: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        currentValue: this.setValue(this.value),
        offsetWidth: this.width,
        offsetHeight: this.height,
      };
    },
    computed: {
      styleObject: function styleObject() {
        return {
          width: parsedStyle(this.offsetWidth),
        };
      },
      wrappedOuterClass() {
        const sizeCls = this.size;
        return [
          `${prefixCls}-outer`,
          `${prefixCls}-size-${sizeCls}`,
        ];
      },
      wrappedValidClass() {
        let status = '';

        if (this.checkValid) {
          if (
            this.isError || (this.isSuccess && this.isFailed)
          ) {
            status = 'error';
            } else {
              if (this.isSuccess) {
                status = 'success';
              }
              if (this.isFailed) {
                status = 'fail';
              }
            }
        }
        return [
          `${prefixCls}-inner`,
          `${prefixCls} ${status}`,
        ];
      },
      wrappedLabelClass() {
        return [
          `${prefixCls}-native`,
        ];
      },
    },
    watch: {
      mandatory: function mandatory() {
        this.currentValue = this.setValue(this.value);
      },
    },
    mounted() {
      const asterSize = {
        large: 25,
        medium: 18,
        small: 13,
      };
      if (this.fit && this.$refs.label) {
        this.offsetWidth = parsedStyle(this.$refs.label.offsetWidth + asterSize[this.size]);
      }
    },
    methods: {
      setValue: function setValue(value) {
        let result = value;
        if (this.mandatory) {
          result = `* ${result}`;
        }
        return result;
      },
    },
  };
</script>
<style scoped>
  .evui-label-native {
    padding: 0 2px 0 2px;
  }
  .evui-label-inner {
    height: 30px;
    text-align: center;
    line-height: 1.8;
    border-radius: 4px;
  }
  .evui-label-outer {
    display: inline-block;
    margin: 0;
    padding: 0 2px 0 2px;
    vertical-align: middle;
    line-height: 1.5;
    font-weight: bold;
    font-size: 15px;
    user-select: none;
  }
  .evui-label-error {
    color: red;
  }
  .evui-label {
    transition:all .2s ease-in-out;
  }
  .evui-label.success {
    background-color: #34C032;
    color: #fff;
  }
  .evui-label.fail {
    background-color: #F53243;
    color: #fff;
  }
</style>
