<template>
  <label
    ref="label"
    :class="labelClass"
    :style="labelStyle"
  >
    {{ labelText }}
  </label>
</template>
<script>
  const prefixCls = 'ev-label';
  export default {
    props: {
      value: {
        type: [String, Number],
        default: '',
      },
      size: {
        type: String,
        default: 'medium',
      },
      userCls: {
        type: String,
        default: '',
      },
      textAlign: {
        type: String,
        default: 'center',
      },
    },
    data() {
      return {
        labelSize: this.size,
      };
    },
    computed: {
      labelText() {
        return this.value;
      },
      hAlign() {
        let align;

        switch (this.textAlign) {
          case 'left':
          case 'center':
          case 'right':
            align = this.textAlign;
            break;
          default:
            align = 'center';
            break;
        }

        return align;
      },
      labelStyle() {
        return {
          textAlign: this.hAlign,
        };
      },
      labelClass() {
        return [
          `${prefixCls}`,
          `${prefixCls}-${this.labelSize}`,
          `${this.userCls}`,
        ];
      },
    },
    methods: {
    },
  };
</script>
<style>
  .ev-label {
    display: inline-block;
  }
  .ev-label-small {
    font-size: 12px;
  }
  .ev-label-medium {
    font-size: 14px;
  }
  .ev-label-large {
    font-size: 16px;
  }
</style>
