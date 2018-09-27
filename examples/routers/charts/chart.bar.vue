<template>
  <chart
    ref="defaultChart"
    :data="defaultData"
    :options="lineOptions"
  />
</template>
<script>
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        defaultData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line', fill: true, point: true },
            series2: { name: 'series#2', show: true, type: 'line', fill: true, point: true },
            series3: { name: 'series#3', show: true, type: 'line', fill: true, point: true },
          },
          groups: [
            ['series1', 'series2', 'series3'],
          ],
          data: [
            ['x',
              '2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
              '2017/01/01 00:03:00', '2017/01/01 00:04:00'],
            ['series1', 100, 150, 50, 200, 350],
            ['series2', 200, 100, null, 300, 400],
            ['series3', 150, 0, 0, 350, 450],
          ],
        },
        lineOptions: {
          type: 'bar',
          width: '100%',
          height: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          thickness: 0.8,
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: false,
          xAxes: [{
            scaleType: 'step',
            labelType: 'category',
            interval: 'minute',
            timeFormat: 'HH:mm:ss',
            showGrid: true,
          }],
          yAxes: [{
            scaleType: 'auto',
            labelType: 'linear',
            autoScaleRatio: 0.1,
            showGrid: true,
          }],
        },
      };
    },
    destroyed() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    methods: {
    },
  };
</script>
<style>
</style>
