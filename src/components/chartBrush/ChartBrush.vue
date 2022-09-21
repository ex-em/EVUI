<template>
  <div
    v-if="evChartBrushOptions.show"
    ref="evChartBrushRef"
    v-resize="onResize"
    :style="evChartBrushStyle"
    class="ev-chart-brush"
  />
</template>

<script>
import { inject, watch, computed, onMounted, onBeforeUnmount, onDeactivated, onUpdated } from 'vue';
import { cloneDeep, debounce, isEqual } from 'lodash-es';
import EvChart from '../chart/chart.core';
import { useModel, useWrapper } from '../chart/uses';
import EvChartBrush from './chartBrush.core';
import { useBrushModel } from './uses';

export default {
  name: 'EvChartBrush',
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    let evChart = null;
    let evChartBrush = null;

    const injectEvChartClone = inject('evChartClone', { data: [] });
    const injectEvChartInfo = inject('evChartInfo', { props: { options: [] } });
    const injectBrushIdx = inject('brushIdx', {
      start: 0,
      end: 0,
      isUseButton: false,
      isUseScroll: false,
    });

    const {
      getNormalizedBrushOptions,
    } = useBrushModel();

    const evChartBrushOptions = computed(() => getNormalizedBrushOptions(props.options));

    const {
      eventListeners,
      selectItemInfo,
      selectLabelInfo,
      selectSeriesInfo,
      getNormalizedData,
      getNormalizedOptions,
    } = useModel();

    const evChartData = computed(() => {
      const data = getNormalizedData(
        (injectEvChartClone.data ?? [])[evChartBrushOptions.value.chartIdx],
      );

      const seriesInfo = Object.values(data.series);

      seriesInfo.forEach((series) => {
        series.point = false;
      });

      return data;
    });

    const evChartOption = computed(() => {
      const chartOption = injectEvChartInfo.props.options[evChartBrushOptions.value.chartIdx];

      const option = {
        ...chartOption,
        brush: {
          use: true,
          ...evChartBrushOptions.value,
        },
        height: evChartBrushOptions.value.height,
        zoom: {
          use: false,
        },
        dragSelection: {
          use: false,
        },
        title: {
          show: false,
        },
        legend: {
          show: false,
        },
        axesX: [{
          ...chartOption?.axesX?.[0],
          title: {
            use: false,
          },
        }],
        axesY: [{
          ...chartOption?.axesY?.[0],
          title: {
            use: false,
          },
        }],
      };

      return getNormalizedOptions(option);
    });

    const {
      wrapper: evChartBrushRef,
      wrapperStyle: evChartBrushStyle,
    } = useWrapper(
      evChartOption.value,
    );

    watch(evChartOption, (newOpt, prevOpt) => {
      if (newOpt.brush.chartIdx <= injectEvChartClone.data?.length - 1) {
        if (evChart) {
          const isUpdateLegendType = !isEqual(newOpt.legend.table, evChart.options.legend.table);

          evChart.options = cloneDeep(newOpt);

          evChart.update({
            updateSeries: false,
            updateSelTip: { update: false, keepDomain: false },
            updateLegend: isUpdateLegendType,
          });
        }

        if (evChartBrush) {
          const isUpdateBrushOptions = !isEqual(prevOpt.brush, newOpt.brush);

          if (isUpdateBrushOptions) {
            evChartBrush.removeBrushWrapper();
          }
        }
      }
    });

    watch(evChartData, (newData) => {
      if (evChart) {
        const isUpdateSeries = !isEqual(newData.series, evChart.data.series)
          || !isEqual(newData.groups, evChart.data.groups)
          || evChartOption.value.type === 'heatMap';

        const isUpdateData = !isEqual(newData.data, evChart.data);

        evChart.data = cloneDeep(newData);

        evChart.update({
          updateSeries: isUpdateSeries,
          updateSelTip: { update: true, keepDomain: false },
          updateData: isUpdateData,
        });
      }
    });

    const createChart = () => {
      let selected;
      if (evChartOption.value.selectLabel.use) {
        selected = selectLabelInfo;
      } else if (evChartOption.value.selectSeries.use) {
        selected = selectSeriesInfo;
      }

      evChart = new EvChart(
        evChartBrushRef.value,
        evChartData.value,
        evChartOption.value,
        eventListeners,
        selectItemInfo,
        selected,
      );
    };

    const createChartBrush = () => {
      evChartBrush = new EvChartBrush(
        evChart,
        evChartData,
        evChartOption,
        injectBrushIdx,
        evChartBrushRef,
      );
    };

    const drawChart = () => {
      if (evChart) {
        evChart.init();
      }
    };

    const drawChartBrush = (isResize) => {
      if (evChartBrush) {
        evChartBrush.init(isResize);
      }
    };

    watch(() => [injectBrushIdx.start, injectBrushIdx.end], () => {
      if (
        evChartBrushRef.value
        && evChartOption.value.brush.chartIdx <= injectEvChartClone.data?.length - 1
      ) {
        drawChartBrush();
      }
    });

    onMounted(async () => {
      if (evChartBrushOptions.value.show) {
        await createChart();
        await drawChart();
        createChartBrush();
        drawChartBrush();
      }
    });

    onUpdated(async () => {
      if (evChartBrushOptions.value.show) {
        if (evChartOption.value.brush.chartIdx <= injectEvChartClone.data?.length - 1) {
          await createChart();
          await drawChart();
          createChartBrush();
          drawChartBrush();
        } else {
          evChartBrush.removeBrushCanvas();
        }
      }
    });

    onBeforeUnmount(() => {
      if (evChart && 'destroy' in evChart) {
        evChart.destroy();
      }

      if (evChartBrush) {
        evChartBrush.destroy();
      }
    });

    onDeactivated(() => {
      if (evChart && 'hideTooltip' in evChart) {
        evChart.hideTooltip();
      }
    });

    /**
     * @param {boolean} isResizeDone resizing complete status
     *
     * @returns {undefined}
     */
    const onResize = debounce(() => {
      if (evChart && 'resize' in evChart) {
        const resize = new Promise(resolve => evChart.resize(resolve));

        resize.then((isResizeDone) => {
          if (isResizeDone) {
            drawChartBrush(isResizeDone);
          }
        });
      }
    }, 0);

    return {
      evChartBrushOptions,
      evChartBrushRef,
      evChartBrushStyle,
      onResize,
    };
  },
};
</script>
