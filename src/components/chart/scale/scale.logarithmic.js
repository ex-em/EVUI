import Scale from './scale';
import Util from '../helpers/helpers.util';

class LogarithmicScale extends Scale {
  calculateScaleRange(minMax) {
    let maxValue;
    let minValue;
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
    }

    const minLabel = this.getLabelFormat(minValue);
    const maxLabel = this.getLabelFormat(maxValue);

    return {
      min: minValue,
      max: maxValue,
      minLabel,
      maxLabel,
      size: Util.calcTextSize(maxLabel, Util.getLabelStyle(this.labelStyle)),
    };
  }

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

  getLabelFormat(value) {
    return Util.labelSignFormat(value, this.decimalPoint);
  }

  getInterval(range) {
    const max = range.maxValue;
    const min = range.minValue;
    return 10 ** Util.calculateMagnitude(max - min);
  }
}

export default LogarithmicScale;
