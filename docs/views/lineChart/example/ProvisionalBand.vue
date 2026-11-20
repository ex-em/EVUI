<template>
  <div class="case">
    <div class="description">
      <span class="toggle-label">provisionalBand.use</span>
      <ev-toggle v-model="showBand" />
    </div>
    <div class="description">
      <span class="toggle-label">경계선</span>
      <ev-select v-model="borderStyle" :items="borderStyles" class="component" />
    </div>
    <resizable-wrapper>
      <ev-chart :data="lineData" :options="lineOptions" />
    </resizable-wrapper>
    <resizable-wrapper>
      <ev-chart :data="areaData" :options="areaOptions" />
    </resizable-wrapper>
    <div class="description">
      <code>provisionalBand.x</code>로 가운데 시각을 지정하면 양쪽 이웃 점의 중간에 경계가 생깁니다.
    </div>
    <resizable-wrapper>
      <ev-chart :data="lineData" :options="selectedOptions" />
    </resizable-wrapper>
    <div class="description">
      <span class="toggle-label">과거 구간 확대 (앞 3개 점 · 툴바의 드래그 줌을 켠 뒤)</span>
      <ev-toggle v-model="zoomPast" />
    </div>
    <resizable-wrapper>
      <ev-chart
        v-model:zoomStartIdx="zoomStartIdx"
        v-model:zoomEndIdx="zoomEndIdx"
        :data="zoomData"
        :options="zoomOptions"
      />
    </resizable-wrapper>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const showBand = ref(true);
    const borderStyle = ref('dashed');
    const borderStyles = [
      { name: '점선', value: 'dashed' },
      { name: '실선', value: 'solid' },
      { name: '숨김', value: 'none' },
    ];
    const base = dayjs().startOf('hour');
    const labels = Array.from({ length: 7 }, (_, i) => base.add(i * 10, 'minute').valueOf());

    const lineData = ref({
      series: { series1: { name: '관측값' } },
      labels,
      data: { series1: [36, 53, 42, 64, 49, 58, 41] },
    });

    const areaData = ref({
      series: { series1: { name: '관측값', fill: true } },
      labels,
      data: { series1: [120, 150, 132, 170, 160, 182, 95] },
    });

    // 줌은 data 를 잘라 넘긴다 — 과거 구간만 확대하면 잘린 끝이 원본의 마지막이 아니므로 영역이 사라져야 한다.
    const zoomData = ref({
      series: { series1: { name: '관측값' } },
      labels: [...labels],
      data: { series1: [36, 53, 42, 64, 49, 58, 41] },
    });
    const zoomStartIdx = ref(0);
    const zoomEndIdx = ref(labels.length - 1);
    const zoomPast = ref(false);
    watch(zoomPast, (isPast) => {
      zoomStartIdx.value = 0;
      zoomEndIdx.value = isPast ? 2 : labels.length - 1;
    });

    const createOptions = (title, { x = null, ...extra } = {}) =>
      computed(() => ({
        type: 'line',
        width: '100%',
        height: '100%',
        title: { text: title, show: true },
        legend: { show: false },
        axesX: [{ type: 'time', timeFormat: 'HH:mm', interval: { time: 10, unit: 'minute' } }],
        axesY: [{ type: 'linear', showGrid: true, startToZero: true, autoScaleRatio: 0.1 }],
        provisionalBand: {
          use: showBand.value,
          x,
          border: {
            width: borderStyle.value === 'none' ? 0 : 1,
            segments: borderStyle.value === 'solid' ? [] : null,
          },
        },
        ...extra,
      }));

    return {
      showBand,
      borderStyle,
      borderStyles,
      zoomPast,
      zoomStartIdx,
      zoomEndIdx,
      lineData,
      areaData,
      zoomData,
      lineOptions: createOptions('라인의 마지막 구간'),
      areaOptions: createOptions('영역 차트의 마지막 구간'),
      selectedOptions: createOptions('지정한 시각의 구간', { x: labels[3] }),
      zoomOptions: createOptions('과거 구간 확대', { zoom: { toolbar: { show: true } } }),
    };
  },
};
</script>
