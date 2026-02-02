<template>
  <div class="case">
    <ev-chart
      ref="chart"
      v-model:selectedItem="selectedItem"
      :data="chartData"
      :options="chartOptions"
    />
    <ev-chart
      ref="chart2"
      v-model:selectedLabel="selectedLabel"
      :data="chartData"
      :options="chartOptions2"
      @click="onClick"
    />
    <div class="description">
      <div class="badge yellow">unSelectedOpacity</div>
      <ev-input-number v-model="unSelectedOpacity" :min="0" :max="1" :step="0.1" />
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';

export default {
  setup() {
    const chart = ref(null);
    const chart2 = ref(null);

    const chartData = {
      series: {
        series1: {
          name: 'series#1',
          color: [
            [0, '#FF6767'],
            [0.5, '#FFD1B9'],
            [1, '#FF9A67'],
          ],
        },
        series2: { name: 'series#2' },
      },
      labels: ['value1', 'value2', 'value3', 'value4', 'value5'],
      data: {
        series1: [100, 150, 51, 150, 350],
        series2: [100, 150, 51, 150, 450],
      },
    };

    const unSelectedOpacity = ref(0.3);
    const chartOptions = reactive({
      type: 'bar',
      thickness: 0.8,
      width: '100%',
      unSelectedOpacity,
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
        },
      ],
      axesY: [
        {
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        },
      ],
      selectItem: {
        use: true,
        tipStyle: {
          background: '#FF00FF',
        },
        useDeselectItem: true,
        useSeriesOpacity: true,
      },
    });

    const chartOptions2 = reactive({
      type: 'bar',
      thickness: 0.8,
      width: '100%',
      unSelectedOpacity,
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
        },
      ],
      axesY: [
        {
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        },
      ],
      selectLabel: {
        use: true,
        limit: 1,
        useDeselectOverflow: true,
        showTip: true,
      },
    });

    const selectedItem = ref({
      seriesID: 'series1',
      dataIndex: 1,
    });

    const selectedLabel = ref({
      targetAxis: 'xAxis',
      dataIndex: [1],
    });

    const clickedLabel = ref();
    const onClick = ({ selected }) => {
      clickedLabel.value = selected;
    };

    return {
      chart,
      chart2,
      chartData,
      unSelectedOpacity,
      chartOptions,
      chartOptions2,
      selectedItem,
      selectedLabel,
      clickedLabel,
      onClick,
    };
  },
};
</script>

<style lang="scss"></style>
