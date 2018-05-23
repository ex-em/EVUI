<template>
  <div style="width: 100%; height: 100%;">
    <div style="width: 400px; height: 400px; position: absolute;">
      <chart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
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
        chartData: {
          series: [
            {
              id: 'series0',
              name: 'series-0',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 10, 6],
            },
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [10, 12, 8],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [15, 10, 20],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 15, 10],
            },
          ],
        },
        chartOptions: {
          type: 'pie',
          width: '100%',
          height: '100%',
          border: 2,
          doughnutHoleSize: 0.4,
          title: {
            text: 'EVUI CHART 2.0',
            style: '20px Droid Sans',
            color: '#000000',
            height: 50,
            show: true,
          },
        },
      };
    },
  };
</script>
<style>
</style>
