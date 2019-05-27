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
          series1: { name: 'series#1', show: true, type: 'scatter', fill: false, point: true },
          series2: { name: 'series#2', show: true, type: 'scatter', fill: false, point: true },
          series3: { name: 'series#3', show: true, type: 'scatter', fill: false, point: true },
        },
        chartData: {
          series1: [],
          series2: [],
          series3: [],
        },
        labels: [],
        chartOptions: {
          width: '100%',
          height: '100%',
          title: {
            text: 'Title Test',
            show: true,
          },
          legend: {
            show: true,
            position: 'right',
          },
          horizontal: false,
          axesX: [{
            type: 'time',
            timeFormat: 'HH:mm:ss',
            interval: 'second',
          }],
          axesY: [{
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: true,
          }],
        },
        liveBtnInfo: {
          name: 'liveBtn',
          text: 'Live',
          customCls: '',
        },
        timeValue: null,
        liveMode: false,
        event: null,
      };
    },
    computed: {
      graphData() {
        return {
          series1: this.chartData.series1,
          series2: this.chartData.series2,
          series3: this.chartData.series3,
        };
      },
      getChartData() {
        return {
          series: this.series,
          labels: this.labels,
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
          this.liveInterval = setInterval(this.addLiveData.bind(this), 1000);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.timeValue = +new Date();
        this.$set(this.chartOptions.axesX[0], 'range', [+new Date(this.timeValue - 180000), this.timeValue]);
        this.chartData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series2.push({ x: this.timeValue, y: this.getRandomInt() });
        this.chartData.series3.push({ x: this.timeValue, y: this.getRandomInt() });

        this.timeValue = +moment(this.timeValue).add(3, 's');
      },
    },
  };
</script>
