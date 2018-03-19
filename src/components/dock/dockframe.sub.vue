<template>
  <div
    :style="userSelectStyle"
    :flex="flexVal"
    :class="dockclassName"
    :minWidth="minWidthVal"
    :minHeight="minHeightVal"
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
       * DockFrame 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '100',
      },
      /**
       * DockFrame 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '100',
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
        panelMinWidth: this.minWidth,
        panelMinHeight: this.minHeight,
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

        const styleObject = Object.assign({
          // 'max-height': '100%',
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
      heightVal: {
        get() {
          return typeof this.panelHeight === 'number' ? `${this.panelHeight}px` : this.panelHeight;
        },
        set(cData) {
          this.panelHeight = utils.styleSizeValue(cData);
        },
      },
      minWidthVal: {
        get() {
          return this.panelMinWidth;
        },
        set(cData) {
          this.panelMinWidth = utils.styleSizeValue(cData);
        },
      },
      minHeightVal: {
        get() {
          return this.panelMinHeight;
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
            throw new Error('[EVUI][ERROR][DockframeSub]-flex Data');
          } else {
            this.panelFlex = cData;
          }
        },
      },
    },
    mounted() {
       if (this.$children.length !== 0) {
         let totalWidth = 0;
         let totalHeight = 0;
         // 기본값은 0
         const boxSize = [0];
        for (let ix = 0, ixLen = this.$children.length - 1; ix <= ixLen; ix += 1) {
          const slotobj = this.$children[ix];
          if (this.layout === 'hBox') {
            if (slotobj.$el.className !== 'resizebar') {
              totalWidth += parseInt(slotobj.panelMinWidth, 10);
              boxSize.push(parseInt(slotobj.panelMinHeight, 10));
            }
          } else if (this.layout === 'vBox') {
            // vBox
            if (slotobj.$el.className !== 'resizebar') {
              boxSize.push(parseInt(slotobj.panelMinWidth, 10));
              totalHeight += parseInt(slotobj.panelMinHeight, 10);
            }
          }
        }
        // max 값을 가져온다.
         const MaxSize = boxSize.reduce((previous, current) =>
           (previous >= current ? previous : current));
         if (this.$el.className === 'subDockFrame') {
           // 해당 container 최소 넓이/높이 지정
           this.panelMinWidth = this.$children[0].panelMinWidth;
           this.panelMinHeight = this.$children[0].panelMinHeight;
         } else if (this.layout === 'hBox') {
             // 해당 container 최소 넓이/높이 지정
             this.panelMinWidth = totalWidth;
             this.panelMinHeight = MaxSize;
           } else {
             // 해당 container 최소 넓이/높이 지정
             this.panelMinWidth = MaxSize;
             this.panelMinHeight = totalHeight;
           }
       }
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
