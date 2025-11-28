<template>
  <div class="case">
    <ev-chart :data="chartData" :options="chartOptions" />

    <div class="description">
      <div class="section">
        <div class="section-body section-body--col">
          <div class="section-item">
            <span class="section-title">Chart Type</span>
            <ev-select v-model="chartType" :items="chartTypeList" @change="onChangeChartType" />
            <span class="section-title">Interpolation</span>
            <ev-select
              v-model="interpolation"
              :items="interpolationList"
              @change="onChangeInterpolation"
            />
          </div>
        </div>

        <div
          v-for="series in chartSeries?.filter((s) => chartData.series[s.key]?.show)?.reverse()"
          :key="series.key"
          class="section-body"
        >
          <h3 :class="`section-title--${series.key}`">Chart Data - {{ series.key }}</h3>
          <div class="section-item">
            <template v-for="(data, jx) in series.data" :key="`${series.key}-${jx}`">
              <div class="column">
                <label>{{ new Date(chartData.labels[jx]).getDate() }}</label>
                <ev-input-number
                  v-model="data.value"
                  :disabled="data.isNull"
                  :step="1"
                  @change="changeValue"
                />
                <p>Null</p>
                <ev-toggle v-model="data.isNull" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import EvInputNumber from '../../../../src/components/inputNumber/InputNumber';

export default {
  components: { EvInputNumber },
  setup() {
    const chartSeries = ref([
      {
        key: 'series1',
        data: [
          { value: 17, isNull: true },
          { value: 20, isNull: false },
          { value: 5, isNull: false },
          { value: 30, isNull: true },
          { value: 10, isNull: false },
          { value: 18, isNull: false },
          { value: 10, isNull: true },
        ],
      },
      {
        key: 'series2',
        data: [
          { value: 4, isNull: true },
          { value: 20, isNull: false },
          { value: 10, isNull: false },
          { value: 5, isNull: true },
          { value: 10, isNull: false },
          { value: 15, isNull: false },
          { value: 10, isNull: true },
        ],
      },
      {
        key: 'series3',
        data: [
          { value: 4, isNull: true },
          { value: 20, isNull: false },
          { value: 10, isNull: false },
          { value: 5, isNull: true },
          { value: 10, isNull: false },
          { value: 15, isNull: false },
          { value: 10, isNull: true },
        ],
      },
    ]);

    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const interpolation = ref('linear');
    const interpolationList = [
      { name: 'None', value: 'none' },
      { name: 'Linear', value: 'linear' },
      { name: 'Zero', value: 'zero' },
    ];

    const chartData = reactive({
      series: {
        series1: { name: 'series#1', interpolation: 'linear', fill: true, show: true },
        series2: { name: 'series#2', interpolation: 'linear', fill: true, show: true },
        series3: { name: 'series#3', interpolation: 'linear', fill: true, show: true },
      },
      labels: Array.from({ length: 7 }, (_, i) => dayjs(time).add(i, 'day')),
      data: { series1: [], series2: [], series3: [] },
      groups: [['series1', 'series2', 'series3']],
    });

    const chartType = ref('stackArea');
    const chartTypeList = [
      { name: 'Line', value: 'line' },
      { name: 'Stack Line', value: 'stackLine' },
      { name: 'Area', value: 'area' },
      { name: 'Stack Area', value: 'stackArea' },
    ];

    const changeValue = () => {
      Object.keys(chartData.data).forEach((key) => {
        const series = chartSeries.value.find((s) => s.key === key);
        chartData.data[key] = series.data.map((item) => (item.isNull ? null : item.value));
      });
    };

    watch([chartSeries, chartType], changeValue, { deep: true });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '300px',
      title: { text: 'Chart Title', show: true },
      legend: { show: true },
      axesX: [{ type: 'time', timeFormat: 'D', interval: 'day' }],
      axesY: [{ type: 'linear', showGrid: true, startToZero: true, interval: 10 }],
    });

    const chartTypeConfig = {
      line: {
        series: {
          series1: { show: true, fill: false },
          series2: { show: false, fill: false },
          series3: { show: false, fill: false },
        },
        groups: [],
      },
      stackLine: {
        series: {
          series1: { show: true, fill: false },
          series2: { show: true, fill: false },
          series3: { show: true, fill: false },
        },
        groups: [['series1', 'series2', 'series3']],
      },
      area: {
        series: {
          series1: { show: true, fill: true },
          series2: { show: false, fill: false },
          series3: { show: false, fill: false },
        },
        groups: [],
      },
      stackArea: {
        series: {
          series1: { show: true, fill: true },
          series2: { show: true, fill: true },
          series3: { show: true, fill: true },
        },
        groups: [['series1', 'series2', 'series3']],
      },
    };

    const onChangeChartType = () => {
      const config = chartTypeConfig[chartType.value];
      if (!config) return;

      Object.entries(config.series).forEach(([key, settings]) => {
        Object.assign(chartData.series[key], settings);
      });
      chartData.groups = config.groups;
    };

    const onChangeInterpolation = () => {
      Object.values(chartData.series).forEach((series) => {
        series.interpolation = interpolation.value;
      });
    };

    return {
      chartData,
      chartOptions,
      chartType,
      chartTypeList,
      interpolation,
      interpolationList,
      chartSeries,
      changeValue,
      onChangeChartType,
      onChangeInterpolation,
    };
  },
};
</script>

<style lang="scss" scoped>
.section {
  width: 100%;

  &-title {
    padding: 10px;

    &--series1 {
      background-color: #2b99f0;
    }
    &--series2 {
      background-color: #8ac449;
    }
    &--series3 {
      background-color: rgb(0, 196, 197);
    }
  }

  &-body {
    display: flex;
    padding: 0 0 10px 10px;
    flex-direction: row;
    flex-wrap: wrap;

    .section-item {
      display: flex;
      width: 100%;
      margin-top: 10px;

      .ev-text-field,
      .ev-input-number,
      .ev-select {
        width: auto;
      }
    }
  }
}
</style>
