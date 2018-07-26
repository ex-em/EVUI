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
        thisMonthFont: '#202020',
        thisMonthFill: '#f5f5f5',
        prevNextMonthFont: '#ccc',
        prevNextMonthFill: '#fff',
        selectDayFill: 'rgba(0, 255, 0, 0.1)',
        mousemoveDayFill: 'rgba(255, 0, 0, 0.1)',
      },
      font: 'bold 12px sans-serif',
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },

      // 최초 달력상 연,월
      // currentYearMonth: new Date(2015, 1, 1), // 4주
      // currentYearMonth: new Date(2017, 11, 1), // 6주 // 2017-12-01
      // currentYearMonth: new Date(2018, 3, 1), // 5주
      // currentYearMonth: new Date(2018, 5, 1), // 5주
      currentYearMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      // 최초 선택날짜 여부
      initSelectDayFlag: true,
      // 최초 선택된 날(default : 오늘)
      initSelectDay: new Date(),
      // 제한 시작 날짜(default:오늘) 이후 날짜 비활성화(default:false)
      limitToday: false,
      // 제한 시작 날짜(default : 오늘)
      // initLimitDay: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
      initLimitDay: new Date(),
      // 달력에 선택되는 날짜 타입
      // ('day'[default] : 하루, 'weekday' : 1주(평일, 월~금), 'week' : 1주일)
      selectDayType: 'day',
      // selectDayType가 'day'일 때, 날짜 최대 limit일까지 선택 가능
      selectDayLimit: 1,

      // init parameter
      pickerArea: {
        left: {
          show: true,
          triangleLength: 15,
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
        },
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
          linewidth: 1,
          color: '#000000',
        },
        align: 'left',
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        font: '10px Roboto Condensed',
      },
      selectable: true, // 선택 가능 여부 (이번달 & 오늘 전까지)
      monthArr: {
        fullName: ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'],
        numberName: ['1', '2', '3', '4', '5', '6',
          '7', '8', '9', '10', '11', '12'],
        abbrName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      },
      dayOfTheWeekArr: {
        index: [0, 1, 2, 3, 4, 5, 6], // getDay()
        abbrUpperName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        abbrLowerName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        height: 25,
      },
      titleType: {
        // 'fullName', 'numberName', 'abbrName' 중 선택
        month: 'fullName',
        // 'abbrUpperName', 'abbrLowerName' 중 선택
        dayOfTheWeek: 'abbrUpperName',
      },
      // timepicker (left : calendar[default], right: time) all show?
      twoPageShow: false, // 아직은 false로 놔둠
      // twoPageShow가 true일 때 'H', 'HM', 'HMS'가 right영역에 추가되는 타입
      twoPageType: null,
    };

    // parameter mapping
    this.options = _.merge({}, obj, options);

    // create & init canvas
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.setAttribute('class', 'evui-calendar-canvas');
    this.context = this.baseCanvas.getContext('2d');

    this.overCanvas = document.createElement('canvas');
    this.overCanvas.setAttribute('class', 'evui-calendar-overlay-canvas');
    this.overCanvas.setAttribute('style', 'position: absolute; left: 0px; top: 0px;');
    this.overCtx = this.overCanvas.getContext('2d');

    // init coordinate obj
    this.coordinate = {
      pickerArea: {
        left: {}, // 왼쪽 contents영역
        leftArrow: [], // 양쪽 삼각형
        leftYear: {}, // 년 타이틀 영역
        leftMonth: {}, // 월 타이틀 영역
        right: {},
      },
      calendarArea: {
        left: {}, // 왼쪽 contents영역
        leftInner: {}, // 왼쪽 contents padding 제외 (요일, 날짜 부분)
        leftDayOfTheWeek: [], // 왼쪽 모든요일 좌표(일 ~ 토)
        leftAllDay: [], // 왼쪽 1달 날짜 좌표
        leftSelectDayArr: [], // 월이 바뀐 경우에도 선택한 날짜 저장 , selectDayLimit와 연관
        right: {},
      },
      buttonArea: {
        left: {},
        right: {},
      },
    };

    // init
    this.init();

    // init mouse event
    this.mouseInit();

    // draw
    this.drawCanvas();

    // append dom
    if (target === null) {
      throw new Error('[EVUI][ERROR][Calendar]-Not found Target for rendering Calendar');
    } else {
      target.appendChild(this.baseCanvas);
      target.appendChild(this.overCanvas);
    }
  }
  init() {
    this.initOptionsProperty();
    this.initCalendarProperty();
    this.initCanvasProperty();
  }
  mouseInit() {
    this.initMouseclick();
    this.initMouseover();
    this.initMouseleave();
  }
  initOptionsProperty() {
    this.options.initSelectDay = this.options.initSelectDay.setHours(0, 0, 0, 0);
    this.options.initLimitDay = this.options.initLimitDay.setHours(0, 0, 0, 0);
  }
  initCanvasProperty() {
    // set total width, height
    if (this.options.width && this.options.height) {
      if (this.options.twoPageShow) {
        this.baseCanvas.width = this.options.width * 2;
        this.overCanvas.width = this.options.width * 2;
      } else {
        this.baseCanvas.width = this.options.width;
        this.overCanvas.width = this.options.width;
      }
      this.baseCanvas.height = this.options.height;
      this.overCanvas.height = this.options.height;
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
        startY: this.baseCanvas.height - padding.bottom - this.options.buttonArea.left.height,
        height: this.options.buttonArea.left.height,
      };
    }
    const calendarAreaLeftStartY =
      pickerAreaLeftShow ? padding.top + pickerArea.left.height : padding.top;
    const pickerAreaLeftHeight = pickerAreaLeftShow ? pickerArea.left.height : 0;
    const buttonAreaLeftHeight = buttonAreaLeftShow ? buttonArea.left.height : 0;
    const calendarAreaLeftHeight = this.baseCanvas.height - pickerAreaLeftHeight
      - buttonAreaLeftHeight - padding.top - padding.bottom;
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
        text: this.options.dayOfTheWeekArr[this.options.titleType.dayOfTheWeek][ix],
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
    //       startY: this.baseCanvas.height - padding.bottom - this.options.buttonArea.right.height,
    //       height: this.options.buttonArea.right.height,
    //     };
    //   }
    //   const calendarAreaRightStartY =
    //    pickerAreaRightShow ? padding.top + pickerArea.right.height : padding.top;
    //   const pickerAreaRightHeight = pickerAreaRightShow ? pickerArea.right.height : 0;
    //   const buttonAreaRightHeight = buttonAreaRightShow ? buttonArea.right.height : 0;
    //   const calendarAreaRightHeight = this.baseCanvas.height - pickerAreaRightHeight
    //    - buttonAreaRightHeight - padding.top - padding.bottom;
    //   this.coordinate.calendarArea.right = {
    //     startX: this.options.width,
    //     width: this.options.width - (twoPageFlag ? 0 : padding.left) - padding.right,
    //     startY: calendarAreaRightStartY,
    //     height: calendarAreaRightHeight,
    //   };
    // }
  }

  initCalendarProperty() {
    // 이번달 thisMonth월
    const thisMonth = +this.options.currentYearMonth.getMonth() + +1;
    // 저번달 마지막 날짜
    this.prevMonthLastDate = +this.getLastDayOfMonth(thisMonth - 1);
    // 이번달 마지막 날짜
    this.thisMonthLastDate = +this.getLastDayOfMonth(thisMonth);
    // 이번달 첫번째 요일(sun : 0, sat : 6) & 해당 달력에서 선택된 달의 1일까지의 공백 before 일수
    this.thisMonthFirstDay = +this.options.currentYearMonth.getDay();
    // 이번달의 주 개수 (4주 ~ 6주)
    this.thisMonthWeekCnt = 6; // 무조건 6주 고정 (달력의 1주 높이를 고정, 다음달 달력 불필요)
    // this.thisMonthWeekCnt = +Math.ceil((this.thisMonthFirstDay + this.thisMonthLastDate) / 7);
  }

  initMouseover() {
    this.overCanvas.addEventListener('mousemove', function(e) {
      e.preventDefault();
      // init value
      const overCtx = this.overCtx;
      let mouseoverFlag = false;
      // init clear canvas
      this.clearCanvas(overCtx, 0, 0, this.overCanvas.width, this.overCanvas.height);
      // mousemove on day box in calendar area
      const leftAllDayCoordinate = this.coordinate.calendarArea.leftAllDay;
      const selectDayArr = this.coordinate.calendarArea.leftSelectDayArr;
      leftAllDayCoordinate.forEach((v) => {
        if (e.offsetX > v.startX
          && e.offsetX < (+v.startX + +v.width)
          && e.offsetY > v.startY
          && e.offsetY < (+v.startY + +v.height)
        ) {
          if (this.options.limitToday) {
            const mouseoverDay = new Date(v.date.year, v.date.month - 1, v.date.day);
            const initLimitDay = this.options.initLimitDay;
            if (initLimitDay < mouseoverDay) {
              return false;
            }
          }
          mouseoverFlag = true;
          this.dynamicDraw(
            overCtx, v.startX, v.startY,
            v.width, v.height,
            {
              fill: {
                show: true,
                color: this.options.colors.mousemoveDayFill,
              }
            }
          );
        }
        selectDayArr.forEach((s) => {
          if (v.date.year === s.year && v.date.month === s.month && v.date.day === s.day) {
            this.dynamicDraw(
              overCtx, v.startX, v.startY,
              v.width, v.height,
              {
                fill: {
                  show: true,
                  color: this.options.colors.selectDayFill,
                }
              }
            );
          }
        });
      });
      // mousemove on triangle in picker area
      const leftPickerArrow = this.coordinate.pickerArea.leftArrow;
      const leftPickerAreaOption = this.options.pickerArea.left;
      let exist = false;
      leftPickerArrow.forEach((v, idx) => {
        exist = this.existTriangle(
          leftPickerArrow[idx].centerX, leftPickerArrow[idx].centerY,
          v.direction, leftPickerAreaOption.triangleLength, e.offsetX, e.offsetY
        );
        if (exist) {
          mouseoverFlag = true;
        }
      });

      if (mouseoverFlag) {
        this.overCanvas.style.cursor = 'pointer';
      } else {
        this.overCanvas.style.cursor = 'default';
      }
    }.bind(this));
  }

  mouseclickDate(e) {
    const leftAllDayCoordinate = this.coordinate.calendarArea.leftAllDay;
    const selectDayArr = this.coordinate.calendarArea.leftSelectDayArr;
    const overCtx = this.overCtx;
    this.clearCanvas(overCtx, 0, 0, this.overCanvas.width, this.overCanvas.height);
    let mouseclickCondition = false;
    leftAllDayCoordinate.forEach((v, idx) => {
      // type이 'day'일 때 initSelectDay(최초 선택날짜)여부에 따라 선택
      if (this.options.initSelectDayFlag && this.options.selectDayType === 'day') {
        const initSelectDay = new Date(this.options.initSelectDay);
        if (v.date.year === initSelectDay.getFullYear()
          && v.date.month === (+initSelectDay.getMonth() + +1)
          && v.date.day === initSelectDay.getDate()) {
          selectDayArr.push(v.date);
        }
      }
      // mouseevent가 없을 시 redraw selected day
      if (e) {
        mouseclickCondition = (e.offsetX > v.startX
          && e.offsetX < (+v.startX + +v.width)
          && e.offsetY > v.startY
          && e.offsetY < (+v.startY + +v.height)
        );
      }
      // click in area
      if (mouseclickCondition) {
        // 오늘 이후 비활성화 시 return false
        if (this.options.limitToday) {
          const mouseoverDay = new Date(v.date.year, v.date.month - 1, v.date.day);
          const initLimitDay = new Date(this.options.initLimitDay);
          // 선택된 날(default:오늘)의 요일 (일 : 0, 토 : 6)
          const initSelectGetDay = initLimitDay.getDay();
          // 선택된 날의 첫번째 일요일(선택된 날 기준 첫 날)
          const initSelectSunday = new Date();
          initSelectSunday.setDate(initLimitDay.getDate() - initSelectGetDay);
          initSelectSunday.setHours(0, 0, 0, 0);
          // 선택된 날(default:오늘)보다 크거나 선택된 날의 일요일 ~ 선택된 날 사이의 날짜인 경우 false
          if (initLimitDay < mouseoverDay) {
            return false;
          } else if (initSelectSunday <= mouseoverDay && mouseoverDay <= initLimitDay) {
            if (this.options.selectDayType === 'weekday') {

            }
          }
          // if (this.options.selectDayType === 'weekday') {
          //   // 1주 평일의 경우 선택된 날(default:오늘)이 금, 토요일인 경우는 허용
          //   if (initSelectGetDay < 5 && initSelectSunday <= mouseoverDay && mouseoverDay <= initLimitDay) {
          //     return false;
          //   }
          // } else if (this.options.selectDayType === 'week') {
          //   // 1주의 경우 선택된 날(default:오늘)이 토요일인 경우는 허용
          //   if (initSelectGetDay < 6 && initSelectSunday <= mouseoverDay && mouseoverDay <= initLimitDay) {
          //     return false;
          //   }
          // }
        }
        // selectDayType에 따라 선택
        if (this.options.selectDayType === 'weekday') {
          // 1주평일(5일)
          let selectGetDay = idx % 7; // 요일
          if (selectGetDay >= 1 && selectGetDay <= 5) {
            for (let ix = 1, ixLen = 6; ix < ixLen; ix++) {
              if (ix < selectGetDay) {
                selectDayArr.push(leftAllDayCoordinate[idx - ix].date);
              } else if (ix >= selectGetDay) {
                selectDayArr.push(leftAllDayCoordinate[+(idx + (ix - selectGetDay))].date);
              }
              if (selectDayArr.length > this.options.selectDayLimit * 5) {
                selectDayArr.shift();
              }
            }
          } else if (selectGetDay === 0 || selectGetDay === 6) {
            for (let ix = 1, ixLen = 6; ix < ixLen; ix++) {
              selectDayArr.push(leftAllDayCoordinate[(+idx + +ix) - selectGetDay].date);
              if (selectDayArr.length > this.options.selectDayLimit * 5) {
                selectDayArr.shift();
              }
            }
          }
        } else if (this.options.selectDayType === 'week') {
          // 1주일(7일)
          let selectGetDay = idx % 7; // 요일
          for (let ix = 0, ixLen = 7; ix < ixLen; ix++) {
            selectDayArr.push(leftAllDayCoordinate[(+idx + +ix) - selectGetDay].date);
            if (selectDayArr.length > this.options.selectDayLimit * 7) {
              selectDayArr.shift();
            }
          }
        } else if (this.options.selectDayType === 'day') {
          // 하루
          selectDayArr.push(v.date);
          if (selectDayArr.length > this.options.selectDayLimit) {
            selectDayArr.shift();
          }
        }
        // 현재 마우스 클릭하려고 올려놓은 부분을 마우스무브 색상으로 fill
        this.dynamicDraw(
          overCtx, v.startX, v.startY,
          v.width, v.height,
          {
            fill: {
              show: true,
              color: this.options.colors.mousemoveDayFill,
            }
          }
        );
      }
    });
    // initSelectDayFlag change false
    this.options.initSelectDayFlag = false;
    // redraw select days
    leftAllDayCoordinate.forEach((v) => {
      selectDayArr.forEach((s) => {
        if (v.date.year === s.year && v.date.month === s.month && v.date.day === s.day) {
          this.dynamicDraw(
            overCtx, v.startX, v.startY,
            v.width, v.height,
            {
              fill: {
                show: true,
                color: this.options.colors.selectDayFill,
              }
            }
          );
        }
      });
    });
  }

  initMouseclick() {
    this.overCanvas.addEventListener('click', function(e) {
      e.preventDefault();
      const pickerAreaLeft = this.coordinate.pickerArea.left;
      const calendarAreaLeft = this.coordinate.calendarArea.left;
      // CLICK Date logic
      if (e.offsetY > calendarAreaLeft.startY && e.offsetY < (+calendarAreaLeft.startY + +calendarAreaLeft.height)) {
        this.mouseclickDate(e);
      }
      // CLICK triangle in picker area
      if (e.offsetY > pickerAreaLeft.startY && e.offsetY < (+pickerAreaLeft.startY + +pickerAreaLeft.height)) {
        const leftPickerArrows = this.coordinate.pickerArea.leftArrow;
        const leftPickerAreaOption = this.options.pickerArea.left;
        const currDate = this.options.currentYearMonth;
        let exist = false;
        leftPickerArrows.forEach((v, idx) => {
          exist = this.existTriangle(
            leftPickerArrows[idx].centerX, leftPickerArrows[idx].centerY,
            v.direction, leftPickerAreaOption.triangleLength, e.offsetX, e.offsetY
          );
          if (exist) {
            if (v.direction === 'left') {
              this.options.currentYearMonth = new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1);
            } else if (v.direction === 'right') {
              this.options.currentYearMonth = new Date(currDate.getFullYear(), +currDate.getMonth() + +1, 1);
            }
            this.initCalendarProperty();
            this.drawCanvas();
          }
        });
      }
    }.bind(this));
  }

  initMouseleave() {
    this.overCanvas.addEventListener('mouseleave', function(e) {
      e.preventDefault();
      const leftAllDayCoordinate = this.coordinate.calendarArea.leftAllDay;
      const selectDayArr = this.coordinate.calendarArea.leftSelectDayArr;
      const overCtx = this.overCtx;
      this.clearCanvas(overCtx, 0, 0, this.overCanvas.width, this.overCanvas.height);
      leftAllDayCoordinate.forEach((v) => {
        selectDayArr.forEach((s) => {
          if (v.date.year === s.year && v.date.month === s.month && v.date.day === s.day) {
            this.dynamicDraw(
              overCtx, v.startX, v.startY,
              v.width, v.height,
              {
                fill: {
                  show: true,
                  color: this.options.colors.selectDayFill,
                }
              }
            );
          }
        });
      });
    }.bind(this));
  }


  drawCanvas() {
    this.drawTotalArea();
    this.drawPickerArea();
    this.drawCalendarArea();
    // if (this.options.twoPageShow) {
    //   this.drawTimeArea();
    // }
    this.drawButtonArea();
    this.mouseclickDate();
  }

  drawTotalArea() {
    const ctx = this.context;
    const padding = this.options.padding;
    const style = {
      stroke: {
        show: true,
      },
    };
    // total Area = picker area + calendar area + button area
    // linewidth이 1이므로 total area에 선을 그을 때, p+c+b area의 보더 +1로 지정
    const gap = 1;
    this.clearCanvas(
      ctx,
      padding.left - gap - 1,
      padding.top - gap - 1,
      ((this.baseCanvas.width - padding.left) - padding.right) + +(gap * 2) + +2,
      ((this.baseCanvas.height - padding.top) - padding.bottom) + +(gap * 2) + +2,
    );
    this.dynamicDraw(
      ctx,
      padding.left - gap,
      padding.top - gap,
      ((this.baseCanvas.width - padding.left) - padding.right) + +(gap * 2),
      ((this.baseCanvas.height - padding.top) - padding.bottom) + +(gap * 2),
      style,
    );
  }

  drawPickerArea() {
    const ctx = this.context;
    const pickerArea = this.options.pickerArea;
    const leftPickerAreaOption = this.options.pickerArea.left;
    if (pickerArea.left.show) {
      this.coordinate.pickerArea.leftArrow = [];
      const pickerAreaLeft = this.coordinate.pickerArea.left;
      const gap = 1;
      // draw bottom line in picker area
      ctx.beginPath();
      ctx.moveTo(
        pickerAreaLeft.startX - gap,
        +pickerAreaLeft.startY + +pickerAreaLeft.height,
      );
      ctx.lineTo(
        +pickerAreaLeft.startX + +pickerAreaLeft.width + +(gap * 2),
        +pickerAreaLeft.startY + +pickerAreaLeft.height,
      );
      ctx.stroke();
      ctx.closePath();

      // draw triange in picker area
      const rightArrow = {
        centerX: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (7 / 8)),
        centerY: +pickerAreaLeft.startY + +(pickerAreaLeft.height / 2),
        direction: 'right',
        length: leftPickerAreaOption.triangleLength,
      };
      this.coordinate.pickerArea.leftArrow.push(rightArrow);
      this.drawTriangle(
        ctx, rightArrow.centerX, rightArrow.centerY,
        rightArrow.direction, rightArrow.length,
      );

      const leftArrow = {
        centerX: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (1 / 8)),
        centerY: +pickerAreaLeft.startY + +(pickerAreaLeft.height / 2),
        direction: 'left',
        length: leftPickerAreaOption.triangleLength,
      };
      this.coordinate.pickerArea.leftArrow.push(leftArrow);
      this.drawTriangle(
        ctx, leftArrow.centerX, leftArrow.centerY,
        leftArrow.direction, leftArrow.length,
      );

      // draw year TEXT
      const thisYear = this.options.currentYearMonth.getFullYear();
      this.coordinate.pickerArea.leftYear = {
        x: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (1 / 4)),
        y: +pickerAreaLeft.startY,
        width: pickerAreaLeft.width * (1 / 4),
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
      const thisMonth = this.options.currentYearMonth.getMonth();
      const thisMonthText = this.options.monthArr[this.options.titleType.month][thisMonth];
      this.coordinate.pickerArea.leftMonth = {
        x: +pickerAreaLeft.startX + +(pickerAreaLeft.width * (2 / 4)),
        y: +pickerAreaLeft.startY,
        width: pickerAreaLeft.width * (1 / 4),
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
    //     this.dynamicDraw(
    //      ctx, pickerAreaRight.startX, pickerAreaRight.startY,
    //      pickerAreaRight.width, pickerAreaRight.height
    //    );
    //   }
    // }
  }
  drawCalendarArea() {
    this.drawCalendarDayOfTheWeek();
    this.drawCalendarDay();
  }

  // DRAW ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  drawCalendarDayOfTheWeek() {
    const ctx = this.context;
    const calendarAreaWeekLeft = this.coordinate.calendarArea.leftDayOfTheWeek;
    calendarAreaWeekLeft.forEach((v, idx) => {
      this.dynamicDraw(
        ctx,
        v.startX, v.startY,
        v.width, v.height,
        {
          fillText: {
            show: true,
            text: this.options.dayOfTheWeekArr[this.options.titleType.dayOfTheWeek][idx],
          },
          stroke: {
            show: false,
          },
          align: 'center',
          padding: { bottom: 8 },
          font: '10px Roboto Condensed',
        },
      );
    });
  }

  // DRAW 1일 ~ 31일
  drawCalendarDay() {
    const ctx = this.context;
    // 일자 좌표 저장 배열 초기화
    this.coordinate.calendarArea.leftAllDay = [];
    // 요일, 일자 좌표 데이터
    const calendarAreaLeftInner = this.coordinate.calendarArea.leftInner;
    // 요일 영역 높이
    const dayOfTheWeekHeight = this.options.dayOfTheWeekArr.height;
    // canvas clear (day area)
    this.clearCanvas(
      ctx,
      calendarAreaLeftInner.startX, +calendarAreaLeftInner.startY + +this.options.dayOfTheWeekArr.height,
      calendarAreaLeftInner.width, calendarAreaLeftInner.height - this.options.dayOfTheWeekArr.height
    );

    // 현재 달력 연도
    const currentYear = this.options.currentYearMonth.getFullYear();
    // 현재 달력 월
    const currentMonth = +this.options.currentYearMonth.getMonth() + +1;

    // draw DAY NUMBER
    for (let ix = 0, ixLen = this.thisMonthWeekCnt; ix < ixLen; ix++) {
      for (let jx = 0; jx < 7; jx++) {
        let obj = {};
        //// 첫번째 주
        if (ix === 0) {
          // true : 첫 주에 이번달 시작, false : 첫 주는 모두 저번달
          const thisMonthStartFlag = this.thisMonthFirstDay !== 0 ? true : false;
          const firstWeekDayCnt = thisMonthStartFlag ? this.thisMonthFirstDay : 7;
          if (jx < firstWeekDayCnt) {
            if (!thisMonthStartFlag && jx === 6) {
              this.monthDay = 0;
            }
            // 1일 이전
            obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText: {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: ((+this.prevMonthLastDate - +firstWeekDayCnt) + +jx) + +1,
                },
                fill: {
                  show: false,
                },
                align: 'center',
                padding: {
                  bottom: 8
                },
                font: '10px Roboto Condensed',
              },
              selectable: false,
              date: {
                year: currentMonth !== 1 ? currentYear : currentYear - 1,
                month: currentMonth !== 1 ? currentMonth - 1 : 12,
                day: ((+this.prevMonthLastDate - +firstWeekDayCnt) + +jx) + +1
              }
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          } else if (jx === firstWeekDayCnt) {
            // 1일
            this.monthDay = 1;
            let fillText = {
              show: true,
              text: 1,
            };
            let fill = {
              show: true,
              color: this.options.colors.thisMonthFill,
            };
            let selectableFlag = true;
            if (this.options.limitToday) {
              const currentDate = new Date(currentYear, currentMonth - 1, 1);
              const initLimitDay = this.options.initLimitDay;
              if (initLimitDay < currentDate) {
                fillText = {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: 1,
                };
                fill = {
                  show: false,
                };
                selectableFlag = false;
              }
            }
            obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText,
                fill,
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
              selectable: selectableFlag,
              date: {
                year: currentYear,
                month: currentMonth,
                day: 1
              }
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          } else {
            // 2일 이후
            this.monthDay++;
            let fillText = {
              show: true,
              text: this.monthDay,
            };
            let fill = {
              show: true,
              color: this.options.colors.thisMonthFill,
            };
            let selectableFlag = true;
            if (this.options.limitToday) {
              const currentDate = new Date(currentYear, currentMonth - 1, this.monthDay);
              const initLimitDay = this.options.initLimitDay;
              if (initLimitDay < currentDate) {
                fillText = {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: this.monthDay,
                };
                fill = {
                  show: false,
                };
                selectableFlag = false;
              }
            }
            obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight,
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText,
                fill,
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
              selectable: selectableFlag,
              date: {
                year: currentYear,
                month: currentMonth,
                day: this.monthDay
              }
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
        } else if (this.thisMonthLastDate <= this.monthDay) {
          //// 마지막 주의 다음달 날짜
          this.monthDay++;
          obj = {
            startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
            width: calendarAreaLeftInner.width / 7,
            startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight
            + (((calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt) * ix),
            height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
            style: {
              fillText: {
                show: true,
                color: this.options.colors.prevNextMonthFont,
                text: this.monthDay - this.thisMonthLastDate,
              },
              align: 'center',
              padding: { bottom: 8 },
              font: '10px Roboto Condensed',
            },
            selectable: false,
            date: {
              year: currentMonth !== 12 ? currentYear : +currentYear + +1,
              month: currentMonth !== 12 ? +currentMonth + +1 : 1,
              day: this.monthDay - this.thisMonthLastDate
            }
          };
          this.coordinate.calendarArea.leftAllDay.push(obj);
          this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
        } else {
          // true : 첫 주에 이번달 시작, false : 첫 주는 모두 저번달(2주차 첫번째 무조건 일요일부터 시작)
          const thisMonthStartFlag = this.thisMonthFirstDay !== 0 ? true : false;
          if (!thisMonthStartFlag && ix === 1 && jx === 0) {
            this.monthDay = 1;
            let fillText = {
              show: true,
              text: 1,
            };
            let fill = {
              show: true,
              color: this.options.colors.thisMonthFill,
            };
            let selectableFlag = true;
            if (this.options.limitToday) {
              const currentDate = new Date(currentYear, currentMonth - 1, 1);
              const initLimitDay = this.options.initLimitDay;
              if (initLimitDay < currentDate) {
                fillText = {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: 1,
                };
                fill = {
                  show: false,
                };
                selectableFlag = false;
              }
            }
            obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
              width: calendarAreaLeftInner.width / 7,
              startY: +(calendarAreaLeftInner.startY + dayOfTheWeekHeight)
                + +((calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt),
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText,
                fill,
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
              selectable: selectableFlag,
              date: {
                year: currentYear,
                month: currentMonth,
                day: this.monthDay
              }
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          } else {
            this.monthDay++;
            let fillText = {
              show: true,
              text: this.monthDay,
            };
            let fill = {
              show: true,
              color: this.options.colors.thisMonthFill,
            };
            let selectableFlag = true; // 선택 여부
            if (this.options.limitToday) {
              const currentDate = new Date(currentYear, currentMonth - 1, this.monthDay);
              const initLimitDay = this.options.initLimitDay;
              if (initLimitDay < currentDate) {
                fillText = {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: this.monthDay,
                };
                fill = {
                  show: false,
                };
                selectableFlag = false;
              }
            }
            obj = {
              startX: calendarAreaLeftInner.startX + ((calendarAreaLeftInner.width / 7) * jx),
              width: calendarAreaLeftInner.width / 7,
              startY: calendarAreaLeftInner.startY + dayOfTheWeekHeight
              + (((calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt) * ix),
              height: (calendarAreaLeftInner.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText,
                fill,
                align: 'center',
                padding: { bottom: 8 },
                font: '10px Roboto Condensed',
              },
              selectable: selectableFlag,
              date: {
                year: currentYear,
                month: currentMonth,
                day: this.monthDay
              }
            };
            this.coordinate.calendarArea.leftAllDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
        }
      }
    }
  }

  setSelectDays() {
    const selectDayType = this.options.selectDayType;
    const selectDayArr = this.coordinate.calendarArea.leftSelectDayArr;
    if (selectDayType === 'day') {

    }
    return selectDayArr;
  }

  drawTimeArea() {
    const ctx = this.context;
    const calendarAreaRight = this.coordinate.calendarArea.right;
    this.dynamicDraw(
      ctx, calendarAreaRight.startX, calendarAreaRight.startY,
      calendarAreaRight.width, calendarAreaRight.height,
    );
  }

  drawButtonArea() {
    const ctx = this.context;
    const buttonArea = this.options.buttonArea;
    if (buttonArea.left.show) {
      const buttonAreaLeft = this.coordinate.buttonArea.left;
      this.dynamicDraw(
        ctx, buttonAreaLeft.startX, buttonAreaLeft.startY,
        buttonAreaLeft.width, buttonAreaLeft.height,
      );
    }
    // if (this.options.twoPageShow) {
    //   if (buttonArea.right.show) {
    //     const buttonAreaRight = this.coordinate.buttonArea.right;
    //     this.dynamicDraw(
    //      ctx, buttonAreaRight.startX, buttonAreaRight.startY,
    //      buttonAreaRight.width, buttonAreaRight.height
    //      );
    //   }
    // }
  }

  // DRAW multiple function
  dynamicDraw(context, x, y, width, height, style) {
    if (style) {
      const mergedStyle = _.merge({}, this.options.styleObj, style);
      const ctx = context;

      if (mergedStyle.stroke && mergedStyle.stroke.show) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(+x + +width, +y);
        ctx.lineTo(+x + +width, +y + +height);
        ctx.lineTo(x, +y + +height);
        ctx.lineTo(x, y);
        ctx.lineWidth = mergedStyle.stroke.linewidth;
        ctx.strokeStyle = mergedStyle.stroke.color;
        ctx.stroke();
        ctx.closePath();
      }
      if (mergedStyle.fill && mergedStyle.fill.show) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = mergedStyle.fill.color;
        ctx.fill();
      }
      if (mergedStyle.fillText.show && mergedStyle.fillText.text) {
        ctx.font = mergedStyle.font;
        const textWidth = mergedStyle.fillText.text ?
          ctx.measureText(mergedStyle.fillText.text).width : 0;
        let textStartX;
        if (mergedStyle.align === 'center') {
          textStartX = (+x + +(width / 2)) - (textWidth / 2);
        } else if (mergedStyle.align === 'right') {
          textStartX = (+x + +width) - mergedStyle.padding.right - textWidth;
        } else if (mergedStyle.align === 'left') {
          textStartX = +x + +mergedStyle.padding.left;
        }
        const textStartY = (+y + +height) - mergedStyle.padding.bottom;
        if (mergedStyle.fillText.color) {
          ctx.fillStyle = mergedStyle.fillText.color;
        }
        ctx.fillText(mergedStyle.fillText.text, textStartX, textStartY);
      }
    }
  }

  // 중심점을 기준으로 left, right 방향으로 삼각형 그리기
  drawTriangle(context, x, y, direction, length) {
    const ctx = context;
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (direction === 'right') {
      ctx.lineTo(x, y - (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(+x + +(Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, +y + +(Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x, y);
    } else if (direction === 'left') {
      ctx.lineTo(x, y - (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x - (Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, +y + +(Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x, y);
    }
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.closePath();
  }

  // 삼각형 안에 (px,py)이 존재하는지 확인
  existTriangle(x, y, direction, length, px, py) {
    const vs = [];
    const v1 = {
      x: direction === 'right'
        ? +x + +(Math.cos(this.toRadians(30)) * length)
        : x - (Math.cos(this.toRadians(30)) * length),
      y: y,
    };
    vs.push(v1);
    const v2 = {
      x: x,
      y: y - (Math.sin(this.toRadians(30)) * length),
    };
    vs.push(v2);
    const v3 = {
      x: x,
      y: +y + +(Math.sin(this.toRadians(30)) * length),
    };
    vs.push(v3);
    const p = {
      x: px,
      y: py,
    };
    return this.pointInPolygon(p, vs);
  }

  /**
   * @param p   해당 point
   * @param vs  다각형 모든 점{x, y}들의 배열
   * @returns {boolean}
   */
  pointInPolygon(p, vs) {
    let inside = false;
    const x = p.x;
    const y = p.y;
    for (let ix = 0, ixLen = vs.length - 1; ix < vs.length; ixLen = ix++) {
      const x1 = vs[ix].x;
      const y1 = vs[ix].y;
      const x2 = vs[ixLen].x;
      const y2 = vs[ixLen].y;
      const intersect = ((y1 > y) != (y2 > y)) && (x < +(((x2 - x1) * (y - y1)) / (y2 - y1)) + +x1);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  toRadians(angle) {
    return angle * (Math.PI / 180.0);
  }

  // 해당 연, 월로 마지막 일자 구함
  getLastDayOfMonth(m, y) {
    let day = 30;
    switch (m) {
      case 4:
      case 6:
      case 9:
      case 11:
        day = 30;
        break;
      case 2:
        if (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0)) {
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
  }

  clearCanvas(ctx, x, y, width, height) {
    if (ctx) {
      if (x && y && width && height) {
        ctx.clearRect(x, y, width, height);
      } else {
        ctx.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
      }
    } else {
      const ctx = this.context;
      if (x && y && width && height) {
        ctx.clearRect(x, y, width, height);
      } else {
        ctx.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
      }
    }
  }
}

export default Calendar;
