<template>
  <div class="case">
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="option">
        <ev-toggle v-model="useScrollbar" />
        <span class="left">
          scrollbar 사용 여부
        </span>
      </div>
      <br>
      <div class="option">
        <ev-toggle v-model="useRange" />
        <span class="left">
          x축 range 설정
        </span>
      </div>
      <br>
      <div class="option">
        <span>min</span>
        <ev-input-number
            v-model="min"
            :step="1"
            :min="0"
            :max="max - 1"
        />
      </div>
      <br>
      <div class="option">
        <span>max</span>
        <ev-input-number
            v-model="max"
            :step="1"
            :min="min + 1"
            :max="9"
        />
      </div>
      <br>
      <br>
      <label class="badge yellow"> v-model:selectedLabel</label>
      <span>{{ defaultSelectLabel }}</span>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed } from 'vue';

export default {
  setup() {
    const chartData = {
      series: {
        series1: { name: 'series#1', showValue: { use: true } },
        series2: { name: 'series#2', showValue: { use: true } },
        series3: { name: 'series#3', showValue: { use: true } },
      },
      groups: [
        ['series1', 'series2', 'series3'],
      ],
      labels: [
        '03-01', '03-02', '03-03', '03-04', '03-05',
        '03-06', '03-07', '03-08', '03-09', '03-10',
        '03-11', '03-12', '03-13', '03-14', '03-15',
      ],
      data: {
        series1: [],
        series2: [],
        series3: [],
        series4: [],
      },
    };

    const useScrollbar = ref(true);
    const useRange = ref(true);
    const min = ref(0);
    const max = ref(5);
    const range = computed(() => (useRange.value ? [min.value, max.value] : null));

    const chartOptions = reactive({
      type: 'bar',
      width: '100%',
      height: '100%',
      thickness: 1,
      title: {
        text: 'Title Test',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      horizontal: false,
      axesX: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
        range,
        scrollbar: {
          use: useScrollbar,
        },
      }],
      axesY: [{
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
      selectLabel: {
        use: true,
        limit: 1,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: true,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipStyle: {
          background: '#FF0000',
        },
      },
    });

    const defaultSelectLabel = ref({
      dataIndex: [],
    });

    const createChartData = () => {
      for (let i = 0; i < chartData.labels.length; i++) {
        chartData.data.series1.push(Math.floor(Math.random() * 149) + 1);
        chartData.data.series2.push(Math.floor(Math.random() * 149) + 1);
        chartData.data.series3.push(Math.floor(Math.random() * 149) + 1);
        chartData.data.series4.push(Math.floor(Math.random() * 149) + 1);
      }
    };

    onMounted(() => {
      createChartData();
    });

    return {
      chartData,
      chartOptions,
      defaultSelectLabel,
      useScrollbar,
      useRange,
      min,
      max,
    };
  },
};
</script>

<style scoped>
.description {
  position: relative;
}
.option {
  display: flex;
  gap: 5px;
}
</style>
