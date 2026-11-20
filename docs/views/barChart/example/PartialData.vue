<template>
  <div class="case">
    <div class="description">
      <span class="toggle-label">partialData.use</span>
      <ev-toggle v-model="usePartial" />
    </div>
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const usePartial = ref(true);
    const base = dayjs().startOf('hour');

    const chartData = ref({
      series: { series1: { name: '트랜잭션 수' } },
      labels: Array.from({ length: 7 }, (_, i) => base.add(i * 10, 'minute').valueOf()),
      data: { series1: [36, 53, 42, 64, 49, 58, 21] },
    });

    const chartOptions = computed(() => ({
      type: 'bar',
      width: '100%',
      height: '100%',
      thickness: 0.6,
      title: { text: 'Bar (categoryMode)', show: true },
      legend: { show: false },
      axesX: [{ type: 'time', categoryMode: true, timeFormat: 'HH:mm', interval: { time: 10, unit: 'minute' } }],
      axesY: [{ type: 'linear', showGrid: true, startToZero: true, autoScaleRatio: 0.1 }],
      partialData: { use: usePartial.value },
    }));

    return { usePartial, chartData, chartOptions };
  },
};
</script>
