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
            doughnutHoleSize
          </span>
          <ev-input-number
            v-model="doughnutHoleSize"
            :step="0.1"
            :precision="1"
            :min="0"
            :max="0.8"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            fontSize
          </span>
          <ev-input-number
              v-model="fontSize"
              :step="1"
              :precision="0"
              :min="1"
              :max="30"
          />
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

      const formatter = ({ value, percentage }) => `${(+percentage).toFixed(0)}% (${value})`;

      const chartData = reactive({
        series: {
          series1: { name: 'series#1', showValue: { use: true, fontSize, formatter } },
          series2: { name: 'series#2', showValue: { use: true, fontSize, formatter } },
          series3: { name: 'series#3', showValue: { use: true, fontSize, formatter } },
        },
        data: {
          series1: [1],
          series2: [4],
          series3: [9],
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
        tooltip: {
          use: true,
          formatter,
        },
      });

      return {
        chartData,
        chartOptions,
        doughnutHoleSize,
        fontSize,
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
