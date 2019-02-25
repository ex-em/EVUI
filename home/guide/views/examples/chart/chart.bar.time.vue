<template>
  <div>
    <chart
      :data="liveBarChartData"
      :options="liveBarChartOptions"
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
        liveBarChartData: {
          series: {
            series1: { name: 'series#1', show: true, type: 'bar' },
            series2: { name: 'series#2', show: true, type: 'bar' },
            series3: { name: 'series#3', show: true, type: 'bar' },
            series4: { name: 'series#4', show: true, type: 'bar' },
          },
          groups: [
            ['series1', 'series2', 'series3', 'series4'],
          ],
          labels: [],
          data: {},
        },
        liveBarChartOptions: {
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
            type: 'step',
            showGrid: false,
            mode: 'time',
            timeFormat: 'HH:mm',
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
          this.liveInterval = setInterval(this.addLiveData.bind(this), 500);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      },
      addLiveData() {
        this.timeValue = +moment(this.timeValue).add(1, 'seconds');
        this.liveBarChartData.labels.shift();
        this.liveBarChartData.data.series1.shift();
        this.liveBarChartData.data.series2.shift();
        this.liveBarChartData.data.series3.shift();
        this.liveBarChartData.data.series4.shift();
        this.liveBarChartData.labels.push(+moment(this.timeValue));
        this.liveBarChartData.data.series1.push(this.getRandomInt());
        this.liveBarChartData.data.series2.push(this.getRandomInt());
        this.liveBarChartData.data.series3.push(this.getRandomInt());
        this.liveBarChartData.data.series4.push(this.getRandomInt());
      },
      makeInitData() {
        const label = [];
        const data = { series1: [], series2: [], series3: [], series4: [] };

        for (let ix = 0; ix < 60; ix++) {
          label.push(+moment(this.timeValue));
          this.timeValue = +moment(this.timeValue).add(1, 'seconds');
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

        this.liveBarChartData.labels = label;
        this.liveBarChartData.data = data;
      },
    },
  };
</script>
