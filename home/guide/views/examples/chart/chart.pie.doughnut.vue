<template>
  <div>
    <chart
      :data="doughnutChartData"
      :options="doughnutChartOptions"
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
        doughnutChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line', fill: true, point: true },
            series2: { name: 'series#2', show: true, type: 'line', fill: true, point: true },
            series3: { name: 'series#3', show: true, type: 'line', fill: true, point: true },
          },
          data: [
            ['series1', 30, 100, 40],
            ['series2', 80, 200, 20],
            ['series3', 50, 150, 20],
          ],
        },
        doughnutChartOptions: {
          type: 'pie',
          width: '100%',
          height: '350px',
          doughnutHoleSize: 0.4,
        },
      };
    },
  };
</script>
