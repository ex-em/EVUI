<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
  export default {
    setup() {
      const chartData = {
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
          series4: { name: 'series#4' },
          series5: { name: 'series#5' },
          series6: { name: 'series#6' },
          series7: { name: 'series#7' },
          series8: { name: 'series#8' },
          series9: { name: 'series#9' },
        },
        data: [{
          id: 'series1',
          value: 15,
          children: [{
            id: 'series2',
            value: 30,
          }, {
            id: 'series5',
            value: 10,
            children: [{
              id: 'series7',
              value: 10,
            }],
          }],
        }, {
          id: 'series3',
          value: 20,
          children: [{
            id: 'series6',
            value: 5,
            children: [{
              id: 'series8',
              value: 10,
              children: [{
                id: 'series9',
                value: 10,
              }],
            }],
          }],
        }],
      };

      const chartOptions = {
        type: 'pie',
        width: '100%',
        height: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        indicator: {
          use: false,
        },
        sunburst: true,
        reverse: false,
        doughnutHoleSize: 0.4,
      };

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .case {
    height: 100%;
  }
</style>
