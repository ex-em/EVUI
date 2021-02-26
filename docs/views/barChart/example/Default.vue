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
        },
        labels: ['value1', 'value2', 'value3', 'value5', 'value5'],
        data: {
          series1: [100, 150, 51, 150, 350],
        },
      };

      const chartOptions = {
        type: 'bar',
        axesX: [{
          type: 'step',
        }],
        axesY: [{
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>

<style lang="scss" scoped>
</style>
