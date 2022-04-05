import { ref, computed, getCurrentInstance, nextTick } from 'vue';
import { cloneDeep, defaultsDeep } from 'lodash-es';
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
    allowResize: false,
  },
  itemHighlight: true,
  seriesHighlight: true,
  useSelect: false,
  doughnutHoleSize: 0,
  pieStroke: {
    use: true,
    lineWidth: 2,
    color: '#FFFFFF',
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
    tipText: 'value',
    showTip: false,
    showIndicator: false,
    fixedPosTop: false,
    useApproximateValue: false,
    indicatorColor: '#000000',
    tipBackground: '#000000',
    tipTextColor: '#FFFFFF',
    useSeriesOpacity: false,
  },
  selectLabel: {
    use: false,
    limit: 1,
    useDeselectOverflow: false,
    showTip: false,
    useSeriesOpacity: true,
    useLabelOpacity: true,
    fixedPosTop: false,
    useApproximateValue: false,
    tipBackground: '#000000',
  },
  dragSelection: {
    use: false,
    keepDisplay: true,
    fillColor: '#38ACEC',
    opacity: 0.65,
  },
  heatMapColor: {
    min: '#FFFFFF',
    max: '#0052FF',
    categoryCnt: 5,
    border: null,
    error: '#FF0000',
  },
};

const DEFAULT_DATA = {
  series: {},
  groups: [],
  labels: [],
  data: {},
};

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const getNormalizedOptions = (options) => {
    const normalizedOptions = defaultsDeep({}, options, DEFAULT_OPTIONS);

    if ((options.type === 'scatter' || options.type === 'heatMap') && !options?.tooltip) {
      normalizedOptions.tooltip.use = false;
    }

    if (options.type === 'pie' && !options?.padding) {
      normalizedOptions.padding = {
        top: 2,
        right: 2,
        left: 2,
        bottom: 4,
      };
}

    return normalizedOptions;
  };
  const getNormalizedData = data => defaultsDeep(data, DEFAULT_DATA);

  const selectItemInfo = cloneDeep(props.selectedItem);
  const selectLabelInfo = cloneDeep(props.selectedLabel);

  const eventListeners = {
    click: async (e) => {
      await nextTick();
      if (e.label) {
        emit('update:selectedItem', { seriesID: e.seriesId, dataIndex: e.dataIndex });
      }
      if (e.selected) {
        emit('update:selectedLabel', { dataIndex: e.selected.dataIndex });
      }
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
    selectItemInfo,
    selectLabelInfo,
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
