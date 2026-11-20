<template>
  <div class="case">
    <div class="description">
      <span class="toggle-label">partialData.use</span>
      <ev-toggle v-model="usePartial" />
    </div>
    <resizable-wrapper>
      <ev-chart :data="lineData" :options="lineOptions" />
    </resizable-wrapper>
    <resizable-wrapper>
      <ev-chart :data="areaData" :options="areaOptions" />
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
    const usePartial = ref(true);
    const base = dayjs().startOf('hour');
    const labels = Array.from({ length: 7 }, (_, i) => base.add(i * 10, 'minute').valueOf());

    const lineData = ref({
      series: { series1: { name: 'CPU 사용률' } },
      labels,
      data: { series1: [36, 53, 42, 64, 49, 58, 41] },
    });

    const areaData = ref({
      series: { series1: { name: '동시 사용자 수', fill: true } },
      labels,
      data: { series1: [120, 150, 132, 170, 160, 182, 95] },
    });

    // 줌은 data 를 잘라 넘긴다 — 과거 구간만 확대하면 잘린 끝이 원본의 마지막이 아니므로 영역이 사라져야 한다.
    const zoomData = ref({
      series: { series1: { name: '트랜잭션 수' } },
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

    const createOptions = (title, extra = {}) =>
      computed(() => ({
        type: 'line',
        width: '100%',
        height: '100%',
        title: { text: title, show: true },
        legend: { show: false },
        axesX: [{ type: 'time', timeFormat: 'HH:mm', interval: { time: 10, unit: 'minute' } }],
        axesY: [{ type: 'linear', showGrid: true, startToZero: true, autoScaleRatio: 0.1 }],
        partialData: { use: usePartial.value },
        ...extra,
      }));

    return {
      usePartial,
      zoomPast,
      zoomStartIdx,
      zoomEndIdx,
      lineData,
      areaData,
      zoomData,
      lineOptions: createOptions('Line'),
      areaOptions: createOptions('Area'),
      zoomOptions: createOptions('Zoom', { zoom: { toolbar: { show: true } } }),
    };
  },
};
</script>
