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
    const chartData = {
      series: {
        chrome: { name: 'Chrome' },
        safari: { name: 'Safari' },
        edge: { name: 'Edge' },
        etc: { name: 'Etc' },
      },
      data: {
        chrome: [62],
        safari: [19],
        edge: [11],
        etc: [8],
      },
    };

    const chartOptions = reactive({
      type: 'pie',
      width: '100%',
      height: '100%',
      title: { text: 'Pie Annotations', show: true },
      legend: { show: true, position: 'right' },
      // ── series 위치 어노테이션은 파이 조각의 'arc 중앙'(각도 중간 × 반지름 중점)에 정렬된다 ──
      // (파이는 x/y축이 없어 axis 위치는 지원하지 않음)

      annotations: [
        // 1) callout: 가장 큰 조각(Chrome) arc 중앙 + 콜백(시리즈명/비율)
        {
          id: 'chrome-callout',
          type: 'callout',
          content: ctx => `${ctx.seriesName} ${ctx.percentage}%`,
          position: { type: 'series', seriesId: 'chrome', offsetX: 50, offsetY: 0 },
          style: { anchor: 'auto', backgroundColor: '#1F2937', color: '#FFFFFF', borderColor: '#1F2937' },
        },
        // 2) circle: 특정 조각(Safari) arc 중앙 강조
        {
          id: 'safari-circle',
          type: 'circle',
          position: { type: 'series', seriesId: 'safari' },
          style: { radius: 30, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 2 },
        },
        // 3) badge: 작은 조각(Edge)은 arc 중앙에서 connector로 바깥에 라벨 표시
        {
          id: 'edge-badge',
          type: 'badge',
          content: 'Edge',
          position: { type: 'series', seriesId: 'edge', offsetX: -70, offsetY: 0 },
          connector: { enabled: true, type: 'straight', style: { stroke: '#B24C4C', dashStyle: 'dash' } },
        },
        // 4) text: pixel(canvas 절대 좌표) 워터마크
        {
          id: 'watermark',
          type: 'text',
          content: 'pie demo',
          position: { type: 'pixel', x: 450, y: 50 },
          style: { color: '#9CA3AF', fontSize: '12px' },
        },
      ],
    });

    return { chartData, chartOptions };
  },
};
</script>
