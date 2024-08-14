import {
  ref,
  reactive,
  computed,
  watch,
  getCurrentInstance,
  nextTick,
  onUpdated,
} from 'vue';
import { cloneDeep, defaultsDeep, isEqual } from 'lodash-es';
import { getQuantity } from '@/common/utils';
import EvChartZoom from '@/components/chart/chartZoom.core';

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
  overlapping: {
    use: false,
  },
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
    colorShape: 'rect',
    fontSize: {
      title: 16,
      contents: 14,
    },
    rowPadding: {
      top: 0,
      bottom: 3,
      right: 20,
      left: 16,
    },
    showHeader: true,
  },
  indicator: {
    use: true,
    color: '#EE7F44',
    segments: null,
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
    useDeselectItem: false,
    showBorder: false,
    borderStyle: {
      color: '#FFFFFF',
      lineWidth: 1,
      opacity: 1,
      radius: 0,
    },
  },
  selectLabel: {
    use: false,
    useClick: true,
    tipText: 'value',
    limit: 1,
    useDeselectOverflow: false,
    showTip: false,
    useSeriesOpacity: true,
    useLabelOpacity: true,
    fixedPosTop: false,
    useApproximateValue: false,
    tipBackground: '#000000',
    indicatorColor: '#000000',
    tipStyle: {
      height: 20,
      background: '#000000',
      textColor: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Roboto',
      fontWeight: 400,
    },
    showTextTip: false,
    showIndicator: false,
    useBothAxis: false,
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
    size: 50,
    fillColor: '#38ACEC',
    opacity: 0.65,
  },
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
  heatMapColor: {
    min: '#FFFFFF',
    max: '#0052FF',
    rangeCount: 1,
    colorsByRange: [],
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

export const useModel = (injectGroupSelectedLabel, injectGroupHoveredLabel) => {
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
  const selectLabelInfo = cloneDeep(props.selectedLabel ?? injectGroupSelectedLabel?.value);
  const selectSeriesInfo = cloneDeep(props.selectedSeries);

  const eventListeners = {
    click: async (e) => {
      await nextTick();
      const { seriesId, dataIndex, eventTarget, targetAxis } = e?.selected ?? {};
      const { eventTarget: deselectedEventTarget } = e?.deselected ?? {};

      switch (eventTarget) {
        case 'item': {
          if (seriesId !== null) {
            emit('update:selectedItem', {
              seriesID: seriesId,
              dataIndex,
            });
            if (deselectedEventTarget === 'label') {
              emit('update:selectedLabel', { dataIndex: [] });
            }
          } else {
            emit('update:selectedItem', null);
          }
          break;
        }

        case 'label': {
          if (injectGroupSelectedLabel?.value) {
            injectGroupSelectedLabel.value.dataIndex = dataIndex;
          } else {
            emit('update:selectedLabel', {
              dataIndex,
              targetAxis,
            });

            if (deselectedEventTarget === 'item') {
              emit('update:selectedItem', null);
            }
          }
          break;
        }

        case 'series': {
          emit('update:selectedSeries', { seriesId });
          break;
        }

        default:
          break;
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
    'mouse-move': async (e) => {
      if (injectGroupHoveredLabel?.value) {
        injectGroupHoveredLabel.value = e.hoveredLabel;
      }
      await nextTick();
      emit('mouse-move', e);
    },
    'mouse-leave': () => {
      if (injectGroupHoveredLabel?.value) {
        injectGroupHoveredLabel.value.label = null;
      }
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

export const useZoomModel = (
  evChartNormalizedOptions,
  { wrapper: evChartWrapper, evChartGroupRef },
  selectedLabelOrItem,
  evChartPropsInGroup,
) => {
  const { props, emit } = getCurrentInstance();

  const isExecuteZoom = ref(false);
  const isUseZoomMode = ref(false);
  const isUpdateDataForUseZoom = ref(true);
  const evChartToolbarRef = ref();

  const evChartZoomOptions = reactive({ zoom: evChartNormalizedOptions.zoom });
  const brushIdx = reactive({
    start: 0,
    end: -1,
    isUseButton: false,
    isUseScroll: false,
  });

  let evChartZoom = null;
  const evChartInfo = reactive({
    dom: [],
    props: {
      data: [],
      options: [],
    },
  });
  const evChartClone = reactive({ data: null, options: null });
  const brushChartIdx = ref([]);

  const getRangeInfo = (zoomInfo) => {
    if (zoomInfo.data.length && zoomInfo.range && isUseZoomMode.value) {
      evChartZoom.dragZoom(zoomInfo);
    }
  };

  const setEvChartOptions = () => {
    evChartInfo.props.options.forEach((option, idx) => {
      option.zoom = {
        ...option.zoom,
        use: isUseZoomMode.value,
        getRangeInfo,
      };

      if (isUseZoomMode.value) {
        option.dragSelection = {
          ...option.dragSelection,
          use: true,
          keepDisplay: false,
        };
      } else {
        const {
          use: originUseOption,
          keepDisplay: originKeepDisplayOption,
        } = evChartClone.options[idx].dragSelection ?? {};

        option.dragSelection = {
          use: !!originUseOption,
          keepDisplay: !!originKeepDisplayOption,
        };
      }
    });
  };

  const createEvChartZoom = () => {
    if (evChartGroupRef?.value) {
      evChartInfo.dom = evChartGroupRef.value.querySelectorAll('.ev-chart-container');

      if (evChartInfo.dom.length) {
        evChartPropsInGroup.value.forEach(({ data, options }, idx) => {
          data.chartIdx = idx;

          evChartInfo.props.data.push(data);
          evChartInfo.props.options.push(options);

          brushChartIdx.value.push(idx);
        });
      }
    } else {
      evChartInfo.dom = [evChartWrapper.value.querySelector('.ev-chart-container')];
      evChartInfo.props.data.push(props.data);
      evChartInfo.props.options.push(props.options);
    }

    if (evChartInfo.props.data.length) {
      evChartClone.data = cloneDeep(evChartInfo.props.data);
      evChartClone.options = cloneDeep(evChartInfo.props.options);

      const emitFunc = {
        updateZoomStartIdx: startIdx => emit('update:zoomStartIdx', startIdx),
        updateZoomEndIdx: endIdx => emit('update:zoomEndIdx', endIdx),
      };

      evChartZoom = new EvChartZoom(
        evChartInfo,
        evChartClone,
        evChartZoomOptions,
        evChartToolbarRef.value,
        isExecuteZoom,
        brushIdx,
        emitFunc,
      );
    }
  };

  const toggleUseZoom = (target) => {
    if (evChartClone.data[0].labels.length <= 1) {
      return;
    }

    isUseZoomMode.value = !isUseZoomMode.value;

    if (target) {
      target.classList.toggle('active');
    } else {
      const dragZoomIcon = evChartToolbarRef.value.querySelector('.dragZoom');

      dragZoomIcon.classList.toggle('active');
    }

    setEvChartOptions();

    evChartZoom.setIconStyle(isUseZoomMode.value);
    evChartZoom.setEventListener(isUseZoomMode.value);
  };

  const onClickToolbar = (e, iconType) => {
    if (!evChartZoom.isAnimationFinish) {
      return;
    }

    switch (iconType) {
      case 'dragZoom':
        toggleUseZoom(e.target);
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

  onUpdated(() => {
    if (evChartZoom && evChartToolbarRef.value) {
      evChartZoom.setIcon(evChartToolbarRef.value);
    }
  });

  const setOptionsForUseZoom = (newOpt) => {
    const isUpdateZoomOptions = !isEqual(newOpt.zoom, evChartZoomOptions.zoom);

    if (isUpdateZoomOptions) {
      evChartZoomOptions.zoom = newOpt.zoom;

      if (evChartZoom) {
        if (!evChartZoomOptions.zoom.toolbar.show && isUseZoomMode.value) {
          toggleUseZoom();
        }

        evChartZoom.setEvChartZoomOptions(evChartZoomOptions.zoom);
      } else if (evChartZoomOptions.zoom.toolbar.show && !evChartGroupRef) {
        createEvChartZoom();
      }
    }
  };

  const setDataForUseZoom = (newData) => {
    if (isUpdateDataForUseZoom.value) {
      if (!isExecuteZoom.value) {
        evChartClone.data = evChartGroupRef ? cloneDeep(newData) : [cloneDeep(newData)];

        if (evChartZoomOptions.zoom.keepZoomStatus) {
          isUpdateDataForUseZoom.value = false;
        } else {
          isUseZoomMode.value = false;

          setEvChartOptions();
        }

        if (evChartZoom) {
          evChartZoom.updateEvChartCloneData(
            evChartClone,
            brushChartIdx,
            isUseZoomMode.value,
            evChartZoomOptions.zoom.keepZoomStatus,
          );
        }
      }

      isExecuteZoom.value = false;
    } else {
      isUpdateDataForUseZoom.value = true;
    }
  };

  const controlZoomIdx = (zoomStartIdx, zoomEndIdx) => {
    if (evChartZoom.isUseToolbar) {
        evChartZoom.isUseToolbar = false;
        return;
    }

    if (isUseZoomMode.value) {
      evChartZoom.executeZoom(zoomStartIdx, zoomEndIdx);
      evChartZoom.setZoomAreaMemory(zoomStartIdx, zoomEndIdx);
    }
  };

  watch(() => [
    brushIdx.start,
    brushIdx.end,
  ], ([
    curBrushStartIdx,
    curBrushEndIdx,
  ], [
    prevBrushStartIdx,
  ]) => {
    if (selectedLabelOrItem?.value) {
      if (typeof selectedLabelOrItem.value.dataIndex === 'number') {
        if (curBrushStartIdx >= (prevBrushStartIdx ?? 0)) {
          selectedLabelOrItem.value.dataIndex -= curBrushStartIdx - (prevBrushStartIdx ?? 0);
        } else {
          selectedLabelOrItem.value.dataIndex += prevBrushStartIdx - curBrushStartIdx;
        }
      } else {
        for (let idx = 0; idx < selectedLabelOrItem.value.dataIndex.length; idx++) {
          if (curBrushStartIdx >= (prevBrushStartIdx ?? 0)) {
            selectedLabelOrItem.value.dataIndex[idx] -= curBrushStartIdx - (prevBrushStartIdx ?? 0);
          } else {
            selectedLabelOrItem.value.dataIndex[idx] += prevBrushStartIdx - curBrushStartIdx;
          }
        }
      }
    }

    if (brushIdx.isUseButton || brushIdx.isUseScroll) {
      evChartZoom.executeZoom(curBrushStartIdx, curBrushEndIdx);
    }
  });

  watch(() => [
    brushIdx.isUseButton,
    brushIdx.isUseScroll,
  ], ([
    curIsUseButton,
    curIsUseScroll,
  ], [
    prevIsUseButton,
    prevIsUseScroll,
  ]) => {
    if (prevIsUseButton && !curIsUseButton) {
      evChartZoom.setZoomAreaMemory(brushIdx.start, brushIdx.end);
    } else if (prevIsUseScroll && !curIsUseScroll) {
      evChartZoom.zoomAreaMemory.current[0] = [brushIdx.start, brushIdx.end];
    }
  });

  return {
    evChartZoomOptions,
    evChartInfo,
    evChartToolbarRef,
    evChartClone,
    brushIdx,

    createEvChartZoom,
    setOptionsForUseZoom,
    setDataForUseZoom,
    controlZoomIdx,
    onClickToolbar,
  };
};
