<template>
  <div style="width: 33%; display: inline; overflow: auto;">
    <chart
      :data="simpleData"
      :options="lineOptions"
    />
    <chart
      :data="fillData"
      :options="fillOptions"
    />
    <chart
      :data="stackData"
      :options="stackOptions"
    />
    <chart
      :data="scatterData"
      :options="scatterOptions"
    />
  </div>
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
        simpleData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
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
              id: 'simple2',
              name: 'simple2',
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
        fillData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
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
              id: 'simple2',
              name: 'simple2',
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
        stackData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              point: true,
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
              id: 'simple2',
              name: 'simple2',
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
            {
              id: 'simple3',
              name: 'simple3',
              point: true,
              data: [
                { x: '2018-05-25 05:11:00', y: 12 },
                { x: '2018-05-25 05:12:00', y: 13 },
                { x: '2018-05-25 05:13:00', y: 5 },
                { x: '2018-05-25 05:14:00', y: 7 },
                { x: '2018-05-25 05:15:00', y: 14 },
                { x: '2018-05-25 05:16:00', y: 5 },
                { x: '2018-05-25 05:17:00', y: 15 },
                { x: '2018-05-25 05:18:00', y: 11 },
                { x: '2018-05-25 05:19:00', y: 7 },
                { x: '2018-05-25 05:20:00', y: 10 },
                { x: '2018-05-25 05:21:00', y: 8 },
              ],
            },
          ],
        },
        scatterData: {
          series: [
            {
              id: 'simple1',
              name: 'simple1',
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
              id: 'simple2',
              name: 'simple2',
              point: true,
              pointStyle: 'triangle',
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
        lineOptions: {
          type: 'line',
          width: '550px',
          height: '230px',
          title: {
            text: 'Title Test',
            show: true,
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'HH:mm:ss',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            position: 'left',
          }],
        },
        fillOptions: {
          type: 'line',
          width: '550px',
          height: '230px',
          fill: true,
          title: {
            text: 'Title Test',
            show: true,
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'HH:mm:ss',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            position: 'left',
          }],
        },
        stackOptions: {
          type: 'line',
          width: '550px',
          height: '230px',
          fill: true,
          stack: true,
          title: {
            text: 'Title Test',
            show: true,
          },
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'HH:mm:ss',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            position: 'left',
          }],
        },
        scatterOptions: {
          type: 'scatter',
          width: '550px',
          height: '230px',
          title: {
            text: 'Title Test1',
            show: true,
          },
          isRTM: true,
          xAxes: [{
            scaleType: 'fix', // auto, fix, step
            labelType: 'time', // time, linear, category
            tickFormat: 'HH:mm:ss',
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
        lastData: '2018-05-25 05:21:00',
      };
    },
    mounted() {
      this.addData();
    },
    destroyed() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    methods: {
      addData() {
        // this.interval = setInterval(this.lineAddData.bind(this), 1000);
      },

      lineAddData() {
        const randomData1 = Math.floor((Math.random() * 30) + 1);
        const randomData2 = Math.floor((Math.random() * 30) + 1);
        const randomData3 = Math.floor((Math.random() * 50) + 1);
        const randomData4 = Math.floor((Math.random() * 20) + 1);
        const randomData5 = Math.floor((Math.random() * 50) + 1);
        const randomData6 = Math.floor((Math.random() * 20) + 1);
        const randomData7 = Math.floor((Math.random() * 20) + 1);
        const randomData8 = Math.floor((Math.random() * 50) + 1);
        const randomData9 = Math.floor((Math.random() * 20) + 1);

        this.lastData = moment(this.lastData).add(1, 'm').format('YYYY-MM-DD HH:mm:ss');

        this.$children[0].addValue(0, { x: this.lastData, y: randomData1 });
        this.$children[0].addValue(1, { x: this.lastData, y: randomData2 });
        this.$children[0].chart.redraw();

        this.$children[1].addValue(0, { x: this.lastData, y: randomData3 });
        this.$children[1].addValue(1, { x: this.lastData, y: randomData4 });
        this.$children[1].chart.redraw();

        this.$children[2].addValue(0, { x: this.lastData, y: randomData5 });
        this.$children[2].addValue(1, { x: this.lastData, y: randomData6 });
        this.$children[2].addValue(2, { x: this.lastData, y: randomData7 });
        this.$children[2].chart.redraw();

        this.$children[3].addValue(0, { x: this.lastData, y: randomData8 });
        this.$children[3].addValue(1, { x: this.lastData, y: randomData9 });
        this.$children[3].chart.redraw();
      },
    },
  };
</script>
<style>
</style>
