import moment from 'moment';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';

class TimeScale extends Scale {
  getLabelFormat(value) {
    return moment(value).format(this.timeFormat);
  }

  getInterval(range) {
    const max = range.maxValue;
    const min = range.minValue;
    const step = range.maxSteps;

    if (this.interval) {
      return TIME_INTERVALS[this.interval].size;
    }
    return Math.ceil((max - min) / step);
  }
}

export default TimeScale;
