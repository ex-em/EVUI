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
      getBounds() {
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

        min = Math.floor(leftWh * 0.1);
        min = min < 60 ? 60 : min;
        min += leftOffset;

        max = Math.floor(rightWh * 0.1);
        max = max < 60 ? 60 : max;
        max = (rightOffset + rightWh) - max;

        return {
          min,
          max,
        };
      },
      resizeForNeighbor(changeValue) {
        const leftItemInfo = this.leftItemInfo;
        const rightItemInfo = this.rightItemInfo;
        // const leftId = leftItemInfo.el.dataset.id;
        // const rightId = rightItemInfo.el.dataset.id;
        let leftWh;
        let rightWh;
        let actualChangeValue;

        if (this.type === 'hbox') {
          leftWh = leftItemInfo.width - changeValue;
          rightWh = rightItemInfo.width + changeValue;

          leftItemInfo.el.style.cssText += `width: ${leftWh}px; height: ${leftItemInfo.height}px`;
          rightItemInfo.el.style.cssText += `width: ${rightWh}px; height: ${rightItemInfo.height}px`;

          actualChangeValue = leftItemInfo.width - leftItemInfo.el.getBoundingClientRect().width;
          leftItemInfo.width = leftItemInfo.el.getBoundingClientRect().width;
          rightItemInfo.width = rightItemInfo.el.getBoundingClientRect().width;
          rightItemInfo.left -= actualChangeValue;
        } else {
          leftWh = leftItemInfo.height - changeValue;
          rightWh = rightItemInfo.height + changeValue;

          leftItemInfo.el.style.cssText += `width: ${leftItemInfo.width}px; height: ${leftWh}px`;
          rightItemInfo.el.style.cssText += `width: ${rightItemInfo.width}px; height: ${rightWh}px`;

          actualChangeValue = leftItemInfo.height - leftItemInfo.el.getBoundingClientRect().height;
          leftItemInfo.height = leftItemInfo.el.getBoundingClientRect().height;
          rightItemInfo.height = rightItemInfo.el.getBoundingClientRect().height;
          rightItemInfo.top -= actualChangeValue;
        }

        this.$emit('resize', { value: actualChangeValue, left: leftItemInfo, right: rightItemInfo });
        // if (leftId) {
        //   this.$resizeBus.$emit('resize', leftId, this.type, leftItemInfo);
        // }
        //
        // if (rightId) {
        //   this.$resizeBus.$emit('resize', rightId, this.type, rightItemInfo);
        // }
      },
      onMouseDown({ pageX: prevLeft, pageY: prevTop }) {
        const rootEl = this.$el.parentElement;
        const guideEl = this.$refs.guideline;

        this.prevOffset = { prevLeft, prevTop };
        this.updateItemInfo();

        rootEl.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        this.isDragging = true;

        guideEl.style.cssText = `top: ${this.top}px; left: ${this.left}px; background: ${this.color}; width: ${this.getStyle.width}; height: ${this.getStyle.height};`;
      },
      onMouseMove({ pageX: xPos, pageY: yPos }) {
        const guideEl = this.$refs.guideline;
        const { min, max } = this.getBounds();
        const width = this.width;
        const height = this.height;
        let left = this.left;
        let top = this.top;

        if (this.type === 'hbox') {
          left = xPos - width - this.leftPad;
          if (min > left) {
            left = min;
          } else if (max < left) {
            left = max;
          }
        } else {
          top = yPos - height - this.topPad;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }
        }

        this.isDragging = true;

        guideEl.style.cssText = `top: ${top}px; left: ${left}px; background: ${this.color}; width: ${this.getStyle.width}; height: ${this.getStyle.height};`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const rootEl = this.$el.parentElement;
        const { min, max } = this.getBounds();
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

          changeValue = prevLeft - xPos;
          cssText = `left: ${left}px;`;
        } else {
          top = yPos - this.height - this.topPad;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }

          changeValue = prevTop - yPos;
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
