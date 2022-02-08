<template>
  <div
    ref="wrapper"
    v-resize="onResize"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>

<script>
import { onMounted, onBeforeUnmount, watch, onDeactivated } from 'vue';
  import { cloneDeep, isEqual, debounce } from 'lodash-es';
  import EvChart from './chart.core';
  import { useModel, useWrapper } from './uses';

  export default {
    name: 'EvChart',
    props: {
      selectedItem: {
        type: Object,
        default: null,
      },
      options: {
        type: Object,
        default: () => ({}),
      },
      data: {
        type: Object,
        default: () => ({}),
      },
      resizeTimeout: {
        type: Number,
        default: 0,
      },
    },
    emits: [
      'click',
      'dbl-click',
      'drag-select',
      'update:selectedItem',
    ],
    setup(props) {
      let evChart = {};
      let isInit = false;

      const {
        eventListeners,
        selectInfo,
        getNormalizedData,
        getNormalizedOptions,
      } = useModel();

      const normalizedData = getNormalizedData(props.data);
      const normalizedOptions = getNormalizedOptions(props.options);

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
          selectInfo,
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

        await watch(() => props.options, (chartOpt) => {
          const newOpt = getNormalizedOptions(chartOpt);
          evChart.options = cloneDeep(newOpt);
          evChart.update({
            updateSeries: false,
            updateSelTip: { update: false, keepDomain: false },
          });
        }, { deep: true });

        await watch(() => props.data, (chartData) => {
          const newData = getNormalizedData(chartData);
          const isUpdateSeries = !isEqual(newData.series, evChart.data.series)
              || !isEqual(newData.groups, evChart.data.groups);
          evChart.data = cloneDeep(newData);
          evChart.update({
            updateSeries: isUpdateSeries,
            updateSelTip: { update: true, keepDomain: false },
          });
        }, { deep: true });

        await watch(() => props.selectedItem, (newValue) => {
          if (newValue?.seriesID && !isNaN(newValue?.dataIndex)) {
            evChart.selectItemByData(newValue);
          }
        }, { deep: true });
      });

      onBeforeUnmount(() => {
        evChart.destroy();
      });

      onDeactivated(() => {
        if (evChart && 'hideTooltip' in evChart) {
          evChart.hideTooltip();
        }
      });

      const redraw = () => {
        if (evChart && isInit) {
          evChart.update({
            updateSeries: true,
            updateSelTip: { update: true, keepDomain: false },
          });
        }
      };

      const onResize = debounce(() => {
        if (evChart && 'resize' in evChart && isInit) {
          evChart.resize();
        }
      }, props.resizeTimeout);

      return {
        wrapper,
        wrapperStyle,
        onResize,
        redraw,
      };
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
