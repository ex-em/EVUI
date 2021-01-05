import { ref, reactive, watch, computed, onMounted, getCurrentInstance } from 'vue';
import { isEqual } from 'lodash-es';
import { convertToPercent } from '@/common/utils';
import { getValueCloseToStep } from '@/components/inputNumber/uses';

export const useModel = () => {
  const { props, emit } = getCurrentInstance();
  const currentValue = ref(props.modelValue);

  const state = reactive({
    isInit: false,
    dragging: false,
    handleType: null, // 'left', 'right', null
    leftValue: null,
    rightValue: null,
  });
  const slider = reactive({
    valueRange: null,
    stepList: [],
    markList: [],
    offset: {
      left: null,
      width: null,
    },
  });
  const sliderLine = ref();

  // tooltip format
  const formatValue = computed(() => {
    const tooltipFormat = props.tooltipFormat;
    const useFormat = tooltipFormat instanceof Function;
    return {
      left: useFormat ? tooltipFormat(state.leftValue) : state.leftValue,
      right: useFormat ? tooltipFormat(state.rightValue) : state.rightValue,
    };
  });

  const setHandleValue = (val) => {
    const optionObj = {
      min: props.min,
      max: props.max,
      step: props.step,
    };

    let leftVal;
    let rightVal;
    if (props.range && Array.isArray(val)) {
      leftVal = typeof val[0] === 'number' && !isNaN(val[0]) ? val[0] : props.min;
      rightVal = typeof val[1] === 'number' && !isNaN(val[1]) ? val[1] : props.min;

      state.leftValue = getValueCloseToStep(leftVal, optionObj);
      state.rightValue = getValueCloseToStep(rightVal, optionObj);
    } else {
      leftVal = props.min;
      rightVal = typeof val === 'number' && !isNaN(val) ? val : props.min;

      state.leftValue = getValueCloseToStep(leftVal, optionObj);
      state.rightValue = getValueCloseToStep(rightVal, optionObj);
    }
  };

  const setSliderValue = (val) => {
    if (slider.valueRange <= 0) {
      return;
    }

    setHandleValue(val);

    let result;
    if (props.range && Array.isArray(val)) {
      const minVal = Math.min(state.leftValue, state.rightValue);
      const maxVal = Math.max(state.leftValue, state.rightValue);
      result = [minVal, maxVal];
    } else {
      result = state.rightValue;
    }

    currentValue.value = result;
    emit('update:modelValue', result);
    emit('change', result);
  };

  const updateSliderInfo = () => {
    const sliderRect = sliderLine.value.getBoundingClientRect();
    slider.offset.left = sliderRect.left;
    slider.offset.width = sliderRect.width;
    slider.valueRange = props.max - props.min;
  };

  watch(() => props.modelValue, (curr, prev) => {
    if (curr
      && !isEqual(curr, prev)
      && !state.dragging
    ) {
      setHandleValue(curr);
      currentValue.value = curr;
    }
  });

  return {
    currentValue,
    state,
    slider,
    formatValue,
    sliderLine,
    updateSliderInfo,
    setSliderValue,
  };
};

export const useStyle = (params) => {
  const { props } = getCurrentInstance();
  const { state, slider } = params;
  const colorDefault = 'transparent';

  const leftHandleStyle = computed(() => ({
    left: slider.valueRange > 0 ? `${convertToPercent(state.leftValue - props.min, slider.valueRange)}%` : 0,
  }));
  const rightHandleStyle = computed(() => ({
    left: slider.valueRange > 0 ? `${convertToPercent(state.rightValue - props.min, slider.valueRange)}%` : 0,
  }));
  const handleBtnStyle = computed(() => {
    if (!props.color
      || (Array.isArray(props.color) && props.color.length !== 1)
    ) {
      return {};
    }
    return {
      borderColor: (typeof props.color === 'string' ? props.color : props.color[0]) || colorDefault,
    };
  });

  /**
   * Slider 색 칠하기 : props.color 갖고 있을 때
   * color 로 받은 값에 따라 왼쪽 부터 채워짐. 없을 경우 기본 색 = transparent
   * */
  const isColorArray = computed(() => props.color && Array.isArray(props.color));

  const rangeThumbStyle = computed(() => {
    const minVal = Math.min(state.leftValue, state.rightValue);
    const maxVal = Math.max(state.leftValue, state.rightValue);
    const mvRange = +(maxVal - minVal).toFixed(2);
    const leftPosX = (slider.valueRange > 0 && props.range)
      ? convertToPercent(+(minVal - props.min).toFixed(2), slider.valueRange) : 0;
    const thumbWidth = (mvRange > 0) ? convertToPercent(mvRange, slider.valueRange) : 0;

    const thumbColor = {};
    if (props.color) {
      if (typeof props.color === 'string'
        || (Array.isArray(props.color) && props.color.length === 1)
      ) {
        thumbColor.backgroundColor = (typeof props.color === 'string' ? props.color : props.color[0]) || colorDefault;
      } else if (Array.isArray(props.color) && props.color.length > 1) {
        thumbColor.backgroundColor = (props.range ? props.color[1] : props.color[0])
          || colorDefault;
      }
    }
    return {
      left: `${leftPosX}%`,
      width: `${thumbWidth}%`,
      ...thumbColor,
    };
  });

  const leftThumbStyle = computed(() => {
    if (
      !isColorArray.value
      || props.color.length < 2
      || !props.range
    ) {
      return {};
    }
    const minVal = Math.min(state.leftValue, state.rightValue);
    const thumbWidth = convertToPercent(Math.abs(minVal - props.min), slider.valueRange);
    return {
      width: `${thumbWidth}%`,
      backgroundColor: props.color[0] || colorDefault,
    };
  });

  const rightThumbStyle = computed(() => {
    if (!isColorArray.value || props.color.length < 2) {
      return {};
    }
    const maxVal = Math.max(state.leftValue, state.rightValue);
    const leftPosX = convertToPercent(+(maxVal - props.min).toFixed(2), slider.valueRange);
    const thumbWidth = convertToPercent(+(props.max - maxVal).toFixed(2), slider.valueRange);

    const lastIdx = !props.range ? props.color.length - 1 : 2;
    return {
      left: `${leftPosX}%`,
      width: `${thumbWidth}%`,
      backgroundColor: props.color[lastIdx] || colorDefault,
    };
  });

  return {
    isColorArray,
    leftHandleStyle,
    rightHandleStyle,
    handleBtnStyle,
    rangeThumbStyle,
    leftThumbStyle,
    rightThumbStyle,
  };
};

export const useEvent = (params) => {
  const { props } = getCurrentInstance();
  const { currentValue, state, slider, updateSliderInfo, setSliderValue } = params;

  const getSelectedValue = (e) => {
    if (!state.dragging) {
      updateSliderInfo();
    }

    const currentOffsetX = e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
    const { valueRange, offset } = slider;
    let clickedValue = props.min + ((currentOffsetX - offset.left) * valueRange) / offset.width;

    if (clickedValue < props.min) {
      clickedValue = props.min;
    } else if (clickedValue > props.max) {
      clickedValue = props.max;
    }

    return clickedValue;
  };

  const clickSlider = (e) => {
    if (props.readonly || props.disabled || state.dragging) {
      return;
    }

    const selectedValue = getSelectedValue(e);
    let convertValue;
    if (props.range) {
      const minValue = Math.min(state.leftValue, state.rightValue);
      const rangeHalfValue = minValue + Math.abs((state.rightValue - state.leftValue) / 2);
      const isReverse = state.leftValue > state.rightValue;

      if (selectedValue < rangeHalfValue) {
        state.handleType = isReverse ? 'right' : 'left';
      } else {
        state.handleType = isReverse ? 'left' : 'right';
      }
      convertValue = state.handleType === 'left' ? [selectedValue, state.rightValue] : [state.leftValue, selectedValue];
    } else {
      state.handleType = 'right';
      convertValue = selectedValue;
    }

    setSliderValue(convertValue);
  };

  const onDrag = (e) => {
    const selectedValue = getSelectedValue(e);
    state.dragging = true;

    let convertValue;
    if (props.range) {
      convertValue = state.handleType === 'left' ? [selectedValue, state.rightValue] : [state.leftValue, selectedValue];
    } else {
      convertValue = selectedValue;
    }

    setSliderValue(convertValue);
  };
  const endDrag = () => {
    state.handleType = null;
    state.dragging = false;
    document.body.style.cursor = '';

    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchend', endDrag);
  };
  const startDrag = (handleType) => {
    if (props.readonly || props.disabled) {
      return;
    }
    state.handleType = handleType;
    document.body.style.cursor = 'grabbing';

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  };

  const changeInput = (val, type) => {
    if (props.showInput && !state.dragging && state.isInit) {
      if (props.range && Array.isArray(currentValue.value)) {
        const result = type === 'left' ? [val, currentValue.value[1]] : [currentValue.value[0], val];
        setSliderValue(result);
      } else if (!props.range) {
        setSliderValue(val);
      }
    }
  };
  return {
    startDrag,
    clickSlider,
    changeInput,
  };
};

export const useInit = (params) => {
  const { props, emit } = getCurrentInstance();
  const { currentValue, state, slider, updateSliderInfo, setSliderValue } = params;

  const validateProps = () => {
    const hasMaxProps = props.max || props.max === 0;
    const hasMinProps = props.min || props.min === 0;
    if (hasMaxProps && hasMinProps) {
      if (props.max <= props.min) {
        console.warn('[EVUI][Slider] Max value must be greater than min value.');
      }
    }
  };
  const initValue = () => {
    updateSliderInfo();

    if (slider.valueRange <= 0) {
      currentValue.value = props.range ? [props.min, props.min] : props.min;
      emit('update:modelValue', currentValue.value);
    }
    setSliderValue(currentValue.value);
    state.isInit = true;
  };

  const initStepList = () => {
    if (!props.showStep) {
      return;
    }
    // step은 이동 단위 기준으로, 입력값에 따라 클릭 및 드레그 시 이동 단위를 나타냄
    const stepCount = slider.valueRange / props.step;
    const stepWidth = convertToPercent(props.step, slider.valueRange);
    const result = [];
    for (let ix = 1; ix < stepCount; ix++) {
      result.push(ix * stepWidth);
    }
    slider.stepList = result;
  };

  const initMarkList = () => {
    if (!props.mark || !Object.keys(props.mark).length) {
      return;
    }
    const getResultList = (obj, type = 'value') => {
      if (!obj) {
        return [];
      }
      const style = props.mark.style && (typeof props.mark.style === 'object') ? props.mark.style : {};
      const keyList = Object.keys(obj);
      const resultList = [];
      let markVal;
      for (let ix = 0; ix < keyList.length; ix++) {
        markVal = +keyList[ix];
        if (!isNaN(markVal)) {
          resultList.push({
            posX: type === 'value' ? convertToPercent(markVal, slider.valueRange) : markVal,
            label: obj[markVal],
            style,
          });
        }
      }
      return resultList;
    };

    const hasListOption = props.mark.value || props.mark.percent;
    if (!hasListOption) {
      slider.markList = getResultList(props.mark);
    } else {
      slider.markList = [
        ...getResultList(props.mark.value),
        ...getResultList(props.mark.percent, 'percent'),
      ];
    }
  };

  onMounted(() => {
    validateProps();
    initValue();
    initStepList();
    initMarkList();
  });
};
