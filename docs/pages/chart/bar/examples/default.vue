<template>
  <div>
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <br>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        chartData: {
          series: {
            series1: { name: 'series#1' },
          },
          labels: [
            'value1',
            'value2',
            'value3',
            'value4',
            'value5',
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        chartOptions: {
          type: 'bar',
          thickness: 0.8,
          width: '100%',
          title: {
            text: 'Default Bar Chart',
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
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: false,
          }],
        },
      };
    },
  };
</script>
