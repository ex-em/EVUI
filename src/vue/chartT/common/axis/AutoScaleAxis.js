import Axis from './Axis';
import Core from '../Core';
import { AXIS_UNITS } from '../Constant';

class AutoScaleAxis extends Axis {

    constructor(type, data, chartRect, options) {
        let axisUnit = AXIS_UNITS[type],
            highLow = options.highLow || Core.getHighLow(data, options, axisUnit.pos),
            bounds;

        highLow.low = 0;
        bounds = Core.getBounds(chartRect[axisUnit.rectEnd] - chartRect[axisUnit.rectStart], highLow, options.scaleMinSpace || 20, false);

        super(type, chartRect, bounds.values, options);

        this.type = 'auto';
        this.bounds = bounds;
        this.range = {
            min: bounds.min,
            max: bounds.max
        };
    }

    getValue(value) {
        return this.axisLength * (+Core.getMultiValue(value, this.units.pos) - this.bounds.min) / this.bounds.range;
    }

}

export default AutoScaleAxis;
