import {
  ref, reactive, computed, getCurrentInstance, unref, onBeforeMount, watch,
} from 'vue';
import { throttle } from 'lodash-es';

const CALENDAR_ROWS = 6;
const CALENDAR_COLS = 7;
const MONTH_CNT = 12;
const HOUR_CNT = 24;
const MIN_CNT = 60;
const SEC_CNT = 60;
const CELL_CNT_IN_ONE_PAGE = 12;
const CELL_CNT_IN_ONE_ROW = 4;
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
export const lpadToTwoDigits = (num) => {
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
 * timeFormat을 체크하여 timeFormat이 있으면 format에 맞는 형식으로 반환
 * @param timeFormat -- props.option?.timeFormat
 * @param dateTimeValue
 * @param typeToImport
 * @returns {Object|number}
 */
const getTimeInfoByTimeFormat = (timeFormat, dateTimeValue, typeToImport) => {
  const value = getDateTimeInfoByType(dateTimeValue, typeToImport);
  if (timeFormat) {
    const hour = timeFormat?.split(':')[0];
    const min = timeFormat?.split(':')[1];
    const sec = timeFormat?.split(':')[2];
    if (typeToImport === 'hour') {
      return hour === 'HH' ? value : +hour;
    } else if (typeToImport === 'min') {
      return min === 'mm' ? value : +min;
    } else if (typeToImport === 'sec') {
      return sec === 'ss' ? value : +sec;
    }
  }
  return value;
};

/**
 * 초기 timeFormat에 따른 modelValue update 함수
 * @param timeFormat - props.options.timeFormat
 * @param modelValue
 * @returns string
 */
export const getChangedValueByTimeFormat = (timeFormat, modelValue) => {
  if (!modelValue) {
    return '';
  }

  const hourByTimeFormat = lpadToTwoDigits(getTimeInfoByTimeFormat(timeFormat, modelValue, 'hour'));
  const minByTimeFormat = lpadToTwoDigits(getTimeInfoByTimeFormat(timeFormat, modelValue, 'min'));
  const secByTimeFormat = lpadToTwoDigits(getTimeInfoByTimeFormat(timeFormat, modelValue, 'sec'));

  return `${modelValue.split(' ')[0]} ${hourByTimeFormat}:${minByTimeFormat}:${secByTimeFormat}`;
};

const compareFromAndToDateTime = (mode, calendarType, targetDate, modelValue) => {
  if (!modelValue.length) {
    return false;
  }
  let fromDate = calendarType === 'main' ? targetDate : modelValue[0];
  let toDate = calendarType === 'expanded' ? targetDate : modelValue[1];

  let fromDateTime = fromDate;
  let toDateTime = toDate;
  if (!targetDate.split(' ')[1]) {
    if (mode === 'dateTimeRange') {
      fromDate = fromDate.split(' ')[0];
      toDate = toDate.split(' ')[0];
      const fromTime = modelValue[0].split(' ')[1];
      const toTime = modelValue[1].split(' ')[1];
      fromDateTime = `${fromDate} ${fromTime}`;
      toDateTime = `${toDate} ${toTime}`;
    } else {
      fromDateTime = `${fromDate} 00:00:00`;
      toDateTime = `${toDate} 23:59:59`;
    }
  }

  return (fromDateTime && toDateTime)
    && new Date(fromDateTime).getTime() > +new Date(toDateTime).getTime();
};

/**
 * date string 값의 MS 값 구하기
 * @param dateStr
 * @returns {number}
 */
const getDateMs = dateStr => new Date(`${dateStr}`).getTime();

export const useModel = () => {
  const { props } = getCurrentInstance();
  const timeFormat = props.options?.timeFormat;

      /**
   * 현재 선택된 값, 배열인 경우 반응형을 끊기위해 rest 사용
   * selectValue ref로 변환하기 전 modelValue timeFormat에 따라 fetch
   * 1) props.mode: 'date' or 'dateTime' > String
   * 2) props.mode: 'dateMulti' or 'dateRange' > [...Array]
   */
  let selectedValue;
  if (props.mode !== 'dateMulti' && props.mode !== 'dateRange' && props.mode !== 'dateTimeRange') {
    if (props.modelValue
      && ((props.modelValue.length === 10 && dateReg.exec(props.modelValue?.toString()))
      || (props.modelValue.length === 19 && dateTimeReg.exec(props.modelValue?.toString())))
    ) {
      if (props.mode === 'dateTime' && timeFormat) {
        const modelValue = getChangedValueByTimeFormat(timeFormat, props.modelValue);
        selectedValue = ref(modelValue);
      } else {
        selectedValue = ref(props.modelValue);
      }
    } else {
      selectedValue = ref('');
    }
  } else if (Array.isArray(props.modelValue)
    && props.modelValue.every(v => (
      !v
      || (v.length === 10 && dateReg.exec(v))
      || (v.length === 19 && dateTimeReg.exec(v))
    ))
  ) {
    if (props.mode === 'dateTimeRange' && props.modelValue.length === 2 && timeFormat) {
      const modelValue = [];
      modelValue.push(getChangedValueByTimeFormat(timeFormat[0], props.modelValue[0]));
      modelValue.push(getChangedValueByTimeFormat(timeFormat[1], props.modelValue[1]));
      selectedValue = ref([...modelValue]);
    } else {
      selectedValue = ref([...props.modelValue]);
    }
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
      } else if (getDateMs(`${props.modelValue[0]} 00:00:00`) > getDateMs(`${props.modelValue[1]} 00:00:00`)) {
        console.warn('[EVUI][Calendar] When mode is \'dateRange\', fromDate must be less than toDate.');
      }
    } else if (props.mode === 'dateTimeRange' && props.modelValue) {
      if (!Array.isArray(props.modelValue)) {
        console.warn('[EVUI][Calendar] When mode is \'dateTimeRange\', v-model must be \'Array\' type.');
      } else if (getDateMs(props.modelValue[0]) > getDateMs(props.modelValue[1])) {
        console.warn('[EVUI][Calendar] When mode is \'dateRange\', fromDate must be less than toDate.');
      }
    }
  };

  // 메인(좌측) 달력(연, 월, 시, 분, 초) 페이징 정보
  let mainCalendarPageInfo;
  const mainValue = !['dateRange', 'dateTimeRange'].includes(props.mode) ? selectedValue.value : selectedValue.value[0];
  if (mainValue?.length) {
    mainCalendarPageInfo = reactive({
      year: getDateTimeInfoByType(mainValue, 'year'),
      month: getDateTimeInfoByType(mainValue, 'month'),
      hour: Math.floor(getDateTimeInfoByType(mainValue, 'hour') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
      min: Math.floor(getDateTimeInfoByType(mainValue, 'min') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
      sec: Math.floor(getDateTimeInfoByType(mainValue, 'sec') / CELL_CNT_IN_ONE_PAGE) + 1 || 1,
    });
  } else {
    mainCalendarPageInfo = reactive({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      hour: 1,
      min: 1,
      sec: 1,
    });
  }

  // 'mode: dateRange || dateTimeRange', 인 경우 확장된 달력(연, 월) 페이징 정보
  let expandedCalendarPageInfo;
  if ((['dateRange', 'dateTimeRange'].includes(props.mode))
    && Array.isArray(selectedValue.value)
    && selectedValue.value[1]
  ) {
    const expandedValue = selectedValue.value[1];
    const toDate = {
      year: getDateTimeInfoByType(expandedValue, 'year'),
      month: getDateTimeInfoByType(expandedValue, 'month'),
    };
    expandedCalendarPageInfo = reactive(toDate);

    if (props.mode === 'dateTimeRange') {
      expandedCalendarPageInfo.hour = Math.floor(getDateTimeInfoByType(expandedValue, 'hour') / CELL_CNT_IN_ONE_PAGE) + 1 || 1;
      expandedCalendarPageInfo.min = Math.floor(getDateTimeInfoByType(expandedValue, 'min') / CELL_CNT_IN_ONE_PAGE) + 1 || 1;
      expandedCalendarPageInfo.sec = Math.floor(getDateTimeInfoByType(expandedValue, 'sec') / CELL_CNT_IN_ONE_PAGE) + 1 || 1;
    }
  } else {
    expandedCalendarPageInfo = reactive({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      hour: 1,
      min: 1,
      sec: 1,
    });
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
    () => ['dateRange', 'dateTimeRange'].includes(props.mode)
        && (mainCalendarPageInfo.year === expandedCalendarPageInfo.year
        && mainCalendarPageInfo.month === expandedCalendarPageInfo.month),
  );

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
  const { props, emit } = getCurrentInstance();
  const { selectedValue, mainCalendarPageInfo, expandedCalendarPageInfo } = param;

  // 메인 달력 테이블의 날짜 정보 (6X7, 2차원배열)
  const mainCalendarTableInfo = reactive(getMatrixArr(CALENDAR_ROWS, CALENDAR_COLS));
  // dateRange 모드의 확장된 달력 테이블의 날짜 정보
  const expandedCalendarTableInfo = reactive(getMatrixArr(CALENDAR_ROWS, CALENDAR_COLS));
  // 시간박스 정보
  const mainTimeTableInfo = reactive({
    hour: [],
    min: [],
    sec: [],
  });
  // dateTimeRange 모드의 확장된 달력 테이블의 시간 박스 정보
  const expandedTimeTableInfo = reactive({
    hour: [],
    min: [],
    sec: [],
  });

  const getModelValue = ({ isRangeMode, calendarType, disabledDate }) => {
    let modelValue = '';

    // check disabled date
    if (isRangeMode) {
      if (calendarType === 'main' && selectedValue.value[0]) {
        if (disabledDate && disabledDate(new Date(selectedValue.value[0]))) {
          selectedValue.value[0] = '';
          emit('update:modelValue', [...selectedValue.value]);
        }
      } else if (calendarType === 'expanded' && selectedValue.value[1]) {
        if (disabledDate && disabledDate(new Date(selectedValue.value[1]))) {
          selectedValue.value[1] = '';
          emit('update:modelValue', [...selectedValue.value]);
        }
      }
      modelValue = selectedValue.value[+(calendarType !== 'main')];
    } else if (props.mode === 'dateMulti') {
      selectedValue.value.forEach((value, index) => {
        if (disabledDate && disabledDate(new Date(value))) {
          selectedValue.value.splice(index, 1);
          emit('update:modelValue', [...selectedValue.value]);
        }
      });
    } else {
      if (disabledDate && disabledDate(new Date(selectedValue.value))) {
        selectedValue.value = '';
        emit('update:modelValue', selectedValue.value);
      }
      modelValue = selectedValue.value;
    }

    return modelValue;
  };

  /**
   * Dropdown Calendar 날짜 정보 세팅하기
   * @param calendarType - 달력 종류 ('main'|'expanded')
   */
  const setCalendarDate = (calendarType) => {
    const calendarPageInfo = calendarType === 'expanded'
      ? expandedCalendarPageInfo : mainCalendarPageInfo;
    const calendarTableInfo = calendarType === 'expanded'
      ? expandedCalendarTableInfo : mainCalendarTableInfo;

    let disabledDate = props.options.disabledDate;
    if (disabledDate && Array.isArray(disabledDate)) {
      disabledDate = calendarType === 'main' ? disabledDate[0] : disabledDate[1];
    }
    const isRangeMode = ['dateRange', 'dateTimeRange'].includes(props.mode);

    const modelValue = getModelValue({
      isRangeMode,
      calendarType,
      disabledDate,
    });

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
    const YEAR_OF_NEXT_MONTH = computed(() => (calendarPageInfo.month === 12
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
      const isInvalidDate = isRangeMode
          && compareFromAndToDateTime(props.mode, calendarType, currDate, selectedValue.value);

      // time 모드인 경우 현재 값의 시간을 가지고 테스트
      const timeValue = props.mode.includes('Time') ? modelValue?.split(' ')[1] : '';

      const isDisabled = disabledDate && disabledDate(new Date(`${currDate} ${timeValue ?? ''}`));

      const index = +(calendarType !== 'main');
      const isRangeSelected = isRangeMode && selectedValue.value.length > index
          && selectedValue.value[index].split(' ')[0].includes(currDate);
      const isSelected = !isDisabled && (isRangeMode
        ? monthType === '' && isRangeSelected
        : selectedValue.value?.includes(currDate));

      // mode가 dateRange일 때는 이전, 다음달에 selected 를 하지 않는다.
      calendarTableInfo[i][j] = {
        monthType: `${monthType}${isDisabled || isInvalidDate ? ' disabled' : ''}`,
        isToday: TODAY_YMD === currDate,
        isSelected,
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
    const timeFormat = props.options?.timeFormat;
    const disabledDate = props.options?.disabledDate;
    const mainTimeFormat = Array.isArray(timeFormat) ? timeFormat[0] : timeFormat;
    const expandedTimeFormat = Array.isArray(timeFormat) ? timeFormat[1] : '';
    const mainDateTimeValue = props.mode === 'dateTimeRange' ? selectedValue.value[0] : selectedValue.value;
    const expandedDateTimeValue = props.mode === 'dateTimeRange' ? selectedValue.value[1] : '';
    const mainDisabledDate = Array.isArray(disabledDate) ? disabledDate[0] : disabledDate;
    const expandedDisabledDate = Array.isArray(disabledDate) ? disabledDate[1] : disabledDate;

    const compareDateTimeValue = (calendarType, timeType, value) => {
      const dateTimeValue = calendarType === 'main' ? mainDateTimeValue : expandedDateTimeValue;
      const disabledDateFunc = calendarType === 'main' ? mainDisabledDate : expandedDisabledDate;
      if (!dateTimeValue) {
        return false;
      }

      const date = dateTimeValue.split(' ')[0];
      let hour = getDateTimeInfoByType(dateTimeValue, 'hour');
      let min = getDateTimeInfoByType(dateTimeValue, 'min');
      let sec = getDateTimeInfoByType(dateTimeValue, 'sec');

      if (timeType === 'hour') {
        hour = value;
      } else if (timeType === 'min') {
        min = value;
      } else if (timeType === 'sec') {
        sec = value;
      }

      const targetDateTimeValue = `${date} ${lpadToTwoDigits(hour)}:${lpadToTwoDigits(min)}:${lpadToTwoDigits(sec)}`;
      if (disabledDateFunc && disabledDateFunc(new Date(targetDateTimeValue))) {
        return true;
      }

      return compareFromAndToDateTime(
          props.mode,
          calendarType,
          targetDateTimeValue,
          selectedValue.value,
      );
    };

    ['hour', 'min', 'sec'].forEach((v) => {
      let cnt = SEC_CNT;
      if (v === 'hour') {
        cnt = HOUR_CNT;
      } else if (v === 'min') {
        cnt = MIN_CNT;
      }
      const mainTimeValue = mainDateTimeValue && mainDateTimeValue.length > 0
          ? getTimeInfoByTimeFormat(mainTimeFormat, mainDateTimeValue, v) : -1;
      const expandedTimeValue = expandedDateTimeValue && expandedDateTimeValue.length > 0
          ? getTimeInfoByTimeFormat(expandedTimeFormat, expandedDateTimeValue, v) : -1;
      for (let i = 0; i < cnt; i++) {
        let isDisabled = props.mode === 'dateTimeRange' && compareDateTimeValue('main', v, i);
          mainTimeTableInfo[v][i] = {
          timeType: v,
          num: i,
          isSelected: !isDisabled && mainTimeValue === i,
          isDisabled,
        };
        if (props.mode === 'dateTimeRange') {
          isDisabled = compareDateTimeValue('expanded', v, i);
          expandedTimeTableInfo[v][i] = {
            timeType: v,
            num: i,
            isSelected: !isDisabled && expandedTimeValue === i,
            isDisabled,
          };
        }
      }
    });
  };

  /**
   * HMS 영역 내 tr, td, 페이지에 맞는 시간 정보 가져오기
   * @param timeType - {'hour'|'min'|'sec'}
   * @param i - rows
   * @param j - cols
   * @param calendarType - {'main'|'expanded'}
   * @returns {object} - cellInfo
   */
  const getTimeInfo = (timeType, i, j, calendarType) => {
    const pageInfo = calendarType === 'main' ? mainCalendarPageInfo : expandedCalendarPageInfo;
    const timeInfo = calendarType === 'main' ? mainTimeTableInfo : expandedTimeTableInfo;
    const currPage = pageInfo[timeType] - 1;
    const currRowIdx = i - 1;
    const currColIdx = j - 1;
    const currIdx = (currPage * CELL_CNT_IN_ONE_PAGE)
      + (currRowIdx * CELL_CNT_IN_ONE_ROW) + currColIdx;
    return timeInfo[timeType][currIdx];
  };

  return {
    mainCalendarTableInfo,
    expandedCalendarTableInfo,
    mainTimeTableInfo,
    expandedTimeTableInfo,
    setCalendarDate,
    setHmsTime,
    getTimeInfo,
  };
};

export const useEvent = (param) => {
  const { props, emit } = getCurrentInstance();
  const timeFormat = props.options?.timeFormat;
  const {
    selectedValue,
    mainCalendarPageInfo,
    expandedCalendarPageInfo,
    mainTimeTableInfo,
    expandedTimeTableInfo,
    setCalendarDate,
    setHmsTime,
  } = param;

  // dateRange mode에서 클릭하여 첫번째 선택된 날짜
  const dateRangeClickedDate = ref('');
  // dateRange mode에서 클릭한번 후 커서에 따라 날짜를 마우스오버하는 경우 dynamic argument로 이벤트명 설정
  const calendarEventName = ref(null);
  // dateTime 또는 dateTimeRange에서 timeFormat이 있는 경우 event 막음
  const mainTimeFormat = Array.isArray(timeFormat) ? timeFormat[0] : timeFormat;
  const expandedTimeFormat = Array.isArray(timeFormat) ? timeFormat[1] : '';
  const preventTimeEventType = {
    main: {
      hour: mainTimeFormat && mainTimeFormat.split(':')[0] !== 'HH',
      min: mainTimeFormat && mainTimeFormat.split(':')[1] !== 'mm',
      sec: mainTimeFormat && mainTimeFormat.split(':')[2] !== 'ss',
    },
    expanded: {
      hour: expandedTimeFormat && expandedTimeFormat.split(':')[0] !== 'HH',
      min: expandedTimeFormat && expandedTimeFormat.split(':')[1] !== 'mm',
      sec: expandedTimeFormat && expandedTimeFormat.split(':')[2] !== 'ss',
    },
  };

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
      calendarPageInfo.hour = hour;
    }
    if (min) {
      calendarPageInfo.min = min;
    }
    if (sec) {
      calendarPageInfo.sec = sec;
    }
  };

  /**
   * value를 Array로 담아 페이지 세팅
   * @param valueList
   */
  const updateCalendarPage = (valueList) => {
    valueList?.forEach((currValue, index) => {
      const changeCalendarType = index === 0 ? 'main' : 'expanded';
      setCalendarPageInfo(changeCalendarType, {
        year: getDateTimeInfoByType(currValue, 'year'),
        month: getDateTimeInfoByType(currValue, 'month'),
        hour: Math.floor(getDateTimeInfoByType(currValue, 'hour') / CELL_CNT_IN_ONE_PAGE) + 1,
        min: Math.floor(getDateTimeInfoByType(currValue, 'min') / CELL_CNT_IN_ONE_PAGE) + 1,
        sec: Math.floor(getDateTimeInfoByType(currValue, 'sec') / CELL_CNT_IN_ONE_PAGE) + 1,
      });
      setCalendarDate(changeCalendarType);
    });
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
    const isDateRangeMode = ['dateRange', 'dateTimeRange'].includes(props.mode);
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

      // 두 달력간의 연속 여부 (메인 달력 + 1Month === 확장된 달력)
      // mainCalendar Month < expandedCalendar Month
      const isContinuousMonths = expandedCalendarPageInfo.year === mainCalendarPageInfo.year
        && expandedCalendarPageInfo.month === mainCalendarPageInfo.month;
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
   * @param calendarType - {main|expanded}
   * @param dateInfo
   */
  const clickDate = (calendarType, dateInfo) => {
    const { year, month, date, monthType } = dateInfo;
    const CURR_DATE_STR = formatDateTime({ year, month, date });
    const isExistCurrDate = props.modelValue ? (Array.isArray(props.modelValue)
        ? props.modelValue?.map(v => v.split(' ')[0])
        : props.modelValue.split(' ')[0])
        .includes(CURR_DATE_STR) : false;

    let disabledDate = props.options.disabledDate;
    if (disabledDate && Array.isArray(disabledDate)) {
      disabledDate = calendarType === 'main' ? disabledDate[0] : disabledDate[1];
    }
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

    const setRangeModeDateByIndex = (currIndex, currDate) => {
      if (compareFromAndToDateTime(props.mode, calendarType, currDate, selectedValue.value)) {
        return;
      }

      selectedValue.value[currIndex] = currDate;
      moveDispCalendarMonth();
      updateCalendarPage(selectedValue.value);
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
        selectedValue.value = getChangedValueByTimeFormat(
            timeFormat,
            `${CURR_DATE_STR} ${CURR_TIME_HMS}`,
        );
        moveDispCalendarMonth();
        emit('update:modelValue', selectedValue.value);
        setCalendarDate('main');
        if (!isExistTime) {
          const currTime = selectedValue.value.split(' ')[1].split(':');
          setCalendarPageInfo('main', {
            hour: Math.floor(currTime[0] / CELL_CNT_IN_ONE_PAGE) + 1,
            min: Math.floor(currTime[1] / CELL_CNT_IN_ONE_PAGE) + 1,
            sec: Math.floor(currTime[2] / CELL_CNT_IN_ONE_PAGE) + 1,
          });
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
        if (!selectedValue.value.length) {
          selectedValue.value.push(CURR_DATE_STR);
          selectedValue.value.push(CURR_DATE_STR);
          updateCalendarPage(selectedValue.value);
        } else {
          setRangeModeDateByIndex(calendarType !== 'main' | 0, CURR_DATE_STR);
        }
        emit('update:modelValue', [...selectedValue.value]);
        break;
      }
      case 'dateTimeRange': {
        if (!selectedValue.value.length) {
          let fromDate = `${CURR_DATE_STR} 00:00:00`;
          let toDate = `${CURR_DATE_STR} 00:00:00`;
          if (timeFormat && timeFormat.length) {
            fromDate = getChangedValueByTimeFormat(
                timeFormat[0],
                fromDate,
            );
            toDate = getChangedValueByTimeFormat(
                timeFormat[1],
                toDate,
            );
          }
          selectedValue.value.push(fromDate);
          selectedValue.value.push(toDate);

          updateCalendarPage(selectedValue.value);
          setHmsTime();
        } else {
          const currIndex = calendarType !== 'main' | 0;
          const CURR_TIME_HMS = selectedValue.value[currIndex]?.split(' ')[1] || '00:00:00';

          let currDate = `${CURR_DATE_STR} ${CURR_TIME_HMS}`;
          if (timeFormat && timeFormat.length) {
            currDate = getChangedValueByTimeFormat(
                timeFormat[currIndex],
                currDate,
            );
          }
          setRangeModeDateByIndex(currIndex, currDate);
        }
        emit('update:modelValue', [...selectedValue.value]);
        break;
      }
      default:
        break;
    }
  };

  /**
   * Calendar mode: dateTime인 경우 HMS 이동 화살표 클릭 이벤트
   * @param calendarType - {main|expanded}
   * @param timeType - {hour|min|sec}
   * @param arrow - {up|down}
   */
  const clickHmsBtn = (calendarType, timeType, arrow) => {
    if (preventTimeEventType[calendarType][timeType]) {
      return;
    }

    const calendarPageInfo = calendarType === 'expanded'
      ? expandedCalendarPageInfo : mainCalendarPageInfo;
    const FIRST_PAGE = 1;
    const HOUR_MAX_PAGE = 2;
    const MINUTE_MAX_PAGE = 5;
    const SECOND_MAX_PAGE = 5;
    if (timeType === 'hour') {
      if (arrow === 'down' && calendarPageInfo.hour < HOUR_MAX_PAGE) {
        calendarPageInfo.hour++;
      } else if (arrow === 'up' && calendarPageInfo.hour > FIRST_PAGE) {
        calendarPageInfo.hour--;
      }
    } else if (timeType === 'min') {
      if (arrow === 'down' && calendarPageInfo.min < MINUTE_MAX_PAGE) {
        calendarPageInfo.min++;
      } else if (arrow === 'up' && calendarPageInfo.min > FIRST_PAGE) {
        calendarPageInfo.min--;
      }
    } else if (timeType === 'sec') {
      if (arrow === 'down' && calendarPageInfo.sec < SECOND_MAX_PAGE) {
        calendarPageInfo.sec++;
      } else if (arrow === 'up' && calendarPageInfo.sec > FIRST_PAGE) {
        calendarPageInfo.sec--;
      }
    }
  };

  /**
   * Click cell In HMS area
   * @param calendarType - {main|expanded}
   * @param timeType - {hour|min|sec}
   * @param i - row
   * @param j - col
   */
  const clickTime = (calendarType, timeType, i, j) => {
    if (preventTimeEventType[calendarType][timeType]) {
      return;
    }

    const calendarPageInfo = calendarType === 'expanded'
        ? expandedCalendarPageInfo : mainCalendarPageInfo;
    const timeInfo = calendarType === 'main'
      ? mainTimeTableInfo : expandedTimeTableInfo;
    const currPage = calendarPageInfo[timeType] - 1;
    const currRowIdx = i - 1;
    const currColIdx = j - 1;
    const clickedNum = (currPage * CELL_CNT_IN_ONE_PAGE)
     + (currRowIdx * CELL_CNT_IN_ONE_ROW) + currColIdx;

    if (timeInfo[timeType][clickedNum]?.isDisabled) {
      return;
    }

    const TODAY = new Date();
    const TODAY_INFO = {
      year: TODAY.getFullYear(),
      month: TODAY.getMonth() + 1,
      date: TODAY.getDate(),
    };
    let EXIST_MODEL = true;
    let valueListByUpdatePage = [];

    const getTimeValueByType = () => {
      let targetTimeValue;
      if (timeType === 'hour') {
        targetTimeValue = `${lpadToTwoDigits(clickedNum)}:00:00'`;
      } else if (timeType === 'min') {
        targetTimeValue = `00:${lpadToTwoDigits(clickedNum)}:00`;
      } else if (timeType === 'sec') {
        targetTimeValue = `00:00:${lpadToTwoDigits(clickedNum)}`;
      }
      return `${formatDateTime(TODAY_INFO)} ${targetTimeValue}`;
    };

    const getChangedValue = (targetValue) => {
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
      return `${targetValue?.substr(0, START_IDX)}`
      + `${lpadToTwoDigits(clickedNum)}${targetValue?.substr(START_IDX + REPLACE_TEXT_SIZE)}`;
    };

    if (props.mode === 'dateTime') {
      if (!props.modelValue) {
        EXIST_MODEL = false;
        selectedValue.value = getChangedValueByTimeFormat(
            timeFormat,
            getTimeValueByType(),
        );
        emit('update:modelValue', selectedValue.value);
      } else {
        selectedValue.value = getChangedValueByTimeFormat(
            timeFormat,
            getChangedValue(props.modelValue),
        );
        emit('update:modelValue', selectedValue.value);
      }
      valueListByUpdatePage.push(selectedValue.value);
    } else {
      const index = calendarType !== 'main' | 0;
      if (!props.modelValue.length) {
        const timeValue = getTimeValueByType();
        selectedValue.value = [timeValue, timeValue];

        if (timeFormat && timeFormat.length) {
          selectedValue.value = [...selectedValue.value
              .map((v, idx) => getChangedValueByTimeFormat(timeFormat[idx], v))];
        }

        EXIST_MODEL = false;
        valueListByUpdatePage = selectedValue.value;
      } else {
        let currDateTime = getChangedValue(props.modelValue[index]);
        if (timeFormat && timeFormat.length) {
          currDateTime = getChangedValueByTimeFormat(
              timeFormat[index],
              currDateTime,
          );
        }

        const fromDate = index ? selectedValue.value[0] : currDateTime;
        const toDate = index ? currDateTime : selectedValue.value[1];

        if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
          return;
        }

        selectedValue.value[index] = currDateTime;
      }
      emit('update:modelValue', [...selectedValue.value]);
    }
    setHmsTime();
    // dateTime의 v-model값이 없는 경우 time area를 클릭하였을 때 date의 값은 today로 세팅
    if (!EXIST_MODEL) {
      updateCalendarPage(valueListByUpdatePage);
    }
  };

  /**
   * Wheel up or wheel down In Calendar Month(tbody) area
   * @param calendarType - {main|expanded}
   * @param e
   */
  const wheelMonth = (calendarType, e) => {
    moveMonth(calendarType, e.deltaY > 0 ? 'next' : 'prev');
    setCalendarDate(calendarType);
  };

  /**
   * Wheel up or wheel down In Calendar Time(HMS) area
   * @param calendarType - {main|expanded}
   * @param timeType - {hour|min|sec}
   * @param e
   */
  const wheelTime = (calendarType, timeType, e) => {
    if (preventTimeEventType[calendarType][timeType]) {
      return;
    }

    clickHmsBtn(calendarType, timeType, e.deltaY > 0 ? 'down' : 'up');
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

  watch(
    () => props.modelValue,
    (curr) => {
      selectedValue.value = curr;

      if (props.mode.includes('Time')) {
        let updateValue = [];
        if (props.mode === 'dateTime') {
          updateValue = [selectedValue.value];
        } else if (props.mode === 'dateTimeRange') {
          updateValue = selectedValue.value;
        }
        updateCalendarPage(updateValue);
        setHmsTime();
      }
  });

  return {
    clickPrevNextBtn,
    clickDate,
    clickHmsBtn,
    clickTime,
    wheelMonth,
    wheelTime,
    calendarEventName,
    onMousemoveDate,
    preventTimeEventType,
  };
};
