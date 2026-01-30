<template>
  <div class="case">
    <h3>Legend Click Mode Option Test</h3>
    <div class="example-controls">
      <label>
        <input v-model="legendClickMode" type="radio" value="active" />
        active (default) - 클릭시 활성화
      </label>
      <label>
        <input v-model="legendClickMode" type="radio" value="inactive" />
        inactive - 클릭시 비활성화
      </label>

      <p>
        active, 처음 클릭시 해당 시리즈만 표현, 마지막 남은 범례 클릭시 모든 시리즈 표현
        <br />
        inactive, 처음 클릭시 해당 시리즈만 감춤, 마지막 남은 범례 클릭시 무시
      </p>
    </div>
    <ev-chart :data="chartData" :options="chartOptions" @click-legend="handleClickLegend" />
    <div class="result">
      <div class="badge yellow">클릭된 시리즈 ID</div>
      {{ clickedSeriesIds }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'LegendClickMode',
  setup() {
    const legendClickMode = ref('active');

    const chartData = {
      series: {
        series1: {
          name: 'Series 1',
          color: '#FF6B6B',
        },
        series2: {
          name: 'Series 2',
          color: '#4ECDC4',
        },
        series3: {
          name: 'Series 3',
          color: '#45B7D1',
        },
        series4: {
          name: 'Series 4',
          color: '#FFA07A',
        },
      },
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: {
        series1: [10, 25, 15, 30, 20, 35],
        series2: [20, 15, 25, 20, 30, 25],
        series3: [15, 20, 30, 25, 15, 20],
        series4: [25, 30, 20, 15, 25, 30],
      },
    };

    const chartOptions = computed(() => ({
      type: 'bar',
      legend: {
        show: true,
        position: 'right',
        clickMode: legendClickMode.value,
      },
      axesX: [
        {
          type: 'step',
        },
      ],
      axesY: [
        {
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
    }));

    const clickedSeriesIds = ref([]);

    const handleClickLegend = (e) => {
      clickedSeriesIds.value = e.data.seriesIds;
    };

    return {
      legendClickMode,
      chartData,
      chartOptions,
      clickedSeriesIds,
      handleClickLegend,
    };
  },
};
</script>

<style lang="scss" scoped>
.example-controls {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;

  label {
    display: block;
    margin-bottom: 8px;
    cursor: pointer;

    input {
      margin-right: 8px;
    }
  }
}
</style>
