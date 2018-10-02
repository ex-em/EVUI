<template>
  <div>
    <chart
      :data="stackBarChartData"
      :options="stackBarChartOptions"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        stackBarChartData: {
          series: {
            series1: { name: 'series#1', show: true },
            series2: { name: 'series#2', show: true },
            series3: { name: 'series#3', show: true },
            series4: { name: 'series#4', show: true },
          },
          groups: [
            ['series1', 'series2', 'series3', 'series4'],
          ],
          data: [
            ['x',
              '2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
              '2017/01/01 00:03:00', '2017/01/01 00:04:00'],
            ['series1', 100, 150, 50, 200, 350],
            ['series2', 200, 100, null, 300, 400],
            ['series3', 150, 100, 50, 350, 450],
            ['series4', 200, 50, 500, 0, 300],
          ],
        },
        stackBarChartOptions: {
          type: 'bar',
          width: '100%',
          height: '350px',
          thickness: 0.8,
          stack: true,
          xAxes: [{
            scaleType: 'step',
            labelType: 'category',
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
  };
</script>
