<template>
  <div
    ref="MainContainer"
    :style="userSelectStyle"
    class="evui-container"
    @mousedown="onMouseDown"
  >
    <slot/>
  </div>
</template>

<script>
  import utils from '@/common/container.utils';

  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';

  export default {

    name: 'MainContainer',
    props: {
      /** *
       *  mainContinaer 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'Container',
      },
      /**
       * mainContinaer 세로, 수직  지정합니다.
       */
      layout: {
        type: String,
        default: LAYOUT_HORIZONTAL,
      },
      /**
       * mainContinaer css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * mainContinaer 넓이 설정합니다.
       */
      width: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * mainContinaer 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * mainContinaer 최대넓이 설정합니다.
       */
      maxWidth: {
        type: [String, Number],
        default: '800px',
      },
      /**
       * mainContinaer 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '800px',
      },
      /**
       * mainContinaer 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * mainContinaer 최대높이 설정합니다.
       */
      maxHeight: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * mainContinaer layout Data
       */
      dockDataSet: {
        type: Object,
        default() {
          return {};
        },
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
        panelLayout: this.layout,
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


    },
    mounted() {
      this.$el.className = this.panelLayout ===
      LAYOUT_VERTICAL ? 'evui-container layout-v'
        : 'evui-container layout-h';

      this.childDomSize(this.$el, this.panelLayout);
    },
    created() {

    },
    methods: {
      onMouseDown({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
        // 마우스 클릭 이벤트 발생
        /** *
         *  resizer : 사이즈 변경 되는 타켓 리사이즈 div 바
         *  initialPageX : 해당 div에 x 좌표
         *  initialPageY : 해당 div에 y 좌표
         */
        // 컨테이너 안에 여러개 사이즈바가 존재 하는경우 이벤트 여러번 발생함 이벤트 전파 막기 위함
        event.stopImmediatePropagation();
        // 타켓 대상 class Name 존재 여부 및 class 매칭 되는지 체크
        if (resizer.className && resizer.className.match('resizebar')) {
          const self = this;
          // 부모 컨테이너
          const container = self.$el;
          // 부모 컨테이너 layout 속성값 Vbox / Hbox
          const layout = self.layout;
          const preResizeContainer = resizer.previousElementSibling;
          const nextResizeContainer = resizer.nextElementSibling;
          const prePanelSize = preResizeContainer.getBoundingClientRect();
          const nextPanelSize = nextResizeContainer.getBoundingClientRect();
          // box 최소 넓이
          const nextMinWidth = nextResizeContainer.style.minWidth;
          const prevMinWidth = preResizeContainer.style.minWidth;
          const nextMinheight = nextResizeContainer.style.minHeight;
          const prevMinheight = preResizeContainer.style.minHeight;

          // container 객체에 이벤트 리스너 연결
          const { addEventListener, removeEventListener } = container;
          // 좌우측 늘어난 수 많큼 높이 넓이 반환
          let mouseMoveXY = null;

          const resizeMove = (downEventPageXY, moveEventPageXY) => {
            mouseMoveXY = moveEventPageXY - downEventPageXY;
            if (layout === LAYOUT_HORIZONTAL) {
              const preWidth = `${prePanelSize.width + mouseMoveXY}px`;
              const nextWidth = `${nextPanelSize.width - mouseMoveXY}px`;
              if (prePanelSize.width + mouseMoveXY > 0 && nextPanelSize.width - mouseMoveXY > 0) {
                if (utils.quantity(nextMinWidth).value < utils.quantity(nextWidth).value
                  && utils.quantity(prevMinWidth).value < utils.quantity(preWidth).value) {
                  preResizeContainer.style.width = preWidth;
                  nextResizeContainer.style.width = nextWidth;
                }
              }
            }
            if (layout === LAYOUT_VERTICAL) {
              const preHeight = `${prePanelSize.height + mouseMoveXY}px`;
              const nextHeight = `${nextPanelSize.height - mouseMoveXY}px`;
              if (prePanelSize.height + mouseMoveXY > 0 && nextPanelSize.height - mouseMoveXY > 0) {
                if (utils.quantity(nextMinheight).value < utils.quantity(nextHeight).value
                  && utils.quantity(prevMinheight).value < utils.quantity(preHeight).value) {
                  preResizeContainer.style.height = preHeight;
                  nextResizeContainer.style.height = nextHeight;
                }
              }
            }
          };
          const onMouseMove = function onMouseMove(e) {
              const mousePageX = e.pageX;
              const mousePageY = e.pageY;
              if (initialPageX !== mousePageX && layout === LAYOUT_HORIZONTAL) {
                  resizeMove(initialPageX, mousePageX);
              }

              if (initialPageY !== mousePageY) {
                if (layout === LAYOUT_VERTICAL) {
                  resizeMove(initialPageY, mousePageY);
                }
              }
            // self.$emit('onResizeContainer', preResizeContainer, resizer, size);
          };

          const onMouseUp = function onMouseUp() {
            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);
          };

          // text를 드래이그해서 이동하는 경우 마우스 업 이벤트가 끝나지 않는 현상 발생
          const onDrag = function onDrag() {
            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);
          };
          addEventListener('drag', onDrag);
          addEventListener('mousemove', onMouseMove);
          addEventListener('mouseup', onMouseUp);
        }
      },
    childDomSize(target, layout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;

        const parentSize = target.getBoundingClientRect();
        const arrayFlex = this.totalFlex(target);
        const splitterCnt = this.resizeBarCnt(target);
        for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
            const childDom = targetDom[ix];

            // 리사이즈 총 합계 (  높이 , 넓이 )
            const splitterTotalSize = 8 * splitterCnt;
            // 부모 Dom Layout

            // 스플릿터
            if (childDom.className.match('resizebar')) {
              if (layout === 'vBox') {
                childDom.style.width = '100%';
                childDom.style.height = '8px';
              } else if (layout === 'hBox') {
                childDom.style.width = '8px';
                childDom.style.height = '100%';
              }
            } else if (arrayFlex[0]) {
              // flex 넓이 높이 셋팅
              // flex 값이 null 경우 1 더 해준다.
              const childFlex = childDom.getAttribute('flex') || 1;
              let parentFlexSzie = 0;
              switch (layout) {
                case 'hBox':
                  parentFlexSzie = parentSize.width - splitterTotalSize;
                  childDom.style.width = this.flexSzie(arrayFlex[1], childFlex, parentFlexSzie);
                  childDom.style.height = `${parentSize.height}px`;
                  break;
                case 'vBox':
                  parentFlexSzie = parentSize.height - splitterTotalSize;
                  childDom.style.width = `${parentSize.width}px`;
                  childDom.style.height = this.flexSzie(arrayFlex[1], childFlex, parentFlexSzie);
                  break;
                default :
              }
            } else {
              // flex 사용 하지 않는 넓이 높이 셋팅
              // box 수
              const boxCnt = targetDomLength - splitterCnt;
              const boxBarSize = splitterTotalSize / boxCnt;
              const childDomSize = childDom.getBoundingClientRect();
              switch (layout) {
                case 'hBox':
                    childDom.style.width = `${childDomSize.width - boxBarSize}px`;
                    childDom.style.height = `${childDomSize.height}px`;

                  break;
                case 'vBox':
                    childDom.style.width = `${childDomSize.width}px`;
                    childDom.style.height = `${childDomSize.height - boxBarSize}px`;
                  break;
                default :
              }
            }
        }
      },
      totalFlex(domNode) {
        const selectDom = domNode.children;
        const childrenArray = Array.from(selectDom);
        let isFlex = false;
        let totalFlex = 0;
        childrenArray.forEach(
          (currentValue) => {
            // (currentValue, currentIndex, listObj) => {
            // flex 값이 안들어가는 dom은 제외
            if (!currentValue.className.match('resizebar') && currentValue.getAttribute('flex') !== null) {
              isFlex = true;
            }
            if (!currentValue.className.match('resizebar')) {
              const flexValue = currentValue.getAttribute('flex') || 1;
              totalFlex += parseInt(flexValue, 10);
            }
          });
        return [isFlex, totalFlex];
      },
      resizeBarCnt(domNode) {
        const selectDom = domNode.children;
        const childrenArray = Array.from(selectDom);
        let sizebarCount = 0;
        childrenArray.forEach(
          (currentValue) => {
            if (currentValue.className.match('resizebar')) {
              sizebarCount += 1;
            }
          });
        return sizebarCount;
      },
      flexSzie(totalFlex, flex, parentSize) {
        const flexSizeRatio = parentSize / totalFlex;
        return `${flexSizeRatio * flex}px`;
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
    setFlex(cFlex) {
      let fData = 0;
      if (typeof cFlex === 'number') {
        fData = cFlex;
      } else {
        throw new Error('only number value');
      }
      this.flexVal = fData;
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
    deleteFlex() {
      // removeProperty
      this.$el.style.removeProperty('flex');
      this.panelFlex = null; // 값 초기화 안해주면 computed 동작 안함.
    },
  },
  };
</script>

<style >
</style>
