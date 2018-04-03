<template>
  <div style="width: 800px; height: 600px;">
    <Chart
      :chart-data="chartData"
      :chart-props="chartProps"
      :chart-styles="chartStyles"
      :chart-type="chartType"
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
        chartType: 'line',
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
            show: true,
          },
          yAxes: [{
            position: 'left',
            axisTitle: 'Temp Y Axis',
            unit: 'number',
            showAxisTitle: false,
          }],
        },
        chartData: {
          series: [
            {
              id: 'series1',
              label: 'first series',
              color: '#5a5dc0',
              visible: true,
              line: true,
              point: true,
            },
            {
              id: 'series2',
              label: 'second series',
              color: '#76d0a9',
              visible: true,
              line: true,
              point: true,
            },
          ],
          data: {
            series1: [
              { x: '2018-05-25', y: 20 },
              { x: '2018-05-26', y: 10 },
              { x: '2018-05-27', y: 40 },
              { x: '2018-05-28', y: 20 },
              { x: '2018-05-29', y: 50 },
            ],
            series2: [
              { x: '2018-05-25', y: 50 },
              { x: '2018-05-26', y: 20 },
              { x: '2018-05-27', y: 30 },
              { x: '2018-05-28', y: 30 },
              { x: '2018-05-29', y: 50 },
            ],
          },
        },
      };
    },
  };
</script>
<style>
</style>
