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
  import utils from '@/common/container.utils';

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
        default: LAYOUT_SUB,
      },
      /**
       * DockSubFrame css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * DockSubFrame flex 비율로 넓이/높이를 지정합니다.
       */
      flex: {
        type: [String, Number],
        default: '',
      },
    },

    data() {
      return {
        panelFlex: this.flex,
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
        let wrapperObj;
        if (this.wrapperStyles !== null && typeof this.wrapperStyles === 'object') {
          wrapperObj = this.wrapperStyles;
        } else {
          wrapperObj = null;
        }

        // const styleObject = Object.assign({
        // }, wrapperObj);
        return wrapperObj;
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
            throw new Error('[EVUI][ERROR][dockframe.sub]-flex Data');
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
