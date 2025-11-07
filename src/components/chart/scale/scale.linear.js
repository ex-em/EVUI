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
  getLabelFormat(value, data = {}) {
    if (this.formatter) {
      const formattedLabel = this.formatter(Number(value.toFixed(this.decimalPoint)), {
        ...data,
        prevOriginalValue: data?.prev,
        prevDecimalPointValue: truthyNumber(data?.prev)
        ? Number(data?.prev.toFixed(this.decimalPoint))
        : null,
        currentOriginalValue: value,
        currentDecimalPointValue: Number(value.toFixed(this.decimalPoint)),
      });

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

    const { fixWidth, fitDir } = this.labelStyle;

    if (fixWidth > 0) {
      return Util.truncateLabelWithEllipsis(
        Util.labelSignFormat(value, this.decimalPoint),
        fixWidth,
        this.ctx,
        fitDir,
      );
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
