<template>
  <div style="width: 100%; height: 100%;">
    <div style="width: 700px; height: 600px; position: absolute;">
      <chart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <div style="width: 700px; height: 600px; position: absolute; left: 800px;">
      <chart
        :data="chartData2"
        :options="chartOptions2"
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
          category: [
            'category1', 'category2', 'category3', 'category4', 'category5', 'category6',
            'category7', 'category8', 'category9', 'category10', 'category11', 'category12',
            'category13', 'category14', 'category15', 'categorasdfasfasy16', 'category17', 'category18',
            'category19', 'category20', 'category21',
          ],
          // category: [1, 2, 3, 4, 5, 6, 7],
          series: [
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8, 15, 3, 5, 6, 7, 8, 9, 3, 2, 4, 7, 10],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [3, 8, 10, 5, 3, 9, 3, 8, 5, 10, 10, 5, 3, 6, 7, 3, 6, 10, 7, 4, 25],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              stack: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8, 15, 3, 5, 6, 7, 8, 9, 3, 2, 4, 7, 10],
            },
          ],
        },
        chartData2: {
          category: [
            'category1', 'category2', 'category3', 'category4', 'category5', 'category6',
            'category7', 'category8', 'category9', 'category10', 'category11', 'category12',
            'category13', 'category14', 'category15', 'categorasdfasfasy16', 'category17', 'category18',
            'category19', 'category20', 'category21',
          ],
          // category: [1, 2, 3, 4, 5, 6, 7],
          series: [
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8, 15, 3, 5, 6, 7, 8, 9, 3, 2, 4, 7, 10],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [3, 8, 10, 5, 3, 9, 3, 8, 5, 10, 10, 5, 3, 6, 7, 3, 6, 10, 7, 4, 25],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: [5, 3, 6, 8, 9, 3, 10, 5, 8, 15, 3, 5, 6, 7, 8, 9, 3, 2, 4, 7, 10],
            },
          ],
        },
        chartOptions: {
          type: 'bar',
          width: '100%',
          height: '100%',
          tickness: 1,
          legend: {
            show: true,
            position: 'right',
          },
          title: {
            text: 'EVUI CHART 2.0 (Stack Bar)',
            style: '20px Arial',
            color: '#000000',
            height: 50,
            show: true,
          },
          xAxes: [{
            type: 'linear', // linear, time
            showGrid: true,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            type: 'linear',
            showGrid: true,
            position: 'left',
          }],
        },
        chartOptions2: {
          type: 'bar',
          width: '100%',
          height: '100%',
          tickness: 1,
          legend: {
            show: true,
            position: 'right',
          },
          title: {
            text: 'EVUI CHART 2.0 (Column)',
            style: '20px Arial',
            color: '#000000',
            height: 50,
            show: true,
          },
          xAxes: [{
            type: 'linear', // linear, time
            showGrid: true,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            type: 'linear',
            showGrid: true,
            position: 'left',
          }],
        },
      };
    },
  };
</script>
<style>
</style>
