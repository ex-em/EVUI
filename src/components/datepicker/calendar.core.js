/*eslint-disable*/
// import moment from 'moment';
import _ from 'lodash';

class Calendar {
  constructor(target, options) {
    const obj = {
      // style
      width: 235,
      height: 200,
      colors: {
        background: '#fff',
        border: 'f0f0f0',
        thisMonth: '#202020',
        prevNextMonth: '#ccc',
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
      initDate: new Date(2017, 3, 1),
      // initDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      pickerArea: {
        left: {
          show: true,
          height: 25,
        },
        right: {
          show: false,
          height: 25,
        },
      },
      calendarArea: {
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }
      },
      buttonArea: {
        left: {
          show: false,
          height: 25,
        },
        right: {
          show: false,
          height: 25,
        },
      },
      styleObj: {
        fill: {
          show: false,
          color: '#000000',
          text: '',
        },
        fillText: {
          show: false,
          color: '#000000',
          text: '',
        },
        stroke: {
          show: false,
          color: '#000000',
        },
        text: '',
        align: 'left',
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        font: '10px Roboto Condensed',
      },
      monthArr: {
        fullName: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        abbrName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      },
      dayOfTheWeekArr: {
        abbrUpperName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        abbrLowerName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        height: 25,
      },
      twoPageShow: false, // timepicker (left : calendar, right: time) all show?
    };

    // parameter mapping
    this.options = _.merge({}, obj, options);

    // create & init canvas
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.coordinate = {
      pickerArea: {
        left: {},
        leftArrow: [], // 왼쪽 양쪽 삼각형
        leftYear: {}, // 왼쪽 년 타이틀 영역
        leftMonth: {}, // 왼쪽 월 타이틀 영역
        right: {},
      },
      calendarArea: {
        left: {}, // 왼쪽 contents 전체 좌표 1개
        leftInner: {}, // 왼쪽 contents padding 제외 (요일, 날짜 부분)
        leftDayOfTheWeek: [], // 왼쪽 요일부분 좌표 7개
        leftAllDay: [],
        right: {},
      },
      buttonArea: {
        left: {},
        right: {},
      },
    };

    // init property
    this.initCalendarProperty();
    this.initCanvasProperty();

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
    // set total width, height
    if (this.options.width && this.options.height) {
      if (this.options.twoPageShow) {
        this.canvas.width = this.options.width * 2;
      } else {
        this.canvas.width = this.options.width;
      }
      this.canvas.height = this.options.height;
    }

    // set canvas common style
    const padding = this.options.padding;
    const pickerArea = this.options.pickerArea;
    const buttonArea = this.options.buttonArea;
    const twoPageFlag = this.options.twoPageShow;

    // set canvas left area
    const pickerAreaLeftShow = pickerArea.left.show;
    const buttonAreaLeftShow = buttonArea.left.show;
    if (pickerAreaLeftShow) {
      this.coordinate.pickerArea.left = {
        startX: padding.left,
        width: this.options.width - padding.left - (twoPageFlag ? 0 : padding.right),
        startY: padding.top,
        height: pickerArea.left.height,
      };
    }
    if (buttonAreaLeftShow) {
      this.coordinate.buttonArea.left = {
        startX: padding.left,
        width: this.options.width - padding.left - (twoPageFlag ? 0 : padding.right),
        startY: this.canvas.height - padding.bottom - this.options.buttonArea.left.height,
        height: this.options.buttonArea.left.height,
      };
    }
    const calendarAreaLeftStartY = pickerAreaLeftShow ? padding.top + pickerArea.left.height : padding.top;
    const pickerAreaLeftHeight = pickerAreaLeftShow ? pickerArea.left.height : 0;
    const buttonAreaLeftHeight = buttonAreaLeftShow ? buttonArea.left.height : 0;
    const calendarAreaLeftHeight = this.canvas.height - pickerAreaLeftHeight - buttonAreaLeftHeight - padding.top - padding.bottom;
    this.coordinate.calendarArea.left = {
      startX: padding.left,
      width: this.options.width - padding.left - (twoPageFlag ? 0 : padding.right),
      startY: calendarAreaLeftStartY,
      height: calendarAreaLeftHeight,
    };

    // set canvas left area
    const calendarAreaLeft = this.coordinate.calendarArea.left;
    const calendarAreaPadding = this.options.calendarArea.padding;
    this.coordinate.calendarArea.leftInner = {
      startX: +calendarAreaLeft.startX + +calendarAreaPadding.left,
      width: calendarAreaLeft.width - calendarAreaPadding.left - calendarAreaPadding.right,
      startY: +calendarAreaLeft.startY + +calendarAreaPadding.top,
      height: calendarAreaLeft.height - calendarAreaPadding.top - calendarAreaPadding.bottom,
    };

    this.coordinate.calendarArea.leftDayOfTheWeek = [];
    for (let ix = 0, ixLen = 7; ix < ixLen; ix++) {
      const leftInner = this.coordinate.calendarArea.leftInner;
      const obj = {
        startX: leftInner.startX + ((leftInner.width / 7) * (ix)),
        width: (leftInner.width / 7),
        startY: leftInner.startY,
        height: this.options.dayOfTheWeekArr.height,
        text: this.options.dayOfTheWeekArr.abbrUpperName[ix],
      };
      this.coordinate.calendarArea.leftDayOfTheWeek.push(obj);
    }

    // if (this.options.twoPageShow) {
    //   const pickerAreaRightShow = pickerArea.right.show;
    //   const buttonAreaRightShow = buttonArea.right.show;
    //   if (pickerAreaRightShow) {
    //     this.coordinate.pickerArea.right = {
    //       startX: this.options.width,
    //       width: this.options.width - (twoPageFlag ? 0 : padding.left) - padding.right,
    //       startY: padding.top,
    //       height: pickerArea.left.height,
    //     };
    //   }
    //   if (buttonAreaRightShow) {
    //     this.coordinate.buttonArea.right = {
    //       startX: this.options.width,
    //       width: this.options.width - (twoPageFlag ? 0 : padding.left) - padding.right,
    //       startY: this.canvas.height - padding.bottom - this.options.buttonArea.right.height,
    //       height: this.options.buttonArea.right.height,
    //     };
    //   }
    //   const calendarAreaRightStartY = pickerAreaRightShow ? padding.top + pickerArea.right.height : padding.top;
    //   const pickerAreaRightHeight = pickerAreaRightShow ? pickerArea.right.height : 0;
    //   const buttonAreaRightHeight = buttonAreaRightShow ? buttonArea.right.height : 0;
    //   const calendarAreaRightHeight = this.canvas.height - pickerAreaRightHeight - buttonAreaRightHeight - padding.top - padding.bottom;
    //   this.coordinate.calendarArea.right = {
    //     startX: this.options.width,
    //     width: this.options.width - (twoPageFlag ? 0 : padding.left) - padding.right,
    //     startY: calendarAreaRightStartY,
    //     height: calendarAreaRightHeight,
    //   };
    // }
  };

  initCalendarProperty() {
    const thisMonth = +this.options.initDate.getMonth() + +1;       // 이번달 thisMonth월
    this.prevMonthLastDate = +this.getLastDayOfMonth(thisMonth - 1); // 저번달 마지막 날짜
    this.thisMonthLastDate = +this.getLastDayOfMonth(thisMonth);     // 이번달 마지막 날짜
    this.thisMonthFirstDay = +this.options.initDate.getDay();      // 이번달 첫번째 요일(sun : 0, sat : 6) & 해당 달력에서 선택된 달의 1일까지의 공백 before 일수
    this.thisMonthWeekCnt = +Math.ceil((this.thisMonthFirstDay + this.thisMonthLastDate) / 7); // 이번달의 주 개수 (4주 ~ 6주)
  };


  drawCanvas() {
    this.drawTotalArea();
    this.drawPickerArea();
    this.drawCalendarArea();
    // if (this.options.twoPageShow) {
    //   this.drawTimeArea();
    // }
    this.drawButtonArea();
  };

  drawTotalArea() {
    const ctx = this.context;
    const padding = this.options.padding;
    const style = {
      stroke: {
        show: true,
      },
    };
    this.dynamicDraw(
      ctx,
      padding.left, padding.top,
      this.canvas.width - padding.left - padding.right, this.canvas.height - padding.top - padding.bottom,
      style
    );
  };

  drawPickerArea() {
    const ctx = this.context;
    const pickerArea = this.options.pickerArea;
    if (pickerArea.left.show) {
      const pickerAreaLeft = this.coordinate.pickerArea.left;
      const style = {
        fillText: {
          show: true,
        },
        stroke: {
          show: true,
        },
      };
      this.dynamicDraw(ctx, pickerAreaLeft.startX, pickerAreaLeft.startY, pickerAreaLeft.width, pickerAreaLeft.height, style);

      // draw triange in picker area
      const rightArrow = {
        centerX: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (7/8)),
        centerY: +pickerAreaLeft.startY + +(pickerAreaLeft.height / 2),
        direction: 'right',
        length: 10,
      };
      this.coordinate.pickerArea.leftArrow.push(rightArrow);
      this.drawTriangle(ctx, rightArrow.centerX, rightArrow.centerY, rightArrow.direction, rightArrow.length);

      const leftArrow = {
        centerX: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (1/8)),
        centerY: +pickerAreaLeft.startY + +(pickerAreaLeft.height / 2),
        direction: 'left',
        length: 10,
      };
      this.coordinate.pickerArea.leftArrow.push(leftArrow);
      this.drawTriangle(ctx, leftArrow.centerX, leftArrow.centerY, leftArrow.direction, leftArrow.length);

      // draw year TEXT
      const thisYear = this.options.initDate.getFullYear();
      this.coordinate.pickerArea.leftYear = {
        x: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (1/4)),
        y: +pickerAreaLeft.startY,
        width: pickerAreaLeft.width * (1/4),
        height: pickerAreaLeft.height,
        style: {
          fillText: {
            show: true,
            text: thisYear,
          },
          text: thisYear,
          align: 'center',
          padding: { bottom: 8 },
          font: '14px Roboto Condensed',
        },
      };
      this.dynamicDraw(
        ctx,
        this.coordinate.pickerArea.leftYear.x, this.coordinate.pickerArea.leftYear.y,
        this.coordinate.pickerArea.leftYear.width, this.coordinate.pickerArea.leftYear.height,
        this.coordinate.pickerArea.leftYear.style,
      );

      // draw month TEXT
      const thisMonth = this.options.initDate.getMonth();
      const thisMonthText = this.options.monthArr.fullName[thisMonth];
      this.coordinate.pickerArea.leftMonth = {
        x: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (2/4)),
        y: +pickerAreaLeft.startY,
        width: pickerAreaLeft.width * (1/4),
        height: pickerAreaLeft.height,
        style: {
          fillText: {
            show: true,
            text: thisMonthText,
          },
          align: 'center',
          padding: { bottom: 8 },
          font: '14px Roboto Condensed',
        },
      };
      this.dynamicDraw(
        ctx,
        this.coordinate.pickerArea.leftMonth.x, this.coordinate.pickerArea.leftMonth.y,
        this.coordinate.pickerArea.leftMonth.width, this.coordinate.pickerArea.leftMonth.height,
        this.coordinate.pickerArea.leftMonth.style,
      );

    }
    // if (this.options.twoPageShow) {
    //   if (pickerArea.right.show) {
    //     const pickerAreaRight = this.coordinate.pickerArea.right;
    //     this.dynamicDraw(ctx, pickerAreaRight.startX, pickerAreaRight.startY, pickerAreaRight.width, pickerAreaRight.height);
    //   }
    // }
  };
  drawCalendarArea() {
    this.drawCalendarDayOfTheWeek();
    this.drawCalendarDay();
  };
  // DRAW ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  drawCalendarDayOfTheWeek() {
    const ctx = this.context;
    const calendarAreaWeekLeft = this.coordinate.calendarArea.leftDayOfTheWeek;
    for (let ix = 0, ixLen = calendarAreaWeekLeft.length; ix < ixLen; ix++) {
      this.dynamicDraw(
        ctx,
        calendarAreaWeekLeft[ix].startX, calendarAreaWeekLeft[ix].startY,
        calendarAreaWeekLeft[ix].width, calendarAreaWeekLeft[ix].height,
        {
          fillText: {
            show: true,
            text: this.options.dayOfTheWeekArr.abbrUpperName[ix],
          },
          stroke: {
            show: false,
          },
          align: 'center',
          padding: { bottom: 8 },
          font: '10px Roboto Condensed',
        },
      );
    }
  };
  // DRAW 1일 ~ 31일
  drawCalendarDay() {
    const ctx = this.context;
    // 일자 좌표 저장 배열 초기화
    this.coordinate.calendarArea.leftAllDay = [];
    // 요일, 일자 좌표 데이터
    const calendarAreaLeftInner = this.coordinate.calendarArea.leftInner;
    // 요일 영역 높이
    const dayOfTheWeekHeight = this.options.dayOfTheWeekArr.height;
    // draw DAY NUMBER
    for (let ix = 0, ixLen = this.thisMonthWeekCnt; ix < ixLen; ix++) {
      for (let jx = 0; jx < 7; jx++) {
        // 첫번째 주
        if (ix == 0) {
          // 1일 이전
          if (jx < this.thisMonthFirstDay) {
            const obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7 * jx)),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText: {
                  show: true,
                  color: this.options.colors.prevNextMonth,
                  text: ((+this.prevMonthLastDate - +this.thisMonthFirstDay) + +jx) + +1,
                },
                fill: {
                  show: false,
                },
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
          // 1일
          else if (jx == this.thisMonthFirstDay) {
            this.monthDay = 1;
            const obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7 * jx)),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText: {
                  show: true,
                  text: 1,
                },
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
          // 2일 이후
          else {
            this.monthDay++;
            const obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7 * jx)),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText: {
                  show: true,
                  text: this.monthDay,
                },
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
        }
        // 마지막 주의 다음달 날짜
        else if (this.thisMonthLastDate <= this.monthDay) {
          this.monthDay++;
          const obj = {
            startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7 * jx)),
            width: calendarAreaLeftInner.width / 7,
            startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight + ((calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt * ix),
            height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
            style: {
              fillText: {
                show: true,
                color: this.options.colors.prevNextMonth,
                text: this.monthDay - this.thisMonthLastDate,
              },
              align: 'center',
              padding: { bottom: 8 },
              font: '10px Roboto Condensed',
            },
          };
          this.coordinate.calendarArea.leftAllDay.push(obj);
          this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
        }
        // 나머지 주 & 마지막 주의 이번달 날짜
        else {
          this.monthDay++;
          const obj = {
            startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7 * jx)),
            width: calendarAreaLeftInner.width / 7,
            startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight + ((calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt * ix),
            height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
            style: {
              fillText: {
                show: true,
                text: this.monthDay,
              },
              align: 'center',
              padding: { bottom: 8 },
              font: '10px Roboto Condensed',
            },
          };
          this.coordinate.calendarArea.leftAllDay.push(obj);
          this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
        }
      }
    }

  };
  drawTimeArea() {
    const ctx = this.context;
    const calendarAreaRight = this.coordinate.calendarArea.right;
    this.dynamicDraw(ctx, calendarAreaRight.startX, calendarAreaRight.startY, calendarAreaRight.width, calendarAreaRight.height);
  };
  drawButtonArea() {
    const ctx = this.context;
    const buttonArea = this.options.buttonArea;
    if (buttonArea.left.show) {
      const buttonAreaLeft = this.coordinate.buttonArea.left;
      this.dynamicDraw(ctx, buttonAreaLeft.startX, buttonAreaLeft.startY, buttonAreaLeft.width, buttonAreaLeft.height);
    }
    // if (this.options.twoPageShow) {
    //   if (buttonArea.right.show) {
    //     const buttonAreaRight = this.coordinate.buttonArea.right;
    //     this.dynamicDraw(ctx, buttonAreaRight.startX, buttonAreaRight.startY, buttonAreaRight.width, buttonAreaRight.height);
    //   }
    // }
  };



  /********************Utils********************/
  // DRAW multiple function
  dynamicDraw(ctx, x, y, width, height, style){
    if (style) {
      const mergedStyle = _.merge({}, this.options.styleObj, style);

      if (mergedStyle.stroke && mergedStyle.stroke.show) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(+x + +width, +y);
        ctx.lineTo(+x + +width, +y + +height);
        ctx.lineTo(x, +y + +height);
        ctx.lineTo(x, y);
        ctx.strokeStyle = mergedStyle.stroke.color;
        ctx.stroke();
        ctx.closePath();
      }
      if (mergedStyle.fill.show) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = mergedStyle.fill.color;
        ctx.fill();
      }
      if (mergedStyle.fillText.show && mergedStyle.fillText.text) {
        ctx.font = mergedStyle.font;
        const textWidth = mergedStyle.fillText.text ? ctx.measureText(mergedStyle.fillText.text).width : 0;
        let textStartX, textStartY;
        if (mergedStyle.align === 'center') {
          textStartX = +x + +(width / 2) - (textWidth / 2);
        } else if (mergedStyle.align === 'right') {
          textStartX = (+x + +width) - mergedStyle.padding.right - textWidth;
        } else if (mergedStyle.align === 'left') {
          textStartX = +x + +mergedStyle.padding.left;
        }
        textStartY = (+y + +height) - mergedStyle.padding.bottom;
        if (mergedStyle.fillText.color) {
          ctx.fillStyle = mergedStyle.fillText.color;
        }
        ctx.fillText(mergedStyle.fillText.text, textStartX, textStartY);
      }
    }
  };

  drawTriangle(ctx, x, y, direction, length) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (direction === 'right') {
      ctx.lineTo(x, y - (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x + (Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y + (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x, y);
    } else if (direction === 'left') {
      ctx.lineTo(x, y - (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x - (Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y + (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x, y);
    }
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.closePath();
  };

  toRadians(angle) {
    return angle * (Math.PI / 180.0);
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

  clearCanvas(ctx, x, y, width, height) {
    if (x && y && width && height) {
      ctx.clearRect(x, y, width, height);
    } else {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };
}

export default Calendar;
