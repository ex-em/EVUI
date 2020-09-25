import moment from 'moment';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';

class TimeScale extends Scale {
  /**
   * Transforming label by designated format
   * @param {number} value       label value
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value) {
    return moment(value).format(this.timeFormat);
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
}

export default TimeScale;
