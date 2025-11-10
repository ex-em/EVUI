import { truthyNumber } from '@/common/utils';
import Scale from './scale';
import Util from '../helpers/helpers.util';

class LinearScale extends Scale {
  /**
   * Transforming label by designated format
   * @param {number} value                   label value
   * @param {object} data                   data for formatting
   *
   * @returns {string} formatted label
   */
  getTruthyValue(value) {
    return truthyNumber(value) ? Number(value.toFixed(this.decimalPoint)) : value;
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

    if (this.interval) {
      return this.interval;
    }

    if (this.decimalPoint) {
      return (max - min) / step;
    }

    return Math.ceil((max - min) / step);
  }

    /**
   * Get decimal point from range
   * @param {object} {
   *  graphRange: number,
   *  numberOfSteps: number,
   *  interval: number,
   * }
   * @returns {number} decimal point
   */
  getDecimalPointFromRange({
    graphRange,
    numberOfSteps,
  }) {
    if (numberOfSteps <= 0 || graphRange === 0) {
      return 0;
    }

    const interval = graphRange / numberOfSteps;
    if (interval === 0) {
      return 0;
    }

    let decimals = 0;
    let temp = interval;

    while (temp < 1) {
      temp *= 10;
      decimals++;

      if (decimals > 10) {
        break;
      }
    }

    return decimals;
  }
}

export default LinearScale;
