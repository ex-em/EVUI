<template>
  <div>
    <ev-chart
      :data="defaultBarChartData"
      :options="defaultBarChartOptions"
      @on-dblclick="onDblClick"
      @on-click="onClick"
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
              series2: { name: 'series#2', show: true, type: 'bar' },
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
              series2: [100, 150, 51, 150, 350],
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
    methods: {
      onDblClick(e) {
        console.log(e, 'on doubled click');
      },
      onClick(e) {
        console.log(e, 'on click');
      },
    },
  };
</script>
