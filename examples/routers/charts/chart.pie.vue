<template>
  <div style="width: 33%; overflow: auto;">
    <chart
      :data="pieData"
      :options="pieOptions"
    />
    <chart
      :data="pieData"
      :options="doughnutOptions"
    />
    <chart
      :data="sunburstData"
      :options="sunburstOptions"
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
        pieData: {
          series: [
            {
              id: 'series0',
              name: 'series-0',
              show: true,
              data: [5, 10, 6],
            },
            {
              id: 'series1',
              name: 'series-1',
              show: true,
              data: [10, 12, 8],
            },
            {
              id: 'series2',
              name: 'series-2',
              show: true,
              data: [15, 10, 20],
            },
            {
              id: 'series3',
              name: 'series-3',
              show: true,
              data: [5, 15, 10],
            },
          ],
        },
        sunburstData: {
          series: [
            {
              id: 'series_0',
              name: 'series_0',
              show: true,
              data: 15,
              children: [
                {
                  id: 'series_0_0',
                  name: 'series_0_0',
                  show: true,
                  data: 10,
                },
                {
                  id: 'series_0_1',
                  name: 'series_0_1',
                  show: true,
                  data: 12,
                },
              ],
            },
            {
              id: 'series_2',
              name: 'series_2',
              show: true,
              data: 12,
            },
          ],
        },
        pieOptions: {
          type: 'pie',
          width: '400px',
          height: '350px',
          legend: {
            show: false,
          },
        },
        doughnutOptions: {
          type: 'pie',
          doughnutHoleSize: 0.4,
          width: '400px',
          height: '350px',
        },
        sunburstOptions: {
          type: 'sunburst',
          width: '400px',
          height: '350px',
          doughnutHoleSize: 0.4,
        },
      };
    },
    mounted() {
      this.addData();
    },
    methods: {
      addData() {
        this.interval = setInterval(this.pieAddData.bind(this), 1000);
      },
      pieAddData() {
        const randomData1 = Math.floor((Math.random() * 30) + 1);
        const randomData2 = Math.floor((Math.random() * 30) + 1);
        const randomData3 = Math.floor((Math.random() * 30) + 1);

        this.$children[0].addValue(0, randomData1, 0);
        this.$children[0].addValue(0, randomData2, 1);
        this.$children[0].addValue(0, randomData3, 2);

        this.$children[0].addValue(1, randomData1, 1);
        this.$children[0].addValue(1, randomData2, 0);
        this.$children[0].addValue(1, randomData3, 2);

        this.$children[0].addValue(2, randomData1, 2);
        this.$children[0].addValue(2, randomData2, 0);
        this.$children[0].addValue(2, randomData3, 1);

        this.$children[0].addValue(3, randomData1, 2);
        this.$children[0].addValue(3, randomData2, 1);
        this.$children[0].addValue(3, randomData3, 0);

        this.$children[0].chart.redraw();

        this.$children[1].addValue(0, randomData1, 0);
        this.$children[1].addValue(0, randomData2, 1);
        this.$children[1].addValue(0, randomData3, 2);

        this.$children[1].addValue(1, randomData1, 1);
        this.$children[1].addValue(1, randomData2, 0);
        this.$children[1].addValue(1, randomData3, 2);

        this.$children[1].addValue(2, randomData1, 2);
        this.$children[1].addValue(2, randomData2, 0);
        this.$children[1].addValue(2, randomData3, 1);

        this.$children[1].addValue(3, randomData1, 2);
        this.$children[1].addValue(3, randomData2, 1);
        this.$children[1].addValue(3, randomData3, 0);

        this.$children[1].chart.redraw();
      },
    },
  };
</script>
<style>
</style>
