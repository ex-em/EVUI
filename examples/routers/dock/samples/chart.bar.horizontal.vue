<template>
  <div style="width: 100%; height: 100%; display: inline-flex;">
    <ev-chart
      :data="stackData"
      :options="horizontalOptions"
    />
  </div>
</template>
<script>
  export default {
    name: 'HorizontalBarChart',
    data() {
      return {
        stackData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              stack: true,
              data: [5, 3, 6, 8, 9],
            },
            {
              id: 'simple2',
              name: 'simple2',
              stack: true,
              data: [3, 8, 10, 5, 3],
            },
          ],
        },
        horizontalOptions: {
          type: 'bar',
          width: '400px',
          height: '350px',
          tickness: 0.8,
          horizontal: true,
          xAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            tickFormat: 'hh:mm:ss',
            showGrid: false,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
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
