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
          series1: { name: 'series#1', show: true, type: 'bar' },
          series2: { name: 'series#2', show: true, type: 'line', combo: true, fill: true },
          series3: { name: 'series#3', show: true, type: 'line', combo: true, fill: true },
          series4: { name: 'series#4', show: true, type: 'bar' },
        },
        groups: [
          ['series2', 'series3'], ['series1', 'series4'],
        ],
        labels: [],
        chartData: {},
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
            position: 'right',
          },
          axesX: [{
            type: 'time',
            showGrid: false,
            categoryMode: true,
            timeFormat: 'HH:mm:ss',
            interval: 'second',
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
        timeValue: '2017-01-01 00:00:00',
        liveMode: false,
        event: null,
      };
    },
    computed: {
      getChartData() {
        return {
          series: this.series,
          labels: this.labels,
          groups: this.groups,
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
      onClickLiveBtn(event) {
        this.event = event;
        this.liveBtnInfo.text = this.liveBtnInfo.text === 'Live' ? 'Stop' : 'Live';
        this.liveMode = !this.liveMode;

        if (this.liveMode) {
          this.liveInterval = setInterval(this.addLiveData.bind(this), 500);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.timeValue = +moment(this.timeValue).add(1, 'seconds');
        this.labels.shift();
        this.chartData.series1.shift();
        this.chartData.series2.shift();
        this.chartData.series3.shift();
        this.chartData.series4.shift();
        this.labels.push(+moment(this.timeValue));
        this.chartData.series1.push(this.getRandomInt());
        this.chartData.series2.push(this.getRandomInt());
        this.chartData.series3.push(this.getRandomInt());
        this.chartData.series4.push(this.getRandomInt());
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [], series3: [], series4: [] };

        for (let ix = 0; ix < 60; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = +moment(this.timeValue).add(1, 'seconds');
          data.series1.push(0);
          data.series2.push(0);
          data.series3.push(0);
          data.series4.push(0);
        }
        label.push(+moment(this.timeValue));
        data.series1.push(0);
        data.series2.push(0);
        data.series3.push(0);
        data.series4.push(0);

        this.labels = label;
        this.chartData = data;
      },
    },
  };
</script>
