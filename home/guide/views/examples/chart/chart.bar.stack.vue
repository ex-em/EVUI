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
            series1: { name: 'series#1', show: true, type: 'bar' },
            series2: { name: 'series#2', show: true, type: 'bar' },
            series3: { name: 'series#3', show: true, type: 'bar' },
            series4: { name: 'series#4', show: true, type: 'bar' },
          },
          groups: [
            ['series1', 'series2', 'series3', 'series4'],
          ],
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
          ],
          data: {
            series1: [100, 150, 50, 150, 350],
            series2: [50, 100, 70, 80, 100],
            series3: [100, 100, 200, 150, 60],
            series4: [100, 80, 100, 150, 50],
          },
        },
        stackBarChartOptions: {
          thickness: 0.8,
          width: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
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
  };
</script>
