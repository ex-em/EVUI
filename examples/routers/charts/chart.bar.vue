<template>
  <chart
    ref="defaultChart"
    :data="defaultData"
    :options="lineOptions"
  />
</template>
<script>
  import moment from 'moment';
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        defaultData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line' },
            series2: { name: 'series#2', show: true, type: 'line', color: '#ee7f44', pointFill: '#ee7f44' },
          },
          labels: [
          ],
          data: {
            series1: [],
            series2: [],
          },
        },
        lineOptions: {
          thickness: 1,
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
          axesX: [{
            type: 'time',
            showGrid: false,
            timeMode: true,
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
        timeValue: '2017-01-01 00:00:00',
      };
    },
    created() {
      this.makeInitData();
    },
    destroyed() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    mounted() {
      setInterval(() => this.addLiveData(), 500);
      setTimeout(() => {
        this.lineOptions.title.show = false;
      }, 2000);
      setTimeout(() => {
        this.lineOptions.legend.position = 'top';
      }, 4000);
      setTimeout(() => {
        this.lineOptions.title.show = true;
      }, 6000);
      setTimeout(() => {
        this.lineOptions.legend.position = 'right';
      }, 8000);
      setTimeout(() => {
        this.lineOptions.legend.show = false;
      }, 10000);
      setTimeout(() => this.aaa(), 10000);
    },
    methods: {
      aaa() {
        const range = [
          +new Date('2017-01-01 00:00:00'),
          +new Date('2017-01-01 00:05:00'),
        ];

        this.$set(this.lineOptions.axesX[0], 'range', range);
      },
      addLiveData() {
        this.timeValue = moment(this.timeValue).add(1, 'seconds');
        this.defaultData.labels.shift();
        this.defaultData.data.series1.shift();
        this.defaultData.data.series2.shift();
        this.defaultData.labels.push(+moment(this.timeValue));
        this.defaultData.data.series1.push(this.getRandomInt());
        this.defaultData.data.series2.push(this.getRandomInt());
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [] };

        for (let ix = 0; ix < 60; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = moment(this.timeValue).add(1, 'seconds');
          data.series1.push(null);
          data.series2.push(null);
        }
        label.push(+moment(this.timeValue));
        data.series1.push(null);
        data.series2.push(null);

        this.defaultData.labels = label;
        this.defaultData.data = data;
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
      },
    },
  };
</script>
<style>
</style>
