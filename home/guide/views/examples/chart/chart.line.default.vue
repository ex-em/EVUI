<template>
  <div>
    <chart
      :data="defaultLineChartData"
      :options="defaultLineChartOptions"
    />
    <div style="position: absolute; top: 0; right: 0;">
      <Button
        @click="onClickLiveBtn"
      >{{ liveBtnInfo.text }}</Button>
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
        defaultLineChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line', fill: false, point: false },
          },
          labels: [],
          data: {},
        },
        defaultLineChartOptions: {
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
        timeValue: '2017-01-01 00:00:00',
        liveMode: false,
        event: null,
      };
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
        this.timeValue = +moment(this.timeValue).add(3, 'seconds');
        this.defaultLineChartData.labels.shift();
        this.defaultLineChartData.data.series1.shift();
        this.defaultLineChartData.labels.push(this.timeValue);
        this.defaultLineChartData.data.series1.push(this.getRandomInt());
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

        this.defaultLineChartData.labels = label;
        this.defaultLineChartData.data = data;
      },
    },
  };
</script>
