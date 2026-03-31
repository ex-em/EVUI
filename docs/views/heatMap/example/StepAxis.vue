<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>

  <div class="description">
    <div class="row">
      <span>Y축 눈금 개수</span>
      <ev-input-number v-model="yLabelCount" :min="1" :max="100" />
    </div>
    <div class="row">
      <span>소수점 자릿수</span>
      <ev-input-number v-model="decimalPoint" :min="0" :max="10" />
    </div>
    <div class="row">
      <span>마지막 라벨 표시</span>
      <ev-toggle v-model="showLastLabel" />
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const showLastLabel = ref(false);
    const chartOptions = reactive({
      type: 'heatMap',
      width: '100%',
      height: '100%',
      title: {
        show: false,
      },
      indicator: {
        use: false,
      },
      axesX: [
        {
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
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          type: 'step',
          showGrid: true,
          labelStyle: {
            alignToGridLine: true,
          },
          showAxisTick: true,
          axisLineColor: '#25262E',
          showLastLabel,
          lastLabelFontStyle: {
            color: '#FF0000',
            fontSize: 16,
            fontWeight: 600,
          },
        },
      ],
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
    });

    const yLabelCount = ref(20);
    const decimalPoint = ref(0);
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

    watch(
      [yLabelCount, decimalPoint],
      () => {
        yLabels.splice(0, yLabels.length);
        yLabels.push(0);

        for (let i = 1; i <= yLabelCount.value; i++) {
          yLabels.push(i / 10 ** decimalPoint.value);
        }

        setChartRandomData();
      },
      {
        immediate: true,
      },
    );

    return {
      chartData,
      chartOptions,
      yLabelCount,
      decimalPoint,
      showLastLabel,
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  .description {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
}
</style>
