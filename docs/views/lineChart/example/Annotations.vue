<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <span class="toggle-label">데이터 자동 업데이트</span>
    <ev-toggle v-model="isLive" />
  </div>
</template>

<script>
import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const base = dayjs('2026-06-23 00:00:00');

    const chartData = reactive({
      series: {
        cpu: { name: 'CPU', point: true },
        mem: { name: 'MEM', point: true },
      },
      labels: [],
      data: {
        cpu: [],
        mem: [],
      },
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
      padding: { top: 40, right: 40, left: 10, bottom: 10 },
      title: { text: 'Annotations & Badge', show: true },
      legend: { show: true, position: 'right' },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm',
          interval: { time: 2, unit: 'hour' },
          showAxisTick: true,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          formatter: value => `${value / 1000}k`,
        },
      ],
      // ── 어노테이션 모듈 데모 ───────────────────────────────
      annotations: [
        // 1) callout: CPU 마지막 데이터 포인트 추적(라이브 시 자동 갱신) + 콜백 content
        {
          id: 'cpu-callout',
          type: 'callout',
          content: ctx => `${ctx.seriesName}: ${(ctx.yValue / 1000).toFixed(0)}k`,
          position: {
            type: 'series',
            seriesId: 'cpu',
            location: 'end',
            offsetY: -24,
          },
          style: { backgroundColor: '#1F2937', color: '#FFFFFF', borderColor: '#1F2937' },
        },
        // 2) callout: MEM 마지막 데이터 포인트 추적
        {
          id: 'mem-callout',
          type: 'callout',
          content: ctx => `${ctx.seriesName}: ${(ctx.yValue / 1000).toFixed(0)}k`,
          position: {
            type: 'series',
            seriesId: 'mem',
            location: 'end',
            offsetY: -24,
          },
          style: { backgroundColor: '#2563EB', color: '#FFFFFF', borderColor: '#2563EB' },
        },
        // 3) circle: 특정 데이터 포인트 강조(텍스트 없음)
        {
          id: 'peak-circle',
          type: 'circle',
          position: { type: 'series', seriesId: 'cpu', location: 8 },
          style: { radius: 14, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 2 },
        },
        // 4) badge: axis(time/linear) 기준 + connector(elbow) 로 임계선 표기
        {
          id: 'threshold-badge',
          type: 'badge',
          content: 'xValue position',
          position: {
            type: 'axis',
            xValue: base.add(4, 'hour').valueOf(),
            yValue: 30000,
            offsetX: 70,
            offsetY: -40,
          },
          connector: { enabled: true, type: 'elbow', style: { stroke: '#B24C4C', dashStyle: 'dash' } },
        },
        // 5) text: pixel(canvas 절대 좌표) 고정 라벨 + '\n' 멀티라인 데모
        {
          id: 'watermark',
          type: 'text',
          content: 'Pixel Position (150, 70)\n\\n 으로 멀티라인 지원\n세 번째 줄',
          position: { type: 'pixel', x: 150, y: 70 },
          style: { color: '#9CA3AF', fontSize: '12px' },
        },
      ],
    });

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = base;

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData.labels.shift();
        chartData.data.cpu.shift();
        chartData.data.mem.shift();
      }

      timeValue = dayjs(timeValue).add(1, 'hour');
      chartData.labels.push(timeValue);
      chartData.data.cpu.push(Math.round(Math.random() * 40000 + 5000));
      chartData.data.mem.push(Math.round(Math.random() * 40000 + 5000));
    };

    onMounted(() => {
      for (let ix = 0; ix < 12; ix++) {
        addRandomChartData();
      }
    });

    watch(isLive, (newValue) => {
      if (newValue) {
        addRandomChartData();
        liveInterval.value = setInterval(addRandomChartData, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return { chartData, chartOptions, isLive };
  },
};
</script>

<style lang="scss" scoped>
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
