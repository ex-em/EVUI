<template>
  <div>
    <chart
      :data="fillLineChartData"
      :options="fillLineChartOptions"
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
        fillLineChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'line', fill: true, point: false },
          },
          labels: [
            +new Date('2017/01/01 00:00:00'),
            +new Date('2017/01/01 00:01:00'),
            +new Date('2017/01/01 00:02:00'),
            +new Date('2017/01/01 00:03:00'),
            +new Date('2017/01/01 00:04:00'),
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        fillLineChartOptions: {
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
        timeValue: '2017-01-01 00:04:00',
        liveMode: false,
        event: null,
      };
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
        return Math.floor(Math.random() * ((50 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.timeValue = +moment(this.timeValue).add(1, 'm');
        this.fillLineChartData.labels.shift();
        this.fillLineChartData.data.series1.shift();
        this.fillLineChartData.labels.push(this.timeValue);
        this.fillLineChartData.data.series1.push(this.getRandomInt());
      },
    },
  };
</script>
