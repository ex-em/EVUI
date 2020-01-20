<template>
  <div>
    <ev-chart
      :data="getChartData"
      :options="chartOptions"
      :listeners="listeners"
      @on-click="onClick"
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
            series1: { name: 'series#1', show: true, type: 'line', fill: false, point: true },
            series2: { name: 'series#2', show: true, type: 'line', fill: false, point: true },
            series3: { name: 'series#3', show: true, type: 'line', fill: false, point: true },
            series4: { name: 'series#4', show: true, type: 'line', fill: false, point: true },
            series5: { name: 'series#5', show: true, type: 'line', fill: false, point: true },
            series6: { name: 'series#6', show: true, type: 'line', fill: false, point: true },
            series7: { name: 'series#7', show: true, type: 'line', fill: false, point: true },
            series8: { name: 'series#8', show: true, type: 'line', fill: false, point: true },
            series9: { name: 'series#9', show: true, type: 'line', fill: false, point: true },
            series10: { name: 'series#10', show: true, type: 'line', fill: false, point: true },
            series11: { name: 'series#11', show: true, type: 'line', fill: false, point: true },
            series12: { name: 'series#12', show: true, type: 'line', fill: false, point: true },
            series13: { name: 'series#13', show: true, type: 'line', fill: false, point: true },
        },
        labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
        ],
        chartData: {
            series1: [100, 150, 51, 150, 200],
            series2: [150, 200, 58, 150, 40],
            series3: [200, 50, 90, 300, 500],
            series4: [300, 800, 30, 200, 100],
            series5: [300, 70, 30, 200, 100],
            series6: [300, 70, 30, 200, 100],
            series7: [300, 70, 30, 200, 100],
            series8: [300, 70, 30, 200, 100],
            series9: [300, 70, 30, 200, 100],
            series10: [300, 70, 30, 200, 100],
            series11: [300, 70, 30, 200, 100],
            series12: [300, 70, 30, 200, 100],
            series13: [300, 70, 30, 200, 100],
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
            position: 'bottom',
            height: 50,
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
          fixedIndicator: {
            use: true,
            useApproximateValue: false,
          },
        },
        liveBtnInfo: {
          name: 'liveBtn',
          text: 'Live',
          customCls: '',
        },
        listeners: {
          dblclick: this.onDblClick,
          click: true,
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
          data: this.chartData,
        };
      },
    },
    created() {
      // this.makeInitData();
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
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.timeValue = +moment(this.timeValue).add(3, 'seconds');
        this.labels.shift();
        this.chartData.series1.shift();
        this.labels.push(this.timeValue);
        this.chartData.series1.push(this.getRandomInt());
      },
      makeInitData() {
        const label = [];
        const data = { series1: [] };

        for (let ix = 0; ix < 60; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = +moment(this.timeValue).add(3, 'seconds');
          data.series1.push(null);
        }
        label.push(+moment(this.timeValue));
        data.series1.push(null);

        this.labels = label;
        this.chartData = data;
      },
      onDblClick(e) {
        console.log(e, 'user defined callback.');
      },
      onClick(e) {
        console.log(e, 'chart default callback.');
      },
    },
  };
</script>
