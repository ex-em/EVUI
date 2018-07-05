<template>
  <div
    :data-ref="dataRef"
    :style="userSelectStyle"
    :flex="flexVal"
    :minWidth="minWidthVal"
    :minHeight="minHeightVal"
    class="dockcontainer"
    @mouseenter="overHeaderIcon"
    @mouseleave="outHeaderIcon"
  >
    <!-- tab 제목 영역 -->
    <header
      class="container-title"
      @dblclick="openLayerPopup"
    >
      <div
        v-if="isTabActive"
      >
        <ul
          ref="tabGroup"
          class="nav-tabs">
          <tab-nav
            v-for="(title, index) in tabHeadInfo"
            :key="index"
            :tab-index="index"
            :tab-len="tabHeadInfo.length"
            :title="title"
            @tabNavClick="tabNavDown"/>
        </ul>
        <div
          class="evui-header-dock"
        >
          <div
            ref="headerIcon"
            class="delete-btn"
            @click="deleteDockFrame"/>
          <button
            class="evui-frame-menu"
          >▼
          </button>
          <div
            class="dropdown-content">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
      <div
        v-else>
        <label
          class="docktitle"
        >{{ title }}</label>
        <div
          class="evui-header-dock"
        >
          <div
            ref="headerIcon"
            class="delete-btn"
            @click="deleteDockFrame"/>
          <button
            class="evui-frame-menu"
          >▼
          </button>
          <div
            class="dropdown-content">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </header>
    <!-- tab 컴포넌트 영역 -->
    <div
      v-if="isTabActive"
      ref="tabGroupPanel"
      class="tab-content">
      <tab-panel
        v-for="(body, index) in tabBodyInfo"
        :key="index"
        :tab-index="index"
        :tab-len="tabHeadInfo.length"
        :evui-component="body"
      />
    </div>
    <div
      v-else>
      <slot/>
    </div>
    <!-- Dock 도킹 선택 이미지 -->
    <div
      v-if="isTabActive"
      :id="dataRef"
      :class="isPosImage ? 'selectlayerShow' : 'selectlayerHide'"
      class="evui-direct">
      <div class="wrap">
        <div class="evui-direct-background"/>
        <div
          class="tab-center"
          pos="tab"
          @mouseover.stop="mouseOverPos"
          @mouseup.stop="mouseUpPos"
          @mouseout.stop="mouseUpPos"
        />
      </div>
    </div>

    <div
      v-else
      :id="dataRef"
      :class="isPosImage ? 'selectlayerShow' : 'selectlayerHide'"
      class="evui-direct">
      <div class="wrap">
        <div class="evui-direct-background"/>
        <div
          class="top">
          <span
            class="top"
            pos="top"
            @mouseover.stop="mouseOverPos"
            @mouseup="mouseUpPos"
            @mouseout.stop="mouseUpPos"
          />
        </div>
        <div class="evui-direct-center-wrap">
          <div
            class="right"
            pos="right"
            @mouseover.stop="mouseOverPos"
            @mouseup="mouseUpPos"
            @mouseout.stop="mouseUpPos"
          />
          <div
            class="left"
            pos="left"
            @mouseover.stop="mouseOverPos"
            @mouseup="mouseUpPos"
            @mouseout.stop="mouseUpPos"
          />
          <div
            class="center"
            pos="tab"
            @mouseover.stop="mouseOverPos"
            @mouseup="mouseUpPos"
            @mouseout.stop="mouseUpPos"
          />
        </div>
        <div
          class="bottom">
          <span
            class="bottom"
            pos="bottom"
            @mouseover.stop="mouseOverPos"
            @mouseup="mouseUpPos"
            @mouseout.stop="mouseUpPos"
          />
        </div>
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
  import TabNav from './dockframe.tab.nav';
  import TabPanel from './dockframe.tab.panel';

  export default {

    name: 'DockFrameTab',
    components: {
        TabNav, TabPanel,
    },
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
       * DockFrame content Component
       */
      content: {
        type: Object,
        default: null,
      },
      /**
       * target DockFrame Obj
       */
      targetVm: {
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
        vmMainFrame: this.vmMain, // 해당 Dock  Vm 객체 담는다.\
        vmTarget: this.targetVm, // 도킹된 타겟 vm 담는다.
        isTabActive: false,
        tabNavData: [],
        tabPanelData: [],
        selectTabIndex: 0,
        componentContent: this.content,
        resizebarSize: ['4px', '100%'],
      };
    },

    computed: {
      tabBodyInfo() {
        return this.tabPanelData;
      },
      tabHeadInfo() {
          return this.tabNavData;
      },
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
    watch: {
//      tabNavData(val) {
//         this.selectTabIndex = val.length - 1;
//      },
    },
    mounted() {
      // DockFrame 생기면서 제목과 내용을 배열에 넣어둔다.
      // 텝이 동적으로 생기기 때문에 인덱스로 제어를 한다.
      this.tabNavData.push(this.panelTitle);
      this.tabPanelData.push(this.componentContent);
    },
    updated() {
        // 텝데이타가 존재  하면 true
      if (this.tabNavData.length > 1) {
        this.isTabActive = true;
      } else {
        this.isTabActive = false;
      }
    },
    created() {

    },
    activated() {
      // root 도킹이 아닐때
      if (this.addType === 'root') {
        if (!this.$el.parentElement.className.match('root')) {
          this.sizeRootDockFrame();
        } else {
            // restore 시 type을 변경 해준다. 예외처리
          this.addType = 'noroot';
        }
      } else if (this.addType === 'redocking') {
        this.reSizeDockFrame();
      } else {
        // inner Dock
        this.sizeDockFrame();
      }
    },
    methods: {
      tabNavDown(event, tabNav) {
        // 선택된 텝 class 주기
        const groupTab = this.$refs.tabGroup;
        const groupTabPanel = this.$refs.tabGroupPanel;
        groupTab.children[this.selectTabIndex].classList.remove('active');
        groupTabPanel.children[this.selectTabIndex].classList.remove('active');
        // 선택된 텝 인덱스 값 설정
        this.selectTabIndex = tabNav.index;
        groupTab.children[this.selectTabIndex].classList.add('active');
        groupTabPanel.children[this.selectTabIndex].classList.add('active');
        event.stopPropagation();
      },
      openLayerPopup() {
        // dockFrame을 Layer팝업으로 전환
        // 동적 팝업 만들어주는 배열 변수 layerPopupList 하드코딩 네이밍 고정으로 되어있음.
        // 나중에 변환해야함..
        const siblingDomId = this.siblingId();
        this.vmMainFrame.selfVm.popupTitle = this.tabNavData[this.selectTabIndex];
        this.vmMainFrame.selfVm.evuiContent = this.tabPanelData[this.selectTabIndex];
        const dockFrameInfo = {};
        dockFrameInfo.vm = siblingDomId;
        dockFrameInfo.type = this.addType === 'root' ? 'root' : this.addType;
        dockFrameInfo.type = this.addType === 'root' ? 'root' : 'redocking';
        dockFrameInfo.pos = this.addPos;
        // 스플릿바 사이즈 뺀 사이즈로 전달
        dockFrameInfo.width = this.$el.getBoundingClientRect().width;
        dockFrameInfo.height = this.$el.getBoundingClientRect().height;
        this.vmMainFrame.selfVm.reDockInfo = dockFrameInfo;
//        this.vmMainFrame.selfVm.layerPopupList.push(LayerPopup); // 동적으로 할수 있는방법..
        this.vmMainFrame.selfVm.dynamicAddDock(this.tabPanelData[this.selectTabIndex]);
        // dockFrame 삭제
        this.deleteDockFrame();
      },
      siblingId() {
        const parentDom = this.$el.parentElement;
        const subDockLayout = parentDom.className.match('vbox') ? 'vBox' : 'hBox';
        let targetDom;
        if (parentDom.id === 'rootDock') {
            // 제일 처음 도킹일때 pos값은 root
          targetDom = parentDom.id;
          this.addPos = 'root';
        } else {
          for (let ix = 0; ix < parentDom.childElementCount; ix++) {
            const childDom = this.$el.parentElement.children[ix];
            if (childDom.dataset.ref !== this.dataRef && !childDom.className.match('resizebar')) {
              targetDom = childDom.dataset.ref;
              if (subDockLayout === 'vBox') {
                if (ix === 0) { // pos : right , bottom ix가 0이면
                  this.addPos = 'bottom'; // 반대로 생각 즉 삽입되는 위치
                } else { // ix가 1이면 pos : left , top
                  this.addPos = 'top'; // 반대로 생각 즉 삽입되는 위치
                }
              } else if (subDockLayout === 'hBox') {
                if (ix === 0) { // pos : right , bottom ix가 0이면
                  this.addPos = 'right'; // 반대로 생각 즉 삽입되는 위치
                } else { // ix가 1이면 pos : left , top
                  this.addPos = 'left'; // 반대로 생각 즉 삽입되는 위치
                }
              }
            }
          }
        }
        return targetDom;
      },
      deleteDockDataMap(delId) {
        const arrayDataMap = this.vmMainFrame.dockDataMap;
        for (let ix = 0; ix < arrayDataMap.length; ix++) {
          const dataMap = arrayDataMap[ix];
          if (delId === dataMap.id) {
            arrayDataMap.splice(ix, 1);
          }
        }
      },
      updateParentId(vmId, pId) {
        const arrayDataMap = this.vmMainFrame.dockDataMap;
        for (let ix = 0; ix < arrayDataMap.length; ix++) {
          const dataMap = arrayDataMap[ix];
          if (dataMap.id === vmId) {
            dataMap.pid = pId;
          }
        }
      },
      vmDeleteId(parentVm, id) {
        const parentObject = parentVm.$children;
        // const parentLength = parentObject.length;
        for (let ix = 0; ix < parentObject.length; ix++) {
          const vmInstance = parentObject[ix];
          // 같은 id를 찾으면 삭제
          if (vmInstance.dataRef === id) {
            vmInstance.$destroy();
          }
          if (vmInstance.$children.length !== 0) {
              this.vmDeleteId(vmInstance, id);
          }
        }
      },
      overHeaderIcon(e) {
        this.$refs.headerIcon.classList.add('show');
        const shiftY = e.clientY - this.$el.getBoundingClientRect().top;
//        const shiftX = e.clientX - this.$el.getBoundingClientRect().left;
        this.$refs.headerIcon.style.top = `${e.pageY - shiftY - 24}px`;
//        this.$refs.headerIcon.style.left = `${shiftX}px`;
      },
      outHeaderIcon() {
        this.$refs.headerIcon.classList.remove('show');
        this.$refs.headerIcon.style.top = `${0}px`;
      },
      deleteDockFrame() {
          if (this.tabNavData.length === 0 || this.tabNavData.length === 1) {
            const parentDockFrame = this.$el.parentElement; // 부모 Dom
            const parentDockFrameSize = parentDockFrame.getBoundingClientRect();
            const parentDockLayout = parentDockFrame.className.match('vbox') ? 'vBox' : 'hBox';
            if (parentDockFrame.className.match('root')) {
              // root 밑에 dock 하나 밖에 없는 경우
              // DataMap에서 삭제 한다
              this.deleteDockDataMap(this.dataRef);
              parentDockFrame.removeChild(this.$el);
            } else {
              const alivedDockFrame = this.delTargetDockFrame(parentDockFrame);
              const dockSize = alivedDockFrame.getBoundingClientRect();
              alivedDockFrame.style.width = `${parentDockFrameSize.width}px`;
              alivedDockFrame.style.height = `${parentDockFrameSize.height}px`;
              if (alivedDockFrame.className.match('evui-dock-container')) {
                // 사이즈가 늘어났으니 자식들도 사이즈 일괄변경 차리
                // const dockLayout = alivedDockFrame.className.match('vbox') ? 'vBox' : 'hBox';
                let increaseSize;
                if (parentDockLayout === 'vBox') {
                  increaseSize = parentDockFrameSize.height - dockSize.height;
                } else {
                  increaseSize = parentDockFrameSize.width - dockSize.width;
                }
                this.deleteDockDomSize(alivedDockFrame, increaseSize, parentDockLayout);
              }
            }
          } else {
              // 선택된 tabindex 만 제거
            this.tabNavData.splice(this.selectTabIndex, 1);
            this.tabPanelData.splice(this.selectTabIndex, 1);
            const el = this.$refs.tabGroup.children[this.tabNavData.length - 1].children[0]; // a 태그
            const lastLi = this.$refs.tabGroup.children[this.tabNavData.length]; // li 태그
            // 마지막 tab이 선택된게 아니라면 트리거 하지 않는다.
            if (lastLi.className.match('active')) {
              this.selectTabIndex = this.tabNavData.length - 1;
              const event = document.createEvent('HTMLEvents');
              event.initEvent('mousedown', true, false);
              el.dispatchEvent(event);
            } else {
                // 셀렉트된 텝 인덱스 값 변경
              const ulList = this.$refs.tabGroup.children;
              for (let ix = 0; ix < ulList.length; ix++) {
                const liDom = ulList[ix];
                if (liDom.className.match('active')) {
                  this.selectTabIndex = ix;
                }
              }
            }
          }
      },
      delTargetDockFrame(parentDom) {
        const parentDockFrame = parentDom;
        const childCnt = parentDockFrame.childElementCount;
        const delId = [];
        let aliveDom;
        // DataMap에서 삭제 한다
        this.deleteDockDataMap(parentDockFrame.dataset.ref);
        delId.push(parentDockFrame); // 삭제대상 1
        for (let ix = 0; ix < childCnt; ix++) {
          const childDom = parentDockFrame.children[ix];
             if (childDom.dataset.ref === this.dataRef) {
               // DataMap에서 삭제 한다
               this.deleteDockDataMap(childDom.dataset.ref);
               delId.push(childDom);// 삭제대상 2
               // Dom 삭제 전 Vm 객체 부터 삭제 한다.
               // this.vmDeleteId(this.vmMainFrame, childDom.dataset.ref);
             } else if (childDom.className.match('resizebar')) {
               // DataMap에서 삭제 한다
               this.deleteDockDataMap(childDom.dataset.ref);
               delId.push(childDom);// 삭제대상 3
               // Dom 삭제 전 Vm 객체 부터 삭제 한다.
               // this.vmDeleteId(this.vmMainFrame, childDom.dataset.ref);
             } else {
               aliveDom = childDom; // 생존 Dom
               this.updateParentId(aliveDom.dataset.ref, parentDockFrame.parentElement.dataset.ref);
             }
        }

        // if (!aliveDom.className.match('dockcontainer')) {
        //   // 살아있는 Dom 밑에 자식이 존재 함으로 자식 사이즈 전부 일괄 변경 처리 해준다.
        //
        // } else {
          // 생존해야하는 Dom을 먼저 이동시킨다.
          // parentDockFrame.parentElement.appendChild(aliveDom);
          parentDockFrame.parentElement.insertBefore(aliveDom, parentDockFrame);
          // Dom 삭제 전 Vm 객체 부터 삭제 한다.
          // this.vmDeleteId(this.vmMainFrame, parentDockFrame.dataset.ref);
          parentDockFrame.parentElement.removeChild(delId[0]);
          // parentDockFrame.removeChild(delId[2]);
          // parentDockFrame.parentElement.removeChild(parentDockFrame);
          // parentDockFrame.removeChild(delId[0]);
        // }
        return aliveDom;
      },
      deleteDockDomSize(target, splitSize, rootLayout) {
        const targetDom = target.children;
        const targetDomLength = targetDom.length;
        // subDockFrame size
        const parentSize = target.getBoundingClientRect();
        const resizeWidth = parentSize.width; // 부모 넓이
        const resizeHeight = parentSize.height; // 부모 높이
        // subdockframe Layout 추출
        let layout;
        if (target.className.match('vbox')) {
          layout = 'vBox';
        } else if (target.className.match('hbox')) {
          layout = 'hBox';
        }
        //
        if (!target.className.match('dockcontainer')) {
          for (let ix = 0, ixlen = targetDomLength - 1; ix <= ixlen; ix++) {
            const childDom = targetDom[ix];
            const childDomSize = childDom.getBoundingClientRect();
            let childRatioWidth;
            let childRatioHeight;
            let spliteSize;
            // root 만 사이즈 줄이고 그담부터는 재귀를 통해 이미 사이즈가 줄어든
            // 부모 넓이을 참고하여 리사이즈를 실행한다
            // const dockFrameSplitSize = 2;
            // root
            if (!childDom.className.match('resizebar')) {
              if (rootLayout === 'vBox') {
                // childRatioWidth = ((childDomSize.width / (resizeWidth))
                //   * resizeWidth);
                // childRatioHeight = ((childDomSize.height / ((resizeHeight) + reSplitSize))
                //   * resizeHeight);
                // 스플릿 상단 부모가 vbox Height만 resize된다.
                // 부모 Dom Layout
                // 자식 스플릿터
                switch (layout) {
                  case 'hBox':
                    spliteSize = splitSize;
                    childDom.style.height = `${resizeHeight}px`;
                    // Update Data Map
                    // this.updateDockDataMapSize(childDom.dataset.ref, null, `${resizeHeight}px`);
                    break;
                  case 'vBox':
                    // 소수점 정수로 만든다.
                    spliteSize = splitSize / 2;
                    if (!Number.isInteger(spliteSize)) {
                      if (ix === 0) {
                        spliteSize = Math.floor(spliteSize);
                      } else {
                        spliteSize = Math.floor(spliteSize) + 1;
                      }
                    }
                    childRatioHeight = (childDomSize.height) + (spliteSize);
                    childDom.style.height = `${childRatioHeight}px`;
                    // Update Data Map
                    // this.updateDockDataMapSize(childDom.dataset.ref, null,
                    // `${childRatioHeight}px`);
                    // ix === 0 ? `${Math.ceil(childRatioHeight)}px` :
                    // `${Math.floor(childRatioHeight)}px`;
                    // childDom.style.height = isFirst ? `${(resizeHeight / 2)
                    // - dockFrameSplitSize}px` :
                    //   `${(resizeHeight / 2) - dockFrameSplitSize}px`;
                    break;
                  case 'tab': // tab은 아직 구상이 되지 않음.
                    break;
                  default :
                }
              } else {
                // childRatioWidth = ((childDomSize.width / ((resizeWidth) + reSplitSize))
                //   * resizeWidth);
                // childRatioHeight = ((childDomSize.height / (resizeHeight))
                //   * resizeHeight);
                // 스플릿터
                switch (layout) {
                  case 'hBox':
                    // if (splitSize % 2 === 0) {
                    //   childRatioWidth = (childDomSize.width) + (splitSize / 2);
                    // } else if (ix === 0) {
                    //   childRatioWidth = (childDomSize.width) + Math.floor((splitSize / 2));
                    // } else {
                    //   childRatioWidth = (childDomSize.width) + Math.floor((splitSize / 2) + 1);
                    // }
                    spliteSize = splitSize / 2;
                    // 정수체크
                    if (!Number.isInteger(spliteSize)) {
                      if (ix === 0) {
                        spliteSize = Math.floor(spliteSize);
                      } else {
                        spliteSize = Math.floor(spliteSize) + 1;
                      }
                    }
                    childRatioWidth = (childDomSize.width) + (spliteSize);
                    childDom.style.width = `${childRatioWidth}px`;
                    // Update Data Map
                    // this.updateDockDataMapSize(childDom.dataset.ref,
                    // `${childRatioWidth}px`, null);
                    // ix === 0 ? `${Math.ceil(childRatioWidth)}px` :
                    // `${Math.floor(childRatioWidth)}px`;
                    // childDom.style.width = isFirst ? `${(resizeWidth / 2)
                    // - dockFrameSplitSize}px` :
                    //   `${(resizeWidth / 2) - dockFrameSplitSize}px`;
                    break;
                  case 'vBox':
                    // N / 1 사이즈
                    // 부모 넓이 따라간다.
                    spliteSize = splitSize;
                    childDom.style.width = `${resizeWidth}px`;
                    // Update Data Map
                    // this.updateDockDataMapSize(childDom.dataset.ref, `${resizeWidth}px`, null);
                    break;
                  case 'tab': // tab은 아직 구상이 되지 않음.
                    break;
                  default :
                }
              }
            }

            // 자식 dom이 있다면 재귀 호출 실행
            if (childDom.childElementCount !== 0 && !childDom.className.match('dockcontainer')) {
              if (childDom.className.match('vbox')) {
                this.deleteDockDomSize(childDom, spliteSize, rootLayout);
              } else if (childDom.className.match('hbox')) {
                this.deleteDockDomSize(childDom, spliteSize, rootLayout);
              }
            }
          }
        }
      },
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
//          this.addPos = '';
        }
      },
      reSizeDockFrame() {
        const dockframeSize = this.$el.getBoundingClientRect();
        let resizebar;
        if (this.addPos !== '') {
          switch (this.addPos) {
            case 'left':
              // 이진트리 하부 3개.
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width)}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'right':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[0];
              resizebar.style.height = this.resizebarSize[1];
              this.$el.style.width = `${(dockframeSize.width)}px`;
              this.$el.style.height = `${dockframeSize.height}px`;
              break;
            case 'top':
              resizebar = this.$el.nextElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height)}px`;
              break;
            case 'bottom':
              resizebar = this.$el.previousElementSibling;
              resizebar.style.width = this.resizebarSize[1];
              resizebar.style.height = this.resizebarSize[0];
              this.$el.style.width = `${dockframeSize.width}px`;
              this.$el.style.height = `${(dockframeSize.height)}px`;
              break;
            default :
          }
//          this.addPos = '';
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
//          this.addPos = '';
        }
      },
      mouseOverPos() {
        this.isViewLayer = true;
      },
      mouseUpPos() {
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
  .delete-btn {
    /*background-color: #333333;*/
    background-image: url(./dock_image.png);
    background-position: 0px -225px;
    width: 58px;
    height: 25px;
    padding: 0px 2px;
    border: none;
    cursor: pointer;
    position: fixed;
    display: none;
  }
  .evui-header-dock {
    width: 60px;
    /*height: 25px;*/
    float:right;
    z-index: 10000;
  }
  .show {display:block;}
  .nav-tabs > li {
    float: left;
    cursor:pointer;
    position:relative;
  }
  .nav-tabs > .active > a, .nav-tabs > .active > a:hover, .nav-tabs > .active > a:focus {
    color: #555555;
    cursor: default;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
  }
  .nav-tabs > li > a {
    display: inline-block;
  }
  .nav-tabs > li > a {
    line-height: 20px;
    border: 1px solid transparent;
    -webkit-border-radius: 4px 4px 0 0;
    -moz-border-radius: 4px 4px 0 0;
    border-radius: 4px 4px 0 0;
  }
  .link-tag {
    color:#000000;
  }
  A:link {text-decoration:none;}
  A:visited {text-decoration:none;}
  A:active {text-decoration:none;}
  A:hover {text-decoration:none;}
  .tab-content {
    overflow: auto;
    margin: 10px 10px 10px 10px;
  }
  .tab-content > .tab-pane {
    display: none;
  }
  .tab-content > .active {
    display: block;
  }

  .evui-frame-menu {
    background-color: #333333;
    color: white;
    padding: 7px;
    font-size: 5px;
    border: none;
    cursor: pointer;
    display: none;
    float:right;
    text-align: center;
  }
  .dropdown-content {
    display: none;
  }
  .evui-frame-menu:hover, .evui-frame-menu:focus {
    background-color: #2980B9;
    text-align: center;
  }
</style>
