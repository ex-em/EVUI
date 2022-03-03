<template>
  <div class="case">
    <ev-chart
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
          클릭된 정보
        </div>
        {{ clickedInfo }}
        <br><br>
        <div class="badge yellow">
          더블 클릭된 정보
        </div>
        {{ dblClickedInfo }}
    </div>
  </div>
</div></template>

<script>
import { reactive, ref } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
        },
        data: {
          series1: [10],
          series2: [20],
          series3: [70],
        },
      });

      const chartOptions = {
        type: 'pie',
        width: '100%',
        height: '50%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        selectItem: {
          use: true,
        },
      };

      const clickedInfo = ref("''");
      const onClick = (target) => {
        clickedInfo.value = target;
      };

      const dblClickedInfo = ref("''");
      const onDblClick = (target) => {
        dblClickedInfo.value = target;
      };

      const defaultSelectItem = ref({
        seriesID: 'series1',
      });

      const toggleSelectData = () => {
        const seriesID = defaultSelectItem.value.seriesID;
        defaultSelectItem.value.seriesID = seriesID === 'series1' ? 'series2' : 'series1';
      };

      return {
        chartData,
        chartOptions,
        clickedInfo,
        dblClickedInfo,
        defaultSelectItem,
        onClick,
        onDblClick,
        toggleSelectData,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .case {
    height: 100%;
  }
</style>
