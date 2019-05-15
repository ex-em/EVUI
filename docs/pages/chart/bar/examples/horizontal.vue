<template>
  <div>
    <ev-chart
      :data="horizontalBarChartData"
      :options="horizontalBarChartOptions"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  export default {
    data() {
      return {
        horizontalBarChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'bar' },
            series2: { name: 'series#2', show: true, type: 'bar' },
            series3: { name: 'series#3', show: true, type: 'bar' },
            series4: { name: 'series#4', show: true, type: 'bar' },
          },
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
          ],
          data: {
            series1: [100, 150, 50, 150, 350],
            series2: [50, 100, 70, 80, 100],
            series3: [100, 100, 200, 150, 60],
            series4: [100, 80, 100, 150, 50],
          },
        },
        horizontalBarChartOptions: {
          thickness: 0.8,
          width: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: true,
          axesX: [{
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: false,
          }],
          axesY: [{
            type: 'step',
            showGrid: false,
          }],
        },
      };
    },
  };
</script>
