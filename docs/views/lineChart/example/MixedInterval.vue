<template>
  <div class="mixed-interval">
    <div class="controls">
      <label class="control">
        <ev-toggle v-model="isFiveFirst" />
        <span>5초 시리즈를 먼저(시리즈 순서·스택 base 반전)</span>
      </label>
      <label class="control">
        <ev-toggle v-model="isValueAxisLabeled" />
        <span>값 기반 축(time·linear)에도 1초 labels 전달</span>
      </label>
      <label class="control">
        <ev-toggle v-model="isSyncHover" />
        <span>축별 차트 그룹 indicator 공유(syncHover)</span>
      </label>
    </div>

    <section
      v-for="axisCase in axisCases"
      :key="axisCase.key"
      class="axis-case"
    >
      <h4 class="axis-title">{{ axisCase.title }}</h4>
      <p class="axis-desc">{{ axisCase.desc }}</p>
      <ev-chart-group :options="groupOptions">
        <div class="chart-grid">
          <div
            v-for="kind in CHART_KINDS"
            :key="kind.key"
            class="chart-cell"
          >
            <p class="chart-title">{{ kind.title }}</p>
            <div class="chart-area">
              <ev-chart
                :data="axisCase.charts[kind.key].data"
                :options="axisCase.charts[kind.key].options"
              />
            </div>
          </div>
        </div>
      </ev-chart-group>
    </section>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';

// 2026-01-01 09:00:00(로컬)부터 60초. 렌더가 매번 같도록 고정 시각·결정적 값.
const BASE_TIME = new Date(2026, 0, 1, 9, 0, 0).getTime();
const DURATION_SEC = 60;
const SEC_1 = Array.from({ length: DURATION_SEC }, (_, i) => i);
const SEC_5 = SEC_1.filter((sec) => sec % 5 === 0);

const valueOf1s = (sec) => Math.round(40 + 15 * Math.sin(sec / 6) + 5 * Math.sin(sec * 1.7));
const valueOf5s = (sec) => Math.round(70 + 20 * Math.cos(sec / 10));

const toMs = (sec) => BASE_TIME + sec * 1000;
const toClock = (sec) => dayjs(toMs(sec)).format('HH:mm:ss');

const SERIES_OPT = {
  s1: { name: '1초 (60점)', color: '#2B99F0' },
  s5: { name: '5초 (12점)', color: '#F0782B' },
};

const CHART_KINDS = [
  { key: 'line', title: 'line', type: 'line' },
  { key: 'bar', title: 'bar', type: 'bar' },
  { key: 'barTime', title: 'bar (series.timeMode)', type: 'bar', timeMode: true },
  { key: 'stackLine', title: 'stack line', type: 'line', stack: true },
  { key: 'stackBar', title: 'stack bar', type: 'bar', stack: true },
  { key: 'stackBarTime', title: 'stack bar (series.timeMode)', type: 'bar', timeMode: true, stack: true },
];

// toX: 초 → 그 축의 x 값. labeled: labels 를 항상 넘기는 축(범주형)인지.
const AXIS_DEFS = [
  {
    key: 'time',
    title: "axesX type: 'time' (값 기반 TimeScale)",
    desc: '시리즈별 { x: epoch ms, y } 를 넘긴다. 이번 작업(A안)의 대상 형태다.',
    axisX: { type: 'time', timeFormat: 'HH:mm:ss', interval: { time: 10, unit: 'second' } },
    toX: toMs,
    labeled: false,
  },
  {
    key: 'timeCategory',
    title: "axesX type: 'time' + categoryMode",
    desc: 'labels(1초 60개, epoch ms) 인덱스로 배치한다. 시리즈 데이터는 { x: epoch ms, y }.',
    axisX: { type: 'time', categoryMode: true, timeFormat: 'HH:mm:ss', interval: 'second' },
    toX: toMs,
    labeled: true,
  },
  {
    key: 'step',
    title: "axesX type: 'step'",
    desc: "labels('HH:mm:ss' 문자열 60개) 인덱스로 배치한다. x 도 같은 문자열.",
    axisX: { type: 'step' },
    toX: toClock,
    labeled: true,
  },
  {
    key: 'linear',
    title: "axesX type: 'linear'",
    desc: 'x 를 경과 초(0~59) 숫자로 넘긴다.',
    axisX: { type: 'linear' },
    toX: (sec) => sec,
    labeled: false,
  },
];

const buildData = (axisDef, kind, isFiveFirst, isValueAxisLabeled) => {
  const ids = isFiveFirst ? ['s5', 's1'] : ['s1', 's5'];
  const points = {
    s1: SEC_1.map((sec) => ({ x: axisDef.toX(sec), y: valueOf1s(sec) })),
    s5: SEC_5.map((sec) => ({ x: axisDef.toX(sec), y: valueOf5s(sec) })),
  };
  const hasLabels = axisDef.labeled || isValueAxisLabeled;

  return {
    series: Object.fromEntries(ids.map((id) => [
      id,
      { ...SERIES_OPT[id], timeMode: !!kind.timeMode, fill: !!kind.stack && kind.type === 'line' },
    ])),
    groups: kind.stack ? [ids] : [],
    labels: hasLabels ? SEC_1.map(axisDef.toX) : [],
    data: Object.fromEntries(ids.map((id) => [id, points[id]])),
  };
};

const buildOptions = (axisDef, kind) => ({
  type: kind.type,
  width: '100%',
  height: '100%',
  legend: { show: true, position: 'top' },
  tooltip: { use: true },
  axesX: [axisDef.axisX],
  axesY: [{ type: 'linear', startToZero: true, autoScaleRatio: 0.1, showGrid: true }],
});

export default {
  setup() {
    const isFiveFirst = ref(false);
    const isValueAxisLabeled = ref(false);
    const isSyncHover = ref(true);
    const groupOptions = computed(() => ({ syncHover: isSyncHover.value }));

    const axisCases = computed(() => AXIS_DEFS.map((axisDef) => ({
      key: axisDef.key,
      title: axisDef.title,
      desc: axisDef.desc,
      charts: Object.fromEntries(CHART_KINDS.map((kind) => [
        kind.key,
        {
          data: buildData(axisDef, kind, isFiveFirst.value, isValueAxisLabeled.value),
          options: buildOptions(axisDef, kind),
        },
      ])),
    })));

    return {
      CHART_KINDS,
      axisCases,
      isFiveFirst,
      isValueAxisLabeled,
      isSyncHover,
      groupOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.mixed-interval {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.axis-case {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.axis-title {
  margin: 0;
  font-size: 15px;
}

.axis-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.chart-cell {
  min-width: 0;
}

.chart-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
}

.chart-area {
  height: 240px;
}
</style>
