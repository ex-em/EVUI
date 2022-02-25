<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
  export default {
    setup() {
      const chartData = {
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
        },
        data: {
          series1: [10],
          series2: [20],
          series3: [70],
        },
      };

      const chartOptions = {
        type: 'pie',
        width: '100%',
        height: '50%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
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
  .case {
    height: 100%;
  }
</style>
