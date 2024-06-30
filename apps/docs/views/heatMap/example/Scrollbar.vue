<template>
  <div class="case">
    <ev-chart
      v-model:selectedLabel="selectedLabel"
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="option">
        <span>scrollbar 사용</span>
        <ev-toggle v-model="useScrollbar" />
      </div>
      <div class="option">
        <span>x축 range 설정</span>
        <ev-toggle v-model="useRangeX" />
      </div>
      <div class="option">
        <span>min</span>
        <ev-input-number
          v-model="xMin"
          :step="xInterval"
          :min="minDate"
          :max="xMax - xInterval"
        />
        <span>max</span>
        <ev-input-number
          v-model="xMax"
          :step="xInterval"
          :min="xMin + xInterval"
          :max="maxDate"
        />
      </div>
      <div class="option">
        <span>y축 range 설정</span>
        <ev-toggle v-model="useRangeY" />
      </div>
      <div class="option">
        <span>min</span>
        <ev-input-number
          v-model="yMin"
          :step="1"
          :min="0"
          :max="yMax - 1"
        />
        <span>max</span>
        <ev-input-number
          v-model="yMax"
          :step="1"
          :min="yMin + 1"
          :max="LABEL_Y_COUNT - 1"
        />
      </div>
      <label class="badge yellow"> v-model:selectedLabel</label>
      <span>{{ selectedLabel }}</span>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, onMounted, ref, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartData = reactive({
      series: {
        series1: {
          name: 'series#1',
        },
      },
      labels: {
        x: [],
        y: [],
      },
      data: {
        series1: [],
      },
    });

    const useScrollbar = ref(true);

    const LABEL_X_COUNT = 10;
    const LABEL_Y_COUNT = 24;
    const xInterval = 86400000;
    const maxDate = +dayjs();
    const minDate = +dayjs(maxDate).subtract(LABEL_X_COUNT - 1, 'd');
    const xMin = ref(minDate);
    const xMax = ref(maxDate);
    const yMin = ref(16);
    const yMax = ref(21);

    const useRangeX = ref(true);
    const useRangeY = ref(true);
    const xRange = computed(() => (useRangeX.value ? [xMin.value, xMax.value] : null));
    const yRange = computed(() => (useRangeY.value ? [yMin.value, yMax.value] : null));

    const chartOptions = reactive({
      type: 'heatMap',
      width: '100%',
      height: '300px',
      title: {
        text: 'Chart Title',
        show: true,
      },
      indicator: {
        use: true,
      },
      axesX: [{
        type: 'time',
        showGrid: false,
        categoryMode: true,
        range: xRange,
        scrollbar: {
          use: useScrollbar,
          showButton: true,
          background: '#E0E1DD',
          thumbStyle: {
            background: '#415A77',
            radius: 2,
          },
        },
        timeFormat: 'MMM.DD',
        interval: 'day',
      }],
      axesY: [{
        type: 'step',
        showGrid: false,
        range: yRange,
        scrollbar: {
          use: useScrollbar,
          showButton: false,
          background: '#E0E1DD',
          thumbStyle: {
            background: '#415A77',
            radius: 2,
          },
        },
      }],
      heatMapColor: {
        colorsByRange: [
          { color: '#D9ED92', label: '-30 ℃' },
          { color: '#B5E48C', label: '-15 ℃' },
          { color: '#99D98C', label: '0 ℃' },
          { color: '#76C893', label: '15 ℃' },
          { color: '#52B69A', label: '30 ℃' },
        ],
        stroke: {
          show: true,
          lineWidth: 2,
          radius: 2,
          color: '#FFFFFF',
        },
      },
      tooltip: {
        use: true,
      },
      selectLabel: {
        use: true,
        useClick: true,
        limit: 2,
        useDeselectOverflow: true,
        useSeriesOpacity: true,
        useLabelOpacity: true,
        useBothAxis: true,
      },
    });

    const createChartLegend = () => {
      const labelX = chartData.labels.x;
      for (let i = 0; i < LABEL_X_COUNT; i++) {
        labelX.push(+dayjs(maxDate).subtract(LABEL_X_COUNT - i - 1, 'd'));
      }

      xMin.value = labelX[0];
      xMax.value = labelX[3];

      const labelY = chartData.labels.y;
      for (let i = 0; i < LABEL_Y_COUNT; i++) {
        let hour = i.toString();
        if (i < 10) {
          hour = `0${i}`;
        }
        labelY.push(`${hour}:00`);
      }
    };

    const createChartData = () => {
      const labelX = chartData.labels.x;
      const labelY = chartData.labels.y;
      for (let ix = 0; ix < labelX.length; ix++) {
        for (let iy = 0; iy < labelY.length; iy++) {
          const randomCount = Math.floor(Math.random() * 5) + 1;
          chartData.data.series1.push({
            x: labelX[ix],
            y: labelY[iy],
            value: randomCount,
          });
        }
      }
    };

    const selectedLabel = ref({
      dataIndex: [],
    });

    onMounted(() => {
      nextTick();
      createChartLegend();
      createChartData();
    });

    return {
      useScrollbar,
      useRangeX,
      useRangeY,
      xInterval,
      minDate,
      maxDate,
      xMin,
      xMax,
      yMin,
      yMax,
      chartData,
      chartOptions,
      selectedLabel,
      LABEL_Y_COUNT,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  position: relative;

  .option {
    display: flex;
    gap: 10px;
    height: 30px;
    line-height: 20px;
    margin: 10px 0;
  }

  .ev-input-number + span {
    line-height: 35px;
  }

  .ev-button {
    height: 20px;
    line-height: 20px !important;
  }
}
</style>
