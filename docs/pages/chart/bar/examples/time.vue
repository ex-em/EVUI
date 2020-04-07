<template>
  <div>
    <ev-chart
      ref="evChart"
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
          series1: { name: 'warning' },
          series2: { name: 'critical' },
        },
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
            interval: 'minute',
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

        this.timeValue = +moment(this.timeValue).add(3, 'minutes');
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [] };

        for (let ix = 0; ix < 10; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = +moment(this.timeValue).add(3, 'minutes');
          Object.values(data).forEach(series => series.push(ix));
        }

        this.labels = label;
        this.chartData = data;
      },
    },
  };
</script>
