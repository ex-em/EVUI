<template>
  <!-- eslint-disable -->
  <div style="width: 1840px;height: 100%;">
    <dock-main-frame  :width="1840"  :height="800" >
      <dock-sub-frame  flex=5  layout="vBox">

        <dock-sub-frame  flex=5  layout="sub">
          <dock-sub-frame  flex=5  layout="hBox">
            <dock-frame flex=1 title="제목1"/>
            <dockspliter/>

            <dock-sub-frame  flex=1  layout="sub">
              <dock-sub-frame  flex=1  layout="vBox">
                <dock-frame flex=2 title="제목1"/>
                <dockspliter/>
                <dock-frame flex=1 title="제목2"/>
                <dockspliter/>
                <dock-frame flex=1 title="제목3"/>
              </dock-sub-frame>
            </dock-sub-frame>

            <dockspliter/>

            <dock-sub-frame  flex=1  layout="sub">
              <dock-sub-frame  flex=1  layout="hBox">
                <dock-frame flex=1 title="제목1"/>
                <dockspliter/>
                <dock-frame flex=4 title="제목2"/>
                <dockspliter/>
                <dock-frame flex=1 title="제목3"/>
              </dock-sub-frame>
            </dock-sub-frame>

          </dock-sub-frame>
        </dock-sub-frame>
        <!--<dock-frame flex=1 title="제목0"/>-->
      <dockspliter/>
        <dock-sub-frame  flex=1  layout="sub">
          <dock-sub-frame  flex=1  layout="hBox">
            <dock-frame flex=2 title="제목1"/>
            <dockspliter/>
            <dock-frame flex=1 title="제목2"/>
            <dockspliter/>
            <dock-frame flex=1 title="제목3"/>
          </dock-sub-frame>
        </dock-sub-frame>
      <dockspliter/>
      <dock-frame flex=1 title="제목2"/>
      </dock-sub-frame>
    </dock-main-frame>
    <div>
      <input type="text">
      <button @click="addDock">Dock추가</button>
      <button @click="adddockData">docking data Add</button>
    </div>
    <div class="content"/>
  </div>
</template>
<script>
  import { dockMainFrame, dockSubFrame, dockFrame, dockspliter } from '@/components/dock';
  import chart from '../chart';

  let count = 0;
  export default {
    components: {
      dockMainFrame, dockSubFrame, dockFrame, dockspliter, chart,
    },
    data() {
      return {
        dockDataSet: {
                  // root ID는 고정 Main Frame
                  layout: 'hBox',
                  bgcolor: '#FAED7D',
                  content: [{
                    id: 222,
                    layout: 'vBox',
                    bgcolor: '#CEF279',
                    content: [{
                      id: 444,
                      layout: 'hBox',
                      bgcolor: '#B7F0B1',
                      content: [
                        {
                          id: 'aaa',
                          layout: 'DockForm',
                          bgcolor: '#B2EBF4',
                          componentName: 'chartA',
                          componentState: { label: '1', width: '100%', height: '100%' },
                        },
                        {
                          id: 'bbb',
                          layout: 'DockForm',
                          bgcolor: '#B2CCFF',
                          componentName: 'ChartB',
                          componentState: { label: '2', width: '100%', height: '100%' },
                        },
                      ],
                    },
                      {
                        id: '555',
                layout: 'vBox',
                bgcolor: '#B5B2FF',
                content: [
                  {
                    id: 'ccc',
                    layout: 'DockForm',
                    bgcolor: '#D1B2FF',
                    componentName: 'testComponent',
                    componentState: { label: '1', width: '100%', height: '100%' },
                  },
                  {
                    id: 'ddd',
                    layout: 'DockForm',
                    bgcolor: '#FFB2F5',
                    componentName: 'testComponent',
                    componentState: { label: '2', width: '100%', height: '100%' },
                  },
                ],
              }],
          },
            {
              id: 333,
              layout: 'hBox',
              bgcolor: '#FFB2D9',
              content: [
                {
                  id: 666,
                  layout: 'vBox',
                  bgcolor: '#008299',
                  content: [
                    {
                      id: '888',
                      layout: 'DockForm',
                      bgcolor: '#003399',
                      componentName: 'testComponent',
                      componentState: { label: '4', width: '100%', height: '100%' },
                    },
                    {
                      id: '999',
                      layout: 'DockForm',
                      bgcolor: '#C4B73B',
                      componentName: 'testComponent',
                      componentState: { label: '6', width: '100%', height: '100%' },
                    },
                  ],
                },
                {
                  id: '777',
                  layout: 'DockForm',
                  bgcolor: '#CC3D3D',
                  componentName: 'testComponent',
                  componentState: { label: '6', width: '100%', height: '100%' },
                },
              ],
            },
          ],
        },
        dockDataSet2: {
          id: 444,
          content: [
            {
              id: 'dock00006',
              layout: 'DockForm',
              componentName: 'testComponent',
              componentState: { label: '6', width: '100%', height: '100%' },
            },
            {
              id: 'dock00006',
              layout: 'DockForm',
              componentName: 'testComponent',
              componentState: { label: '6', width: '100%', height: '100%' },
            },
          ],
        },
      }
        ;
    },
    computed: {},
    mounted() {
      // const DataObj = this.dockDataSet;
     // this.BFTData(DataObj);
      // this.addDockForm(DataObj, '999');
      // this.arraySerach(DataObj);
      // this.forLoop(DataObj);
//      Object.keys(DataObj).forEach((key) => {
//        this[key] = DataObj[key];
//      });
    },
    methods: {
      adddockData() {
        this.$refs.Maindock.addDockFrame('aaa', 'vBox', `park${count}`);
        count += 1;
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
        this.$refs.Maindock.addDockFrame('aaa', 'hBox', `park${count}`);
        count += 1;
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

<style scoped>

</style>
