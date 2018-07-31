<template>
  <!-- eslint-disable max-len -->
  <div
    :style="`left: ${getLeft + getLeftPadding}px; top: ${getTop + getTopPadding}px; width: ${getWidth}px; height: ${getHeight}px;`"
    :class="`${type} splitter`"
    @mousedown="onMouseDown"
  />
  <!-- eslint-enable -->
</template>
<script>
  /* eslint-disable no-console */
  import { mapActions, mapGetters } from 'vuex';

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
        type: this.options.type,
        isMouseDown: false,
      };
    },
    computed: {
      ...mapGetters({
        getNode: 'nodes/getItem',
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
      getRelationShip() {
        return this.options.rs;
      },
      getBounds() {
        const rs = this.getRelationShip;
        const keys = Object.keys(rs || {});
        const type = this.type;
        let rsData;
        let node;
        let minLeft = 0;
        let minRight = 0;
        let tempLeft;
        let tempRight;

        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          rsData = rs[keys[ix]];
          for (let jx = 0, jxLen = rsData.length; jx < jxLen; jx++) {
            if (rsData[jx].includes('node')) {
              node = this.getNode(rsData[jx]);
              if (type === 'hbox') {
                if (keys[ix] === 'left') {
                  tempLeft = node.left + node.minWidth;
                  if (!minLeft) {
                    minLeft = tempLeft;
                  } else if (minLeft < tempLeft) {
                    minLeft = tempLeft;
                  }
                } else {
                  tempRight = (node.left + node.width) - node.minWidth;
                  if (!minRight) {
                    minRight = tempRight;
                  } else if (minRight > tempRight) {
                    minRight = tempRight;
                  }
                }
              } else if (type === 'vbox') {
                if (keys[ix] === 'left') {
                  tempLeft = node.top + node.minHeight;
                  if (!minLeft) {
                    minLeft = tempLeft;
                  } else if (minLeft < tempLeft) {
                    minLeft = tempLeft;
                  }
                } else {
                  tempRight = (node.top + node.height) - node.minHeight;
                  if (!minRight) {
                    minRight = tempRight;
                  } else if (minRight > tempRight) {
                    minRight = tempRight;
                  }
                }
              }
            }
          }
        }

        return {
          min: minLeft,
          max: minRight,
        };
      },
    },
    mounted() {
    },
    methods: {
      ...mapActions({
        resizeSplit: 'splitters/resize',
        resizeNode: 'nodes/resize',
      }),
      onMouseDown() {
        const rootEl = this.$el.parentElement;
        const guideLineEl = this.$parent.$refs.guideline;
        const top = this.getTop + this.getTopPadding;
        const left = this.getLeft + this.getLeftPadding;

        this.isMouseDown = true;

        rootEl.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        guideLineEl.style.cssText = `display: block; top: ${top}px; left: ${left}px;
        width: ${this.getWidth}px; height: ${this.getHeight}px;`;
      },
      onMouseMove({ pageX: xPos, pageY: yPos }) {
        if (!this.isMouseDown) {
          return;
        }

        const guideLineEl = this.$parent.$refs.guideline;
        const bounds = this.getBounds;
        const min = bounds.min;
        const max = bounds.max;
        let top = this.getTop;
        let left = this.getLeft;

        if (this.type === 'hbox') {
          left = xPos - this.getWidth - this.getLeftPadding;
          if (min > left) {
            left = min;
          } else if (max < left) {
            left = max;
          }
        } else {
          top = yPos - this.getHeight - this.getTopPadding;
          if (min > top) {
            top = min;
          } else if (max < top) {
            top = max;
          }
        }

        guideLineEl.style.cssText = `display: block; top: ${top + this.getTopPadding}px;
        left: ${left + this.getLeftPadding}px; width: ${this.getWidth}px; height: ${this.getHeight}px;`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const rootEl = this.$el.parentElement;
        const guideLineEl = this.$parent.$refs.guideline;
        const rs = this.getRelationShip;
        const keys = Object.keys(rs);
        const bounds = this.getBounds;
        const min = bounds.min;
        const max = bounds.max;
        const top = this.getTop;
        const left = this.getLeft;
        let moveTop;
        let moveLeft;
        let changeValue;
        let rsData;

        this.isMouseDown = false;
        if (this.type === 'hbox') {
          moveLeft = xPos - this.getWidth - this.getLeftPadding;
          if (min > moveLeft) {
            moveLeft = min;
          } else if (max < moveLeft) {
            moveLeft = max;
          }

          changeValue = left - moveLeft;
          moveTop = top;
        } else {
          moveTop = yPos - this.getHeight - this.getTopPadding;
          if (min > moveTop) {
            moveTop = min;
          } else if (max < moveTop) {
            moveTop = max;
          }

          changeValue = top - moveTop;
          moveLeft = left;
        }

        guideLineEl.style.cssText = 'display: none;';

        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          rsData = rs[keys[ix]];
          for (let jx = 0, jxLen = rsData.length; jx < jxLen; jx++) {
            if (rsData[jx].includes('node')) {
              this.resizeNode({
                id: rsData[jx],
                type: this.type,
                direction: keys[ix],
                changeValue,
              });
            }
          }
        }

        this.resizeSplit({
          id: this.id,
          item: { left: moveLeft, top: moveTop },
          type: this.type,
          changeValue,
        });

        rootEl.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
      },
    },
  };
</script>
<style scoped src="./docking.css">
</style>
