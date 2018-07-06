<template>
  <div>
    <chart
      :data="stackBarChartData"
      :options="stackBarChartOptions"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        stackBarChartData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'series1',
              name: 'series#1',
              stack: true,
              data: [5, 3, 6, 8, 9],
            },
            {
              id: 'series2',
              name: 'series#2',
              stack: true,
              data: [3, 8, 10, 5, 3],
            },
          ],
        },
        stackBarChartOptions: {
          type: 'bar',
          width: '600px',
          height: '350px',
          tickness: 0.5,
          xAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
            showGrid: false,
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            showGrid: true,
          }],
        },
      };
    },
  };
</script>
