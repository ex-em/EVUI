<template>
  <div style="width: 100%; height: 100%; display: block; overflow: auto;">
    <chart
      ref="defaultChart"
      :data="defaultData"
      :options="lineOptions"
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
        defaultData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line' },
            series2: { name: 'series#2', show: true, type: 'line' },
            series3: { name: 'series#3', show: true, type: 'line' },
          },
          data: [
            ['x',
              '2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
              '2017/01/01 00:03:00', '2017/01/01 00:04:00', '2017/01/01 00:05:00',
              '2017/01/01 00:06:00', '2017/01/01 00:07:00'],
            ['series1', 100, 150, 100, 200, 350, 300],
            ['series2', 200, 100, 250, 300, 400],
            ['series3', 150, 300, 350, 350, 450],
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
          legend: {
            show: false,
          },
          xAxes: [{
            scaleType: 'step',
            labelType: 'time',
            interval: 'minute',
            tickFormat: 'HH:mm:ss',
            showGrid: true,
          }],
          yAxes: [{
            scaleType: 'auto',
            labelType: 'linear',
            showGrid: true,
          }],
        },
        lastData: '2018-05-25 05:21:00',
      };
    },
    mounted() {
      // this.addData();
    },
    destroyed() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    methods: {
      addData() {
        const chartWrapper = this.$refs.defaultChart;
        const dataStore = chartWrapper.chart.store;

        dataStore.addSeries('series1', { name: 'series#1', show: true, type: 'line' });
        dataStore.addSeries('series2', { name: 'series#2', show: true, type: 'line' });

        // dataStore.addAxisData('x', '2018/01/01 00:00:00', 0);
        // dataStore.addAxisData('x', '2018/01/01 00:01:00', 0);
        // dataStore.addAxisData('x', '2018/01/01 00:02:00', 0);
        // dataStore.addAxisData('x', '2018/01/01 00:03:00', 0);

        dataStore.addAxisData('x', 1, 0);
        dataStore.addAxisData('x', 2, 0);
        dataStore.addAxisData('x', 3, 0);
        dataStore.addAxisData('x', 4, 0);

        // dataStore.addGraphData('series1', '2018/01/01 00:00:00', 200);
        // dataStore.addGraphData('series1', '2018/01/01 00:01:00', 100);
        // dataStore.addGraphData('series1', '2018/01/01 00:02:00', 300);
        // dataStore.addGraphData('series1', '2018/01/01 00:03:00', 400);

        dataStore.addGraphData('series1', 1, 200);
        dataStore.addGraphData('series1', 2, 100);
        dataStore.addGraphData('series1', 3, 300);
        dataStore.addGraphData('series1', 4, 400);

        dataStore.addGraphDataSet('series2', [200, 300, 250, 400]);

        window.console.debug(dataStore.graphData, 'graphData');
        window.console.debug(dataStore.axisList, 'axisList');

        chartWrapper.chart.clearDraw();
        chartWrapper.chart.drawChart();
      },
    },
  };
</script>
<style>
</style>
