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
          x: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
              '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
          y: ['SUN', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'SAT'],
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
          min: '#FFC19E',
          max: '#CC3D3D',
          categoryCnt: 5,
        },
        tooltip: {
          use: true,
        },
      };

      const createChartData = () => {
        const labelX = chartData.labels.x;
        const labelY = chartData.labels.y;
        for (let ix = 0; ix < labelX.length; ix++) {
          for (let iy = 0; iy < labelY.length; iy++) {
            const randomCount = Math.floor(Math.random() * 500) + 1;
            chartData.data.series1.push({
              x: labelX[ix],
              y: labelY[iy],
              value: randomCount,
            });
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
