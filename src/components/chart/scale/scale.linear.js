import Scale from './scale';
import Util from '../helpers/helpers.util';

class LinearScale extends Scale {
  getLabelFormat(value) {
    return Util.labelSignFormat(value, this.decimalPoint);
  }

  getInterval(range) {
    const max = range.maxValue;
    const min = range.minValue;
    const step = range.maxSteps;

    return this.interval ? this.interval : Math.ceil((max - min) / step);
  }
}

export default LinearScale;
