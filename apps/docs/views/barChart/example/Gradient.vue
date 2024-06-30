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
          series3: { name: 'series#3', color: [[0, '#FF6767'], [0.5, '#FFD1B9'], [1, '#FF9A67']] }, // 특정 색상으로 그라데이션
          series4: { name: 'series#4', color: [[], [1, 'rgba(255, 239, 35, 0.5)']] }, // 투명하게 시작하여 특정 색상으로 그라데이션
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
        borderRadius: 14,
        axesX: [{
          type: 'step',
        }],
        axesY: [{
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        legend: {
          show: true,
          position: 'bottom',
          height: 50,
          padding: {
            left: 60,
            top: 20,
          },
        },
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
