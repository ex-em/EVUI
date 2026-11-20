<template>
  <div class="case">
    <div class="description">
      <span class="toggle-label">provisionalBand.use</span>
      <ev-toggle v-model="showBand" />
    </div>
    <div class="description">
      <span class="toggle-label">경계선</span>
      <ev-select v-model="borderStyle" :items="borderStyles" class="component" />
    </div>
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="latestOptions" />
    </resizable-wrapper>
    <div class="description">
      <code>provisionalBand.x</code>로 가운데 시각을 지정하면 해당 막대 슬롯이 표시됩니다.
    </div>
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="selectedOptions" />
    </resizable-wrapper>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const showBand = ref(true);
    const borderStyle = ref('dashed');
    const borderStyles = [
      { name: '점선', value: 'dashed' },
      { name: '실선', value: 'solid' },
      { name: '숨김', value: 'none' },
    ];
    const base = dayjs().startOf('hour');
    const labels = Array.from({ length: 7 }, (_, i) => base.add(i * 10, 'minute').valueOf());

    const chartData = ref({
      series: { series1: { name: '관측 건수' } },
      labels,
      data: { series1: [36, 53, 42, 64, 49, 58, 21] },
    });

    const createOptions = (title, x = null) =>
      computed(() => ({
        type: 'bar',
        width: '100%',
        height: '100%',
        thickness: 0.6,
        title: { text: title, show: true },
        legend: { show: false },
        axesX: [{ type: 'time', categoryMode: true, timeFormat: 'HH:mm', interval: { time: 10, unit: 'minute' } }],
        axesY: [{ type: 'linear', showGrid: true, startToZero: true, autoScaleRatio: 0.1 }],
        provisionalBand: {
          use: showBand.value,
          x,
          border: {
            width: borderStyle.value === 'none' ? 0 : 1,
            segments: borderStyle.value === 'solid' ? [] : null,
          },
        },
      }));

    return {
      showBand,
      borderStyle,
      borderStyles,
      chartData,
      latestOptions: createOptions('마지막 슬롯'),
      selectedOptions: createOptions('지정한 슬롯', labels[3]),
    };
  },
};
</script>
