<template>
  <div>
    <ev-chart
      :data="defaultBarChartData"
      :options="defaultBarChartOptions"
    />
    <br>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        defaultBarChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'bar' },
          },
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        defaultBarChartOptions: {
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
          axesX: [{
            type: 'step',
            showGrid: false,
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
