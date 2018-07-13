/*eslint-disable*/
// import moment from 'moment';
import _ from 'lodash';

class Calendar {
  constructor(target, options) {
    const obj = {
      // style
      colors: {
        background: '#fff',
        border: 'f0f0f0',
        thisMonth: '#202020',
        prevNextMonth: '#909090',
        mouseover: '#f00',
        mouseclick: '#0f0',
      },
      font: 'bold 12px sans-serif',
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },

      // option
      selectDate: new Date(),
      topArea: {
        show: true,
        height: 10,
      },

      // data
      dateArr: [
        {
          date: 1,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          select: false,
        },
        {
          date: 2,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          select: false,
        },
        //{},{}, ...
      ],
    };

    this.options = _.merge({}, obj, options);
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.initCalendarProperty();

    if (target === null) {
      throw new Error('[EVUI][ERROR][Chart]-Not found Target for rendering Chart');
    } else {
      target.appendChild(this.canvas);
    }
  };

  initCalendarProperty() {
    const thisMonth = this.options.selectDate.getMonth() + 1; // 이번달 thisMonth월

  };

  // 해당 연, 월로 마지막 일자 구함
  getLastDayOfMonth(m, y) {
    let day = 30;
    switch(m) {
      case 4:
      case 6:
      case 9:
      case 11:
        day = 30;
        break;
      case 2:
        if (((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0)) {
          day = 29;
        } else {
          day = 28;
        }
        break;
      default:
        day = 31;
        break;
    }
    return day;
  };

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
}

export default Calendar;
