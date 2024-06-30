import { ref, watch, onBeforeMount, getCurrentInstance } from 'vue';
import { getPrecision } from '@/common/utils';

/**
 * step 사용 시, up-down 및 값 입력할 때 step에 해당하는 값 반환
 * @param val - 현재값
 * @param { min, max, step } - 현재 컴포넌트의 최소값, 최대값, step 값
 *                           - inputNumber, slider 컴포넌트 공통 사용
 * @return number - 입력된 val에 가까운 step 값 반환
 * */
export function getValueCloseToStep(val, { min, max, step }) {
  const quotient = Math.floor((val - min) / step); // 몫
  const remainder = (val - min) % step; // 나머지
  const maxQuotient = Math.floor((max - min) / step);
  const maxPrecision = Math.max(getPrecision(step), getPrecision(min));
  let preventStep = false;
  /**
   * 클릭 & 드래그 & 입력한 값이 step 범위의 절반 보다 클 경우 한 스텝 위의 값
   * 작을 경우 한 스텝 아래의 값으로 설정
   * maxPrecision: 소수 자리수 확인
   */
  let result;
  if (maxPrecision) {
    // 소수점 값일 경우
    let multipleValue = +parseFloat(step * quotient).toFixed(maxPrecision);
    result = +(multipleValue + min).toFixed(maxPrecision);
    preventStep = quotient === maxQuotient
      && +(max - result).toFixed(maxPrecision) !== step;

    if (remainder > (step / 2) && !preventStep) {
      result = +(result + step).toFixed(maxPrecision);
    }
    if (result > max) {
      multipleValue = +parseFloat(step * maxQuotient).toFixed(maxPrecision);
      result = +(multipleValue + min).toFixed(maxPrecision);
    } else if (result < min) {
      result = min;
    }
  } else {
    // 소수점 아닐 경우
    result = (step * quotient) + min;
    preventStep = quotient === maxQuotient && (max - result) !== step;
    if (remainder > (step / 2) && !preventStep) {
      result += step;
    }
    if (result > max) {
      result = (step * maxQuotient) + min;
    } else if (result < min) {
      result = min;
    }
  }

  return result;
}

export function useModel() {
  const { props, emit } = getCurrentInstance();
  const currentValue = ref(props.modelValue);
  const previousValue = ref(props.modelValue);

  /**
   * 고정 소수점 사용 시, 해당하는 소수점 값 반환
   * */
  const getPrecisionValue = val => (
    props.precision && (val || val === 0) ? Number(val).toFixed(props.precision) : val
  );

  /**
   * input 값 validate
   * @param val - input 현재 값
   * */
  const validateValue = (val) => {
    let result = val;

    if (!val && val !== 0) {
      // 값이 없을 경우
      result = props.stepStrictly ? previousValue.value : null;
    } else if (isNaN(val)) {
      // 숫자 아닐 경우 - 문자열 들어 왔을 경우
      result = previousValue.value;
    } else if (props.stepStrictly) {
      // step 유지
      if (props.min === -Infinity) {
        props.min = 0;
      }
      result = getValueCloseToStep(val, {
        min: props.min,
        max: props.max,
        step: props.step,
      });
    } else if ((props.min || props.min === 0)
      && result < props.min
    ) {
      // 최소값보다 작을 경우
      result = props.min;
    } else if ((props.max || props.max === 0)
      && result > props.max
    ) {
      // 최대값보다 클 경우
      result = props.max;
    } else {
      result = +result;
    }

    currentValue.value = getPrecisionValue(result);
    previousValue.value = getPrecisionValue(result);
    emit('update:modelValue', result);
    emit('change', result);
  };

  // input 이벤트 발생 시
  const focusInput = (e) => {
    emit('focus', e);
  };
  const blurInput = (e) => {
    emit('blur', e);
  };
  const changeMv = (e) => {
    validateValue(e.target.value);
  };

  watch(() => props.modelValue, (curr, prev) => {
    if (curr !== prev) {
      currentValue.value = getPrecisionValue(curr);
    }
  });

  return {
    currentValue,
    validateValue,
    focusInput,
    blurInput,
    changeMv,
  };
}
export function useStep(params) {
  const { props } = getCurrentInstance();
  const { currentValue, validateValue } = params;

  /**
   * 화살표 및 키보드 방향키 통해 값 up-down할 경우
   * @param type - 'up', 'down'
   * */
  const stepValue = (type) => {
    if (props.readonly || props.disabled) {
      return;
    }

    let result;
    if (!currentValue.value && currentValue.value !== 0) {
      result = props.min === -Infinity ? 0 : props.min;
    } else {
      const newValue = +currentValue.value;
      const convertedStep = type === 'up' ? props.step : props.step * -1;
      const maxPrecision = Math.max(getPrecision(newValue), getPrecision(props.step));
      const squaredValue = 10 ** maxPrecision;
      result = (Math.round(newValue * squaredValue)
        + Math.round(convertedStep * squaredValue)) / squaredValue;
    }

    if (result >= props.min && result <= props.max) {
      validateValue(result);
    }
  };

  return {
    stepValue,
  };
}
export function useInit(params) {
  const { props } = getCurrentInstance();
  const { currentValue, validateValue } = params;
  const hasMaxProps = props.max || props.max === 0;
  const hasMinProps = props.min || props.min === 0;

  /**
   * props validate
   * */
  const validateProps = () => {
    if (hasMaxProps && hasMinProps) {
      if (props.max <= props.min) {
        console.warn('[EVUI][InputNumber] Max value must be greater than min value.');
      }
    }

    if (props.step && (props.precision || props.precision === 0)) {
      if (getPrecision(props.step) > props.precision) {
        console.warn('[EVUI][InputNumber] It cannot be calculated because the step is smaller than the precision setting.');
      }
    }
  };

  /**
   * 초기 modelValue 값 사용자 입력 시 validate
   * */
  const initValue = () => {
    let modelValue = currentValue.value;

    if (isNaN(currentValue.value)) {
      modelValue = 0;
    }

    if (modelValue || modelValue === 0) {
      if (hasMaxProps && modelValue > props.max) {
        modelValue = props.max;
      } else if (hasMinProps && modelValue < props.min) {
        modelValue = props.min;
      }
    }
    validateValue(modelValue);
  };

  onBeforeMount(() => {
    validateProps();
    initValue();
  });
}
