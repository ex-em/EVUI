<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <span class="description-label">
        데이터 자동 업데이트
      </span>
      <ev-toggle v-model="isLive"/>
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Point size
          </span>
          <ev-input-number
            v-model="pointSize"
            class="component"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            Point style
          </span>
          <ev-select
            v-model="pointStyle"
            :items="pointStyleList"
            class="component"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import moment from 'moment';
  import EvInputNumber from '../../../../src/components/inputNumber/InputNumber';

  export default {
    components: { EvInputNumber },
    setup() {
      const pointSize = ref(3);
      const pointStyle = ref('circle');

      const pointStyleList = [{
        name: 'Circle (Default)',
        value: 'circle',
      }, {
        name: 'Triangle',
        value: 'triangle',
      }, {
        name: 'Rect',
        value: 'rect',
      }, {
        name: 'RectRounded',
        value: 'rectRounded',
      }, {
        name: 'RectRot',
        value: 'rectRot',
      }, {
        name: 'Cross',
        value: 'cross',
      }, {
        name: 'CrossRot',
        value: 'crossRot',
      }, {
        name: 'Star',
        value: 'star',
      }, {
        name: 'Line',
        value: 'line',
      }, {
        name: 'Dash',
        value: 'dash',
      }];

      const chartData = reactive({
        series: {
          series1: { name: 'series#1', pointSize, pointStyle },
          series2: { name: 'series#2', pointSize, pointStyle },
          series3: { name: 'series#3', pointSize, pointStyle },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
        },
      });

      const chartOptions = {
        type: 'scatter',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        tooltip: {
          use: true,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
      };

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = moment().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        if (isLive.value) {
          chartData.labels.shift();
        }

        timeValue = +moment(timeValue).add(1, 'second');
        chartData.labels.push(+moment(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          if (isLive.value) {
            seriesData.shift();
          }

          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 10; ix++) {
          addRandomChartData();
        }
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearTimeout(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearTimeout(liveInterval.value);
      });

      return {
        pointSize,
        pointStyle,
        pointStyleList,
        chartData,
        chartOptions,
        isLive,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .description-label {
    vertical-align: top;
    margin-right: 3px;
  }

  .row {
    display: flex;
    margin-top: 15px;
    justify-content: space-between;
    .row-item {
      flex: 1;
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
      }
    }
  }
</style>
