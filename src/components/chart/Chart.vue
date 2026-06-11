<template>
  <div v-if="zoomOptions.toolbar?.show && !injectIsChartGroup" ref="evChartToolbarRef">
    <ev-chart-toolbar :toolbar="zoomOptions.toolbar" @on-click-toolbar="onClickToolbar" />
  </div>

  <div ref="wrapper" v-resize="onResize" :style="wrapperStyle" class="ev-chart" />
</template>

<script>
import {
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  inject,
  watch,
  ref,
  toRef,
  computed,
} from 'vue';
import { isEqual, debounce } from 'lodash-es';
import { resize } from '@/directives/resize';
import EvChart from './chart.core';
import EvChartToolbar from './ChartToolbar';
import { useModel, useWrapper, useZoomModel, cloneChartData } from './uses';

export default {
  name: 'EvChart',
  components: {
    EvChartToolbar,
  },
  directives: {
    resize,
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
    realTimeScatterReset: {
      type: Boolean,
      default: false,
    },
    legendData: {
      type: Array,
      default: () => [],
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
    'update:realTimeScatterReset',
    'click-legend',
    'update:legendData',
    'axes-scale-change',
    'axes-data-max-change',
  ],
  setup(props, { emit }) {
    let evChart = null;
    const isMounted = ref(false);
    const injectIsChartGroup = inject('isChartGroup', false);
    const injectBrushSeries = inject('brushSeries', { list: [], chartIdx: null });
    const injectGroupSelectedLabel = inject('groupSelectedLabel', null);
    const injectGroupHoveredLabel = inject('groupHoveredLabel', null);
    const injectBrushIdx = inject('brushIdx', { start: 0, end: -1 });
    const injectEvChartPropsInGroup = inject('evChartPropsInGroup', []);

    const {
      eventListeners,
      selectItemInfo,
      selectLabelInfo,
      selectSeriesInfo,
      getNormalizedData,
      getNormalizedOptions,
    } = useModel(injectGroupSelectedLabel, injectGroupHoveredLabel);

    const normalizedData = getNormalizedData(props.data);
    const normalizedOptions = getNormalizedOptions(props.options);
    const selectedLabel = computed(() => props.selectedLabel);
    const selectedItem = computed(() => props.selectedItem);

    const { wrapper, wrapperStyle } = useWrapper(normalizedOptions);

    const {
      evChartZoomOptions,
      evChartToolbarRef,

      createEvChartZoom,
      setOptionsForUseZoom,
      setDataForUseZoom,
      controlZoomIdx,
      onClickToolbar,
    } = injectIsChartGroup
      ? {}
      : useZoomModel(
          normalizedOptions,
          { wrapper, evChartGroupRef: null },
          props.selectedLabel ? selectedLabel : selectedItem,
          injectEvChartPropsInGroup,
        );

    let pendingUpdate = null;
    let pendingTimer = null;

    const scheduleUpdate = (params) => {
      if (!pendingUpdate) {
        pendingUpdate = { ...params };
      } else {
        if (params.updateSeries) pendingUpdate.updateSeries = true;
        if (params.updateData) pendingUpdate.updateData = true;
        if (params.updateLegend) pendingUpdate.updateLegend = true;
        if (params.updateTooltip) pendingUpdate.updateTooltip = true;
        if (params.updateSelTip?.update) {
          pendingUpdate.updateSelTip ??= {};
          pendingUpdate.updateSelTip.update = true;
        }
      }

      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => {
        if (pendingUpdate && evChart) {
          evChart.update(pendingUpdate);
        }
        pendingUpdate = null;
        pendingTimer = null;
      }, 0);
    };

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

        if (normalizedOptions.legend.show && normalizedOptions.legend.external) {
          evChart.emitLegendData();
        }
      }
    };

    watch(
      () => props.options,
      (chartOpt) => {
        const newOpt = getNormalizedOptions(chartOpt);
        const prevLegendShow = evChart.options?.legend?.show ?? false;
        const isUpdateLegendType = !isEqual(newOpt.legend.table, evChart.options.legend.table);
        const isUpdateTooltip =
          newOpt.tooltip.use && !isEqual(newOpt.tooltip, evChart.options.tooltip);

        // getNormalizedOptions는 defaultsDeep({}, ...)로 props와 분리된 새 객체를 반환하므로
        // 추가 cloneDeep 없이 그대로 할당한다.
        evChart.options = newOpt;

        scheduleUpdate({
          updateSeries: false,
          updateSelTip: { update: false, keepDomain: false },
          updateLegend: isUpdateLegendType,
          updateTooltip: isUpdateTooltip,
        });

        if (newOpt.legend.show && newOpt.legend.external && !prevLegendShow) {
          evChart.emitLegendData();
        }

        if (!injectIsChartGroup) {
          setOptionsForUseZoom(newOpt);
        }
      },
      { deep: true, flush: 'post' },
    );

    watch(
      () => props.data,
      (chartData) => {
        const newData = props.options.realTimeScatter?.use
          ? { ...chartData, groups: [], labels: [] }
          : getNormalizedData(chartData);
        // series/groups를 두 번 깊은 비교하지 않도록 각 키를 한 번씩만 비교해 재사용한다.
        const isUpdateSeriesData = !isEqual(newData.series, evChart.data.series);
        const isUpdateGroups = !isEqual(newData.groups, evChart.data.groups);

        const isUpdateSeries =
          isUpdateSeriesData || isUpdateGroups || props.options.type === 'heatMap';

        const isUpdateData =
          isUpdateSeriesData ||
          isUpdateGroups ||
          !isEqual(newData.labels, evChart.data.labels) ||
          !isEqual(newData.data, evChart.data.data);

        evChart.data = props.options.realTimeScatter?.use ? newData : cloneChartData(newData);

        scheduleUpdate({
          updateSeries: isUpdateSeries,
          updateSelTip: { update: true, keepDomain: false },
          updateData: isUpdateData,
        });

        if (!injectIsChartGroup && isUpdateData) {
          setDataForUseZoom(newData);
        }
      },
      // shallowDataWatch opt-in 이면 deep 추적을 끈다(큰 데이터의 O(N) deep-track 비용 제거).
      // mount 시점 1회 평가 — 런타임 토글 불가. deep:false 면 props.data top-level 참조가 바뀔 때만
      // 발화하므로 소비자는 새 객체 참조를 할당해야 한다(in-place mutation 은 미감지).
      { deep: !normalizedOptions.shallowDataWatch, flush: 'post' },
    );

    if (injectIsChartGroup && !injectGroupSelectedLabel?.value) {
      watch(
        () => injectBrushIdx.start,
        (curBrushStartIdx, prevBrushStartIdx) => {
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
        },
      );
    }

    watch(
      () => selectedItem.value,
      (newValue) => {
        const chartType = props.options.type;
        evChart.selectItemByData(newValue, chartType);
      },
      { deep: true, flush: 'post' },
    );

    watch(
      () => injectGroupSelectedLabel?.value ?? selectedLabel.value,
      (newValue) => {
        if (newValue?.dataIndex) {
          evChart.selectLabelByData(newValue.dataIndex, newValue?.targetAxis);
        }
      },
      { deep: true, flush: 'post' },
    );

    watch(
      () => props.selectedSeries,
      (newValue) => {
        if (!normalizedOptions.selectSeries?.use) {
          console.warn('[EVUI][Chart] selectSeries.use is false, so selectedSeries is not working');
        } else if (newValue.seriesId) {
          evChart.selectSeriesByData(newValue.seriesId);
        }
      },
      { deep: true, flush: 'post' },
    );

    if (!injectIsChartGroup) {
      watch(
        () => [props.zoomStartIdx, props.zoomEndIdx],
        ([zoomStartIdx, zoomEndIdx]) => {
          controlZoomIdx(zoomStartIdx, zoomEndIdx);
        },
      );
    }

    watch(
      () => props.realTimeScatterReset,
      (flag) => {
        if (flag) {
          Object.keys(evChart.dataSet ?? {}).forEach((series) => {
            if (evChart.dataSet[series]) {
              evChart.dataSet[series].dataGroup = [];
            }
          });

          emit('update:realTimeScatterReset', false);
        }
      },
    );

    watch(
      () => props.options.realTimeScatter?.use,
      (use) => {
        evChart.options.realTimeScatter.use = use ?? false;

        evChart.update({
          updateSeries: true,
          updateSelTip: { update: false, keepDomain: false },
          updateData: false,
        });
      },
    );

    watch(
      () => injectGroupHoveredLabel?.value,
      (newHoveredLabel) => {
        if (!newHoveredLabel) {
          return;
        }
        if (props.options.syncHover !== false) {
          if (newHoveredLabel.label == null) {
            evChart.overlayClear();
          } else {
            evChart.drawSyncedIndicator(newHoveredLabel);
          }
        }
      },
      { deep: true, flush: 'post' },
    );

    onMounted(async () => {
      if (injectEvChartPropsInGroup?.value) {
        injectEvChartPropsInGroup.value.push(props);
      }

      await createChart();
      await drawChart();

      isMounted.value = true;
    });

    onBeforeUnmount(() => {
      clearTimeout(pendingTimer);
      pendingUpdate = null;
      pendingTimer = null;

      if (evChart && 'destroy' in evChart) {
        evChart.destroy();
      }

      if (injectEvChartPropsInGroup?.value?.length) {
        injectEvChartPropsInGroup.value.length = 0;
      }

      isMounted.value = false;
    });

    onDeactivated(() => {
      if (evChart && 'hideTooltip' in evChart) {
        evChart.hideTooltip();
      }
    });

    const toggleSeries = (sId) => {
      evChart?.toggleSeries(sId);
    };

    const highlightSeries = (sId) => {
      evChart?.highlightSeries(sId);
    };

    const unhighlightSeries = () => {
      evChart?.unhighlightSeries();
    };

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

    onActivated(() => {
      if (isMounted.value) {
        onResize();
      }
    });

    return {
      wrapper,
      wrapperStyle,
      onResize,
      redraw,
      toggleSeries,
      highlightSeries,
      unhighlightSeries,

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
@use 'style/chart.scss' as *;
</style>
