<template>
  <div>
    <chart
      :data="defaultBarChartData"
      :options="defaultBarChartOptions"
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
        defaultBarChartData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'series1',
              name: 'series#1',
              data: [5, 3, 6, 8, 9],
            },
            {
              id: 'series2',
              name: 'series#2',
              data: [3, 8, 10, 5, 3],
            },
          ],
        },
        defaultBarChartOptions: {
          type: 'bar',
          width: '600px',
          height: '350px',
          tickness: 0.8,
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
