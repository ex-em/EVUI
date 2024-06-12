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
import {
  inject,
  watch,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onDeactivated,
  onActivated,
  onUpdated,
} from 'vue';
import { cloneDeep, debounce, isEqual } from 'lodash-es';
import EvChart from '../chart/chart.core';
import { useModel, useWrapper } from '../chart/uses';
import EvChartBrush from './chartBrush.core';
import { useBrushModel } from './uses';
import { default as resize } from 'vue-resize-observer';

export default {
  name: 'EvChartBrush',
  directives: {
    resize,
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    let evChart = null;
    let evChartBrush = null;

    const isMounted = ref(false);
    const injectEvChartClone = inject('evChartClone', { data: [] });
    const injectEvChartInfo = inject('evChartInfo', { props: { options: [] } });
    const injectBrushIdx = inject('brushIdx', {
      start: 0,
      end: -1,
      isUseButton: false,
      isUseScroll: false,
    });
    const injectBrushSeries = inject('brushSeries', {
      list: [],
      chartIdx: null,
    });

    const { getNormalizedBrushOptions } = useBrushModel();

    const evChartBrushOptions = computed(() =>
      getNormalizedBrushOptions(props.options)
    );

    const {
      eventListeners,
      selectItemInfo,
      selectLabelInfo,
      selectSeriesInfo,
      getNormalizedData,
      getNormalizedOptions,
    } = useModel();

    const evChartData = computed(() =>
      getNormalizedData(
        (injectEvChartClone.data ?? [])[evChartBrushOptions.value.chartIdx]
      )
    );

    const evChartOption = computed(() => {
      const chartOption =
        injectEvChartInfo.props.options[evChartBrushOptions.value.chartIdx];

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
        tooltip: {
          use: false,
        },
        legend: {
          show: false,
        },
        selectLabel: {
          use: false,
        },
        selectSeries: {
          use: false,
        },
        axesX: [
          {
            ...chartOption?.axesX?.[0],
            title: {
              use: false,
            },
          },
        ],
        axesY: [
          {
            ...chartOption?.axesY?.[0],
            title: {
              use: false,
            },
          },
        ],
      };

      return getNormalizedOptions(option);
    });

    const { wrapper: evChartBrushRef, wrapperStyle: evChartBrushStyle } =
      useWrapper(evChartOption.value);

    watch(
      () => injectBrushSeries.list,
      () => {
        if (
          evChartBrushRef.value &&
          injectBrushSeries.chartIdx === evChartBrushOptions.value.chartIdx
        ) {
          evChart.seriesList =
            injectBrushSeries.list[evChartBrushOptions.value.chartIdx];

          evChart.update({
            updateSeries: false,
            updateSelTip: { update: false, keepDomain: false },
          });
        }
      }
    );

    watch(evChartOption, (newOpt, prevOpt) => {
      if (newOpt.brush.chartIdx <= injectEvChartClone.data?.length - 1) {
        if (evChartBrush && !isEqual(prevOpt.brush, newOpt.brush)) {
          evChartBrush.removeBrushWrapper();
        } else if (evChart && !isEqual(newOpt, prevOpt)) {
          evChart.options = cloneDeep(newOpt);

          evChart.update({
            updateSeries: false,
            updateSelTip: { update: false, keepDomain: false },
          });
        }
      } else {
        evChart.data = cloneDeep(evChartData.value);

        evChart.update({
          updateSeries: true,
          updateSelTip: { update: false, keepDomain: false },
          updateData: false,
        });

        evChartBrush.removeBrushCanvas();
      }
    });

    watch(
      () => injectEvChartClone.data,
      (newData) => {
        if (evChart) {
          const data = newData[evChartBrushOptions.value.chartIdx];

          if (data) {
            const isUpdateSeries = !isEqual(data.series, evChart.data.series);

            const seriesList =
              injectBrushSeries.list[evChartBrushOptions.value.chartIdx];

            if (
              typeof seriesList === 'object' &&
              Object.keys(seriesList).length
            ) {
              Object.keys(data.series).forEach((series) => {
                if (!('show' in data.series[series])) {
                  data.series[series].show = seriesList[series]?.show ?? true;
                }
              });
            }

            evChart.data = cloneDeep(data);

            evChart.update({
              updateSeries: isUpdateSeries,
              updateSelTip: { update: false, keepDomain: false },
              updateData: false,
            });
          }
        }
      }
    );

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
        selected
      );
    };

    const createChartBrush = () => {
      evChartBrush = new EvChartBrush(
        evChart,
        evChartData,
        evChartBrushOptions,
        injectBrushIdx,
        evChartBrushRef
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

    watch(
      () => [injectBrushIdx.start, injectBrushIdx.end],
      () => {
        if (
          evChartBrushRef.value &&
          evChartBrushOptions.value.chartIdx <=
            injectEvChartClone.data?.length - 1
        ) {
          drawChartBrush();
        }
      }
    );

    onMounted(async () => {
      if (evChartBrushOptions.value.show) {
        await createChart();
        await drawChart();
        createChartBrush();
        drawChartBrush();
      }

      isMounted.value = true;
    });

    onUpdated(async () => {
      if (evChartBrushOptions.value.show) {
        if (
          evChartBrushOptions.value.chartIdx <=
          injectEvChartClone.data?.length - 1
        ) {
          const seriesList =
            injectBrushSeries.list[evChartBrushOptions.value.chartIdx];

          if (
            typeof seriesList === 'object' &&
            Object.keys(seriesList).length
          ) {
            Object.keys(evChartData.value.series).forEach((series) => {
              if (!('show' in evChartData.value.series[series])) {
                evChartData.value.series[series].show =
                  seriesList[series]?.show ?? true;
              }
            });
          }

          await createChart();
          await drawChart();
          createChartBrush();
          drawChartBrush();
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

      isMounted.value = false;
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
        const resize = new Promise((resolve) => evChart.resize(resolve));

        resize.then((isResizeDone) => {
          if (isResizeDone) {
            drawChartBrush(isResizeDone);
          }
        });
      }
    }, 0);

    onActivated(() => {
      if (isMounted.value) {
        onResize();
      }
    });

    return {
      evChartBrushOptions,
      evChartBrushRef,
      evChartBrushStyle,
      onResize,
    };
  },
};
</script>
