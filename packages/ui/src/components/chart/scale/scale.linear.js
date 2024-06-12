import Scale from './scale';
import Util from '../helpers/helpers.util';

class LinearScale extends Scale {
  /**
   * Transforming label by designated format
   * @param {number} value                   label value
   * @param {boolean} isMaxValueSameAsMin    is default max value same as min value
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value, isMaxValueSameAsMin) {
    if (this.formatter) {
      const formattedLabel = this.formatter(value, isMaxValueSameAsMin);

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

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
