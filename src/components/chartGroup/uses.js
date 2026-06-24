import { ref, reactive } from 'vue';
import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  zoom: {
    bufferMemoryCnt: 100,
    keepZoomStatus: false,
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
  // deferUntil 은 deferPollingRedraw 로 설정하는 절대 타임스탬프로, 그 시각까지 그룹 polling 재렌더를
  // 미룬다(detail/popup 우선 페인트). Chart.vue scheduleUpdate 가 이 값까지 양보한다.
  const groupInteraction = { deferUntil: 0 };
  const getNormalizedOptions = (options) => defaultsDeep({}, options, DEFAULT_OPTIONS);

  return {
    getNormalizedOptions,
    isExecuteZoom,
    brushSeries,
    evChartGroupRef,
    evChartPropsInGroup,
    groupInteraction,
  };
};
