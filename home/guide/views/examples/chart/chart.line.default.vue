<template>
  <div>
    <chart
      :data="defaultLineChartData"
      :options="defaultLineChartOptions"
    />
    <div style="position: absolute; top: 0; left: 600px;">
      <Button
        :text="liveBtnInfo.text"
        :name="liveBtnInfo.name"
        @click="onClickLiveBtn"
      />
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
          series: [
            {
              id: 'series1',
              name: 'series#1',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 20 },
                { x: '2018-05-25 05:12:00', y: 10 },
                { x: '2018-05-25 05:13:00', y: 10 },
                { x: '2018-05-25 05:14:00', y: 13 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: 20 },
                { x: '2018-05-25 05:17:00', y: 10 },
                { x: '2018-05-25 05:18:00', y: 10 },
                { x: '2018-05-25 05:19:00', y: 13 },
                { x: '2018-05-25 05:20:00', y: 20 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
            {
              id: 'series2',
              name: 'series#2',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 15 },
                { x: '2018-05-25 05:12:00', y: 17 },
                { x: '2018-05-25 05:13:00', y: 20 },
                { x: '2018-05-25 05:14:00', y: 30 },
                { x: '2018-05-25 05:15:00', y: 20 },
                { x: '2018-05-25 05:16:00', y: 10 },
                { x: '2018-05-25 05:17:00', y: 25 },
                { x: '2018-05-25 05:18:00', y: 31 },
                { x: '2018-05-25 05:19:00', y: 11 },
                { x: '2018-05-25 05:20:00', y: 17 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
          ],
        },
        defaultLineChartOptions: {
          type: 'line',
          width: '600px',
          height: '350px',
          legend: {
            show: true,
            position: 'right',
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'mm:ss', // moment.js
            showGrid: false,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            showGrid: true,
            position: 'left',
          }],
        },
        liveBtnInfo: {
          name: 'liveBtn',
          text: 'Live',
          customCls: '',
        },
        timeData: '2018-05-25 05:21:00',
        liveMode: false,
        event: null,
      };
    },
    methods: {
      onClickLiveBtn(event, text) {
        this.event = event;
        this.liveBtnInfo.text = text === 'Live' ? 'Stop' : 'Live';
        this.liveMode = !this.liveMode;

        if (this.liveMode) {
          this.liveInterval = setInterval(this.addLiveData.bind(this), 1000);
        } else {
          clearTimeout(this.liveInterval);
        }
      },
      addLiveData() {
        const randomData1 = Math.floor((Math.random() * 30) + 1);
        const randomData2 = Math.floor((Math.random() * 30) + 1);

        this.timeData = moment(this.timeData).add(1, 'm').format('YYYY-MM-DD HH:mm:ss');

        this.$children[0].addValue(0, { x: this.timeData, y: randomData1 });
        this.$children[0].addValue(1, { x: this.timeData, y: randomData2 });

        this.$children[0].chart.redraw();
      },
    },
  };
</script>
