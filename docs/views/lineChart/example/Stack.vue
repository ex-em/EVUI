<template>
  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
  import dayjs from 'dayjs';

  export default {
    setup() {
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const chartData = {
        series: {
          series1: { name: 'series#1', fill: true, point: false },
          series2: { name: 'series#2', fill: true, point: false, show: true },
          series3: { name: 'series#3', fill: true, point: false },
          series4: { name: 'series#4', fill: true, point: false, show: true },
        },
        groups: [
          ['series1', 'series2', 'series3', 'series4'],
        ],
        labels: [
          dayjs(time),
          dayjs(time).add(1, 'day'),
          dayjs(time).add(2, 'day'),
          dayjs(time).add(3, 'day'),
          dayjs(time).add(4, 'day'),
          dayjs(time).add(5, 'day'),
          dayjs(time).add(6, 'day'),
          dayjs(time).add(7, 'day'),
        ],
        data: {
          // series1: [100, 25, 47, 47, null, 50, 100],
          // series2: [100, 25, 47, 47, null, null, null],
          series3: [100, 50, 47, 50, 40, null, 50, 100],
          series1: [100, 25, 47, 47, 40, 50, 100, 100],
          series2: [100, 25, 47, 47, 40, null, 100, 100],
          series4: [100, 50, 50, 50, 40, 100, 100, 100],
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
        tooltip: {
          use: true,
        },
        axesX: [{
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
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
