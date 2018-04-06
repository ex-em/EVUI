<template>
  <div style="width: 100%;height: 100%;">
    <div>
      <input type="text">
      <button @click="addDock">레이아웃변경</button>
      <button @click="adddockData">docking data Add</button>
    </div>
    <!--<div-->
    <!--style="width:600px;height:600px;background-color:red;"-->
    <!--/>-->
    <dock-main-frame
      ref="minFrame"
      :width="1840"
      :height="1000"
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
  import { dockMainFrame, dockSubFrame, dockFrame, dockspliter, DockFrameLayerPopup } from '@/components/dock';
  import chart from '../chart';


  const chartlist = {
    components: {
      dockMainFrame, dockSubFrame, dockFrame, dockspliter, DockFrameLayerPopup, chart,
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
      DockFrameLayerPopup, chart,
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
      DockFrameLayerPopup,
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
      dockMainFrame,
      dockSubFrame,
      dockFrame,
      dockspliter,
      chart,
      DockFrameLayerPopup,
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
      JsonLoop(json) {
        Object.keys(json).forEach((key) => {
          if (key === 'content') {
            if (Array.isArray(json[key])) {
              this.arrayLoop(json[key]);
            }
          }
        });
      },
      addDock() {
      },
      arrayLoop(array) {
        const arrayObj = array;
        const arraylength = array.length;
        for (let ix = 0; ix <= arraylength - 1; ix++) {
          this.JsonLoop(arrayObj[ix]);
        }
      },
      BFTData(json) {
        const queue = [];
        queue.push(json);
         while (queue.length !== 0) {
           let JsonData = null;
           JsonData = queue[0];
          Object.keys(JsonData).forEach((key) => {
            // 배열인지 확인
            if (key === 'content') {
              if (Array.isArray(JsonData[key])) {
                const arrayObj = JsonData[key];
                const arraylength = JsonData[key].length;
                // div 생성
                for (let ix = 0; ix <= arraylength - 1; ix++) {
                  // content 배열 div create 작업실행
                  if (arrayObj[ix].content !== undefined) {
                    // 부모 id를 넣어서 큐에 담는다.7
                    arrayObj[ix].pid = JsonData.id;
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
        // }
      },
    },
  };
</script>

