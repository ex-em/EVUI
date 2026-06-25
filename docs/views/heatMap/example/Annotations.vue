<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    const chartData = reactive({
      series: {
        load: { name: 'Load' },
      },
      labels: {
        x: ['00:00', '06:00', '12:00', '18:00'],
        y: ['1w', '2w', '3w'],
      },
      data: {
        load: [
          { x: '00:00', y: '1w', value: 100 },
          { x: '00:00', y: '2w', value: 80 },
          { x: '00:00', y: '3w', value: 130 },
          { x: '06:00', y: '1w', value: 20 },
          { x: '06:00', y: '2w', value: 150 },
          { x: '06:00', y: '3w', value: 115 },
          { x: '12:00', y: '1w', value: 150 },
          { x: '12:00', y: '2w', value: 80 },
          { x: '12:00', y: '3w', value: 120 },
          { x: '18:00', y: '1w', value: 30 },
          { x: '18:00', y: '2w', value: 150 },
          { x: '18:00', y: '3w', value: 90 },
        ],
      },
    });

    const hotIdx = 4; // { x: '06:00', y: '2w', value: 150 }

    const chartOptions = reactive({
      type: 'heatMap',
      width: '100%',
      height: '100%',
      padding: { top: 40, right: 40, left: 10, bottom: 10 },
      title: { text: 'HeatMap Annotations', show: true },
      axesX: [{ type: 'step' }],
      axesY: [{ type: 'step' }],
      heatMapColor: { min: '#FFC19E', max: '#CC3D3D', rangeCount: 5 },
      tooltip: { use: true },
      // ── series 위치는 셀 '중심', axis 위치는 step 라벨(x/y) 기준 ──
      annotations: [
        // 1) callout: 특정 셀 중심 추적
        {
          id: 'hot-callout',
          type: 'callout',
          content: 'Hotspot',
          position: { type: 'series', seriesId: 'load', location: hotIdx, offsetY: -30 },
          style: { backgroundColor: '#1F2937', color: '#FFFFFF', borderColor: '#1F2937' },
        },
        // 2) circle: 셀 중심 강조
        {
          id: 'mark-circle',
          type: 'circle',
          position: { type: 'series', seriesId: 'load', location: 6 },
          style: { radius: 14, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.12)', borderWidth: 2 },
        },
        // 3) badge: axis(step 라벨 x/y) 위치 + connector(elbow)
        {
          id: 'label-badge',
          type: 'badge',
          content: '12:00 / 3w',
          position: { type: 'axis', xValue: '12:00', yValue: '3w', offsetX: 40, offsetY: -34 },
          connector: { enabled: true, type: 'elbow', style: { stroke: '#B24C4C', dashStyle: 'dash' } },
        },
        // 4) text: pixel(canvas 절대 좌표) 워터마크
        {
          id: 'watermark',
          type: 'text',
          content: 'heatmap demo',
          position: { type: 'pixel', x: 110, y: 60 },
          style: { color: '#9CA3AF', fontSize: '12px' },
        },
      ],
    });

    return { chartData, chartOptions };
  },
};
</script>
