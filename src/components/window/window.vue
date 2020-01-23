<template>
  <section
    v-if="isAttachToDom"
    v-show="isShowFlag"
    :style="windowStyle"
    :class="windowCls"
    @mousedown="mousedown"
    @mousemove="mousemove"
    @mouseout="mouseout"
  >
    <div
      ref="headerArea"
      :style="headerStyle"
      :class="headerCls"
      @dblclick="headerDblClick"
    >
      <p :class="`${prefixCls}-title-area`">{{ title }}</p>
      <div
        :class="`${prefixCls}-btn-area`"
      >
        <span
          v-if="maximizable"
          :class="`${prefixCls}-btn`"
          class="expand"
          @click="clickExpandBtn"
        >
          <ev-icon
            v-if="!isFullExpandWindow"
            :cls="'ei-expand2'" />
          <ev-icon
            v-else
            :cls="'ei-compress2'" />
        </span>
        <span
          :class="`${prefixCls}-btn`"
          class="close"
          @click="clickCloseBtn"
        >
          <ev-icon
            :cls="'ei-close2'"
          />
        </span>
      </div>
    </div>
    <div :class="`${prefixCls}-body-area`">
      <slot/>
    </div>
  </section>
</template>

<script>
  export default {
    props: {
      width: {
        type: [String, Number],
        default: 250,
      },
      height: {
        type: [String, Number],
        default: 250,
      },
      minWidth: {
        type: [String, Number],
        default: 150,
      },
      minHeight: {
        type: [String, Number],
        default: 150,
      },
      title: {
        type: String,
        default: '',
      },
      maximizable: {
        type: Boolean,
        default: true,
      },
      resizable: {
        type: Boolean,
        default: true,
      },
      modal: {
        type: Boolean,
        default: false,
      },
      isShow: {
        type: Boolean,
        default: true,
      },
      closeType: {
        type: String,
        default: 'hide',
        validator(value) {
          const list = ['destroy', 'hide'];
          return list.indexOf(value) > -1;
        },
      },
    },
    data() {
      return {
        prefixCls: 'ev-window',
        modelEl: null,
        isMovedEl: false,
        isAttachToDom: true,
        isShowFlag: true,
        isFullExpandWindow: false,
        vIf: true,
        vShow: true,
        windowStyle: null,
        windowCls: '',
        headerCls: '',
        headerStyle: '',
        headerHeight: 32,
        grabbingBorderSize: 5,
        grabbingBorderPosInfo: {
          top: false,
          right: false,
          left: false,
          bottom: false,
        },
        clickedInfo: {
          state: '',
          pressedSpot: '',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          clientX: 0,
          clientY: 0,
        },
      };
    },
    watch: {
      isShow: {
        immediate: true,
        handler(value) {
          this.isAttachToDom = this.closeType === 'hide' || value;
          this.isShowFlag = value;

          if (!this.windowStyle && value) {
            this.$nextTick(() => {
              this.syncIsShow();
            });
          } else {
            this.syncIsShow();
          }
        },
      },
    },
    created() {
      this.headerStyle = `height: ${this.headerHeight}px`;
      this.headerCls = { [`${this.prefixCls}-header-area`]: true };
      this.windowCls = { [this.prefixCls]: true };
    },
    mounted() {
      const body = document.body;
      if (!this.isMovedEl) {
        this.isMovedEl = true;

        if (this.modal) {
          this.modelEl = document.createElement('div');
          this.modelEl.classList.add(`${this.prefixCls}-modal`);
          this.modelEl.appendChild(this.$el);
          body.appendChild(this.modelEl);
        } else {
          body.appendChild(this.$el);
        }
      }
    },
    methods: {
      mousedown(e) {
        const windowEl = this.$el;

        if (!windowEl) {
          return;
        }

        let pressedSpot = '';

        if (this.resizable) {
          const clientRect = windowEl.getBoundingClientRect();
          const x = e.clientX - clientRect.left;
          const y = e.clientY - clientRect.top;
          const isGrabTop = y < this.grabbingBorderSize;
          const isGrabLeft = x < this.grabbingBorderSize;
          const isGrabRight = x >= (clientRect.width - this.grabbingBorderSize);
          const isGrabBottom = y >= (clientRect.height - this.grabbingBorderSize);

          this.grabbingBorderPosInfo = {
            top: isGrabTop,
            left: isGrabLeft,
            right: isGrabRight,
            bottom: isGrabBottom,
          };

          if (isGrabTop || isGrabLeft || isGrabRight || isGrabBottom) {
            pressedSpot = 'border';
          }
        }

        if (pressedSpot !== 'border' && this.isInHeader(e.clientX, e.clientY)) {
          pressedSpot = 'header';
        }

        document.body.style.cursor = windowEl.style.cursor;

        this.clickedInfo = {
          pressedSpot,
          state: 'mousedown',
          top: windowEl.offsetTop,
          left: windowEl.offsetLeft,
          width: windowEl.offsetWidth,
          height: windowEl.offsetHeight,
          clientX: e.clientX,
          clientY: e.clientY,
        };

        this.$emit('mousedown', e, this.clickedInfo);

        window.addEventListener('mousemove', this.mousedownMousemove);
        window.addEventListener('mouseup', this.mousedownMouseup);
      },
      mousemove(e) {
        this.changeMouseCursor(e);
      },
      mouseout(e) {
        this.$emit('mouseout', e);
      },
      mousedownMousemove(e) {
        this.clickedInfo.state = 'mousedown-mousemove';

        switch (this.clickedInfo.pressedSpot) {
          case 'header': {
            const diffTop = e.clientY - this.clickedInfo.clientY;
            const diffLeft = e.clientX - this.clickedInfo.clientX;

            this.setCssText({
              top: this.clickedInfo.top + diffTop,
              left: this.clickedInfo.left + diffLeft,
            });

            this.$emit('mousedown-mousemove', e);
            break;
          }
          case 'border':
            this.resize(e);
            this.$emit('mousedown-mousemove', e);
            break;
          default:
            break;
        }
      },
      mousedownMouseup(e) {
        this.clickedInfo.state = '';
        this.clickedInfo.pressedSpot = '';

        document.body.style.cursor = '';

        this.changeMouseCursor(e);

        window.removeEventListener('mousemove', this.mousedownMousemove);
        window.removeEventListener('mouseup', this.mousedownMouseup);

        this.$emit('mousedown-mouseup', e);
      },
      headerDblClick(e) {
        this.$emit('header-dbl-click', e);
      },
      clickExpandBtn() {
        if (this.isFullExpandWindow) {
          this.setCssText({
            top: this.posInfoBeforeExpand.top,
            left: this.posInfoBeforeExpand.left,
            width: this.posInfoBeforeExpand.width,
            height: this.posInfoBeforeExpand.height,
          });
        } else {
          this.posInfoBeforeExpand = {
            top: this.clickedInfo.top,
            left: this.clickedInfo.left,
            width: this.clickedInfo.width,
            height: this.clickedInfo.height,
          };

          this.setCssText({
            top: 0,
            left: 0,
            width: document.body.clientWidth,
            height: document.body.clientHeight,
          });
        }

        this.isFullExpandWindow = !this.isFullExpandWindow;
      },
      clickCloseBtn() {
        this.$emit('before-close', this);
        this.close();
      },
      close() {
        if (this.closeType === 'destroy') {
          this.isAttachToDom = false;
        } else {
          this.isShowFlag = false;
        }
        this.isFullExpandWindow = false;
        this.$emit('update:is-show', false);
      },
      show() {
        if (this.closeType === 'destroy') {
          this.isAttachToDom = true;
        } else {
          this.isShowFlag = true;
        }

        this.$emit('update:is-show', true);
      },
      resize(e) {
        const isTop = this.grabbingBorderPosInfo.top;
        const isLeft = this.grabbingBorderPosInfo.left;
        const isRight = this.grabbingBorderPosInfo.right;
        const isBottom = this.grabbingBorderPosInfo.bottom;
        const diffX = e.clientX - this.clickedInfo.clientX;
        const diffY = e.clientY - this.clickedInfo.clientY;
        const minWidth = this.removePixel(this.minWidth);
        const minHeight = this.removePixel(this.minHeight);
        let top = this.clickedInfo.top;
        let left = this.clickedInfo.left;
        let width = this.$el.offsetWidth;
        let height = this.$el.offsetHeight;
        const maxTop = (top + this.clickedInfo.height) - minHeight;
        const maxLeft = (left + this.clickedInfo.width) - minWidth;

        if (isTop) {
          top = this.clickedInfo.top + diffY;
          height = this.clickedInfo.height - diffY;

          if (top > maxTop) {
            top = maxTop;
          }
        }

        if (isLeft) {
          left = this.clickedInfo.left + diffX;
          width = this.clickedInfo.width - diffX;

          if (left > maxLeft) {
            left = maxLeft;
          }
        }

        if (isRight) {
          width = this.clickedInfo.width + diffX;
        }

        if (isBottom) {
          height = this.clickedInfo.height + diffY;
        }

        width = Math.max(width, minWidth);
        height = Math.max(height, minHeight);

        const positionInfo = { top, left, width, height };

        this.setCssText(positionInfo);
        this.$emit('resize', e, positionInfo);
      },
      changeMouseCursor(e) {
        if (!this.$el || this.clickedInfo.pressedSpot) {
          return;
        }

        if (this.resizable) {
          const rect = this.$el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const top = y < this.grabbingBorderSize;
          const left = x < this.grabbingBorderSize;
          const right = x >= (rect.width - this.grabbingBorderSize);
          const bottom = y >= (rect.height - this.grabbingBorderSize);

          if ((top && left) || (bottom && right)) {
            this.$el.style.cursor = 'nwse-resize';
          } else if ((top && right) || (bottom && left)) {
            this.$el.style.cursor = 'nesw-resize';
          } else if (right || left) {
            this.$el.style.cursor = 'ew-resize';
          } else if (bottom || top) {
            this.$el.style.cursor = 'ns-resize';
          } else if (this.isInHeader(e.clientX, e.clientY)) {
            this.$el.style.cursor = 'move';
          } else {
            this.$el.style.cursor = 'default';
          }
        } else if (this.isInHeader(e.clientX, e.clientY)) {
          this.$el.style.cursor = 'move';
        } else {
          this.$el.style.cursor = 'default';
        }
      },
      setCssText(paramObj) {
        if (paramObj === null || typeof paramObj !== 'object') {
          return;
        }

        let top;
        let left;
        let width;
        let height;
        let minWidth;
        let minHeight;
        let headerHeight;
        const windowEl = this.$el;
        const hasOwnProperty = Object.prototype.hasOwnProperty;

        if (hasOwnProperty.call(paramObj, 'top')) {
          top = paramObj.top;
        } else {
          top = this.clickedInfo.top;
        }

        if (hasOwnProperty.call(paramObj, 'left')) {
          left = paramObj.left;
        } else {
          left = this.clickedInfo.left;
        }

        if (hasOwnProperty.call(paramObj, 'width')) {
          width = paramObj.width;
        } else {
          width = windowEl.offsetWidth;
        }

        if (hasOwnProperty.call(paramObj, 'height')) {
          height = paramObj.height;
        } else {
          height = windowEl.offsetHeight;
        }

        if (hasOwnProperty.call(paramObj, 'minWidth')) {
          minWidth = paramObj.minWidth;
        } else {
          minWidth = this.minWidth;
        }

        if (hasOwnProperty.call(paramObj, 'minHeight')) {
          minHeight = paramObj.minHeight;
        } else {
          minHeight = this.minHeight;
        }

        if (hasOwnProperty.call(paramObj, 'headerHeight')) {
          headerHeight = paramObj.headerHeight;
        } else {
          headerHeight = this.headerHeight;
        }

        width = Math.max(width, minWidth);
        height = Math.max(height, minHeight);

        windowEl.style.cssText = `
          top: ${this.numberToPixel(top)};
          left: ${this.numberToPixel(left)};
          width: ${this.numberToPixel(width)};
          height: ${this.numberToPixel(height)};
          min-width: ${this.numberToPixel(minWidth)};
          min-height: ${this.numberToPixel(minHeight)};
          padding-top: ${this.numberToPixel(headerHeight)}`;
      },
      getWindowStyle() {
        const bodyWidth = window.innerWidth;
        const bodyHeight = window.innerHeight;
        const top = (bodyHeight / 2) - (this.height / 2);
        const left = (bodyWidth / 2) - (this.width / 2);

        return {
          top: this.numberToPixel(top),
          left: this.numberToPixel(left),
          width: this.numberToPixel(this.width),
          height: this.numberToPixel(this.height),
          minWidth: this.numberToPixel(this.minWidth),
          minHeight: this.numberToPixel(this.minHeight),
          paddingTop: this.numberToPixel(this.headerHeight),
        };
      },
      numberToPixel(input) {
        let output;
        let result;

        if (typeof input === 'string' || typeof input === 'number') {
          const match = (/^(normal|(-*\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
          output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
        } else {
          output = undefined;
        }

        if (output === null || output === undefined) {
          result = undefined;
        } else if (output.unit === '%') {
          result = `${output.value}%`;
        } else {
          result = `${output.value}px`;
        }
        return result;
      },
      removePixel(input) {
        let result;

        if (typeof input === 'string' && input) {
          const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
          if (match[2]) {
            result = +match[2];
          }
        } else {
          result = input;
        }

        return result || 0;
      },
      isInHeader(x, y) {
        if (x == null || y == null) {
          return false;
        }

        const rect = this.$el.getBoundingClientRect();
        const posX = +x - rect.left;
        const posY = +y - rect.top;
        const headerAreaStyleInfo = this.$refs.headerArea.style;
        const headerPaddingInfo = {
          top: this.removePixel(headerAreaStyleInfo.paddingTop),
          left: this.removePixel(headerAreaStyleInfo.paddingLeft),
          right: this.removePixel(headerAreaStyleInfo.paddingRight),
        };
        const startPosX = headerPaddingInfo.left;
        const endPosX = rect.width - headerPaddingInfo.right;
        const startPosY = headerPaddingInfo.top;
        const endPosY = startPosY + this.headerHeight;

        return posX > startPosX && posX < endPosX && posY > startPosY && posY < endPosY;
      },
      syncIsShow() {
        if (this.modal && this.modelEl) {
          const displayBlockCls = `${this.prefixCls}-display-block`;

          if (this.isShowFlag) {
            this.modelEl.classList.add(displayBlockCls);
          } else {
            this.modelEl.classList.remove(displayBlockCls);
          }
        }

        this.windowStyle = this.getWindowStyle();
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-window {
    position: absolute;
    border-radius: $border-radius-base;
    overflow: hidden;
    z-index: 700;
    user-select: none;

    @include evThemify() {
      background-color: evThemed('window-bg');
      border: $border-solid evThemed('window-border');
      color: evThemed('window-btn');
    }

    &-header-area {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      width: 100%;
      padding: 7px 10px;
      justify-content: space-between;
    }

    &-title-area {
      left: 15px;
      line-height: 26px;
      font-size: $font-size-large;

      @include evThemify() {
        color: evThemed('window-btn');
      }
    }

    &-btn-area {
      display: inline-flex;

      .ev-window-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        margin-left: 4px;
        cursor: pointer;
        font-size: $font-size-medium;
        border-radius: $border-radius-base;

        @include evThemify() {
          color: evThemed('window-btn');
          background-color: evThemed('window-btn-bg');
        }
      }
    }

    &-body-area {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 13px 10px 10px;
      overflow: auto;

      @include evThemify() {
        color: evThemed('window-btn');
      }
    }
  }
  .ev-window-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 100px;
    overflow: hidden;
    background-color: rgba(0,0,0,0.6);
    text-align: center;
    z-index: 710;
    user-select: none;
  }
  .ev-window-display-block {
    display: block !important;
  }
</style>
