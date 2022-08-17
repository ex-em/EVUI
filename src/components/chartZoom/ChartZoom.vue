<template>
  <div
    ref="evChartZoomRef"
    class="ev-chart-zoom__wrapper"
  >
    <div
      ref="iconRef"
      class="ev-icon"
      :style="iconStyle"
    >
      <ev-icon
        v-for="(iconName, type) in chartZoomOptions.icon.type"
        :key="`${type}-${iconName}`"
        :class="type"
        :icon="iconName"
        :size="chartZoomOptions.icon.size"
        :title="type"
        @click="(e) => onClick(e, type)"
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
    let evChartZoom = {};

    const evChartZoomRef = ref();
    const iconRef = ref();
    const isUseZoomMode = ref(false);

    const {
      getNormalizedOptions,
    } = useModel();

    const chartZoomOptions = computed(() => getNormalizedOptions(props.options));

    const iconStyle = computed(() => {
      const { icon: { hoverColor, color } } = chartZoomOptions.value;

      return {
        '--color-hover': hoverColor,
        color,
      };
    });

    onMounted(() => {
      evChartInfo.dom = evChartZoomRef.value.querySelectorAll('.ev-chart-container');

      slots.default(evChartInfo.dom).forEach(({ type, props: { data, options } }) => {
        if (type?.name === 'EvChart') {
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

      evChartClone.data = cloneDeep(evChartInfo.props.data);

      evChartZoom = new EvChartZoom(
        evChartInfo,
        evChartClone,
        props.options,
        iconRef.value,
      );
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
      evChartZoom.moveZoomArea(isUseZoomMode.value, 'wheel');
    };

    const onClickPreviousZoom = (iconType) => {
      evChartZoom.moveZoomArea(isUseZoomMode.value, iconType);
    };

    const onClickLatestZoom = (iconType) => {
      evChartZoom.moveZoomArea(isUseZoomMode.value, iconType);
    };

    const onClickInitZoom = () => {
      evChartZoom.initZoom();
    };

    const onClick = (e, iconType) => {
      switch (iconType) {
        case 'dragZoom':
          onClickUseDragZoom(e);
          break;
        case 'reset':
          onClickInitZoom();
          break;
        case 'previous':
          onClickPreviousZoom(iconType);
          break;
        case 'latest':
          onClickLatestZoom(iconType);
          break;
        default:
          break;
      }
    };

    return {
      evChartZoomRef,
      iconRef,
      chartZoomOptions,
      iconStyle,
      onClick,
    };
  },
};

</script>

<style lang="scss" scoped>
.ev-chart-zoom__wrapper {
  position: relative;

  .ev-icon {
    position: absolute;
    top: 13px;
    right: 30px;
    z-index: 1;

    i {
      pointer-events: none;
      opacity: 0.5;
    }

    i:hover {
      color: var(--color-hover);
      cursor: pointer;
    }

    .active {
      color: var(--color-hover);
      font-weight: bold;
    }
  }

  i + i {
    margin-left: 10px;
  }
}
</style>
