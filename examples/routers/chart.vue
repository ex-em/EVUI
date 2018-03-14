<template>
  <div style="width: 800px; height: 600px;">
    <Chart
      :chart-data="chartData"
      :chart-props="chartProps"
      :chart-styles="chartStyles"
    />
  </div>
</template>
<script>
  import Chart from '@/components/chart';

  export default {
    components: {
      Chart,
    },
    data() {
      return {
        chartStyles: {
          width: '100%',
          height: '100%',
          background: '#AAFFEE',
        },
        chartProps: {
          title: {
            text: 'TEST TITLE',
            style: '20px Arial',
            color: '#000000',
            showTitle: true,
          },
          xAxis: [{
            unit: 'time',
            format: 'MM-DD',
          }],
          yAxis: [{
            position: 'left',
            axisTitle: 'Temp Y Axis',
            unit: 'number',
            showAxisTitle: false,
          }],
        },
        chartData: [{
          id: 'txn_elapse',
          label: 'Transaction Elapse',
          use: true,
          data: [
            { x: '2018-05-24', y: 10 },
            { x: '2018-05-25', y: 20 },
            { x: '2018-05-26', y: 10 },
            { x: '2018-05-27', y: 40 },
            { x: '2018-05-28', y: 20 },
            { x: '2018-05-29', y: 50 },
            { x: '2018-05-30', y: 30 },
            { x: '2018-05-31', y: 70 },
          ],
        }],
      };
    },
  };
</script>
<style>
</style>
