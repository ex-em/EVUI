<template>
  <div
    ref="wrapper"
    :style="wrapperStyle"
    class="ev-label-wrapper">
    <div class="ev-label-inner">
      <label
        ref="label"
        :class="labelClass"
      >
        {{ labelText }}
      </label>
    </div>
  </div>
</template>
<script>
  import { getQuantity } from '@/common/utils';

  const prefixCls = 'ev-label';
  export default{
    props: {
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
      textAlign: {
        type: String,
        default: 'center',
      },
      verticalAlign: {
        type: String,
        default: 'middle',
      },
    },
    data() {
      return {
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
          case 'right':
          case 'center':
            align = this.textAlign;
            break;
          default:
            align = 'center';
        }

        return align;
      },
      vAlign() {
        let align;

        switch (this.verticalAlign) {
          case 'top':
          case 'middle':
          case 'bottom':
            align = this.verticalAlign;
            break;
          default:
            align = 'top';
            break;
        }

        return align;
      },
      offsetWidth() {
        return this.getSize(getQuantity(this.width));
      },
      offsetHeight() {
        return this.getSize(getQuantity(this.height));
      },
      wrapperStyle() {
        return {
          width: this.offsetWidth,
          height: this.offsetHeight,
        };
      },
      labelClass() {
        return [
          `${prefixCls}`,
          `${this.hAlign}-${this.vAlign}`,
        ];
      },
    },
    methods: {
      getSize(size) {
        let sizeValue;

        if (size) {
          sizeValue = size.unit ? size.value + size.unit : `${size.value}px`;
        } else {
          sizeValue = '100%';
        }
        return sizeValue;
      },
    },
  };
</script>
<style>
  .ev-label-wrapper {
    position: relative;
  }
</style>
<style scoped>
  .ev-label-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .ev-label {
    position: absolute;
  }

  .ev-label-inner .left-top {
    top: 0;
    left: 0;
    transform: translate(0, 0);
  }

  .ev-label-inner .left-middle {
    top: 50%;
    left: 0;
    transform: translate(0, -50%);
  }

  .ev-label-inner .left-bottom {
    top: 100%;
    left: 0;
    transform: translate(0, -100%);
  }

  .ev-label-inner .center-top {
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .ev-label-inner .center-middle {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .ev-label-inner .center-bottom {
    top: 100%;
    left: 50%;
    transform: translate(-50%, -100%);
  }

  .ev-label-inner .right-top {
    top: 0;
    right: 0;
    transform: translate(-100%, 0);
  }

  .ev-label-inner .right-top {
    top: 0;
    left: 100%;
    transform: translate(-100%, 0);
  }

  .ev-label-inner .right-middle {
    top: 50%;
    left: 100%;
    transform: translate(-100%, -50%);
  }

  .ev-label-inner .right-bottom {
    top: 100%;
    left: 100%;
    transform: translate(-100%, -100%);
  }
</style>
