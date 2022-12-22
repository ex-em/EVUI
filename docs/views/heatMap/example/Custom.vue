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
          x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
          use: true,
        },
        axesX: [{
          type: 'step',
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        heatMapColor: {
          categoryColors: [
            { color: '#4FD4B6', label: 'Low' },
            { color: '#6DB9E3', label: 'Medium' },
            { color: '#5A4BE1', label: 'High' },
          ],
          error: '#D46C4F',
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 2,
            radius: 3,
          },
        },
        tooltip: {
          use: true,
        },
      };

      const crateYAxisLabels = () => {
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 7; i++) {
          chartData.labels.y.push(currentYear - i);
        }
      };

      const createChartData = () => {
        const labelX = chartData.labels.x;
        const labelY = chartData.labels.y;
        for (let ix = 0; ix < labelX.length; ix++) {
          for (let iy = 0; iy < labelY.length; iy++) {
            let randomCount = Math.floor(Math.random() * 100) + 1;
            if (randomCount > 90) {
              randomCount = -1;
            }
            chartData.data.series1.push({
              x: labelX[ix],
              y: labelY[iy],
              value: randomCount,
            });
          }
        }
      };

      onMounted(() => {
        crateYAxisLabels();
        createChartData();
      });

      return {
        chartData,
        chartOptions,
      };
    },
  };
</script>
