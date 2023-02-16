<template>
  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
export default {
  setup() {
    const chartData = {
      series: {
        series1: { name: 'series#1', showValue: { use: true } },
        series2: { name: 'series#2', showValue: { use: true } },
      },
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      groups: [['series1', 'series2']],
      data: {
        series1: [null, 100, 58, 40, 50],
        series2: [null, 200, 200, 60, 55],
      },
    };

    const chartOptions = {
      type: 'bar',
      width: '100%',
      height: '100%',
      thickness: 1,
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      horizontal: false,
      overlapping: {
        use: true,
      },
      axesX: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
      }],
      axesY: [{
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
    };

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style lang="scss">
</style>
