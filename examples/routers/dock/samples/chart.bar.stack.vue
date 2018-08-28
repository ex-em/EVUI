<template>
  <div>
    <ev-chart
      :data="stackData"
      :options="chartOptions"
    />
  </div>
</template>
<script>
  export default {
    name: 'StackedBarChart',
    data() {
      return {
        stackData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              data: [3, 8, 10, 5, 3],
            },
            {
              id: 'simple2',
              name: 'simple2',
              data: [5, 3, 6, 8, 9],
            },
          ],
        },
        chartOptions: {
          type: 'bar',
          width: '100%',
          height: '100%',
          tickness: 0.8,
          fill: true,
          stack: true,
          xAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            position: 'left',
          }],
        },
      };
    },
  };
</script>
<style>
</style>
