<template>
  <div
    :style="userSelectStyle"
    class="overFlowDiv"
  >
    <div
      id="rootDock"
      ref="dockMainFrameRoot"
      :class="classNames"
      :style="userSelectStyle"
      @mousedown="onMouseDown"
    >
      <keep-alive
        v-for="item in arrayLayoutData"
        :key = "item.id"
      >
        <compoenet
          :is="item"
          :dock-frame-title="DockTitle"
          :dock-pos = "addDockLayoutPos"
          :dock-size="dockFrameSize"
          :rootframe = "vmMain"
          :compnentpopup = "addEvuiCompent"
        />
      </keep-alive>
      <slot/>
      <!--가상 스플렛 바-->
      <div
        ref="guideLine"
        style="display:none;"
        class="guideLine"
      />
      <!--도킹 히든 영역 표시 레이어-->
      <div
        ref="hiddenLayer"
        :style="hiddenLayerSize"
        :class="{
          selectlayerShow: isViewLayer,
          selectlayerHide: !isViewLayer,
        }"
        class="evui-selectDockingLayer root"
      />
      <!--top drop-->
      <div
        :class="{
          selectlayerShow: isSelectLayerPopup,
          selectlayerHide: !isSelectLayerPopup,
        }"
        class="evui-root-direct top"
        pos="top"
        @mouseover.stop="MouseOverPos"
        @mouseout.stop="MouseOutPos"
      />
      <!--right drop-->
      <div
        :class="{
          selectlayerShow: isSelectLayerPopup,
          selectlayerHide: !isSelectLayerPopup,
        }"
        class="evui-root-direct right"
        pos="right"
        @mouseover.stop="MouseOverPos"
        @mouseout.stop="MouseOutPos"
      />
      <!--left drop-->
      <div
        :class="{
          selectlayerShow: isSelectLayerPopup,
          selectlayerHide: !isSelectLayerPopup,
        }"
        class="evui-root-direct left"
        pos="left"
        @mouseover.stop="MouseOverPos"
        @mouseout.stop="MouseOutPos"
      />
      <!--bottom drop-->
      <div
        :class="{
          selectlayerShow: isSelectLayerPopup,
          selectlayerHide: !isSelectLayerPopup,
        }"
        class="evui-root-direct bottom"
        pos="bottom"
        @mouseover.stop="MouseOverPos"
        @mouseout.stop="MouseOutPos"
      />
    </div>
  </div>

</template>

<script>
  import utils from '@/common/container.utils';
  import dockSubFrame from './dockframe.sub';
  import dockFrame from './dockframe';
  import dockspliter from './dockspliter';

  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';

  const addDockFirstBox = {
    name: 'addDockFirstBox',
    components: {
      dockSubFrame, dockFrame, dockspliter,
    },
    props: {
      dockFrameTitle: {
        type: String,
        default: '',
      },
      dockSize: {
        type: Object,
        default: null,
      },
      rootframe: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        title: this.dockFrameTitle,
        width: this.dockSize.width,
        height: this.dockSize.height,
        vmRoot: this.rootframe,
        addType: 'root',
      };
    },
    template:
    '            <dock-frame' +
    '              flex="1"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :type="addType"' +
    '              :title="title"/>',
    created() {
    },
    methods: {
    },
  };

  const addDockRightBox = {
    name: 'addDockRightBox',
    components: {
      dockSubFrame, dockFrame, dockspliter,
    },
    props: {
      dockFrameTitle: {
        type: String,
        default: '',
      },
      dockSize: {
        type: Object,
        default: null,
      },
      dockPos: {
        type: String,
        default: '',
      },
      rootframe: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        title: this.dockFrameTitle,
        width: this.dockSize.width,
        height: this.dockSize.height,
        pos: this.dockPos,
        vmRoot: this.rootframe,
        addType: this.dockSize.type,
        addDockFrameId: this.dockSize.newDockFrameId,
        insertTargetId: this.dockSize.insertTargetId,
      };
    },
    template:
    '              <dock-sub-frame' +
    '               flex="1"' +
    '                layout="hBox"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '                :insertId="insertTargetId"' +
    '                :addId="addDockFrameId"' +
    '>' +
    '            <dockspliter/>' +
    '            <dock-frame' +
    '             flex="1"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '              :title="title"/>' +
    '            </dock-sub-frame>',
    created() {
    },
    methods: {
    },
  };
  const addDockLeftBox = {
    name: 'addDockLeftBox',
    components: {
      dockSubFrame, dockFrame, dockspliter,
    },
    props: {
      dockFrameTitle: {
        type: String,
        default: '',
      },
      dockSize: {
        type: Object,
        default: null,
      },
      dockPos: {
        type: String,
        default: '',
      },
      rootframe: {
        type: Object,
        default: null,
      },
      compnentpopup: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        title: this.dockFrameTitle,
        width: this.dockSize.width,
        height: this.dockSize.height,
        pos: this.dockPos,
        vmRoot: this.rootframe,
        evuiCompnent: this.compnentpopup,
        addType: this.dockSize.type,
        addDockFrameId: this.dockSize.newDockFrameId,
        insertTargetId: this.dockSize.insertTargetId,
      };
    },
    template:
    '              <dock-sub-frame' +
    '               flex="1"' +
    '                layout="hBox"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '                :insertId="insertTargetId"' +
    '                :addId="addDockFrameId"' +
    '>' +
    '            <dock-frame' +
    '             flex="1"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '              :title="title">' +
    '             <keep-alive>' +
    '              <compoenet :is="addComponent"/>' +
    '             </keep-alive>' +
    '              </dock-frame>' +
    '            <dockspliter/>' +
    '            </dock-sub-frame>',
    computed: {
      addComponent() {
        return this.evuiCompnent;
      },
    },
    created() {
    },
    methods: {
    },
  };
  const addDockTopBox = {
    name: 'addDockTopBox',
    components: {
      dockSubFrame, dockFrame, dockspliter,
    },
    props: {
      dockFrameTitle: {
        type: String,
        default: '',
      },
      dockSize: {
        type: Object,
        default: null,
      },
      dockPos: {
        type: String,
        default: '',
      },
      rootframe: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        title: this.dockFrameTitle,
        width: this.dockSize.width,
        height: this.dockSize.height,
        pos: this.dockPos,
        vmRoot: this.rootframe,
        addType: this.dockSize.type,
        addDockFrameId: this.dockSize.newDockFrameId,
        insertTargetId: this.dockSize.insertTargetId,
      };
    },
    template:
    '              <dock-sub-frame' +
    '                flex="1"' +
    '                layout="vBox"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '                :insertId="insertTargetId"' +
    '                :addId="addDockFrameId"' +
    '>' +
    '            <dock-frame' +
    '              flex="1"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '              :title="title"/>' +
    '            <dockspliter/>' +
    '            </dock-sub-frame>',
    created() {
    },
    methods: {
    },
  };
  const addDockBottomBox = {
    name: 'addDockBottomBox',
    components: {
      dockSubFrame, dockFrame, dockspliter,
    },
    props: {
      dockFrameTitle: {
        type: String,
        default: '',
      },
      dockSize: {
        type: Object,
        default: null,
      },
      dockPos: {
        type: String,
        default: '',
      },
      rootframe: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        title: this.dockFrameTitle,
        width: this.dockSize.width,
        height: this.dockSize.height,
        pos: this.dockPos,
        vmRoot: this.rootframe,
        addType: this.dockSize.type,
        addDockFrameId: this.dockSize.newDockFrameId,
        insertTargetId: this.dockSize.insertTargetId,
      };
    },
    template:
    '              <dock-sub-frame' +
    '                flex="1"' +
    '                layout="vBox"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :vmMain="vmRoot"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '                :insertId="insertTargetId"' +
    '                :addId="addDockFrameId"' +
    '>' +
    '            <dockspliter/>' +
    '            <dock-frame' +
    '              flex="1"' +
    '                :width="width"' +
    '                :height="height"' +
    '                :pos="pos"' +
    '                :type="addType"' +
    '                :vmMain="vmRoot"' +
    '              :title="title"/>' +
    '            </dock-sub-frame>',
    created() {
    },
    methods: {
    },
  };

  export default {
    name: 'DockMainFrame',
    components: {
      addDockFirstBox,
      addDockRightBox,
      addDockTopBox,
      addDockBottomBox,
      addDockLeftBox,
    },
    props: {
      /** *
       *  dockMainFrame 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'Container',
      },
      /**
       * dockMainFrame 세로, 수직  지정합니다.
       */
      layout: {
        type: String,
        default: LAYOUT_HORIZONTAL,
      },
      /**
       * dockMainFrame css style를 적용합니다.
       */
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * dockMainFrame 넓이 설정합니다.
       */
      width: {
        type: [String, Number],
        default: '100%',
      },
      /**
       * dockMainFrame 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '100%',
      },
      /**
       *  dockMinaFrame 레이아웃 데이타
       * */
      layoutdata: {
        type: Object,
        default: null,
      },
      /**
       * dockMainFrame layout Data
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
        panelLayout: this.layout,
        isSelectLayerPopup: false,
        isViewLayer: false,
        addRootDockLayout: '',
        addDockTitle: '',
        addDockSize: null,
        evuiComponent: null,
        addDockList: [],
        hiddenLayerStyle: null,
        dockDataMap: [],
      };
    },
    computed: {
      addEvuiCompent: {
        get() {
          return this.evuiComponent;
        },
        set(cData) {
          this.evuiComponent = cData;
        },
      },
      vmMain() {
        return this;
      },
      hiddenLayerSize() {
        return this.hiddenLayerStyle;
      },
      arrayLayoutData() {
        // 새로운 레아아웃 데이타 로드
      return this.addDockList;
      },
      dockFrameSize: {
        get() {
          return this.addDockSize;
        },
        set(cData) {
          this.addDockSize = cData;
        },
      },
      addDockLayoutPos: {
        get() {
          return this.addRootDockLayout;
        },
        set(cData) {
          this.addRootDockLayout = cData;
        },
      },
      DockTitle: {
        get() {
          return this.addDockTitle;
        },
        set(cData) {
          this.addDockTitle = cData;
        },
      },
      classNames() {
        return [
          'evui-dockFrame-root',
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
    },
    updated() {
      this.$nextTick(() => {
      });
    },
    mounted() {
      // 데이타 맵에 첫 rootFrame 미리 넣어준다.
      this.dockDataMap.push({ id: 'root', width: this.panelWidth, height: this.panelHeight });
    },
    created() {

    },
    methods: {
      // inner docking
      addDockFrame(pos) {
        switch (pos) {
          case 'top':
            this.addDockList.push(addDockTopBox);
            break;
          case 'left':
            this.addDockList.push(addDockLeftBox);
            break;
          case 'right':
            this.addDockList.push(addDockRightBox);
            break;
          case 'bottom':
            this.addDockList.push(addDockBottomBox);
            break;
          case 'root':
            this.addDockList.push(addDockLeftBox);
            break;
          case 'tab': // 아직 구상 되지 않음
            break;
          default :
            break;
        }
      },
      // root docking
      addRootDockFrame(pos) {
        switch (pos) {
          case 'top':
            this.addDockList.push(addDockTopBox);
          break;
          case 'left':
            this.addDockList.push(addDockLeftBox);
            break;
          case 'right':
            this.addDockList.push(addDockRightBox);
            break;
          case 'bottom':
            this.addDockList.push(addDockBottomBox);
            break;
          case 'root':
            this.addDockList.push(addDockFirstBox);
            break;
          default :
            break;
        }
      },
      MouseOverPos() {
        this.isViewLayer = true;
      },
      MouseOutPos() {
        this.isViewLayer = false;
      },
      onMouseDown({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
        // 마우스 클릭 이벤트 발생
        /** *
         *  resizer : 사이즈 변경 되는 타켓 리사이즈 div 바
         *  initialPageX : 해당 div에 x 좌표
         *  initialPageY : 해당 div에 y 좌표
         */
        // 컨테이너 안에 여러개 사이즈바가 존재 하는경우 이벤트 여러번 발생함 이벤트 전파 막기 위함
        event.stopImmediatePropagation();
        if (resizer.className && resizer.className.match('resizebar')) {
          // if (event.preventDefault) {
          //   event.preventDefault();
          // }

          const self = this;
          const layout = resizer.parentNode.className.match('vBox') !== null ? 'vBox' : 'hBox';
          const parentOffsetLeft = self.$el.offsetLeft;
          const parentOffsetTop = self.$el.offsetTop;
          const targetBar = resizer;
          const prevResizeContainer = resizer.previousElementSibling;
          const nextResizeContainer = resizer.nextElementSibling;

          const guideLineDom = this.$refs.guideLine;

          const { addEventListener, removeEventListener } = resizer;

          // 좌우측 늘어난 수 많큼 높이 넓이 반환
          // 마우스 move 좌표 위치값
          let mouseMoveXY = null;
          // 마우스 move 좌표 위치값 (넓이 높이 구할 때 사용)
          let sizeMouseMoveXY = null;

          const resizeMove = (downEventPageXY, moveEventPageXY) => {
            const prevMinWidth = prevResizeContainer.getAttribute('minWidth');
            const nextMinWidth = nextResizeContainer.getAttribute('minWidth');
            const prevMinHeight = prevResizeContainer.getAttribute('minHeight');
            const nextMinHeight = nextResizeContainer.getAttribute('minHeight');
            if (layout === LAYOUT_HORIZONTAL) {
              mouseMoveXY = moveEventPageXY - downEventPageXY;
              const prevMinSizeWidth = prevResizeContainer.getBoundingClientRect().width
                + mouseMoveXY;
              const nextMaxSizeWidth = nextResizeContainer.getBoundingClientRect().width
                - mouseMoveXY;
              // 최소 사이즈 까지만 가이드라인 이동가능
              if (prevMinSizeWidth > prevMinWidth || nextMaxSizeWidth > nextMinWidth) {
                // 가이드라인바
                sizeMouseMoveXY = moveEventPageXY - downEventPageXY;

                guideLineDom.style.left = `${moveEventPageXY - parentOffsetLeft}px`;
                guideLineDom.style.top = '0px';
                guideLineDom.classList.add('guideLineBar-hBox');
                guideLineDom.style.display = 'block';
              }
            }
            if (layout === LAYOUT_VERTICAL) {
              mouseMoveXY = moveEventPageXY - downEventPageXY;
              const prevMinSizeHeight = prevResizeContainer.getBoundingClientRect().height
                + mouseMoveXY;
              const nextMaxSizeHeight = nextResizeContainer.getBoundingClientRect().height
                - mouseMoveXY;
              // 최소 사이즈 까지만 가이드라인 이동가능
              if (prevMinSizeHeight > prevMinHeight || nextMaxSizeHeight > nextMinHeight) {
                // 가이드라인바
                sizeMouseMoveXY = moveEventPageXY - downEventPageXY;
                guideLineDom.style.top = `${moveEventPageXY - parentOffsetTop}px`;
                guideLineDom.style.left = 'auto';
                guideLineDom.classList.add('guideLineBar-vBox');
                guideLineDom.style.display = 'block';
              }
            }
          };

          // 리사이즈 함수 생성
          const resize = (prevInitial, nextInitial) => {
            const prevPanelSize = prevInitial.getBoundingClientRect();
            const nextPanelSize = nextInitial.getBoundingClientRect();
            const prevPanelinfo = prevInitial;
            const nextPanelinfo = nextInitial;

            if (layout === LAYOUT_HORIZONTAL) {
              const prevWidth = `${prevPanelSize.width + sizeMouseMoveXY}px`;
              const nextWidth = `${nextPanelSize.width - sizeMouseMoveXY}px`;


              // 순서
              prevPanelinfo.style.width = prevWidth;
              // 자식 Dom resize
              this.domResizing(prevPanelinfo, sizeMouseMoveXY, layout);
              nextPanelinfo.style.width = nextWidth;
              this.domResizing(nextPanelinfo, -sizeMouseMoveXY, layout);


              targetBar.style.left = `${prevWidth}`;
              guideLineDom.style.removeProperty('left');
              guideLineDom.style.display = 'none';
              guideLineDom.classList.remove('guideLineBar-hBox');
            }
            if (layout === LAYOUT_VERTICAL) {
              const prevHeight = `${prevPanelSize.height + sizeMouseMoveXY}px`;
              const nextHeight = `${nextPanelSize.height - sizeMouseMoveXY}px`;

              // 자식 Dom resize
              prevPanelinfo.style.height = prevHeight;
              this.domResizing(prevPanelinfo, sizeMouseMoveXY, layout);
              nextPanelinfo.style.height = nextHeight;
              this.domResizing(nextPanelinfo, -sizeMouseMoveXY, layout);

              targetBar.style.top = `${prevPanelSize.height}px`;
              guideLineDom.style.removeProperty('top');
              guideLineDom.style.display = 'none';
              guideLineDom.classList.remove('guideLineBar-vBox');
            }
          };

          const onMouseMove = function onMouseMove(e) {
            const mousePageX = e.pageX;
            const mousePageY = e.pageY;

            if (initialPageX !== mousePageX) {
              if (layout === LAYOUT_HORIZONTAL) {
                resizeMove(initialPageX, mousePageX);
              }
            }

            if (initialPageY !== mousePageY) {
              if (layout === LAYOUT_VERTICAL) {
                resizeMove(initialPageY, mousePageY);
              }
            }

            // self.$emit('onResizeContainer', preResizeContainer, resizer, size);
          };

          const onMouseUp = function onMouseUp(e) {
            const mousePageX = e.pageX;
            const mousePageY = e.pageY;

            if (initialPageX !== mousePageX || initialPageY !== mousePageY) {
              resize(prevResizeContainer, nextResizeContainer);
            }

            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);
          };
          // 마우스 업 이벤트가 끝나지 않는 현상 막기
          const onDrag = function onDrag() {
            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);
            removeEventListener('drag', onDrag);
          };
          addEventListener('drag', onDrag);
          addEventListener('mousemove', onMouseMove);
          addEventListener('mouseup', onMouseUp);
        }
      },
      domLayoutTypeSize(selectDiv, domcliRect, cnt, DomLayout) {
        const domSelect = selectDiv;
        switch (DomLayout) {
          case 'vBox':
            domSelect.style.width = `${domcliRect.width}px`;
            domSelect.style.height = `${domcliRect.height / cnt}px`;
            break;
          case 'hBox':
            domSelect.style.width = `${domcliRect.width / cnt}px`;
            domSelect.style.height = `${domcliRect.height}px`;
            break;
          case 'DockFrame':
            domSelect.style.width = `${domcliRect.width}px`;
            domSelect.style.height = `${domcliRect.height}px`;
            break;
          case 'tab': // tab은 아직 구상이 되지 않음.
          default :
        }
      },
      JsonLoop(json, addId) {
        Object.keys(json).forEach((key) => {
          if (key === 'id') {
            if (json[key] === addId) {
              this.arrayLoop(json[key]);
            }
          }
          if (key === 'content') {
            if (Array.isArray(json[key])) {
              this.arrayLoop(json[key]);
            }
          }
        });
      },
      arrayLoop(array) {
        const arrayObj = array;
        const arraylength = array.length;
        for (let ix = 0; ix <= arraylength - 1; ix++) {
          this.JsonLoop(arrayObj[ix]);
        }
      },
      domResizing(target, splitSize, rootLayout, layout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;
        const parentSize = target.getBoundingClientRect();
        const resizeWidth = parentSize.width; // 부모 넓이
        const resizeHeight = parentSize.height; // 부모 높이
        let isResize = false;

        if (!target.className.match('DockContainer')) {
          for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
            const childDom = targetDom[ix];
            const childSize = childDom.getBoundingClientRect();
            // -3 마우스 무브 이벤트  값 보정처리
            const minWidth = childDom.getAttribute('minWidth') - 3;
            const minHeight = childDom.getAttribute('minHeight') - 3;
            // box에 리사이즈 바 개수
            const splitterCnt = (targetDomLength - 1) / 2;
            // 총 스플릿 사이즈에 dock 개수 많큼 나눔
            const divSize = splitSize / (splitterCnt + 1);
            // root
            if (layout === undefined) {
              childDom.style.width = `${resizeWidth}px`;
              childDom.style.height = `${resizeHeight}px`;
            } else if (!childDom.className.match('resizebar')) {
              if (rootLayout === 'vBox') {
                // 스플릿 상단 부모가 vbox Height만 resize된다.
                // 부모 Dom Layout
                // 자식 스플릿터
                switch (layout) {
                  case 'hBox':
                    if (minHeight < resizeHeight && !isResize) {
                      childDom.style.height = `${resizeHeight}px`;
                    } else {
                     isResize = true;
                    }
                    break;
                  case 'vBox':
                    // N / 1 사이즈
                    if (minHeight < childSize.height + divSize && !isResize) {
                      childDom.style.height = `${childSize.height + divSize}px`;
                    } else {
                      isResize = true;
                    }
                    break;
                  case 'subDockFrame':
                    childDom.style.width = `${resizeWidth}px`;
                    childDom.style.height = `${resizeHeight}px`;
                    break;
                  case 'tab': // tab은 아직 구상이 되지 않음.
                    break;
                  default :
                }
              } else {
                // 스플릿터
                switch (layout) {
                  case 'hBox':
                    if (minWidth < childSize.width + divSize && !isResize) {
                      childDom.style.width = `${childSize.width + divSize}px`;
                    } else {
                     isResize = true;
                    }
                    break;
                  case 'vBox':
                    // N / 1 사이즈
                    // 부모 넓이 따라간다.
                    if (minWidth < resizeWidth && !isResize) {
                      childDom.style.width = `${resizeWidth}px`;
                    } else {
                      isResize = true;
                    }
                    break;
                  case 'subDockFrame':
                    childDom.style.width = `${resizeWidth}px`;
                    childDom.style.height = `${resizeHeight}px`;
                    break;
                  case 'tab': // tab은 아직 구상이 되지 않음.
                    break;
                  default :
                }
              }
            }
            // 스플릿을 통한 사이즈 변경 진행시 컨테이너가 최소 사이즈보다 작아지면 일정 비율 사이즈로
            // 계산해서 반영한다. 큰거에서 작은 박스쪽으로 사이즈를 사용자가 다시 조절해야함.
            if (isResize) {
              this.resizeSetting(target, layout);
            }

            // 자식 dom이 있다면 재귀 호출 실행
            if (childDom.childElementCount !== 0 && !childDom.className.match('DockContainer')) {
              if (childDom.className.match('vBox')) {
                this.domResizing(childDom, splitSize, rootLayout, 'vBox');
              } else if (childDom.className.match('hBox')) {
                this.domResizing(childDom, splitSize, rootLayout, 'hBox');
              } else if (childDom.className.match('subDockFrame')) {
                // sub일때
                this.domResizing(childDom, splitSize, rootLayout, 'subDockFrame');
              }
            }
          }
          isResize = false;
        }
      },
      resizeSetting(target, layout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;

        const parentSize = target.getBoundingClientRect();
        for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
          const childDom = targetDom[ix];

            // box에 리사이즈 바 개수
            const splitterCnt = (targetDomLength - 1) / 2;
            // 리사이즈 총 합계 (  높이 , 넓이 )
            const splitterTotalSize = 4 * splitterCnt;
            // flex 1 로 고정
            const totalFlex = splitterCnt + 1;

            // 스플릿터
            if (!childDom.className.match('resizebar')) {
              const childFlex = 1;
              let parentFlexSzie = 0;
              switch (layout) {
                case 'hBox':
                  parentFlexSzie = parentSize.width - splitterTotalSize;
                  childDom.style.width = this.flexSzie(totalFlex, childFlex, parentFlexSzie);
                  childDom.style.height = `${parentSize.height}px`;
                  break;
                case 'vBox':
                  parentFlexSzie = parentSize.height - splitterTotalSize;
                  childDom.style.width = `${parentSize.width}px`;
                  childDom.style.height = this.flexSzie(totalFlex, childFlex, parentFlexSzie);
                  break;
                case 'subDockFrame':
                  childDom.style.width = `${parentSize.width}px`;
                  childDom.style.height = `${parentSize.height}px`;
                  break;
                case 'tab': // tab은 아직 구상이 되지 않음.
                default :
              }
            }
          // 자식 dom이 있다면 재귀 호출 실행
          if (childDom.childElementCount !== 0 && !childDom.className.match('DockContainer')) {
            if (childDom.className.match('vBox')) {
              this.resizeSetting(childDom, 'vBox');
            } else if (childDom.className.match('hBox')) {
              this.resizeSetting(childDom, 'hBox');
            } else if (childDom.className.match('subDockFrame')) {
              // sub일때
              this.resizeSetting(childDom, 'subDockFrame');
            }
          }
        }
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
    },
  };
</script>

<style >
</style>
