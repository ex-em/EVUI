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
          series1: { name: 'series#1', showValue: { use: true, fontSize: 12, textColor: '#000000', align: 'out' } },
        },
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: {
          series1: [1500, 180, 30, 10, 0],
        },
      };

      const chartOptions = {
        type: 'bar',
        width: '100%',
        height: '100%',
        thickness: 0.8,
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: true,
        borderRadius: 15,
        axesX: [{
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: true,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        indicator: {
          use: false,
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
