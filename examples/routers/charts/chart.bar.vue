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
            series1: { name: 'series#1', show: true, type: 'bar' },
          },
          labels: [
          ],
          data: {
            series1: [],
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
          horizontal: false,
          axesX: [{
            type: 'step',
            showGrid: false,
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
    },
    methods: {
      addLiveData() {
        this.timeValue = moment(this.timeValue).add(1, 'seconds');
        this.defaultData.labels.shift();
        this.defaultData.data.series1.shift();
        this.defaultData.labels.push(moment(this.timeValue).format('HH:mm:ss'));
        this.defaultData.data.series1.push(this.getRandomInt());
      },
      makeInitData() {
        const label = [];
        const data = { series1: [] };

        for (let ix = 0; ix < 60; ix++) {
          label.push(moment(this.timeValue).format('HH:mm:ss'));
          this.timeValue = moment(this.timeValue).add(1, 'seconds');
          data.series1.push(this.getRandomInt());
        }
        label.push(moment(this.timeValue).format('HH:mm:ss'));
        data.series1.push(this.getRandomInt());

        this.defaultData.labels = label;
        this.defaultData.data = data;
      },
      getRandomInt() {
        const rand = Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
        return rand < 10 ? null : rand;
      },
    },
  };
</script>
<style>
</style>
