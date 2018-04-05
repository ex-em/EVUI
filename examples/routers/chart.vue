<template>
  <div style="width: 800px; height: 600px;">
    <chart
      :data="chartData"
      :options="chartOptions"
    />
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
          series: [
            {
              id: 'series1',
              name: 'series-1',
              color: '#ee15aa',
              show: true,
              point: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [
                { x: '2018-05-25 00:10:00', y: 20 },
                { x: '2018-05-25 00:11:00', y: 10 },
                { x: '2018-05-25 00:13:00', y: 20 },
                { x: '2018-05-25 00:14:00', y: 50 },
              ],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              point: true,
              pointSize: 6,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [
                { x: '2018-05-25 00:10:00', y: 22 },
                { x: '2018-05-25 00:10:20', y: 42 },
                { x: '2018-05-25 00:11:00', y: null },
                { x: '2018-05-25 00:12:20', y: 15 },
                { x: '2018-05-25 00:14:00', y: 32 },
              ],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              point: true,
              pointSize: 4,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [
                { x: '2018-05-25 00:10:00', y: 25 },
                { x: '2018-05-25 00:11:00', y: 18 },
                { x: '2018-05-25 00:12:00', y: 37 },
                { x: '2018-05-25 00:12:10', y: 31 },
                { x: '2018-05-25 00:12:15', y: 33 },
                { x: '2018-05-25 00:13:00', y: 15 },
                { x: '2018-05-25 00:14:00', y: 10 },
              ],
            },
          ],
        },
        chartOptions: {
          type: 'LINE',
          width: '100%',
          height: '100%',
          title: {
            text: 'EVUI CHART 2.0 (LINE)',
            style: '20px Arial',
            color: '#000000',
            height: 50,
            show: true,
          },
          xAxes: [{
            type: 'time', // linear, step, time
            tickFormat: 'hh:mm:ss',
            showGrid: true,
            min: '2018-05-25 00:10:00',
            max: '2018-05-25 00:14:00',
          }],
          yAxes: [{
            type: 'linear',
            showGrid: true,
            min: 10,
            max: 50,
          }],
        },
      };
    },
  };
</script>
<style>
</style>
