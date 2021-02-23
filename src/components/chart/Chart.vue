<template>
  <div
    ref="wrapper"
    v-resize="onResize"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>

<script>
  import { onMounted, onBeforeUnmount } from 'vue';
  import EvChart from './chart.core';
  import { useModel, useWrapper } from './uses';

  export default {
    name: 'EvChart',
    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
      data: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: [
      'click',
      'dbl-click',
    ],
    setup() {
      const {
        isInit,
        evChart,
        eventListeners,
        normalizedData,
        normalizedOptions,
      } = useModel();

      const {
        wrapper,
        wrapperStyle,
      } = useWrapper(
        normalizedOptions,
      );

      const createChart = () => {
        evChart.value = new EvChart(
          wrapper.value,
          normalizedData,
          normalizedOptions,
          eventListeners,
        );
      };

      const drawChart = () => {
        if (evChart.value) {
          evChart.value.init();
          isInit.value = true;
        }
      };

      onMounted(async () => {
        await createChart();
        await drawChart();
      });

      onBeforeUnmount(() => {
        evChart.value.destroy();
      });

      const redrawChart = () => {
        if (isInit.value) {
          evChart.value.update({
            updateSeries: false,
            updateSelTip: {
              update: false,
              keepDomain: false,
            },
          });
        }
      };

      let timer = null;
      const onResize = () => {
        if (isInit.value) {
          evChart.value.resize();

          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(() => {
            redrawChart();
          }, 300);
        }
      };

      return {
        evChart,
        wrapper,
        wrapperStyle,
        onResize,
      };
    },
    methods: {
      selectItemByLabel(label) {
        this.evChart.value.selectItemByLabel(label);
      },
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
