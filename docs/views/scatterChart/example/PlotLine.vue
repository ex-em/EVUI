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
      const currentTime = dayjs();

      const chartData = {
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
        },
        data: {
          series1: [
            { x: currentTime, y: 1 },
            { x: currentTime.subtract(1, 'second'), y: 20 },
            { x: currentTime.subtract(1, 'second'), y: 30 },
            { x: currentTime.subtract(2, 'second'), y: 10 },
          ],
          series2: [
            { x: currentTime, y: 20 },
            { x: currentTime.subtract(2, 'second'), y: 20 },
            { x: currentTime.subtract(3, 'second'), y: 13 },
            { x: currentTime.subtract(4, 'second'), y: 1 },
          ],
          series3: [
            { x: currentTime, y: 30 },
            { x: currentTime.subtract(2, 'second'), y: 5 },
            { x: currentTime.subtract(3, 'second'), y: 23 },
            { x: currentTime.subtract(5, 'second'), y: 40 },
            { x: currentTime.subtract(6, 'second'), y: 20 },
          ],
        },
      };

      const chartOptions = {
        type: 'scatter',
        width: '100%',
        padding: {
          right: 50,
        },
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
          timeFormat: 'HH:mm:ss',
          interval: 'second',
          plotLines: [{
            color: '#FF0000',
            value: currentTime.subtract(5, 'second'),
            segments: [6, 2],
            label: {
              show: true,
              fillColor: '#E0E0E0',
              text: 'X Plot Line',
              maxWidth: 40,
              textOverflow: 'ellipsis',
            },
          }],
          plotBands: [{
            color: 'rgba(250, 222, 76, 0.8)',
            from: currentTime.subtract(2, 'second'),
            to: currentTime.subtract(3, 'second'),
            label: {
              show: true,
              text: 'X Plot Band Zone',
              fontColor: '#FFA500',
              textOverflow: 'ellipsis',
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
            value: 40,
            segments: [6, 2],
            label: {
              show: true,
              text: 'Y Plot Line',
            },
          }],
          plotBands: [{
            color: 'rgba(250, 222, 76, 0.8)',
            from: 10,
            to: 15,
            label: {
              show: true,
              fillColor: '#E0E0E0',
              text: 'Y Plot Band Zone',
              fontColor: '#FFA500',
              textOverflow: 'ellipsis',
              verticalAlign: 'top',
            },
          }],
        }],
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
