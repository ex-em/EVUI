<template>
  <div style="width: 33%; display: inline; overflow: auto;">
    <chart
      :data="simpleData"
      :options="chartOptions"
    />
    <chart
      :data="stackData"
      :options="stackOptions"
    />
    <chart
      :data="stackData"
      :options="horizontalOptions"
    />
  </div>
</template>
<script>
  import chart from '@/components/chart';

  export default {
    components: {
      chart,
    },
    data() {
      return {
        simpleData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              data: [3, 8, 10, 5, 3],
            },
            {
              id: 'simple2',
              name: 'simple2',
              data: [5, 3, 6, 8, 9],
            },
          ],
        },
        stackData: {
          category: ['category1', 'category2', 'category3', 'category4', 'category5'],
          series: [
            {
              id: 'simple1',
              name: 'simple1',
              data: [3, 8, 10, 5, 3],
            },
            {
              id: 'simple2',
              name: 'simple2',
              data: [5, 3, 6, 8, 9],
            },
          ],
        },
        chartOptions: {
          type: 'bar',
          width: '550px',
          height: '230px',
          tickness: 0.8,
          xAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
            tickFormat: 'hh:mm:ss',
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
        stackOptions: {
          type: 'bar',
          width: '550px',
          height: '230px',
          tickness: 0.8,
          fill: true,
          stack: true,
          xAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
          }],
          yAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            position: 'left',
          }],
        },
        horizontalOptions: {
          type: 'bar',
          width: '550px',
          height: '230px',
          stack: true,
          tickness: 0.8,
          horizontal: true,
          xAxes: [{
            scaleType: 'auto', // auto, fix, step
            labelType: 'linear', // time, linear, category
            tickFormat: 'hh:mm:ss',
            showGrid: false,
            position: 'bottom',
            interval: 'minute',
          }],
          yAxes: [{
            scaleType: 'step', // auto, fix, step
            labelType: 'category', // time, linear, category
            showGrid: true,
            position: 'left',
          }],
        },
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
        this.interval = setInterval(this.barAddData.bind(this), 1000);
      },
      barAddData() {
        const randomData1 = Math.floor((Math.random() * 30) + 1);
        const randomData2 = Math.floor((Math.random() * 30) + 1);
        const randomData3 = Math.floor((Math.random() * 30) + 1);
        const randomData4 = Math.floor((Math.random() * 20) + 1);
        const randomData5 = Math.floor((Math.random() * 50) + 1);

        this.$children[0].addValue(0, randomData1, 0);
        this.$children[0].addValue(0, randomData2, 1);
        this.$children[0].addValue(0, randomData3, 2);
        this.$children[0].addValue(0, randomData4, 3);
        this.$children[0].addValue(0, randomData5, 4);

        this.$children[0].addValue(1, randomData5, 0);
        this.$children[0].addValue(1, randomData4, 1);
        this.$children[0].addValue(1, randomData3, 2);
        this.$children[0].addValue(1, randomData2, 3);
        this.$children[0].addValue(1, randomData1, 4);

        this.$children[1].addValue(0, randomData1, 0);
        this.$children[1].addValue(0, randomData2, 1);
        this.$children[1].addValue(0, randomData3, 2);
        this.$children[1].addValue(0, randomData4, 3);
        this.$children[1].addValue(0, randomData5, 4);

        this.$children[1].addValue(1, randomData5, 0);
        this.$children[1].addValue(1, randomData4, 1);
        this.$children[1].addValue(1, randomData3, 2);
        this.$children[1].addValue(1, randomData2, 3);
        this.$children[1].addValue(1, randomData1, 4);

        this.$children[2].addValue(0, randomData1, 0);
        this.$children[2].addValue(0, randomData2, 1);
        this.$children[2].addValue(0, randomData3, 2);
        this.$children[2].addValue(0, randomData4, 3);
        this.$children[2].addValue(0, randomData5, 4);

        this.$children[2].addValue(1, randomData5, 0);
        this.$children[2].addValue(1, randomData4, 1);
        this.$children[2].addValue(1, randomData3, 2);
        this.$children[2].addValue(1, randomData2, 3);
        this.$children[2].addValue(1, randomData1, 4);

        this.$children[0].chart.redraw();
        this.$children[1].chart.redraw();
        this.$children[2].chart.redraw();
      },
    },
  };
</script>
<style>
</style>
