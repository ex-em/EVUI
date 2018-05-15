<template>
  <div style="width: 100%; height: 100%;">
    <div style="width: 700px; height: 600px; position: absolute;">
      <chart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>
<script>
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        chartData: {
          category: [
            'category1', 'category2', 'category3', 'category4', 'category5', 'category6',
            'category7', 'category8', 'category9',
          ],
          series: [
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8],
            },
            {
              id: 'series2',
              name: 'series-1',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [7, 5, 3, 10, 8, 3, 5, 8, 6],
            },
            {
              id: 'series3',
              name: 'series-1',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8],
            },
            // {
            //   id: 'series1',
            //   name: 'series-1',
            //   show: true,
            //   point: true,
            //   fill: false,
            //   xAxisIndex: 0,
            //   yAxisIndex: 0,
            //   data: [
            //     { x: '2018-05-25 00:10:00', y: 20 },
            //     { x: '2018-05-25 00:11:00', y: 10 },
            //     { x: '2018-05-25 00:12:00', y: 20 },
            //     { x: '2018-05-25 00:14:00', y: 50 },
            //   ],
            // },
            // {
            //   id: 'series2',
            //   name: 'series-2',
            //   show: true,
            //   point: true,
            //   xAxisIndex: 0,
            //   yAxisIndex: 0,
            //   data: [
            //     { x: '2018-05-25 00:10:00', y: 22 },
            //     { x: '2018-05-25 00:10:30', y: 42 },
            //     { x: '2018-05-25 00:11:00', y: null },
            //     { x: '2018-05-25 00:12:20', y: 48 },
            //     { x: '2018-05-25 00:13:10', y: 32 },
            //   ],
            // },
          ],
        },
        chartOptions: {
          type: 'bar',
          width: '100%',
          height: '100%',
          tickness: 0.8,
          horizontal: true,
          title: {
            text: 'EVUI CHART 2.0',
            style: '20px Droid Sans',
            color: '#000000',
            height: 50,
            show: true,
          },
          xAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            // tickFormat: 'HH:m:s',
            showGrid: true,
            position: 'bottom',
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
