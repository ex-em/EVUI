<template>
  <div>
    <chart
      :data="getChartData"
      :options="chartOptions"
    />
    <div style="position: absolute; top: 0; right: 0;">
      <Button
        @click="onchangeSeries"
      >
        {{ changeSeriesBtnInfo.text }}
      </Button>
    </div>
    <br>
  </div>
</template>

<script>
  import moment from 'moment';
  import '@/styles/evui.css';
  import Chart from '@/components/chart';
  import Button from '@/components/button';

  export default {
    components: {
      Chart,
      Button,
    },
    data() {
      return {
        series: {
          series1: { name: 'series#1', show: true, type: 'line', fill: false, point: false },
        },
        labels: [],
        chartData: {
          series1: [],
        },
        seriesSet: [{
          series1: { name: 'series#1', show: true, type: 'line', fill: false, point: false },
          series2: { name: 'series#2', show: true, type: 'line', fill: false, point: false },
          series3: { name: 'series#3', show: true, type: 'line', fill: false, point: false },
        }, {
          series1: { name: 'series#2', show: true, type: 'line', fill: false, point: false },
        }, {
          series1: { name: 'series#1', show: true, type: 'line', fill: false, point: false },
          series3: { name: 'series#3', show: true, type: 'line', fill: false, point: false },
        }],
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
        changeSeriesBtnInfo: {
          name: 'changeBtn',
          text: 'Change Series',
          customCls: '',
        },
        timeValue: new Date('2019-01-01 00:00:00'),
        liveMode: false,
        sIdx: 0,
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

        this.liveInterval = setInterval(this.addLiveData.bind(this), 1000);
      },
      makeInitSeriesData(sId) {
        this.chartData[sId] = [];
        for (let ix = 0; ix < 60; ix++) {
          this.chartData[sId].push(null);
        }
      },
      onchangeSeries() {
        this.series = this.seriesSet[this.sIdx++ % this.seriesSet.length];
        this.chartData = {};
      },
      addLiveData() {
        this.labels.shift();
        this.labels.push(this.timeValue);

        const sKeys = Object.keys(this.series);

        for (let ix = 0; ix < sKeys.length; ix++) {
          if (!this.chartData[sKeys[ix]]) {
            this.makeInitSeriesData(sKeys[ix]);
          }

          this.chartData[sKeys[ix]].shift();
          this.chartData[sKeys[ix]].push(this.getRandomInt());
        }

        this.timeValue = +moment(this.timeValue).add(3, 'seconds');
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
    },
  };
</script>
