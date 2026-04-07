import dayjs from 'dayjs';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Scale from './scale';

class TimeScale extends Scale {
  /**
   * value를 dayjs 객체로 변환하고, 숫자로 변환
   * 
   * @param {*} value 
   * @returns {number} normalized value
   */
  normalizeTimeValue(value) {
    if (value == null) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    const normalized = dayjs(value).valueOf();
    return Number.isFinite(normalized) ? normalized : null;
  }

  /**
   * min/max value를 정규화하고, super.calculateScaleRange를 호출
   * @param {object} minMax    min/max information
   * @param {object} scrollbarOpt scrollbar option
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax, scrollbarOpt) {
    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    const hasRangeOverride = Array.isArray(range) || typeof range === 'function';

    if (!hasRangeOverride && (minMax?.min == null || minMax?.max == null)) {
      return {
        min: null,
        max: null,
        minLabel: '',
        maxLabel: '',
        size: Util.calcTextSizeCanvas('', Util.getLabelStyle(this.labelStyle)),
      };
    }

    let normalizedRange = range;

    if (Array.isArray(range) && range.length === 2) {
      normalizedRange = [
        this.normalizeTimeValue(range[0]),
        this.normalizeTimeValue(range[1]),
      ];
    } else if (typeof range === 'function') {
      normalizedRange = (...args) => {
        const [min, max] = range(...args);
        return [
          this.normalizeTimeValue(min),
          this.normalizeTimeValue(max),
        ];
      };
    }

    const originalRange = this.range;
    const originalScrollbarRange = scrollbarOpt?.range;

    if (scrollbarOpt?.use) {
      scrollbarOpt.range = normalizedRange;
    } else {
      this.range = normalizedRange;
    }

    const normalizedMinMax = {
      ...minMax,
      min: this.normalizeTimeValue(minMax?.min),
      max: this.normalizeTimeValue(minMax?.max),
    };

    const result = super.calculateScaleRange(normalizedMinMax, scrollbarOpt);

    this.range = originalRange;
    if (scrollbarOpt?.use) {
      scrollbarOpt.range = originalScrollbarRange;
    }

    return {
      ...result,
      min: this.normalizeTimeValue(result.min),
      max: this.normalizeTimeValue(result.max),
    };
  }

  /**
   * Transforming label by designated format
   * @param {number} value                   label value
   * @param {object} data                    data for formatting
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value, data = {}) {
    if (this.formatter) {
      const formattedLabel = this.formatter(value, data);

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

    return dayjs(value).format(this.timeFormat);
  }

  /**
   * Calculate interval
   * @param {object} range    range information
   *
   * @returns {number} interval
   */
  getInterval(range) {
    const max = this.normalizeTimeValue(range.maxValue);
    const min = this.normalizeTimeValue(range.minValue);
    const step = range.maxSteps;

    if (this.interval) {
      if (typeof this.interval === 'string') {
        return TIME_INTERVALS[this.interval].size;
      } else if (typeof this.interval === 'object') {
        return this.interval.time * TIME_INTERVALS[this.interval.unit].size;
      } else if (typeof this.interval === 'number') {
        return this.interval;
      }
    }
    return Math.ceil((max - min) / step);
  }

  /**
   * With range information, calculate how many labels in axis
   * time axis는 interval 없이 range만 사용하는 것을 지원하지 않음
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
  */
  calculateSteps(range) {
    const minValue = this.normalizeTimeValue(range.minValue);
    const maxValue = this.normalizeTimeValue(range.maxValue);
    const maxSteps = Math.max(1, range.maxSteps ?? 1);
    const normalizedRange = {
      ...range,
      minValue,
      maxValue,
    };

    if (minValue == null || maxValue == null) {
      return {
        steps: 0,
        interval: 0,
        graphMin: null,
        graphMax: null,
      };
    }

    const hasUserRange = Array.isArray(this.range) && this.range.length === 2;

    // 사용자 interval 옵션이 있는 경우, 사용자 interval 옵션을 우선 적용
    // 문자열('hour', 'second' 등)은 4)auto 분기로 처리
    const hasUserInterval =
      typeof this.interval === 'number' ||
      (typeof this.interval === 'object' && this.interval !== null);

    const resolvedInterval = hasUserInterval
      ? this.getInterval(normalizedRange)
      : null;

    const isValidInterval =
      resolvedInterval != null &&
      resolvedInterval > 0 &&
      Number.isFinite(resolvedInterval);

    const EPS = 1e-10;

    const graphMin = +minValue;
    let graphMax = +maxValue;

    /**
     * 1) userRange + userInterval
     * 호환되면 그대로 사용
     * 호환되지 않으면 userRange only 로직으로 fallback
     */
    if (hasUserRange && isValidInterval) {
      const interval = resolvedInterval;
      const graphRange = graphMax - graphMin;
      const rawSteps = graphRange / interval;
      const isCompatible =
        Math.abs(rawSteps - Math.round(rawSteps)) < EPS;

      if ((isCompatible && rawSteps <= maxSteps) || this.fixedSteps) {
        const steps = Math.round(rawSteps);
        return {
          steps,
          interval,
          graphMin,
          graphMax,
        };
      }
    }
  
    /**
     * 2) userInterval only
     * Object(time, unit) interval에만 해당
     * interval을 시작값으로 사용하고,
     * steps가 maxSteps를 넘으면 interval을 배수로 증가
     */
    if (!hasUserRange && isValidInterval) {
      const graphRange = graphMax - graphMin;
      let interval = resolvedInterval;
      let steps = Math.ceil(graphRange / interval);

      while (steps > maxSteps) {
        interval += resolvedInterval;
        steps = Math.ceil(graphRange / interval);
      }

      // interval을 유지하기 위해 graphMax 확장
      graphMax = graphMin + (interval * steps);

      return {
        steps,
        interval,
        graphMin,
        graphMax,
      };
    }
  
    /**
     * 3) auto
     * 문자열 interval('hour', 'second' 등)도 여기서 처리
     */
    let interval = this.getInterval(normalizedRange);
    let increase = graphMin;

    while (increase < maxValue) {
      increase += interval;
    }

    graphMax = increase;

    const graphRange = graphMax - graphMin;
    let steps = Math.round(graphRange / interval);

    while (steps > maxSteps) {
      interval *= 2;
      steps = Math.round(graphRange / interval);

      const tempInterval = graphRange / steps;
      interval = this.decimalPoint ? tempInterval : Math.ceil(tempInterval);
    }

    if (graphRange > (steps * interval)) {
      const tempInterval = graphRange / steps;
      interval = this.decimalPoint ? tempInterval : Math.ceil(tempInterval);
    }
  
    return {
      steps,
      interval,
      graphMin,
      graphMax,
    };
  }
}

export default TimeScale;
