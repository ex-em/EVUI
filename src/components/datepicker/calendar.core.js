/*eslint-disable*/
// import moment from 'moment';
import _ from 'lodash';

class Calendar {
  constructor(target, options) {
    const obj = {
      // default width, height(onePage)
      width: 235,
      height: 220,
      // style
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
        triangleLength: 15,
        height: 25,
      },
      calendarArea: {
      },
      timeArea: {
        titleWidth: 50,
        pageWidth: 30,
        active: {
          hour: true,
          minute: true,
          second: true,
        },
        // timeArea안에 hour, min, sec가 한 페이지에 몇 row * column으로 구성되는지
        columnCount: 6,
        rowCount: 2,
        triangleLength: 13,
      },

      // canvas context style
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
      // selectable: true, // 선택 가능 여부 (이번달 & 오늘 전까지)

      // init title
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
      timeTypeName: ['hour', 'minute', 'second'],
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
        total: {}, // pickerArea 전체 좌표 (삼각형, 년, 월)
        arrow: [], // 양쪽 삼각형
        year: {}, // 년 타이틀 영역
        month: {}, // 월 타이틀 영역
      },
      calendarArea: {
        total: {}, // calendarArea 전체 좌표 (요일, 날짜 부분)
        dayOfTheWeek: [], // 모든요일 좌표(일 ~ 토)
        allDay: [], // 1달 날짜 좌표
        selectDayArr: [], // 선택한 날짜 저장(월이 바뀐 경우에도)
      },
      timeArea: {
        total: {}, // 전체 좌표
        hour: {
          total: {}, // hour영역 전체 좌표
          data: [], // 0 ~ 23 box 좌표
          arrow: [], // 상,하 화살표
          page: 1, // 페이지(1 ~ 2)
          select: 0, // 선택한 시
        },
        minute: {
          total: {},
          data: [], // 0 ~ 59 box 좌표
          arrow: [],
          page: 1, // 페이지(1 ~ 5)
          select: 0, // 선택한 분
        },
        second: {
          total: {},
          data: [],
          arrow: [],
          page: 1, // 페이지(1 ~ 5)
          select: 0, // 선택한 초
        },
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
    if (this.options.initSelectDay) {
      this.options.initSelectDay = this.options.initSelectDay.setHours(0, 0, 0, 0);
    }
    if (this.options.initLimitDay) {
      this.options.initLimitDay = this.options.initLimitDay.setHours(0, 0, 0, 0);
    }
    if (this.options.initSelectDay) {
      const initSelectDay = new Date(this.options.initSelectDay);
      this.options.currentYearMonth =
        new Date(initSelectDay.getFullYear(), initSelectDay.getMonth(), 1);
    }
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

    // set canvas coordinate
    const padding = this.options.padding;
    const pickerAreaHeight = this.options.pickerArea.height;
    let commonAreaTotalWidth = this.options.width - padding.left - padding.right;
    if (this.options.twoPageShow) {
      commonAreaTotalWidth = this.options.width - padding.left;
    }
    this.coordinate.pickerArea.total = {
      startX: padding.left,
      width: commonAreaTotalWidth,
      startY: padding.top,
      height: pickerAreaHeight,
    };
    this.coordinate.calendarArea.total = {
      startX: padding.left,
      width: commonAreaTotalWidth,
      startY: +padding.top + +pickerAreaHeight,
      height: this.baseCanvas.height - pickerAreaHeight - padding.top - padding.bottom,
    };

    this.coordinate.calendarArea.dayOfTheWeek = [];
    for (let ix = 0, ixLen = 7; ix < ixLen; ix++) {
      const calendarAreaTotal = this.coordinate.calendarArea.total;
      const obj = {
        startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * (ix)),
        width: (calendarAreaTotal.width / 7),
        startY: calendarAreaTotal.startY,
        height: this.options.dayOfTheWeekArr.height,
        text: this.options.dayOfTheWeekArr[this.options.titleType.dayOfTheWeek][ix],
      };
      this.coordinate.calendarArea.dayOfTheWeek.push(obj);
    }

    // 2page일 때 hour, minute, second 영역 init
    if (this.options.twoPageShow) {
      this.coordinate.timeArea.total = {
        startX: this.baseCanvas.width / 2,
        width: this.options.width - padding.right,
        startY: padding.top,
        height: this.baseCanvas.height - padding.top - padding.bottom,
      };
      this.options.timeTypeName.forEach((v, idx) => {
        this.coordinate.timeArea[v].total = {
          startX: (this.baseCanvas.width / 2) + this.options.timeArea.titleWidth + 1,
          width: this.options.width - padding.right - this.options.timeArea.titleWidth
          - this.options.timeArea.pageWidth - 2.5,
          startY: padding.top + (((this.coordinate.timeArea.total.height - 2) / 3) * idx) + idx + (idx > 0 ? 0.5 : 0),
          height: ((this.coordinate.timeArea.total.height - 2) / 3) - 0.5,
        }
      });
    }
  }

  initCalendarProperty() {
    // 이번달 thisMonth월
    const thisMonth = this.options.currentYearMonth.getMonth() + 1;
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
      // init clear all canvas
      this.clearCanvas(
        overCtx, 0, 0,
        this.overCanvas.width, this.overCanvas.height
      );
      // mousemove on day box in calendar area
      const allDay = this.coordinate.calendarArea.allDay;
      const selectDayArr = this.coordinate.calendarArea.selectDayArr;
      allDay.forEach((v) => {
        if (e.offsetX > v.startX && e.offsetX < v.startX + v.width
          && e.offsetY > v.startY && e.offsetY < v.startY + v.height
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
          if (v.date.year === s.year
            && v.date.month === s.month
            && v.date.day === s.day) {
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
      const pickerAreaArrow = this.coordinate.pickerArea.arrow;
      const pickerAreaOption = this.options.pickerArea;
      let pickerAreaArrowOver = false;
      pickerAreaArrow.forEach((v, idx) => {
        pickerAreaArrowOver = this.existTriangle(
          pickerAreaArrow[idx].centerX, pickerAreaArrow[idx].centerY,
          v.direction, pickerAreaOption.triangleLength, e.offsetX, e.offsetY
        );
        if (pickerAreaArrowOver) {
          mouseoverFlag = true;
        }
      });

      // mousemove on hour, minute, second box
      const timeTypeName = this.options.timeTypeName;
      const timeAreaHourTotal = this.coordinate.timeArea.hour.total;
      if (e.offsetX > timeAreaHourTotal.startX && e.offsetX < timeAreaHourTotal.startX + timeAreaHourTotal.width) {
        timeTypeName.forEach((type) => {
          const timeAreaTypeData = this.coordinate.timeArea[type].data;
          timeAreaTypeData.forEach((v) => {
            if (this.coordinate.timeArea.hour.page === v.page) {
              if (e.offsetY > v.startY && e.offsetY < v.startY + v.height
                && e.offsetX > v.startX && e.offsetX < v.startX + v.width) {
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
                mouseoverFlag = true;
              }
            }
          });
        });

      }

      // // mousemove on hour box
      // const timeAreaHourTotal = this.coordinate.timeArea.hour.total;
      // if (e.offsetX > timeAreaHourTotal.startX && e.offsetX < timeAreaHourTotal.startX + timeAreaHourTotal.width) {
      //   const timeAreaHourData = this.coordinate.timeArea.hour.data;
      //   timeAreaHourData.forEach((v) => {
      //     if (this.coordinate.timeArea.hour.page === v.page) {
      //       if (e.offsetY > v.startY && e.offsetY < +v.startY + +v.height
      //         && e.offsetX > v.startX && e.offsetX < +v.startX + +v.width) {
      //         this.dynamicDraw(
      //           overCtx, v.startX, v.startY,
      //           v.width, v.height,
      //           {
      //             fill: {
      //               show: true,
      //               color: this.options.colors.mousemoveDayFill,
      //             }
      //           }
      //         );
      //         mouseoverFlag = true;
      //       }
      //     }
      //   });
      //   const timeAreaMinuteData = this.coordinate.timeArea.minute.data;
      //   timeAreaMinuteData.forEach((v) => {
      //     if (this.coordinate.timeArea.minute.page === v.page) {
      //       if (e.offsetY > v.startY && e.offsetY < +v.startY + +v.height
      //         && e.offsetX > v.startX && e.offsetX < +v.startX + +v.width) {
      //         this.dynamicDraw(
      //           overCtx, v.startX, v.startY,
      //           v.width, v.height,
      //           {
      //             fill: {
      //               show: true,
      //               color: this.options.colors.mousemoveDayFill,
      //             }
      //           }
      //         );
      //         mouseoverFlag = true;
      //       }
      //     }
      //   });
      //   const timeAreaSecondData = this.coordinate.timeArea.second.data;
      //   timeAreaSecondData.forEach((v) => {
      //     if (this.coordinate.timeArea.second.page === v.page) {
      //       if (e.offsetY > v.startY && e.offsetY < +v.startY + +v.height
      //         && e.offsetX > v.startX && e.offsetX < +v.startX + +v.width) {
      //         this.dynamicDraw(
      //           overCtx, v.startX, v.startY,
      //           v.width, v.height,
      //           {
      //             fill: {
      //               show: true,
      //               color: this.options.colors.mousemoveDayFill,
      //             }
      //           }
      //         );
      //         mouseoverFlag = true;
      //       }
      //     }
      //   });
      // }


      if (mouseoverFlag) {
        this.overCanvas.style.cursor = 'pointer';
      } else {
        this.overCanvas.style.cursor = 'default';
      }
    }.bind(this));
  }

  mouseclickDate(e) {
    const allDay = this.coordinate.calendarArea.allDay;
    const selectDayArr = this.coordinate.calendarArea.selectDayArr;
    const overCtx = this.overCtx;
    this.clearCanvas(
      overCtx, 0, 0,
      this.options.width, this.overCanvas.height
    ); // calendar영역만 clear
    let mouseclickCondition = false;
    allDay.forEach((v, idx) => {
      // type이 'day'일 때 initSelectDay(최초 선택날짜)여부에 따라 선택
      if (this.options.initSelectDayFlag && this.options.selectDayType === 'day') {
        const initSelectDay = new Date(this.options.initSelectDay);
        if (v.date.year === initSelectDay.getFullYear()
          && v.date.month === initSelectDay.getMonth() + 1
          && v.date.day === initSelectDay.getDate()) {
          selectDayArr.push(v.date);
        }
      }
      // mouseevent가 없을 시 redraw selected day
      if (e) {
        mouseclickCondition = (e.offsetX > v.startX
          && e.offsetX < v.startX + v.width
          && e.offsetY > v.startY
          && e.offsetY < v.startY + v.height
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
              // 개발 필요
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
                selectDayArr.push(allDay[idx - ix].date);
              } else if (ix >= selectGetDay) {
                selectDayArr.push(allDay[(idx + ix) - selectGetDay].date);
              }
              if (selectDayArr.length > this.options.selectDayLimit * 5) {
                selectDayArr.shift();
              }
            }
          } else if (selectGetDay === 0 || selectGetDay === 6) {
            for (let ix = 1, ixLen = 6; ix < ixLen; ix++) {
              selectDayArr.push(allDay[(idx + ix) - selectGetDay].date);
              if (selectDayArr.length > this.options.selectDayLimit * 5) {
                selectDayArr.shift();
              }
            }
          }
        } else if (this.options.selectDayType === 'week') {
          // 1주일(7일)
          let selectGetDay = idx % 7; // 요일
          for (let ix = 0, ixLen = 7; ix < ixLen; ix++) {
            selectDayArr.push(allDay[(idx + ix) - selectGetDay].date);
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
    allDay.forEach((v) => {
      selectDayArr.forEach((s) => {
        if (v.date.year === s.year
          && v.date.month === s.month
          && v.date.day === s.day) {
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

  mouseclickHour(e) {
    const timeAreaHour = this.coordinate.timeArea.hour.data;
    const selectHour = this.coordinate.timeArea.hour.select;
    const overCtx = this.overCtx;

  }

  initMouseclick() {
    this.overCanvas.addEventListener('click', function(e) {
      e.preventDefault();
      const pickerAreaTotal = this.coordinate.pickerArea.total;
      const calendarAreaTotal = this.coordinate.calendarArea.total;
      // CLICK Date logic
      if (e.offsetY > calendarAreaTotal.startY
        && e.offsetY < calendarAreaTotal.startY + calendarAreaTotal.height) {
        this.mouseclickDate(e);
      }
      // CLICK triangle in picker area
      if (e.offsetY > pickerAreaTotal.startY
        && e.offsetY < pickerAreaTotal.startY + pickerAreaTotal.height) {
        const pickerAreaArrow = this.coordinate.pickerArea.arrow;
        const pickerAreaOption = this.options.pickerArea;
        const currDate = this.options.currentYearMonth;
        let exist = false;
        pickerAreaArrow.forEach((v, idx) => {
          exist = this.existTriangle(
            pickerAreaArrow[idx].centerX, pickerAreaArrow[idx].centerY,
            v.direction, pickerAreaOption.triangleLength, e.offsetX, e.offsetY
          );
          if (exist) {
            if (v.direction === 'left') {
              this.options.currentYearMonth =
                new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1);
            } else if (v.direction === 'right') {
              this.options.currentYearMonth =
                new Date(currDate.getFullYear(), +currDate.getMonth() + +1, 1);
            }
            this.initCalendarProperty();
            this.drawCanvas();
          }
        });
      }

      // click on hour box
      const timeAreaHourTotal = this.coordinate.timeArea.hour.total;
      const overCtx = this.overCtx;
      // in Hour, Min, Sec Area (in X position)
      if (e.offsetX > timeAreaHourTotal.startX
        && e.offsetX < timeAreaHourTotal.startX + timeAreaHourTotal.width) {
        const timeAreaHourTotal = this.coordinate.timeArea.hour.total;
        const timeAreaHourData = this.coordinate.timeArea.hour.data;
        timeAreaHourData.forEach((v) => {
          if (e.offsetY > v.startY && e.offsetY < v.startY + v.height
            && e.offsetX > v.startX && e.offsetX < v.startX + v.width) {
            this.clearCanvas(
              overCtx, timeAreaHourTotal.startX, timeAreaHourTotal.startY,
              timeAreaHourTotal.width, timeAreaHourTotal.height,
            );
            this.dynamicDraw(
              overCtx, v.startX, v.startY,
              v.width, v.height,
              {
                fill: {
                  show: true,
                  color: this.options.colors.selectDayFill,
                }
              },
            );
          }
        });
      }
    }.bind(this));
  }

  initMouseleave() {
    this.overCanvas.addEventListener('mouseleave', function(e) {
      e.preventDefault();
      const allDay = this.coordinate.calendarArea.allDay;
      const selectDayArr = this.coordinate.calendarArea.selectDayArr;
      const overCtx = this.overCtx;
      this.clearCanvas(overCtx, 0, 0, this.overCanvas.width, this.overCanvas.height);
      allDay.forEach((v) => {
        selectDayArr.forEach((s) => {
          if (v.date.year === s.year
            && v.date.month === s.month
            && v.date.day === s.day) {
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
    if (this.options.twoPageShow) {
      this.drawSplitLine();
      this.drawTimeArea();
    }
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
      ((this.baseCanvas.width - padding.left) - padding.right) + (gap * 2) + 2,
      ((this.baseCanvas.height - padding.top) - padding.bottom) + (gap * 2) + 2,
    );
    this.dynamicDraw(
      ctx,
      padding.left - gap,
      padding.top - gap,
      ((this.baseCanvas.width - padding.left) - padding.right) + (gap * 2),
      ((this.baseCanvas.height - padding.top) - padding.bottom) + (gap * 2),
      style,
    );
  }

  drawPickerArea() {
    const ctx = this.context;
    const pickerAreaOption = this.options.pickerArea;
    this.coordinate.pickerArea.arrow = [];
    const pickerAreaTotal = this.coordinate.pickerArea.total;
    // draw bottom line in picker area
    ctx.beginPath();
    ctx.moveTo(
      pickerAreaTotal.startX,
      +pickerAreaTotal.startY + +pickerAreaTotal.height,
    );
    ctx.lineTo(
      +pickerAreaTotal.startX + +pickerAreaTotal.width,
      +pickerAreaTotal.startY + +pickerAreaTotal.height,
    );
    ctx.stroke();
    ctx.closePath();

    // draw triange in picker area
    let arrowObj = {};
    arrowObj = {
      centerX: pickerAreaTotal.startX + (pickerAreaTotal.width * (7 / 8)),
      centerY: pickerAreaTotal.startY + (pickerAreaTotal.height / 2),
      direction: 'right',
      length: pickerAreaOption.triangleLength,
    };
    this.coordinate.pickerArea.arrow.push(arrowObj);
    this.drawTriangle(
      ctx, arrowObj.centerX, arrowObj.centerY,
      arrowObj.direction, arrowObj.length,
    );

    arrowObj = {
      centerX: pickerAreaTotal.startX + (pickerAreaTotal.width * (1 / 8)),
      centerY: pickerAreaTotal.startY + (pickerAreaTotal.height / 2),
      direction: 'left',
      length: pickerAreaOption.triangleLength,
    };
    this.coordinate.pickerArea.arrow.push(arrowObj);
    this.drawTriangle(
      ctx, arrowObj.centerX, arrowObj.centerY,
      arrowObj.direction, arrowObj.length,
    );

    // draw year TEXT
    const thisYear = this.options.currentYearMonth.getFullYear();
    this.coordinate.pickerArea.year = {
      x: pickerAreaTotal.startX + (pickerAreaTotal.width * (1 / 4)),
      y: pickerAreaTotal.startY,
      width: pickerAreaTotal.width * (1 / 4),
      height: pickerAreaTotal.height,
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
      this.coordinate.pickerArea.year.x, this.coordinate.pickerArea.year.y,
      this.coordinate.pickerArea.year.width, this.coordinate.pickerArea.year.height,
      this.coordinate.pickerArea.year.style,
    );

    // draw month TEXT
    const thisMonth = this.options.currentYearMonth.getMonth();
    const thisMonthText = this.options.monthArr[this.options.titleType.month][thisMonth];
    this.coordinate.pickerArea.month = {
      x: pickerAreaTotal.startX + (pickerAreaTotal.width * (2 / 4)),
      y: pickerAreaTotal.startY,
      width: pickerAreaTotal.width * (1 / 4),
      height: pickerAreaTotal.height,
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
      this.coordinate.pickerArea.month.x, this.coordinate.pickerArea.month.y,
      this.coordinate.pickerArea.month.width, this.coordinate.pickerArea.month.height,
      this.coordinate.pickerArea.month.style,
    );
  }

  drawCalendarArea() {
    this.drawCalendarDayOfTheWeek();
    this.drawCalendarDay();
  }

  // DRAW ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  drawCalendarDayOfTheWeek() {
    const ctx = this.context;
    const dayOfTheWeek = this.coordinate.calendarArea.dayOfTheWeek;
    dayOfTheWeek.forEach((v, idx) => {
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
    this.coordinate.calendarArea.allDay = [];
    // 요일, 일자 좌표 데이터
    const calendarAreaTotal = this.coordinate.calendarArea.total;
    // 요일 영역 높이
    const dayOfTheWeekHeight = this.options.dayOfTheWeekArr.height;
    // canvas clear (day area)
    this.clearCanvas(
      ctx,
      calendarAreaTotal.startX, calendarAreaTotal.startY + this.options.dayOfTheWeekArr.height,
      calendarAreaTotal.width, calendarAreaTotal.height - this.options.dayOfTheWeekArr.height
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
              startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
              width: calendarAreaTotal.width / 7,
              startY: calendarAreaTotal.startY + dayOfTheWeekHeight,
              height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
              style: {
                fillText: {
                  show: true,
                  color: this.options.colors.prevNextMonthFont,
                  text: ((this.prevMonthLastDate - firstWeekDayCnt) + jx) + 1,
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
            this.coordinate.calendarArea.allDay.push(obj);
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
              startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
              width: calendarAreaTotal.width / 7,
              startY: calendarAreaTotal.startY + dayOfTheWeekHeight,
              height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
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
            this.coordinate.calendarArea.allDay.push(obj);
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
              startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
              width: calendarAreaTotal.width / 7,
              startY: calendarAreaTotal.startY + dayOfTheWeekHeight,
              height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
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
            this.coordinate.calendarArea.allDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
        } else if (this.thisMonthLastDate <= this.monthDay) {
          //// 마지막 주의 다음달 날짜
          this.monthDay++;
          obj = {
            startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
            width: calendarAreaTotal.width / 7,
            startY: calendarAreaTotal.startY + dayOfTheWeekHeight
            + (((calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt) * ix),
            height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
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
              year: currentMonth !== 12 ? currentYear : currentYear + 1,
              month: currentMonth !== 12 ? currentMonth + 1 : 1,
              day: this.monthDay - this.thisMonthLastDate
            }
          };
          this.coordinate.calendarArea.allDay.push(obj);
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
              startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
              width: calendarAreaTotal.width / 7,
              startY: +(calendarAreaTotal.startY + dayOfTheWeekHeight)
                + +((calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt),
              height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
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
            this.coordinate.calendarArea.allDay.push(obj);
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
              startX: calendarAreaTotal.startX + ((calendarAreaTotal.width / 7) * jx),
              width: calendarAreaTotal.width / 7,
              startY: calendarAreaTotal.startY + dayOfTheWeekHeight
              + (((calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt) * ix),
              height: (calendarAreaTotal.height - dayOfTheWeekHeight) / this.thisMonthWeekCnt,
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
            this.coordinate.calendarArea.allDay.push(obj);
            this.dynamicDraw(ctx, obj.startX, obj.startY, obj.width, obj.height, obj.style);
          }
        }
      }
    }
  }

  // 아직 미완
  setSelectDays() {
    const selectDayType = this.options.selectDayType;
    const selectDayArr = this.coordinate.calendarArea.selectDayArr;
    if (selectDayType === 'day') {

    }
    return selectDayArr;
  }

  // 2페이지 일 때 우측 영역의 선 그리기
  drawSplitLine() {
    const ctx = this.context;
    const padding = this.options.padding;
    ctx.beginPath();
    // 중앙 세로
    ctx.moveTo(this.baseCanvas.width / 2, padding.top);
    ctx.lineTo(this.baseCanvas.width / 2, this.baseCanvas.height - padding.top);
    // title|content 세로
    ctx.moveTo((this.baseCanvas.width / 2) + this.options.timeArea.titleWidth, padding.top);
    ctx.lineTo((this.baseCanvas.width / 2) + this.options.timeArea.titleWidth, this.baseCanvas.height - padding.top);
    // content|page 세로
    ctx.moveTo(this.baseCanvas.width - padding.right - this.options.timeArea.pageWidth, padding.top);
    ctx.lineTo(this.baseCanvas.width - padding.right - this.options.timeArea.pageWidth, this.baseCanvas.height - padding.top);
    // hour|minute|second 가로
    ctx.moveTo(this.baseCanvas.width / 2, (this.baseCanvas.height / 3) + 1);
    ctx.lineTo(this.baseCanvas.width - padding.right, (this.baseCanvas.height / 3) + 1);
    ctx.moveTo(this.baseCanvas.width / 2, ((this.baseCanvas.height / 3) * 2) - 1);
    ctx.lineTo(this.baseCanvas.width - padding.right, ((this.baseCanvas.height / 3) * 2) - 1);
    ctx.stroke();
    ctx.closePath();
  }

  drawTimeArea() {
    this.drawTimeAreaTitle();
    this.drawTimeAreaContent();
    this.drawTimeAreaPage();
  }
  // DRAW 'Hour, Min, Sec'
  drawTimeAreaTitle() {
    const ctx = this.context;
    const padding = this.options.padding;
    const timeLabel = ['Hour', 'Min', 'Sec'];
    timeLabel.forEach((v, idx) => {
      this.dynamicDraw(
        ctx,
        this.baseCanvas.width / 2,
        padding.top + ((this.coordinate.timeArea.total.height / 3) * idx),
        this.options.timeArea.titleWidth,
        this.coordinate.timeArea.total.height / 3,
        {
          fillText: {
            show: true,
            text: v,
          },
          align: 'center',
          padding: {
            bottom: 27,
          },
          font: '12px Roboto Condensed',
        }
      );
    });
  }
  // DRAW 0 ~ 23 || 59 BOX
  drawTimeAreaContent() {
    const ctx = this.context;
    const timeType = this.options.timeTypeName;
    // init coordinate by time type
    timeType.forEach((type) => {
      const timeAreaType = this.coordinate.timeArea[type].total;
      const oneBoxWidth = timeAreaType.width / this.options.timeArea.columnCount;
      const oneBoxHeight = timeAreaType.height / this.options.timeArea.rowCount;
      let maxNumber = type === 'hour' ? 24 : 60; // minute, second = 60
      let timeAreaObj = {};
      for (let ix = 0, ixLen = maxNumber; ix < ixLen; ix++) {
        const columnIdx = ix % this.options.timeArea.columnCount;
        const page = parseInt(
          ix / (this.options.timeArea.columnCount * this.options.timeArea.rowCount)
        ) + 1;
        let rowIdx = 1;
        if (ix % (this.options.timeArea.columnCount * this.options.timeArea.rowCount)
          < this.options.timeArea.columnCount) {
          rowIdx = 0;
        }
        timeAreaObj = {
          startX: timeAreaType.startX + (columnIdx * oneBoxWidth),
          width: oneBoxWidth,
          startY: timeAreaType.startY + (rowIdx * oneBoxHeight),
          height: oneBoxHeight,
          page: page,
          styleObj: {
            fillText: {
              show: true,
              text: ''+ix,
            },
            fill: {
              show: true,
              color: this.options.colors.thisMonthFill,
            },
            align: 'center',
            padding: {
              bottom: 13,
            },
          },
        };
        this.coordinate.timeArea[type].data.push(timeAreaObj);
      }
    });

    // DRAW box
    timeType.forEach((type) => {
      this.coordinate.timeArea[type].data.forEach((v) => {
        if (v.page === this.coordinate.timeArea[type].page) {
          this.dynamicDraw(ctx, v.startX, v.startY, v.width, v.height, v.styleObj);
        }
      });
    });
  }
  drawTimeAreaPage() {
    const ctx = this.context;
    const timeType = this.options.timeTypeName;
    const arrowArr = ['top', 'bottom'];
    const timeArea = this.coordinate.timeArea;
    let timeTypeAreaPage = {};
    let arrowObj = {};
    // init and draw arrows
    timeType.forEach((type) => {
      const timeTypeTotal = timeArea[type].total;
      timeTypeAreaPage = {
        startX: +timeTypeTotal.startX + +timeTypeTotal.width + +1,
        width: this.options.timeArea.pageWidth,
        startY: timeTypeTotal.startY,
        height: timeTypeTotal.height,
      };
      arrowArr.forEach((v, idx) => {
        arrowObj = {
          centerX: timeTypeAreaPage.startX + (timeTypeAreaPage.width / 2),
          centerY: timeTypeAreaPage.startY + (timeTypeAreaPage.height * ((+idx + +1) / 3)),
          direction: v,
          length: this.options.timeArea.triangleLength,
        };
        this.coordinate.timeArea.hour.arrow.push(arrowObj);
        this.drawTriangle(
          ctx, arrowObj.centerX, arrowObj.centerY,
          arrowObj.direction, arrowObj.length,
        );
      });
    });
  }

  // DRAW multiple function
  dynamicDraw(context, x, y, width, height, style) {
    if (style) {
      const mergedStyle = _.merge({}, this.options.styleObj, style);
      const ctx = context;

      if (mergedStyle.stroke && mergedStyle.stroke.show) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
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
          textStartX = (x + (width / 2)) - (textWidth / 2);
        } else if (mergedStyle.align === 'right') {
          textStartX = (x + width) - mergedStyle.padding.right - textWidth;
        } else if (mergedStyle.align === 'left') {
          textStartX = x + mergedStyle.padding.left;
        }
        const textStartY = (y + height) - mergedStyle.padding.bottom;
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
      ctx.lineTo(x + (Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y + (Math.sin(this.toRadians(30)) * length));
    } else if (direction === 'left') {
      ctx.lineTo(x, y - (Math.sin(this.toRadians(30)) * length));
      ctx.lineTo(x - (Math.cos(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y + (Math.sin(this.toRadians(30)) * length));
    } else if (direction === 'top') {
      ctx.lineTo(x + (Math.sin(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y - (Math.cos(this.toRadians(30)) * length));
      ctx.lineTo(x - (Math.sin(this.toRadians(30)) * length), y);
    } else if (direction === 'bottom') {
      ctx.lineTo(x + (Math.sin(this.toRadians(30)) * length), y);
      ctx.lineTo(x, y + (Math.cos(this.toRadians(30)) * length));
      ctx.lineTo(x - (Math.sin(this.toRadians(30)) * length), y);
    }
    ctx.lineTo(x, y);
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
        ? x + (Math.cos(this.toRadians(30)) * length)
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
      y: y + (Math.sin(this.toRadians(30)) * length),
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
      const intersect = ((y1 > y) != (y2 > y)) && (x < (((x2 - x1) * (y - y1)) / (y2 - y1)) + x1);
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
