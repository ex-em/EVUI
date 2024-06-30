<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="section">
        <div class="section-body section-body--row">
          <h3 class="section-title">chart Type</h3>
          <div class="section-item">
            <ev-select
              v-model="chartType"
              :items="chartTypeList"
              @change="onChangeChartType"
            />
          </div>
        </div>

        <div
            v-if="chartData?.series?.series2?.show"
            class="section-body"
        >
          <h3 class="section-title--series2">chart Data - series 2</h3>
          <div class="section-item">
            <template
                v-for="(data, jx) in chartDataForExample2"
                :key="`series2-${jx}`"
            >
              <div class="column">
                <label>{{ new Date(chartData.labels[jx]).getDate() }}</label>
                <ev-input-number
                    v-model="data.value"
                    :disabled="data.isNull || data.isPassing"
                    :step="1"
                    @change="changeValue"
                />
                <p>Null</p>
                <ev-toggle v-model="data.isNull" />
                <p>Passing</p>
                <ev-toggle v-model="data.isPassing" />
              </div>
            </template>
          </div>
        </div>

        <div class="section-body">
          <h3 class="section-title--series1">chart Data - series 1</h3>
          <div class="section-item">
            <template
              v-for="(data, ix) in chartDataForExample1"
              :key="`series2-${ix}`"
            >
              <div class="column">
                <label>{{ new Date(chartData.labels[ix]).getDate() }}</label>
                <ev-input-number
                  v-model="data.value"
                  :disabled="data.isNull || data.isPassing"
                  :step="1"
                  @change="changeValue"
                />
                <p>Null</p>
                <ev-toggle v-model="data.isNull" />
                <p>Passing</p>
                <ev-toggle v-model="data.isPassing" />
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
      const chartDataForExample1 = ref([
        { value: 17, isNull: false, isPassing: false },
        { value: 20, isNull: false, isPassing: true },
        { value: 5, isNull: false, isPassing: false },
        { value: 30, isNull: false, isPassing: true },
        { value: 10, isNull: false, isPassing: false },
        { value: 18, isNull: false, isPassing: false },
        { value: 10, isNull: false, isPassing: false },
      ]);

      const chartDataForExample2 = ref([
        { value: 4, isNull: false, isPassing: false },
        { value: 20, isNull: false, isPassing: true },
        { value: 10, isNull: false, isPassing: true },
        { value: 5, isNull: false, isPassing: false },
        { value: 10, isNull: false, isPassing: false },
        { value: 15, isNull: false, isPassing: true },
        { value: 10, isNull: false, isPassing: false },
      ]);

      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const chartData = reactive({
        series: {
          series1: { name: 'series#1', passingValue: -1, fill: false },
          series2: { name: 'series#1', passingValue: -1, show: false, fill: false },
        },
        labels: [
          dayjs(time),
          dayjs(time).add(1, 'day'),
          dayjs(time).add(2, 'day'),
          dayjs(time).add(3, 'day'),
          dayjs(time).add(4, 'day'),
          dayjs(time).add(5, 'day'),
          dayjs(time).add(6, 'day'),
          dayjs(time).add(7, 'day'),
          dayjs(time).add(8, 'day'),
          dayjs(time).add(9, 'day'),
          dayjs(time).add(10, 'day'),
        ],
        data: {
          series1: [],
          series2: [],
        },
      });

      const chartType = ref('line');
      const chartTypeList = [{
        name: 'Line',
        value: 'line',
      }, {
        name: 'Stack Line',
        value: 'stackLine',
      }, {
        name: 'Area',
        value: 'area',
      }, {
        name: 'Stack Area',
        value: 'stackArea',
      }];

      const changeValue = () => {
        chartData.data.series1 = [];
        chartData.data.series2 = [];

        chartDataForExample1?.value?.forEach((item) => {
          let value = item.value;
          if (item.isNull) {
            value = null;
          } else if (item.isPassing) {
            value = -1;
          }

          chartData.data.series1.push(value);
        });

        chartDataForExample2?.value?.forEach((item) => {
          let value = item.value;
          if (item.isNull) {
            value = null;
          } else if (item.isPassing) {
            value = -1;
          }

          chartData.data.series2.push(value);
        });
      };

      watch([chartDataForExample1, chartDataForExample2, chartType], changeValue, { deep: true });

      const chartOptions = reactive({
        type: 'line',
        width: '100%',
        height: '300px',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: false,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'D',
          interval: 'day',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          interval: 10,
        }],
      });

      const onChangeChartType = () => {
        switch (chartType.value) {
          case 'line': {
            chartData.series.series1.show = true;
            chartData.series.series1.fill = false;
            chartData.series.series2.show = false;
            chartData.series.series2.fill = false;
            chartData.groups = [];
            break;
          }

          case 'stackLine': {
            chartData.series.series1.show = true;
            chartData.series.series1.fill = false;
            chartData.series.series2.show = true;
            chartData.series.series2.fill = false;
            chartData.groups = [['series1', 'series2']];
            break;
          }

          case 'area': {
            chartData.series.series1.show = true;
            chartData.series.series1.fill = true;
            chartData.series.series2.show = false;
            chartData.series.series2.fill = false;
            chartData.groups = [];
            break;
          }

          case 'stackArea': {
            chartData.series.series1.show = true;
            chartData.series.series1.fill = true;
            chartData.series.series2.show = true;
            chartData.series.series2.fill = true;
            chartData.groups = [['series1', 'series2']];
            break;
          }

          default: {
            break;
          }
        }
      };

      return {
        chartData,
        chartOptions,
        changeValue,
        chartType,
        chartTypeList,
        onChangeChartType,
        chartDataForExample1,
        chartDataForExample2,
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
        padding: 10px;
        background-color: #2B99F0;
      }

      &--series2 {
        padding: 10px;
        background-color: #8AC449;
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
        flex-direction: row;
        justify-content: stretch;
        margin-top: 10px;

        .ev-text-field, .ev-input-number, .ev-select {
          width: auto;
        }
      }
    }
  }
</style>
