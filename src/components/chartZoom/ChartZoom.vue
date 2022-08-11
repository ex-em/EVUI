<template>
  <div
    ref="evChartZoomRef"
    class="ev-chart-zoom__wrapper"
  >
    <div
      class="ev-icon"
      :style="iconStyle"
    >
      <ev-icon
        v-for="(iconName, type) in chartZoomOptions.icon.type"
        :key="`${type}-${iconName}`"
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
      props: {},
    });
    const evChartClone = { data: {} };
    let evChartZoom = {};

    const evChartZoomRef = ref();
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

      evChartInfo.props = slots.default(evChartInfo.dom).reduce(
        (acc, { type, props: evChartProps }) => {
          if (type?.name === 'EvChart') {
            if (!evChartProps.options?.dragSelection?.use) {
              evChartProps.options.dragSelection = {
                use: true,
                keepDisplay: true,
              };
            }

            acc.push(evChartProps);
          }

          return acc;
        }, [],
      );

      evChartClone.data = cloneDeep(evChartInfo.props.map(({ data }) => data));

      evChartZoom = new EvChartZoom(
        evChartInfo,
        evChartClone,
      );
    });

    watch(() => evChartInfo.props, (evChartProps) => {
      evChartClone.data = cloneDeep(evChartProps.map(({ data }) => data));

      evChartZoom.updateEvChartCloneData(evChartClone);
    });

    const getRangeInfo = (zoomInfo) => {
      if (zoomInfo.data.length && zoomInfo.range && isUseZoomMode.value) {
        evChartZoom.dragZoom(zoomInfo);
      }
    };

    const onClickUseDragZoom = ({ target }) => {
      const defaultDragType = 'dragZoom';
      isUseZoomMode.value = !isUseZoomMode.value;

      target.classList.toggle('active');

      evChartInfo.props.forEach(({ options }) => {
        options.zoom = {
          use: isUseZoomMode.value,
          type: defaultDragType,
          getRangeInfo,
        };

        options.dragSelection = {
          use: true,
          keepDisplay: !isUseZoomMode.value,
        };
      });

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
