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
   * Get auto decimal point from interval
   * interval을 표현할 수 있는 최소 decimal 반환
   * 너무 긴 decimal은 제한
   * @param {number} interval
   * @returns {number} decimal point
   */
  getAutoDecimalPointFromInterval(interval) {
    if (!isFinite(interval) || interval === 0) {
      return 0;
    }

    const absInterval = Math.abs(interval);

    // 1 미만 값 처리 (소수점 최대 10자리 제한)
    if (absInterval < 1) {
      let decimals = 0;
      let temp = absInterval;

      while (temp < 1) {
        temp *= 10;
        decimals++;

        if (decimals > 10) {
          break;
        }
      }

      return decimals;
    }

    // 1 이상 값 처리 (소수점 최대 2자리 제한)
    for (let decimal = 0; decimal <= 6; decimal++) {
      const rounded = Number(absInterval.toFixed(decimal));

      if (Math.abs(rounded - absInterval) < 1e-10) {
        return Math.min(decimal, 2);
      }
    }

    return 2;
  }

  /**
   * axis interval을 nice number로 변환
   * (1, 2, 5 × 10^n)
   *
   * @param {Object} params
   * @param {number} params.range
   * @param {boolean} params.round
   * @returns {number}
   */
  getNiceNumber({ range, round = false }) {
    if (!isFinite(range) || range <= 0) {
      return 0;
    }

    const exponent = Math.floor(Math.log10(range));
    const fraction = range / (10 ** exponent);

    let niceFraction;

    if (round) {
      if (fraction < 1.5) {
        niceFraction = 1;
      } else if (fraction < 3) {
        niceFraction = 2;
      } else if (fraction < 7) {
        niceFraction = 5;
      } else {
        niceFraction = 10;
      }
    } else if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }

    return niceFraction * (10 ** exponent);
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { minValue, maxValue } = range;
    const maxSteps = Math.max(1, range.maxSteps);

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
        interval = resolvedInterval;
        steps = Math.round(candidateSteps);
      } else {
        // interval 호환되지 않음 -> 사용자 interval을 사용하지 않음
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
      // 4) auto
      interval = this.getNiceNumber({
        range: graphRange / maxSteps,
        round: true,
      });

      steps = Math.ceil(graphRange / interval);
      graphMax = graphMin + (interval * steps);
    }

    this.adjustedDecimalPoint = this.decimalPoint === 'auto'
      ? this.getAutoDecimalPointFromInterval(interval)
      : this.decimalPoint;

    return {
      steps,
      interval,
      graphMin,
      graphMax,
    };
  }
}

export default LinearScale;
