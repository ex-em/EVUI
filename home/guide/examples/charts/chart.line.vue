<template>
  <div style="width: 100%; height: 100%; display: inline-flex;">
    <chart
      :data="simpleData"
      :options="lineOptions"
    />
    <chart
      :data="fillData"
      :options="lineOptions"
    />
    <chart
      :data="stackData"
      :options="lineOptions"
    />
    <chart
      :data="simpleData"
      :options="scatterOptions"
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
        simpleData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
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
              id: 'simple2',
              name: 'simple2',
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
        fillData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              point: true,
              fill: true,
              data: [
                { x: '2018-05-25 05:10:00', y: 20 },
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
            {
              id: 'simple2',
              name: 'simple2',
              point: true,
              fill: true,
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
        stackData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              point: true,
              fill: true,
              stack: true,
              data: [
                { x: '2018-05-25 05:10:00', y: 20 },
                { x: '2018-05-25 05:11:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
              ],
            },
            {
              id: 'simple2',
              name: 'simple2',
              point: true,
              fill: true,
              stack: true,
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
        lineOptions: {
          type: 'line',
          width: '400px',
          height: '350px',
          xAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'hh:mm:ss',
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
        scatterOptions: {
          type: 'scatter',
          width: '400px',
          height: '350px',
          xAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'hh:mm:ss',
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
<style>
</style>
