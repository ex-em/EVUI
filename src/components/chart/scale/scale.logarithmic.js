import Scale from './scale';
import Util from '../helpers/helpers.util';

class LogarithmicScale extends Scale {
  /**
   * Calculate min/max value, label and size information for logarithmic scale
   * @param {object} minMax    min/max information
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax) {
    let maxValue;
    let minValue;
    let isDefaultMaxSameAsMin = false;
    if (this.range && this.range.length === 2) {
      maxValue = this.range[1];
      minValue = this.range[0];
    } else {
      maxValue = minMax.max;
      minValue = minMax.min;
    }

    const rangeMagnitude = Util.calculateMagnitude(maxValue - minValue);
    maxValue = Math.ceil(maxValue / (10 ** rangeMagnitude)) * (10 ** rangeMagnitude);

    if (this.startToZero) {
      minValue = 0;
    }

    if (maxValue === minValue) {
      maxValue += 1;
      isDefaultMaxSameAsMin = true;
    }

    const minLabel = this.getLabelFormat(minValue);
    const maxLabel = this.getLabelFormat(maxValue, isDefaultMaxSameAsMin);

    return {
      min: minValue,
      max: maxValue,
      minLabel,
      maxLabel,
      size: Util.calcTextSize(maxLabel, Util.getLabelStyle(this.labelStyle)),
    };
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object}  range          min/max information
   * @param {boolean} skipFitting    determines if label skipping job.
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range, skipFitting) {
    const maxValue = range.maxValue;
    const minValue = range.minValue;
    const maxSteps = range.maxSteps;
    const rangeMagnitude = Util.calculateMagnitude(maxValue - minValue);

    let interval = this.getInterval(range);
    let numberOfSteps;

    const graphMax = maxValue;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    numberOfSteps = Math.round(graphRange / interval);

    if (maxValue === 1) {
      interval = 0.2;
      numberOfSteps = 5;
    }

    while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
      if (numberOfSteps > maxSteps) {
        interval *= 2;
        numberOfSteps = Math.ceil(graphRange / interval);
      } else if (rangeMagnitude >= 0) {
        if ((interval / 2) % 1 === 0) {
          interval /= 2;
          numberOfSteps = Math.ceil(graphRange / interval);
        } else {
          break;
        }
      } else {
        interval /= 2;
        numberOfSteps = Math.ceil(graphRange / interval);
      }
    }

    return {
      steps: numberOfSteps,
      interval,
      graphMin,
      graphMax: Math.ceil(graphMin + (numberOfSteps * interval)),
    };
  }

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
    return 10 ** Util.calculateMagnitude(max - min);
  }
}

export default LogarithmicScale;
