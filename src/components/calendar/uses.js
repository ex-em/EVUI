import {
  ref, reactive, computed, watch, getCurrentInstance, unref, onBeforeMount,
} from 'vue';
import { throttle } from 'lodash-es';

const CALENDAR_ROWS = 6;
const CALENDAR_COLS = 7;
const MONTH_CNT = 12;
const HOUR_CNT = 24;
const MIN_CNT = 60;
const SEC_CNT = 60;
const CELL_CNT_IN_ONE_PAGE = 12;
const CELL_CNT_IN_ONE_ROW = 6;
const MONTH_NAME_LIST = {
  fullName: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'],
  numberName: ['1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'],
  abbrName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  korName: ['1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'],
};
const DAY_OF_THE_WEEK_NAME_LIST = {
  abbrUpperName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  abbrLowerName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  abbrPascalName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  abbrKorName: ['일', '월', '화', '수', '목', '금', '토'],
};
const ONE_DAY_MS = 86400000;
const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);

/**
 * 배열 내 여러 날짜(eg. 'YYYY-MM-DD' || 'YYYY-MM-DD HH:MI:SS') 중 가장 끝의 날짜 텍스트 구하기
 * @param arr
 * @param sideDirection - 끝의 방향 (first: 가장 멀리 오래된 날짜, last: 가장 최근의 날짜)
 * @returns {String} - 날짜 텍스트
 */
const getSideDateStr = (arr, sideDirection) => {
  if (!arr.length) return '';
  if (sideDirection === 'last') {
    return arr
      .reduce((prev, cur) => (new Date(prev).getTime() > new Date(cur).getTime() ? prev : cur));
  }
  return arr
    .reduce((prev, cur) => (new Date(prev).getTime() < new Date(cur).getTime() ? prev : cur));
};

/**
 * 월, 일을 두자리 숫자로 보정
 * @param num
 * @returns {string|*}
 */
const lpadToTwoDigits = (num) => {
  if (num === null) {
    return '00';
  } else if (+num < 10) {
    return `0${num}`;
  }
  return num;
};

/**
 * 이차원 배열 만들기
 * @param row
 * @param col
 * @returns {Array} - [row][col]
 */
const getMatrixArr = (row, col) => Array.from(Array(row), () => Array(col).fill(false));

/**
 * y년 m월 1일의 요일 구하기
 * @param y - 년
 * @param m - 월
 * @returns {number} - 해당 y년 m월 1일의 요일 (e.g. 0: SUN, ..., 6: SAT)
 *                   - 1주차에서 일요일부터 1일까지의 공백 개수
 */
const getDayOfWeekOnThe1stOfMonth = (y, m) => new Date(`${y}-${m}-1`).getDay();

/**
 * y년 m월 마지막 일자 구하기
 * @param y
 * @param m
 * @returns {number} - 해당 년, 월의 마지막 일자
 */
const getLastDateOfMonth = (y, m) => {
  let day;
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
};

/**
 * date또는 time 형태로 format string으로 조합
 * @param year
 * @param month
 * @param date
 * @param hour
 * @param min
 * @param sec
 * @returns {string}
 */
const formatDateTime = ({ year, month, date, hour, min, sec }) => {
  if (hour !== undefined && min !== undefined && sec !== undefined) {
    return `${year}-${lpadToTwoDigits(month)}-${lpadToTwoDigits(date)} ${lpadToTwoDigits(hour)}:${lpadToTwoDigits(min)}:${lpadToTwoDigits(sec)}`;
  }
  return `${year}-${lpadToTwoDigits(month)}-${lpadToTwoDigits(date)}`;
};

/**
 * 첫번째 인자로 받은 날짜 형식 String ('YYYY-MM-DD' || 'YYYY-MM-DD HH:MI:SS')이나
 * 해당 날짜형식이 들어있는 Array를 받아서 최신날짜의 정보를 추출하는 함수
 * typeToImport가 존재하는 경우 해당 timeType의 값을
 * typeToImport가 존재하지 않는 경우 최신날짜 텍스트를 timeType별로 분할한 Object를 리턴
 * @param param {String | Array} - 변경하려는 날짜
 * @param typeToImport
 * @returns {object|number}
 */
const getDateTimeInfoByType = (param, typeToImport) => {
  let str = unref(param);
  if (Array.isArray(str)) {
    str = getSideDateStr(param, 'last');
  }
  const result = {
    year: +(str?.split(' ')[0]?.split('-')[0]) || null,
    month: +(str?.split(' ')[0]?.split('-')[1]) || null,
    date: +(str?.split(' ')[0]?.split('-')[2]) || null,
    hour: +(str?.split(' ')[1]?.split(':')[0]) || 0,
    min: +(str?.split(' ')[1]?.split(':')[1]) || 0,
    sec: +(str?.split(' ')[1]?.split(':')[2]) || 0,
  };
  if (typeToImport === 'year') return result.year;
  if (typeToImport === 'month') return result.month;
  if (typeToImport === 'date') return result.date;
  if (typeToImport === 'hour') return result.hour;
  if (typeToImport === 'min') return result.min;
  if (typeToImport === 'sec') return result.sec;
  return result;
};

/**
 * 이전달, 다음달의 달력 상 연도, 월 정보 구하기
 * @param prevNext - 이전, 다음 여부 ('prev'|'next')
 * @param year
 * @param month
 * @returns {{month: number, year: *}}
 */
const getSideMonthCalendarInfo = (prevNext, year, month) => {
  if (prevNext === 'next') {
    return {
      year: month === 12 ? year + 1 : year,
      month: ((month + 1) % 12) || 12,
    };
  }
  return {
    year: month === 1 ? year - 1 : year,
    month: ((month - 1) % 12) || 12,
  };
};

/**
 * date string 값의 MS 값 구하기
 * @param dateStr
 * @returns {number}
 */
const getDateMs = dateStr => new Date(`${dateStr} 00:00:00`).getTime();

export const useModel = () => {
  const { props } = getCurrentInstance();

  /**
   * 현재 선택된 값, 배열인 경우 반응형을 끊기위해 rest 사용
   * 1) props.mode: 'date' or 'dateTime' > String
   * 2) props.mode: 'dateMulti' or 'dateRange' > [...Array]
   */
  let selectedValue;
  if (props.mode !== 'dateMulti' && props.mode !== 'dateRange') {
    if (!props.modelValue
      || (props.modelValue.length === 10 && dateReg.exec(props.modelValue))
      || (props.modelValue.length === 19 && dateTimeReg.exec(props.modelValue))
    ) {
      selectedValue = ref(props.modelValue);
    } else {
      selectedValue = ref('');
    }
  } else if (Array.isArray(props.modelValue)
    && props.modelValue.every(v => (!v || (v.length === 10 && dateReg.exec(v))))
  ) {
    selectedValue = ref([...props.modelValue]);
  } else {
    selectedValue = ref([]);
  }

  /**
   * validate v-model's value
   */
  const validateModelValue = () => {
    if (props.mode === 'date' && props.modelValue && typeof props.modelValue !== 'string') {
      console.warn('[EVUI][Calendar] When mode is \'date\', v-model must be \'String\' type.');
    } else if (props.mode === 'dateTime' && props.modelValue && typeof props.modelValue !== 'string') {
      console.warn('[EVUI][Calendar] When mode is \'dateTime\', v-model must be \'String\' type.');
    } else if (props.mode === 'dateMulti' && props.modelValue && !Array.isArray(props.modelValue)) {
      console.warn('[EVUI][Calendar] When mode is \'dateMulti\', v-model must be \'Array\' type.');
    } else if (props.mode === 'dateRange' && props.modelValue) {
      if (!Array.isArray(props.modelValue)) {
        console.warn('[EVUI][Calendar] When mode is \'dateRange\', v-model must be \'Array\' type.');
      } else if (props.modelValue.length !== 0 && props.modelValue.length !== 2) {
        console.warn('[EVUI][Calendar] When mode is \'dateRange\', v-model\'s length is 0 or 2.');
      } else if (getDateMs(props.modelValue[0]) > getDateMs(props.modelValue[1])) {
        console.warn('[EVUI][Calendar] When mode is \'dateRange\', fromDate must be less than toDate.');
      }
    }
  };

  // 메인(좌측) 달력(연, 월, 시, 분, 초) 페이징 정보
  let mainCalendarPageInfo;
  if (props.mode !== 'dateRange') {
    mainCalendarPageInfo = reactive({
      year: getDateTimeInfoByType(selectedValue.value, 'year') || new Date().getFullYear(),
      month: getDateTimeInfoByType(selectedValue.value, 'month') || new Date().getMonth() + 1,
      hour: Math.floor(getDateTimeInfoByType(selectedValue.value, 'hour') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
      min: Math.floor(getDateTimeInfoByType(selectedValue.value, 'min') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
      sec: Math.floor(getDateTimeInfoByType(selectedValue.value, 'sec') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
    });
  } else if (Array.isArray(selectedValue.value) && selectedValue.value[0]) {
    mainCalendarPageInfo = reactive({
      year: getDateTimeInfoByType(selectedValue.value[0], 'year'),
      month: getDateTimeInfoByType(selectedValue.value[0], 'month'),
    });
  } else {
    mainCalendarPageInfo = reactive({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
  }

  // 'mode: dateRange'인 경우 확장된 달력(연, 월) 페이징 정보
  let expandedCalendarPageInfo;
  if (props.mode === 'dateRange'
    && Array.isArray(selectedValue.value)
    && selectedValue.value[1]
  ) {
    const fromDate = {
      year: getDateTimeInfoByType(selectedValue.value[0], 'year'),
      month: getDateTimeInfoByType(selectedValue.value[0], 'month'),
    };
    const toDate = {
      year: getDateTimeInfoByType(selectedValue.value[1], 'year'),
      month: getDateTimeInfoByType(selectedValue.value[1], 'month'),
    };
    // fromDate, toDate의 연, 월이 같은 경우의 확장된 달력 페이징 정보는 다음달로 세팅
    if (fromDate.year === toDate.year && fromDate.month === toDate.month) {
      expandedCalendarPageInfo = reactive(getSideMonthCalendarInfo(
        'next',
        mainCalendarPageInfo.year,
        mainCalendarPageInfo.month,
      ));
    } else {
      expandedCalendarPageInfo = reactive(toDate);
    }
  } else {
    expandedCalendarPageInfo = reactive(getSideMonthCalendarInfo(
      'next',
      mainCalendarPageInfo.year,
      mainCalendarPageInfo.month,
    ));
  }

  // 현재 달력이 표현되는 월
  const mainCalendarMonth = computed(() =>
    MONTH_NAME_LIST[props.monthNotation][mainCalendarPageInfo.month - 1]);
  // 다음페이지 달력이 표현되는 월
  const expandedCalendarMonth = computed(() =>
    MONTH_NAME_LIST[props.monthNotation][expandedCalendarPageInfo.month - 1]);
  // 현재 달력에 표현되는 타입별 요일
  const dayOfTheWeekList = computed(() =>
    DAY_OF_THE_WEEK_NAME_LIST[props.dayOfTheWeekNotation]);
  // mode: dateRange에 두 달력이 연속적인 경우
  const isContinuousMonths = computed(
    () => props.mode === 'dateRange'
      && (getSideMonthCalendarInfo('next', mainCalendarPageInfo.year, mainCalendarPageInfo.month).year === expandedCalendarPageInfo.year
        && getSideMonthCalendarInfo('next', mainCalendarPageInfo.year, mainCalendarPageInfo.month).month === expandedCalendarPageInfo.month));

  onBeforeMount(() => {
    validateModelValue();
  });

  return {
    selectedValue,
    mainCalendarPageInfo,
    expandedCalendarPageInfo,
    mainCalendarMonth,
    expandedCalendarMonth,
    dayOfTheWeekList,
    isContinuousMonths,
  };
};

export const useCalendarDate = (param) => {
  const { props } = getCurrentInstance();
  const { selectedValue, mainCalendarPageInfo, expandedCalendarPageInfo } = param;

  // 메인 달력 테이블의 날짜 정보 (6X7, 2차원배열)
  const mainCalendarTableInfo = reactive(getMatrixArr(CALENDAR_ROWS, CALENDAR_COLS));
  // dateRange 모드의 확장된 달력 테이블의 날짜 정보
  const expandedCalendarTableInfo = reactive(getMatrixArr(CALENDAR_ROWS, CALENDAR_COLS));
  // 시간박스 정보
  const timeTableInfo = reactive({
    hour: [],
    min: [],
    sec: [],
  });

  /**
   * Dropdown Calendar 날짜 정보 세팅하기
   * @param calendarType - 달력 종류 ('main'|'expanded')
   */
  const setCalendarDate = (calendarType) => {
    const calendarPageInfo = calendarType === 'expanded'
      ? expandedCalendarPageInfo : mainCalendarPageInfo;
    const calendarTableInfo = calendarType === 'expanded'
      ? expandedCalendarTableInfo : mainCalendarTableInfo;
    const disabledDate = props.options.disabledDate;

    const TODAY_YMD = formatDateTime({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: new Date().getDate(),
    });
    const PREV_MONTH = computed(() =>
      ((MONTH_CNT + calendarPageInfo.month - 1) % MONTH_CNT) || MONTH_CNT);
    const NEXT_MONTH = computed(() =>
      ((calendarPageInfo.month + 1) % MONTH_CNT) || MONTH_CNT);
    const YEAR_OF_PREV_MONTH = computed(() => (calendarPageInfo.month === 1
      ? calendarPageInfo.year - 1 : calendarPageInfo.year));
    const YEAR_OF_NEXT_MONTH = computed(() => (mainCalendarPageInfo.month === 12
      ? calendarPageInfo.year + 1 : calendarPageInfo.year));
    // 이번달 1일의 요일
    const dayOfWeekOnThe1stOfThisMonth = computed(() => getDayOfWeekOnThe1stOfMonth(
      calendarPageInfo.year,
      calendarPageInfo.month,
    ));
    // 저번달 마지막 날짜
    const lastDateOfPrevMonth = computed(() => getLastDateOfMonth(
      calendarPageInfo.month === 1
        ? calendarPageInfo.year - 1 : calendarPageInfo.year,
      (MONTH_CNT + calendarPageInfo.month - 1) % MONTH_CNT || MONTH_CNT,
    ));
    // 이번달 마지막 날짜
    const lastDateOfThisMonth = computed(() => getLastDateOfMonth(
      calendarPageInfo.year,
      calendarPageInfo.month,
    ));

    let monthDate = 0;
    let year = 0;
    let month = 0;
    let date = 0;
    let currDate = '';
    // date 숫자 및 속성 세팅
    const setDateInfo = (monthType, i, j) => {
      currDate = formatDateTime({ year, month, date });
      const isDisabled = disabledDate ? disabledDate(new Date(currDate)) : false;
      const inRangeCls = () => {
        if (props.mode === 'dateRange' && selectedValue.value.length === 2) {
          if (getDateMs(selectedValue.value[0]) <= getDateMs(currDate)
            && getDateMs(currDate) <= getDateMs(selectedValue.value[1])
          ) {
            if (getDateMs(selectedValue.value[0]) === getDateMs(selectedValue.value[1])) {
              return ' in-range start-end-date';
            } else if (getDateMs(selectedValue.value[0]) === getDateMs(currDate)) {
              return ' in-range start-date';
            } else if (getDateMs(currDate) === getDateMs(selectedValue.value[1])) {
              return ' in-range end-date';
            }
            return ' in-range';
          }
          return '';
        }
        return '';
      };
      // mode가 dateRange일 때는 이전, 다음달에 selected 를 하지 않는다.
      calendarTableInfo[i][j] = {
        monthType: `${monthType}${isDisabled ? ' disabled' : ''}${inRangeCls()}`,
        isToday: TODAY_YMD === currDate,
        isSelected: props.mode !== 'dateRange'
          ? selectedValue.value?.includes(currDate)
          : monthType === '' && selectedValue.value?.includes(currDate),
        year,
        month,
        date,
      };
    };

    for (let i = 0; i < CALENDAR_ROWS; i++) {
      for (let j = 0; j < CALENDAR_COLS; j++) {
        if (i === 0) {
          // 첫번째 주
          if (dayOfWeekOnThe1stOfThisMonth.value !== 0) {
            if (j < dayOfWeekOnThe1stOfThisMonth.value) {
              year = YEAR_OF_PREV_MONTH.value;
              month = PREV_MONTH.value;
              date = lastDateOfPrevMonth.value - dayOfWeekOnThe1stOfThisMonth.value + 1 + j;
              setDateInfo('prev', i, j);
            } else {
              monthDate++;
              year = calendarPageInfo.year;
              month = calendarPageInfo.month;
              date = monthDate;
              setDateInfo('', i, j);
            }
          } else {
            year = YEAR_OF_PREV_MONTH.value;
            month = PREV_MONTH.value;
            date = lastDateOfPrevMonth.value - 6 + j;
            setDateInfo('prev', i, j);
          }
        } else if (lastDateOfThisMonth.value <= monthDate) {
          // 마지막 -1, 마지막 주의 다음달 날짜
          monthDate++;
          year = YEAR_OF_NEXT_MONTH.value;
          month = NEXT_MONTH.value;
          date = monthDate - lastDateOfThisMonth.value;
          setDateInfo('next', i, j);
        } else {
          // 첫번째 주를 제외한 이번달 날짜
          monthDate++;
          year = calendarPageInfo.year;
          month = calendarPageInfo.month;
          date = monthDate;
          setDateInfo('', i, j);
        }
      }
    }
  };

  /**
   * Calendar 시간 정보 세팅하기
   */
  const setHmsTime = () => {
    ['hour', 'min', 'sec'].forEach((v) => {
      let cnt = SEC_CNT;
      if (v === 'hour') {
        cnt = HOUR_CNT;
      } else if (v === 'min') {
        cnt = MIN_CNT;
      }
      for (let i = 0; i < cnt; i++) {
        timeTableInfo[v][i] = {
          timeType: v,
          num: i,
          isSelected: selectedValue.value && selectedValue.value.length > 0
            ? getDateTimeInfoByType(selectedValue, v) === i : false,
        };
      }
    });
  };

  /**
   * HMS 영역 내 tr, td, 페이지에 맞는 시간 정보 가져오기
   * @param timeType - {'hour'|'min'|'sec'}
   * @param i - rows
   * @param j - cols
   * @returns {object - cellInfo}
   */
  const getTimeInfo = (timeType, i, j) => {
    const currPage = mainCalendarPageInfo[timeType] - 1;
    const currRowIdx = i - 1;
    const currColIdx = j - 1;
    const currIdx = (currPage * CELL_CNT_IN_ONE_PAGE)
      + (currRowIdx * CELL_CNT_IN_ONE_ROW) + currColIdx;
    return timeTableInfo[timeType][currIdx];
  };

  watch(
    () => props.modelValue,
    (curr) => {
      selectedValue.value = curr;
      if (props.mode !== 'dateRange') {
        setCalendarDate('main');
      } else {
        setCalendarDate('main');
        setCalendarDate('expanded');
      }
    },
  );

  return {
    mainCalendarTableInfo,
    expandedCalendarTableInfo,
    timeTableInfo,
    setCalendarDate,
    setHmsTime,
    getTimeInfo,
  };
};

export const useEvent = (param) => {
  const { props, emit } = getCurrentInstance();
  const disabledDate = props.options.disabledDate;
  const {
    selectedValue,
    mainCalendarPageInfo,
    expandedCalendarPageInfo,
    setCalendarDate,
    setHmsTime,
  } = param;

  // dateRange mode에서 클릭하여 첫번째 선택된 날짜
  const dateRangeClickedDate = ref('');
  // dateRange mode에서 클릭한번 후 커서에 따라 날짜를 마우스오버하는 경우 dynamic argument로 이벤트명 설정
  const calendarEventName = ref(null);

  /**
   * 입력받은 dateTime object에 calendar date, time 영역 페이지 세팅
   * @param calendarType - 달력 종류 ('main'|'expanded')
   * @param dateTime - 입력된 페이지 정보 ({ year, month, hour, min, sec })
   */
  const setCalendarPageInfo = (calendarType, dateTime) => {
    const calendarPageInfo = calendarType === 'expanded'
      ? expandedCalendarPageInfo : mainCalendarPageInfo;
    const { year, month, hour, min, sec } = dateTime;
    if (year) {
      calendarPageInfo.year = year;
    }
    if (month) {
      calendarPageInfo.month = month;
    }
    if (hour) {
      mainCalendarPageInfo.hour = hour;
    }
    if (min) {
      mainCalendarPageInfo.min = min;
    }
    if (sec) {
      mainCalendarPageInfo.sec = sec;
    }
  };

  /**
   * Calendar 의 Month 이동시키기 (이전, 이후)
   * expandedCalendar가 존재하는 경우(mode: timeRange)
   *  mainCalendar의 date는 expandedCalendar의 날짜를 넘길 수 없다
   *  mainCalendar year, month < expandedCalendar year, month
   * @param calendarType - 달력 종류 ('main'|'expanded')
   * @param type - {'prev'|'next'}
   */
  const moveMonth = (calendarType, type) => {
    const isDateRangeMode = props.mode === 'dateRange';
    let calendarPageInfo = mainCalendarPageInfo;
    if (!isDateRangeMode) {
      if (type === 'prev') {
        if (calendarPageInfo.month === 1) {
          calendarPageInfo.year -= 1;
          calendarPageInfo.month = 12;
        } else {
          calendarPageInfo.month -= 1;
        }
      } else if (calendarPageInfo.month === 12) {
        calendarPageInfo.year += 1;
        calendarPageInfo.month = 1;
      } else {
        calendarPageInfo.month += 1;
      }
    } else {
      calendarPageInfo = calendarType === 'expanded'
        ? expandedCalendarPageInfo : mainCalendarPageInfo;
      // 메인 달력 날짜 + 1Month
      const nextYearMonth = getSideMonthCalendarInfo(
        'next',
        mainCalendarPageInfo.year,
        mainCalendarPageInfo.month,
      );
      // 두 달력간의 연속 여부 (메인 달력 + 1Month === 확장된 달력)
      // 연속된 경우 mainCalendar와 expandedCalendar는 서로 같은 달로 이동 불가
      // mainCalendar Month < expandedCalendar Month
      const isContinuousMonths = expandedCalendarPageInfo.year === nextYearMonth.year
        && expandedCalendarPageInfo.month === nextYearMonth.month;
      if (type === 'prev') {
        if (isContinuousMonths && calendarType === 'expanded') {
          return;
        }
        if (calendarPageInfo.month === 1) {
          calendarPageInfo.year -= 1;
          calendarPageInfo.month = 12;
        } else {
          calendarPageInfo.month -= 1;
        }
      } else {
        if (isContinuousMonths && calendarType === 'main') {
          return;
        }
        if (calendarPageInfo.month === 12) {
          calendarPageInfo.year += 1;
          calendarPageInfo.month = 1;
        } else {
          calendarPageInfo.month += 1;
        }
      }
    }
  };

  /**
   * Calendar Header의 prev, next 아이콘 클릭 이벤트
   * @param calendarType - 달력 종류 ('main'|'expanded')
   * @param type - 이전달, 다음달 ('prev'|'next')
   */
  const clickPrevNextBtn = (calendarType, type) => {
    moveMonth(calendarType, type);
    setCalendarDate(calendarType);
  };

  /**
   * Calendar Date 일자 클릭 이벤트
   * @param dateInfo
   */
  const clickDate = (calendarType, dateInfo) => {
    const { year, month, date, monthType } = dateInfo;
    const CURR_DATE_STR = formatDateTime({ year, month, date });
    const isExistCurrDate = props.modelValue?.includes(CURR_DATE_STR);
    // 제한된 날짜는 선택할 수 없다.
    if (disabledDate && disabledDate(new Date(CURR_DATE_STR)) && !isExistCurrDate) {
      return;
    }

    const calendarPageInfo = calendarType === 'main' ? mainCalendarPageInfo : expandedCalendarPageInfo;
    const PREV_MONTH = ((MONTH_CNT + calendarPageInfo.month - 1) % MONTH_CNT) || MONTH_CNT;
    const YEAR_OF_PREV_MONTH = calendarPageInfo.month === 1
      ? calendarPageInfo.year - 1 : calendarPageInfo.year;
    const NEXT_MONTH = ((calendarPageInfo.month + 1) % MONTH_CNT) || MONTH_CNT;
    const YEAR_OF_NEXT_MONTH = calendarPageInfo.month === 12
      ? calendarPageInfo.year + 1 : calendarPageInfo.year;

    const moveDispCalendarMonth = () => {
      if (monthType.includes('prev')) {
        calendarPageInfo.year = YEAR_OF_PREV_MONTH;
        calendarPageInfo.month = PREV_MONTH;
      } else if (monthType.includes('next')) {
        calendarPageInfo.year = YEAR_OF_NEXT_MONTH;
        calendarPageInfo.month = NEXT_MONTH;
      }
    };

    switch (props.mode) {
      case 'date':
        selectedValue.value = CURR_DATE_STR;
        moveDispCalendarMonth();
        emit('update:modelValue', CURR_DATE_STR);
        setCalendarDate('main');
        break;
      case 'dateTime': {
        const isExistTime = !!(selectedValue.value?.split(' ')[1]);
        const CURR_TIME_HMS = isExistTime
          ? selectedValue.value?.split(' ')[1] : '00:00:00';
        selectedValue.value = `${CURR_DATE_STR} ${CURR_TIME_HMS}`;
        moveDispCalendarMonth();
        emit('update:modelValue', `${CURR_DATE_STR} ${CURR_TIME_HMS}`);
        setCalendarDate('main');
        if (!isExistTime) {
          setCalendarPageInfo('main', { hour: 1, min: 1, sec: 1 });
          setHmsTime();
        }
        break;
      }
      case 'dateMulti': {
        const multiType = props.options.multiType;
        const multiDayLimit = props.options.multiDayLimit;
        if (multiType === 'date') {
          const selectedIdx = selectedValue.value.indexOf(CURR_DATE_STR);
          if (selectedIdx > -1) {
            selectedValue.value.splice(selectedIdx, 1);
            emit('update:modelValue', [...selectedValue.value]);
          } else if (selectedValue.value.length < multiDayLimit) {
            selectedValue.value.push(CURR_DATE_STR);
            moveDispCalendarMonth();
            emit('update:modelValue', [...selectedValue.value]);
          }
        } else if (multiType === 'week' || multiType === 'weekday') {
          const NUMBER_OF_DAYS_IN_RANGE = multiType === 'week' ? 7 : 5; // 범위 내 선택된 날짜 개수
          const DIFF_UNTIL_THE_LAST_DATE = multiType === 'week' ? 6 : 5; // 한 주의 마지막 날짜까지의 차이
          const exactSelectedDate = new Date(`${CURR_DATE_STR} 00:00:00`);
          const dayOfTheWeekOfTheSelectedDate = exactSelectedDate.getDay();
          const diffFromTheLastDay = DIFF_UNTIL_THE_LAST_DATE - dayOfTheWeekOfTheSelectedDate;
          const theLastDayTime = exactSelectedDate.getTime() + (ONE_DAY_MS * diffFromTheLastDay);

          for (let i = 0; i < NUMBER_OF_DAYS_IN_RANGE; i++) {
            const loopYear = new Date(theLastDayTime - (i * ONE_DAY_MS)).getFullYear();
            const loopMonth = new Date(theLastDayTime - (i * ONE_DAY_MS)).getMonth() + 1;
            const loopDate = new Date(theLastDayTime - (i * ONE_DAY_MS)).getDate();
            const dateStr = `${loopYear}-${lpadToTwoDigits(loopMonth)}-${lpadToTwoDigits(loopDate)}`;
            if (i === 0) {
              if (selectedValue.value.includes(dateStr)) {
                selectedValue.value.splice(0);
                break;
              } else {
                selectedValue.value.splice(0);
                moveDispCalendarMonth();
              }
            }
            if (!disabledDate || !disabledDate(new Date(dateStr))) {
              selectedValue.value.unshift(dateStr);
            }
          }
          emit('update:modelValue', [...selectedValue.value]);
        }
        setCalendarDate('main');
        break;
      }
      case 'dateRange': {
        const isMouseover = calendarEventName.value === 'mousemove';
        if (isMouseover) {
          calendarEventName.value = null;
          // throttle delay 보다 더 빠르게 날짜 클릭하는 경우
          if (selectedValue.value.length === 1) {
            selectedValue.value.push(CURR_DATE_STR);
          }
          emit('update:modelValue', [...selectedValue.value]);
          dateRangeClickedDate.value = '';
          setCalendarDate(calendarType);
        } else {
          selectedValue.value.splice(0);
          calendarEventName.value = 'mousemove';
          dateRangeClickedDate.value = CURR_DATE_STR;
          selectedValue.value.push(dateRangeClickedDate.value);
          setCalendarDate('main');
          setCalendarDate('expanded');
        }
        break;
      }
      default:
        break;
    }
  };

  /**
   * Calendar mode: dateTime인 경우 HMS 이동 화살표 클릭 이벤트
   * @param timeType - {hour|min|sec}
   * @param arrow - {up|down}
   */
  const clickHmsBtn = (timeType, arrow) => {
    const FIRST_PAGE = 1;
    const HOUR_MAX_PAGE = 2;
    const MINUTE_MAX_PAGE = 5;
    const SECOND_MAX_PAGE = 5;
    if (timeType === 'hour') {
      if (arrow === 'down' && mainCalendarPageInfo.hour < HOUR_MAX_PAGE) {
        mainCalendarPageInfo.hour++;
      } else if (arrow === 'up' && mainCalendarPageInfo.hour > FIRST_PAGE) {
        mainCalendarPageInfo.hour--;
      }
    } else if (timeType === 'min') {
      if (arrow === 'down' && mainCalendarPageInfo.min < MINUTE_MAX_PAGE) {
        mainCalendarPageInfo.min++;
      } else if (arrow === 'up' && mainCalendarPageInfo.min > FIRST_PAGE) {
        mainCalendarPageInfo.min--;
      }
    } else if (timeType === 'sec') {
      if (arrow === 'down' && mainCalendarPageInfo.sec < SECOND_MAX_PAGE) {
        mainCalendarPageInfo.sec++;
      } else if (arrow === 'up' && mainCalendarPageInfo.sec > FIRST_PAGE) {
        mainCalendarPageInfo.sec--;
      }
    }
  };

  /**
   * Click cell In HMS area
   * @param timeType - {hour|min|sec}
   * @param i - row
   * @param j - col
   */
  const clickTime = (timeType, i, j) => {
    const currPage = mainCalendarPageInfo[timeType] - 1;
    const currRowIdx = i - 1;
    const currColIdx = j - 1;
    const clickedNum = (currPage * CELL_CNT_IN_ONE_PAGE)
     + (currRowIdx * CELL_CNT_IN_ONE_ROW) + currColIdx;

    if (props.mode === 'dateTime') {
      const EXIST_YMD = !!(props.modelValue?.split(' ')[0]);
      const TODAY = new Date();
      const TODAY_INFO = {
        year: TODAY.getFullYear(),
        month: TODAY.getMonth() + 1,
        date: TODAY.getDate(),
      };
      if (!props.modelValue) {
        if (timeType === 'hour') {
          selectedValue.value = `${formatDateTime(TODAY_INFO)} ${lpadToTwoDigits(clickedNum)}:00:00`;
          emit('update:modelValue', `${formatDateTime(TODAY_INFO)} ${lpadToTwoDigits(clickedNum)}:00:00`);
        } else if (timeType === 'min') {
          selectedValue.value = `${formatDateTime(TODAY_INFO)} 00:${lpadToTwoDigits(clickedNum)}:00`;
          emit('update:modelValue', `${formatDateTime(TODAY_INFO)} 00:${lpadToTwoDigits(clickedNum)}:00`);
        } else if (timeType === 'sec') {
          selectedValue.value = `${formatDateTime(TODAY_INFO)} 00:00:${lpadToTwoDigits(clickedNum)}`;
          emit('update:modelValue', `${formatDateTime(TODAY_INFO)} 00:00:${lpadToTwoDigits(clickedNum)}`);
        }
      } else {
        const HOUR_START_IDX = 11;
        const MIN_START_IDX = 14;
        const SEC_START_IDX = 17;
        const REPLACE_TEXT_SIZE = 2;
        let START_IDX = HOUR_START_IDX;
        if (timeType === 'min') {
          START_IDX = MIN_START_IDX;
        } else if (timeType === 'sec') {
          START_IDX = SEC_START_IDX;
        }
        selectedValue.value = `${props.modelValue.substr(0, START_IDX)}${lpadToTwoDigits(clickedNum)}${props.modelValue.substr(START_IDX + REPLACE_TEXT_SIZE)}`;
        emit('update:modelValue', `${props.modelValue.substr(0, START_IDX)}${lpadToTwoDigits(clickedNum)}${props.modelValue.substr(START_IDX + REPLACE_TEXT_SIZE)}`);
      }

      // dateTime의 v-model값이 없는 경우 time area를 클릭하였을 때 date의 값은 today로 세팅
      if (!EXIST_YMD) {
        setCalendarPageInfo('main', {
          hour: 1,
          min: 1,
          sec: 1,
          ...{
            year: TODAY_INFO.year,
            month: TODAY_INFO.month,
            [timeType]: Math.floor(clickedNum / CELL_CNT_IN_ONE_PAGE) + 1,
          },
        });
        setCalendarDate('main');
      }
      setHmsTime();
    }
  };

  /**
   * Wheel up or wheel down In Calendar Month(tbody) area
   * @param e
   */
  const wheelMonth = (calendarType, e) => {
    moveMonth(calendarType, e.deltaY > 0 ? 'next' : 'prev');
    setCalendarDate(calendarType);
  };

  /**
   * Wheel up or wheel down In Calendar Time(HMS) area
   * @param timeType - {hour|min|sec}
   * @param e
   */
  const wheelTime = (timeType, e) => {
    clickHmsBtn(timeType, e.deltaY > 0 ? 'down' : 'up');
  };

  /**
   * dateRange 모드에서 한번 클릭 후 날짜에 마우스무브하는 경우
   * 커서 위에 있는 날짜까지의 selectedValue의 영역 선택한 selection 로직
   * 일반적인 마우스무브 로직에 성능향상을 위한 throttle 10ms를 설정
   * @param calendarType - 캘린더 종류 ('main'|'expanded')
   * @param e - 마우스이벤트
   * @type {function(): (*)}
   */
  const onMousemoveDate = throttle((calendarType, e) => {
    const target = e.target.tagName === 'TD' ? e.target : e.target.parentElement;
    const isDisabled = target.classList.contains('disabled');
    const isPrev = target.classList.contains('prev');
    const isNext = target.classList.contains('next');
    if (target.classList.length > 0 && !isDisabled) {
      const calendarPageInfo = calendarType === 'main' ? mainCalendarPageInfo : expandedCalendarPageInfo;
      let yearMonth = {
        year: +calendarPageInfo.year,
        month: +calendarPageInfo.month,
        date: e.target.innerText,
      };
      // 달력 내 이전달, 다음달 일자의 경우 연, 월 보정
      if (isPrev) {
        yearMonth = { ...yearMonth, ...getSideMonthCalendarInfo('prev', yearMonth.year, yearMonth.month) };
      } else if (isNext) {
        yearMonth = { ...yearMonth, ...getSideMonthCalendarInfo('next', yearMonth.year, yearMonth.month) };
      }
      const STANDARD_DATE_STR = dateRangeClickedDate.value;
      const MOUSEMOVE_DATE_STR = formatDateTime({
        year: yearMonth.year,
        month: yearMonth.month,
        date: yearMonth.date,
      });

      // fromDate ~ toDate selection 순서 세팅
      if (getDateMs(MOUSEMOVE_DATE_STR) < getDateMs(STANDARD_DATE_STR)) {
        selectedValue.value[0] = MOUSEMOVE_DATE_STR;
        selectedValue.value[1] = STANDARD_DATE_STR;
      } else {
        selectedValue.value[0] = STANDARD_DATE_STR;
        selectedValue.value[1] = MOUSEMOVE_DATE_STR;
      }
      setCalendarDate('main');
      setCalendarDate('expanded');
    }
  }, 10);

  return {
    clickPrevNextBtn,
    clickDate,
    clickHmsBtn,
    clickTime,
    wheelMonth,
    wheelTime,
    calendarEventName,
    onMousemoveDate,
  };
};
