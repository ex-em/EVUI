<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
  import { reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const currentTime = dayjs();
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            colorOpt: {
              min: '#B3E148',
              max: '#6B9900',
              categoryCnt: 5,
              border: '#242426',
              error: '#FF5A5A',
            },
            spaces: {
              x: 6,
              y: 6,
            },
          },
        },
        data: {
          series1: [
            { x: currentTime, y: 5, count: 10 },
            { x: currentTime, y: 10, count: 1 },
            { x: currentTime, y: 30, count: 20 },
            { x: currentTime.add(1, 'second'), y: 10, count: 22 },
            { x: currentTime.add(1, 'second'), y: 15, count: 5 },
            { x: currentTime.add(1, 'second'), y: 20, count: 10 },
            { x: currentTime.add(2, 'second'), y: 5, count: -1 },
            { x: currentTime.add(2, 'second'), y: 20, count: 9 },
            { x: currentTime.add(3, 'second'), y: 5, count: 16 },
            { x: currentTime.add(3, 'second'), y: 15, count: 12 },
            { x: currentTime.add(3, 'second'), y: 30, count: -1 },
            { x: currentTime.add(1, 'second'), y: 5, count: 10 },
            { x: currentTime.add(1, 'second'), y: 10, count: 10 },
            { x: currentTime.add(4, 'second'), y: 20, count: 19 },
            { x: currentTime.add(4, 'second'), y: 25, count: 5 },
            { x: currentTime.add(4, 'second'), y: 30, count: 1 },
            { x: currentTime.add(5, 'second'), y: 5, count: 19 },
            { x: currentTime.add(5, 'second'), y: 10, count: 5 },
            { x: currentTime.add(5, 'second'), y: 20, count: 1 },
          ],
        },
      });


      const chartOptions = {
        type: 'heatMap',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        indicator: {
          use: false,
        },
        dragSelection: {
          use: true,
          keepDisplay: true,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
        }],
        selectItem: {
          use: true,
        },
        legend: {
          position: 'right',
        },
        tooltip: {
          use: true,
        },
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
