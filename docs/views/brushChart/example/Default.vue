<template>
  <div
    ref="zoomRef"
    class="case"
  >
    <ev-chart-group :options="chartGroupOptions">
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
      <ev-chart-brush :options="brushOptions"/>
    </ev-chart-group>

    <div class="description">
      <ev-button @click="onUpdateChartData">데이터 업데이트</ev-button>
      <br/>
      <br/>
      <span class="toggle-label"> useDebounce 옵션 사용</span>
      <ev-toggle v-model="isUseDebounce"/>
      <br/>
      <br/>
      <span class="toggle-label">Brush 생성</span>
      <ev-toggle v-model="isShowBrush"/>
      <br/>
      <br/>
      <span class="toggle-label">툴바 생성</span>
      <ev-toggle v-model="isShowToolbar"/>
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
    const isExpandChartArea = ref(false);
    const isShowBrush = ref(true);
    const isShowToolbar = ref(false);
    const isUseDebounce = ref(true);
    const zoomRef = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const chartGroupOptions = reactive({
      zoom: {
        toolbar: {
          show: isShowToolbar,
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

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      legend: {
        show: true,
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

    const brushOptions = reactive({
      show: isShowBrush,
      useDebounce: isUseDebounce,
      chartIdx: 0,
      height: 80,
    });

    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < Math.ceil(Math.random() * 1000); ix++) {
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

      for (let ix = 0; ix < Math.ceil(Math.random() * 1000); ix++) {
        addRandomChartData();
      }
    };

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

    return {
      chartGroupOptions,
      chartData,
      chartOptions,
      brushOptions,
      isShowToolbar,
      isShowBrush,
      isExpandChartArea,
      isUseDebounce,
      zoomRef,
      onUpdateChartData,
    };
  },
};
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;

  .ev-input-number {
    width: 100%;
  }
}
</style>
