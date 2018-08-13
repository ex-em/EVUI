<template>
  <div>
    <ev-chart
      :data="simpleData"
      :options="chartOptions"
    />
  </div>
</template>
<script>
  export default {
    name: 'SimpleBarChart',
    data() {
      return {
        simpleData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              data: [5, 3, 6, 8, 9],
            },
            {
              id: 'simple2',
              name: 'simple2',
              point: true,
              data: [3, 8, 10, 5, 3],
            },
          ],
        },
        chartOptions: {
          type: 'bar',
          width: '400px',
          height: '350px',
          tickness: 0.8,
          xAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
            tickFormat: 'hh:mm:ss',
            showGrid: false,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            showGrid: true,
            position: 'left',
          }],
        },
      };
    },
  };
</script>
<style>
</style>
