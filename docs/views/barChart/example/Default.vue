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
          series1: { name: '시리즈 이름' },
        },
        labels: ['가나다라', '마바사', '아자차', '카타', '파하'],
        data: {
          series1: [100, 150, 51, 150, 350],
        },
      };

      const chartOptions = {
        type: 'bar',
        cPadRatio: 0.1,
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
