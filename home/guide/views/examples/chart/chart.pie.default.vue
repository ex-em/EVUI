<template>
  <div>
    <chart
      :data="defaultPieChartData"
      :options="defaultPieChartOptions"
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
        defaultPieChartData: {
          series: [
            {
              id: 'series1',
              name: 'series#1',
              data: [5, 10, 6],
            },
            {
              id: 'series2',
              name: 'series#2',
              data: [10, 12, 8],
            },
            {
              id: 'series3',
              name: 'series#3',
              data: [15, 10, 20],
            },
            {
              id: 'series4',
              name: 'series#4',
              data: [5, 15, 10],
            },
          ],
        },
        defaultPieChartOptions: {
          type: 'pie',
          width: '600px',
          height: '350px',
        },
      };
    },
  };
</script>
