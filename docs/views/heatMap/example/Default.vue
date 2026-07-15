<template>
  <resizable-wrapper>
    <ev-chart :data="chartData" :options="chartOptions" />
  </resizable-wrapper>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const chartData = ref({
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

    const chartOptions = ref({
      type: 'heatMap',
      axesX: [
        {
          type: 'step',
        },
      ],
      axesY: [
        {
          type: 'step',
        },
      ],
      heatMapColor: {
        min: '#FFC19E',
        max: '#CC3D3D',
        rangeCount: 5,
      },
      tooltip: {
        use: true,
      },
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
