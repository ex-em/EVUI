<template>
  <div>
    <chart
      :data="scatterLineChartData"
      :options="scatterLineChartOptions"
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
        scatterLineChartData: {
          series: [
            {
              id: 'series1',
              name: 'series#1',
              point: true,
              pointStyle: 'crossRot',
              data: [
                { x: '2018-05-25 05:11:00', y: 10 },
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
              pointStyle: 'triangle',
              data: [
                { x: '2018-05-25 05:11:00', y: 15 },
                { x: '2018-05-25 05:12:00', y: 17 },
                { x: '2018-05-25 05:13:00', y: 5 },
                { x: '2018-05-25 05:14:00', y: 12 },
                { x: '2018-05-25 05:15:00', y: 7 },
                { x: '2018-05-25 05:16:00', y: 20 },
                { x: '2018-05-25 05:17:00', y: 15 },
                { x: '2018-05-25 05:18:20', y: 17 },
                { x: '2018-05-25 05:19:00', y: 30 },
                { x: '2018-05-25 05:20:00', y: 20 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
            {
              id: 'series3',
              name: 'series#3',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 12 },
                { x: '2018-05-25 05:12:00', y: 13 },
                { x: '2018-05-25 05:13:00', y: 5 },
                { x: '2018-05-25 05:14:00', y: 7 },
                { x: '2018-05-25 05:15:00', y: 14 },
                { x: '2018-05-25 05:16:00', y: 20 },
                { x: '2018-05-25 05:17:00', y: 10 },
                { x: '2018-05-25 05:18:00', y: 10 },
                { x: '2018-05-25 05:19:00', y: 13 },
                { x: '2018-05-25 05:20:00', y: 20 },
                { x: '2018-05-25 05:21:00', y: 20 },
              ],
            },
          ],
        },
        scatterLineChartOptions: {
          type: 'scatter',
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
    destroyed() {
      if (this.liveInterval) {
        clearTimeout(this.liveInterval);
      }
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
        const randomData3 = Math.floor((Math.random() * 30) + 1);
        const randomData4 = Math.floor((Math.random() * 30) + 1);
        const randomData5 = Math.floor((Math.random() * 20) + 1);
        const randomData6 = Math.floor((Math.random() * 30) + 1);
        const randomData7 = Math.floor((Math.random() * 10) + 1);
        const randomData8 = Math.floor((Math.random() * 30) + 1);
        const randomData9 = Math.floor((Math.random() * 30) + 1);
        const randomData0 = Math.floor((Math.random() * 30) + 1);

        this.timeData = moment(this.timeData).add(1, 'm').format('YYYY-MM-DD HH:mm:ss');

        const seriesTime1 = moment(this.timeData).add(10, 's').format('YYYY-MM-DD HH:mm:ss');
        const seriesTime2 = moment(this.timeData).add(20, 's').format('YYYY-MM-DD HH:mm:ss');
        const seriesTime3 = moment(this.timeData).add(30, 's').format('YYYY-MM-DD HH:mm:ss');

        const seriesTime4 = moment(this.timeData).add(40, 's').format('YYYY-MM-DD HH:mm:ss');
        const seriesTime5 = moment(this.timeData).add(45, 's').format('YYYY-MM-DD HH:mm:ss');
        const seriesTime6 = moment(this.timeData).add(50, 's').format('YYYY-MM-DD HH:mm:ss');
        const seriesTime7 = moment(this.timeData).add(55, 's').format('YYYY-MM-DD HH:mm:ss');


        this.$children[0].addValue(0, { x: seriesTime1, y: randomData1 });
        this.$children[0].addValue(0, { x: seriesTime2, y: randomData4 });
        this.$children[0].addValue(0, { x: seriesTime3, y: randomData5 });

        this.$children[0].addValue(1, { x: seriesTime4, y: randomData2 });
        this.$children[0].addValue(1, { x: seriesTime5, y: randomData6 });
        this.$children[0].addValue(1, { x: seriesTime6, y: randomData7 });
        this.$children[0].addValue(1, { x: seriesTime7, y: randomData8 });

        this.$children[0].addValue(2, { x: this.timeData, y: randomData3 });
        this.$children[0].addValue(2, { x: seriesTime3, y: randomData9 });
        this.$children[0].addValue(2, { x: seriesTime7, y: randomData0 });

        this.$children[0].chart.redraw();
      },
    },
  };
</script>
