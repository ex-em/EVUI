<template>
  <div class="case">
    <ev-chart-group>
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
      <ev-chart-brush/>
    </ev-chart-group>
    <div class="description">
      <div
        v-for="(option, idx) in titleOptions"
        :key="idx"
        class="section"
      >
        <h3 v-if="idx===0" class="section-title"> X Axis </h3>
        <h3 v-else class="section-title"> Y Axis </h3>

        <div class="section-body">
          <div class="section-item">
            <label>use</label>
            <ev-toggle v-model="option.use"/>
          </div>
          <div class="section-item">
            <label>text</label>
            <ev-text-field v-model="option.text"/>
          </div>
          <div class="section-item">
            <label>fontWeight</label>
            <ev-input-number
              v-model="option.fontWeight"
              :step="100"
              :min="100"
              :max="900"
            />
          </div>
          <div class="section-item">
            <label>fontSize</label>
            <ev-input-number
              v-model="option.fontSize"
              :step="1"
              :min="1"
              :max="30"
            />
          </div>
          <div class="section-item">
            <label>fontFamily</label>
            <ev-text-field v-model="option.fontFamily"/>
          </div>
          <div class="section-item">
            <label>textAlign</label>
            <ev-select
              v-model="option.textAlign"
              :items="[{
                name: 'right',
                value: 'right',
              }, {
                name: 'center',
                value: 'center',
              }, {
                name: 'left',
                value: 'left',
              }]"
            />
          </div>
          <div class="section-item">
            <label>fontStyle</label>
            <ev-select
              v-model="option.fontStyle"
              :items="[{
                name: 'normal',
                value: 'normal',
              }, {
                name: 'italic',
                value: 'italic',
              }]"
            />
          </div>
          <div class="section-item">
            <label>color</label>
            <ev-text-field v-model="option.color"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const xAxisTitle = reactive({
      use: true,
      text: '1 Week',
      fontWeight: 400,
      fontSize: 12,
      fontFamily: 'Roboto',
      textAlign: 'right',
      fontStyle: 'normal',
      color: '#808080',
    });

    const yAxisTitle = reactive({
      use: true,
      text: 'Amount',
      fontWeight: 400,
      fontSize: 12,
      fontFamily: 'Roboto',
      textAlign: 'right',
      fontStyle: 'normal',
      color: '#808080',
    });

    const titleOptions = ref([xAxisTitle, yAxisTitle]);

    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
      },
      labels: [
        dayjs(time),
        dayjs(time).add(1, 'day'),
        dayjs(time).add(2, 'day'),
        dayjs(time).add(3, 'day'),
        dayjs(time).add(4, 'day'),
        dayjs(time).add(5, 'day'),
        dayjs(time).add(6, 'day'),
      ],
      data: {
        series1: [10, 20, 21, 57, 12, 86, 44],
      },
    });

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
        timeFormat: 'MM/DD',
        interval: 'day',
        title: xAxisTitle,
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
        title: yAxisTitle,
      }],
    });

    return {
      chartData,
      chartOptions,
      titleOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.section {
  width: 100%;

  &-title {
    padding: 10px;
    background-color: rgba(#FADE4C, 0.6);
  }

  &-body {
    display: flex;
    padding: 0 0 10px 10px;
    flex-direction: row;
    flex-wrap: wrap;

    .section-item {
      display: flex;
      width: 50%;
      flex-direction: row;
      margin-top: 10px;

      label {
        width: 100px;
        line-height: 35px;
        margin-right: 10px;
        font-weight: 700;
      }

      .ev-toggle {
        margin-top: 7px;
      }

      .ev-text-field, .ev-input-number, .ev-select {
        width: auto;
      }
    }
  }
}
</style>
