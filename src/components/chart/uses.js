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
    type: 'icon',
    position: 'right',
    color: '#353740',
    inactive: '#aaa',
    width: 140,
    height: 24,
    allowResize: false,
    table: {
      use: false,
      columns: {
        name: {
          title: 'Name',
        },
        min: {
          title: 'MIN',
          use: false,
        },
        max: {
          title: 'MAX',
          use: false,
        },
        avg: {
          title: 'AVG',
          use: false,
        },
        total: {
          title: 'TOTAL',
          use: false,
        },
        last: {
          title: 'LAST',
          use: false,
        },
      },
    },
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
  cPadRatio: 0,
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
    fontFamily: 'Roboto',
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
    tipStyle: {
      height: 20,
      background: '#000000',
      textColor: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Roboto',
      fontWeight: 400,
    },
  },
  selectItem: {
    use: false,
    useClick: true,
    showTextTip: false,
    tipText: 'value',
    showTip: false,
    showIndicator: false,
    fixedPosTop: false,
    useApproximateValue: false,
    indicatorColor: '#000000',
    tipStyle: {
      height: 20,
      background: '#000000',
      textColor: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Roboto',
      fontWeight: 400,
    },
    useSeriesOpacity: false,
  },
  selectLabel: {
    use: false,
    useClick: true,
    limit: 1,
    useDeselectOverflow: false,
    showTip: false,
    useSeriesOpacity: true,
    useLabelOpacity: true,
    fixedPosTop: false,
    useApproximateValue: false,
    tipBackground: '#000000',
  },
  selectSeries: {
    use: false,
    useClick: true,
    limit: 1,
    useDeselectOverflow: false,
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
    categoryCnt: 1,
    stroke: {
      show: false,
      color: '#FFFFFF',
      lineWidth: 1,
      opacity: 1,
      radius: 0,
    },
    error: '#FF0000',
    decimalPoint: 0,
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
  const selectSeriesInfo = cloneDeep(props.selectedSeries);

  const eventListeners = {
    click: async (e) => {
      await nextTick();
      if (e.label) {
        emit('update:selectedItem', { seriesID: e.seriesId, dataIndex: e.dataIndex });
      }
      if (e.selected?.dataIndex) {
        emit('update:selectedLabel', { dataIndex: e.selected.dataIndex });
      }
      if (e.selected?.seriesId) {
        emit('update:selectedSeries', { seriesId: e.selected.seriesId });
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
    selectSeriesInfo,
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
