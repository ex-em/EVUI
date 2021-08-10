import { ref, computed, getCurrentInstance, nextTick } from 'vue';
import { defaultsDeep } from 'lodash-es';
import { getQuantity } from '@/common/utils';

const DEFAULT_OPTIONS = {
  padding: {
    top: 20,
    right: 2,
    left: 2,
    bottom: 4,
  },
  border: 2,
  title: {
    show: false,
    height: 40,
    text: '',
    style: {
      fontSize: 15,
      color: '#000',
      fontFamily: 'Roboto',
    },
  },
  legend: {
    show: true,
    position: 'right',
    color: '#353740',
    inactive: '#aaa',
    width: 140,
    height: 24,
  },
  itemHighlight: true,
  seriesHighlight: true,
  useSelect: false,
  pie: {
    doughnutHoleSize: 0,
    stroke: {
      use: true,
      lineWidth: 2,
      color: '#FFFFFF',
    },
  },
  reverse: false,
  horizontal: false,
  width: '100%',
  height: '100%',
  thickness: 1,
  borderRadius: 0,
  combo: false,
  tooltip: {
    use: true,
    sortByValue: true,
    backgroundColor: '#4C4C4C',
    fontColor: '#FFFFFF',
    borderColor: '#666666',
    shadowOpacity: 0.25,
    useShadow: false,
    throttledMove: false,
    debouncedHide: false,
    useScrollbar: false,
    textOverflow: 'wrap',
  },
  indicator: {
    use: true,
    color: '#EE7F44',
  },
  maxTip: {
    use: false,
    fixedPosTop: false,
    showIndicator: false,
    indicatorColor: '#000000',
    tipBackground: '#000000',
    tipTextColor: '#FFFFFF',
  },
  selectItem: {
    use: false,
    showTextTip: false,
    showTip: false,
    showIndicator: false,
    fixedPosTop: false,
    useApproximateValue: false,
    indicatorColor: '#000000',
    tipBackground: '#000000',
    tipTextColor: '#FFFFFF',
  },
  dragSelection: {
    use: true,
    keepDisplay: true,
    fillColor: '#38acec',
    opacity: 0.65,
  },
};

const DEFAULT_DATA = {
  series: {},
  groups: [],
  labels: [],
  data: {},
};

export const useModel = () => {
  const { emit } = getCurrentInstance();

  const getNormalizedOptions = options => defaultsDeep({}, options, DEFAULT_OPTIONS);
  const getNormalizedData = data => defaultsDeep(data, DEFAULT_DATA);

  const eventListeners = {
    click: async (e) => {
      await nextTick();
      emit('click', e);
    },
    'dbl-click': async (e) => {
      await nextTick();
      emit('dbl-click', e);
    },
    'drag-select': async (e) => {
      await nextTick();
      emit('drag-select', e);
    },
  };

  return {
    eventListeners,
    getNormalizedData,
    getNormalizedOptions,
  };
};

export const useWrapper = (options) => {
  const wrapper = ref();

  const wrapperStyle = computed(() => {
    const getChartSize = (size) => {
      let sizeValue;

      if (size) {
        sizeValue = size.unit ? size.value + size.unit : `${size.value}px`;
      } else {
        sizeValue = undefined;
      }

      return sizeValue;
    };

    return {
      width: getChartSize(getQuantity(options.width)),
      height: getChartSize(getQuantity(options.height)),
    };
  });

  return {
    wrapper,
    wrapperStyle,
  };
};
