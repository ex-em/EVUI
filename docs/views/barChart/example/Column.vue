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
          series1: { name: 'series#1', color: '#FEC64F', showValue: { use: true } },
          series2: { name: 'series#2', color: '#48D1CC', showValue: { use: true } },
        },
        labels: [
          'value1',
          'value2',
          'value3',
          'value4',
          'value5',
        ],
        data: {
          series1: [100, 150, 51, 150, 350],
          series2: [150, 100, 151, 50, 250],
        },
      };

      const chartOptions = {
        type: 'bar',
        thickness: 0.8,
        width: '100%',
        title: {
          text: 'Chart Title',
            show: true,
        },
        legend: {
          show: true,
            position: 'right',
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
