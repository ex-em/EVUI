<template>
  <div>
    <ev-chart
      ref="evChart"
      :data="getChartData"
      :options="chartOptions"
      @select-item="onSelectItem"
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
          series1: { name: 'warning', show: true, type: 'bar' },
          series2: { name: 'critical', show: true, type: 'bar' },
        },
        groups: [
          ['series1', 'series2'],
        ],
        labels: [
          +new Date('2020-01-14 00:00:00'),
          +new Date('2020-01-14 01:00:00'),
          +new Date('2020-01-14 02:00:00'),
          +new Date('2020-01-14 03:00:00'),
          +new Date('2020-01-14 04:00:00'),
          +new Date('2020-01-14 05:00:00'),
        ],
        chartData: {
          series1: [0, 20, 0, 0, 30, 50], // eslint-disable-line
          series2: [10, 0, 0, 0, 30, 50], // eslint-disable-line
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
            timeFormat: 'HH:mm',
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
      // this.makeInitData();
    },
    destroyed() {
      if (this.liveInterval) {
        clearTimeout(this.liveInterval);
      }
    },
    mounted() {
      setTimeout(() => {
        this.select();
      }, 5000);
    },
    methods: {
      select() {
        console.log(this.$refs.evChart.selectItemByLabel(+new Date('2020-01-14 08:00:00')));
        console.log(this.$refs.evChart.selectItemByLabel(+new Date('2020-01-14 04:00:00')));
        console.log(this.$refs.evChart.selectItemByLabel(+new Date('2020-01-14 08:00:00')));
      },
      onSelectItem(item) {
        console.log(item, 'selecttt');
      },
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
        this.timeValue = +moment(this.timeValue).add(3, 'seconds');
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

        for (let ix = 0; ix < 59; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = +moment(this.timeValue).add(3, 'seconds');
          data.series1.push(null);
          data.series2.push(null);
          data.series3.push(null);
          data.series4.push(null);
        }
        label.push(+moment(this.timeValue));
        data.series1.push(null);
        data.series2.push(null);
        data.series3.push(null);
        data.series4.push(null);

        this.labels = label;
        this.chartData = data;
      },
    },
  };
</script>
