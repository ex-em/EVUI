<template>
  <div class="case" @pointermove="perf.onPointerMove">
    <resizable-wrapper>
      <ev-chart
        :key="isShallowWatch ? 'shallow' : 'deep'"
        :data="boundData"
        :options="boundOptions"
        @mouse-move="perf.onChartMouseMove"
      />
    </resizable-wrapper>
  </div>
  <div class="description">
    <p class="hint">
      A 프로파일 stress: line {{ SERIES_COUNT }} 시리즈 단일 차트 (시리즈당
      {{ POINTS_PER_SERIES }} 포인트). 초당 1회 갱신. 규모는 스크립트 상단 상수 (SERIES_COUNT /
      POINTS_PER_SERIES)로 조절합니다.
    </p>
    <span class="toggle-label">데이터 자동 업데이트</span>
    <ev-toggle v-model="isLive" />
    <span class="toggle-label">Append(슬라이딩 윈도우) 모드 — 끄면 Full-replace</span>
    <ev-toggle v-model="isAppendMode" />
    <span class="toggle-label">
      shallowDataWatch (shallowRef + top-level 참조교체, deep watch off)
    </span>
    <ev-toggle v-model="isShallowWatch" />
  </div>
</template>

<script>
import { watch, ref, computed, onBeforeUnmount, reactive, shallowRef } from 'vue';
import dayjs from 'dayjs';
import { usePerfHarness } from '../../perfHarness';

// 측정 규모 조절용 상수 (Step 0a 선결 분류 ①: 시리즈당 포인트 수 vs 화면 가로 픽셀)
const SERIES_COUNT = 10000;
const POINTS_PER_SERIES = 50;

export default {
  setup() {
    const perf = usePerfHarness();
    let labelCounter = 0;
    const base = dayjs();

    const randomValue = () => Math.random() * 100;

    const buildSeries = () => {
      const series = {};
      for (let s = 0; s < SERIES_COUNT; s++) {
        series[`series${s}`] = { name: `series#${s}`, point: false };
      }
      return series;
    };

    const buildLabels = () => {
      const labels = [];
      for (let p = 0; p < POINTS_PER_SERIES; p++) {
        labels.push(base.add(labelCounter++, 'second'));
      }
      return labels;
    };

    const buildData = () => {
      const data = {};
      for (let s = 0; s < SERIES_COUNT; s++) {
        const arr = [];
        for (let p = 0; p < POINTS_PER_SERIES; p++) {
          arr.push(randomValue());
        }
        data[`series${s}`] = arr;
      }
      return data;
    };

    const buildSnapshot = () => ({
      series: buildSeries(),
      labels: buildLabels(),
      data: buildData(),
    });

    // deep 모드(기본): reactive 데이터 + in-place/sub-replace 갱신 → deep watch traverse 비용 발생.
    const chartData = reactive(buildSnapshot());
    // shallow 모드: 비반응성(shallowRef) 데이터 + top-level 참조 교체 → deep watch off(traverse 0).
    const shallowChartData = shallowRef(buildSnapshot());

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
      title: {
        text: `Perf Stress (single, ${SERIES_COUNT} series)`,
        show: true,
      },
      // 만 개 시리즈 범례 렌더가 차트 렌더 측정을 오염시키지 않도록 범례는 끔
      legend: {
        show: false,
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'mm:ss',
          interval: { time: 1, unit: 'second' },
          showGrid: false,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      // 시리즈가 많으면 canvas tooltip은 전 시리즈를 한 캔버스에 그려 높이가 브라우저 한계를
      // 넘고 화면 밖으로 밀려 안 보인다. html formatter를 쓰면 virtualScroll(use:'auto',
      // 기본 threshold 50)이 자동 활성화되어 보이는 행만 DOM에 부착한다. 각 시리즈 행에
      // data-evui-tooltip-row 마커를 달아 가상 스크롤 컨테이너가 인식하도록 한다.
      tooltip: {
        formatter: {
          html: (seriesList) => {
            const header = dayjs(seriesList?.[0]?.data?.x).format('mm:ss');
            let html = '<div style="width: 220px">';
            html += `<div style="padding: 4px 8px; font-weight: 600">${header}</div>`;
            html += '<div>';
            seriesList.forEach((series) => {
              html += '<div data-evui-tooltip-row '
                + 'style="display: flex; align-items: center; gap: 6px; padding: 2px 8px">';
              html += '<span style="width: 8px; height: 8px; border-radius: 50%; '
                + `background-color: ${series.color}"></span>`;
              html += `<span style="flex: 1; white-space: nowrap">${series.name}</span>`;
              html += `<span>${series.data?.y?.toFixed(2)}</span>`;
              html += '</div>';
            });
            html += '</div></div>';
            return html;
          },
        },
      },
    });

    const isLive = ref(false);
    const isAppendMode = ref(true);
    const isShallowWatch = ref(false);
    const liveInterval = ref();

    // shallowDataWatch on 이면 shallowRef + shallowDataWatch:true 로 바꿔 차트를 remount(:key)한다.
    const boundData = computed(() => (isShallowWatch.value ? shallowChartData.value : chartData));
    const boundOptions = computed(() => ({
      ...chartOptions,
      shallowDataWatch: isShallowWatch.value,
    }));

    // 갱신 방식 토글 — append형(슬라이딩 윈도우) vs full-replace.
    // plan Q2 분류(append+fixed range vs full-replace+rescale) 측정용.
    const mutateChartData = () => {
      if (isShallowWatch.value) {
        // shallow 모드: 항상 새 top-level 참조 할당(in-place 변경은 deep off 라 미감지).
        shallowChartData.value = buildSnapshot();
      } else if (isAppendMode.value) {
        // append는 chartData 자신의 마지막 라벨에서 1초씩 이어붙인다. 공유 labelCounter를 쓰면
        // shallowChartData 초기화가 소비한 구간(base+50..99s)만큼 라벨이 건너뛰어 time축에서
        // 큰 gap(왼쪽 옛 데이터 / 오른쪽 새 데이터)으로 보인다.
        const { labels } = chartData;
        const nextLabel = labels[labels.length - 1].add(1, 'second');
        labels.shift();
        labels.push(nextLabel);
        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.shift();
          seriesData.push(randomValue());
        });
      } else {
        chartData.labels = buildLabels();
        chartData.data = buildData();
      }
    };

    // 갱신 1틱을 perf harness로 감싼다(drawChart = createDataSet+drawChart+commit 합산 근사).
    const updateChartData = () => perf.measureTick(mutateChartData);

    watch(isLive, (newValue) => {
      if (newValue) {
        updateChartData();
        liveInterval.value = setInterval(updateChartData, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      SERIES_COUNT,
      POINTS_PER_SERIES,
      boundData,
      boundOptions,
      isLive,
      isAppendMode,
      isShallowWatch,
      perf,
    };
  },
};
</script>

<style lang="scss" scoped>
.toggle-label {
  vertical-align: top;
  margin: 0 7px 0 14px;

  &:first-of-type {
    margin-left: 0;
  }
}

.hint {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  max-width: 640px;
}
</style>
