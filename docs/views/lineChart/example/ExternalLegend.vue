<template>
  <div class="case">
    <div class="controls">
      <span>범례 On/Off: </span>
      <ev-toggle v-model="legendShow" />
    </div>
    <ev-chart
      ref="chartRef"
      :key="legendShow"
      v-model:legend-data="legendItems"
      :data="chartData"
      :options="chartOptions"
    />
    <div v-if="legendShow && chartOptions.legend.external" class="external-legend">
      <div
        v-for="item in legendItems"
        :key="item.sId"
        class="legend-item"
        :data-inactive="!item.show"
        @click="onLegendClick(item.sId)"
        @mouseenter="onLegendEnter(item.sId)"
        @mouseleave="onLegendLeave"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: item.show ? item.color : '#aaa' }"
        />
        <span
          class="legend-name"
          :style="{ color: item.show ? '#353740' : '#aaa' }"
        >
          {{ item.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartRef = ref(null);
    const legendItems = ref([]);
    const legendShow = ref(true);
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const chartData = {
      series: {
        series1: { name: 'Series 1', fill: true, point: true },
        series2: { name: 'Series 2', fill: true, point: true },
        series3: { name: 'Series 3', fill: true, point: true },
      },
      groups: [['series1', 'series2', 'series3']],
      labels: Array(10)
        .fill(0)
        .map((_, index) => dayjs(time).add(index, 'day')),
      data: {
        series1: Array(10)
          .fill(0)
          .map(() => Math.floor(Math.random() * 100)),
        series2: Array(10)
          .fill(0)
          .map(() => Math.floor(Math.random() * 100)),
        series3: Array(10)
          .fill(0)
          .map(() => Math.floor(Math.random() * 100)),
      },
    };

    const chartOptions = computed(() => ({
      type: 'line',
      width: '100%',
      title: {
        text: 'External Legend',
        show: true,
      },
      legend: {
        show: legendShow,
        external: true,
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        },
      ],
    }));

    const onLegendClick = (sId) => {
      chartRef.value?.toggleSeries(sId);
    };

    const onLegendEnter = (sId) => {
      chartRef.value?.highlightSeries(sId);
    };

    const onLegendLeave = () => {
      chartRef.value?.unhighlightSeries();
    };

    return {
      chartRef,
      legendItems,
      legendShow,
      chartData,
      chartOptions,
      onLegendClick,
      onLegendEnter,
      onLegendLeave,
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 320px;
  overflow: hidden;
}

.controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
}

.ev-chart {
  flex: 1;
}

:deep(.ev-chart-container) {
  max-height: 100%;
}

.external-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  user-select: none;

  &:hover {
    background-color: #f5f5f5;
  }

  &[data-inactive='true'] {
    opacity: 0.6;
  }
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-name {
  font-size: 13px;
  font-family: Roboto, sans-serif;
}
</style>
