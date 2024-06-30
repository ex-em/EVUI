<template>
  <div class="case">
    <ev-chart
      ref="chart"
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData1"
      :options="chartOptions1"
      @click="onClick"
    />
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData2"
      :options="chartOptions2"
      @click="onClick"
    />
    <div class="description">
      <ev-toggle v-model="isUseClick" />
      <span>
        클릭 기능 enable ( false 일때는 v-model 값으로 변경 )
      </span>
      <br>
      <br>
      <ev-toggle v-model="isFixedPosTop" />
      <span>
        tip 위치를 최상단에 고정
      </span>
      <br>
      <br>
      <ev-toggle v-model="isLive" />
      <span>
        데이터 자동 업데이트
      </span>
      <br>
      <br>
      <div>
        <div class="badge yellow">
          v-model:selectedLabel
        </div>
        {{ defaultSelectLabel }}
        <br>
        <br>
        <div class="badge yellow">
          클릭 이벤트 데이터 (selected)
        </div>
        {{ clickedLabel }}
        <br>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  components: {},

  setup() {
    const chart = ref(null);

    const chartData1 = reactive({
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
        series1: { name: 'series1', fill: true, point: false },
        series2: { name: 'series2', fill: true, point: false },
        series3: { name: 'series3', fill: true, point: false },
        series4: { name: 'series4', fill: true, point: false },
        series5: { name: 'series5', fill: true, point: false },
      },
      labels: [],
      groups: [['series1', 'series2', 'series3', 'series4', 'series5']],
      data: {
        series1: [],
        series2: [],
        series3: [],
        series4: [],
        series5: [],
      },
    });
    const isUseClick = ref(true);
    const isFixedPosTop = ref(false);

    const chartOptions1 = ref({
      type: 'line',
      width: '100%',
      height: '80%',
      title: {
        show: false,
      },
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
      selectLabel: {
        use: true,
        useClick: isUseClick,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: isFixedPosTop,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
    });
    const chartOptions2 = ref({
      type: 'line',
      width: '100%',
      height: '80%',
      title: {
        show: false,
      },
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
      selectLabel: {
        use: true,
        useClick: isUseClick,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: isFixedPosTop,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
    });

    const clickedLabel = ref();
    const onClick = ({ selected }) => {
      clickedLabel.value = selected;
    };

    const defaultSelectLabel = ref({
      dataIndex: [1],
    });

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData1.labels.shift();
        chartData2.labels.shift();
      }

      timeValue = dayjs(timeValue).add(1, 'second');
      chartData1.labels.push(dayjs(timeValue));
      chartData2.labels.push(dayjs(timeValue));

      Object.values(chartData1.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
      Object.values(chartData2.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < 60; ix++) {
        addRandomChartData();
      }
    });

    watch(isLive, (newValue) => {
      if (newValue) {
        addRandomChartData();
        liveInterval.value = setInterval(addRandomChartData, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      chart,
      chartData1,
      chartData2,
      chartOptions1,
      chartOptions2,
      clickedLabel,
      defaultSelectLabel,
      isUseClick,
      isFixedPosTop,
      isLive,
      onClick,
    };
  },
};
</script>

<style lang="scss" scoped>
  .description {
    position: relative;
  }
</style>
