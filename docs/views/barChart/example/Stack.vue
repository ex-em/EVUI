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
          series1: { name: 'series#1', showValue: { use: true } },
          series2: { name: 'series#2', showValue: { use: true } },
          series3: { name: 'series#3', showValue: { use: true } },
          series4: { name: 'series#4', showValue: { use: true } },
        },
        groups: [
          ['series1', 'series2', 'series3', 'series4'],
        ],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: {
          series1: [null, 150, 51, 40, 50],
          series2: [110, null, 151, 50, 250],
          series3: [200, 40, null, 100, 250],
          series4: [80, 100, 151, null, 250],
        },
      };

      const chartOptions = {
        type: 'bar',
        width: '100%',
        height: '100%',
        thickness: '20px',
        title: {
          text: 'Title Test',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: false,
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
          range: (min, max) => (max > 300 ? [0, max] : [0, 300]),
          showGrid: false,
        }],
        tooltip: {
          use: true,
          htmlScrollTarget: '.ev-chart-tooltip-custom__body',
          formatter: {
            html: seriesList => `<div class="ev-chart-tooltip-custom">${seriesList.map(series => `<div>${series.name}: ${series.data.o}</div>`).join('')}</div>`,
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

<style lang="scss">
</style>
