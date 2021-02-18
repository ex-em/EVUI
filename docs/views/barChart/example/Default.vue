<template>
  <div>
    <ev-chart
      ref="chart"
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
    />
    <ev-button @click="selectValue1">
      select Value1
    </ev-button>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const chart = ref(null);

      const chartData = {
        series: {
          series1: { name: 'series#1' },
        },
        labels: ['value1', 'value2', 'value3', 'value5', 'value5'],
        data: {
          series1: [100, 150, 51, 150, 350],
        },
      };

      const chartOptions = {
        type: 'bar',
        thickness: 0.8,
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
        }],
        axesY: [{
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        }],
        selectItem: {
          use: true,
          showTextTip: true,
        },
      };

      const onClick = (target) => {
        console.log(`${target.label} is clicked.`);
      };

      const selectValue1 = () => {
        chart.value.selectItemByLabel('value1');
      };

      return {
        chart,
        chartData,
        chartOptions,
        onClick,
        selectValue1,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ev-button {
    margin-top: 50px;
  }
</style>
