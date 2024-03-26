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
          series2: { name: 'series#2', color: '#48D1CC', showValue: { use: true, decimalPoint: 1 } },
        },
        labels: [
          'value1',
          'value2',
          'value3',
          'value4',
          'value5',
        ],
        data: {
          series1: [null, 150, 0, 150, { value: 350, color: '#FF0000', textColor: '#FFFF00' }],
          series2: [null, 100.2, 0, 50.221, 250.123],
        },
      };

      const chartOptions = {
        type: 'bar',
        thickness: 0.8,
        width: '100%',
        padding: {
          right: 40,
        },
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
        tooltip: {
          showAllValueInRange: true,
          formatter: ({ y }) => `${y}`,
        },
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
