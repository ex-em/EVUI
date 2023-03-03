<template>
  <div class="case">
    <ev-chart
      v-model:selectedItem="selectedItem"
      v-model:selectedLabel="selectedLabel"
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <label class="badge yellow"> v-model:selectedItem </label>
      <span>{{ selectedItem }}</span>
      <br>
      <br>
      <label class="badge yellow"> v-model:selectedLabel</label>
      <span>{{ selectedLabel }}</span>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
          },
        },
        labels: {
          x: [
            '00', '01', '02', '03', '04', '05',
            '06', '07', '08', '09', '10', '11',
            '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23',
          ],
          y: ['02-01', '02-02', '02-03', '02-04', '02-05', '02-06', '02-07'],
        },
        data: {
          series1: [],
        },
      });

      const chartOptions = reactive({
        type: 'heatMap',
        width: '100%',
        height: '300px',
        title: {
          text: 'Chart Title',
          show: true,
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
          colorsByRange: [
            { color: '#EAE2B7', label: 'Normal' },
            { color: '#FCBF49', label: 'Caution' },
            { color: '#D62828', label: 'Crush' },
          ],
          decimalPoint: 1,
          stroke: {
            show: true,
            lineWidth: 1,
            color: '#FFFFFF',
          },
        },
        tooltip: {
          use: true,
          formatter: {
            title: ({ x }) => `${x}:00`,
          },
        },
        selectItem: {
          use: true,
          useSeriesOpacity: true,
          useClick: true,
          showBorder: true,
          useDeselectItem: true,
        },
        selectLabel: {
          use: true,
          useClick: true,
          limit: 3,
          useDeselectOverflow: true,
          useSeriesOpacity: true,
          useLabelOpacity: true,
          useBothAxis: true,
        },
      });

      const selectedItem = ref();

      const selectedLabel = ref({
        dataIndex: [],
      });

      const createChartData = () => {
        const labelX = chartData.labels.x;
        const labelY = chartData.labels.y;
        for (let ix = 0; ix < labelX.length; ix++) {
          for (let iy = 0; iy < labelY.length; iy++) {
            const randomCount = Math.floor(Math.random() * 3) + 1;
            chartData.data.series1.push({
              x: labelX[ix],
              y: labelY[iy],
              value: randomCount,
            });
          }
        }
      };
      createChartData();

      return {
        chartData,
        chartOptions,
        selectedItem,
        selectedLabel,
      };
    },
  };
</script>
