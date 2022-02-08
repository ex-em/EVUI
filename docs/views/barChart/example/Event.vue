<template>
  <div class="case">
    <ev-chart
      ref="chart"
      v-model:selectedItem="defaultSelectItem"
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
      @dbl-click="onDblClick"
    />
    <div class="description">
      <ev-button
        @click="toggleSelectData">
        select toggle 1 - 2
      </ev-button>
      <br><br>
      <div>
        <div class="badge yellow">
          기본 선택값 v-model
        </div>
        {{ defaultSelectItem }}
        <br><br>
        <div class="badge yellow">
          클릭된 라벨
        </div>
        {{ clickedLabel }}
        <br><br>
        <div class="badge yellow">
          더블 클릭된 라벨
        </div>
        {{ dblClickedLabel }}
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const chart = ref(null);

      const chartData = {
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
        },
        labels: ['value1', 'value2', 'value3', 'value4', 'value5'],
        data: {
          series1: [100, 150, 51, 150, 350],
          series2: [100, 150, 51, 150, 450],
        },
      };

      const chartOptions = {
        type: 'bar',
        thickness: 0.8,
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
        }],
        axesY: [{
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        }],
        selectItem: {
          use: true,
          showTextTip: true,
          tipBackground: '#FF00FF',
        },
        maxTip: {
          use: true,
          showTextTip: true,
          tipBackground: '#FF0000',
        },
      };

      const clickedLabel = ref("''");
      const onClick = (target) => {
        clickedLabel.value = target.label;
      };

      const dblClickedLabel = ref("''");
      const onDblClick = (target) => {
        dblClickedLabel.value = target.label;
      };

      const defaultSelectItem = ref({
        seriesID: 'series1',
        dataIndex: 1,
      });

      const toggleSelectData = () => {
        const idx = defaultSelectItem.value.dataIndex;
        defaultSelectItem.value.dataIndex = idx === 1 ? 2 : 1;
      };

      return {
        chart,
        chartData,
        chartOptions,
        clickedLabel,
        dblClickedLabel,
        defaultSelectItem,
        onClick,
        onDblClick,
        toggleSelectData,
      };
    },
  };
</script>

<style lang="scss">
</style>
