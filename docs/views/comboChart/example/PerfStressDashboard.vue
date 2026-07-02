<template>
  <div class="dashboard-case">
    <div class="dashboard-controls">
      <p class="hint">
        B-real 프로파일 stress: 같은 timer/window에 묶여 동시에 갱신되는
        {{ CHART_COUNT }}개 combo 차트 대시보드 (차트당 {{ SERIES_PER_CHART }} 시리즈 / 시리즈당
        {{ POINTS_PER_SERIES }} 포인트). 초당 1회, 모든 차트가 같은 tick에 갱신되어 heavy render
        job이 같은 짧은 window에 pile-up 됩니다. 규모는 스크립트 상단 상수(CHART_COUNT /
        SERIES_PER_CHART / POINTS_PER_SERIES)로 조절합니다.
      </p>
      <span class="toggle-label">데이터 자동 업데이트</span>
      <ev-toggle v-model="isLive" />
    </div>
    <div class="dashboard-grid">
      <div v-for="(chart, idx) in charts" :key="idx" class="dashboard-cell">
        <ev-chart :data="chart.data" :options="chart.options" />
      </div>
    </div>
  </div>
</template>

<script>
import { watch, ref, onBeforeUnmount, reactive } from 'vue';
import dayjs from 'dayjs';

// 측정 규모 조절용 상수 (Q3: scheduler window 내 heavy job pile-up 규모)
const CHART_COUNT = 8;
const SERIES_PER_CHART = 20;
const POINTS_PER_SERIES = 60;

export default {
  setup() {
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const randomValue = () => Math.floor(Math.random() * 100);

    const buildSeries = () => {
      const series = {};
      for (let s = 0; s < SERIES_PER_CHART; s++) {
        if (s === 0) {
          series[`s${s}`] = { name: `metric#${s}`, type: 'bar' };
        } else {
          series[`s${s}`] = { name: `metric#${s}`, type: 'line', combo: true, point: false };
        }
      }
      return series;
    };

    const buildChart = () => {
      const data = {};
      const labels = [];
      let seed = timeValue;
      for (let p = 0; p < POINTS_PER_SERIES; p++) {
        seed = dayjs(seed).add(1, 'second');
        labels.push(dayjs(seed));
      }
      for (let s = 0; s < SERIES_PER_CHART; s++) {
        const arr = [];
        for (let p = 0; p < POINTS_PER_SERIES; p++) {
          arr.push(randomValue());
        }
        data[`s${s}`] = arr;
      }

      return {
        data: {
          series: buildSeries(),
          labels,
          data,
        },
        options: {
          width: '100%',
          height: '100%',
          thickness: 0.8,
          title: {
            show: false,
          },
          legend: {
            show: false,
          },
          axesX: [
            {
              type: 'time',
              timeFormat: 'mm:ss',
              interval: 'second',
              categoryMode: true,
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
        },
      };
    };

    const charts = reactive([]);
    for (let c = 0; c < CHART_COUNT; c++) {
      charts.push(buildChart());
    }
    // buildChart가 T+1..T+POINTS_PER_SERIES 라벨을 미리 채우므로,
    // mutate가 그 다음 시점부터 이어가도록 timeValue를 사전 라벨 끝으로 옮긴다.
    timeValue = dayjs(timeValue).add(POINTS_PER_SERIES, 'second');

    const isLive = ref(false);
    const liveInterval = ref();

    // 모든 차트를 같은 tick에 슬라이딩 윈도우로 갱신 → heavy job pile-up 재현
    const mutateAllCharts = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      const nextLabel = dayjs(timeValue);
      charts.forEach((chart) => {
        chart.data.labels.shift();
        chart.data.labels.push(nextLabel);
        Object.values(chart.data.data).forEach((seriesData) => {
          seriesData.shift();
          seriesData.push(randomValue());
        });
      });
    };

    watch(isLive, (newValue) => {
      if (newValue) {
        mutateAllCharts();
        liveInterval.value = setInterval(mutateAllCharts, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      CHART_COUNT,
      SERIES_PER_CHART,
      POINTS_PER_SERIES,
      charts,
      isLive,
    };
  },
};
</script>

<style lang="scss" scoped>
.dashboard-controls {
  margin-bottom: 12px;
}

.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}

.hint {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  max-width: 720px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.dashboard-cell {
  height: 240px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
