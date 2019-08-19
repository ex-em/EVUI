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
          series1: { name: 'series#1', show: true, type: 'line', fill: true, point: false },
          series2: { name: 'series#2', show: true, type: 'line', fill: true, point: false },
        },
        groups: [
          ['series1', 'series2'],
        ],
        labels: [
          +new Date('2017/01/01 00:00:00'),
          +new Date('2017/01/01 00:01:00'),
          +new Date('2017/01/01 00:02:00'),
          +new Date('2017/01/01 00:03:00'),
          +new Date('2017/01/01 00:04:00'),
        ],
        chartData: {
          series1: [100, 150, 51, 150, 350],
          series2: [50, 200, 100, 150, 80],
        },
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
            interval: 'minute',
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
        timeValue: '2017-01-01 00:04:00',
        liveMode: false,
        event: null,
      };
    },
    computed: {
      getChartData() {
        return {
          series: this.series,
          labels: this.labels,
          data: this.chartData,
          groups: this.groups,
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
        this.timeValue = +moment(this.timeValue).add(1, 'm');
        this.labels.shift();
        this.chartData.series1.shift();
        this.chartData.series2.shift();
        this.labels.push(this.timeValue);
        this.chartData.series1.push(this.getRandomInt());
        this.chartData.series2.push(this.getRandomInt());
      },
    },
  };
</script>
