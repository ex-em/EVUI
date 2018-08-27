<template>
  <div style="width: 100%; height: 100%;">
    <ev-chart
      :data="simpleData"
      :options="lineOptions"
    />
  </div>
</template>
<script>
  export default {
    name: 'SimpleLineChart',
    data() {
      return {
        simpleData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 20 },
                { x: '2018-05-25 05:12:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: 20 },
                { x: '2018-05-25 05:17:00', y: 10 },
                { x: '2018-05-25 05:18:00', y: 10 },
                { x: '2018-05-25 05:19:00', y: 13 },
                { x: '2018-05-25 05:20:00', y: 20 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
            {
              id: 'simple2',
              name: 'simple2',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 15 },
                { x: '2018-05-25 05:12:00', y: 17 },
                { x: '2018-05-25 05:13:00', y: 20 },
                { x: '2018-05-25 05:14:00', y: 30 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: 10 },
                { x: '2018-05-25 05:17:00', y: 25 },
                { x: '2018-05-25 05:18:00', y: 31 },
                { x: '2018-05-25 05:19:00', y: 11 },
                { x: '2018-05-25 05:20:00', y: 17 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
          ],
        },
        lineOptions: {
          type: 'line',
          width: '100%',
          height: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'HH:mm:ss',
            interval: 'minute',
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
