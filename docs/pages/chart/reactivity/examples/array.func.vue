<template>
  <div>
    <ev-chart
      :data="getChartData"
      :options="chartOptions"
    />
    <div style="position: absolute; top: 0; right: 0;">
      <ev-button
        @click="onClickLiveBtn"
      >
        {{ liveBtnInfo.text }}
      </ev-button>
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
          series1: { name: 'series#1', show: true, type: 'line', fill: false, point: false },
        },
        labels: [],
        chartData: {
          series1: [],
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
        timeValue: new Date('2019-01-01 00:00:00'),
        liveMode: false,
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
    destroyed() {
      if (this.liveInterval) {
        clearTimeout(this.liveInterval);
      }
    },
    methods: {
      makeInitData() {
        for (let ix = 0; ix < 60; ix++) {
          this.labels.push(+moment(this.timeValue));
          this.chartData.series1.push(null);

          this.timeValue = +moment(this.timeValue).add(3, 'seconds');
        }
      },
      onClickLiveBtn() {
        this.liveBtnInfo.text = this.liveBtnInfo.text === 'Live' ? 'Stop' : 'Live';
        this.liveMode = !this.liveMode;

        if (this.liveMode) {
          this.liveInterval = setInterval(this.addLiveData.bind(this), 1000);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      addLiveData() {
        this.labels.shift();
        this.labels.push(this.timeValue);

        this.chartData.series1.shift();
        this.chartData.series1.push(this.getRandomInt());

        this.timeValue = +moment(this.timeValue).add(3, 'seconds');
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
    },
  };
</script>
