import Axis from './Axis'

class StepAxis extends Axis {

    constructor(type, ticks, chartRect, options) {
        let calc = Math.max(1, ticks.length);

        super(type, chartRect, ticks, options);

        this.type = 'step';
        this.stepLength = this.axisLength / calc;
    }

    getValue(value, index) {
        return this.stepLength * index;
    }

}

export default StepAxis;