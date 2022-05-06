<template>
  <ev-chart
      :data="chartData"
      :options="chartOptions"
  />
</template>

<script>
import { reactive } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: true,
              decimalPoint: 2,
            },
          },
        },
        labels: {
          x: ['2020', '2021', '2022'],
          y: ['Q1', 'Q2', 'Q3', 'Q4'],
        },
        data: {
          series1: [
            { x: '2020', y: 'Q1', value: 46.57 },
            { x: '2020', y: 'Q2', value: 50.22 },
            { x: '2020', y: 'Q3', value: 45.10 },
            { x: '2020', y: 'Q4', value: 57.35 },
            { x: '2021', y: 'Q1', value: 60.55 },
            { x: '2021', y: 'Q2', value: 63.35 },
            { x: '2021', y: 'Q3', value: 58.67 },
            { x: '2021', y: 'Q4', value: 57.55 },
            { x: '2022', y: 'Q1', value: 66.12 },
            { x: '2022', y: 'Q2', value: 80.15 },
            { x: '2022', y: 'Q3', value: 82.22 },
            { x: '2022', y: 'Q4', value: 84.00 },
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
          use: true,
        },
        axesX: [{
          type: 'step',
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        heatMapColor: {
          min: '#F9945A',
          max: '#9D3B02',
          categoryCnt: 4,
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 2,
            radius: 10,
          },
          decimalPoint: 2,
        },
        tooltip: {
          use: true,
        },
        legend: {
          type: 'gradient',
          position: 'bottom',
        },
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
