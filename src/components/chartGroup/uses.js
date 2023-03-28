import { ref, reactive } from 'vue';
import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  zoom: {
    bufferMemoryCnt: 100,
    useResetZoomMemory: true,
    useAnimation: true,
    useWheelMove: true,
    toolbar: {
      show: false,
      items: {
        previous: {
          icon: 'ev-icon-allow2-left',
          size: 'medium',
          title: 'Previous',
        },
        latest: {
          icon: 'ev-icon-allow2-right',
          size: 'medium',
          title: 'Latest',
        },
        reset: {
          icon: 'ev-icon-redo',
          size: 'medium',
          title: 'Reset',
        },
        dragZoom: {
          icon: 'ev-icon-zoomin',
          size: 'medium',
          title: 'Drag Zoom',
        },
      },
    },
  },
};

// eslint-disable-next-line import/prefer-default-export
export const useGroupModel = () => {
  const isExecuteZoom = ref(false);
  const evChartGroupRef = ref();
  const evChartPropsInGroup = ref([]);
  const brushSeries = reactive({ list: [], chartIdx: null });
  const getNormalizedOptions = options => defaultsDeep({}, options, DEFAULT_OPTIONS);

  return {
    getNormalizedOptions,
    isExecuteZoom,
    brushSeries,
    evChartGroupRef,
    evChartPropsInGroup,
  };
};
