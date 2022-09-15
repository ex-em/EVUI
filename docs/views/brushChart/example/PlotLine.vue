<template>
  <ev-chart-group>
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <ev-chart-brush/>
  </ev-chart-group>
</template>

<script>
import { reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
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
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      padding: {
        right: 50,
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
        plotLines: [{
          color: '#FF0000',
          value: chartData.labels[5],
          segments: [6, 2],
          label: {
            show: true,
            text: 'X Plot Line',
            textAlign: 'right',
          },
        }],
        plotBands: [{
          color: 'rgba(250, 222, 76, 0.8)',
          from: chartData.labels[2],
          to: chartData.labels[3],
          label: {
            show: true,
            text: 'X Plot Band ZONE',
            fontColor: '#FFA500',
          },
        }],
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
        plotLines: [{
          color: '#FF0000',
          value: 50,
          segments: [6, 2],
          label: {
            show: true,
            text: 'Y Plot Line',
          },
        }],
        plotBands: [{
          color: 'rgba(250, 222, 76, 0.8)',
          from: 20,
          to: 40,
          label: {
            show: true,
            text: 'Y Plot Band',
            fontColor: '#FFA500',
            verticalAlign: 'bottom',
          },
        }],
      }],
    });

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style lang="scss">
</style>
