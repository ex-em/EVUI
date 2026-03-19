import { truthyNumber } from '@/common/utils';
import Scale from './scale';
import Util from '../helpers/helpers.util';
import { NICE_FRACTIONS } from '../helpers/helpers.constant';

class LinearScale extends Scale {
  /**
   * Transforming label by designated format
   * @param {number} value                   label value
   * @param {object} data                   data for formatting
   *
   * @returns {string} formatted label
   */
  getTruthyValue(value) {
    const decimalPoint = this.adjustedDecimalPoint ?? this.decimalPoint;
    return truthyNumber(value) ? Number(value.toFixed(decimalPoint)) : value;
  }

  getLabelFormat(value, data = {}) {
    if (this.formatter) {
      const currentDecimalPointValue = this.getTruthyValue(value);

      const formattedLabel = this.formatter(currentDecimalPointValue, {
        ...data,
        prevOriginalValue: data?.prev,
        prevDecimalPointValue: this.getTruthyValue(data?.prev),
        currentOriginalValue: value,
        currentDecimalPointValue,
      });

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

    const decimalPoint = this.adjustedDecimalPoint ?? this.decimalPoint;
    return Util.labelSignFormat(value, decimalPoint);
  }

  /**
   * Calculate interval
   * @param {object} range    range information
   *
   * @returns {number}  interval (한 칸에 표시할 값의 간격)
   */
  getInterval(range) {
    if (this.interval) return this.interval;

    let _interval = 0;

    const max = range.maxValue;
    const min = range.minValue;
    const steps = range.maxSteps;

    // step이 0이면 interval 계산 불가
    if (!steps || steps <= 0) return 0;

    // startToZero이고, 최소값이 음수일 경우 0을 반드시 포함
    if (this.startToZero && min < 0) {
      const totalRange = Math.abs(min) + Math.abs(max);

      // 비율로 나눔
      const negativeRatio = Math.abs(min) / totalRange;
      const positiveRatio = Math.abs(max) / totalRange;

      // 각 방향에 최소 1칸 이상 배정되도록 보장
      let negativeSteps = Math.max(1, Math.round(negativeRatio * steps));
      let positiveSteps = Math.max(1, steps - negativeSteps);

      // 다시 합이 steps보다 커질 수도 있으니, 조정
      if (negativeSteps + positiveSteps > steps) {
        // 가장 큰 쪽에서 하나 줄임
        if (negativeRatio > positiveRatio) {
          negativeSteps -= 1;
        } else {
          positiveSteps -= 1;
        }
      }

      _interval = Math.max(
        Math.abs(min) / (negativeSteps || 1),
        Math.abs(max) / (positiveSteps || 1),
      );
    } else {
      _interval = (max - min) / steps;
    }

    return this.decimalPoint ? _interval : Math.ceil(_interval);
  }

  /**
   * 주어진 값에 대한 적절한 간격을 계산합니다.
   * @param value - 계산할 값 (양수, 음수 모두 가능)
   * @returns 계산된 간격 값 (유효하지 않은 경우 0 반환)
   */
  getNiceInterval(value) {
    if (!Number.isFinite(value) || value === 0) return 0;

    // 절댓값을 사용하여 nice step 계산
    const absValue = Math.abs(value);
    const exponent = Math.floor(Math.log10(absValue));
    const normalized = absValue / 10 ** exponent;

    let fraction = 10;
    for (let i = 0; i < NICE_FRACTIONS.length; i++) {
      if (NICE_FRACTIONS[i] >= normalized) {
        fraction = NICE_FRACTIONS[i];
        break;
      }
    }

    const niceInterval = fraction * 10 ** exponent;
    // 원래 값의 부호 유지 (음수면 음수, 양수면 양수)
    return value < 0 ? -niceInterval : niceInterval;
  }

  /** 
   * user range를 사용하지 않을때 nice scale 계산
   * graph MIN / MAX 를 조정할 수 있다.
   * @param {number} max
   * @param {number} min
   * @param {number} maxSteps
   * @returns {object}
   */
  getStepsWithNiceScale({ max, min, maxSteps }) {
    let bestMaxValue = max;
    let bestMinValue = min;
    let bestInterval = 0;
    let bestSteps = 0;
    let bestOvershootAmount = Infinity;
  
    const minSegments = Math.max(1, maxSteps - 1);
    const maxSegments = maxSteps + 1;
  
    for (let segments = minSegments; segments <= maxSegments; segments++) {
      const rawStep = (max - min) / segments;
      const niceInterval = this.getNiceInterval(rawStep);
  
      if (niceInterval > 0) {
        const niceMin = Math.floor(min / niceInterval) * niceInterval;
        const candidateMax = niceMin + niceInterval * segments;
  
        if (candidateMax >= max) {
          const minOvershoot = min - niceMin;
          const maxOvershoot = candidateMax - max;
          const totalOvershoot = minOvershoot + maxOvershoot;
  
          if (totalOvershoot < bestOvershootAmount) {
            bestMaxValue = candidateMax;
            bestMinValue = niceMin;
            bestInterval = niceInterval;
            bestSteps = segments;
            bestOvershootAmount = totalOvershoot;
          }
        }
      }
    }
  
    if (!(bestInterval > 0) || bestSteps <= 0) {
      const fallbackSteps = Math.max(1, maxSteps);
      const fallbackInterval = (max - min) / fallbackSteps || 1;
  
      return {
        max,
        min,
        interval: fallbackInterval,
        steps: fallbackSteps,
      };
    }
  
    return {
      max: bestMaxValue,
      min: bestMinValue,
      interval: bestInterval,
      steps: bestSteps,
    };
  }

  /**
   * graphRange와 step 수를 기반으로 필요한 소수점 자릿수를 계산
   * @param {object} params
   * @param {number} params.graphRange
   * @param {number} params.numberOfSteps
   * @returns {number} decimal places (0 이상)
   */
  getDecimalPointFromRange({ graphRange, numberOfSteps }) {
    if (
      !Number.isFinite(graphRange) ||
      !Number.isFinite(numberOfSteps) ||
      graphRange <= 0 ||
      numberOfSteps <= 0
    ) {
      return 0;
    }

    const interval = graphRange / numberOfSteps;

    if (!Number.isFinite(interval) || interval === 0) {
      return 0;
    }

    const absInterval = Math.abs(interval);

    // 1 이상이면 소수점 불필요
    if (absInterval >= 1) {
      return 0;
    }

    // 소수점 자리 계산 (최대 10자리 제한)
    let decimals = 0;
    let temp = absInterval;

    while (temp < 1 && decimals < 10) {
      temp *= 10;
      decimals += 1;
    }

    return decimals;
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { minValue, maxValue } = range;
    const maxSteps = Math.max(1, range.maxSteps ?? 1);
  
    const hasUserRange =
      Array.isArray(this.range) && this.range.length === 2;
  
    const hasUserInterval =
      typeof this.interval === 'number' ||
      (typeof this.interval === 'object' && this.interval !== null);
  
    const resolvedInterval = hasUserInterval
      ? this.getInterval(range)
      : null;
  
    const isValidInterval =
      resolvedInterval != null &&
      resolvedInterval > 0 &&
      Number.isFinite(resolvedInterval);
  
    const userMin = hasUserRange ? +this.range[0] : null;
    const userMax = hasUserRange ? +this.range[1] : null;
  
    const EPS = 1e-10;
  
    const setDecimal = (graphRange, steps, interval) => {
      if (this.decimalPoint === 'auto') {
        const decimalFromRange = this?.getDecimalPointFromRange?.({
          graphRange,
          numberOfSteps: steps,
        });
  
        if (
          decimalFromRange != null &&
          !Number.isNaN(decimalFromRange)
        ) {
          this.adjustedDecimalPoint = decimalFromRange;
        } else if (typeof this.getAutoDecimalPointFromInterval === 'function') {
          this.adjustedDecimalPoint =
            this.getAutoDecimalPointFromInterval(interval);
        } else {
          this.adjustedDecimalPoint = 0;
        }
      } else {
        this.adjustedDecimalPoint = this.decimalPoint;
      }
    };
  
    const safeSteps = (graphRange, interval) => Math.max(1, Math.round((graphRange / interval) + EPS));
  
    const expandByInterval = ({ min, max, interval }) => {
      let graphMin = 0;
      let graphMax = 0;
  
      if (min >= 0) {
        graphMin = +min;
        graphMax = Math.ceil(max / interval) * interval;
      } else if (max >= 0) {
        graphMin = Math.floor(min / interval) * interval;
        graphMax = Math.ceil(max / interval) * interval;
      } else {
        graphMax = +max;
        graphMin = Math.floor(min / interval) * interval;
      }
  
      return { graphMin, graphMax };
    };
  
    /**
     * 1) userRange + userInterval
     * 호환되면 그대로 사용
     * 아니면 userRange only 로직으로 fallback
     */
    if (hasUserRange && isValidInterval) {
      const graphMin = userMin;
      const graphMax = userMax;
      const interval = resolvedInterval;
      const graphRange = graphMax - graphMin;
      const rawSteps = graphRange / interval;
      const isCompatible =
        Math.abs(rawSteps - Math.round(rawSteps)) < EPS;
  
      if (isCompatible && this.fixedSteps) {
        const steps = Math.round(rawSteps);
        setDecimal(graphRange, steps, interval);
        return {
          steps,
          interval,
          graphMin,
          graphMax,
        };
      }
    }
  
    /**
     * 2) userRange only
     * niceScale 사용 안 함
     * startToZero도 적용 안 함
     */
    if (hasUserRange) {
      const graphMin = userMin;
      const graphMax = userMax;
      const graphRange = graphMax - graphMin;
      const steps = maxSteps;
      const interval = graphRange / steps;
  
      setDecimal(graphRange, steps, interval);
  
      return {
        steps,
        interval,
        graphMin,
        graphMax,
      };
    }
  
    /**
     * 3) userInterval only
     * interval을 힌트로 사용, 너무 촘촘하면 2배씩 증가
     * niceScale 사용 안 함
     * startToZero도 적용 안 함
     */
    if (isValidInterval) {
      let interval = resolvedInterval;
      let graphMin = 0;
      let graphMax = 0;
      let graphRange = 0;
      let steps = 0;
  
      ({ graphMin, graphMax } = expandByInterval({
        min: minValue,
        max: maxValue,
        interval,
      }));
      graphRange = graphMax - graphMin;
      steps = safeSteps(graphRange, interval);
  
      while (steps > maxSteps) {
        interval *= 2;
  
        ({ graphMin, graphMax } = expandByInterval({
          min: minValue,
          max: maxValue,
          interval,
        }));
        graphRange = graphMax - graphMin;
        steps = safeSteps(graphRange, interval);
      }
  
      setDecimal(graphRange, steps, interval);
  
      return {
        steps,
        interval,
        graphMin,
        graphMax,
      };
    }
  
    /**
     * 4) auto
     * niceScale 사용
     */
    const normalizedMin =
      this.startToZero && minValue >= 0 ? 0 : minValue;
  
    const normalizedMax =
      this.startToZero && maxValue <= 0 ? 0 : maxValue;
  
    const nice = this.getStepsWithNiceScale({
      min: normalizedMin,
      max: normalizedMax,
      maxSteps,
    });
  
    setDecimal(
      nice.max - nice.min,
      nice.steps,
      nice.interval,
    );
  
    return {
      steps: nice.steps,
      interval: nice.interval,
      graphMin: nice.min,
      graphMax: nice.max,
    };
  }

  /**
   * Calculate min/max value, label and size information for axis
   * @param {object} minMax    min/max information
   * @param {object} scrollbarOpt scrollbar option
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax, scrollbarOpt) {
    let maxValue;
    let minValue;
    let isDefaultMaxSameAsMin = false;

    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    if (Array.isArray(range) && range?.length === 2) {
      if (this.options.type === 'heatMap') {
        maxValue = range[1] > +minMax.max ? +minMax.max : range[1];
        minValue = range[0] < +minMax.min ? +minMax.min : range[0];
      } else {
        maxValue = range[1];
        minValue = range[0];
      }
    } else if (typeof range === 'function') {
      [minValue, maxValue] = range(minMax.min, minMax.max);
    } else {
      maxValue = minMax.max;
      minValue = minMax.min;
    }

    // autoScaleRatio 적용 케이스
    if (this.autoScaleRatio) {
      const temp = maxValue;
      // 양수 방향에만 autoScaleRatio 적용
      const _maxValue = maxValue * (this.autoScaleRatio + 1);
      maxValue = this.decimalPoint ? _maxValue : Math.ceil(_maxValue);

      if (maxValue > 0 && minValue < 0) {
        // 양수/음수 혼합 케이스 -- 음수 방향에도 maxValue 증가분만큼 더하기
        const diff = temp - maxValue;
        minValue += diff;
      } else if (maxValue < 0 && minValue < 0) {
        // 전부 음수 케이스 -- 음수 방향에도 autoScaleRatio 적용
        const _minValue = minValue * (this.autoScaleRatio + 1);
        minValue = this.decimalPoint ? _minValue : Math.ceil(_minValue);
      }
    }

    // 0 기준 축 설정 케이스
    if (this.startToZero) {
      if (minValue > 0) {
        minValue = 0;
      }

      if (maxValue < 0) {
        maxValue = 0;
      }
    }

    if (maxValue === minValue) {
      maxValue += 1;
      isDefaultMaxSameAsMin = true;
    }

    const minLabel = this.getLabelFormat(minValue);
    const maxLabel = this.getLabelFormat(maxValue, {
      isMaxValueSameAsMin: isDefaultMaxSameAsMin,
    });

    return {
      min: minValue,
      max: maxValue,
      minLabel,
      maxLabel,
      size: Util.calcTextSizeCanvas(
        maxLabel,
        Util.getLabelStyle(this.labelStyle),
        this.labelStyle?.padding,
      ),
    };
  }
}

export default LinearScale;
