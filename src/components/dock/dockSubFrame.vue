<template>
  <div
    :style="userSelectStyle"
    :flex="flexVal"
    :class="dockclassName"
  >
    <slot/>
  </div>
</template>

<script>

  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';
  const LAYOUT_SUB = 'sub';
  // const LAYOUT_Tab = 'Tab';

  export default {

    name: 'DockSubFrame',
    props: {
      /** *
       *  DockSubFrame 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'DockSubFrame',
      },
      /**
       * DockSubFrame 세로, 수직  지정합니다.
       */
      layout: {
        type: String,
        default: null,
      },
      /**
       * DockSubFrame css style를 적용합니다.
       */
      title: {
        type: String,
        default: null,
      },
      /**
       * DockSubFrame css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * DockSubFrame 넓이 설정합니다.
       */
      width: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * DockSubFrame 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * DockSubFrame 최대넓이 설정합니다.
       */
      maxWidth: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * DockSubFrame 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '100%',
      },
      /**
       * DockSubFrame 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * DockSubFrame 최대높이 설정합니다.
       */
      maxHeight: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * DockSubFrame flex 비율로 넓이/높이를 지정합니다.
       */
      flex: {
        type: [String, Number],
        default: null,
      },
    },

    data() {
      return {
        panelWidth: this.width,
        panelHeight: this.height,
        panelMinWidth: this.minWidth,
        panelMaxWidth: this.maxWidth,
        panelMinHeight: this.minHeight,
        panelMaxHeight: this.maxHeight,
        panelFlex: this.flex,
        panelTitle: this.title,
        panelLayout: this.layout,
        isResizing: false,
      };
    },

    computed: {
      dockclassName() {
          if (this.panelLayout === LAYOUT_HORIZONTAL) {
            return 'evui-Dock-container layout-hBox';
          } else if (this.panelLayout === LAYOUT_VERTICAL) {
            return 'evui-Dock-container layout-vBox';
          } else if (this.panelLayout === LAYOUT_SUB) {
            return 'subDockFrame';
          }
            return null;
      },
      userSelectStyle() {
        const wrapperObj = typeof this.wrapperStyles === 'object' ? this.wrapperStyles : null;

        const styleObject = Object.assign({
          'min-width': this.minWidthVal,
          'max-width': this.maxWidthVal,
          'min-height': this.minHeightVal,
          'max-height': this.maxHeightVal,
        }, wrapperObj);
        return styleObject;
      },
      TitleVal: {
        get() {
          return this.panelTitle;
        },
        set(cData) {
          this.panelTitle = cData;
        },
      },
      widthVal: {
        get() {
          return typeof this.panelWidth === 'number' ? `${this.panelWidth}px` : this.panelWidth;
        },
        set(cData) {
          this.panelWidth = this.styleSizeValue(cData);
        },
      },
      minWidthVal: {
        get() {
          return typeof this.panelMinWidth === 'number' ? `${this.panelMinWidth}px` : this.panelMinWidth;
        },
        set(cData) {
          this.panelMinWidth = this.styleSizeValue(cData);
        },
      },
      maxWidthVal: {
        get() {
          return typeof this.panelMaxWidth === 'number' ? `${this.panelMaxWidth}px` : this.panelMaxWidth;
        },
        set(cData) {
          this.panelMaxWidth = this.styleSizeValue(cData);
        },
      },
      heightVal: {
        get() {
          return typeof this.panelHeight === 'number' ? `${this.panelHeight}px` : this.panelHeight;
        },
        set(cData) {
          this.panelHeight = this.styleSizeValue(cData);
        },
      },
      maxHeightVal: {
        get() {
          return typeof this.panelMaxHeight === 'number' ? `${this.panelMaxHeight}px` : this.panelMaxHeight;
        },
        set(cData) {
          this.panelMaxHeight = this.styleSizeValue(cData);
        },
      },
      minHeightVal: {
        get() {
          return typeof this.panelMinHeight === 'number' ? `${this.panelMinHeight}px` : this.panelMinHeight;
        },
        set(cData) {
          this.panelMinHeight = this.styleSizeValue(cData);
        },
      },
      flexVal: {
        get() {
          return typeof this.panelFlex === typeof null ? null : this.panelFlex;
        },
        set(cData) {
          if (cData !== null || typeof cData === 'number') {
            this.panelFlex = cData;
          } else {
            throw new Error('flex value only number');
          }
        },
      },
    },
    mounted() {
    },
    created() {

    },
    methods: {
      styleSizeValue(gData) {
        if (typeof gData === 'number' || !isNaN(gData)) {
          return Number(gData);
        } else if (gData.match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/)) {
          // .match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
          return gData;
        }
        throw new Error('[EVUI][ERROR][DockSubFrame]-styleData');
      },
      getWidth() {
        return this.widthVal;
      },
      setWidth(cWidth) {
        this.widthVal = this.styleSizeValue(cWidth);
      },
      getHeight() {
        return this.heightVal;
      },
      setHeight(cHeight) {
        this.heightVal = this.styleSizeValue(cHeight);
      },
      getName() {
        return this.name;
      },
      getFlex() {
        return this.flexVal;
      },
      getMinWidth() {
        return this.minWidthVal;
      },
      setMinWidth(cMinWidth) {
        this.minWidthVal = this.styleSizeValue(cMinWidth);
      },
      getMinHeight() {
        return this.minWidthVal;
      },
      setMinHeight(cMinHeight) {
        this.minHeightVal = this.styleSizeValue(cMinHeight);
      },
      getMaxWidth() {
        return this.maxWidthVal;
      },
      setMaxWidth(cMaxWidth) {
        this.minWidthVal = this.styleSizeValue(cMaxWidth);
      },
      getMaxHeight() {
        return this.maxHeightVal;
      },
      setMaxHeight(cMaxHeight) {
        this.maxHeightVal = this.styleSizeValue(cMaxHeight);
      },
    },
  };
</script>

<style>
</style>
