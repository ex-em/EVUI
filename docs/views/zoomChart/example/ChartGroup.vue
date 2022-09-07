<template>
  <div
    ref="zoomRef"
    class="case"
  >
    <ev-chart-group
      v-model:zoomStartIdx="zoomStartIdx"
      v-model:zoomEndIdx="zoomEndIdx"
      :options="chartGroupOptions"
    >
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
      <ev-chart
        :data="chartData2"
        :options="chartOptions2"
      />
      <ev-chart
        :data="chartData3"
        :options="chartOptions3"
      />
    </ev-chart-group>

    <div class="description">
      <p class="case-title">줌 Start / End 인덱스 조절 (줌 모드에서 사용 가능)</p>
      <div class="zoom-idx__wrapper">
        <ev-input-number
          v-model="zoomStartIdx"
        />
        <ev-input-number
          v-model="zoomEndIdx"
        />
      </div>
      <br/>
      <br/>
      <p class="case-title">줌 버퍼 메모리</p>
      <ev-input-number
        v-model="bufferMemoryCnt"
        :min="1"
        :max="1000"
      />
      <br/>
      <br/>
      <ev-button @click="onUpdateChartData">데이터 업데이트</ev-button>
      <br/>
      <br/>
      <ev-button @click="onHideToolbar">툴바 생성/제거</ev-button>
      <br/>
      <br/>
      <span class="toggle-label">토글 레전드</span>
      <ev-toggle v-model="isShowToggleLegend"/>
      <br/>
      <br/>
      <span class="toggle-label">차트 넓히기</span>
      <ev-toggle v-model="isExpandChartArea"/>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const isShowToggleLegend = ref(false);
    const isExpandChartArea = ref(false);
    const bufferMemoryCnt = ref(5);
    const zoomRef = ref();
    const zoomStartIdx = ref(0);
    const zoomEndIdx = ref(0);
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const chartGroupOptions = reactive({
      zoom: {
        bufferMemoryCnt: 5,
        toolbar: {
          show: true,
          items: {
            previous: {
              icon: 'ev-icon-allow2-left',
              size: 'medium',
              title: 'Previous',
            },
            latest: {
              icon: 'ev-icon-allow2-right',
              size: 'medium',
              title: 'Latest',
            },
            reset: {
              icon: 'ev-icon-redo',
              size: 'medium',
              title: 'Reset',
            },
            dragZoom: {
              icon: 'ev-icon-zoomin',
              size: 'medium',
              title: 'Drag Zoom',
            },
          },
        },
      },
    });

    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
        series3: { name: 'series#3' },
        series4: { name: 'series#4' },
        series5: { name: 'series#5' },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
        series3: [],
        series4: [],
        series5: [],
      },
    });

    const chartData2 = reactive({
      series: {
        series111: { name: 'series#111', fill: true, point: false },
        series222: { name: 'series#222', fill: true, point: false },
        series333: { name: 'series#333', fill: true, point: false },
      },
      labels: [],
      data: {
        series111: [],
        series222: [],
        series333: [],
      },
    });

    const chartData3 = reactive({
      series: {
        series1: { name: 'series#1', fill: false, point: true },
        series2: { name: 'series#2', fill: false, point: true },
        series3: { name: 'series#3', fill: false, point: true },
        series4: { name: 'series#4', fill: false, point: true },
        series5: { name: 'series#5', fill: false, point: true },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
        series3: [],
        series4: [],
        series5: [],
      },
    });

    const chartData4 = reactive({
      series: {
        series1: { name: 'series#1', fill: true, point: false },
        series2: { name: 'series#2', fill: true, point: false },
        series3: { name: 'series#3', fill: true, point: false },
        series4: { name: 'series#4', fill: true, point: false },
        series5: { name: 'series#5', fill: true, point: false },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
        series3: [],
        series4: [],
        series5: [],
      },
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      title: {
        text: '그룹에 있는 차트 1',
        show: true,
      },
      legend: {
        show: false,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
    });

    const chartOptions2 = reactive({
      type: 'line',
      width: '100%',
      title: {
        text: '그룹에 있는 차트 2',
        show: true,
      },
      legend: {
        show: false,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        showGrid: false,
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
      maxTip: {
        use: true,
        showIndicator: true,
        indicatorColor: '#FF0000',
        tipBackground: '#000000',
        tipTextColor: '#FFFFFF',
      },
    });

    const chartOptions3 = reactive({
      type: 'line',
      width: '100%',
      title: {
        text: '그룹에 있는 차트 3',
        show: true,
      },
      legend: {
        show: false,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        showGrid: false,
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
      maxTip: {
        use: true,
        showIndicator: true,
        indicatorColor: '#FF0000',
        tipBackground: '#000000',
        tipTextColor: '#FFFFFF',
      },
    });

    const chartOptions4 = reactive({
      type: 'line',
      width: '100%',
      title: {
        text: '그룹에 있는 차트 4',
        show: true,
      },
      legend: {
        show: false,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        showGrid: false,
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
      maxTip: {
        use: true,
        showIndicator: true,
        indicatorColor: '#FF0000',
        tipBackground: '#000000',
        tipTextColor: '#FFFFFF',
      },
    });

    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));
      chartData2.labels.push(dayjs(timeValue));
      chartData3.labels.push(dayjs(timeValue));
      chartData4.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });

      Object.values(chartData2.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });

      Object.values(chartData3.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });

      Object.values(chartData4.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < Math.ceil(Math.random() * 100); ix++) {
        addRandomChartData();
      }
    });

    const onUpdateChartData = () => {
      const init = (data) => {
        data.labels.length = 0;
        const seriesKeyArr = Object.keys(data.data);

        for (let i = 0; i < seriesKeyArr.length; i++) {
          const series = seriesKeyArr[i];

          data.data[series].length = 0;
        }
      };

      init(chartData);
      init(chartData2);
      init(chartData3);
      init(chartData4);

      for (let ix = 0; ix < Math.ceil(Math.random() * 100); ix++) {
        addRandomChartData();
      }
    };

    const onHideToolbar = () => {
      chartGroupOptions.zoom.toolbar.show = !chartGroupOptions.zoom.toolbar.show;
    };

    watch(isShowToggleLegend, (isShow) => {
      chartOptions.legend.show = isShow;
      chartOptions2.legend.show = isShow;
      chartOptions3.legend.show = isShow;
      chartOptions4.legend.show = isShow;
    });

    watch(isExpandChartArea, (isExpand) => {
      const viewElement = zoomRef.value.parentElement;

      if (isExpand) {
        viewElement.style.width = '100%';
        viewElement.nextSibling.style.display = 'none';
      } else {
        viewElement.style.width = '50%';
        viewElement.nextSibling.style.display = 'initial';
      }
    });

    watch(bufferMemoryCnt, (cnt) => {
      chartGroupOptions.zoom.bufferMemoryCnt = cnt;
    }, { immediate: true });

    return {
      chartGroupOptions,
      chartData,
      chartData2,
      chartData3,
      chartData4,
      chartOptions,
      chartOptions2,
      chartOptions3,
      chartOptions4,
      isShowToggleLegend,
      isExpandChartArea,
      zoomRef,
      zoomStartIdx,
      zoomEndIdx,
      bufferMemoryCnt,
      onUpdateChartData,
      onHideToolbar,
    };
  },
};
</script>

<style lang="scss" scoped>
.zoom-idx__wrapper {
  display: flex;

  .ev-input-number {
    width: 100%;
  }
}
</style>
