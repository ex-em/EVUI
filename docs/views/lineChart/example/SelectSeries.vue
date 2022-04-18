<template>
  <div class="case">
    <ev-chart
      v-model:selectedSeries="defaultSelectSeries"
      :data="chartData1"
      :options="chartOptions1"
      @click="onClick"
    />
    <ev-chart
      v-model:selectedSeries="defaultSelectSeries"
      :data="chartData2"
      :options="chartOptions2"
      @click="onClick"
    />
    <div class="description">
      <ev-toggle v-model="isLive" />
      <span>
        데이터 자동 업데이트
      </span>
      <br>
      <br>
      <ev-button
        type="primary"
        shape="radius"
        @click="changeSelectedSeries('inc')"
      >
        +
      </ev-button>
      <ev-button
        type="primary"
        shape="radius"
        @click="changeSelectedSeries('dec')"
      >
        -
      </ev-button>
      <span>
        v-model:selectedSeries 변경
      </span>
      <br>
      <br>
      <div>
        <div class="badge yellow">
          v-model:selectedSeries
        </div>
        {{ defaultSelectSeries }}
        <br>
        <br>
        <div class="badge yellow">
          클릭 이벤트 데이터 (selected)
        </div>
        {{ clickedSeries }}
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
  setup() {
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
      selectSeries: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
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
      selectSeries: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
      },
    });

    const clickedSeries = ref();
    const onClick = (e) => {
      clickedSeries.value = e.selected;
    };

    const defaultSelectSeries = ref({
      seriesId: ['series1'],
    });
    const changeSelectedSeries = (type) => {
      const selectedList = defaultSelectSeries.value.seriesId;
      let idx;
      if (selectedList.length === 0) {
        selectedList.push('series1');
      } else {
        idx = +(selectedList.pop()[6]);
        if (type === 'inc') {
          idx = idx < 5 ? idx + 1 : 1;
        } else {
          idx = idx > 1 ? idx - 1 : 5;
        }
      }
      selectedList.push(`series${idx}`);
    };

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData1.labels.shift();
        chartData2.labels.shift();
      }

      timeValue = dayjs(timeValue).add(6, 'second');
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
      for (let ix = 0; ix < 10; ix++) {
        addRandomChartData();
      }
    });

    watch(isLive, (newValue) => {
      if (newValue) {
        addRandomChartData();
        liveInterval.value = setInterval(addRandomChartData, 6000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      chartData1,
      chartData2,
      chartOptions1,
      chartOptions2,
      clickedSeries,
      defaultSelectSeries,
      isLive,
      onClick,
      changeSelectedSeries,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  position: relative;
}
</style>
