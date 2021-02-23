<template>
  <div
    ref="wrapper"
    v-resize="onResize"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>

<script>
  import { onMounted, onBeforeUnmount, watch } from 'vue';
  import { cloneDeep, defaultsDeep, isEqual, debounce } from 'lodash-es';
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
    setup(props) {
      let evChart = {};
      let isInit = false;

      const {
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
        evChart = new EvChart(
          wrapper.value,
          normalizedData,
          normalizedOptions,
          eventListeners,
        );
      };

      const drawChart = () => {
        if (evChart) {
          evChart.init();
          isInit = true;
        }
      };

      onMounted(async () => {
        await createChart();
        await drawChart();

        await watch(() => props.options, (curr) => {
          const newOpt = defaultsDeep({}, curr, normalizedOptions);
          evChart.options = cloneDeep(newOpt);
          evChart.update({
            updateSeries: false,
            updateSelTip: { update: false, keepDomain: false },
          });
        }, { deep: true });

        await watch(() => props.data, (curr) => {
          const newData = defaultsDeep({}, curr, normalizedData);
          const isUpdateSeries = !isEqual(newData.series, evChart.data.series);
          evChart.data = cloneDeep(newData);
          evChart.update({
            updateSeries: isUpdateSeries,
            updateSelTip: { update: true, keepDomain: false },
          });
        }, { deep: true });
      });

      onBeforeUnmount(() => {
        evChart.destroy();
      });

      const redrawChart = () => {
        if (isInit) {
          evChart.update({
            updateSeries: false,
            updateSelTip: {
              update: false,
              keepDomain: false,
            },
          });
        }
      };

      const onResize = debounce(redrawChart, 300);

      const selectItemByLabel = (label) => {
        evChart.selectItemByLabel(label);
      };

      return {
        wrapper,
        wrapperStyle,
        onResize,
        selectItemByLabel,
      };
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
