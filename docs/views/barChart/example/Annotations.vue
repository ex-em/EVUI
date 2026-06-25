<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <span class="toggle-label">Horizontal</span>
    <ev-toggle v-model="isHorizontal" />
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  setup() {
    const isHorizontal = ref(false);

    const chartData = {
      series: {
        sales: { name: 'Sales' },
      },
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      data: {
        sales: [40, 65, 30, 80, 55],
      },
    };

    const peakIdx = 3; // 'Thu' = 80 (최댓값)
    const lowIdx = 2; // 'Wed' = 30 (최솟값)

    const chartOptions = computed(() => ({
      type: 'bar',
      width: '100%',
      height: '100%',
      thickness: 0.6,
      horizontal: isHorizontal.value,
      padding: { top: 80, right: 40, left: 10, bottom: 10 },
      title: { text: 'Bar Annotations (center-anchored)', show: true },
      legend: { show: false },
      axesX: [
        isHorizontal.value
          ? { type: 'linear', startToZero: true, showGrid: true }
          : { type: 'step', showAxisTick: true },
      ],
      axesY: [
        isHorizontal.value
          ? { type: 'step', showAxisTick: true }
          : { type: 'linear', startToZero: true, showGrid: true },
      ],
      // ── series 위치 어노테이션이 막대의 '중심'에 정렬되는지 확인하는 데모 ──
      annotations: [
        // 1) callout: 최댓값 막대 중심을 가리킴(가로/세로 모두 중심 유지)
        {
          id: 'peak-callout',
          type: 'callout',
          content: ctx => `Peak ${typeof ctx.yValue === 'number' ? ctx.yValue : ctx.xValue}`,
          position: {
            type: 'series',
            seriesId: 'sales',
            location: peakIdx,
            offsetX: isHorizontal.value ? 50 : 0,
            offsetY: isHorizontal.value ? 0 : -44,
          },
          style: { backgroundColor: '#1F2937', color: '#FFFFFF', borderColor: '#1F2937' },
        },
        // 2) badge + connector(elbow): 최솟값 막대 중심에서 리더선으로 연결
        {
          id: 'low-badge',
          type: 'badge',
          content: 'Lowest',
          position: {
            type: 'series',
            seriesId: 'sales',
            location: lowIdx,
            offsetX: 56,
            offsetY: -44,
          },
          connector: { enabled: true, type: 'elbow', style: { stroke: '#B24C4C', dashStyle: 'dash' } },
        },
        // 3) circle: 막대 중심 강조(텍스트 없음)
        {
          id: 'mark-circle',
          type: 'circle',
          position: { type: 'series', seriesId: 'sales', location: 1 },
          style: { radius: 10, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 2 },
        },
        // 4) text: pixel(canvas 절대 좌표) 고정 워터마크
        {
          id: 'watermark',
          type: 'text',
          content: 'Pixel Position (120, 60)',
          position: { type: 'pixel', x: 120, y: 60 },
          style: { color: '#9CA3AF', fontSize: '12px' },
        },
      ],
    }));

    return { chartData, chartOptions, isHorizontal };
  },
};
</script>

<style lang="scss" scoped>
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
