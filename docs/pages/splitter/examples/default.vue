<template>
  <div class="splitter-default">
    <ev-grid
      :columns="columns"
      :option="{ adjust: true }"
      style="width: 300px;"
    />
    <ev-splitter
      type="hbox"
    />
    <ev-chart
      :data="getChartData"
      :options="chartOptions"
      style="width: 300px"
    />
  </div>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'SplitterDefault',
    data() {
      return {
        columns: [
          { caption: 'ID', field: 'id', type: 'number', width: 50 },
          { caption: 'Country', field: 'country', type: 'string' },
          { caption: 'Population', field: 'population', type: 'number' },
          { caption: 'GDP', field: 'gdp', type: 'number' },
        ],
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
          series4: { name: 'series#4' },
        },
        labels: [],
        chartData: {},
        chartOptions: {
          type: 'line',
          width: '100%',
          height: '100%',
          title: {
            text: 'Default Line Chart',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: false,
          axesX: [{
            type: 'time',
            timeFormat: 'HH:00',
            interval: 'hour',
          }],
          axesY: [{
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: true,
          }],
          fixedIndicator: {
            use: true,
            useApproximateValue: false,
          },
        },
        timeValue: moment(new Date()).format('YYYY-MM-DD HH:mm:00'),
      };
    },
    computed: {
      getChartData() {
        return {
          series: this.series,
          labels: this.labels,
          data: this.chartData,
        };
      },
    },
    created() {
      this.makeInitData();
    },
    methods: {
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [], series3: [], series4: [] };

        for (let ix = 0; ix < 26; ix++) {
          label.push(+moment(this.timeValue));
          Object.values(data).forEach(series => series.push(this.getRandomInt()));

          this.timeValue = +moment(this.timeValue).add(1, 'hours');
        }

        this.labels = label;
        this.chartData = data;
      },
    },
  };
</script>

<style scoped>
  .splitter-default {
    display: flex;
    width: 100%;
    height: 100%;
  }
</style>
