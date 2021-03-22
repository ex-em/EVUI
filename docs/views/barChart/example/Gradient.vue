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
          series1: { name: 'series#1' }, // 기본 색상
          series2: { name: 'series#2', color: '#FF00FF' }, // 특정 색상
          series3: { name: 'series#3', color: [[0, '#FBC2EB'], [1, '#A6C1EE']] }, // 특정 색상으로 그라데이션
          series4: { name: 'series#3', color: [[], [1, '#ED9B57']] }, // 투명하게 시작하여 특정 색상으로 그라데이션
        },
        labels: ['value1', 'value2', 'value3', 'value5', 'value5'],
        data: {
          series1: [100, 150, 100, 150, 350],
          series2: [23, 54, 51, 229, 150],
          series3: [20, 75, 200, 100, 51],
          series4: [200, 95, 40, 50, 151],
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
