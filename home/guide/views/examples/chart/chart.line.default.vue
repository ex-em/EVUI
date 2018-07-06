<template>
  <div>
    <chart
      :data="defaultLineChartData"
      :options="defaultLineChartOptions"
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
        defaultLineChartData: {
          series: [
            {
              id: 'series1',
              name: 'series#1',
              point: true,
              data: [
                { x: '2018-05-25 05:10:00', y: 20 },
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
            {
              id: 'series2',
              name: 'series#2',
              point: true,
              data: [
                { x: '2018-05-25 05:10:00', y: 15 },
                { x: '2018-05-25 05:11:00', y: 17 },
                { x: '2018-05-25 05:13:00', y: 20 },
                { x: '2018-05-25 05:14:00', y: 30 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
          ],
        },
        defaultLineChartOptions: {
          type: 'line',
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
