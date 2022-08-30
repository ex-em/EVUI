<template>
  <div
    v-if="zoomOptions.toolbar.show && !isChartGroup"
    ref="evChartToolbarRef"
  >
    <ev-chart-toolbar
      :toolbar="zoomOptions.toolbar"
      @on-click-toolbar="onClickToolbar"
    />
  </div>

  <div
    ref="wrapper"
    v-resize="onResize"
    :style="wrapperStyle"
    class="ev-chart"
  />
</template>

<script>
  import { onMounted, onBeforeUnmount, watch, onDeactivated, inject, toRef } from 'vue';
  import { cloneDeep, isEqual, debounce } from 'lodash-es';
  import EvChart from './chart.core';
  import EvChartToolbar from './ChartToolbar';
  import { useModel, useWrapper, useZoomModel } from './uses';

  export default {
    name: 'EvChart',
    components: {
      EvChartToolbar,
    },
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
      const isChartGroup = inject('isChartGroup', false);

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

      const {
        evChartZoomOptions,
        evChartToolbarRef,

        createEvChartZoom,
        setOptionsForUseZoom,
        setDataForUseZoom,
        onClickToolbar,
      } = useZoomModel(
        normalizedOptions,
        { wrapper, evChartGroupRef: null },
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

          if (!isChartGroup && normalizedOptions.zoom.toolbar.show) {
            createEvChartZoom();
          }
        }
      };

      watch(() => props.options, (chartOpt) => {
        const newOpt = getNormalizedOptions(chartOpt);
        const isUpdateLegendType = !isEqual(newOpt.legend.table, evChart.options.legend.table);

        evChart.options = cloneDeep(newOpt);

        evChart.update({
          updateSeries: false,
          updateSelTip: { update: false, keepDomain: false },
          updateLegend: isUpdateLegendType,
        });

        if (!isChartGroup) {
          setOptionsForUseZoom(newOpt);
        }
      }, { deep: true, flush: 'post' });

      watch(() => props.data, (chartData) => {
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

        if (!isChartGroup) {
          setDataForUseZoom(newData);
        }
      }, { deep: true, flush: 'post' });

      watch(() => props.selectedItem, (newValue) => {
        const chartType = props.options.type;
        evChart.selectItemByData(newValue, chartType);
      }, { deep: true, flush: 'post' });

      watch(() => props.selectedLabel, (newValue) => {
        if (newValue.dataIndex) {
          evChart.renderWithSelected(newValue.dataIndex);
        }
      }, { deep: true, flush: 'post' });

      watch(() => props.selectedSeries, (newValue) => {
        if (newValue.seriesId) {
          evChart.renderWithSelected(newValue.seriesId);
        }
      }, { deep: true, flush: 'post' });

      onMounted(async () => {
        await createChart();
        await drawChart();
      });

      onBeforeUnmount(() => {
        if (evChart && 'destroy' in evChart) {
          evChart.destroy();
        }
      });

      onDeactivated(() => {
        if (evChart && 'hideTooltip' in evChart) {
          evChart.hideTooltip();
        }
      });

      const redraw = () => {
        if (evChart && 'update' in evChart) {
          evChart.update({
            updateSeries: true,
            updateSelTip: { update: true, keepDomain: false },
          });
        }
      };

      const onResize = debounce(() => {
        if (evChart && 'resize' in evChart) {
          evChart.resize();
        }
      }, props.resizeTimeout);

      return {
        wrapper,
        wrapperStyle,
        onResize,
        redraw,

        evChartToolbarRef,
        isChartGroup,
        onClickToolbar,
        normalizedOptions,
        zoomOptions: toRef(evChartZoomOptions, 'zoom'),
      };
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
