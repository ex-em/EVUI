<template>
  <!-- eslint-disable max-len -->
  <div
    :style="`left: ${getLeft}%; top: ${getTop}%; width: ${getWidth}%; height: ${getHeight}%;`"
    :class="`${direction} ev-docking-splitter`"
    @mousedown="onMouseDown"
  />
  <!-- eslint-enable -->
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import { convertToValue, convertToPercent } from '@/common/utils';

  export default {
    props: {
      options: {
        type: Object,
        default: null,
      },
      padding: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        id: this.options.id,
        direction: this.options.direction,
        isMouseDown: false,
      };
    },
    computed: {
      ...mapGetters({
        getBounds: 'getBoundsForSplitter',
      }),
      getTop() {
        return this.options.top;
      },
      getLeft() {
        return this.options.left;
      },
      getWidth() {
        return this.options.width;
      },
      getHeight() {
        return this.options.height;
      },
      getTopPadding() {
        return this.padding.top;
      },
      getLeftPadding() {
        return this.padding.left;
      },
    },
    mounted() {
    },
    methods: {
      ...mapActions({
        resize: 'resize',
      }),
      onMouseDown() {
        const rootEl = this.$el.parentElement;
        const guideLineEl = this.$parent.$refs.guideline;

        this.isMouseDown = true;

        rootEl.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        guideLineEl.style.cssText = `display: block; top: ${this.getTop}%; left: ${this.getLeft}%;
        width: ${this.getWidth}%; height: ${this.getHeight}%;`;
      },
      onMouseMove({ pageX: xPos, pageY: yPos }) {
        if (!this.isMouseDown) {
          return;
        }

        const guideLineEl = this.$parent.$refs.guideline;
        const parentWidth = this.$parent.width;
        const parentHeight = this.$parent.height;
        const bounds = this.getBounds(this.id, parentWidth, parentHeight);
        const min = bounds.min;
        const max = bounds.max;
        const width = convertToValue(this.getWidth, parentWidth);
        const height = convertToValue(this.getHeight, parentHeight);
        let top = convertToValue(this.getTop, parentHeight);
        let left = convertToValue(this.getLeft, parentWidth);

        if (this.direction === 'hbox') {
          left = xPos - width - this.getLeftPadding;
          if (min > left) {
            left = min;
          } else if (max < left) {
            left = max;
          }
        } else {
          top = yPos - height - this.getTopPadding;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }
        }

        guideLineEl.style.cssText = `display: block; top: ${top}px;
        left: ${left}px; width: ${width}px; height: ${height}px;`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const rootEl = this.$el.parentElement;
        const guideLineEl = this.$parent.$refs.guideline;
        const parentWidth = this.$parent.width;
        const parentHeight = this.$parent.height;
        const bounds = this.getBounds(this.id, parentWidth, parentHeight);
        const min = bounds.min;
        const max = bounds.max;
        const width = convertToValue(this.getWidth, parentWidth);
        const height = convertToValue(this.getHeight, parentHeight);
        const prevTop = convertToValue(this.getTop, parentHeight);
        const prevLeft = convertToValue(this.getLeft, parentWidth);
        let isMoveToLeft = false;
        let top;
        let left;
        let changeValue;

        this.isMouseDown = false;
        if (this.direction === 'hbox') {
          left = xPos - width - this.getLeftPadding;
          if (min > left) {
            left = min;
          } else if (max < left) {
            left = max;
          }

          changeValue = prevLeft - left;
          top = prevTop;

          isMoveToLeft = changeValue > 0;
          changeValue = convertToPercent(Math.abs(changeValue), parentWidth);
        } else {
          top = yPos - height - this.getTopPadding;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }

          changeValue = prevTop - top;
          left = prevLeft;

          isMoveToLeft = changeValue > 0;
          changeValue = convertToPercent(Math.abs(changeValue), parentHeight);
        }

        top = convertToPercent(top, parentHeight);
        left = convertToPercent(left, parentWidth);

        guideLineEl.style.cssText = 'display: none;';

        this.resize({
          id: this.id,
          item: { id: this.id, left, top },
          direction: this.direction,
          isMoveToLeft,
          changeValue,
        });

        rootEl.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
      },
    },
  };
</script>
<style>
</style>
