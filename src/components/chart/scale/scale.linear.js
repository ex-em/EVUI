import Scale from './scale';
import Util from '../helpers/helpers.util';

class LinearScale extends Scale {
  /**
   * Transforming label by designated format
   * @param {any} value    label value
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value) {
    return Util.labelSignFormat(value, this.decimalPoint);
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

    return this.interval ? this.interval : Math.ceil((max - min) / step);
  }
}

export default LinearScale;
