<template>
  <div class="article-title">
    <h1> Chart Test Page </h1>
    <div class="case">
      <ev-chart
        :data="chartData"
        :options="chartOptions1"
      />
      <br>
      <p>scrollbar.sortByValue : true (default)</p>
      <p>scrollbar.use : false (default)</p>
    </div>
    <br><br>
    <div class="case">
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
      <br>
      <p>scrollbar.use : true</p>
      <p>scrollbar.maxSeriesCount : 5</p>
    </div>
    <br><br>
    <div class="case">
      <ev-chart
        :data="chartData1"
        :options="chartOptions2"
      />
      <br>
      <p>scrollbar.sortByValue : false</p>
    </div>
  </div>
</template>

<script>
  import { onMounted, reactive } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import moment from 'moment';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', point: false },
          series2: { name: 'series#2', point: false },
          series3: { name: 'series#3', point: false },
          series4: { name: 'series#4', point: false },
          series5: { name: 'series#5', point: false },
          series6: { name: 'series#6', point: false },
          series7: { name: 'series#7', point: false },
          series8: { name: 'series#8', point: false },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
          series4: [],
          series5: [],
          series6: [],
          series7: [],
          series8: [],
        },
      });

      const chartOptions = {
        type: 'line',
        width: '100%',
        height: '100%',
        legend: {
          show: false,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        tooltip: {
          use: true,
          sortByValue: true,
          scrollbar: {
            use: true,
            maxSeriesCount: 5,
          },
        },
      };

      const chartOptions1 = cloneDeep(chartOptions);
      chartOptions1.tooltip.scrollbar.use = false;

      const chartOptions2 = cloneDeep(chartOptions1);
      chartOptions2.tooltip.sortByValue = false;

      const chartData1 = cloneDeep(chartData);

      let timeValue = moment().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        timeValue = +moment(timeValue).add(1, 'second');
        chartData.labels.push(+moment(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      const addRandomChartData1 = () => {
        timeValue = +moment(timeValue).add(1, 'second');
        chartData1.labels.push(+moment(timeValue));

        Object.values(chartData1.data).forEach((seriesData) => {
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 120; ix++) {
          addRandomChartData();
        }
        for (let ix = 0; ix < 10; ix++) {
          addRandomChartData1();
        }
      });

      return {
        chartData,
        chartData1,
        chartOptions1,
        chartOptions2,
        chartOptions,
      };
    },
  };
</script>
<style>
  .case {
    border: 0.1px solid lightgray;
  }
</style>
