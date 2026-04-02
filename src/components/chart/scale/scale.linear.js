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
   * range를 maxSteps 이하의 steps로 나눌 수 있는 interval 중
   * 유한 소수(딱 떨어지는 값)가 되는 가장 세밀한 interval을 반환한다.
   * graphMin/graphMax를 고정한 채 interval을 구할 때 사용한다.
   * @param {number} range - graphMax - graphMin
   * @param {number} maxSteps
   * @returns {{ interval: number, steps: number }}
   */
  getExactInterval(range, maxSteps) {
    for (let steps = maxSteps; steps >= 1; steps--) {
      const interval = range / steps;
      let pow = 1;
      for (let decimals = 0; decimals <= 12; decimals++, pow *= 10) {
        const scaled = interval * pow;
        if (Math.abs(scaled - Math.round(scaled)) < 1e-6) {
          return {
            interval: Math.round(scaled) / pow,
            steps,
          };
        }
      }
    }

    const safeSteps = Math.max(1, maxSteps);
    // 부동 소수점 제거를 위해 toFixed 사용
    return { interval: parseFloat((range / safeSteps).toFixed(12)), steps: safeSteps };
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
    const range = max - min;

    if (!Number.isFinite(range) || range <= 0) {
      const fallbackInterval = 1;
      return { max: min + fallbackInterval, min, interval: fallbackInterval, steps: 1 };
    }

    // maxSteps 이하로 커버 가능한 최소 interval 크기
    const minInterval = range / maxSteps;

    // nice interval 후보 열거: exponent 범위를 minInterval ~ range로 제한
    const minExp = Math.floor(Math.log10(minInterval));
    const maxExp = Math.ceil(Math.log10(range));

    let bestMaxValue = max;
    let bestMinValue = min;
    let bestInterval = 0;
    let bestSteps = 0;
    let bestOvershootAmount = Infinity;

    for (let exp = minExp; exp <= maxExp; exp++) {
      const pow = 10 ** exp;
      for (const fraction of NICE_FRACTIONS) {
        const interval = fraction * pow;
        if (interval >= minInterval) {
          // floating-point 오차 보정을 위해 epsilon 적용
          const EPS = interval * 1e-10;
          const niceMin = Math.floor((min + EPS) / interval) * interval;
          const steps = Math.ceil((max - niceMin - EPS) / interval);
          const candidateMax = niceMin + interval * steps;

          if (steps <= maxSteps && candidateMax >= max - EPS) {
            const totalOvershoot = (min - niceMin) + (candidateMax - max);

            if (totalOvershoot < bestOvershootAmount) {
              bestMaxValue = candidateMax;
              bestMinValue = niceMin;
              bestInterval = interval;
              bestSteps = steps;
              bestOvershootAmount = totalOvershoot;
            }
          }
        }
      }
    }

    if (!(bestInterval > 0) || bestSteps <= 0) {
      const fallbackSteps = Math.max(1, maxSteps);
      const fallbackInterval = range / fallbackSteps || 1;

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
   * 주어진 축 interval을 정확히 표현하기 위해 필요한 최소 소수점 자릿수를 반환한다.
   *
   * decimalPoint: 'auto' 모드에서 사용되며,
   * 반올림으로 값이 왜곡되지 않도록 JS 부동소수점 오차를 고려해 계산한다.
   *
   * 예: 0.25 → 2, 0.125 → 3, 2.5 → 1
   *
   * @param {number} interval - 축 눈금 간격
   * @returns {number} 필요한 소수점 자릿수 (0 이상)
   */
  getDecimalPointFromInterval(interval) {
    if (!Number.isFinite(interval) || interval === 0) {
      return 0;
    }
  
    const absInterval = Math.abs(interval);
    const MAX_DECIMALS = 10;
    const EPSILON = 1e-10;
  
    const roundTo = (value, decimals = 0) => {
      const factor = 10 ** decimals;
      return Math.round((value + Number.EPSILON) * factor) / factor;
    };
  
    const isRepresentableAtDecimals = (value, decimals) => {
      const rounded = roundTo(value, decimals);
      return Math.abs(value - rounded) < EPSILON;
    };
  
    if (absInterval >= 1 && isRepresentableAtDecimals(absInterval, 0)) {
      return 0;
    }
  
    const rough =
      absInterval >= 1 ? 0 : Math.max(0, Math.ceil(-Math.log10(absInterval)));
  
    for (let decimals = rough; decimals <= MAX_DECIMALS; decimals += 1) {
      if (isRepresentableAtDecimals(absInterval, decimals)) {
        return decimals;
      }
    }
  
    return MAX_DECIMALS;
  }

  /**
   * maxValue가 1일 때, 특수 처리 (기존 로직)
   * @param {number} maxSteps 
   * @returns {object} interval, steps
   */
  getLegacyOneMaxScale(maxSteps) {
    if (!this.decimalPoint) {
      return {
        interval: 1,
        steps: 1,
      };
    }

    if (maxSteps > 2) {
      return {
        interval: 0.2,
        steps: 5,
      };
    }

    return {
      interval: 0.5,
      steps: 2,
    };
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
  
    const setDecimal = (interval) => {
      if (this.decimalPoint === 'auto') {
        const decimalFromInterval = this.getDecimalPointFromInterval(interval);
  
        if (
          decimalFromInterval != null &&
          !Number.isNaN(decimalFromInterval)
        ) {
          this.adjustedDecimalPoint = decimalFromInterval;
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
     * fixedSteps 옵션이 있으면 그대로 사용
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
  
      if ((isCompatible && rawSteps <= maxSteps) || this.fixedSteps) {
        const steps = Math.round(rawSteps);
        setDecimal(interval);
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
     * range를 딱 떨어지게 나누는 nice interval 적용
     * graphMin/graphMax는 userMin/userMax로 고정
     */
    if (hasUserRange) {
      const graphMin = userMin;
      const graphMax = userMax;
      const graphRange = graphMax - graphMin;

      const { interval, steps } = this.getExactInterval(graphRange, maxSteps);

      setDecimal(interval);

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
        interval += resolvedInterval;
  
        ({ graphMin, graphMax } = expandByInterval({
          min: minValue,
          max: maxValue,
          interval,
        }));
        
        graphRange = graphMax - graphMin;
        steps = safeSteps(graphRange, interval);
      }
  
      setDecimal(interval);
  
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

    if (normalizedMin === 0 && normalizedMax === 1) {
      const legacy = this.getLegacyOneMaxScale(maxSteps);
      setDecimal(legacy.interval);

      return {
        steps: legacy.steps,
        interval: legacy.interval,
        graphMin: normalizedMin,
        graphMax: normalizedMax,
      };
    }
  
    const nice = this.getStepsWithNiceScale({
      min: normalizedMin,
      max: normalizedMax,
      maxSteps,
    });
  
    setDecimal(nice.interval);
  
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
    const hasRangeOverride = Array.isArray(range) || typeof range === 'function';

    if (!hasRangeOverride && (minMax?.min == null || minMax?.max == null)) {
      const minLabel = this.getLabelFormat(0);
      const maxLabel = this.getLabelFormat(1, {
        isMaxValueSameAsMin: true,
      });

      return {
        min: 0,
        max: 1,
        minLabel,
        maxLabel,
        size: Util.calcTextSizeCanvas(maxLabel, Util.getLabelStyle(this.labelStyle)),
      };
    }

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

    const hasUserRange = Array.isArray(this.range) && this.range.length === 2;

    // autoScaleRatio 적용 케이스
    if (this.autoScaleRatio && !hasUserRange) {
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
    if (this.startToZero && !hasUserRange) {
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
