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
      const count = 999;
      const chartData = {
        series: Array(count).fill(0).reduce((acc, _, idx) => {
          acc[`series${idx + 1}`] = { name: `series#${idx + 1}`, fill: true, point: true };
          return acc;
        }, {}),
        groups: [Array(count).fill(0).map((_, idx) => `series${idx + 1}`)],
        labels: Array(10).fill(0).map((_, index) => dayjs(time).add(index, 'day')),
        data: Array(count).fill(0).reduce((acc, _, idx) => {
          acc[`series${idx + 1}`] = Array(10).fill(0).map(() => Math.floor(Math.random() * 100));
          return acc;
        }, {}),
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
          virtualScroll: true,
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
