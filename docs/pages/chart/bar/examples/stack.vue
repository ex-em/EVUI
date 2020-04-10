<template>
  <div>
    <ev-chart
      :data="getChartData"
      :options="chartOptions"
    />
    <div style="position: absolute; top: 0; right: 0;">
      <ev-button @click="onClickLiveBtn">
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
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
          series4: { name: 'series#4' },
        },
        groups: [
          ['series1', 'series2', 'series3', 'series4'],
        ],
        labels: [],
        chartData: {},
        chartOptions: {
          type: 'bar',
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
            timeFormat: 'HH:mm:ss',
            interval: 'hour',
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
        timeValue: moment().format('YYYY-MM-DD HH:mm:ss'),
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
          this.liveInterval = setInterval(this.addLiveData.bind(this), 100);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.labels.shift();
        this.labels.push(+moment(this.timeValue));

        Object.values(this.chartData).forEach((series) => {
          series.shift();
          series.push(this.getRandomInt());
        });

        this.timeValue = +moment(this.timeValue).add(1, 'hours');
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [], series3: [], series4: [] };

        for (let ix = 0; ix < 60; ix++) {
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
