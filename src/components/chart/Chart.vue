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
      selectedLabel: {
        type: Object,
        default: null,
      },
      selectedSeries: {
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
      'update:selectedLabel',
      'update:selectedSeries',
    ],
    setup(props) {
      let evChart = null;
      let isInit = false;

      const {
        eventListeners,
        selectItemInfo,
        selectLabelInfo,
        selectSeriesInfo,
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
        let selected;
        if (normalizedOptions.selectLabel.use) {
          selected = selectLabelInfo;
        } else if (normalizedOptions.selectSeries.use) {
          selected = selectSeriesInfo;
        }

        evChart = new EvChart(
          wrapper.value,
          normalizedData,
          normalizedOptions,
          eventListeners,
          selectItemInfo,
          selected,
        );
      };

      const drawChart = () => {
        if (evChart) {
          evChart.init();
          isInit = true;
        }
      };

      watch(() => props.options, (chartOpt) => {
        if (!isInit) {
          return;
        }

        const newOpt = getNormalizedOptions(chartOpt);
        const isUpdateLegendType = !isEqual(newOpt.legend.table, evChart.options.legend.table);

        evChart.options = cloneDeep(newOpt);

        evChart.update({
          updateSeries: false,
          updateSelTip: { update: false, keepDomain: false },
          updateLegend: isUpdateLegendType,
        });
      }, { deep: true });

      watch(() => props.data, (chartData) => {
        if (!isInit) {
          return;
        }

        const newData = getNormalizedData(chartData);
        const isUpdateSeries = !isEqual(newData.series, evChart.data.series)
            || !isEqual(newData.groups, evChart.data.groups)
            || props.options.type === 'heatMap';

        const isUpdateData = !isEqual(newData.data, evChart.data);

        evChart.data = cloneDeep(newData);

        evChart.update({
          updateSeries: isUpdateSeries,
          updateSelTip: { update: true, keepDomain: false },
          updateData: isUpdateData,
        });
      }, { deep: true });

      watch(() => props.selectedItem, (newValue) => {
        if (!isInit) {
          return;
        }

        const chartType = props.options.type;
        evChart.selectItemByData(newValue, chartType);
      }, { deep: true });

      watch(() => props.selectedLabel, (newValue) => {
        if (!isInit) {
          return;
        }

        if (newValue.dataIndex) {
          evChart.renderWithSelected(newValue.dataIndex);
        }
      }, { deep: true });

      watch(() => props.selectedSeries, (newValue) => {
        if (!isInit) {
          return;
        }

        if (newValue.seriesId) {
          evChart.renderWithSelected(newValue.seriesId);
        }
      }, { deep: true });

      onMounted(async () => {
        await createChart();
        await drawChart();
      });

      onBeforeUnmount(() => {
        if (!isInit) {
          return;
        }

        evChart.destroy();
      });

      onDeactivated(() => {
        if (!isInit) {
          return;
        }

        evChart.hideTooltip();
      });

      const redraw = () => {
        if (!isInit) {
          return;
        }

        evChart.update({
          updateSeries: true,
          updateSelTip: { update: true, keepDomain: false },
        });
      };

      const onResize = debounce(() => {
        if (!isInit) {
          return;
        }

        evChart.resize();
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
