<template>
  <div
    ref="slider"
    :style="styles"
    :class="classes"
    @click="onClick"
  >
    <template v-if="showDots">
      <div
        v-for="(item, idx) in dotList"
        :key="name+'Dot'+idx"
        :style="{ left: `${item.valuePer}%` }"
        :class="`${prefixCls}-dot`"
        @click="onClick"/>
    </template>
    <div
      :style="barStyle"
      :class="`${prefixCls}-bar`"/>
    <slider-tooltip
      :pos-x="leftBtnValuePer"
      :is-dragging="leftBtnDragging"
      :content="leftBtnValue"
    >
      <div
        v-if="isRange"
        :style="`left: ${leftBtnValuePer}%`"
        :class="[`${prefixCls}-btn`, leftBtnDragging ? `${prefixCls}-btn-dragging` : '']"
        @mousedown="onMouseDown($event, 'left')"
        @touchstart="onMouseDown($event, 'left')"
      />
    </slider-tooltip>
    <slider-tooltip
      :pos-x="rightBtnValuePer"
      :is-dragging="rightBtnDragging"
      :content="rightBtnValue"
    >
      <div
        :style="`left: ${rightBtnValuePer}%`"
        :class="[`${prefixCls}-btn`, rightBtnDragging ? `${prefixCls}-btn-dragging` : '']"
        @mousedown="onMouseDown($event, 'right')"
        @touchstart="onMouseDown($event, 'right')"
      />
    </slider-tooltip>
  </div>
</template>

<script>
  import SliderTooltip from './slider-tooltip';

  const prefixCls = 'evui-slider';

  export default {
    components: {
      SliderTooltip,
    },
    props: {
      name: {
        type: String,
        default: '',
      },
      sliderStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      width: {
        type: [String, Number],
        default: 0,
      },
      height: {
        type: [String, Number],
        default: 0,
      },
      max: {
        type: Number,
        default: 100,
      },
      min: {
        type: Number,
        default: 0,
      },
      value: {
        type: [Number, Array],
        default: 0,
      },
      isRange: {
        type: Boolean,
        default: false,
      },
      showDots: {
        type: Boolean,
        default: false,
      },
      step: {
        type: Number,
        default: 1,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prefixCls,
        styles: {},
        dotList: [],
        maxValue: 0,
        minValue: 0,
        leftBtnValue: 0,
        leftBtnValuePer: 0,
        leftBtnDragging: false,
        rightBtnValue: 0,
        rightBtnValuePer: 0,
        rightBtnDragging: false,
      };
    },
    computed: {
      classes() {
        return [
          `${prefixCls}`,
          this.disabled ? `${prefixCls}-disabled` : '',
          (this.leftBtnDragging || this.rightBtnDragging) ? `${prefixCls}-dragging` : '',
        ];
      },
      barStyle() {
        return `left: ${this.leftBtnValuePer}%; width: ${this.rightBtnValuePer - this.leftBtnValuePer}%`;
      },
    },
    watch: {
      leftBtnValue() {
        const valueRange = this.maxValue - this.minValue;

        if (valueRange > 0) {
          this.leftBtnValuePer = ((this.leftBtnValue - this.minValue) / valueRange) * 100;
        } else {
          this.leftBtnValuePer = 0;
        }
      },
      rightBtnValue() {
        const valueRange = this.maxValue - this.minValue;

        if (valueRange > 0) {
          this.rightBtnValuePer = ((this.rightBtnValue - this.minValue) / valueRange) * 100;
        } else {
          this.rightBtnValuePer = 0;
        }
      },
    },
    created() {
      this.initStyles();
    },
    mounted() {
      // if (this.max % this.step) {
      //   // max 가 step 으로 나눴을 때 나머지가 생기면, max 범위 내에서 step 의 마지막 지점으로 max 값을 변경해준다.
      //   this.maxValue = this.step * Math.floor(this.max / this.step);
      // } else {
      //   this.maxValue = this.max;
      // }

      this.maxValue = this.max;
      this.minValue = this.min;

      this.initDotList();
      this.initBtnValue();
    },
    methods: {
      initStyles() {
        if (Object.keys(this.sliderStyle).length) {
          Object.assign(this.styles, this.sliderStyle);
        }

        if (this.width && !this.styles.width) {
          let width;

          if (typeof this.width === 'number') {
            width = `${this.width}px`;
          } else {
            width = this.width;
          }

          this.styles.width = width;
        }
      },
      initBtnValue() {
        let leftVal = 0;
        let rightVal = 0;

        if (this.isRange) {
          leftVal = this.value[0] || 0;
          rightVal = this.value[1] || 0;
        } else {
          leftVal = 0;
          rightVal = this.value;
        }

        if (leftVal < this.minValue) {
          leftVal = this.minValue;
        } else if (leftVal > this.maxValue) {
          leftVal = this.maxValue;
        }

        if (rightVal < this.minValue) {
          rightVal = this.minValue;
        } else if (rightVal > this.maxValue) {
          rightVal = this.maxValue;
        }

        this.leftBtnValue = this.getValueCloseToDot(leftVal);
        this.rightBtnValue = this.getValueCloseToDot(rightVal);
      },
      initDotList() {
        let ix = 0;
        let value = 0;
        const valueRange = this.maxValue - this.minValue;

        this.dotList = [];

        while (value <= this.maxValue) {
          if (this.minValue <= value) {
            this.dotList.push({
              value,
              valuePer: (((value - this.minValue) / valueRange) * 100).toFixed(4),
            });
          }

          ix++;
          value = ix * this.step;
        }
      },
      onClick(e) {
        if (this.disabled) {
          return;
        }

        const clickedValue = this.getClickedValue(e);
        let btnType = 'right';

        if (this.isRange) {
          const barWidth = this.rightBtnValue - this.leftBtnValue;

          if (clickedValue < this.leftBtnValue + (barWidth / 2)) {
            btnType = 'left';
          } else {
            btnType = 'right';
          }
        }

        this.moveButtonPosition(btnType, clickedValue);
      },
      onMouseDown(e, btnType) {
        if (this.disabled) {
          return;
        }

        e.preventDefault();

        this.onDragStart(btnType);
      },
      onDragStart(btnType) {
        if (btnType === 'left') {
          this.leftBtnDragging = true;
        } else {
          this.rightBtnDragging = true;
        }

        document.body.style.cursor = 'pointer';

        this.addEvent('mousemove', this.onDrag);
        this.addEvent('touchmove', this.onDrag);
        this.addEvent('mouseup', this.onDragEnd);
        this.addEvent('touchend', this.onDragEnd);
      },
      onDrag(e) {
        const clickedValue = this.getClickedValue(e);
        const btnType = this.leftBtnDragging ? 'left' : 'right';

        this.moveButtonPosition(btnType, clickedValue);
      },
      onDragEnd() {
        this.leftBtnDragging = false;
        this.rightBtnDragging = false;

        document.body.style.cursor = '';

        this.removeEvent('mousemove', this.onDrag);
        this.removeEvent('touchmove', this.onDrag);
        this.removeEvent('mouseup', this.onDragEnd);
        this.removeEvent('touchend', this.onDragEnd);
      },
      moveButtonPosition(btnType, value) {
        const valueRange = this.maxValue - this.minValue;

        if (!valueRange) {
          return;
        }

        const resultVal = this.getValueCloseToDot(value);

        if (this.isRange) {
          if (btnType === 'left') {
            this.leftBtnValue = resultVal < this.rightBtnValue ? resultVal : this.rightBtnValue;
          } else {
            this.rightBtnValue = resultVal > this.leftBtnValue ? resultVal : this.leftBtnValue;
          }
        } else {
          this.rightBtnValue = resultVal > this.leftBtnValue ? resultVal : this.leftBtnValue;
        }

        this.$emit('move-button', btnType, btnType === 'left' ? this.leftBtnValue : this.rightBtnValue);
      },
      addEvent(eventName, fn) {
        if (!eventName || !fn) {
          return;
        }

        if (document.removeEventListener) {
          window.addEventListener(eventName, fn, false);
        } else {
          window.attachEvent(eventName, fn, false);
        }
      },
      removeEvent(eventName, fn) {
        if (!eventName || !fn) {
          return;
        }

        if (document.removeEventListener) {
          window.removeEventListener(eventName, fn, false);
        } else {
          window.detachEvent(eventName, fn, false);
        }
      },
      getSliderInfo() {
        const sliderEl = this.$refs.slider;
        const offsetInfo = sliderEl.getBoundingClientRect();
        const sliderInfo = {
          el: sliderEl,
          valueRange: this.maxValue - this.minValue,
          offset: {
            left: offsetInfo.left,
            right: offsetInfo.right,
            width: offsetInfo.right - offsetInfo.left,
            onePieceWidth: 0,
          },
        };

        sliderInfo.offset.onePieceWidth = sliderInfo.offset.width / sliderInfo.valueRange;

        return sliderInfo;
      },
      getClickedValue(e) {
        const currentOffsetX = this.getClientX(e);
        const sliderInfo = this.getSliderInfo();
        const valueRange = sliderInfo.valueRange;
        const offsetLeft = sliderInfo.offset.left;
        const offsetWidth = sliderInfo.offset.width;
        const clickedValueWidth = ((currentOffsetX - offsetLeft) * valueRange) / offsetWidth;
        let clickedValue = this.minValue + clickedValueWidth;

        if (clickedValue < this.minValue) {
          clickedValue = this.minValue;
        }

        if (clickedValue > this.maxValue) {
          clickedValue = this.maxValue;
        }

        return clickedValue;
      },
      getClientX(e) {
        return e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
      },
      getValueCloseToDot(value) {
        const quotient = Math.floor(value / this.step);
        const remainder = value % this.step;
        let resultVal = value;

        if (remainder > (this.step / 2)) {
          resultVal = this.step * (quotient + 1);
        } else {
          resultVal = this.step * quotient;
        }

        resultVal = resultVal < this.minValue ? (resultVal + this.step) : resultVal;
        resultVal = resultVal > this.maxValue ? (resultVal - this.step) : resultVal;

        return resultVal;
      },
    },
  };
</script>


<style lang="scss">
  @import '~evui/styles/default';
/************************************************************************************
 Slider Component
************************************************************************************/

/** evui-slider **/

  .evui-slider {
    position: relative;
    width: 100%;
    height: 4px;
    margin: 4px 0;
    vertical-align: middle;
    background-color: #e9eaec;
    border-radius: 3px;
  }
  .evui-slider-dragging {
    border-color: #2d8cf0;
    cursor: -webkit-grabbing;
    cursor: grabbing;
  }
  .evui-slider:hover:not(.evui-slider-dragging) {
    cursor: -webkit-grab;
    cursor: grab;
  }
  .evui-slider-bar {
    position: absolute;
    height: 4px;
    background: #57a3f3;
    border-radius: 3px;
  }
  .evui-slider-btn {
    position: absolute;
    top: -4px;
    width: 12px;
    height: 12px;
    border: 2px solid #57a3f3;
    border-radius: 50%;
    text-align: center;
    background-color: #fff;
    outline: 0;
    transform: translateX(-4px);
  }
  .evui-slider-btn-dragging:not(:hover) {
    border-color: #2d8cf0;
    transform: translateX(-4px) scale(1.5);
    transition: transform .2s linear;
  }
  .evui-slider-btn:focus,
  .evui-slider-btn:hover {
    border-color: #2d8cf0;
    transform: translateX(-4px) scale(1.5);
    transition: transform .2s linear;
  }
  .evui-slider-dot {
    position: absolute;
    margin-left: -1px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #ccc;
  }
  .evui-slider-disabled {
    cursor: not-allowed
  }
  .evui-slider-disabled .evui-slider {
    background-color: #ccc;
    cursor: not-allowed
  }
  .evui-slider-disabled .evui-slider-bar {
    background-color: #ccc
  }
  .evui-slider-disabled .evui-slider-btn {
    border-color: #ccc
  }
  .evui-slider-disabled .evui-slider-btn:hover {
    border-color: #ccc;
    cursor: not-allowed;
  }
  .evui-slider-input .evui-slider {
    width: auto;
    margin-right: 100px;
  }
  .evui-slider-input .evui-input-number {
    margin-top: -14px;
    float: right;
  }
</style>
