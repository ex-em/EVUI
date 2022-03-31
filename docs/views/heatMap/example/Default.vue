<template>
  <ev-chart
      :data="chartData"
      :options="chartOptions"
  />
</template>

<script>
import { onMounted, reactive } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
          },
        },
        labels: {
          x: [],
          y: [],
        },
        data: {
          series1: [],
        },
      });


      const chartOptions = {
        type: 'heatMap',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        indicator: {
          use: false,
        },
        axesX: [{
          type: 'step',
          showAxis: false,
        }],
        axesY: [{
          type: 'step',
        }],
        heatMapColor: {
          min: '#E5FFFF',
          max: '#5586EB',
          categoryCnt: 5,
          border: '#242426',
        },
      };

      const createChartData = () => {
        for (let ix = 1; ix <= 20; ix++) {
          chartData.labels.x.push(ix);
          chartData.labels.y.push(ix);
          for (let iy = 1; iy <= 20; iy++) {
            const randomCount = Math.floor(Math.random() * 5000) + 1;
            chartData.data.series1.push({ x: ix, y: iy, value: randomCount });
          }
        }
      };

      onMounted(() => {
        debugger;
        createChartData();
      });

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
