<template>
  <div>
    <chart
      :data="scatterData"
      :options="scatterOptions"
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
        series: {
          series1: { name: 'series#1', show: true, type: 'scatter', fill: false, point: true },
          series2: { name: 'series#2', show: true, type: 'scatter', fill: false, point: true },
          series3: { name: 'series#3', show: true, type: 'scatter', fill: false, point: true },
        },
        graphData: {
          series1: [],
          series2: [],
          series3: [],
        },
        scatterOptions: {
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
            interval: 'second',
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
        timeValue: null,
        liveMode: false,
        event: null,
      };
    },
    computed: {
      scatterData() {
        return {
          series: this.series,
          labels: [],
          data: this.graphData,
        };
      },
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
        this.timeValue = +new Date();
        const range = [+new Date(this.timeValue - 180000), this.timeValue];
        this.$set(this.scatterOptions.axesX[0], 'range', range);

        this.graphData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.graphData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.graphData.series1.push({ x: this.timeValue, y: this.getRandomInt() });
        this.graphData.series2.push({ x: this.timeValue, y: this.getRandomInt() });
        this.graphData.series3.push({ x: this.timeValue, y: this.getRandomInt() });

        this.timeValue = +moment(this.timeValue).add(3, 's');
      },
    },
  };
</script>
