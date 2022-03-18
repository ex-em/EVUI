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
            colorOpt: {
              min: '#E5FFFF',
              max: '#5586EB',
              categoryCnt: 5,
              border: '#242426',
            },
            spaces: {
              x: 30,
              y: 20,
            },
          },
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
          type: 'linear',
          showAxis: true,
          autoScaleRatio: null,
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
        }],
        tooltip: {
          use: true,
        },
      };

      const createChartData = () => {
        const spaceX = chartData.series.series1.spaces.x;
        const spaceY = chartData.series.series1.spaces.y;

        for (let ix = 1; ix <= spaceX; ix++) {
          for (let iy = 2; iy <= spaceY * 2; iy += 2) {
            const randomCount = Math.floor(Math.random() * 5000) + 1;
            chartData.data.series1.push({ x: ix, y: iy, count: randomCount });
          }
        }
      };

      onMounted(() => {
        createChartData();
      });

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
