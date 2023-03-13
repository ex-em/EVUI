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
          y: ['02-01', '02-02', '02-03', '02-04', '02-05', '02-06', '02-07',
            '02-08', '02-09', '02-10', '02-11', '02-12', '02-13', '02-14',
            '02-15', '02-16', '02-17', '02-18', '02-19', '02-20', '02-21',
            '02-22', '02-23', '02-24', '02-25', '02-26', '02-27', '02-28',
            '03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07',
            '03-08', '03-09', '03-10', '03-11', '03-12',
          ],
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
          range: [0, 5],
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
          range: [0, 5],
          scrollbar: {
            use: true,
          },
        }],
        heatMapColor: {
          colorsByRange: [
            { color: '#EAE2B7', label: 'Normal' },
            { color: '#FCBF49', label: 'Caution' },
            { color: '#D62828', label: 'Crush' },
          ],
          decimalPoint: 1,
          stroke: {
            show: false,
            lineWidth: 2,
            color: '#FFFFFF',
            radius: 2,
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
