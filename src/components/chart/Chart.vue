<template>
  <div
    ref="wrapper"
    v-resize="onResize"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>

<script>
  import { onMounted, onBeforeUnmount, nextTick } from 'vue';
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
      selectedLabel: {
        type: String,
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

      onMounted(() => {
        evChart.value = new EvChart(
          wrapper.value,
          normalizedData,
          normalizedOptions,
          eventListeners,
        );

        nextTick(() => {
          if (evChart.value) {
            evChart.value.init();
            isInit.value = true;
          }
        });
      });

      onBeforeUnmount(() => {
        evChart.value.destroy();
      });

      let timer = null;
      const onResize = () => {
        if (isInit.value) {
          evChart.value.resize();

          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(() => {
            if (isInit.value) {
              evChart.value.update({
                updateSeries: false,
                updateSelTip: {
                  update: false,
                  keepDomain: false,
                },
              });
            }
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
