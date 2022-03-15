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
            Hole 사이즈
          </span>
          <ev-input-number
            v-model="doughnutHoleSize"
            :step="0.1"
            :precision="1"
            :min="0"
            :max="0.8"
          />
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            폰트 크기
          </span>
          <ev-input-number
            v-model="fontSize"
            :step="1"
            :precision="0"
            :min="1"
            :max="30"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            폰트 컬러
          </span>
          <ev-text-field v-model="textColor"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';

  export default {
    setup() {
      const doughnutHoleSize = ref(0);
      const fontSize = ref(12);
      const textColor = ref('#000000');

      const chartData = reactive({
        series: {
          series1: { name: 'series#1', showValue: { use: true, fontSize, textColor } },
          series2: { name: 'series#2', showValue: { use: true, fontSize, textColor } },
          series3: { name: 'series#3', showValue: { use: true, fontSize, textColor } },
          series4: { name: 'series#4', showValue: { use: true, fontSize, textColor } },
          series5: { name: 'series#5', showValue: { use: true, fontSize, textColor } },
          series6: { name: 'series#6', showValue: { use: true, fontSize, textColor } },
          series7: { name: 'series#7', showValue: { use: true, fontSize, textColor } },
          series8: { name: 'series#8', showValue: { use: true, fontSize, textColor } },
          series9: { name: 'series#9', showValue: { use: true, fontSize, textColor } },
          series10: { name: 'series#10', showValue: { use: true, fontSize, textColor } },
        },
        data: {
          series1: [1],
          series2: [4],
          series3: [9],
          series4: [16],
          series5: [25],
          series6: [36],
          series7: [49],
          series8: [64],
          series9: [81],
          series10: [100],
        },
      });

      const chartOptions = reactive({
        type: 'pie',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        doughnutHoleSize,
      });

      return {
        chartData,
        chartOptions,
        doughnutHoleSize,
        fontSize,
        textColor,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .row {
    display: flex;
    margin-top: 15px;

    .row-item {
      display: flex;
      margin-right: 30px;

      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 50px;
      }

      .ev-text-field, .ev-input-number, .ev-select {
        width: auto;
      }
    }
  }
</style>
