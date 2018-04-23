<template>
  <div style="width: 100%;height: 100%;">
    <div>
      <h3> 닷킹 컴포넌트</h3>
      <br>
      <button @click="adddockData">dockingLayerPopup 추가</button>
      <button>TreeData</button>
    </div>
    <dock-main-frame
      ref="minFrame"
      :width="1840"
      :height="900"
    />
    <component
      v-for="(item, index) in LayerPopupList"
      :key = "item.id"
      :titleid = "index"
      :rootframe = "vmMain"
      :is="item"/>
  </div>
</template>
<style scoped>
</style>
<script>
  import { dockMainFrame, dockSubFrame, dockFrame, dockspliter, dockFrameLayerPopup, DockFrameTab } from '@/components/dock';
  import chart from '../chart';


  const chartlist = {
    components: {
      dockMainFrame, dockSubFrame, dockFrame, dockspliter, dockFrameLayerPopup, chart,
    },
    data() {
      return {
      };
    },
    template:
    '            <dock-sub-frame' +
    '              flex="1"' +
    '              layout="sub">' +
    '              <dock-sub-frame' +
    '                flex="1"' +
    '                layout="hBox">' +
    '            <dock-frame' +
    '              flex="1"' +
    '              title="test79"/>' +
    '            <dockspliter/>' +
    '            <dock-frame' +
    '              flex="1"' +
    '              title="test80"/>' +
    '              </dock-sub-frame>' +
    '            </dock-sub-frame>',
    methods: {
    },
  };
  const LayerPopup = {
    components: {
      dockFrameLayerPopup, chart,
    },
    props: {
      titleid: {
        type: [String, Number],
        default: '',
      },
      rootframe: {
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
        ElementDock: chartlist,
        titleIndex: this.titleid,
        vmRoot: this.rootframe,
        exemComponent: null, //  chart,
      };
    },
    template: '<dock-frame-layer-popup @dragging="onDrag" @resizing="onResize"' +
    'style="border: 1px solid black;" :exemComponent="exemComponent" :title="popuptitle"' +
    ' :vmMain="vmRoot" :x="40" :y="88" >' +
    '<p>X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height: {{ height }}</p>' +
       '<chart/>' +
   '</dock-frame-layer-popup>',
    created() {
    },
    computed: {
      popuptitle() {
        return `제목 ${this.titleIndex}`;
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
  const LayerPopup2 = {
    components: {
      dockFrameLayerPopup,
    },
    template: '<dock-frame-layer-popup @dragging="onDrag" @resizing="onResize" :resizable="false" :parent="true"' +
    'style="border: 1px solid black;">' +
    '</dock-frame-layer-popup>',
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
      LayerPopup2,
    },
    data() {
      return {
        layoutChk: true,
        LayerPopupList: [],
        width: 0,
         height: 0,
        x: 0,
        y: 0,
      };
    },
    computed: {
     vmMain() {
          return this.$refs.minFrame;
      },
      layerobj: {
        get() {
          return this.Layer;
        },
        set(cData) {
          this.Layer = cData;
        },
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
        this.LayerPopupList.push('LayerPopup');
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

