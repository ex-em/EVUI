<template>
  <div class="case">
    <ev-chart :data="chartData" :options="chartOptions" />
    <div class="description">
      <div class="badge yellow">unSelectedOpacity</div>
      <ev-input-number v-model="unSelectedOpacity" :min="0" :max="1" :step="0.1" :precision="1" />
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';

export default {
  setup() {
    const chartData = {
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
        series3: { name: 'series#3' },
      },
      data: {
        series1: [10],
        series2: [20],
        series3: [70],
      },
    };

    const unSelectedOpacity = ref(0.3);
    const chartOptions = reactive({
      type: 'pie',
      width: '100%',
      height: '100%',
      unSelectedOpacity,
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      tooltip: {
        formatter: ({ value }) => `${value}%`,
      },
    });

    return {
      chartData,
      chartOptions,
      unSelectedOpacity,
    };
  },
};
</script>
