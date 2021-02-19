<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
  <div class="case">
    <ev-chart
      :data="chartData2"
      :options="chartOptions"
    />
    <div class="description">
      막대 별 값 표시. ( 막대가 작은 경우 표시되지 않음 )
    </div>
  </div>
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

      const chartData2 = {
        series: {
          series1: { name: 'series#1', showValue: { use: true, fontSize: 12, textColor: '#ffffff' } },
        },
        labels: ['value1', 'value2', 'value3', 'value5', 'value5'],
        data: {
          series1: [100, 150, 51, 150, 350],
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
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        }],
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
</style>
