<template>
  <div class="case">
    <p class="case-title">Default Chart</p>
    <ev-chart/>
    <div class="description">
      Default Chart's description
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const defaultChart = ref({
        data: {
          series: {
            series1: { name: 'series#1' },
          },
          labels: [
            'value1',
            'value2',
            'value3',
            'value4',
            'value5',
          ],
          data: {
            series1: [100, 150, 51, 150, 350],
          },
        },
        options: {
          type: 'bar',
          thickness: 0.8,
          width: '100%',
          title: {
            text: 'Default Bar Chart',
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
            type: 'linear',
            startToZero: true,
            autoScaleRatio: 0.1,
            showGrid: false,
          }],
        },
      });
      const ColumnChart = ref();
      const StackChart = ref();
      const HorizontalChart = ref();
      const TimeChart = ref();

      return {
        defaultChart,
        ColumnChart,
        StackChart,
        HorizontalChart,
        TimeChart,
      };
    },
  };
</script>

<style lang="scss">
  .clearable-example {
    .blank-mb {
      margin-bottom: 25px;
    }
  }
</style>
