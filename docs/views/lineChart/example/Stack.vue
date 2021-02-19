<template>
  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
  import moment from 'moment';

  export default {
    setup() {
      const time = moment().format('YYYY-MM-DD HH:mm:ss');
      const chartData = {
        series: {
          series1: { name: 'series#1', fill: true, point: false },
          series2: { name: 'series#2', fill: true, point: false },
        },
        groups: [
          ['series1', 'series2'],
        ],
        labels: [
          moment(time),
          moment(time).add(1, 'day'),
          moment(time).add(2, 'day'),
          moment(time).add(3, 'day'),
          moment(time).add(4, 'day'),
          moment(time).add(5, 'day'),
          moment(time).add(6, 'day'),
        ],
        data: {
          series1: [100, 25, 36, 47, 0, 50, 80],
          series2: [80, 36, 25, 47, 15, 100, 0],
        },
      };

      const chartOptions = {
        type: 'line',
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
          type: 'time',
          showGrid: true,
          categoryMode: true,
          timeFormat: 'MM/DD',
          interval: 'day',
        }],
        axesY: [{
          type: 'linear',
          showGrid: false,
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

<style lang="scss">
</style>
