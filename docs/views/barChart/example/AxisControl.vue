<template>
  <div class="case">

  <ev-chart
    :data="chartData"
    :options="chartOptions"
  />
  <div class="description">
      <div class="hover-options">
        <span>axisXShow</span>
        <ev-toggle v-model="axisXShow" />
        <span>axisYShow</span>
        <ev-toggle v-model="axisYShow" />
        <span>gridXShow</span>
        <ev-toggle v-model="gridXShow" />
        <span>gridYShow</span>
        <ev-toggle v-model="gridYShow" />
        <span>formatterApply: () => ''</span>
        <ev-toggle v-model="formatterApply" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

  export default {
    setup() {
      const chartData = {
        series: {
          series1: { name: '시리즈 이름' },
        },
        labels: ['가나다라', '마바사', '아자차', '카타', '파하하'],
        data: {
          series1: [100, 150, 51, 150, 350],
        },
      };

      const axisXShow = ref(true);
      const axisYShow = ref(true);
      const gridXShow = ref(true);
      const gridYShow = ref(true);
      const formatterApply = ref(false);

      const chartOptions = computed(() => ({
        type: 'bar',
        cPadRatio: 0.1,
        axesX: [{
          type: 'step',
          showAxis: axisXShow.value,
          showGrid: gridXShow.value,
        }],
        axesY: [{
          showAxis: axisYShow.value,
          showGrid: gridYShow.value,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          formatter: formatterApply.value ? () => '' : undefined,
        }],
      }));

      return {
        chartData,
        chartOptions,
        axisXShow,
        axisYShow,
        gridXShow,
        gridYShow,
        formatterApply,
      };
    },
  };
</script>

<style lang="scss" scoped>
</style>
