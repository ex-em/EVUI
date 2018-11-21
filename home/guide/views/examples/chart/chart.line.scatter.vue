<template>
  <div>
    <chart
      :data="scatterLineChartData"
      :options="scatterLineChartOptions"
    />
    <!--
    <div style="position: absolute; top: 0; left: 600px;">
      <Button
        :text="liveBtnInfo.text"
        :name="liveBtnInfo.name"
        @click="onClickLiveBtn"
      />
    </div>
    -->
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
          series: {
            series1: { name: 'series#1', show: true, point: true },
            series2: { name: 'series#2', show: true, point: true },
            series3: { name: 'series#3', show: true, point: true },
          },
          data: [
            ['x',
              '2017/01/01 00:00:00', '2017/01/01 00:01:00', '2017/01/01 00:02:00',
              '2017/01/01 00:03:00', '2017/01/01 00:04:00'],
            ['series1', 100, 150, 50, 200, 350],
            ['series2', 200, 100, null, 300, 400],
            ['series3', 150, 0, 0, 350, 450],
          ],
        },
        scatterLineChartOptions: {
          type: 'scatter',
          width: '100%',
          height: '350px',
          legend: {
            show: true,
            position: 'right',
          },
          xAxes: [{
            scaleType: 'fix',
            labelType: 'time',
            interval: 'minute',
            timeFormat: 'HH:mm:ss',
            showGrid: true,
          }],
          yAxes: [{
            scaleType: 'auto',
            labelType: 'linear',
            autoScale1Ratio: 0.1,
            showGrid: true,
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

        this.timeData = moment(this.timeData).add(1, 'm').format('YYYY-MM-DD HH:mm:ss');

        this.$children[0].addValue(0, { x: this.timeData, y: randomData1 });
        this.$children[0].addValue(1, { x: this.timeData, y: randomData2 });
        this.$children[0].addValue(2, { x: this.timeData, y: randomData3 });

        this.$children[0].chart.redraw();
      },
    },
  };
</script>
