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
          },
          labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        lineOptions: {
          type: 'line',
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
          axesX: [{
            type: 'time',
            timeFormat: 'HH:mm:ss',
            interval: 'minute',
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
    mounted() {
      setInterval(() => this.test1(), 2000);
    },
    methods: {
      test1() {
        this.$data.defaultData = {
          series: {
            series1: { name: 'series#1', show: true, type: 'line', fill: true, point: true },
          },
          labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
          ],
            data: {
            series1: [
              this.getRandomInt(),
              this.getRandomInt(),
              this.getRandomInt(),
              this.getRandomInt(),
              this.getRandomInt(),
            ],
          },
        };
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
      },
    },
  };
</script>
<style>
</style>
