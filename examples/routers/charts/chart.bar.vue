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
          groups: [
          ],
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
          axesX: [{
            type: 'step',
            showGrid: false,
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
