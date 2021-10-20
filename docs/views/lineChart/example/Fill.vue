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
          series2: { name: 'series#2', fill: true, point: false },
        },
        labels: [
          dayjs(time),
          dayjs(time).add(1, 'day'),
          dayjs(time).add(2, 'day'),
          dayjs(time).add(3, 'day'),
          dayjs(time).add(4, 'day'),
          dayjs(time).add(5, 'day'),
          dayjs(time).add(6, 'day'),
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
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          formatter: (value) => {
            const day = dayjs(value).format('MM/DD');

            if (day === '10/25') {
              return `${day} (Peak!)`;
            }

            return day;
          },
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        maxTip: {
          use: true,
          showIndicator: true,
          indicatorColor: '#FF0000',
          tipBackground: '#000000',
          tipTextColor: '#FFFFFF',
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
