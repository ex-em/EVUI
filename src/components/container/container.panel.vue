<template>
  <div
    :style="userSelectStyle"
    :flex="flexVal"
    class="evui-container-content"
  >
    <slot/>
  </div>
</template>

<script>
  import utils from '@/common/container.utils';

  export default {
    name: 'BoxPanel',
    props: {
      /** *
       *  boxPanel 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'boxPanel',
      },
      /**
       * boxPanel 세로, 수직  지정합니다.
       */
      layout: {
        type: String,
        default: null,
      },
      /**
       * boxPanel css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * boxPanel 넓이 설정합니다.
       */
      width: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * boxPanel 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * boxPanel 최대넓이 설정합니다.
       */
      maxWidth: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * boxPanel 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '100%',
      },
      /**
       * boxPanel 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * boxPanel 최대높이 설정합니다.
       */
      maxHeight: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * boxPanel flex 비율로 넓이/높이를 지정합니다.
       */
      flex: {
        type: [String, Number],
        default: '',
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
        isResizing: false,
      };
    },

    computed: {
      classNames() {
        return [
          'evui-container-content',
        ];
      },
      userSelectStyle() {
        let wrapperObj;
        if (this.wrapperStyles !== null && typeof this.wrapperStyles === 'object') {
          wrapperObj = this.wrapperStyles;
        } else {
          wrapperObj = null;
        }
        const styleObject = Object.assign({
          width: this.widthVal,
          height: this.heightVal,
          'min-width': this.minWidthVal,
          'max-width': this.maxWidthVal,
          'min-height': this.minHeightVal,
          'max-height': this.maxHeightVal,
        }, wrapperObj);
        return styleObject;
      },
      widthVal: {
        get() {
          return typeof this.panelWidth === 'number' ? `${this.panelWidth}px` : this.panelWidth;
        },
        set(cData) {
          this.panelWidth = utils.styleSizeValue(cData);
        },
      },
      minWidthVal: {
        get() {
          return typeof this.panelMinWidth === 'number' ? `${this.panelMinWidth}px` : this.panelMinWidth;
        },
        set(cData) {
          this.panelMinWidth = utils.styleSizeValue(cData);
        },
      },
      maxWidthVal: {
        get() {
          return typeof this.panelMaxWidth === 'number' ? `${this.panelMaxWidth}px` : this.panelMaxWidth;
        },
        set(cData) {
          this.panelMaxWidth = utils.styleSizeValue(cData);
        },
      },
      heightVal: {
        get() {
          return typeof this.panelHeight === 'number' ? `${this.panelHeight}px` : this.panelHeight;
        },
        set(cData) {
          this.panelHeight = utils.styleSizeValue(cData);
        },
      },
      maxHeightVal: {
        get() {
          return typeof this.panelMaxHeight === 'number' ? `${this.panelMaxHeight}px` : this.panelMaxHeight;
        },
        set(cData) {
          this.panelMaxHeight = utils.styleSizeValue(cData);
        },
      },
      minHeightVal: {
        get() {
          return typeof this.panelMinHeight === 'number' ? `${this.panelMinHeight}px` : this.panelMinHeight;
        },
        set(cData) {
          this.panelMinHeight = utils.styleSizeValue(cData);
        },
      },
      flexVal: {
        get() {
          const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(this.panelFlex);

          if (match === null) {
            return '';
          }
          return this.panelFlex;
        },
        set(cData) {
          if (!cData && typeof cData === 'object') {
            throw new Error('[EVUI][ERROR][ContainerPanel]-flex Data');
          } else {
            this.panelFlex = cData;
          }
        },
      },
    },
    mounted() {

    },
    created() {

    },
    methods: {
      getWidth() {
        return this.widthVal;
      },
      setWidth(cWidth) {
        this.widthVal = utils.styleSizeValue(cWidth);
      },
      getHeight() {
        return this.heightVal;
      },
      setHeight(cHeight) {
        this.heightVal = utils.styleSizeValue(cHeight);
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
        this.minWidthVal = utils.styleSizeValue(cMinWidth);
      },
      getMinHeight() {
        return this.minWidthVal;
      },
      setMinHeight(cMinHeight) {
        this.minHeightVal = utils.styleSizeValue(cMinHeight);
      },
      getMaxWidth() {
        return this.maxWidthVal;
      },
      setMaxWidth(cMaxWidth) {
        this.minWidthVal = utils.styleSizeValue(cMaxWidth);
      },
      getMaxHeight() {
        return this.maxHeightVal;
      },
      setMaxHeight(cMaxHeight) {
        this.maxHeightVal = utils.styleSizeValue(cMaxHeight);
      },
    },
  };
</script>

<style>
</style>
