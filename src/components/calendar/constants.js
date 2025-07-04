// Calendar 관련 상수들
export const CALENDAR_ROWS = 6;
export const CALENDAR_COLS = 7;
export const CALENDAR_MONTH_ROWS = 4;
export const CALENDAR_MONTH_COLS = 3;
export const CALENDAR_YEAR_ROWS = 5;
export const CALENDAR_YEAR_COLS = 4;
export const MONTH_CNT = 12;
export const HOUR_CNT = 24;
export const MIN_CNT = 60;
export const SEC_CNT = 60;
export const CELL_CNT_IN_ONE_PAGE = 12;
export const CELL_CNT_IN_ONE_ROW = 4;
export const YEAR_CNT_IN_ONE_PAGE = 20;

// 월 이름 목록
export const MONTH_NAME_LIST = {
  fullName: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'],
  numberName: ['1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'],
  abbrName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  korName: ['1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'],
};

// 요일 이름 목록
export const DAY_OF_THE_WEEK_NAME_LIST = {
  abbrUpperName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  abbrLowerName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  abbrPascalName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  abbrKorName: ['일', '월', '화', '수', '목', '금', '토'],
};

// 리스트 타입
export const LIST_TYPE = {
  DATE: 'date',
  MONTH: 'month',
  YEAR: 'year',
};

// 시간 관련 상수
export const ONE_DAY_MS = 86400000;
export const MIN_DATE_MS = +new Date('1970-01-01 00:00:00'); // javascript 객체 최소 시간

// 정규식
export const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
export const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);
