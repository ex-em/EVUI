<template>
  <div>
    <ev-chart
      :data="getChartData"
      :options="chartOptions"
    />
    <div style="position: absolute; top: 0; right: 0;">
      <ev-button
        @click="onClickLiveBtn"
      >{{ liveBtnInfo.text }}</ev-button>
    </div>
    <br>
  </div>
</template>

<script>
  import moment from 'moment';

  export default {
    data() {
      return {
        series: {
          series1: { name: 'series#1', show: true, type: 'bar', timeMode: true },
          series2: { name: 'series#2', show: true, type: 'bar', timeMode: true },
          // series3: { name: 'series#3', show: true, type: 'bar' },
          // series4: { name: 'series#4', show: true, type: 'bar' },
        },
        groups: [
          // ['series1', 'series2', 'series3', 'series4'],
          ['series1', 'series2'],
        ],
        labels: [],
        chartData: {
          series1: [],
          series2: [],
          series3: [],
          series4: [],
        },
        chartOptions: {
          width: '100%',
          height: '100%',
          thickness: 1,
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'top',
          },
          horizontal: false,
          axesX: [{
            type: 'time',
            showGrid: true,
            categoryMode: true,
            timeFormat: 'mm:ss',
            interval: 3000,
          }],
          axesY: [{
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: false,
          }],
        },
        liveBtnInfo: {
          name: 'liveBtn',
          text: 'Live',
          customCls: '',
        },
        timeValue: +new Date('2017-01-01 00:10:00'),
        liveMode: false,
        event: null,
      };
    },
    computed: {
      graphData() {
        return {
          series1: this.chartData.series1,
          series2: this.chartData.series2,
          // series3: this.chartData.series3,
          // series4: this.chartData.series4,
        };
      },
      getChartData() {
        return {
          series: this.series,
          labels: this.labels,
          groups: this.groups,
          data: this.graphData,
        };
      },
    },
    destroyed() {
      if (this.liveInterval) {
        clearTimeout(this.liveInterval);
      }
    },
    methods: {
      onClickLiveBtn(event) {
        this.event = event;
        this.liveBtnInfo.text = this.liveBtnInfo.text === 'Live' ? 'Stop' : 'Live';
        this.liveMode = !this.liveMode;

        if (this.liveMode) {
          this.liveInterval = setInterval(this.addLiveData.bind(this), 100);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.$set(this.chartOptions.axesX[0], 'range', [+new Date(this.timeValue - 60000), this.timeValue]);

        this.chartData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series2.push({ x: this.timeValue, y: this.getRandomInt() });
        // this.chartData.series3.push({ x: this.timeValue, y: this.getRandomInt() });
        // this.chartData.series4.push({ x: this.timeValue, y: this.getRandomInt() });

        this.timeValue = +moment(this.timeValue).add(3, 's');
      },
    },
  };
</script>
