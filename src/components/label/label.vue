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
        default: true,
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
          height: parsedStyle(this.offsetHeight),
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
        let status;

        if (this.checkValid) {
          if (
            this.isError === true
            || (this.isSuccess === true && this.isFailed === true)
          ) {
            status = 'error';
            } else {
              if (this.isSuccess === true) {
                status = this.isSuccess ? 'success' : 'fail';
              }
              if (this.isFailed === true) {
                status = this.isFailed ? 'fail' : 'success';
              }
            }
        } else {
          status = 'normal';
        }
        return [
          `${prefixCls}-inner`,
          `${prefixCls}-${status}`,
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

      if (this.fit === true && this.$refs.label) {
        this.offsetWidth = parsedStyle(this.$refs.label.offsetWidth + asterSize[this.size]);
      }
    },
    methods: {
      setValue: function setValue(value) {
        let result = value;

        if (this.mandatory === true) {
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
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .evui-label-outer {
    margin: 0;
    padding: 2px;
    vertical-align: middle;
    line-height: 1.5;
    font-weight: bold;
    user-select: none;
  }
  .evui-label-error {
    color: red;
  }
  .evui-label-success {
    background-color: green;
    color: #fff;
  }
  .evui-label-fail {
    background-color: red;
    color: #fff;
  }
</style>
