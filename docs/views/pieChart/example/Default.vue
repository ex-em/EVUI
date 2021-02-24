<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <ev-chart
      :data="chartData2"
      :options="chartOptions"
    />
  </div>
</template>

<script>
  export default {
    setup() {
      const commonSeries = {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
        series3: { name: 'series#3' },
      };

      const chartData = {
        series: commonSeries,
        data: {
          series1: [10],
          series2: [20],
          series3: [70],
        },
      };

      const chartData2 = {
        series: commonSeries,
        data: {
          series1: [10, 20, 10],
          series2: [20, 70, 90],
          series3: [70, 10, 0],
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
        indicator: {
          use: false,
        },
      };

      return {
        chartData,
        chartData2,
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
