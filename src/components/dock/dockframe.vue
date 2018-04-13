<template>
  <div
    :data-ref="dataRef"
    :style="userSelectStyle"
    :flex="flexVal"
    :minWidth="minWidthVal"
    :minHeight="minHeightVal"
    class="dockcontainer"
  >
    <header
      class="container-title"
    >
      <label
        class="docktitle"
      >{{ title }}</label>
    </header>
    <slot/>
    <!-- Dock 도킹 선택 이미지 -->
    <div
      :class="isPosImage ? 'selectlayerShow' : 'selectlayerHide'"
      class="evui-direct">
      <div class="wrap">
        <div class="evui-direct-background"/>
        <div class="top"><span
          class="top"
          pos="top"
          @mouseover.stop="MouseOverPos"
          @mouseout.stop="MouseOutPos"
        /></div>
        <div class="evui-direct-center-wrap">
          <div
            class="right"
            pos="right"
            @mouseover.stop="MouseOverPos"
            @mouseout.stop="MouseOutPos"
          />
          <div
            class="left"
            pos="left"
            @mouseover.stop="MouseOverPos"
            @mouseout.stop="MouseOutPos"
          />
          <div
            class="center"
            pos="tab"
            @mouseover.stop="MouseOverPos"
            @mouseout.stop="MouseOutPos"
          />
        </div>
        <div class="bottom"><span
          class="bottom"
          pos="bottom"
          @mouseover.stop="MouseOverPos"
          @mouseout.stop="MouseOutPos"
        /></div>
      </div>
    </div>
    <!--도킹 히든 영역 표시 레이어-->
    <div
      ref="hiddenLayer"
      :style="hiddenLayerSize"
      :class="isViewLayer ? 'selectlayerShow': 'selectlayerHide'"
      class="evui-selectDockingLayer"
    />
  </div>
</template>

<script>
  import utils from '@/common/container.utils';

  // const LAYOUT_Tab = 'Tab';

  export default {

    name: 'DockFrame',
    props: {
      /** *
       *  dockMainFrame ID을 지정한다.
       *
       * */
      dataRef: {
        type: String,
        default() {
          return `evui-dockframe-${this._uid}`;
        },
      },
      /** *
       *  DockFrame 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'DockFrame',
      },
      /**
       * DockFrame title를 적용합니다.
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
       * DockFrame flex 비율로 넓이/높이를 지정합니다.
       */
      flex: {
        type: [String, Number],
        default: '',
      },
      /**
       * DockFrame add  위치정보
       */
      pos: {
        type: String,
        default: '',
      },
      /**
       * DockMainFrame vm
       */
      vmMain: {
        type: Object,
        default: null,
      },
      /**
       * DockFrame adddcok type
       */
      type: {
        type: String,
        default: '',
      },
    },

    data() {
      return {
        panelWidth: this.width,
        panelHeight: this.height,
        panelFlex: this.flex,
        panelTitle: this.title,
        panelMinWidth: this.minWidth,
        panelMinHeight: this.minHeight,
        isResizing: false,
        isSelectLayerPopup: false,
        hiddenLayerStyle: null,
        isViewLayer: false,
        addPos: this.pos,
        addType: this.type,
        vmMainFrame: this.vmMain, // 해당 Dock  Vm 객체 담는다.
        resizebarSize: ['4px', '100%'],
      };
    },

    computed: {
      isPosImage() {
        return this.isSelectLayerPopup;
      },
      hiddenLayerSize() {
        return this.hiddenLayerStyle;
      },
      userSelectStyle() {
        let wrapperObj;
        if (this.wrapperStyles !== null && typeof this.wrapperStyles === 'object') {
          wrapperObj = this.wrapperStyles;
        } else {
          wrapperObj = null;
        }
        const styleObject = Object.assign({
          width: `${utils.quantity(this.widthVal).value}px`,
          height: `${utils.quantity(this.heightVal).value}px`,
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
          return this.panelHeight;
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
    activated() {
      // root 도킹이 아닐때
      if (this.addType === 'root') {
        if (!this.$el.parentElement.className.match('root')) {
          this.sizeRootDockFrame();
        }
      } else {
        // inner Dock
        this.sizeDockFrame();
      }
    },
    methods: {
      sizeDockFrame() {
        const dockframeSize = this.$el.getBoundingClientRect();
        let resizebar;
        if (this.addPos !== '') {
          switch (this.addPos) {
            case 'left':
              // 이진트리 하부 3개.
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width / 2) - 2}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'right':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width / 2) - 2}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'top':
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height / 2) - 2}px`;
              break;
            case 'bottom':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height / 2) - 2}px`;
              break;
            default :
          }
          this.addPos = '';
        }
      },
      sizeRootDockFrame() {
        if (this.addPos !== '') {
          const dockframeSize = this.$el.getBoundingClientRect();
          let resizebar;
          switch (this.addPos) {
            case 'left':
              // 이진트리 하부 3개.
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width / 2) - 2}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'right':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width / 2) - 2}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'top':
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height / 2) - 2}px`;
              break;
            case 'bottom':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height / 2) - 2}px`;
              break;
            default :
          }
          this.addPos = '';
        }
      },
      MouseOverPos() {
        this.isViewLayer = true;
      },
      MouseOutPos() {
        this.isViewLayer = false;
      },
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
