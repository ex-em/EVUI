import Util from '../core.util';
import Axis from './axis';

class AxisAutoScale extends Axis {
  calculateSteps(rangeInfo) {
    const maxValue = rangeInfo.maxValue;
    const minValue = rangeInfo.minValue;
    const maxSteps = rangeInfo.maxSteps;
    const minSteps = rangeInfo.minSteps;

    const options = this.options;
    const valueRange = Math.abs(maxValue - minValue);
    const rangeMagnitude = Util.calculateMagnitude(valueRange);
    const graphMin = minValue;

    let graphMax;
    let stepValue;
    let numberOfSteps;

    if (options.autoScaleRatio) {
      graphMax = maxValue;
    } else {
      graphMax = Math.ceil(maxValue / (10 ** rangeMagnitude)) * (10 ** rangeMagnitude);
    }

    const graphRange = graphMax - graphMin;
    stepValue = 10 ** rangeMagnitude;
    numberOfSteps = Math.ceil(graphRange / stepValue);

    if (maxValue === 1) {
      stepValue = 0.2;
      numberOfSteps = 5;
    }

    while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !this.skipFitting) {
      if (numberOfSteps > maxSteps) {
        stepValue *= 2;
        numberOfSteps = Math.ceil(graphRange / stepValue);

        if (numberOfSteps % 1 !== 0) {
          this.skipFitting = true;
        }
      } else if (rangeMagnitude >= 0) {
        if ((stepValue / 2) % 1 === 0) {
          stepValue /= 2;
          numberOfSteps = Math.ceil(graphRange / stepValue);
        } else {
          break;
        }
      } else {
        stepValue /= 2;
        numberOfSteps = Math.ceil(graphRange / stepValue);
      }
    }

    if (this.skipFitting) {
      numberOfSteps = minSteps;
      stepValue = graphRange / numberOfSteps;
    }

    this.steps = numberOfSteps;
    this.stepValue = stepValue;
    this.isStepValueFloat = (`${stepValue}`).indexOf('.') > -1;
    this.axisMin = graphMin;
    this.axisMax = Math.ceil((graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;
  }
}

export default AxisAutoScale;
