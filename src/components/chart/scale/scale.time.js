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
    const { maxValue, minValue, maxSteps } = range;

    // 사용자 interval로 인식하는 경우: 숫자 또는 객체({ time, unit }) 형태만
    // 문자열('hour', 'second' 등)은 기존 로직(분기 D)으로 처리
    const hasUserRange = Array.isArray(this.range) && this.range.length === 2;
    const hasUserInterval = (
      typeof this.interval === 'number'
      || (typeof this.interval === 'object' && this.interval !== null)
    );

    const resolvedInterval = hasUserInterval ? this.getInterval(range) : null;
    const isValidInterval = (
      resolvedInterval != null
      && resolvedInterval > 0
      && isFinite(resolvedInterval)
    );

    const graphMin = +minValue;
    let graphMax = +maxValue;
    const graphRange = graphMax - graphMin;

    let interval;
    let steps;

    if (hasUserRange && isValidInterval) {
      // 1) user range + interval
      const candidateSteps = graphRange / resolvedInterval;
      const isExactlyDividable = Math.abs(candidateSteps - Math.round(candidateSteps)) < 1e-10;
      if (isExactlyDividable && candidateSteps <= maxSteps) {
        // 1-1) interval 호환되는 경우
        interval = resolvedInterval;
        steps = Math.round(candidateSteps);
      } else {
        // 1-2) interval 호환되지 않음 -> 사용자 interval을 사용하지 않음
        steps = maxSteps;
        interval = graphRange / steps;
      }
    } else if (hasUserRange) {
      // 2) user range only
      steps = maxSteps;
      interval = graphRange / steps;
    } else if (isValidInterval) {
      // 3) user interval only
      interval = resolvedInterval;
      steps = Math.ceil(graphRange / interval);
      while (steps > maxSteps) {
        interval *= 2;
        steps = Math.ceil(graphRange / interval);
      }
      graphMax = graphMin + (interval * steps);
    } else {
      // 4) 기존 로직
      interval = this.getInterval(range);
      let increase = minValue;
      let numberOfSteps;

      while (increase < maxValue) {
        increase += interval;
      }

      graphMax = increase;

      numberOfSteps = Math.round(graphRange / interval);

      while (numberOfSteps > maxSteps) {
        interval *= 2;
        numberOfSteps = Math.round(graphRange / interval);
        const tempInterval = graphRange / numberOfSteps;
        interval = this.decimalPoint ? tempInterval : Math.ceil(tempInterval);
      }

      if (graphMax - graphMin > (numberOfSteps * interval)) {
        const tempInterval = (graphMax - graphMin) / numberOfSteps;
        interval = this.decimalPoint ? tempInterval : Math.ceil(tempInterval);
      }

      steps = numberOfSteps;
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
