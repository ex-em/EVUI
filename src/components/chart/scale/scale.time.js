import dayjs from 'dayjs';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';

class TimeScale extends Scale {
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
    const max = range.maxValue;
    const min = range.minValue;
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
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
  */
  calculateSteps(range) {
    const { maxValue, minValue } = range;
    const maxSteps = Math.max(1, range.maxSteps ?? 1);
  
    // 사용자 interval 옵션이 있는 경우, 사용자 interval 옵션을 우선 적용
    // 문자열('hour', 'second' 등)은 4)auto 분기로 처리
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
  
      if (isCompatible && this.fixedSteps) {
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
     * steps가 maxSteps를 넘으면 interval을 2배씩 증가
     */
    if (isValidInterval) {
      const graphRange = graphMax - graphMin;
      let interval = resolvedInterval;
      let steps = Math.ceil(graphRange / interval);
  
      while (steps > maxSteps) {
        interval *= 2;
        steps = Math.ceil(graphRange / interval);
      }
  
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
    let interval = this.getInterval(range);
    let increase = minValue;
  
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
