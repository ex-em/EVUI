<template>
  <div class="case">
    <h3>Legend clickMode Option Test</h3>
    <div class="example-controls">
      <label>
        <input
          v-model="legendClickMode"
          type="radio"
          value="active"
        >
        active (default) - 클릭시 활성화
      </label>
      <label>
        <input
          v-model="legendClickMode"
          type="radio"
          value="inactive"
        >
        inactive - 클릭시 비활성화
      </label>

      <p>
        active, 처음 클릭시 해당 시리즈만 표현, 마지막 남은 범례 클릭시 모든 시리즈 표현
        <br />
        inactive, 처음 클릭시 해당 시리즈만 감춤, 마지막 남은 범례 클릭시 무시
      </p>
    </div>
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue';

  export default {
    setup() {
      const legendClickMode = ref('active');

      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
          },
        },
        labels: {
          x: ['00:00', '06:00', '12:00', '18:00'],
          y: ['1w', '2w', '3w'],
        },
        data: {
          series1: [
            { x: '00:00', y: '1w', value: 100 },
            { x: '00:00', y: '2w', value: 80 },
            { x: '00:00', y: '3w', value: 130 },
            { x: '06:00', y: '1w', value: 20 },
            { x: '06:00', y: '2w', value: 150 },
            { x: '06:00', y: '3w', value: 115 },
            { x: '12:00', y: '1w', value: 150 },
            { x: '12:00', y: '2w', value: 80 },
            { x: '12:00', y: '3w', value: 120 },
            { x: '18:00', y: '1w', value: 0, color: 'rgb(255, 255, 0)' },
            { x: '18:00', y: '2w', value: 150, color: '#D3D3D3' },
            { x: '18:00', y: '3w', value: 90, color: 'rgba(0,0,0,0.5)' },
          ],
        },
      });


      const chartOptions = computed(() => ({
        type: 'heatMap',
        axesX: [{
          type: 'step',
        }],
        axesY: [{
          type: 'step',
        }],
        heatMapColor: {
          min: '#FFC19E',
          max: '#CC3D3D',
          rangeCount: 5,
        },
        tooltip: {
          use: true,
        },
        legend: {
          show: true,
          position: 'right',
          clickMode: legendClickMode.value,
        },
      }));

      return {
        chartData,
        chartOptions,
        legendClickMode,
      };
    },
  };
</script>
