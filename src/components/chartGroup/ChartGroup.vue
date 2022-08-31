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
import { onMounted, watch, provide, toRef } from 'vue';
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
  },
  emits: [
    'update:zoomStartIdx',
    'update:zoomEndIdx',
  ],
  setup(props) {
    const {
      getNormalizedOptions,
      isExecuteZoom,
      evChartGroupRef,
    } = useGroupModel();

    const normalizedOptions = getNormalizedOptions(props.options);
    provide('isExecuteZoom', isExecuteZoom);
    provide('isChartGroup', true);

    const {
      evChartZoomOptions,
      evChartInfo,
      evChartToolbarRef,
      createEvChartZoom,
      setOptionsForUseZoom,
      setDataForUseZoom,
      controlZoomIdx,
      onClickToolbar,
    } = useZoomModel(normalizedOptions, { wrapper: null, evChartGroupRef });

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
