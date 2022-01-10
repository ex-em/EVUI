<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
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
    </div>
  </div>
</template>

<script>
  import { ref, reactive } from 'vue';

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
        },
        data: {
          series1: [
            [134, 51], [67, 59], [19, 49], [15, 63], [55, 53],
            [161, 51], [167, 59], [159, 49], [157, 63], [155, 53],
            [170, 59], [159, 47], [166, 69], [176, 66], [160, 75],
            [172, 55], [170, 54], [172, 62], [153, 42], [160, 50],
            [147, 49], [168, 49], [175, 73], [157, 47], [167, 68],
            [159, 50], [175, 82], [166, 57], [176, 87], [170, 72],
          ],
          series2: [
            [9, 51], [72, 59], [0, 49], [57, 63], [15, 53],
            [174, 65], [175, 71], [200, 80], [186, 72], [187, 78],
            [181, 74], [184, 86], [184, 78], [175, 62], [184, 81],
            [180, 76], [177, 83], [192, 90], [176, 74], [174, 71],
            [184, 79], [192, 93], [171, 70], [173, 72], [176, 85],
            [176, 78], [180, 77], [172, 66], [176, 86], [173, 81],
          ],
        },
      });

      const chartOptions = {
        type: 'scatter',
        width: '100%',
        height: '100%',
        padding: { top: 20, right: 2, bottom: 4, left: 2 },
        axesX: [{
          type: 'linear',
          showAxis: true,
          startToZero: true,
          autoScaleRatio: null,
          showGrid: true,
          axisLineColor: '#C9CFDC',
          gridLineColor: '#C9CFDC',
          interval: null,
          labelStyle: {
            show: true,
            fontSize: 12,
            color: '#25262E',
            fontFamily: 'Roboto',
            fitWidth: false,
            fitDir: 'right',
          },
          plotLines: [],
          plotBands: [],
          formatter: null,
        }],
        axesY: [{
          type: 'linear',
          showAxis: true,
          startToZero: false,
          autoScaleRatio: null,
          showGrid: true,
          axisLineColor: '#C9CFDC',
          gridLineColor: '#C9CFDC',
          interval: null,
          labelStyle: {
            show: true,
            fontSize: 12,
            color: '#25262E',
            fontFamily: 'Roboto',
            fitWidth: false,
            fitDir: 'right',
          },
          plotLines: [],
          plotBands: [],
          formatter: null,
        }],
        title: {
          text: '',
          show: false,
        },
        legend: {
          show: false,
          position: 'right',
          color: '#353740',
          inactive: '#aaa',
          width: 140,
          height: 24,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        indicator: {
          use: true,
          color: '#EE7F44',
        },
        tooltip: {
          use: true,
          backgroundColor: '#4C4C4C',
          borderColor: '#666666',
          useShadow: false,
          shadowOpacity: 0.25,
          throttledMove: false,
          debouncedHide: false,
          sortByValue: true,
          useScrollbar: false,
          textOverflow: 'wrap',
          showAllValueInRange: false,
          formatter: null,
        },
        dragSelection: {
          use: false,
          keepDisplay: true,
          fillColor: '#38ACEC',
          opacity: 0.65,
        },
      };

      return {
        pointSize,
        pointStyle,
        pointStyleList,
        chartData,
        chartOptions,
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
