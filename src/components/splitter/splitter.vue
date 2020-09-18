<template>
  <div>
    <div
      :class="`${type} ev-splitter ${isDragging ? 'hide' : ''}`"
      :style="getStyle"
      @mousedown="onMouseDown"
    >
      <slot />
    </div>
    <div
      v-show="isDragging"
      ref="guideline"
      :class="`${type} ev-splitter-guideline`"
    />
  </div>
</template>
<script>
  export default {
    name: 'Splitter',
    props: {
      type: {
        type: String,
        default: 'hbox',
      },
      color: {
        type: String,
        default: '#dadada',
      },
      size: {
        type: Number,
        default: 4,
      },
      leftBound: {
        type: Object,
        default() {
          return {
            min: undefined,
            max: undefined,
          };
        },
      },
      rightBound: {
        type: Object,
        default() {
          return {
            min: undefined,
            max: undefined,
          };
        },
      },
    },
    data() {
      return {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        topPad: 0,
        leftPad: 0,
        prevOffset: {},
        leftItemInfo: {},
        rightItemInfo: {},
        isDragging: false,
        bound: null,
      };
    },
    computed: {
      getStyle() {
        return {
          background: this.color,
          width: this.type === 'hbox' ? `${this.size}px` : '100%',
          height: this.type === 'hbox' ? '100%' : `${this.size}px`,
        };
      },
    },
    created() {
    },
    mounted() {
      this.updateItemInfo();
      this.setBounds();
    },
    methods: {
      updateItemInfo() {
        const el = this.$el;
        const rect = this.$el.getBoundingClientRect();
        const leftEl = el.previousElementSibling;
        const rightEl = el.nextElementSibling;

        this.top = el.offsetTop;
        this.left = el.offsetLeft;
        this.width = rect.width;
        this.height = rect.height;
        this.topPad = rect.top - this.top;
        this.leftPad = rect.left - this.left;

        this.leftItemInfo.el = leftEl;
        this.rightItemInfo.el = rightEl;

        this.leftItemInfo.top = leftEl.offsetTop;
        this.leftItemInfo.left = leftEl.offsetLeft;
        this.leftItemInfo.width = leftEl.offsetWidth;
        this.leftItemInfo.height = leftEl.offsetHeight;

        this.rightItemInfo.top = rightEl.offsetTop;
        this.rightItemInfo.left = rightEl.offsetLeft;
        this.rightItemInfo.width = rightEl.offsetWidth;
        this.rightItemInfo.height = rightEl.offsetHeight;
      },
      onResize(id, type) {
        if (!type && this.uid !== id) {
          return;
        }

        let top;
        let left;

        this.updateItemInfo();

        if (this.type === 'hbox') {
          top = this.leftItemInfo.top;
          left = this.leftItemInfo.left + this.leftItemInfo.width;
        } else {
          top = this.leftItemInfo.top + this.leftItemInfo.height;
          left = this.leftItemInfo.left;
        }

        this.$el.style.cssText += `top: ${top}px; left: ${left}px;`;
      },
      setBounds() {
        const leftItemInfo = this.leftItemInfo;
        const rightItemInfo = this.rightItemInfo;
        let min = 0;
        let max = 0;
        let leftWh;
        let rightWh;
        let leftOffset;
        let rightOffset;

        if (this.type === 'hbox') {
          leftWh = leftItemInfo.width;
          rightWh = rightItemInfo.width;
          leftOffset = leftItemInfo.left;
          rightOffset = rightItemInfo.left;
        } else {
          leftWh = leftItemInfo.height;
          rightWh = rightItemInfo.height;
          leftOffset = leftItemInfo.top;
          rightOffset = rightItemInfo.top;
        }

        const { min: leftMin = 40, max: leftMax = leftWh + rightWh - 40 } = this.leftBound;
        const { min: rightMin = 40, max: rightMax = leftWh + rightWh - 40 } = this.rightBound;

        min = Math.min(leftWh - leftMin, rightMax - rightWh);
        min = leftOffset + (leftWh - min);

        max = Math.min(leftMax - leftWh, rightWh - rightMin);
        max += rightOffset;

        this.bound = { min, max };
      },
      resizeForNeighbor(changeValue) {
        const leftItemInfo = this.leftItemInfo;
        const rightItemInfo = this.rightItemInfo;
        let leftWh;
        let rightWh;
        let rightOffset;
        let actualChangeValue;

        if (this.type === 'hbox') {
          leftWh = leftItemInfo.width - changeValue;
          rightWh = rightItemInfo.width + changeValue;
          rightOffset = rightItemInfo.left - changeValue;

          leftItemInfo.el.style.cssText += `width: ${leftWh}px; height: ${leftItemInfo.height}px`;
          rightItemInfo.el.style.cssText += `width: ${rightWh}px; height: ${rightItemInfo.height}px`;

          leftItemInfo.width = leftWh;
          rightItemInfo.width = rightWh;
          rightItemInfo.left = rightOffset;
        } else {
          leftWh = leftItemInfo.height - changeValue;
          rightWh = rightItemInfo.height + changeValue;
          rightOffset = rightItemInfo.top - changeValue;

          leftItemInfo.el.style.cssText += `width: ${leftItemInfo.width}px; height: ${leftWh}px`;
          rightItemInfo.el.style.cssText += `width: ${rightItemInfo.width}px; height: ${rightWh}px`;

          leftItemInfo.height = leftWh;
          rightItemInfo.height = rightWh;
          rightItemInfo.top = rightOffset;
        }

        this.$emit('resize', { value: actualChangeValue, left: leftItemInfo, right: rightItemInfo });
      },
      onMouseDown({ pageX: prevLeft, pageY: prevTop }) {
        const rootEl = this.$el.parentElement;
        const guideEl = this.$refs.guideline;

        this.prevOffset = { prevLeft, prevTop };
        this.updateItemInfo();

        rootEl.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        this.isDragging = true;

        guideEl.style.cssText = `top: ${this.top}px; left: ${this.left}px; background: ${this.color}; width: ${this.width}px; height: ${this.height}px;`;
      },
      onMouseMove({ pageX: xPos, pageY: yPos }) {
        const guideEl = this.$refs.guideline;
        const { min, max } = this.bound;
        const width = this.width;
        const height = this.height;
        let left = this.left;
        let top = this.top;

        if (this.type === 'hbox') {
          left = xPos - width - this.leftPad;
          if (min > left || max < left) {
            return;
          }
        } else {
          top = yPos - height - this.topPad;
          if (min > top || max < top) {
            return;
          }
        }

        this.isDragging = true;

        guideEl.style.cssText = `top: ${top}px; left: ${left}px; background: ${this.color}; width: ${this.width}px; height: ${this.height}px;`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const rootEl = this.$el.parentElement;
        const { min, max } = this.bound;
        const { prevLeft, prevTop } = this.prevOffset;
        let left;
        let top;
        let changeValue;
        let cssText;

        if (this.type === 'hbox') {
          left = xPos - this.width - this.leftPad;
          if (min > left) {
            left = min;
          } else if (max < left) {
            left = max;
          }

          changeValue = prevLeft - (left + this.width + this.leftPad);
          cssText = `left: ${left}px;`;
        } else {
          top = yPos - this.height - this.topPad;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }

          changeValue = prevTop - (top - this.height - this.topPad);
          cssText = `top: ${top}px;`;
        }

        rootEl.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);

        this.isDragging = false;

        this.resizeForNeighbor(changeValue);

        this.$el.style.cssText += cssText;
      },
    },
  };
</script>
<style>
  .ev-splitter {
    top: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: block;
  }
  .ev-splitter-guideline {
    position: absolute;
    z-index: 100;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .ev-splitter.hide {
    background: transparent;
  }
  .ev-splitter.hbox,
  .ev-splitter-guideline.hbox {
    cursor: col-resize;
  }
  .ev-splitter.vbox,
  .ev-splitter-guideline.vbox {
    cursor: row-resize;
  }
</style>
