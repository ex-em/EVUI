<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const commonSeries = {
      series1: { name: 'series#1' },
      series2: { name: 'series#2' },
      series3: { name: 'series#3' },
    };

    const chartData = ref({
      series: commonSeries,
      data: {
        series1: [10],
        series2: [20],
        series3: [70],
      },
    });

    const chartOptions = ref({
      type: 'pie',
      width: '100%',
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      doughnutHoleSize: 0.4,
    });

    const onApply = ({ chartData: d, chartOptions: o }) => {
      if (d) chartData.value = d;
      if (o) chartOptions.value = o;
    };

    return {
      chartData,
      chartOptions,
      onApply,
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  height: 100%;
}
</style>
