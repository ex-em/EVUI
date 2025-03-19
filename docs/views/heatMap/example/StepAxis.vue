<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <span>Y축 라벨 개수</span>
      <ev-input-number
        v-model="yLabelCount"
        :min="1"
        :max="100"
      />
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartOptions = {
        type: 'heatMap',
        width: '100%',
        height: '100%',
        title: {
          show: false,
        },
        indicator: {
          use: false,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          categoryMode: true,
          showGrid: true,
          interval: {
            time: 5,
            unit: 'second',
          },
          labelStyle: {
            alignToGridLine: true,
          },
        }],
        axesY: [{
          type: 'step',
          showGrid: true,
          labelStyle: {
            alignToGridLine: true,
          },
        }],
        heatMapColor: {
          min: '#CAF0F8',
          max: '#03045E',
          rangeCount: 8,
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 1,
          },
        },
        tooltip: {
          use: true,
        },
      };

      const yLabelCount = ref(2);
      const yLabels = [];

      const currentTime = dayjs();
      const xLabels = [
        dayjs(currentTime),
        dayjs(currentTime).add(5, 'second'),
        dayjs(currentTime).add(10, 'second'),
        dayjs(currentTime).add(15, 'second'),
        dayjs(currentTime).add(20, 'second'),
        dayjs(currentTime).add(25, 'second'),
        dayjs(currentTime).add(30, 'second'),
      ];

      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: false,
            },
          },
        },
        labels: {
          x: xLabels,
          y: yLabels,
        },
        data: {
          series1: [],
        },
      });

      const setChartRandomData = () => {
        chartData.data.series1 = [];

        const labelX = chartData.labels.x;
        const labelY = chartData.labels.y;
        for (let ix = 0; ix < labelX.length; ix++) {
          for (let iy = 0; iy < labelY.length; iy++) {
            const randomCount = Math.floor(Math.random() * 50) + 1;
            chartData.data.series1.push({
              x: dayjs(labelX[ix]),
              y: labelY[iy],
              value: randomCount,
            });
          }
        }
      };

      watch(yLabelCount, (newValue) => {
        yLabels.splice(0, yLabels.length);
        yLabels.push(0);

        for (let i = 1; i <= newValue; i++) {
          yLabels.push(i);
        }

        setChartRandomData();
      }, {
        immediate: true,
      });

      return {
        chartData,
        chartOptions,
        yLabelCount,
      };
    },
  };
</script>

<style lang="scss" scoped>
.case {
  display: flex;
  height: 100%;
  flex-direction: column;

  :deep(.ev-chart) {
    flex: auto;
  }
}
</style>
