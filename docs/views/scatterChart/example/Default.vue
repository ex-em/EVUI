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
            :min="1"
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
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Series count
          </span>
          <ev-input-number
            v-model="seriesCount"
            class="component"
            :min="1"
            :max="25"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            X axis count
          </span>
          <ev-input-number
            v-model="xAxisDataCount"
            class="component"
            :min="5"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const pointSize = ref(3);
      const pointStyle = ref('circle');
      const seriesCount = ref(3);
      const xAxisDataCount = ref(10);

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
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        timeValue = +dayjs(timeValue).add(1, 'second');
        chartData.labels.shift();
        chartData.labels.push(timeValue);

        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.shift();
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      const initChartSeries = () => {
        chartData.series = {};
        chartData.labels.length = 0;
        chartData.data = {};

        let seriesName;
        let seriesId;
        for (let ix = 1; ix <= seriesCount.value; ix++) {
          seriesName = `series#${ix}`;
          seriesId = `series${ix}`;
          chartData.series[seriesId] = {
            name: seriesName,
            pointSize,
            pointStyle,
          };

          chartData.data[seriesId] = [];
        }
      };

      const initChartData = () => {
        const dataKeys = Object.keys(chartData.data);
        chartData.labels.length = 0;
        for (let ix = 0; ix < dataKeys.length; ix++) {
          chartData.data[dataKeys[ix]].length = 0;
        }

        let tmpTimeValue;
        for (let ix = 0; ix < xAxisDataCount.value; ix++) {
          tmpTimeValue = +dayjs(timeValue).subtract(ix, 'second');
          chartData.labels.unshift(tmpTimeValue);

          Object.values(chartData.data).forEach((seriesData) => {
            seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
          });
        }
      };

      onMounted(() => {
        initChartData();
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearInterval(liveInterval.value);
        }
      });

      watch(seriesCount, () => {
        initChartSeries();
        initChartData();
      });

      watch(xAxisDataCount, () => {
        initChartData();
      });

      onBeforeUnmount(() => {
        clearInterval(liveInterval.value);
      });

      return {
        pointSize,
        pointStyle,
        pointStyleList,
        chartData,
        chartOptions,
        isLive,
        seriesCount,
        xAxisDataCount,
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
