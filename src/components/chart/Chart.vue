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
import Util from './helpers/helpers.util';
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
    const injectGroupInteraction = inject('groupInteraction', null);

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

    const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
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

      // fire 시점에 deferUntil 을 재검사한다. 타이머가 떠 있는 사이 deferPollingRedraw 가
      // deferUntil 을 더 미래로 연장했을 수 있는데(그룹은 차트별 클로저 타이머를 직접 못 만짐),
      // 그 경우 아직 미래면 남은 시간만큼 재예약(in-flight 재무장)한다.
      const flush = () => {
        const deferUntil = injectGroupInteraction?.deferUntil ?? 0;
        const remaining = deferUntil - nowMs();
        if (remaining > 0) {
          pendingTimer = setTimeout(flush, remaining);
          return;
        }
        if (pendingUpdate && evChart) {
          evChart.update(pendingUpdate);
        }
        pendingUpdate = null;
        pendingTimer = null;
      };

      clearTimeout(pendingTimer);
      // deferPollingRedraw 가 설정한 deferUntil 까지 데이터/polling 재렌더를 미룬다(detail/popup 우선 페인트).
      // 미뤄도 pendingUpdate 는 최신값으로 coalesce 되고 보류가 끝나면 곧 flush 된다.
      const now = nowMs();
      const deferUntil = injectGroupInteraction?.deferUntil ?? 0;
      const deferDelay = deferUntil > now ? deferUntil - now : 0;
      pendingTimer = setTimeout(flush, deferDelay);
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
      // shallowOptionsWatch opt-in 이면 deep 추적을 끈다(매 갱신 deep traverse 비용 제거).
      // 소비자는 options 변경 시 새 top-level 참조를 할당해야 한다(in-place 변경은 미감지).
      { deep: !normalizedOptions.shallowOptionsWatch, flush: 'post' },
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

        // 만료 제거된 realTimeScatter series 가 "값 있는" 신규 점과 함께 돌아오면(부활) updateSeries 를
        // 강제한다. 그래야 reconcileSeriesSet 이 돌아 seriesList/seriesInfo.charts.scatter 에 인스턴스를
        // 복구하고 (이 경로에서 prunedRealTimeScatterSeries 에서도 제거), pointsLayer baseline 도
        // 무효화돼 부활 series 가 다시 그려지고 범례에도 표시된다.
        // y=null 경계 패딩은 부활 신호가 아니다 — 매 틱 패딩만 보내는 소비자에서 이를 신호로 보면
        // 만료 → 즉시 updateSeries 강제가 매 틱 반복돼 full redraw 가 상시화된다(만료·부활 판정 통일).
        const prunedSet = evChart.prunedRealTimeScatterSeries;
        const isRevived =
          !!prunedSet?.size &&
          Object.keys(newData.data ?? {}).some(
            (key) => prunedSet.has(key) && Util.hasRealTimeScatterValue(newData.data[key]),
          );

        const isUpdateSeries =
          isUpdateSeriesData || isUpdateGroups || isRevived || props.options.type === 'heatMap';

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

          // 전체 리셋 후에는 만료 제거 가드도 비워, 데이터가 다시 오면 series 가 재생성되게 한다.
          evChart.prunedRealTimeScatterSeries?.clear();

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
