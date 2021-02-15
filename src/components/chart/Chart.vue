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
  import { useAPI, useModel, useWrapper } from './uses';

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
    emits: {
      click: null,
      'dbl-click': null,
    },
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

      const {
        forceUpdate,
        selectItemByLabel,
      } = useAPI(
        isInit,
        evChart,
      );

      onMounted(() => {
        evChart.value = new EvChart(
          wrapper.value,
          normalizedData,
          normalizedOptions,
          eventListeners,
        );

        const timer = setTimeout(() => {
          if (evChart.value) {
            evChart.value.init();
            isInit.value = true;
          }
          clearTimeout(timer);
        }, 1);
      });

      onBeforeUnmount(() => {
        evChart.value.destroy();
      });

      const onResize = () => {
        if (isInit.value) {
          evChart.value.resize();
        }
      };

      return {
        wrapper,
        wrapperStyle,
        onResize,
        forceUpdate,
        selectItemByLabel,
      };
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
