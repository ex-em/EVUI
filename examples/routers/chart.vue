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
              show: true,
              point: true,
              fill: true,
              stack: true,
              pointStyle: 'rectRot',
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [
                { x: '2018-05-25 05:10:00', y: 15 },
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: null },
                { x: '2018-05-25 05:17:00', y: 37 },
                { x: '2018-05-25 05:18:00', y: 20 },
                { x: '2018-05-25 05:19:00', y: 15 },
                { x: '2018-05-25 05:20:00', y: 20 },
              ],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              point: true,
              pointStyle: 'crossRot',
              fill: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [
                { x: '2018-05-25 05:10:00', y: 15 },
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:12:00', y: 20 },
                { x: '2018-05-25 05:13:00', y: null },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: 5 },
                { x: '2018-05-25 05:17:00', y: 25 },
                { x: '2018-05-25 05:18:00', y: 20 },
                { x: '2018-05-25 05:20:00', y: 10 },
              ],
            },
          ],
        },
        chartOptions: {
          type: 'scatter',
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
            position: 'bottom',
            interval: 'minute',
            // min: '2018-05-25 00:10:00',
            // max: '2018-05-25 00:12:10',
          }],
          yAxes: [{
            type: 'linear',
            showGrid: false,
            position: 'left',
          }],
          // yAxes: [{
          //   type: 'linear',
          //   showGrid: true,
          //   min: 10,
          //   max: 50,
          // }],
          // xAxes: [{
          //   type: 'time', // linear, step, time
          //   tickFormat: 'hh:mm:ss',
          //   showGrid: true,
          //   interval: 'minute',
          // }],
        },
      };
    },
  };
</script>
<style>
</style>
