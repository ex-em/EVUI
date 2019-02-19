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
            series1: { name: 'series#1', show: true, type: 'bar', fill: true, point: true },
          },
          // groups: [
          //   ['series1', 'series2', 'series3'],
          // ],
          labels: [
            'aeeeeeeeeeee',
            'b',
            'c',
            'd',
            'e',
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        lineOptions: {
          width: '100%',
          height: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: false,
          axesX: [{
            type: 'step',
          }],
          axesY: [{
            type: 'linear',
            startToZero: true,
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
