import { ref, reactive, computed, watch, getCurrentInstance, nextTick } from 'vue';
import { cloneDeep, defaultsDeep, isEqual } from 'lodash-es';
import { getQuantity } from '@/common/utils';

const DEFAULT_OPTIONS = {
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
  doughnutHoleSize: 0,
  reverse: false,
  horizontal: false,
  width: '100%',
  height: '100%',
  thickness: 1,
  combo: false,
  tooltip: {
    use: true,
    backgroundColor: '#4C4C4C',
    borderColor: '#666666',
    shadowOpacity: 0.25,
    useShadow: false,
    throttledMove: false,
    debouncedHide: false,
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
};

const DEFAULT_DATA = {
  series: {},
  groups: [],
  labels: [],
  data: {},
};

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const isInit = ref(false);
  const evChart = reactive({});

  const normalizedOptions = defaultsDeep({}, props.options, DEFAULT_OPTIONS);
  const normalizedData = defaultsDeep(props.data, DEFAULT_DATA);

  const eventListeners = {
    click: async (e) => {
      await nextTick();
      emit('click', e);
    },
    'dbl-click': async (e) => {
      await nextTick();
      emit('dbl-click', e);
    },
  };

  watch(() => props.options, (curr) => {
    const newOpt = defaultsDeep({}, curr, normalizedOptions);
    evChart.value.options = cloneDeep(newOpt);
    evChart.value.update({
      updateSeries: false,
      updateSelTip: { update: false, keepDomain: false },
    });
  }, { deep: true });

  watch(() => props.data, (curr) => {
    const newData = defaultsDeep({}, curr, normalizedData);
    const isUpdateSeries = !isEqual(newData.series, evChart.value.data.series);
    evChart.value.data = cloneDeep(newData);
    evChart.value.update({
      updateSeries: isUpdateSeries,
      updateSelTip: { update: true, keepDomain: false },
    });
  }, { deep: true });

  return {
    isInit,
    evChart,
    eventListeners,
    normalizedData,
    normalizedOptions,
  };
};

export const useWrapper = (param) => {
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
      width: getChartSize(getQuantity(param.width)),
      height: getChartSize(getQuantity(param.height)),
    };
  });

  return {
    wrapper,
    wrapperStyle,
  };
};

export const useAPI = (param) => {
  const forceUpdate = () => {
    console.log('forceUpdate');
    if (param.isInit.value) {
      param.evChart.value.update({
        updateSeries: false,
        updateSelTip: {
          update: false,
          keepDomain: false,
        },
      });
    }
  };

  const selectItemByLabel = label => param.evChart.selectItemByLabel(label);

  return {
    forceUpdate,
    selectItemByLabel,
  };
};
