<template>
  <div
    :style="userSelectStyle"
    :flex="flexVal"
    class="DockContainer"
  >
    <header
      class="container-title"
    >
      <label
        class="dockTitle"
      >{{ title }}</label>
    </header>
    <slot/>
  </div>
</template>

<script>
  import utils from '@/common/container.utils';

  // const LAYOUT_Tab = 'Tab';

  export default {

    name: 'DockFrame',
    props: {
      /** *
       *  DockFrame 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'DockFrame',
      },
      /**
       * DockFrame css style를 적용합니다.
       */
      title: {
        type: String,
        default: '',
      },
      /**
       * DockFrame css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * DockFrame 넓이 설정합니다.
       */
      width: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * DockFrame 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '100%',
      },
      /**
       * DockFrame flex 비율로 넓이/높이를 지정합니다.
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
        panelFlex: this.flex,
        panelTitle: this.title,
        isResizing: false,
      };
    },

    computed: {
      userSelectStyle() {
        let wrapperObj;
        if (this.wrapperStyles !== null && typeof this.wrapperStyles === 'object') {
          wrapperObj = this.wrapperStyles;
        } else {
          wrapperObj = null;
        }
        const styleObject = Object.assign({
          'max-height': '100%',
        }, wrapperObj);
        return styleObject;
      },
      titleVal: {
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
          this.panelWidth = utils.styleSizeValue(cData);
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
            throw new Error('[EVUI][ERROR][DockFrame]-flex Data');
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
    },
  };
</script>

<style>
</style>
