<template>
  <div
    v-if="isShow"
    :id="windowId"
    :style="windowStyle"
    :class="windowCls"
    @mousedown="onMouseDown"
    @mousemove="changeMouseCursor"
    @mouseout="onMouseOut"
  >
    <div
      ref="headerArea"
      :style="headerStyle"
      :class="headerCls"
    >
      <div :class="`${prefixEvui}-title-area`">{{ title }}</div>
      <div :class="`${prefixEvui}-expand-btn-line`"/>
      <div
        :class="`${prefixEvui}-expand-btn`"
        @click="clickExpandBtn"
      />
      <div :class="`${prefixEvui}-close-btn-line`"/>
      <div
        :class="`${prefixEvui}-close-btn`"
        @click="clickCloseBtn"
      />
    </div>
    <div :class="`${prefixEvui}-body-area`">
      <component :is="content"/>
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  const prefixEvui = 'ev-window';

  export default {
    name: 'Window',
    props: {
      name: {
        type: String,
        default: '',
      },
      top: {
        type: Number,
        default: null,
      },
      left: {
        type: Number,
        default: null,
      },
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
      clsType: {
        type: String,
        default: 'rtm',
        validator(value) {
          const list = ['', 'rtm', 'pa', 'config'];
          return list.indexOf(value) > -1;
        },
      },
      title: {
        type: String,
        default: '',
      },
      content: {
        type: Object,
        default: null,
      },
      resizable: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        prefixEvui,
        windowId: '',
        windowStyle: {},
        windowCls: '',
        headerCls: '',
        headerStyle: '',
        titleHeight: 32,
        isShow: false,
        isMoving: false,
        isGrabbingBorder: false,
        grabbingBorderPosInfo: {
          top: false,
          right: false,
          left: false,
          bottom: false,
        },
        clickedInfo: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          pageX: 0,
          pageY: 0,
        },
      };
    },
    computed: {
    },
    created() {
      this.windowId = `window_${this._uid}_${this.name}`;

      this.windowStyle = this.getWindowStyle();
      this.windowCls = this.getWindowCls();
      this.headerStyle = `height: ${this.titleHeight}px`;
      this.headerCls = this.getHeaderCls();
    },
    mounted() {
    },
    beforeDestroy() {
      this.isShow = false;
    },
    methods: {
      onMouseDown(e) {
        const windowEl = this.$el;

        if (!windowEl) {
          return;
        }

        this.clickedInfo = {
          top: windowEl.offsetTop,
          left: windowEl.offsetLeft,
          width: windowEl.offsetWidth,
          height: windowEl.offsetHeight,
          pageX: e.pageX,
          pageY: e.pageY,
        };

        if (this.resizable) {
          const clientRect = windowEl.getBoundingClientRect();
          const x = e.pageX - clientRect.left;
          const y = e.pageY - clientRect.top;
          const borderSize = 4;
          const isGrabTop = y < borderSize;
          const isGrabLeft = x < borderSize;
          const isGrabRight = x >= (clientRect.width - borderSize);
          const isGrabBottom = y >= (clientRect.height - borderSize);

          this.grabbingBorderPosInfo = {
            top: isGrabTop,
            left: isGrabLeft,
            right: isGrabRight,
            bottom: isGrabBottom,
          };

          this.isGrabbingBorder = isGrabTop || isGrabLeft || isGrabRight || isGrabBottom;
        }

        this.isMoving = !this.isGrabbingBorder && this.checkTitleAreaPanel(e);

        document.body.style.cursor = windowEl.style.cursor;

        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        e.preventDefault();
      },
      onMouseMove(e) {
        if (this.resizable && this.isGrabbingBorder) {
          this.resize(e);
          return;
        }

        if (this.isMoving) {
          const diffTop = e.pageY - this.clickedInfo.pageY;
          const diffLeft = e.pageX - this.clickedInfo.pageX;

          this.setCssText({
            top: this.clickedInfo.top + diffTop,
            left: this.clickedInfo.left + diffLeft,
          });
        }
      },
      onMouseUp() {
        this.isMoving = false;
        this.isGrabbingBorder = false;

        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
      },
      onMouseOut() {
        if (!this.isMoving) {
          document.body.style.cursor = '';
        }
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
        this.hide();
      },
      resize(e) {
        const isTop = this.grabbingBorderPosInfo.top;
        const isLeft = this.grabbingBorderPosInfo.left;
        const isRight = this.grabbingBorderPosInfo.right;
        const isBottom = this.grabbingBorderPosInfo.bottom;
        const diffX = e.pageX - this.clickedInfo.pageX;
        const diffY = e.pageY - this.clickedInfo.pageY;
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
        if (!this.$el || this.isMoving || this.isGrabbingBorder) {
          return;
        }

        if (this.resizable) {
          const borderSize = 4;
          const rect = this.$el.getBoundingClientRect();
          const x = e.pageX - rect.left;
          const y = e.pageY - rect.top;
          const top = y < borderSize;
          const left = x < borderSize;
          const right = x >= (rect.width - borderSize);
          const bottom = y >= (rect.height - borderSize);

          if ((top && left) || (bottom && right)) {
            this.$el.style.cursor = 'nwse-resize';
          } else if ((top && right) || (bottom && left)) {
            this.$el.style.cursor = 'nesw-resize';
          } else if (right || left) {
            this.$el.style.cursor = 'ew-resize';
          } else if (bottom || top) {
            this.$el.style.cursor = 'ns-resize';
          } else if (this.checkTitleAreaPanel(e)) {
            this.$el.style.cursor = 'move';
          } else {
            this.$el.style.cursor = 'default';

            if (!this.isMoving) {
              document.body.style.cursor = '';
            }
          }
        } else if (this.checkTitleAreaPanel(e)) {
          this.$el.style.cursor = 'move';
        } else {
          this.$el.style.cursor = 'default';

          if (!this.isMoving) {
            document.body.style.cursor = '';
          }
        }
      },
      checkTitleAreaPanel(e) {
        const windowElStyleInfo = this.$el.style;
        const headerAreaStyleInfo = this.$refs.headerArea.style;
        const rect = this.$el.getBoundingClientRect();
        const x = e.pageX - rect.left;
        const y = e.pageY - rect.top;
        const winPaddingObj = {
          top: this.removePixel(windowElStyleInfo.paddingTop),
          left: this.removePixel(windowElStyleInfo.paddingLeft),
          right: this.removePixel(windowElStyleInfo.paddingRight),
        };
        const headerAreaPaddingObj = {
          top: this.removePixel(headerAreaStyleInfo.paddingTop),
          left: this.removePixel(headerAreaStyleInfo.paddingLeft),
          right: this.removePixel(headerAreaStyleInfo.paddingRight),
        };
        const startPosX = winPaddingObj.left + headerAreaPaddingObj.left;
        const endPosX = rect.width - winPaddingObj.right - headerAreaPaddingObj.right;
        const startPosY = winPaddingObj.top + headerAreaPaddingObj.top;
        const endPosY = startPosY + this.titleHeight;

        return x > startPosX && x < endPosX && y > startPosY && y < endPosY;
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
        const windowEl = this.$el;
        const objPrototype = Object.prototype;

        if (objPrototype.hasOwnProperty.call(paramObj, 'top')) {
          top = paramObj.top;
        } else {
          top = this.clickedInfo.top;
        }

        if (objPrototype.hasOwnProperty.call(paramObj, 'left')) {
          left = paramObj.left;
        } else {
          left = this.clickedInfo.left;
        }

        if (objPrototype.hasOwnProperty.call(paramObj, 'width')) {
          width = paramObj.width;
        } else {
          width = windowEl.offsetWidth;
        }

        if (objPrototype.hasOwnProperty.call(paramObj, 'height')) {
          height = paramObj.height;
        } else {
          height = windowEl.offsetHeight;
        }

        if (objPrototype.hasOwnProperty.call(paramObj, 'minWidth')) {
          minWidth = paramObj.minWidth;
        } else {
          minWidth = this.minWidth;
        }

        if (objPrototype.hasOwnProperty.call(paramObj, 'minHeight')) {
          minHeight = paramObj.minHeight;
        } else {
          minHeight = this.minHeight;
        }

        windowEl.style.cssText = `
          top: ${this.numberToPixel(top)};
          left: ${this.numberToPixel(left)};
          width: ${this.numberToPixel(width)};
          height: ${this.numberToPixel(height)};
          min-width: ${this.numberToPixel(minWidth)};
          min-height: ${this.numberToPixel(minHeight)};`;
      },
      getWindowStyle() {
        let top = 0;
        let left = 0;
        const offsetWidth = document.body.clientWidth;
        const offsetHeight = document.body.clientHeight;

        top = (offsetHeight / 2) - (this.height / 2);
        left = (offsetWidth / 2) - (this.width / 2);

        // body 에 붙이기 전에 임시로 사이즈 조정
        top -= 150;
        left -= 300;

        return {
          top: this.numberToPixel(top),
          left: this.numberToPixel(left),
          width: this.numberToPixel(this.width),
          height: this.numberToPixel(this.height),
          minWidth: this.numberToPixel(this.minWidth),
          minHeight: this.numberToPixel(this.minHeight),
          paddingTop: `${this.titleHeight}px`,
        };
      },
      getWindowCls() {
        return [
          prefixEvui,
          {
            [`${prefixEvui}-rtm`]: this.clsType === 'rtm',
          },
        ];
      },
      getHeaderCls() {
        return [
          {
            [`${prefixEvui}-header-area`]: this.clsType,
            [`${prefixEvui}-header-rtm`]: this.clsType === 'rtm',
          },
        ];
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
      show() {
        this.windowStyle = this.getWindowStyle();
        this.isShow = true;
      },
      hide() {
        this.isShow = false;
      },
    },
  };
</script>

<style>
  .ev-window{
    position: absolute;
    border: 9px solid;
    border-radius: 8px;
    overflow: visible;
    z-index: 8888;
  }
  .ev-window-rtm{
    border-color: #595C64;
    background: #212227;
  }
  .ev-window-header-area{
    position: absolute;
    top: 0;
    width: 100%;
    border-bottom: 1px solid;
    background: transparent;
    align-items: center;
  }
  .ev-window-title-area{
    display: inline-block;
    padding: 6px 0 0 12px;
    font-size: 16px;
  }
  .ev-window-header-rtm{
    border-color: #464850;
    background-color: #27282E;
    color: #ABAEB5;
  }
  .ev-window-header-pa{
    border-color: #474a53;
    background-color: #212227;
    color: #ABAEB5;
  }
  .ev-window-expand-btn-line{
    position: absolute;
    top: 0;
    right: 66px;
    height: 32px;
    border-left: 1px solid #464850;
  }
  .ev-window-expand-btn{
    position: absolute;
    top: 6px;
    right: 40px;
    width: 19px;
    height: 19px;
    line-height: 19px;
    border-radius: 50%;
    color: #c7c8cc;
    text-align: center;
    background: #595c64;
    font-size: 13px;
    font-weight: bold;
  }
  .ev-window-expand-btn:before{
    position: absolute;
    top: -1px;
    right: 1px;
    font-size: 18px;
    content: 'ㅁ';
  }
  .ev-window-expand-btn:hover{
    background: #319de9;
    cursor: pointer;
  }
  .ev-window-close-btn-line{
    position: absolute;
    top: 0;
    right: 32px;
    height: 32px;
    border-left: 1px solid #464850;
  }
  .ev-window-close-btn{
    position: absolute;
    top: 6px;
    right: 7px;
    width: 19px;
    height: 19px;
    line-height: 19px;
    border-radius: 50%;
    color: #c7c8cc;
    text-align: center;
    background: #595c64;
    font-size: 13px;
    font-weight: bold;
  }
  .ev-window-close-btn:before{
    position: absolute;
    top: 0;
    right: 6px;
    font-size: 11px;
    content: 'X';
  }
  .ev-window-close-btn:hover{
    background: #319de9;
    cursor: pointer;
  }
  .ev-window-body-area{
    position: relative;
    width: 100%;
    height: 100%;
    padding: 9px 8px 8px 8px;
    background: transparent;
  }
</style>
