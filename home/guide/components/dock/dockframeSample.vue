<template>
  <div style="width: 100%;height: 100%;">
    <div>
      <h3> 닷킹 컴포넌트</h3>
      <br>
      <button @click="adddockData">dockingLayerPopup 추가1</button>
      <button @click="adddockData2">dockingLayerPopup 추가2</button>
      <button>TreeData</button>
    </div>
    <dock-main-frame
      ref="minFrame"
      :width="1200"
      :height="900"
      :self-component="selfVm"
    />
    <!-- 동적 레이어 팝업 필수 속성들 -->
    <component
      v-for="(item, index) in layerPopupList"
      ref="mainLayerPopup"
      :key = "item.id"
      :titleid = "index"
      :layer-title = "popupTitle"
      :rootframe = "vmMain"
      :re-dock-info = "_reDockInfo"
      :evui-content = "_evuiContent"
      :is="item"/>

  </div>
</template>
<style scoped>
</style>
<script>
  import { dockMainFrame, dockSubFrame, dockFrame, dockspliter, dockFrameLayerPopup, DockFrameTab } from '@/components/dock';
  import chart from '../chart';
  import evuitable from '../table';
//
//  const chartComponet = {
//    components: {
//      chart,
//    },
//    template: '<chart/>',
//    methods: {
//    },
//  };
  const LayerPopup = {
    components: {
      dockFrameLayerPopup, chart,
    },
    props: {
      titleid: {
        type: [String, Number],
        default: '',
      },
      layerTitle: {
        type: String,
        default: '',
      },
      rootframe: {
        type: Object,
        default: null,
      },
      // 기능별로 정의된 컴포넌트를 받아서 셋팅 해준다.
      evuiContent: {
        type: Object,
        default: null,
      },
      reDockInfo: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        titleIndex: this.titleid,
        title: this.layerTitle,
        vmRoot: this.rootframe,
        evuiComponent: this.evuiContent, //  chart,
        dockInfo: this.reDockInfo,
      };
    },
    // 팝업 필수 속성들
    template: '<dock-frame-layer-popup @dragging="onDrag" @resizing="onResize" :arrayIndex="titleIndex"' +
    'style="border: 1px solid black;" :evuiComponent="evuiComponent" :title="_title" :re-dock-info = "_reDockInfo"' +
    ' :vmMain="vmRoot" :x="140" :y="188" >' +
    '<p>X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height: {{ height }}</p>' +
    '            <component' +
    '              :is="evuiComponent"' +
    '              />' +
   '</dock-frame-layer-popup>',
    created() {
    },
    computed: {
      _title() {
        return `${this.title}`;
      },
      _reDockInfo() {
        return this.dockInfo;
      },
    },
    methods: {
      onResize(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      },
      onDrag(x, y) {
        this.x = x;
        this.y = y;
      },
    },
  };
  //
  // let count = 0;
  export default {
    components: {
      DockFrameTab,
      dockMainFrame,
      dockSubFrame,
      dockFrame,
      dockspliter,
      chart,
      dockFrameLayerPopup,
      LayerPopup,
      evuitable,
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
      /**
       *  필수 정보
       */
      layerDockInfo: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        layoutChk: true,
        layerPopupList: [], // 하드코딩 필수
        evuiContent: chart, // 하드코딩 필수
        popupTitle: '',
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        testtitle: [1, 2, 3, 4, 5],
        reDockInfo: this.layerDockInfo,
      };
    },
    computed: {
      parktest() {
        return this.testtitle;
      },
      // 필수 속성
      selfVm() {
          return this;
      },
      // 필수 속성
     vmMain() {
          return this.$refs.minFrame;
      },
      // 팝업 안 컴포넌트 내용
      _evuiContent() {
        return this.evuiContent;
      },
      // 팝업 안 컴포넌트 내용
      _reDockInfo() {
        return this.reDockInfo;
      },
    },
    mounted() {
    },
    methods: {
      onResize(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      },
      onDrag(x, y) {
        this.x = x;
        this.y = y;
      },
      adddockData() {
        // this.LayerPopup = 'LayerPopup2';
        this.popupTitle = '차트';
        this.evuiContent = null;
        this.layerPopupList.push(LayerPopup);
      },
      adddockData2() {
        // this.LayerPopup = 'LayerPopup2';
        this.popupTitle = '테이블';
        this.evuiContent = null;
        this.layerPopupList.push(LayerPopup);
      },
      dynamicAddDock(component) {
        // this.LayerPopup = 'LayerPopup2';
        this.popupTitle = '테이블';
        this.evuiContent = component;
        this.layerPopupList.push(LayerPopup);
      },
//      TreeData() {
//        const _list = this.$refs.minFrame.dockDataMap;
//        const _rootId = 'root';
//        // 최종적인 트리 데이터
//        const _treeModel = [];
//
//        // 전체 데이터 길이
//        const _listLength = _list.length;
//
//        // 트리 크기
//        let _treeLength = 0;
//
//        // 반복 횟수
//        let _loopLength = 0;
//
//        // 재귀 호출
//        function getParentNode(_children, item) {
//          // 전체 리스트를 탐색
//          // for (let i = 0, child; child = _children[i]; i++) {
//            for (let i = 0, iLen = _children.length; i < iLen; i++) {
//            // 부모를 찾았으면,
//            if (child.id === item.pid) {
//              const view =
//                {
//                  id: item.id,
//                  label: item.label,
//                  children: [],
//                };
//
//              // 현재 요소를 추가하고
//              child.children.push(view);
//
//              // 트리 크기를 반영하고,
//              _treeLength++;
//
//              // 데이터상에서는 삭제
//              _list.splice(_list.indexOf(item), 1);
//
//              // 현재 트리 계층을 정렬
//              // child.children.sort((a, b) =>
//              // const orderA = a;
//              // const orderB = b;
//              //   if (orderA.order < orderB.order) {
//              //   return   -1;
//              //   } else if (orderA.order > orderB.order) {
//              //     return 1;
//              //   } else {
//              //     return  0;
//              //   }
//              //   );
//
//
//              break;
//            }
//
//            // 부모가 아니면,
//            else if (child.children.length) {
//                getParentNode(child.children, item);
//              }
//          }
//        }
//
//
//        // 트리 변환 여부 + 무한 루프 방지
//        do {
//          // 전체 리스트를 탐색
//          for (let ix = 0, item; item = _list[ix]; ix++) {
//            // 최상위 객체면,
//            if (item.pid === _rootId) {
//              const view =
//                {
//                  id: item.id,
//                  children: [],
//                };
//
//              // 현재 요소를 추가하고,
//              _treeModel.push(view);
//
//              // 트리 크기를 반영하고,
//              _treeLength++;
//
//              // 데이터상에서는 삭제
//              _list.splice(ix, 1);
//
//              // 현재 트리 계층을 정렬
//              // _treeModel.sort((a, b) =>
//              //   (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
//
//              break;
//            }
//
//            // 하위 객체면,
//            else {
//              //
//              getParentNode(_treeModel, item);
//            }
//          }
//        } while ((_treeLength !== _listLength) && (_listLength !== _loopLength++));
//
//      },
    },
  };
</script>

