import { describe, it, expect } from 'vitest';
import {
  getDayOfWeekOnThe1stOfMonth,
  getMatrixArr,
  getSideDateStr,
  lpadToTwoDigits,
} from '../../../src/components/calendar/utils.js';

describe('Calendar Utils', () => {
  describe('getSideDateStr', () => {
    // 정상 케이스
    it('가장 최근 날짜를 반환해야 한다 (last)', () => {
      const dates = ['2023-01-01', '2023-12-31', '2023-06-15'];
      expect(getSideDateStr(dates, 'last')).toBe('2023-12-31');
    });

    it('가장 오래된 날짜를 반환해야 한다 (first)', () => {
      const dates = ['2023-01-01', '2023-12-31', '2023-06-15'];
      expect(getSideDateStr(dates, 'first')).toBe('2023-01-01');
    });

    it('날짜시간 형식에서도 올바르게 동작해야 한다', () => {
      const dateTimes = [
        '2023-01-01 10:00:00',
        '2023-01-01 15:30:00',
        '2023-01-01 08:45:00',
      ];
      expect(getSideDateStr(dateTimes, 'last')).toBe('2023-01-01 15:30:00');
      expect(getSideDateStr(dateTimes, 'first')).toBe('2023-01-01 08:45:00');
    });

    it('단일 요소 배열을 처리해야 한다', () => {
      expect(getSideDateStr(['2023-05-15'], 'last')).toBe('2023-05-15');
      expect(getSideDateStr(['2023-05-15'], 'first')).toBe('2023-05-15');
    });

    // 엣지 케이스
    it('빈 배열인 경우 빈 문자열을 반환해야 한다', () => {
      expect(getSideDateStr([], 'last')).toBe('');
      expect(getSideDateStr([], 'first')).toBe('');
    });

    it('동일한 날짜들이 있는 경우를 처리해야 한다', () => {
      const sameDates = ['2023-03-15', '2023-03-15', '2023-03-15'];
      expect(getSideDateStr(sameDates, 'last')).toBe('2023-03-15');
      expect(getSideDateStr(sameDates, 'first')).toBe('2023-03-15');
    });

    it('연도를 넘나드는 날짜들을 처리해야 한다', () => {
      const dates = ['2022-12-31', '2023-01-01', '2024-01-01'];
      expect(getSideDateStr(dates, 'last')).toBe('2024-01-01');
      expect(getSideDateStr(dates, 'first')).toBe('2022-12-31');
    });

    it('밀리초까지 포함된 시간을 처리해야 한다', () => {
      const dateTimes = [
        '2023-01-01 10:30:45.123',
        '2023-01-01 10:30:45.999',
        '2023-01-01 10:30:45.001',
      ];
      expect(getSideDateStr(dateTimes, 'last')).toBe('2023-01-01 10:30:45.999');
      expect(getSideDateStr(dateTimes, 'first')).toBe('2023-01-01 10:30:45.001');
    });

    // 오류 케이스
    it('잘못된 날짜 형식이 포함된 경우를 처리해야 한다', () => {
      const invalidDates = ['2023-01-01', 'invalid-date', '2023-12-31'];
      // 잘못된 형식은 Invalid Date가 되므로 NaN과 비교되어 제외됨
      expect(getSideDateStr(invalidDates, 'last')).toBe('2023-12-31');
      expect(getSideDateStr(invalidDates, 'first')).toBe('2023-01-01');
    });
  });

  describe('lpadToTwoDigits', () => {
    // 정상 케이스
    it('한 자리 숫자는 앞에 0을 붙여야 한다', () => {
      expect(lpadToTwoDigits(1)).toBe('01');
      expect(lpadToTwoDigits(9)).toBe('09');
      expect(lpadToTwoDigits(0)).toBe('00');
    });

    it('두 자리 숫자는 그대로 반환해야 한다', () => {
      expect(lpadToTwoDigits(10)).toBe('10');
      expect(lpadToTwoDigits(25)).toBe('25');
      expect(lpadToTwoDigits(99)).toBe('99');
    });

    it('문자열 숫자도 올바르게 처리해야 한다', () => {
      expect(lpadToTwoDigits('5')).toBe('05');
      expect(lpadToTwoDigits('15')).toBe('15');
    });

    // 엣지 케이스
    it('null은 "00"을 반환해야 한다', () => {
      expect(lpadToTwoDigits(null)).toBe('00');
    });

    it('음수를 처리해야 한다', () => {
      expect(lpadToTwoDigits(-1)).toBe('-1');
      expect(lpadToTwoDigits(-5)).toBe('-5');
    });

    it('세 자리 이상 숫자를 처리해야 한다', () => {
      expect(lpadToTwoDigits(100)).toBe('100');
      expect(lpadToTwoDigits(999)).toBe('999');
    });

    it('소수점 숫자를 처리해야 한다', () => {
      expect(lpadToTwoDigits(5.5)).toBe('5.5');
      expect(lpadToTwoDigits(15.7)).toBe('15.7');
    });

    // 오류 케이스
    it('undefined는 "00"을 반환해야 한다', () => {
      expect(lpadToTwoDigits(undefined)).toBe('00');
    });

    it('잘못된 문자열은 "00"을 반환해야 한다', () => {
      expect(lpadToTwoDigits('abc')).toBe('00');
      expect(lpadToTwoDigits('')).toBe('00');
    });

    it('NaN은 "00"을 반환해야 한다', () => {
      expect(lpadToTwoDigits(NaN)).toBe('00');
    });

    it('Infinity는 "Infinity"를 반환해야 한다', () => {
      expect(lpadToTwoDigits(Infinity)).toBe('Infinity');
    });
  });

  describe('getMatrixArr', () => {
    // 정상 케이스
    it('지정된 크기의 2차원 배열을 생성해야 한다', () => {
      const matrix = getMatrixArr(3, 4);
      expect(matrix).toHaveLength(3);
      expect(matrix[0]).toHaveLength(4);
      expect(matrix[1]).toHaveLength(4);
      expect(matrix[2]).toHaveLength(4);
    });

    it('모든 요소가 false로 초기화되어야 한다', () => {
      const matrix = getMatrixArr(2, 2);
      expect(matrix[0][0]).toBe(false);
      expect(matrix[0][1]).toBe(false);
      expect(matrix[1][0]).toBe(false);
      expect(matrix[1][1]).toBe(false);
    });

    it('1x1 배열도 올바르게 생성해야 한다', () => {
      const matrix = getMatrixArr(1, 1);
      expect(matrix).toHaveLength(1);
      expect(matrix[0]).toHaveLength(1);
      expect(matrix[0][0]).toBe(false);
    });

    // 엣지 케이스
    it('0x0 배열을 생성해야 한다', () => {
      const matrix = getMatrixArr(0, 0);
      expect(matrix).toHaveLength(0);
    });

    it('한 차원이 0인 경우를 처리해야 한다', () => {
      const matrix1 = getMatrixArr(3, 0);
      expect(matrix1).toHaveLength(3);
      expect(matrix1[0]).toHaveLength(0);

      const matrix2 = getMatrixArr(0, 3);
      expect(matrix2).toHaveLength(0);
    });

    it('큰 크기의 배열을 생성해야 한다', () => {
      const matrix = getMatrixArr(100, 100);
      expect(matrix).toHaveLength(100);
      expect(matrix[0]).toHaveLength(100);
    });

    // 오류 케이스
    it('음수 크기에 대해 예외를 발생시키지 않아야 한다', () => {
      // Array(-1)은 에러를 발생시키므로 이 경우는 실제로는 오류가 날 수 있음
      expect(() => getMatrixArr(-1, 5)).toThrow();
    });
  });

  describe('getDayOfWeekOnThe1stOfMonth', () => {
    // 정상 케이스
    it('2023년 1월 1일은 일요일(0)이어야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(2023, 1)).toBe(0);
    });

    it('2023년 3월 1일은 수요일(3)이어야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(2023, 3)).toBe(3);
    });

    it('2023년 12월 1일은 금요일(5)이어야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(2023, 12)).toBe(5);
    });

    it('다양한 년도와 월을 처리해야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(2000, 1)).toBe(6); // 토요일
      expect(getDayOfWeekOnThe1stOfMonth(2024, 2)).toBe(4); // 목요일
    });

    // 엣지 케이스
    it('윤년의 2월을 처리해야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(2024, 2)).toBe(4); // 목요일
      expect(getDayOfWeekOnThe1stOfMonth(2020, 2)).toBe(6); // 토요일
    });

    it('극단적인 년도를 처리해야 한다', () => {
      expect(getDayOfWeekOnThe1stOfMonth(1970, 1)).toBe(4); // 목요일
      expect(getDayOfWeekOnThe1stOfMonth(2100, 1)).toBe(5); // 금요일
    });

    // 오류 케이스
    it('잘못된 월 값을 처리해야 한다', () => {
      // JavaScript Date는 월을 자동으로 조정함
      expect(getDayOfWeekOnThe1stOfMonth(2023, 13)).toBe(1); // 2024년 1월 1일
      expect(getDayOfWeekOnThe1stOfMonth(2023, 0)).toBe(4); // 2022년 12월 1일
    });
  });

  // describe('getLastDateOfMonth', () => {
  //   // 정상 케이스
  //   it('1월은 31일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 1)).toBe(31);
  //   });

  //   it('평년 2월은 28일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 2)).toBe(28);
  //   });

  //   it('윤년 2월은 29일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2024, 2)).toBe(29);
  //   });

  //   it('4월은 30일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 4)).toBe(30);
  //   });

  //   it('6월은 30일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 6)).toBe(30);
  //   });

  //   it('9월은 30일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 9)).toBe(30);
  //   });

  //   it('11월은 30일이어야 한다', () => {
  //     expect(getLastDateOfMonth(2023, 11)).toBe(30);
  //   });

  //   it('윤년 계산이 올바르게 동작해야 한다', () => {
  //     expect(getLastDateOfMonth(2000, 2)).toBe(29); // 400의 배수
  //     expect(getLastDateOfMonth(1900, 2)).toBe(28); // 100의 배수지만 400의 배수가 아님
  //     expect(getLastDateOfMonth(2004, 2)).toBe(29); // 4의 배수
  //   });

  //   // 엣지 케이스
  //   it('극단적인 년도의 2월을 처리해야 한다', () => {
  //     expect(getLastDateOfMonth(1600, 2)).toBe(29); // 윤년
  //     expect(getLastDateOfMonth(1700, 2)).toBe(28); // 평년
  //   });

  //   it('모든 31일 월을 처리해야 한다', () => {
  //     [1, 3, 5, 7, 8, 10, 12].forEach((month) => {
  //       expect(getLastDateOfMonth(2023, month)).toBe(31);
  //     });
  //   });

  //   it('모든 30일 월을 처리해야 한다', () => {
  //     [4, 6, 9, 11].forEach((month) => {
  //       expect(getLastDateOfMonth(2023, month)).toBe(30);
  //     });
  //   });

  //   // 오류 케이스
  //   it('잘못된 월 값을 처리해야 한다', () => {
  //     // switch문에서 default로 31을 반환
  //     expect(getLastDateOfMonth(2023, 13)).toBe(31);
  //     expect(getLastDateOfMonth(2023, 0)).toBe(31);
  //     expect(getLastDateOfMonth(2023, -1)).toBe(31);
  //   });
  // });

  // describe('formatDateTime', () => {
  //   // 정상 케이스
  //   it('날짜만 포맷팅해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 3,
  //       date: 5,
  //       hour: undefined,
  //       min: undefined,
  //       sec: undefined,
  //     });
  //     expect(result).toBe('2023-03-05');
  //   });

  //   it('날짜와 시간을 모두 포맷팅해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 3,
  //       date: 5,
  //       hour: 14,
  //       min: 30,
  //       sec: 45,
  //     });
  //     expect(result).toBe('2023-03-05 14:30:45');
  //   });

  //   it('한 자리 숫자를 두 자리로 패딩해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 1,
  //       date: 8,
  //       hour: 9,
  //       min: 5,
  //       sec: 3,
  //     });
  //     expect(result).toBe('2023-01-08 09:05:03');
  //   });

  //   // 엣지 케이스
  //   it('0시 0분 0초를 처리해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 12,
  //       date: 31,
  //       hour: 0,
  //       min: 0,
  //       sec: 0,
  //     });
  //     expect(result).toBe('2023-12-31 00:00:00');
  //   });

  //   it('23시 59분 59초를 처리해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 12,
  //       date: 31,
  //       hour: 23,
  //       min: 59,
  //       sec: 59,
  //     });
  //     expect(result).toBe('2023-12-31 23:59:59');
  //   });

  //   it('윤년의 2월 29일을 처리해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2024,
  //       month: 2,
  //       date: 29,
  //       hour: 12,
  //       min: 0,
  //       sec: 0,
  //     });
  //     expect(result).toBe('2024-02-29 12:00:00');
  //   });

  //   // 오류 케이스
  //   it('잘못된 날짜 값을 처리해야 한다', () => {
  //     const result = formatDateTime({
  //       year: 2023,
  //       month: 13,
  //       date: 32,
  //       hour: 25,
  //       min: 61,
  //       sec: 61,
  //     });
  //     expect(result).toBe('2023-13-32 25:61:61');
  //   });
  // });

  // describe('getDateTimeInfoByType', () => {
  //   const dateTimeStr = '2023-03-15 14:30:45';

  //   // 정상 케이스
  //   it('특정 타입의 값을 반환해야 한다', () => {
  //     expect(getDateTimeInfoByType(dateTimeStr, 'year')).toBe(2023);
  //     expect(getDateTimeInfoByType(dateTimeStr, 'month')).toBe(3);
  //     expect(getDateTimeInfoByType(dateTimeStr, 'date')).toBe(15);
  //     expect(getDateTimeInfoByType(dateTimeStr, 'hour')).toBe(14);
  //     expect(getDateTimeInfoByType(dateTimeStr, 'min')).toBe(30);
  //     expect(getDateTimeInfoByType(dateTimeStr, 'sec')).toBe(45);
  //   });

  //   it('타입을 지정하지 않으면 전체 객체를 반환해야 한다', () => {
  //     const result = getDateTimeInfoByType(dateTimeStr, undefined);
  //     expect(result).toEqual({
  //       year: 2023,
  //       month: 3,
  //       date: 15,
  //       hour: 14,
  //       min: 30,
  //       sec: 45,
  //     });
  //   });

  //   it('날짜만 있는 문자열도 처리해야 한다', () => {
  //     const dateStr = '2023-03-15';
  //     const result = getDateTimeInfoByType(dateStr, undefined);
  //     expect(result).toEqual({
  //       year: 2023,
  //       month: 3,
  //       date: 15,
  //       hour: 0,
  //       min: 0,
  //       sec: 0,
  //     });
  //   });

  //   it('배열에서 가장 최근 날짜를 사용해야 한다', () => {
  //     const dates = ['2023-01-01', '2023-12-31', '2023-06-15'];
  //     expect(getDateTimeInfoByType(dates, 'year')).toBe(2023);
  //     expect(getDateTimeInfoByType(dates, 'month')).toBe(12);
  //     expect(getDateTimeInfoByType(dates, 'date')).toBe(31);
  //   });

  //   // 엣지 케이스
  //   it('극단적인 날짜를 처리해야 한다', () => {
  //     expect(getDateTimeInfoByType('1970-01-01 00:00:00', 'year')).toBe(1970);
  //     expect(getDateTimeInfoByType('2099-12-31 23:59:59', 'year')).toBe(2099);
  //   });

  //   it('한 자리 월과 일을 처리해야 한다', () => {
  //     expect(getDateTimeInfoByType('2023-1-5', 'month')).toBe(1);
  //     expect(getDateTimeInfoByType('2023-1-5', 'date')).toBe(5);
  //   });

  //   it('시간이 없는 경우 0으로 처리해야 한다', () => {
  //     const result = getDateTimeInfoByType('2023-03-15', undefined);
  //     expect(typeof result).toBe('object');
  //     expect(result).toHaveProperty('hour', 0);
  //     expect(result).toHaveProperty('min', 0);
  //     expect(result).toHaveProperty('sec', 0);
  //   });

  //   // 오류 케이스
  //   it('잘못된 입력에 대해 null을 반환해야 한다', () => {
  //     expect(getDateTimeInfoByType('', 'year')).toBe(null);
  //     // @ts-ignore - 의도적으로 null과 undefined를 테스트
  //     expect(getDateTimeInfoByType(null, 'year')).toBe(null);
  //     // @ts-ignore - 의도적으로 null과 undefined를 테스트
  //     expect(getDateTimeInfoByType(undefined, 'year')).toBe(null);
  //   });

  //   it('잘못된 날짜 형식을 처리해야 한다', () => {
  //     expect(getDateTimeInfoByType('invalid-date', 'year')).toBe(null);
  //     expect(getDateTimeInfoByType('2023-13-32', 'year')).toBe(2023);
  //     expect(getDateTimeInfoByType('2023-13-32', 'month')).toBe(13);
  //   });

  //   it('존재하지 않는 타입을 처리해야 한다', () => {
  //     // @ts-ignore - 의도적으로 잘못된 타입을 테스트
  //     const result = getDateTimeInfoByType(dateTimeStr, 'invalid');
  //     expect(result).toBeUndefined();
  //   });
  // });

  // describe('getSideMonthCalendarInfo', () => {
  //   // 정상 케이스
  //   it('다음달 정보를 올바르게 계산해야 한다', () => {
  //     expect(getSideMonthCalendarInfo('next', 2023, 3)).toEqual({
  //       year: 2023,
  //       month: 4,
  //     });
  //   });

  //   it('12월의 다음달은 다음해 1월이어야 한다', () => {
  //     expect(getSideMonthCalendarInfo('next', 2023, 12)).toEqual({
  //       year: 2024,
  //       month: 1,
  //     });
  //   });

  //   it('이전달 정보를 올바르게 계산해야 한다', () => {
  //     expect(getSideMonthCalendarInfo('prev', 2023, 3)).toEqual({
  //       year: 2023,
  //       month: 2,
  //     });
  //   });

  //   it('1월의 이전달은 전년 12월이어야 한다', () => {
  //     expect(getSideMonthCalendarInfo('prev', 2023, 1)).toEqual({
  //       year: 2022,
  //       month: 12,
  //     });
  //   });

  //   // 엣지 케이스
  //   it('극단적인 년도를 처리해야 한다', () => {
  //     expect(getSideMonthCalendarInfo('prev', 1970, 1)).toEqual({
  //       year: 1969,
  //       month: 12,
  //     });
  //     expect(getSideMonthCalendarInfo('next', 2099, 12)).toEqual({
  //       year: 2100,
  //       month: 1,
  //     });
  //   });

  //   it('모든 월에 대해 올바르게 계산해야 한다', () => {
  //     for (let month = 1; month <= 12; month++) {
  //       const next = getSideMonthCalendarInfo('next', 2023, month);
  //       const prev = getSideMonthCalendarInfo('prev', 2023, month);
  //       expect(next.month).toBeGreaterThan(0);
  //       expect(next.month).toBeLessThan(13);
  //       expect(prev.month).toBeGreaterThan(0);
  //       expect(prev.month).toBeLessThan(13);
  //     }
  //   });

  //   // 오류 케이스
  //   it('잘못된 방향 입력을 처리해야 한다', () => {
  //     // 'next'가 아닌 경우 'prev'로 처리됨
  //     // @ts-ignore - 의도적으로 잘못된 타입을 테스트
  //     expect(getSideMonthCalendarInfo('invalid', 2023, 6)).toEqual({
  //       year: 2023,
  //       month: 5,
  //     });
  //   });
  // });

  // describe('getTimeInfoByTimeFormat', () => {
  //   const dateTimeValue = '2023-03-15 14:30:45';

  //   // 정상 케이스
  //   it('timeFormat이 없으면 실제 값을 반환해야 한다', () => {
  //     expect(getTimeInfoByTimeFormat(null, dateTimeValue, 'hour')).toBe(14);
  //     expect(getTimeInfoByTimeFormat(undefined, dateTimeValue, 'min')).toBe(30);
  //     expect(getTimeInfoByTimeFormat('', dateTimeValue, 'sec')).toBe(45);
  //   });

  //   it('timeFormat에 HH가 있으면 실제 hour 값을 반환해야 한다', () => {
  //     expect(getTimeInfoByTimeFormat('HH:mm:ss', dateTimeValue, 'hour')).toBe(14);
  //   });

  //   it('timeFormat에 고정값이 있으면 그 값을 반환해야 한다', () => {
  //     expect(getTimeInfoByTimeFormat('09:mm:ss', dateTimeValue, 'hour')).toBe(9);
  //     expect(getTimeInfoByTimeFormat('HH:15:ss', dateTimeValue, 'min')).toBe(15);
  //     expect(getTimeInfoByTimeFormat('HH:mm:00', dateTimeValue, 'sec')).toBe(0);
  //   });

  //   // 엣지 케이스
  //   it('다양한 timeFormat 패턴을 처리해야 한다', () => {
  //     expect(getTimeInfoByTimeFormat('23:59:59', dateTimeValue, 'hour')).toBe(23);
  //     expect(getTimeInfoByTimeFormat('00:00:00', dateTimeValue, 'min')).toBe(0);
  //     expect(getTimeInfoByTimeFormat('HH:mm:30', dateTimeValue, 'sec')).toBe(30);
  //   });

  //   it('0시 0분 0초를 처리해야 한다', () => {
  //     const zeroTime = '2023-03-15 00:00:00';
  //     expect(getTimeInfoByTimeFormat('HH:mm:ss', zeroTime, 'hour')).toBe(0);
  //     expect(getTimeInfoByTimeFormat('HH:mm:ss', zeroTime, 'min')).toBe(0);
  //     expect(getTimeInfoByTimeFormat('HH:mm:ss', zeroTime, 'sec')).toBe(0);
  //   });

  //   // 오류 케이스
  //   it('잘못된 timeFormat을 처리해야 한다', () => {
  //     expect(getTimeInfoByTimeFormat('invalid', dateTimeValue, 'hour')).toBe(null);
  //     expect(getTimeInfoByTimeFormat('12:60:ss', dateTimeValue, 'min')).toBe(60);
  //   });

  //   it('잘못된 timeType을 처리해야 한다', () => {
  //     // @ts-ignore - 의도적으로 잘못된 타입을 테스트
  //     expect(getTimeInfoByTimeFormat('HH:mm:ss', dateTimeValue, 'invalid')).toBe(null);
  //   });
  // });

  // describe('getChangedValueByTimeFormat', () => {
  //   // 정상 케이스
  //   it('timeFormat에 따라 시간을 변경해야 한다', () => {
  //     const modelValue = '2023-03-15 14:30:45';
  //     const result = getChangedValueByTimeFormat('09:15:00', modelValue);
  //     expect(result).toBe('2023-03-15 09:15:00');
  //   });

  //   it('동적 timeFormat도 처리해야 한다', () => {
  //     const modelValue = '2023-03-15 14:30:45';
  //     const result = getChangedValueByTimeFormat('HH:15:ss', modelValue);
  //     expect(result).toBe('2023-03-15 14:15:45');
  //   });

  //   it('완전히 동적인 timeFormat을 처리해야 한다', () => {
  //     const modelValue = '2023-03-15 14:30:45';
  //     const result = getChangedValueByTimeFormat('HH:mm:ss', modelValue);
  //     expect(result).toBe('2023-03-15 14:30:45');
  //   });

  //   // 엣지 케이스
  //   it('빈 modelValue에 대해 빈 문자열을 반환해야 한다', () => {
  //     expect(getChangedValueByTimeFormat('HH:mm:ss', '')).toBe('');
  //     expect(getChangedValueByTimeFormat('HH:mm:ss', null)).toBe('');
  //     expect(getChangedValueByTimeFormat('HH:mm:ss', undefined)).toBe('');
  //   });

  //   it('극단적인 시간 값을 처리해야 한다', () => {
  //     const modelValue = '2023-03-15 00:00:00';
  //     const result = getChangedValueByTimeFormat('23:59:59', modelValue);
  //     expect(result).toBe('2023-03-15 23:59:59');
  //   });

  //   it('날짜만 있는 문자열을 처리해야 한다', () => {
  //     const modelValue = '2023-03-15';
  //     const result = getChangedValueByTimeFormat('12:30:45', modelValue);
  //     expect(result).toBe('2023-03-15 12:30:45');
  //   });

  //   // 오류 케이스
  //   it('잘못된 timeFormat을 처리해야 한다', () => {
  //     const modelValue = '2023-03-15 14:30:45';
  //     const result = getChangedValueByTimeFormat('invalid', modelValue);
  //     expect(result).toBe('2023-03-15 0null:0null:0null');
  //   });
  // });

  // describe('compareFromAndToDateTime', () => {
  //   // 정상 케이스
  //   it('정상적인 날짜 범위면 false를 반환해야 한다', () => {
  //     const modelValue = ['2023-03-10', '2023-03-20'];
  //     expect(compareFromAndToDateTime('dateRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   it('dateTimeRange 모드에서 시간도 고려해야 한다', () => {
  //     const modelValue = ['2023-03-15 10:00:00', '2023-03-15 15:00:00'];
  //     expect(compareFromAndToDateTime('dateTimeRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   it('expanded 달력 타입을 올바르게 처리해야 한다', () => {
  //     const modelValue = ['2023-03-10', '2023-03-20'];
  //     expect(compareFromAndToDateTime('dateRange', 'expanded', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   // 엣지 케이스
  //   it('modelValue가 비어있으면 false를 반환해야 한다', () => {
  //     expect(compareFromAndToDateTime('dateRange', 'main', '2023-03-15', [])).toBe(false);
  //   });

  //   it('동일한 날짜인 경우 false를 반환해야 한다', () => {
  //     const modelValue = ['2023-03-15', '2023-03-15'];
  //     expect(compareFromAndToDateTime('dateRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   it('from과 to가 같은 날짜인 경우를 처리해야 한다', () => {
  //     const modelValue = ['2023-03-15 10:00:00', '2023-03-15 10:00:00'];
  //     expect(compareFromAndToDateTime('dateTimeRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   // 오류 케이스
  //   it('from 날짜가 to 날짜보다 늦으면 true를 반환해야 한다', () => {
  //     const modelValue = ['2023-03-10', '2023-03-20'];
  //     expect(compareFromAndToDateTime('dateRange', 'main', '2023-03-25', modelValue)).toBe(true);
  //   });

  //   it('시간이 없는 targetDate를 처리해야 한다', () => {
  //     const modelValue = ['2023-03-15 10:00:00', '2023-03-15 15:00:00'];
  //     expect(compareFromAndToDateTime('dateTimeRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });

  //   it('잘못된 날짜 형식을 처리해야 한다', () => {
  //     const modelValue = ['invalid-date', '2023-03-20'];
  //     expect(compareFromAndToDateTime('dateRange', 'main', '2023-03-15', modelValue)).toBe(false);
  //   });
  // });

  // describe('getDateMs', () => {
  //   // 정상 케이스
  //   it('날짜 문자열을 밀리초로 변환해야 한다', () => {
  //     const dateStr = '2023-03-15';
  //     const expected = new Date('2023-03-15').getTime();
  //     expect(getDateMs(dateStr)).toBe(expected);
  //   });

  //   it('날짜시간 문자열도 처리해야 한다', () => {
  //     const dateTimeStr = '2023-03-15 14:30:45';
  //     const expected = new Date('2023-03-15 14:30:45').getTime();
  //     expect(getDateMs(dateTimeStr)).toBe(expected);
  //   });

  //   // 엣지 케이스
  //   it('극단적인 날짜를 처리해야 한다', () => {
  //     expect(getDateMs('1970-01-01')).toBe(0);
  //     expect(getDateMs('1970-01-01 00:00:00')).toBe(0);
  //   });

  //   it('미래 날짜를 처리해야 한다', () => {
  //     const futureDate = '2099-12-31';
  //     const expected = new Date(futureDate).getTime();
  //     expect(getDateMs(futureDate)).toBe(expected);
  //   });

  //   it('과거 날짜를 처리해야 한다', () => {
  //     const pastDate = '1900-01-01';
  //     const expected = new Date(pastDate).getTime();
  //     expect(getDateMs(pastDate)).toBe(expected);
  //   });

  //   // 오류 케이스
  //   it('잘못된 날짜 형식을 처리해야 한다', () => {
  //     expect(getDateMs('invalid-date')).toBeNaN();
  //     expect(getDateMs('')).toBeNaN();
  //   });
  // });

  // describe('getYearRange', () => {
  //   // 정상 케이스
  //   it('현재 년도를 포함하는 20년 범위를 반환해야 한다', () => {
  //     const result = getYearRange(2023);
  //     expect(result.start).toBe(2020);
  //     expect(result.end).toBe(2039);
  //     expect(result.end - result.start + 1).toBe(20);
  //   });

  //   it('범위의 시작이 20의 배수로 정렬되어야 한다', () => {
  //     expect(getYearRange(2001).start).toBe(2000);
  //     expect(getYearRange(2019).start).toBe(2000);
  //     expect(getYearRange(2020).start).toBe(2020);
  //     expect(getYearRange(2039).start).toBe(2020);
  //     expect(getYearRange(2040).start).toBe(2040);
  //   });

  //   it('1900년대도 올바르게 처리해야 한다', () => {
  //     const result = getYearRange(1995);
  //     expect(result.start).toBe(1980);
  //     expect(result.end).toBe(1999);
  //   });

  //   // 엣지 케이스
  //   it('경계값 년도를 처리해야 한다', () => {
  //     expect(getYearRange(2000).start).toBe(2000);
  //     expect(getYearRange(1999).start).toBe(1980);
  //     expect(getYearRange(2100).start).toBe(2100);
  //   });

  //   it('극단적인 년도를 처리해야 한다', () => {
  //     const result1 = getYearRange(1000);
  //     expect(result1.start).toBe(1000);
  //     expect(result1.end).toBe(1019);

  //     const result2 = getYearRange(9999);
  //     expect(result2.start).toBe(9980);
  //     expect(result2.end).toBe(9999);
  //   });

  //   it('한 자리 년도를 처리해야 한다', () => {
  //     const result = getYearRange(5);
  //     expect(result.start).toBe(0);
  //     expect(result.end).toBe(19);
  //   });

  //   // 오류 케이스
  //   it('음수 년도를 처리해야 한다', () => {
  //     // 음수의 경우 로직이 복잡해질 수 있음
  //     const result = getYearRange(-100);
  //     expect(result.start).toBeDefined();
  //     expect(result.end).toBeDefined();
  //   });

  //   it('0년도를 처리해야 한다', () => {
  //     const result = getYearRange(0);
  //     expect(result.start).toBe(0);
  //     expect(result.end).toBe(19);
  //   });
  // });
});
