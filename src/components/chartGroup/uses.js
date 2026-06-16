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
  // 그룹 내 마지막 인터랙션 시각(공유). 한 차트의 hover/click 이 그룹 전체 polling 재렌더를
  // 잠시 양보시켜 인터랙션 즉답을 보장한다(Chart.vue scheduleUpdate 에서 소비).
  // deferUntil 은 deferPollingRedraw 로 설정하는 절대 타임스탬프로, 그 시각까지 polling 재렌더를
  // 추가로 미룬다(detail/popup 우선 페인트). at 과 별개 필드이며 scheduleUpdate 가 max 로 합산한다.
  const groupInteraction = { at: 0, deferUntil: 0 };
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
