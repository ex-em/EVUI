<template>
  <div
    :style="tooltipStyle"
    :class="prefixCls"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut"
  >
    <slot/>
    <transition name="fade">
      <div :class="popperClasses">
        <div
          :style="contentStyle"
          :class="`${prefixCls}-content`"
        >
          {{ content }}
        </div>
        <div :class="`${prefixCls}-arrow`"/>
      </div>
    </transition>
  </div>
</template>

<script>
  const prefixCls = 'evui-slider-tooltip';

  export default {
    props: {
      posX: {
        type: Number,
        default: 0,
      },
      content: {
        type: [String, Number],
        default: '',
      },
      isDragging: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prefixCls,
        visible: false,
        widthOfOneLetter: 7.4,
      };
    },
    computed: {
      tooltipStyle() {
        return {
          left: `${this.posX}%`,
        };
      },
      contentStyle() {
        const contentHalfWidth = (this.content.toString().length * (this.widthOfOneLetter / 2)) - 8;
        return `left: -${contentHalfWidth}px`;
      },
      popperClasses() {
        return [
          `${prefixCls}-popper`,
          {
            on: (this.visible || this.isDragging),
          },
        ];
      },
    },
    methods: {
      onMouseOver() {
        this.visible = true;
      },
      onMouseOut() {
        this.visible = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@/styles/default';
  .evui-slider-tooltip {
    position: absolute;
    user-select: none;
  }
  .evui-slider-tooltip-popper {
    position: absolute;
    visibility: hidden;
    top: -48px;
    left: -17px;
    font-size: 12px;
    line-height: 1.5;
    z-index: 100;
  }
  .evui-slider-tooltip-popper.on {
    visibility: visible;
  }
  .evui-slider-tooltip-content {
    position: relative;
    max-width: 250px;
    min-height: 34px;
    padding: 8px 12px;
    text-align: left;
    text-decoration: none;
    border-radius: 4px;
    color: #fff;
    background-color: rgba(70, 76, 91, .9);
    box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
    white-space: nowrap;
  }
  .evui-slider-tooltip-arrow {
    position: absolute;
    left: 14px;
    border-width: 5px 5px 0;
    border-style: solid;
    border-top-color: rgba(70, 76, 91, .9);
    border-left-color: transparent;
    border-right-color: transparent;
  }
</style>
