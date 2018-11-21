import { TIME_INTERVALS } from '../core.constant';
import Axis from './axis';

class AxisFixedScale extends Axis {
  constructor(props) {
    super(props);

    if (this.options.labelType === 'time') {
      this.interval = TIME_INTERVALS[this.options.interval].size;
    } else {
      this.interval = +this.options.interval;
    }
  }

  calculateSteps(rangeInfo) {
    const maxValue = rangeInfo.maxValue;
    const minValue = rangeInfo.minValue;
    const maxSteps = rangeInfo.maxSteps;
    const minSteps = rangeInfo.minSteps;

    const options = this.options;

    let incValue = minValue;
    let stepValue;
    let numberOfSteps;

    while (incValue < maxValue) {
      incValue += this.interval;
    }

    const graphMax = (options.autoScaleRatio && incValue <= maxValue) ? maxValue : incValue;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    stepValue = this.interval;
    numberOfSteps = Math.round(graphRange / stepValue);

    if (maxValue === 1) {
      stepValue = 0.2;
      numberOfSteps = 5;
    }

    while (numberOfSteps > maxSteps && !this.skipFitting) {
      stepValue *= 2;
      numberOfSteps = Math.round(graphRange / stepValue);

      if (numberOfSteps % 1 !== 0) {
        this.skipFitting = true;
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

export default AxisFixedScale;
