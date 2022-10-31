<template>
  <div
    v-if="zoomOptions.toolbar.show"
    ref="evChartToolbarRef"
  >
    <ev-chart-toolbar
      :toolbar="zoomOptions.toolbar"
      @on-click-toolbar="onClickToolbar"
    />
  </div>

  <div
    ref="evChartGroupRef"
    class="ev-chart-group__wrapper"
  >
    <slot />
  </div>
</template>

<script>
import { onMounted, watch, provide, toRef, computed } from 'vue';
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
  ],
  setup(props, { emit }) {
    const {
      getNormalizedOptions,
      isExecuteZoom,
      brushSeries,
      evChartGroupRef,
    } = useGroupModel();

    const normalizedOptions = getNormalizedOptions(props.options);
    provide('isExecuteZoom', isExecuteZoom);
    provide('isChartGroup', true);
    provide('brushSeries', brushSeries);
    const groupSelectedLabel = computed({
      get: () => props.groupSelectedLabel,
      set: val => emit('update:groupSelectedLabel', val),
    });
    provide('groupSelectedLabel', groupSelectedLabel);

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
    );

    provide('evChartClone', evChartClone);
    provide('evChartInfo', evChartInfo);
    provide('brushIdx', brushIdx);

    onMounted(() => {
      createEvChartZoom();
    });

    watch(() => evChartInfo.props.data, (evChartProps) => {
      setDataForUseZoom(evChartProps);
    }, { deep: true });

    watch(() => props.options, (zoomOptions) => {
      const newOpt = getNormalizedOptions(zoomOptions);

      setOptionsForUseZoom(newOpt);
    }, { deep: true });

    watch(() => [props.zoomStartIdx, props.zoomEndIdx], ([zoomStartIdx, zoomEndIdx]) => {
      if (brushIdx.isUseButton || brushIdx.isUseScroll) {
        return;
      }

      controlZoomIdx(zoomStartIdx, zoomEndIdx);
    });

    return {
      evChartGroupRef,
      evChartToolbarRef,
      zoomOptions: toRef(evChartZoomOptions, 'zoom'),
      onClickToolbar,
    };
  },
};
</script>

<style lang="scss" scoped>
  @import 'style/chartGroup.scss';
</style>
