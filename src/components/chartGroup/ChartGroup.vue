<template>
  <div v-if="zoomOptions.toolbar.show" ref="evChartToolbarRef">
    <ev-chart-toolbar :toolbar="zoomOptions.toolbar" @on-click-toolbar="onClickToolbar" />
  </div>

  <div ref="evChartGroupRef" class="ev-chart-group__wrapper">
    <slot />
  </div>
</template>

<script>
import { onMounted, ref, watch, provide, toRef, computed } from 'vue';
import evChartToolbar from '../chart/ChartToolbar';
import { useGroupModel } from './uses';
import { useZoomModel } from '../chart/uses';

export default {
  name: 'EvChartGroup',
  components: {
    evChartToolbar,
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    zoomStartIdx: {
      type: Number,
      default: 0,
    },
    zoomEndIdx: {
      type: Number,
      default: 0,
    },
    groupSelectedLabel: {
      type: Object,
      default: null,
    },
  },
  emits: [
    'update:groupSelectedLabel',
    'update:zoomStartIdx',
    'update:zoomEndIdx',
    'update:groupHoveredLabel',
  ],
  setup(props, { emit }) {
    const {
      getNormalizedOptions,
      isExecuteZoom,
      brushSeries,
      evChartGroupRef,
      evChartPropsInGroup,
      groupInteraction,
    } = useGroupModel();

    const normalizedOptions = getNormalizedOptions(props.options);
    provide('isExecuteZoom', isExecuteZoom);
    provide('isChartGroup', true);
    provide('brushSeries', brushSeries);
    provide('evChartPropsInGroup', evChartPropsInGroup);
    provide('groupInteraction', groupInteraction);

    // 차트 클릭으로 detail 패널/popup 을 여는 순간, 그룹 폴링 redraw 를 짧게(durationMs) 양보해
    // 사용자가 연 것이 먼저 페인트되게 한다. one-shot bounded — 시간창이 지나면 자동 재개되므로
    // detail 이 열려 있는 동안에도 차트는 계속 라이브 갱신된다(resume API 없음). 상태는 deferUntil
    // 타임스탬프뿐이라 타이머/cleanup 불필요. 시계는 Chart.vue scheduleUpdate 와 동일하게 통일한다.
    const MAX_DEFER_MS = 2000;
    const DEFAULT_DEFER_MS = 800;
    const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const deferPollingRedraw = (durationMs = DEFAULT_DEFER_MS) => {
      const ms = Number.isFinite(durationMs)
        ? Math.min(Math.max(durationMs, 0), MAX_DEFER_MS)
        : DEFAULT_DEFER_MS;
      const now = nowMs();
      // 기존 deferUntil 보다 미래면 연장하되, 반복 호출로 무한 연장되지 않도록 now+MAX 로 상한.
      groupInteraction.deferUntil = Math.min(
        Math.max(groupInteraction.deferUntil, now + ms),
        now + MAX_DEFER_MS,
      );
    };
    const groupSelectedLabel = computed({
      get: () => props.groupSelectedLabel,
      set: (val) => emit('update:groupSelectedLabel', val),
    });
    provide('groupSelectedLabel', groupSelectedLabel);
    const groupHoveredLabel = ref(null);
    provide('groupHoveredLabel', groupHoveredLabel);

    watch(
      () => props.options.syncHover,
      (newSyncHover) => {
        if (newSyncHover) {
          groupHoveredLabel.value = { label: '', horizontal: false };
        } else {
          groupHoveredLabel.value = null;
        }
      },
      {
        immediate: true,
      },
    );

    const {
      evChartZoomOptions,
      evChartInfo,
      evChartToolbarRef,
      evChartClone,
      brushIdx,

      createEvChartZoom,
      setOptionsForUseZoom,
      setDataForUseZoom,
      controlZoomIdx,
      onClickToolbar,
    } = useZoomModel(
      normalizedOptions,
      { wrapper: null, evChartGroupRef },
      groupSelectedLabel,
      evChartPropsInGroup,
    );

    provide('evChartClone', evChartClone);
    provide('evChartInfo', evChartInfo);
    provide('brushIdx', brushIdx);

    onMounted(() => {
      createEvChartZoom();
    });

    watch(
      () => evChartInfo.props.data,
      (evChartProps) => {
        setDataForUseZoom(evChartProps);
      },
      { deep: true },
    );

    watch(
      () => props.options,
      (zoomOptions) => {
        const newOpt = getNormalizedOptions(zoomOptions);

        setOptionsForUseZoom(newOpt);
      },
      { deep: true },
    );

    watch(
      () => [props.zoomStartIdx, props.zoomEndIdx],
      ([zoomStartIdx, zoomEndIdx]) => {
        if (brushIdx.isUseButton || brushIdx.isUseScroll) {
          return;
        }

        controlZoomIdx(zoomStartIdx, zoomEndIdx);
      },
    );

    return {
      evChartGroupRef,
      evChartToolbarRef,
      zoomOptions: toRef(evChartZoomOptions, 'zoom'),
      onClickToolbar,
      deferPollingRedraw,
    };
  },
};
</script>

<style lang="scss" scoped>
@use 'style/chartGroup.scss' as *;
</style>
