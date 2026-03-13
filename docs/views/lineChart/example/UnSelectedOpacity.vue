<template>
  <div class="case">
    <resizable-wrapper height="50%">
      <ev-chart
        ref="chart"
        v-model:selectedLabel="selectedLabel"
        :data="chartData1"
        :options="chartOptions1"
      />
    </resizable-wrapper>
    <resizable-wrapper height="50%">
      <ev-chart
        ref="chart2"
        v-model:selectedSeries="selectedSeries"
        :data="chartData2"
        :options="chartOptions2"
      />
    </resizable-wrapper>
  </div>
  
  <div class="description">
    <div class="badge yellow">unSelectedOpacity</div>
    <ev-input-number v-model="unSelectedOpacity" :min="0" :max="1" :step="0.1" :precision="1" />
  </div>
</template>
<script>
import { reactive, ref } from 'vue';
import dayjs from 'dayjs';

export default {
  components: {},

  setup() {
    const chart = ref(null);
    const chart2 = ref(null);

    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const chartData1 = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
        series3: { name: 'series#3' },
      },
      labels: [
        dayjs(time),
        dayjs(time).add(5, 'second'),
        dayjs(time).add(10, 'second'),
        dayjs(time).add(15, 'second'),
        dayjs(time).add(20, 'second'),
      ],
      data: {
        series1: [25, 47, 47, 40, 100],
        series2: [100, 25, 47, 25, 47],
        series3: [25, 47, 47, 40, 50],
      },
    });
    const chartData2 = reactive({
      series: {
        series1: { name: 'series1', fill: true, point: false },
        series2: { name: 'series2', fill: true, point: false },
        series3: { name: 'series3', fill: true, point: false },
      },
      labels: [
        dayjs(time),
        dayjs(time).add(5, 'second'),
        dayjs(time).add(10, 'second'),
        dayjs(time).add(15, 'second'),
        dayjs(time).add(20, 'second'),
      ],
      groups: [['series1', 'series2', 'series3']],
      data: {
        series1: [25, 47, 47, 40, 100],
        series2: [100, 25, 47, 25, 47],
        series3: [25, 47, 47, 40, 50],
      },
    });

    const unSelectedOpacity = ref(0.3);
    const chartOptions1 = ref({
      type: 'line',
      width: '100%',
      height: '100%',
      unSelectedOpacity,
      title: {
        show: 'Selected Label',
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      selectLabel: {
        use: true,
        useClick: true,
        limit: 1,
        useDeselectOverflow: true,
        showTip: true,
        useApproximateValue: true,
        useLabelOpacity: true,
      },
    });
    const chartOptions2 = reactive({
      type: 'line',
      width: '100%',
      height: '80%',
      unSelectedOpacity,
      title: {
        show: 'Selected Series',
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      selectSeries: {
        use: true,
        limit: 1,
        useDeselectOverflow: true,
      },
    });

    const selectedLabel = ref({ dataIndex: [0] });
    const selectedSeries = ref({ seriesId: ['series1'] });

    return {
      chart,
      chart2,
      chartData1,
      chartData2,
      unSelectedOpacity,
      chartOptions1,
      chartOptions2,
      selectedLabel,
      selectedSeries,
    };
  },
};
</script>
