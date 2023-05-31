<template>
  <div
    v-if="zoomOptions.toolbar?.show && !injectIsChartGroup"
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
  import { onMounted, onBeforeUnmount, watch, onDeactivated, inject, toRef, computed } from 'vue';
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
      zoomStartIdx: {
        type: Number,
        default: 0,
      },
      zoomEndIdx: {
        type: Number,
        default: 0,
      },
    },
    emits: [
      'click',
      'dbl-click',
      'drag-select',
      'mouse-move',
      'update:selectedItem',
      'update:selectedLabel',
      'update:selectedSeries',
      'update:zoomStartIdx',
      'update:zoomEndIdx',
    ],
    setup(props) {
      let evChart = null;
      const injectIsChartGroup = inject('isChartGroup', false);
      const injectBrushSeries = inject('brushSeries', { list: [], chartIdx: null });
      const injectGroupSelectedLabel = inject('groupSelectedLabel', null);
      const injectBrushIdx = inject('brushIdx', { start: 0, end: -1 });
      const injectEvChartPropsInGroup = inject('evChartPropsInGroup', []);

      const {
        eventListeners,
        selectItemInfo,
        selectLabelInfo,
        selectSeriesInfo,
        getNormalizedData,
        getNormalizedOptions,
      } = useModel(injectGroupSelectedLabel);

      const normalizedData = getNormalizedData(props.data);
      const normalizedOptions = getNormalizedOptions(props.options);
      const selectedLabel = computed(() => props.selectedLabel);
      const selectedItem = computed(() => props.selectedItem);

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
        controlZoomIdx,
        onClickToolbar,
      } = injectIsChartGroup ? {} : useZoomModel(
        normalizedOptions,
        { wrapper, evChartGroupRef: null },
        props.selectedLabel ? selectedLabel : selectedItem,
        injectEvChartPropsInGroup,
      );

      const createChart = () => {
        let selected;
        if (normalizedOptions.selectLabel.use) {
          selected = selectLabelInfo;
        } else if (normalizedOptions.selectSeries.use) {
          selected = selectSeriesInfo;
        }

        const chartData = props.options.realTimeScatter?.use
          ? { ...props.data, groups: [], labels: [] }
          : normalizedData;

        evChart = new EvChart(
          wrapper.value,
          chartData,
          normalizedOptions,
          eventListeners,
          selectItemInfo,
          selected,
          injectBrushSeries,
        );
      };

      const drawChart = () => {
        if (evChart) {
          evChart.init();

          if (!injectIsChartGroup && normalizedOptions.zoom.toolbar.show) {
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

        if (!injectIsChartGroup) {
          setOptionsForUseZoom(newOpt);
        }
      }, { deep: true, flush: 'post' });

      watch(() => props.data, (chartData) => {
        const newData = props.options.realTimeScatter?.use
          ? { ...chartData, groups: [], labels: [] }
          : getNormalizedData(chartData);
        const isUpdateSeries = !isEqual(newData.series, evChart.data.series)
            || !isEqual(newData.groups, evChart.data.groups)
            || props.options.type === 'heatMap';

        const isUpdateData = !isEqual(newData, evChart.data);

        evChart.data = props.options.realTimeScatter?.use ? newData : cloneDeep(newData);

        evChart.update({
          updateSeries: isUpdateSeries,
          updateSelTip: { update: true, keepDomain: false },
          updateData: isUpdateData,
        });

        if (!injectIsChartGroup && isUpdateData) {
          setDataForUseZoom(newData);
        }
      }, { deep: true, flush: 'post' });

      if (injectIsChartGroup && !injectGroupSelectedLabel?.value) {
        watch(() => injectBrushIdx.start, (curBrushStartIdx, prevBrushStartIdx) => {
          if (selectedLabel?.value) {
            for (let idx = 0; idx < selectedLabel.value.dataIndex.length; idx++) {
              if (curBrushStartIdx >= (prevBrushStartIdx ?? 0)) {
                selectedLabel.value.dataIndex[idx] -= curBrushStartIdx - (prevBrushStartIdx ?? 0);
              } else {
                selectedLabel.value.dataIndex[idx] += prevBrushStartIdx - curBrushStartIdx;
              }
            }
          } else if (selectedItem?.value) {
            if (curBrushStartIdx >= (prevBrushStartIdx ?? 0)) {
              selectedItem.value.dataIndex -= curBrushStartIdx - (prevBrushStartIdx ?? 0);
            } else {
              selectedItem.value.dataIndex += prevBrushStartIdx - curBrushStartIdx;
            }
          }
        });
      }

      watch(() => selectedItem.value, (newValue) => {
        const chartType = props.options.type;
        evChart.selectItemByData(newValue, chartType);
      }, { deep: true, flush: 'post' });

      watch(() => (injectGroupSelectedLabel?.value ?? selectedLabel.value), (newValue) => {
        if (newValue?.dataIndex) {
          evChart.selectLabelByData(newValue.dataIndex, newValue?.targetAxis);
        }
      }, { deep: true, flush: 'post' });

      watch(() => props.selectedSeries, (newValue) => {
        if (newValue.seriesId) {
          evChart.selectSeriesByData(newValue.seriesId);
        }
      }, { deep: true, flush: 'post' });

      if (!injectIsChartGroup) {
        watch(() => [props.zoomStartIdx, props.zoomEndIdx], ([zoomStartIdx, zoomEndIdx]) => {
          controlZoomIdx(zoomStartIdx, zoomEndIdx);
        });
      }

      onMounted(async () => {
        if (injectEvChartPropsInGroup?.value) {
          injectEvChartPropsInGroup.value.push(props);
        }

        await createChart();
        await drawChart();
      });

      onBeforeUnmount(() => {
        if (evChart && 'destroy' in evChart) {
          evChart.destroy();
        }

        if (injectEvChartPropsInGroup?.value?.length) {
          injectEvChartPropsInGroup.value.length = 0;
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
        injectIsChartGroup,
        onClickToolbar,
        normalizedOptions,
        zoomOptions: toRef(evChartZoomOptions ?? { zoom: {} }, 'zoom'),
      };
    },
  };
</script>

<style lang="scss">
  @import 'style/chart.scss';
</style>
