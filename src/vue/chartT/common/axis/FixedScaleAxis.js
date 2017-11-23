import Axis from './Axis'
import Core from '../Core'
import { AXIS_UNITS } from '../Constant'

class FixedScaleAxis extends Axis {

    constructor(type, data, chartRect, options) {
        let axisUnit = AXIS_UNITS[type],
            highLow = options.highLow || Core.getHighLow(data, options, axisUnit.pos),
            divisor = options.divisor || 1,
            ticks;

        highLow.high = highLow.high + ((highLow.high - highLow.low) * 0.01);
        ticks = options.ticks || Core.times(divisor).map(function(value, index) {
            return highLow.low + (highLow.high - highLow.low) / divisor * index;
        });

        ticks.push(highLow.high);

        super(type, chartRect, ticks, options);

        this.type = 'fixed';
        this.ticks = ticks;
        this.ticks.sort(function(a, b) {
            return a - b;
        });

        this.range = {
            min: highLow.low,
            max: highLow.high
        };

        this.stepLength = this.axisLength / divisor;
    }

    getValue(value) {
        return this.axisLength * (+Core.getMultiValue(value, this.units.pos) - this.range.min) / (this.range.max - this.range.min);
    }

}

export default FixedScaleAxis;
