<template>
  <div class="case">
    <ev-chart
        ref="evChartRef"
        v-model:selectedItem="defaultSelectItem"
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
    />
    <div class="description">
      <div class="option">
        <ev-toggle v-model="useSeriesOpacity" />
        <span>useSeriesOpacity</span>
      </div>
      <div class="option">
        <ev-toggle v-model="showBorder" />
        <span>showBorder</span>
      </div>
      <div>
        <div class="badge yellow">
          v-model:selectedItem
        </div>
        {{ defaultSelectItem }}
        <br>
        <br>
        <div class="badge yellow">
          클릭 이벤트 데이터
        </div>
        {{ clickedItem }}
      </div>
    </div>
    </div>
</template>

<script>
import { nextTick, reactive, ref, watch } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: true,
              decimalPoint: 1,
            },
          },
        },
        labels: {
          x: ['1', '2', '3', '4', '5'],
          y: ['Metric1', 'Metric2', 'Metric3'],
        },
        data: {
          series1: [
            { x: '1', y: 'Metric1', value: 22.5 },
            { x: '2', y: 'Metric1', value: 35.2 },
            { x: '3', y: 'Metric1', value: 42.1 },
            { x: '4', y: 'Metric1', value: 33.5 },
            { x: '5', y: 'Metric1', value: 24 },
            { x: '1', y: 'Metric2', value: 15.2 },
            { x: '2', y: 'Metric2', value: 18 },
            { x: '3', y: 'Metric2', value: 5.7 },
            { x: '4', y: 'Metric2', value: 3.1 },
            { x: '5', y: 'Metric2', value: 22.1 },
            { x: '1', y: 'Metric3', value: 52.5 },
            { x: '2', y: 'Metric3', value: 11.2 },
            { x: '3', y: 'Metric3', value: 27.1 },
            { x: '4', y: 'Metric3', value: 1.5 },
            { x: '5', y: 'Metric3', value: 8 },
          ],
        },
      });

      const useSeriesOpacity = ref(true);
      const showBorder = ref(false);

      const chartOptions = reactive({
        type: 'heatMap',
        width: '100%',
        height: '300px',
        title: {
          text: 'Chart Title',
          show: true,
        },
        axesX: [{
          type: 'step',
          showGrid: true,
        }],
        axesY: [{
          type: 'step',
          showGrid: true,
        }],
        itemHighlight: false,
        heatMapColor: {
          rangeCount: 3,
          min: '#FCEFB4',
          max: '#F9DC5C',
          stroke: {
            show: true,
            lineWidth: 1,
            color: '#000000',
          },
        },
        tooltip: {
          use: true,
        },
        selectItem: {
          use: true,
          useSeriesOpacity,
          showBorder,
          borderStyle: {
            color: '#C21339',
            lineWidth: 1,
            radius: 8,
          },
        },
      });

      const evChartRef = ref();
      const lastSelectItem = ref(null);
      const defaultSelectItem = ref(null);
      const clickedItem = ref();
      const onClick = (target) => {
        clickedItem.value = target;
        if (defaultSelectItem.value
            && defaultSelectItem.value?.dataIndex === lastSelectItem.value?.dataIndex) {
          defaultSelectItem.value = null;
          lastSelectItem.value = null;
        } else {
          lastSelectItem.value = { ...defaultSelectItem.value };
        }
      };

      watch(defaultSelectItem, async (val) => {
        if (!val) {
          await nextTick();
          evChartRef.value?.redraw();
        }
      });

      return {
        chartData,
        chartOptions,
        defaultSelectItem,
        clickedItem,
        useSeriesOpacity,
        showBorder,
        evChartRef,
        onClick,
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
