<template>
  <div>
    <chart
      :data="scatterLineChartData"
      :options="scatterLineChartOptions"
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
        scatterLineChartData: {
          series: [
            {
              id: 'series1',
              name: 'series#1',
              point: true,
              pointStyle: 'crossRot',
              data: [
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:12:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
            {
              id: 'series2',
              name: 'series#2',
              point: true,
              pointStyle: 'triangle',
              data: [
                { x: '2018-05-25 05:11:00', y: 15 },
                { x: '2018-05-25 05:12:00', y: 17 },
                { x: '2018-05-25 05:12:10', y: 5 },
                { x: '2018-05-25 05:12:20', y: 12 },
                { x: '2018-05-25 05:12:30', y: 7 },
                { x: '2018-05-25 05:13:00', y: 20 },
                { x: '2018-05-25 05:13:10', y: 15 },
                { x: '2018-05-25 05:13:20', y: 17 },
                { x: '2018-05-25 05:14:00', y: 30 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
            {
              id: 'series3',
              name: 'series#3',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 12 },
                { x: '2018-05-25 05:12:00', y: 13 },
                { x: '2018-05-25 05:13:00', y: 5 },
                { x: '2018-05-25 05:14:00', y: 7 },
                { x: '2018-05-25 05:15:00', y: 14 },
              ],
            },
          ],
        },
        scatterLineChartOptions: {
          type: 'scatter',
          width: '600px',
          height: '350px',
          legend: {
            show: true,
            position: 'right',
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'mm:ss', // moment.js
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
