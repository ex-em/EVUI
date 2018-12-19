<template>
  <chart
    ref="defaultChart"
    :data="defaultData"
    :options="lineOptions"
  />
</template>
<script>
  import moment from 'moment';
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
            // ['series1', 'series3'],
          ],
          data: [
            // ['x',
            //   '2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
            //   '2017/01/01 00:03:00', '2017/01/01 00:04:00'],
            // ['series1', 100, 150, 50, 200, 350],
            // ['series2', 200, 100, null, 300, 400],
            // ['series3', 150, 0, 0, 350, 450],
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
          bufferSize: 10,
          thickness: 0.8,
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: false,
          xAxes: [{
            scaleType: 'fix',
            labelType: 'time',
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
        lastData: '2018-05-25 05:21:00',
      };
    },
    mounted() {
      this.interval = setInterval(this.lineAddData.bind(this), 1000);
    },
    destroyed() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    methods: {
      lineAddData() {
        const line = this.$refs.defaultChart;

        const randomData1 = Math.floor((Math.random() * 30) + 1);
        const randomData2 = Math.floor((Math.random() * 30) + 1);

        this.lastData = moment(this.lastData).add(1, 'm').format('YYYY-MM-DD HH:mm:ss');

        line.addAxisData('x', this.lastData);
        line.addGraphData('series1', this.lastData, randomData1);
        line.addGraphData('series2', this.lastData, randomData2);
        line.chart.redraw();
      },
    },
  };
</script>
<style>
</style>
