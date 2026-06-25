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
        samples: { name: 'Samples', pointSize: 5 },
      },
      data: {
        samples: [
          { x: 10, y: 22 },
          { x: 25, y: 38 },
          { x: 40, y: 30 },
          { x: 55, y: 64 },
          { x: 70, y: 48 },
          { x: 85, y: 80 },
          { x: 95, y: 58 },
          { x: 60, y: 18 },
        ],
      },
    });

    const peakIdx = 5; // { x: 85, y: 80 } 최댓값

    const chartOptions = reactive({
      type: 'scatter',
      width: '100%',
      height: '100%',
      padding: { top: 40, right: 40, left: 10, bottom: 10 },
      title: { text: 'Scatter Annotations', show: true },
      legend: { show: false },
      axesX: [{ type: 'linear', startToZero: true, showGrid: true }],
      axesY: [{ type: 'linear', startToZero: true, showGrid: true }],
      // ── series 위치 어노테이션이 포인트 '중심'에 정확히 붙는지 확인 ──
      annotations: [
        // 1) callout: 특정 포인트 추적(점 중심) + 콜백 content
        {
          id: 'peak-callout',
          type: 'callout',
          content: ctx => `Max (${ctx.xValue}, ${ctx.yValue})`,
          position: { type: 'series', seriesId: 'samples', location: peakIdx, offsetY: -28 },
          style: { backgroundColor: '#1F2937', color: '#FFFFFF', borderColor: '#1F2937' },
        },
        // 2) circle: 포인트 강조
        {
          id: 'mark-circle',
          type: 'circle',
          position: { type: 'series', seriesId: 'samples', location: 3 },
          style: { radius: 12, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.12)', borderWidth: 2 },
        },
        // 3) badge: axis(linear) 임계값 + connector(straight)
        {
          id: 'threshold-badge',
          type: 'badge',
          content: 'y = 60',
          position: { type: 'axis', xValue: 30, yValue: 60, offsetY: -34 },
          connector: { enabled: true, type: 'straight', style: { stroke: '#B24C4C', dashStyle: 'dash' } },
        },
        // 4) text: pixel(canvas 절대 좌표) 워터마크
        {
          id: 'watermark',
          type: 'text',
          content: 'scatter demo',
          position: { type: 'pixel', x: 100, y: 60 },
          style: { color: '#9CA3AF', fontSize: '12px' },
        },
      ],
    });

    return { chartData, chartOptions };
  },
};
</script>
