<template>
  <div class="case">
    <ev-chart
      v-model:selectedItem="defaultSelectItem"
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
    />
    <div class="description">
      <div class="row">
        <div class="row-item">
          <label class="item-title"> showTextTip </label>
          <ev-toggle v-model="showTextTip"/>
        </div>
        <div class="row-item">
          <label class="item-title"> showTip </label>
          <ev-toggle v-model="showTip"/>
        </div>
        <div class="row-item">
          <label class="item-title"> showIndicator </label>
          <ev-toggle v-model="showIndicator"/>
        </div>
        <div class="row-item">
          <label class="item-title"> useSeriesOpacity </label>
          <ev-toggle v-model="useSeriesOpacity"/>
        </div>
      </div>
      <div class="row">
        <div class="badge yellow"> 기본 선택값 v-model </div>
        {{ defaultSelectItem }}
      </div>
      <div class="row">
        <div class="badge yellow"> 클릭된 Item 정보 </div>
        {{ clickedInfo }}
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive } from 'vue';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
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
            { x: 175, y: 71 }, { x: 200, y: 80 }, { x: 186, y: 72 },
            { x: 187, y: 78 }, { x: 181, y: 74 }, { x: 184, y: 86 },
            { x: 184, y: 78 }, { x: 175, y: 62 }, { x: 184, y: 81 },
            { x: 180, y: 76 }, { x: 177, y: 83 }, { x: 192, y: 90 },
            { x: 176, y: 74 }, { x: 174, y: 71 }, { x: 184, y: 79 },
            { x: 192, y: 93 }, { x: 171, y: 70 }, { x: 173, y: 72 },
            { x: 176, y: 85 }, { x: 176, y: 78 }, { x: 180, y: 77 },
            { x: 172, y: 66 }, { x: 176, y: 86 }, { x: 173, y: 81 },
          ],
        },
      });

      const showTextTip = ref(false);
      const showTip = ref(false);
      const showIndicator = ref(false);
      const useSeriesOpacity = ref(false);
      const fixedPosTop = ref(false);

      const chartOptions = reactive({
        type: 'scatter',
        axesX: [{
          type: 'linear',
        }],
        axesY: [{
          type: 'linear',
        }],
        tooltip: {
          use: true,
          formatter: ({ x, y }) => `${x}, ${y}`,
        },
        selectItem: {
          use: true,
          showTip,
          showTextTip,
          fixedPosTop,
          showIndicator,
          useSeriesOpacity,
        },
      });

      const defaultSelectItem = ref({
        seriesID: 'series1',
        dataIndex: 1,
      });

      const clickedInfo = ref("''");
      const onClick = (target) => {
        clickedInfo.value = target;
      };

      return {
        chartData,
        chartOptions,
        defaultSelectItem,
        showTip,
        fixedPosTop,
        showTextTip,
        showIndicator,
        useSeriesOpacity,
        clickedInfo,
        onClick,
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
    margin-bottom: 15px;
    justify-content: space-between;

    .row-item {
      flex: 1;
      display: flex;
      align-items: center;

      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
      }
    }
  }
</style>
