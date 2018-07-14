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
      pickerArea: {
        show: true,
        height: 30,
      },
      buttonArea: {
        show: true,
        height: 30,
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

    // parameter mapping
    this.options = _.merge({}, obj, options);

    // create & init canvas
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.coordinate = {
      pickerArea: {},
      calendarArea: {},
      buttonArea: {},
    };

    // init property
    this.initCanvasProperty();
    this.initCalendarProperty();

    // draw
    this.drawCanvas();

    // append dom
    if (target === null) {
      throw new Error('[EVUI][ERROR][Calendar]-Not found Target for rendering Calendar');
    } else {
      target.appendChild(this.canvas);
    }
  };

  initCanvasProperty() {
    // set width, height
    if (this.options.width && this.options.height) {
      this.canvas.width = this.options.width;
      this.canvas.height = this.options.height;
    }
    const padding = this.options.padding;
    const pickerArea = this.options.pickerArea;
    const buttonArea = this.options.buttonArea;
    const pickerAreaShow = pickerArea.show;
    const buttonAreaShow = buttonArea.show;
    if (pickerAreaShow) {
      this.coordinate.pickerArea = {
        startX: padding.left,
        width: this.canvas.width -padding.left - padding.right,
        startY: padding.top,
        height: this.options.pickerArea.height,
      };
    }
    if (buttonAreaShow) {
      this.coordinate.buttonArea = {
        startX: padding.left,
        width: this.canvas.width -padding.left - padding.right,
        startY: this.canvas.height - padding.bottom - this.options.buttonArea.height,
        height: this.options.buttonArea.height,
      };
    }

    const calendarAreaStartY = pickerAreaShow ? padding.top + this.options.pickerArea.height : padding.top;
    const pickerAreaHeight = pickerAreaShow ? this.options.pickerArea.height : 0;
    const buttonAreaHeight = buttonAreaShow ? this.options.buttonArea.height : 0;
    const calendarAreaHeight = this.canvas.height - pickerAreaHeight - buttonAreaHeight - padding.top - padding.bottom;
    this.coordinate.calendarArea = {
      startX: padding.left,
      width: this.canvas.width - padding.left - padding.right,
      startY: calendarAreaStartY,
      height: calendarAreaHeight,
    };
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

  drawCanvas() {
    this.drawPickerArea();
    this.drawCalendarArea();
    this.drawButtonArea();
  };

  drawPickerArea() {
    const ctx = this.context;
    const pickerArea = this.coordinate.pickerArea;
    this.drawSquare(ctx, pickerArea.startX, pickerArea.startY, pickerArea.width, pickerArea.height);
  };
  drawCalendarArea() {
    const ctx = this.context;
    const calendarArea = this.coordinate.calendarArea;
    console.log(calendarArea);
    this.drawSquare(ctx, calendarArea.startX, calendarArea.startY, calendarArea.width, calendarArea.height);
  };
  drawButtonArea() {
    const ctx = this.context;
    const buttonArea = this.coordinate.buttonArea;
    this.drawSquare(ctx, buttonArea.startX, buttonArea.startY, buttonArea.width, buttonArea.height);
  };

  drawSquare(ctx, x, y, width, height){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(+x + +width, +y);
    ctx.lineTo(+x + +width, +y + +height);
    ctx.lineTo(x, +y + +height);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  };

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
}

export default Calendar;
