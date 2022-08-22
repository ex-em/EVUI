<template>
  <div
    ref="evChartZoomRef"
    class="ev-chart-zoom__wrapper"
  >
    <div
      ref="toolbarIconRef"
      class="ev-chart-zoom__wrapper__toolbar-icon"
    >
      <ev-icon
        v-for="(option, iconType) in chartZoomOptions.toolbar.items"
        :key="`${iconType}-${option.icon}`"
        :class="iconType"
        :icon="option.icon"
        :size="option.size"
        :title="option.title"
        @click="onClick($event, iconType)"
      />
    </div>
    <slot />
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch, computed } from 'vue';
import { cloneDeep } from 'lodash-es';
import EvChartZoom from './chartZoom.core';
import { useModel } from './uses';

export default {
  name: 'EvChartZoom',
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const evChartInfo = reactive({
      dom: {},
      props: {
        data: [],
        options: [],
      },
    });
    const evChartClone = { data: {} };
    let evChartZoom = null;

    const evChartZoomRef = ref();
    const toolbarIconRef = ref();
    const isUseZoomMode = ref(false);

    const {
      getNormalizedOptions,
    } = useModel();

    const chartZoomOptions = computed(() => {
      const options = getNormalizedOptions(props.options);

      if (evChartZoom) {
        evChartZoom.setEvChartZoomOptions(options);
      }

      return options;
    });

    onMounted(() => {
      evChartInfo.dom = evChartZoomRef.value.querySelectorAll('.ev-chart-container');

      if (evChartInfo.dom.length) {
        slots.default(evChartInfo.dom).forEach(({ type, props: evChartProps }) => {
          if (type?.name === 'EvChart') {
            const { options, data } = evChartProps;

            if (!options?.dragSelection?.use) {
              options.dragSelection = {
                use: true,
                keepDisplay: true,
              };

              evChartInfo.props.data.push(data);
              evChartInfo.props.options.push(options);
            }
          }
        });
      }

      if (evChartInfo.props.data.length) {
        evChartClone.data = cloneDeep(evChartInfo.props.data);

        evChartZoom = new EvChartZoom(
          evChartInfo,
          evChartClone,
          chartZoomOptions.value,
          toolbarIconRef.value,
        );
      }
    });

    const getRangeInfo = (zoomInfo) => {
      if (zoomInfo.data.length && zoomInfo.range && isUseZoomMode.value) {
        evChartZoom.dragZoom(zoomInfo);
      }
    };

    const setEvChartOptions = () => {
      const defaultDragType = 'dragZoom';

      evChartInfo.props.options.forEach((option) => {
        option.zoom = {
          use: isUseZoomMode.value,
          type: defaultDragType,
          getRangeInfo,
        };

        option.dragSelection = {
          use: true,
          keepDisplay: !isUseZoomMode.value,
        };
      });
    };

    watch(() => evChartInfo.props.data, (evChartProps) => {
      if (!evChartZoom.isAnimationFinish) {
        return;
      }

      if (!evChartZoom.isExecuteZoom) {
        evChartClone.data = cloneDeep(evChartProps);
        isUseZoomMode.value = false;

        setEvChartOptions();

        evChartZoom.updateEvChartCloneData(evChartClone, isUseZoomMode.value);
      }

      evChartZoom.isExecuteZoom = false;
    }, { deep: true });

    const onClickUseDragZoom = ({ target }) => {
      if (evChartClone.data[0].labels.length <= 1) {
        return;
      }

      isUseZoomMode.value = !isUseZoomMode.value;
      target.classList.toggle('active');

      setEvChartOptions();

      evChartZoom.setIconStyle(isUseZoomMode.value);
      evChartZoom.setEventListener(isUseZoomMode.value);
    };

    const onClick = (e, iconType) => {
      if (!evChartZoom.isAnimationFinish) {
        return;
      }

      switch (iconType) {
        case 'dragZoom':
          onClickUseDragZoom(e);
          break;
        case 'reset':
          evChartZoom.initZoom();
          break;
        case 'previous':
        case 'latest':
          evChartZoom.clickMoveZoomArea(iconType);
          break;
        default:
          break;
      }
    };

    return {
      evChartZoomRef,
      toolbarIconRef,
      chartZoomOptions,
      onClick,
    };
  },
};

</script>

<style lang="scss" scoped>
.ev-chart-zoom__wrapper {
  position: relative;

  &__toolbar-icon {
    position: absolute;
    top: 13px;
    right: 30px;
    z-index: 1;

    i {
      pointer-events: none;
      opacity: 0.5;
      cursor: pointer;
    }

    .active {
      font-weight: bold;
    }
  }

  i + i {
    margin-left: 10px;
  }
}
</style>
