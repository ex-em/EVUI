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
            ['series1', 'series2'],
          ],
          // labels: [],
          labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
            series2: [200, 100, 71, 300, 400],
            series3: [
              { x: +new Date('2017/01/01 00:02:00'), y: 100 },
              { x: +new Date('2017/01/01 00:03:00'), y: 200 },
              { x: +new Date('2017/01/01 00:04:00'), y: 300 },
              { x: +new Date('2017/01/01 00:05:00'), y: 100 },
              { x: +new Date('2017/01/01 00:06:00'), y: 401 },
            ],
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
            type: 'log',
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
      // this.interval2 = setTimeout(() => this.updateChartData2(), 3000);
      // this.interval3 = setTimeout(() => this.updateChartData3(), 10000);
    },
    methods: {
      updateChartData() {
        this.lineOptions.width = '40%';

        if (this.interval) {
          clearTimeout(this.interval);
        }
      },
      updateChartData2() {
        const dchart = this.$refs.defaultChart;
        dchart.addSeries('series1', { name: 'series#1', show: true, type: 'line', fill: true, point: true });
        dchart.addAxisLabel('2017/01/01 00:00:00');
        dchart.addAxisLabel('2017/01/01 00:01:00');
        dchart.addGraphData('series1', 200);
        dchart.updateChart();
        if (this.interval2) {
          clearTimeout(this.interval2);
        }
      },
      updateChartData3() {
        const dchart = this.$refs.defaultChart;
        const tempLabel = ['2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
           '2017/01/01 00:03:00', '2017/01/01 00:04:00'];
        const tempData = {
          series1: [100, 150, 50, 200, 350],
          series2: [200, 100, null, 300, 400],
        };
        const tempSeries = {
          series1: { name: 'series#1', show: true, type: 'line', fill: true, point: true },
          series2: { name: 'series#2', show: true, type: 'line', fill: true, point: true },
          series3: { name: 'series#3', show: true, type: 'line', fill: true, point: true },
        };
        dchart.updateAxisLabelSet(tempLabel);
        dchart.updateGraphDataSet(tempData);
        dchart.updateSeriesSet(tempSeries);
        dchart.updateChart();
        if (this.interval3) {
          clearTimeout(this.interval3);
        }
      },
    },
  };
</script>
<style>
</style>
