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
      const formattedLabel = this.formatter(value, data);

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
   * @returns {number}  interval (한 칸에 표시할 값의 간격)
   */
  getInterval(range) {
    if (this.interval) return this.interval;

    const max = range.maxValue;
    const min = range.minValue;
    const steps = range.maxSteps;

    // step이 0이면 interval 계산 불가
    if (!steps || steps <= 0) return 0;

    // startToZero이고, 최소값이 음수일 경우 0을 반드시 포함
    if (this.startToZero && min < 0) {
      const totalRange = Math.abs(min) + Math.abs(max);

      // 비율로 나눔
      const negativeRatio = Math.abs(min) / totalRange;
      const positiveRatio = Math.abs(max) / totalRange;

      // 각 방향에 최소 1칸 이상 배정되도록 보장
      let negativeSteps = Math.max(1, Math.round(negativeRatio * steps));
      let positiveSteps = Math.max(1, steps - negativeSteps);

      // 다시 합이 steps보다 커질 수도 있으니, 조정
      if (negativeSteps + positiveSteps > steps) {
        // 가장 큰 쪽에서 하나 줄임
        if (negativeRatio > positiveRatio) {
          negativeSteps -= 1;
        } else {
          positiveSteps -= 1;
        }
      }

      return Math.ceil(
        Math.max(
          Math.abs(min) / (negativeSteps || 1),
          Math.abs(max) / (positiveSteps || 1),
        ),
      );
    }

    return Math.ceil((max - min) / steps);
  }

    /**
   * With range information, calculate how many labels in axis
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { maxValue, minValue, maxSteps } = range;

    let interval = this.getInterval(range);
    let graphMin = 0;
    let graphMax = 0;

    // 그래프 최대/최소 값 계산
    if (minValue >= 0) {
      // 전부 양수
      graphMin = +minValue;
      graphMax = Math.ceil(maxValue / interval) * interval;
    } else if (maxValue >= 0) {
      // 양수/음수 혼합
      graphMin = Math.floor(minValue / interval) * interval;
      graphMax = Math.ceil(maxValue / interval) * interval;
    } else {
      // 전부 음수
      graphMax = +maxValue;
      graphMin = Math.floor(minValue / interval) * interval;
    }

    let graphRange = graphMax - graphMin;
    let numberOfSteps = Math.round(graphRange / interval);
    let adjustedMaxSteps = maxSteps;

    // 특수 케이스: 양수 최소값, 최대값이 1일 경우
    if (minValue > 0 && maxValue === 1) {
      if (!this.decimalPoint) {
        interval = 1;
        adjustedMaxSteps = 1;
        numberOfSteps = 1;
      } else if (maxSteps > 2) {
        interval = 0.2;
        adjustedMaxSteps = 5;
        numberOfSteps = 5;
      } else {
        interval = 0.5;
        numberOfSteps = 2;
        numberOfSteps = 2;
      }
      graphMax = minValue + interval * numberOfSteps;
      graphRange = graphMax - graphMin;
    }

    // 최대 스텝 수 조정
    while (numberOfSteps > adjustedMaxSteps) {
      numberOfSteps = adjustedMaxSteps;
      interval = Math.ceil(graphRange / numberOfSteps);
    }

    return {
      steps: numberOfSteps,
      interval,
      graphMin,
      graphMax,
    };
  }

    /**
   * Calculate min/max value, label and size information for axis
   * @param {object} minMax    min/max information
   * @param {object} scrollbarOpt scrollbar option
   *
   * @returns {object} min/max value and label
   */
    calculateScaleRange(minMax, scrollbarOpt) {
      let maxValue;
      let minValue;
      let isDefaultMaxSameAsMin = false;

      const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
      if (Array.isArray(range) && range?.length === 2) {
        if (this.options.type === 'heatMap') {
          maxValue = range[1] > +minMax.max ? +minMax.max : range[1];
          minValue = range[0] < +minMax.min ? +minMax.min : range[0];
        } else {
          maxValue = range[1];
          minValue = range[0];
        }
      } else if (typeof range === 'function') {
        [minValue, maxValue] = range(minMax.min, minMax.max);
      } else {
        maxValue = minMax.max;
        minValue = minMax.min;
      }

      // autoScaleRatio 적용 케이스
      if (this.autoScaleRatio) {
        const temp = maxValue;
        // 양수 방향에만 autoScaleRatio 적용
        maxValue = Math.ceil(maxValue * (this.autoScaleRatio + 1));

        if (maxValue > 0 && minValue < 0) {
          // 양수/음수 혼합 케이스 -- 음수 방향에도 maxValue 증가분만큼 더하기
          const diff = temp - maxValue;
          minValue += diff;
        } else if (maxValue < 0 && minValue < 0) {
          // 전부 음수 케이스 -- 음수 방향에도 autoScaleRatio 적용
          minValue = Math.ceil(minValue * (this.autoScaleRatio + 1));
        }
      }

      // 0 기준 축 설정 케이스
      if (this.startToZero) {
        if (minValue > 0) {
          minValue = 0;
        }

        if (maxValue < 0) {
          maxValue = 0;
        }
      }

      if (maxValue === minValue) {
        maxValue += 1;
        isDefaultMaxSameAsMin = true;
      }

      const minLabel = this.getLabelFormat(minValue);
      const maxLabel = this.getLabelFormat(maxValue, {
        isMaxValueSameAsMin: isDefaultMaxSameAsMin,
      });

      return {
        min: minValue,
        max: maxValue,
        minLabel,
        maxLabel,
        size: Util.calcTextSize(
          maxLabel,
          Util.getLabelStyle(this.labelStyle),
          this.labelStyle?.padding,
        ),
      };
    }
}

export default LinearScale;
