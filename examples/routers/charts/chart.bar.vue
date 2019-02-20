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
            // series2: { name: 'series#2', show: true, type: 'bar', fill: true, point: true },
            // series3: { name: 'series#3', show: true, type: 'bar', fill: true, point: true },
          },
          groups: [
          ],
          // labels: [
          //   'aeeeeeeeeeee',
          //   'b',
          //   'c',
          //   'd',
          //   'e',
          // ],
          labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
            // series2: [200, 50, 100, 300, 150],
            // series3: [100, 200, 300, 100, 401],
            // series3: [
            //   { x: 'b', y: 100 },
            //   { x: 'c', y: 200 },
            //   { x: 'd', y: 300 },
            //   { x: 'e', y: 100 },
            //   { x: 'f', y: 401 },
            // ],
            series3: [
              // { x: 100, y: 'b' },
              // { x: 200, y: 'c' },
              // { x: 300, y: 'd' },
              // { x: 100, y: 'e' },
              // { x: 401, y: 'f' },
            ],
          },
        },
        lineOptions: {
          thickness: 0.8,
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
          // axesX: [{
          //   type: 'step',
          //   showGrid: false,
          // }],
          axesX: [{
            type: 'time',
            timeFormat: 'HH:mm:ss',
            interval: 'minute',
          }],
          axesY: [{
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: false,
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
      setInterval(() => this.test1(), 1000);
    },
    methods: {
      test1() {
        this.$data.defaultData.data.series1 =
          [
            this.getRandomInt(),
            this.getRandomInt(),
            this.getRandomInt(),
            this.getRandomInt(),
            this.getRandomInt(),
          ];

        // this.$data.defaultData = {
        //   series: {
        //     series1: { name: 'series#1', show: true, type: 'line', fill: true, point: true },
        //   },
        //   labels: [
        //     +new Date('2017/01/01 00:00:00'),
        //     +new Date('2017/01/01 00:01:00'),
        //     +new Date('2017/01/01 00:02:00'),
        //     +new Date('2017/01/01 00:03:00'),
        //     +new Date('2017/01/01 00:04:00'),
        //   ],
        //     data: {
        //     series1: [
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //     ],
        //   },
        // };
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
      },
    },
  };
</script>
<style>
</style>
