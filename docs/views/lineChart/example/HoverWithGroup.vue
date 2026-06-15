<template>
  <div class="case">
    <ev-chart-group :options="{ syncHover }">
      <resizable-wrapper height="50%">
        <ev-chart
          :data="lineChartData"
          :options="lineChartOption"
        />
      </resizable-wrapper>
      <resizable-wrapper height="50%">
        <ev-chart
          :data="barChartData"
          :options="barChartOption"
        />
      </resizable-wrapper>
    </ev-chart-group>
  </div>

  <div class="description">
    <div class="description-row">
      <label class="description-label">그룹 호버 동기화</label>
      <ev-toggle v-model="syncHover" />
    </div>
    <div class="description-row">
      <label class="description-label">Line Chart - x축 시간 개수</label>
      <ev-input-number v-model="lineChartLabelCount" />
    </div>
    <div class="description-row">
      <label class="description-label">Bar Chart - x축 시간 개수</label>
      <ev-input-number v-model="barChartLabelCount" />
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const lineChartLabelCount = ref(10);
    const barChartLabelCount = ref(10);

    const getTimeLabels = (count) => {
      return Array.from({ length: count }, (_, index) => dayjs('2026-05-14 00:00:00').add(index * 5, 'second').valueOf());
    };

    const getValues = (count) => {
      return Array.from({ length: count }, (_, index) => Math.floor(Math.random() * 100));
    };

    const syncHover = ref(true);

    const lineChartData = reactive({
      series: {
        series1: { name: 'series#1' },
      },
      labels: getTimeLabels(lineChartLabelCount.value),
      data: {
        series1: getValues(lineChartLabelCount.value),
      },
    });

    const barChartData = reactive({
      series: {
        series1: { name: 'series1', fill: true, point: false },
      },
      labels: getTimeLabels(barChartLabelCount.value),
      data: {
        series1: getValues(barChartLabelCount.value),
      },
    });

    watch(lineChartLabelCount, (newCount) => {
      lineChartData.labels = getTimeLabels(newCount);
      lineChartData.data.series1 = getValues(newCount);
    });

    watch(barChartLabelCount, (newCount) => {
      barChartData.labels = getTimeLabels(newCount);
      barChartData.data.series1 = getValues(newCount);
    });

    const lineChartOption = ref({
      syncHover: syncHover.value,
      type: 'line',
      legend: {
        show: false,
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: {
            time: 5,
            unit: 'second',
          },
        },
      ],
      axesY: [
        {
          type: 'linear',
        },
      ],
    });

    const barChartOption = ref({
      syncHover: syncHover.value,
      type: 'bar',
      thickness: 0.6,
      legend: {
        show: false,
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: {
            time: 5,
            unit: 'second',
          },
          categoryMode: true,
        },
      ],
      axesY: [
        {
          type: 'linear',
        },
      ],
    });

    return {
      syncHover,
      lineChartData,
      barChartData,
      lineChartOption,
      barChartOption,
      lineChartLabelCount,
      barChartLabelCount,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.description-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  .description-label {
    width: 150px;
  }
}
</style>
