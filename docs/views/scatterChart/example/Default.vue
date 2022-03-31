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
            { x: 134, y: 51 }, { x: 67, y: 59 }, { x: 19, y: 49 },
            { x: 15, y: 63 }, { x: 55, y: 53 }, { x: 161, y: 51 },
            { x: 167, y: 59 }, { x: 159, y: 49 }, { x: 157, y: 63 },
            { x: 155, y: 53 }, { x: 170, y: 59 }, { x: 159, y: 47 },
            { x: 166, y: 69 }, { x: 176, y: 66 }, { x: 160, y: 75 },
            { x: 172, y: 55 }, { x: 170, y: 54 }, { x: 172, y: 62 },
            { x: 153, y: 42 }, { x: 160, y: 50 }, { x: 147, y: 49 },
            { x: 168, y: 49 }, { x: 175, y: 73 }, { x: 157, y: 47 },
            { x: 167, y: 68 }, { x: 159, y: 50 }, { x: 175, y: 82 },
            { x: 166, y: 57 }, { x: 176, y: 87 }, { x: 170, y: 72 },
          ],
          series2: [
            { x: 9, y: 51 }, { x: 72, y: 59 }, { x: 0, y: 49 },
            { x: 57, y: 63 }, { x: 15, y: 53 }, { x: 174, y: 65 },
            { x: 175, y: 71 }, { x: 200, y: 80, color: '#FF0000' }, { x: 186, y: 72 },
            { x: 187, y: 78 }, { x: 181, y: 74 }, { x: 184, y: 86 },
            { x: 184, y: 78 }, { x: 175, y: 62 }, { x: 184, y: 81 },
            { x: 180, y: 76 }, { x: 177, y: 83 }, { x: 192, y: 90, color: '#FF0000' },
            { x: 176, y: 74 }, { x: 174, y: 71 }, { x: 184, y: 79 },
            { x: 192, y: 93, color: '#FF0000' }, { x: 171, y: 70 }, { x: 173, y: 72 },
            { x: 176, y: 85 }, { x: 176, y: 78 }, { x: 180, y: 77 },
            { x: 172, y: 66 }, { x: 176, y: 86 }, { x: 173, y: 81 },
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
        tooltip: {
          use: false,
        },
        selectItem: {
          use: false,
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
