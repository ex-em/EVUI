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
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
          series4: { name: 'series#4' },
        },
        groups: [
          ['series1', 'series2', 'series3', 'series4'],
        ],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: {
          series1: [null, 150, 51, 40, 50],
          series2: [110, null, 151, 50, 250],
          series3: [200, 40, null, 100, 250],
          series4: [80, 100, 151, null, 250],
        },
      };

      const chartOptions = {
        type: 'bar',
        width: '100%',
        height: '100%',
        thickness: 1,
        title: {
          text: 'Title Test',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: false,
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
