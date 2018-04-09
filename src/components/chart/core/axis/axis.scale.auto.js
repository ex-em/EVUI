import Util from '../core.util';
import Axis from './axis';

class AxisAutoScale extends Axis {
  calculateSteps(maxValue, minValue, maxSteps, minSteps) {
    const valueRange = Math.abs(maxValue - minValue);
    const rangeMagnitude = Util.calculateMagnitude(valueRange);
    const graphMax = Math.ceil(maxValue / (10 ** rangeMagnitude)) * (10 ** rangeMagnitude);
    const graphMin = (this.startFromZero) ? 0 : minValue;
    const graphRange = graphMax - graphMin;
    let stepValue = 10 ** rangeMagnitude;
    let numberOfSteps = Math.round(graphRange / stepValue);

    if (maxValue === 1) {
      stepValue = 0.2;
      numberOfSteps = 5;
    }

    while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !this.skipFitting) {
      if (numberOfSteps > maxSteps) {
        stepValue *= 2;
        numberOfSteps = Math.round(graphRange / stepValue);

        if (numberOfSteps % 1 !== 0) {
          this.skipFitting = true;
        }
      } else if (this.integersOnly && rangeMagnitude >= 0) {
        if ((stepValue / 2) % 1 === 0) {
          stepValue /= 2;
          numberOfSteps = Math.round(graphRange / stepValue);
        } else {
          break;
        }
      } else {
        stepValue /= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
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
    this.axisMax = Math.round((graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;
  }
}

export default AxisAutoScale;
