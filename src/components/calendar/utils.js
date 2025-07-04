import {
  YEAR_CNT_IN_ONE_PAGE,
} from './constants';

/**
 * 배열 내 여러 날짜(eg. 'YYYY-MM-DD' || 'YYYY-MM-DD HH:MI:SS') 중 가장 끝의 날짜 텍스트 구하기
 * @param arr
 * @param sideDirection - 끝의 방향 (first: 가장 멀리 오래된 날짜, last: 가장 최근의 날짜)
 * @returns {String} - 날짜 텍스트
 */
export const getSideDateStr = (arr, sideDirection) => {
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
export const getMatrixArr = (row, col) => Array.from(Array(row), () => Array(col).fill(false));

/**
 * y년 m월 1일의 요일 구하기
 * @param y - 년
 * @param m - 월
 * @returns {number} - 해당 y년 m월 1일의 요일 (e.g. 0: SUN, ..., 6: SAT)
 *                   - 1주차에서 일요일부터 1일까지의 공백 개수
 */
export const getDayOfWeekOnThe1stOfMonth = (y, m) => new Date(`${y}-${m}-1`).getDay();

/**
 * y년 m월 마지막 일자 구하기
 * @param y
 * @param m
 * @returns {number} - 해당 년, 월의 마지막 일자
 */
export const getLastDateOfMonth = (y, m) => {
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
export const formatDateTime = ({ year, month, date, hour, min, sec }) => {
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
export const getDateTimeInfoByType = (param, typeToImport) => {
  // unref는 utils.js에서 직접 처리하지 않고 호출하는 곳에서 처리하도록 변경
  let str = param;
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
export const getSideMonthCalendarInfo = (prevNext, year, month) => {
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
export const getTimeInfoByTimeFormat = (timeFormat, dateTimeValue, typeToImport) => {
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

/**
 * 현재 달력의 날짜와 다음 달력의 날짜 비교 (disabledDate 옵션이 없는 경우만 적용)
 * @param mode - calendar mode
 * @param calendarType - 달력 종류 {main | expanded}
 * @param targetDate - 기준 날짜
 * @param modelValue - model value
 * @returns {*|boolean}
 */
export const compareFromAndToDateTime = (mode, calendarType, targetDate, modelValue) => {
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
export const getDateMs = dateStr => new Date(`${dateStr}`).getTime();

/**
 * Calendar 년도 범위 구하기
 * @param currentYear - 현재 Calendar 페이지 정보의 년도
 * @returns {{start: number, end: number}} - start: 시작년도, end: 마지막 년도
 */
export const getYearRange = (currentYear) => {
  const multipleOf10 = 10 ** (currentYear.toString().length - 1);
  const quotient = Math.floor(currentYear / multipleOf10);
  const remainder = Math.floor(currentYear % (multipleOf10 * quotient));
  const startYear = (quotient * multipleOf10)
    + (Math.floor(remainder / YEAR_CNT_IN_ONE_PAGE) * YEAR_CNT_IN_ONE_PAGE);
  const endYear = startYear + YEAR_CNT_IN_ONE_PAGE - 1;
  return {
    start: startYear,
    end: endYear,
  };
};
