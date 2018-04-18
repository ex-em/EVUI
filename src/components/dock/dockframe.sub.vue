<template>
  <div
    :data-ref="dataRef"
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
    name: 'AddDockSubFrame',
    props: {
      /** *
       *  DockSubFrame 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'DockSubFrame',
      },
      /** *
       *  dockMainFrame ID을 지정한다.
       *
       * */
      dataRef: {
        type: String,
        default() {
          return `evui-sub-dockframe-${this._uid}`;
        },
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
       * DockSubFrame 넓이 설정합니다.
       */
      width: {
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
       * DockSubFrame 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '100',
      },
      /**
       * DockSubFrame 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '100',
      },
      /**
       *  DockSubFrame add Data
       * */
      dockElement: {
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
      /**
       * DockSubFrame add 위치정보
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
       * DockSubFrame adddcok type
       */
      type: {
        type: String,
        default: '',
      },
      /**
       * 도킹 추가 할때 타겟 ID
       */
      insertId: {
        type: Object,
        default: null,
      },
      /**
       * 추가된 도킹 안에 들어가야하는 Frame ID
       */
      addId: {
        type: Object,
        default: null,
      },
    },

    data() {
      return {
        panelWidth: this.width,
        panelHeight: this.height,
        panelFlex: this.flex,
        panelLayout: this.layout,
        isResizing: false,
        panelMinWidth: this.minWidth,
        panelMinHeight: this.minHeight,
        addPos: this.pos,
        addType: this.type,
        addDockList: [],
        vmMainFrame: this.vmMain, // 해당 Dock  Vm 객체 담는다.
      };
    },
    computed: {
      dockclassName() {
        if (this.panelLayout === LAYOUT_HORIZONTAL) {
          return 'evui-dock-container layout-hbox';
        } else if (this.panelLayout === LAYOUT_VERTICAL) {
          return 'evui-dock-container layout-vbox';
        } else if (this.panelLayout === LAYOUT_SUB) {
          return 'subdockframe';
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
          width: `${utils.quantity(this.widthVal).value}px`,
          height: `${utils.quantity(this.heightVal).value}px`,
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
    },
    created() {
    },
    // 컴포넌트 추가 라이프사이클 훅
    activated() {
      const moveDockFrame = this.$el.previousElementSibling;
      if (this.addType === 'root') {
        // 부모 subDock w/h 사이즈 정의
        this.parentDockFrameSize(moveDockFrame);
        // 50% 사이즈 줄인다. 사이즈 값
        if (moveDockFrame.className.match('vbox')) {
          this.dockDomSize(moveDockFrame, 'vBox');
        } else if (moveDockFrame.className.match('hbox')) {
          this.dockDomSize(moveDockFrame, 'hBox');
        } else {
          this.firstDockFrameSize(moveDockFrame);
        }
        // DockFrame 배치 한다.
        this.insertRootDockFrame(moveDockFrame);
        // 최소 넓이 높이 데이타 셋팅
        this.setRootDockFrameMinSize();
        // DataMap Push
        this.addDataMapCrt();
        // id가 같으면 제일 첫 도킹 시도
      } else if (this.addId.dataRef === this.insertId.dataRef) {
        // 50% 사이즈를 줄인다.
        this.innerFirstDockFrameSize();
        // DockFrame 배치 한다.
        this.insertRootDockFrame(moveDockFrame);
        // 최소 넓이 높이 데이타 셋팅
        this.setRootDockFrameMinSize();
        // DataMpa 구성
        this.addDataMapCrt();
      } else {
        // DockFrame 배치 한다.
        this.insertDockFrame(this.insertId.$el);
        // 소수점 사이즈 날린다.
        this.dockFrameSizeRound();
        // 최소 넓이 높이 데이타 셋팅
        this.setDockFrameMinSize();
        // DataMpa 구성
        this.addInnerDataMapCrt();
      }
    },
    methods: {
      dockFrameSizeRound() {
        const prevDom = this.$el.children[0];
        const nextDom = this.$el.children[2];
        if (this.layout === 'vBox') {
          prevDom.style.height = `${Math.ceil(prevDom.getBoundingClientRect().height)}px`;
          nextDom.style.height = `${Math.floor(nextDom.getBoundingClientRect().height)}px`;
        } else {
          prevDom.style.width = `${Math.ceil(prevDom.getBoundingClientRect().width)}px`;
          nextDom.style.width = `${Math.floor(nextDom.getBoundingClientRect().width)}px`;
        }
        const debugerSize = prevDom.getBoundingClientRect();
        const debugerSize2 = nextDom.getBoundingClientRect();
        const pDebugerSize2 = this.$el.getBoundingClientRect();
        if (this.layout === 'hbox') {
          if (debugerSize.widht + debugerSize2.widht > pDebugerSize2.width) {
            debugger;
          }
        }
      },
      setDockFrameMinSize() {
        // subDockFrame 필요
        const parentDockFrame = this.$el;
        const childLength = parentDockFrame.childElementCount;
        const boxSize = [0];
        let sumMinWidth = 0;
        let sumMinHeight = 0;
        for (let ix = 0, ixlen = childLength; ix < ixlen; ix++) {
          const childDock = parentDockFrame.children[ix];
          if (childDock.getAttribute('minWidth') !== null && childDock.getAttribute('minHeight') !== null) {
            if (this.layout === 'hBox') {
              sumMinWidth += parseInt(childDock.getAttribute('minWidth'), 10);
              boxSize.push(parseInt(childDock.getAttribute('minHeight'), 10));
            } else {
              boxSize.push(parseInt(childDock.getAttribute('minWidth'), 10));
              sumMinHeight += parseInt(childDock.getAttribute('minHeight'), 10);
            }
          }
        }
        // max 값을 가져온다.
        const MaxSize = boxSize.reduce((prevvious, current) =>
          (prevvious >= current ? prevvious : current));
        if (this.layout === 'hBox') {
          parentDockFrame.setAttribute('minwidth', sumMinWidth);
          parentDockFrame.setAttribute('minheight', MaxSize);
        } else {
          parentDockFrame.setAttribute('minwidth', MaxSize);
          parentDockFrame.setAttribute('minheight', sumMinHeight);
        }
         this.serachParentNodeDomSetminSize();
      },
      serachParentNodeDomSetminSize(pDomElement) {
        let parentNodeDockFrame;
        const boxSize = [0];
        if (pDomElement !== undefined) {
          parentNodeDockFrame = pDomElement.parentElement;
        } else {
          parentNodeDockFrame = this.$el.parentElement;
        }
        let sumMinWidth = 0;
        let sumMinHeight = 0;
        const childNodeLength = parentNodeDockFrame.childElementCount;
        for (let ix = 0, ixlen = childNodeLength; ix < ixlen; ix++) {
          const childDock = parentNodeDockFrame.children[ix];
          if (childDock.getAttribute('minWidth') !== null && childDock.getAttribute('minHeight') !== null) {
            if (parentNodeDockFrame.className.match('hbox')) {
              sumMinWidth += parseInt(childDock.getAttribute('minWidth'), 10);
              boxSize.push(parseInt(childDock.getAttribute('minHeight'), 10));
            } else {
              boxSize.push(parseInt(childDock.getAttribute('minWidth'), 10));
              sumMinHeight += parseInt(childDock.getAttribute('minHeight'), 10);
            }
          }
        }
        // max 값을 가져온다.
        const MaxSize = boxSize.reduce((prevvious, current) =>
          (prevvious >= current ? prevvious : current));
        if (parentNodeDockFrame.className.match('hbox')) {
          parentNodeDockFrame.setAttribute('minwidth', sumMinWidth);
          parentNodeDockFrame.setAttribute('minheight', MaxSize);
        } else {
          parentNodeDockFrame.setAttribute('minwidth', MaxSize);
          parentNodeDockFrame.setAttribute('minheight', sumMinHeight);
        }
        // root 나올때까지 타고 올라간다.
        if (!parentNodeDockFrame.parentElement.className.match('root')) {
          this.serachParentNodeDomSetminSize(parentNodeDockFrame);
        }
      },
      setRootDockFrameMinSize() {
        // subDockFrame 필요
        const parentDockFrame = this.$el;
        const childLength = parentDockFrame.childElementCount;
        const boxSize = [0];
        let sumMinWidth = 0;
        let sumMinHeight = 0;
        for (let ix = 0, ixlen = childLength; ix < ixlen; ix++) {
          const childDock = parentDockFrame.children[ix];
          if (childDock.getAttribute('minWidth') !== null && childDock.getAttribute('minHeight') !== null) {
            if (this.layout === 'hBox') {
               sumMinWidth += parseInt(childDock.getAttribute('minWidth'), 10);
               boxSize.push(parseInt(childDock.getAttribute('minHeight'), 10));
            } else {
               boxSize.push(parseInt(childDock.getAttribute('minWidth'), 10));
               sumMinHeight += parseInt(childDock.getAttribute('minHeight'), 10);
            }
          }
        }
        // max 값을 가져온다.
        const MaxSize = boxSize.reduce((prevvious, current) =>
          (prevvious >= current ? prevvious : current));
         if (this.layout === 'hBox') {
           parentDockFrame.setAttribute('minwidth', sumMinWidth);
           parentDockFrame.setAttribute('minheight', MaxSize);
         } else {
           parentDockFrame.setAttribute('minwidth', MaxSize);
           parentDockFrame.setAttribute('minheight', sumMinHeight);
         }
      },
      addInnerDataMapCrt() {
        // 데이타 맵을 구성 한다.
        const subDockFrameEl = this.$el;
        const subDockFrameElLength = subDockFrameEl.childElementCount;
        const parentId = subDockFrameEl.getAttribute('data-ref');
        const parentLayout = subDockFrameEl.className.match('hbox') ? 'hBox' : 'vBox';
        const subDock = {};

        subDock.pid = this.$el.parentElement.getAttribute('data-ref');
        subDock.id = parentId;
        subDock.width = subDockFrameEl.style.width;
        subDock.height = subDockFrameEl.style.height;
        subDock.layout = parentLayout;
        subDock.minwidth = subDockFrameEl.getAttribute('minwidth');
        subDock.minheight = subDockFrameEl.getAttribute('minheight');
        this.vmMainFrame.dockDataMap.push(subDock);
        this.addInnerChildDataMap(subDockFrameEl, subDockFrameElLength, parentId, parentLayout);
      },
      innerFirstDockFrameSize() {
        // this.$el.style.width = this.vmMainFrame.$el.style.width;
        // this.$el.style.height = this.vmMainFrame.$el.style.height;
        const childIndex = this.addPos === 'left' || this.addPos === 'top' ? 0 : 1;
        this.addId.$el.style.width = this.$el.children[childIndex].style.width;
        this.addId.$el.style.height = this.$el.children[childIndex].style.height;
      },
      // inner ID 연결고리변경
      nodeDataDelete(id) {
        const arrayDataMap = this.vmMainFrame.dockDataMap;
        for (let ix = 0; ix < arrayDataMap.length; ix++) {
          const dataMap = arrayDataMap[ix];
          if (dataMap.id === id) {
            arrayDataMap.splice(ix, 1);
          }
        }
      },
      // root ID 연결고리변경
      rootNodeconnect(parentId) {
       const arrayDataMap = this.vmMainFrame.dockDataMap;
       for (let ix = 0; ix < arrayDataMap.length; ix++) {
          const dataMap = arrayDataMap[ix];
          if (dataMap.pid === 'root') {
            dataMap.pid = parentId;
          }
       }
      },
      addDataMapCrt() {
        // 데이타 맵을 구성 한다.
        // this.vmMainFrame.push
        const subDockFrameEl = this.$el;
        const subDockFrameElLength = subDockFrameEl.childElementCount;
        const parentId = subDockFrameEl.getAttribute('data-ref');
        const parentLayout = subDockFrameEl.className.match('hbox') ? 'hBox' : 'vBox';
        const subDock = {};
        // 제일 처음은 전부 집어 넣는다.
        if (this.vmMainFrame.dockDataMap.length === 1) {
            subDock.pid = 'root';
            subDock.id = parentId;
            subDock.width = subDockFrameEl.style.width;
            subDock.height = subDockFrameEl.style.height;
            subDock.layout = parentLayout;
            subDock.minwidth = subDockFrameEl.getAttribute('minwidth');
            subDock.minheight = subDockFrameEl.getAttribute('minheight');
            this.vmMainFrame.dockDataMap.push(subDock);
            this.addChildDataMap(subDockFrameEl, subDockFrameElLength, parentId, parentLayout);
        } else {
          // 부모가 변경되어 연결고리 변경
          this.rootNodeconnect(parentId);
          subDock.pid = 'root';
          subDock.id = parentId;
          subDock.width = subDockFrameEl.style.width;
          subDock.height = subDockFrameEl.style.height;
          subDock.layout = parentLayout;
          subDock.minwidth = subDockFrameEl.getAttribute('minwidth');
          subDock.minheight = subDockFrameEl.getAttribute('minheight');
          this.vmMainFrame.dockDataMap.push(subDock);
          this.addChildDataMap(subDockFrameEl, subDockFrameElLength, parentId, parentLayout);
        }
      },
      addInnerChildDataMap(subDockFrameEl, subDockFrameElLength, parentId, parentLayout) {
        for (let ix = 0; ix < subDockFrameElLength; ix++) {
          const childDom = subDockFrameEl.children[ix];
          const subDock = {};
          subDock.pid = parentId;
          subDock.id = childDom.getAttribute('data-ref');
          subDock.width = childDom.style.width;
          subDock.height = childDom.style.height;
          subDock.layout = parentLayout;
          subDock.minwidth = childDom.getAttribute('minwidth');
          subDock.minheight = childDom.getAttribute('minheight');
          // this.vmMainFrame.dockDataMap.push(subDock);
          // subdock가 두개 생기는 시점부터 중복 된 노드 값은 추가하지 않는다.
            if (this.pos === 'right' || this.pos === 'bottom') {
              if (ix === 0) {
                this.nodeDataDelete(childDom.getAttribute('data-ref'));
              }
            } else if (ix === 2) {
              this.nodeDataDelete(childDom.getAttribute('date-ref'));
            }
          this.vmMainFrame.dockDataMap.push(subDock);
        }
      },
      addChildDataMap(subDockFrameEl, subDockFrameElLength, parentId, parentLayout) {
        for (let ix = 0; ix < subDockFrameElLength; ix++) {
          const childDom = subDockFrameEl.children[ix];
          const subDock = {};
          subDock.pid = parentId;
          subDock.id = childDom.getAttribute('data-ref');
          subDock.width = childDom.style.width;
          subDock.height = childDom.style.height;
          subDock.layout = parentLayout;
          subDock.minwidth = childDom.getAttribute('minwidth');
          subDock.minheight = childDom.getAttribute('minheight');
          // subdock가 두개 생기는 시점부터 중복 된 노드 값은 추가하지 않는다.
          if (this.vmMainFrame.dockDataMap.length > 2) {
            if (this.pos === 'right' || this.pos === 'bottom') {
              if (ix !== 0) {
                this.vmMainFrame.dockDataMap.push(subDock);
              }
            } else if (ix !== 2) {
              this.vmMainFrame.dockDataMap.push(subDock);
            }
          } else {
            this.vmMainFrame.dockDataMap.push(subDock);
          }
        }
      },
      insertRootDockFrame(targetEl) {
        if (this.addPos !== '') {
          switch (this.addPos) {
            case 'left':
              // 이진트리 하부 3개.
              this.$el.appendChild(targetEl);
               break;
            case 'right':
              this.$el.insertBefore(targetEl, this.$el.childNodes[0]);
              break;
            case 'top':
              this.$el.appendChild(targetEl);
              break;
            case 'bottom': // tab은 아직 구상이 되지 않음.
              this.$el.insertBefore(targetEl, this.$el.childNodes[0]);
              break;
            default :
          }
        }
      },
      insertDockFrame(targetEl) {
        if (this.addPos !== '') {
          switch (this.addPos) {
            case 'left':
              // 이진트리 하부 3개.
              this.$el.appendChild(this.addId.$el);
              // 0번째 자식이 어떤 Dom인지에 따라 dom 이동이 달라진다.
              if (targetEl.children[0].dataset.ref.match('dockframe')) {
                targetEl.appendChild(this.$el);
              } else {
                targetEl.insertBefore(this.$el, targetEl.childNodes[0]);
              }
              break;
            case 'right':
              // 이진트리 하부 3개.
              this.$el.insertBefore(this.addId.$el, this.$el.childNodes[0]);
              // 0번째 자식이 어떤 Dom인지에 따라 dom 이동이 달라진다.
              if (targetEl.children[0].dataset.ref.match('dockframe')) {
                targetEl.appendChild(this.$el);
              } else {
                targetEl.insertBefore(this.$el, targetEl.childNodes[0]);
              }
              break;
            case 'top':
              this.$el.appendChild(this.addId.$el);
              // 0번째 자식이 어떤 Dom인지에 따라 dom 이동이 달라진다.
              if (targetEl.children[0].dataset.ref.match('dockframe')) {
                targetEl.appendChild(this.$el);
              } else {
                targetEl.insertBefore(this.$el, targetEl.childNodes[0]);
              }
              break;
            case 'bottom':
              this.$el.insertBefore(this.addId.$el, this.$el.childNodes[0]);
              // 0번째 자식이 어떤 Dom인지에 따라 dom 이동이 달라진다.
              if (targetEl.children[0].dataset.ref.match('dockframe')) {
                targetEl.appendChild(this.$el);
              } else {
                targetEl.insertBefore(this.$el, targetEl.childNodes[0]);
              }
              break;
            case 'tab':// tab은 아직 구상이 되지 않음.
              break;
            default :
          }
        }
      },
      firstDockFrameSize(targetEl) {
        if (this.addPos !== '') {
          const dockEl = targetEl;
          const dockframeSize = dockEl.getBoundingClientRect();
          dockEl.style.width = `${dockframeSize.width}px`;
          dockEl.style.height = `${dockframeSize.height}px`;
        }
      },
      parentDockFrameSize(targetEl) {
        // 재귀 돌리기전 부모 사이즈 변경
        const dockEl = targetEl;
        const dockframeSize = targetEl.getBoundingClientRect();
        switch (this.layout) {
          case 'hBox':
            dockEl.style.width = `${(dockframeSize.width / 2) - 2}px`;
            dockEl.style.height = `${dockframeSize.height}px`;
            break;
          case 'vBox':
            dockEl.style.width = `${dockframeSize.width}px`;
            dockEl.style.height = `${(dockframeSize.height / 2) - 2}px`;
            break;
          case 'tab': // tab은 아직 구상이 되지 않음.
            break;
          default :
        }
      },
      // 이동되는 Dom 객체 사이즈 반 줄이기
      dockDomSize(targetEl, layout) {
        const dockEl = targetEl;
        const parentDockEl = dockEl.getBoundingClientRect();
        // 자식 subDockframe 레이아웃
        const subLayout = layout;
        // DockContainer 밑에는 자식 DockContainer이 생기지 않음.
        if (!dockEl.className.match('dockcontainer')) {
          const targetDom = dockEl.children;
          const targetDomLength = targetDom.length;
        for (let ix = 0, ixlen = targetDomLength; ix < ixlen; ix++) {
          const childDom = targetDom[ix];
          const childDomSize = childDom.getBoundingClientRect();
          let childRatioWidth;
          let childRatioHeight;
          if (!childDom.className.match('resizebar')) {
            // 부모 레이아웃에 따라 계산 달라진다.
            if (this.layout === 'vBox') {
              childRatioWidth = ((childDomSize.width / (parentDockEl.width))
                * parentDockEl.width);
                childRatioHeight = ((childDomSize.height / ((parentDockEl.height) * 2))
                  * parentDockEl.height);
              // 높이만 절반 줄어든다
              switch (subLayout) {
                case 'hBox':
                  // DockFrame 부모 넓이에서 절반 한다 이진트리 각 노드 Dock 2개 고정
                  // - 2처리 하지않음
                    if (ix === 0) {
                      childRatioWidth = Math.ceil(childRatioWidth);
                    } else {
                      childRatioWidth = this.parentDefSize(targetEl, targetDom[0], 'w');
                    }
                    childDom.style.width = `${childRatioWidth}px`;
                  // ix === 0 ? `${Math.ceil(childRatioWidth)}px` :
                  // `${Math.ceil(childRatioWidth)}px`;
                  //   if (ix === 0) {
                  //     childRatioHeight = Math.ceil(parentDockEl.height);
                  //   } else {
                  //     childRatioHeight = this.parentDefSize(targetEl, targetDom[0], 'h');
                  //   }
                    childDom.style.height = `${parentDockEl.height}px`;
                  // ix === 0 ? `${(Math.ceil(parentDockEl.height))}px` :
                  // `${Math.ceil(parentDockEl.height)}px`;
                  // childDom.style.width = `${((parentDockEl.width / 2) - 2)}px`;
                  // childDom.style.height = `${(parentDockEl.height)}px`;
                  break;
                case 'vBox':
                  // 부모가 vbox이면 높이 반절 나눈다. 이진트리 Dom 2개
                  //   if (ix === 0) {
                  //     childRatioWidth = Math.ceil(parentDockEl.width);
                  //   } else {
                  //     childRatioWidth = this.parentDefSize(targetEl, targetDom[0], 'w');
                  //   }
                    childDom.style.width = `${parentDockEl.width}px`;
                  // ix === 0 ? `${Math.ceil(parentDockEl.width)}px` :
                    // `${Math.ceil(parentDockEl.width)}px`;

                    if (ix === 0) {
                      childRatioHeight = Math.ceil(childRatioHeight);
                    } else {
                      childRatioHeight = this.parentDefSize(targetEl, targetDom[0], 'h');
                    }
                    childDom.style.height = `${childRatioHeight}px`;
                  // ix === 0 ? `${(Math.ceil(childRatioHeight) - 2)}px` :
                  // `${Math.ceil(childRatioHeight) - 2}px`;

                  // childDom.style.width = `${parentDockEl.width}px`;
                  // childDom.style.height = `${(parentDockEl.height / 2) - 2}px`;
                  break;
                case 'tab': // tab은 아직 구상이 되지 않음.
                  break;
                default :
              }
            } else {
                childRatioWidth = ((childDomSize.width / ((parentDockEl.width) * 2))
                  * parentDockEl.width);
              childRatioHeight = ((childDomSize.height / (parentDockEl.height))
                * parentDockEl.height);
              // 넓이만 절반 줄어든다.
              switch (subLayout) {
                case 'hBox':
                  // childDom.style.width = `${(parentDockEl.width / 2) - 2}px`;
                  // childDom.style.height = `${parentDockEl.height}px`;
                    if (ix === 0) {
                      childRatioWidth = Math.ceil(childRatioWidth);
                    } else {
                      // 자식 넓이 합이 부모 넓이로 값을 보정한다.
                      childRatioWidth = this.parentDefSize(targetEl, targetDom[0], 'w');
                    }
                    childDom.style.width = `${childRatioWidth}px`;
                  // ix === 0 ? `${Math.ceil(childRatioWidth) - 2}px` :
                  // `${Math.ceil(childRatioWidth) - 2}px`;
                  //   if (ix === 0) {
                  //     childRatioHeight = Math.ceil(parentDockEl.height);
                  //   } else {
                  //     childRatioHeight = this.parentDefSize(targetEl, targetDom[0], 'h');
                  //   }
                    childDom.style.height = `${parentDockEl.height}px`;
                  // ix === 0 ? `${(Math.ceil(parentDockEl.height))}px` :
                  // `${Math.ceil(parentDockEl.height)}px`;
                  break;
                case 'vBox':
                  // childDom.style.width = `${(parentDockEl.width)}px`;
                  // childDom.style.height = `${(parentDockEl.height / 2) - 2}px`;
                  //   if (ix === 0) {
                  //     childRatioWidth = Math.ceil(parentDockEl.width);
                  //   } else {
                  //     childRatioWidth = this.parentDefSize(targetEl, targetDom[0], 'w');
                  //   }
                    childDom.style.width = `${parentDockEl.width}px`;
                  // ix === 0 ? `${Math.ceil(parentDockEl.width)}px` :
                    // `${Math.ceil(parentDockEl.width)}px`;
                    if (ix === 0) {
                      childRatioHeight = Math.ceil(childRatioHeight);
                    } else {
                      childRatioHeight = this.parentDefSize(targetEl, targetDom[0], 'h');
                    }
                    childDom.style.height = `${childRatioHeight}px`;
                  // ix === 0 ? `${(Math.ceil(childRatioHeight))}px` :
                  // `${Math.floor(childRatioHeight)}px`;
                  break;
                case 'tab': // tab은 아직 구상이 되지 않음.
                  break;
                default :
              }
            }
            // 자식 dom이 있다면 재귀 호출 실행
            if (childDom.childElementCount !== 0 && !childDom.className.match('dockcontainer')) {
              if (childDom.className.match('vbox')) {
                this.dockDomSize(childDom, 'vBox', false);
              } else if (childDom.className.match('hbox')) {
                this.dockDomSize(childDom, 'hBox', false);
              }
            }
          }
        }
      }
      },
      parentDefSize(parentDom, childDom, type) {
        const parentDomSize = parentDom.getBoundingClientRect();
        const childDomSize = childDom.getBoundingClientRect();
        let resultSize;
        const resizebarSize = 4;
        if (type === 'w') {
          resultSize = parentDomSize.width - childDomSize.width;
        } else {
          resultSize = parentDomSize.height - childDomSize.height;
        }
        return resultSize - resizebarSize;
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
