<template>
  <div
    ref="dockMainFrameRoot"
    :class="classNames"
    :style="userSelectStyle"
    @mousedown="onMouseDown"
  >
    <slot/>
    <div
      ref="guidLine"
      style="display:none;"
      class="guidLine"
    />
  </div>
</template>

<script>
  // import _ from 'lodash';
  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';

  export default {

    name: 'DockMainFrame',
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
       * dockMainFrame 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * dockMainFrame 최대넓이 설정합니다.
       */
      maxWidth: {
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
       * dockMainFrame 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * dockMainFrame 최대높이 설정합니다.
       */
      maxHeight: {
        type: [String, Number],
        default: '100%',
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
        panelMinWidth: this.minWidth,
        panelMaxWidth: this.maxWidth,
        panelMinHeight: this.minHeight,
        panelMaxHeight: this.maxHeight,
        panelLayout: this.layout,
      };
    },

    computed: {
      classNames() {
        return [
          'evui-dockFrame-root',
        ];
      },
      userSelectStyle() {
        const wrapperObj = typeof this.wrapperStyles === 'object' ? this.wrapperStyles : null;
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
    },
    mounted() {
        const DataObj = this.dockDataSet;
        if (DataObj.content !== undefined) {
         DataObj.id = 'dockMainFrameRoot';
         this.BFTData(DataObj);
        } else {
          this.childDomSize(this.$el);
        }
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
        if (resizer.className && resizer.className.match('resizebar')) {
          // if (event.preventDefault) {
          //   event.preventDefault();
          // }

          const self = this;
          const layout = resizer.parentNode.className.match('vBox') !== null ? 'vBox' : 'hBox';
          const parentOffsetLeft = self.$el.offsetLeft;
          const parentOffsetTop = self.$el.offsetTop;
          const targetBar = resizer;
          const preResizeContainer = resizer.previousElementSibling;
          const nextResizeContainer = resizer.nextElementSibling;

          const guidLineDom = this.$refs.guidLine;

          const { addEventListener, removeEventListener } = resizer;

          // 좌우측 늘어난 수 많큼 높이 넓이 반환
          let mouseMoveXY = null;


          const resizeMove = (downEventPageXY, moveEventPageXY) => {
            if (layout === LAYOUT_HORIZONTAL) {
              mouseMoveXY = moveEventPageXY - downEventPageXY;

              // 가이드라인바
              guidLineDom.style.left = `${moveEventPageXY - parentOffsetLeft}px`;
              guidLineDom.style.top = '0px';
              guidLineDom.classList.add('guidLineBar-hBox');
              guidLineDom.style.display = 'block';
            }
            if (layout === LAYOUT_VERTICAL) {
               mouseMoveXY = moveEventPageXY - downEventPageXY;

              // 가이드라인바
              guidLineDom.style.top = `${moveEventPageXY - parentOffsetTop}px`;
              guidLineDom.style.left = 'auto';
              guidLineDom.classList.add('guidLineBar-vBox');
              guidLineDom.style.display = 'block';
            }
          };

          // 리사이즈 함수 생성
          const resize = (preInitial, nextInitial) => {
            const prePanelSize = preInitial.getBoundingClientRect();
            const nextPanelSize = nextInitial.getBoundingClientRect();
            const prePanelinfo = preInitial;
            const nextPanelinfo = nextInitial;
            if (layout === LAYOUT_HORIZONTAL) {
              const preWidth = `${prePanelSize.width + mouseMoveXY}px`;
              const nextWidth = `${nextPanelSize.width - mouseMoveXY}px`;
              prePanelinfo.style.width = preWidth;
              nextPanelinfo.style.width = nextWidth;

              // 자식 Dom resize
              this.domResizing(prePanelinfo, mouseMoveXY, layout);
              this.domResizing(nextPanelinfo, -mouseMoveXY, layout);

              targetBar.style.left = `${preWidth}`;
              guidLineDom.style.removeProperty('left');
              guidLineDom.style.display = 'none';
              guidLineDom.classList.remove('guidLineBar-hBox');
            }
            if (layout === LAYOUT_VERTICAL) {
              const preHeight = `${prePanelSize.height + mouseMoveXY}px`;
              const nextHeight = `${nextPanelSize.height - mouseMoveXY}px`;
              prePanelinfo.style.height = preHeight;
              nextPanelinfo.style.height = nextHeight;

              // 자식 Dom resize
              this.domResizing(prePanelinfo, mouseMoveXY, layout);
              this.domResizing(nextPanelinfo, -mouseMoveXY, layout);

              targetBar.style.top = `${prePanelSize.height}px`;
              guidLineDom.style.removeProperty('top');
              guidLineDom.style.display = 'none';
              guidLineDom.classList.remove('guidLineBar-vBox');
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
              resize(preResizeContainer, nextResizeContainer);
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
      domEleDiv(layoutType, childId, parentLayout, parentId, childCnt) {
        const subDiv = document.createElement('div');
        const subClassName = this.layoutTypeSubBoxClass(layoutType);
        let parentDomSize = null;
        let DomLayout = null;
       if (parentId === 'dockMainFrameRoot') {
           parentDomSize = this.$refs.dockMainFrameRoot.getBoundingClientRect();
           DomLayout = this.layout;
       } else {
          parentDomSize = document.getElementById(parentId).getBoundingClientRect();
          DomLayout = parentLayout;
       }
        // 높이 넓이가 50px 이하면 null 처리
        if (parentDomSize.width < 50 || parentDomSize.height < 50) {
         return null;
        }
       this.domLayoutTypeSize(subDiv, parentDomSize, childCnt, DomLayout);
        subDiv.setAttribute('id', childId);
        subDiv.className = subClassName;
        return subDiv;
        // node.appendChild(textnode);
        // document.getElementById("myList").appendChild(node);
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
          case 'DockForm':
            domSelect.style.width = `${domcliRect.width}px`;
            domSelect.style.height = `${domcliRect.height}px`;
            break;
          case 'tab': // tab은 아직 구상이 되지 않음.
          default :
        }
      },
      leafDomDiv(subDiv, childId) {
        const leafdiv = document.createElement('div');
        const subClassName = 'DockContainer';
        const DockId = `${childId}_DockContainer`;
        const parentDomSize = subDiv.getBoundingClientRect();

        // 부모 layout 따른다
        leafdiv.style.width = `${parentDomSize.width - 1}px`;
        leafdiv.style.height = `${parentDomSize.height - 1}px`;


        leafdiv.setAttribute('id', DockId);
        leafdiv.className = subClassName;
        return leafdiv;
        // node.appendChild(textnode);
        // document.getElementById("myList").appendChild(node);
      },
      BFTData(json) {
        const self = this;
        const queue = [];
        queue.push(json);
        while (queue.length !== 0) {
          let parentJsonData = null;
          parentJsonData = queue[0];
          Object.keys(parentJsonData).forEach((key) => {
            // 배열인지 확인
            if (key === 'content') {
              if (Array.isArray(parentJsonData[key])) {
                const arrayObj = parentJsonData[key];
                const arraylength = parentJsonData[key].length;
                // div 생성
                for (let ix = 0; ix <= arraylength - 1; ix++) {
                  // content 배열 div create 작업실행
                  // root container에 vBox hBox인지 prop 값을 할당
                 if (parentJsonData.id === 'dockMainFrameRoot') {
                   self.panelLayout = parentJsonData.layout;
                 }

                  // layout type, 자식 ID, 부모 ID, div 박스
                  const subDiv = this.domEleDiv(arrayObj[ix].layout,
                  arrayObj[ix].id, parentJsonData.layout, parentJsonData.id, arraylength);
                  subDiv.style.backgroundColor = arrayObj[ix].bgcolor;
                  let leafDiv = null;


                  this.layoutAppendDom(subDiv, leafDiv, parentJsonData.id);

                  if (arrayObj[ix].layout === 'DockForm' || arrayObj[ix].layout === 'Tab') {
                    // layout이 DockForm or tab 이면 제일 하위 Leaf div 하나 더 생성한다.
                    leafDiv = this.leafDomDiv(subDiv, arrayObj[ix].id);
                    if (leafDiv !== null && leafDiv !== undefined) {
                      subDiv.appendChild(leafDiv);
                    }
                  }

                  if (arrayObj[ix].content !== undefined) {
                    // 부모 id를 넣어서 큐에 담는다.7
                    arrayObj[ix].pid = parentJsonData.id;
                    queue.push(arrayObj[ix]);
                    // for (let i = 0; i <= arrayObj[ix].content.length - 1; i++) {
                    //   queue.push(arrayObj[ix].content[0]);
                    // }
                  }
                }
                queue.shift();
              }
            }
          });
    }
   },
    layoutAppendDom(subDiv, leafDiv, pId) {
      if (pId === 'dockMainFrameRoot') {
        this.$refs.dockMainFrameRoot.appendChild(subDiv);
      } else {
        const parentDomObj = document.getElementById(pId);
        parentDomObj.appendChild(subDiv);
      }
    },
    layoutTypeSubBoxClass(layoutType) {
      switch (layoutType) {
        case 'vBox':
          return 'evui-Dock-container layout-vBox';
        case 'hBox':
          return 'evui-Dock-container layout-hBox';
        case 'DockForm':
          return 'subDockFrame';
        case 'tab': // tab은 아직 구상이 되지 않음.
          return '';
        default :
            return null;
      }
    },
    JsonLoop(json, addId) {
      Object.keys(json).forEach((key) => {
//          this[key] = json[key];

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
    addDockFrame(pId, layout, id) {
      const parentSelectDom = document.getElementById(pId).parentElement;
      const selectDom = document.getElementById(pId);
      const selectDomSize = selectDom.getBoundingClientRect();
      // 높이 넓이가 50px 이하면 null 처리
      if (selectDomSize.width < 50 || selectDomSize.height < 50) {
        return null;
      }
      // div create
      const subDiv = document.createElement('div');
      subDiv.id = id;
      subDiv.className = `evui-Dock-container layout-${layout}`;
      subDiv.style.width = `${selectDomSize.width}px`;
      subDiv.style.height = `${selectDomSize.height}px`;

      parentSelectDom.appendChild(subDiv);

      // Dom 이동 시킨다
      const addDom = document.getElementById(id);
      addDom.appendChild(selectDom);
      // dockContainer
      this.domLayoutTypeSize(selectDom.children[0], selectDomSize, 2, layout);
      // subdock
      this.domLayoutTypeSize(selectDom, selectDomSize, 2, layout);


      const cln = selectDom.cloneNode(true);
      addDom.appendChild(cln);
      cln.id = `${id}_sub`;
      cln.children[0].id = `${id}_DockContainer`;

      return 0;
        // this.nodeSearch(AddObj, pId);
    },
    childDomSize(target, layout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;

        const parentSize = target.getBoundingClientRect();
        const totalFlex = this.totalFlex(target);

        for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
          const childDom = targetDom[ix];

          // root
          if (layout === undefined && !childDom.className.match('guidLine')) {
            childDom.style.width = `${parentSize.width}px`;
            childDom.style.height = `${parentSize.height}px`;
          } else {
            // box에 리사이즈 바 개수
            const splitterCnt = (targetDomLength - 1) / 2;
            // 리사이즈 총 합계 (  높이 , 넓이 )
            const splitterTotalSize = 4 * splitterCnt;
            // 부모 Dom Layout

            // 스플릿터
            if (childDom.className.match('resizebar')) {
              if (layout === 'vBox') {
                childDom.style.width = '100%';
                childDom.style.height = '4px';
              } else if (layout === 'hBox') {
                childDom.style.width = '4px';
                childDom.style.height = '100%';
              }
            } else {
              const childFlex = childDom.getAttribute('flex') || 1;
              let parentFlexSzie = 0;
              switch (layout) {
                case 'hBox':
//       childDom.style.width = `${(parentSize.width - splitterTotalSize) / (splitterCnt + 1)}px`;
                  parentFlexSzie = parentSize.width - splitterTotalSize;
                  childDom.style.width = this.flexSzie(totalFlex, childFlex, parentFlexSzie);
                  childDom.style.height = `${parentSize.height}px`;
                  break;
                case 'vBox':
                  parentFlexSzie = parentSize.height - splitterTotalSize;
                  childDom.style.width = `${parentSize.width}px`;
                  childDom.style.height = this.flexSzie(totalFlex, childFlex, parentFlexSzie);
//       childDom.style.height = `${(parentSize.height - splitterTotalSize) / (splitterCnt + 1)}px`;
                  break;
                case 'subDockFrame':
                  childDom.style.width = `${parentSize.width}px`;
                  childDom.style.height = `${parentSize.height}px`;
                  break;
                case 'tab': // tab은 아직 구상이 되지 않음.
                default :
              }
            }
          }


          // 자식 dom이 있다면 재귀 호출 실행
          if (childDom.childElementCount !== 0 && !childDom.className.match('DockContainer')) {
            if (childDom.className.match('vBox')) {
              this.childDomSize(childDom, 'vBox');
            } else if (childDom.className.match('hBox')) {
              this.childDomSize(childDom, 'hBox');
            } else if (childDom.className.match('subDockFrame')) {
              // sub일때
              this.childDomSize(childDom, 'subDockFrame');
            }
          }
        }
      },
      totalFlex(domNode) {
        const selectDom = domNode.children;
        const childrenArray = Array.from(selectDom);
        let totalFlex = 0;
        childrenArray.forEach(
          (currentValue) => {
            // (currentValue, currentIndex, listObj) => {
            // flex 값이 안들어가는 dom은 제외
            if (!currentValue.className.match('resizebar') && !currentValue.className.match('guidLine')) {
              const flexValue = currentValue.getAttribute('flex') || 1;
              totalFlex += parseInt(flexValue, 10);
            }
          });
        return totalFlex;
      },
      flexSzie(totalFlex, flex, parentSize) {
        const flexSizeRatio = parentSize / totalFlex;
        return `${flexSizeRatio * flex}px`;
//             switch (layout) {
//               case 'hBox':
//                 return flexSizeRatio * flex;
//               case 'vBox':
//                 return flexSizeRatio * flex;
//             case 'tab': // tab은 아직 구상이 되지 않음.
//               default : return null;
//             }
      },
      domResizing(target, splitSize, rootLayout, layout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;
        const parentSize = target.getBoundingClientRect();
        const resizeWidth = parentSize.width;
        const resizeHeight = parentSize.height;


        for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
          const childDom = targetDom[ix];
          const childSize = childDom.getBoundingClientRect();
            // box에 리사이즈 바 개수
          const splitterCnt = (targetDomLength - 1) / 2;
          // 총 스플릿 사이즈에 dock 개수 많큼 나눔
          const divSize = splitSize / (splitterCnt + 1);
          // root
          if (layout === undefined && !childDom.className.match('guidLine')
              && !childDom.className.match('container-title')) {
            childDom.style.width = `${resizeWidth}px`;
            childDom.style.height = `${resizeHeight}px`;
          } else if (childDom.className.match('vBox') ||
            childDom.className.match('hBox') || childDom.className.match('subDockFrame')
            || childDom.className.match('DockContainer')) {
            // getBoundingClientRect 사용시 부모 div가 미리 작아지면 실제 사이즈도 작게 나옴
            let chilDomWdith = 0;
            let chilDomHeight = 0;

            if (splitSize > 0) {
              chilDomHeight = childSize.height + splitSize;
              chilDomWdith = childSize.width + splitSize;
            } else {
              chilDomHeight = childSize.height;
              chilDomWdith = childSize.width;
            }

            if (rootLayout === 'vBox') {
              // 부모 Dom Layout
              // 스플릿터
              switch (layout) {
                case 'hBox':
                  childDom.style.height = `${chilDomHeight}px`;
                  break;
                case 'vBox':
                  // N / 1 사이즈
                  childDom.style.height = `${childSize.height + divSize}px`;
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
                  childDom.style.width = `${childSize.width + divSize}px`;
                  break;
                case 'vBox':
                  // N / 1 사이즈
                  childDom.style.width = `${chilDomWdith}px`;
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
      },
    styleSizeValue(gData) {
      if (typeof gData === 'number' || !isNaN(gData)) {
        return Number(gData);
      } else if (gData.match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/)) {
        // .match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
        return gData;
      }
      throw new Error('[EVUI][ERROR][Container]-styleData');
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

<style >
</style>
