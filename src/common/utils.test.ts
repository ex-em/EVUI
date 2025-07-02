import { describe, test, expect, afterEach } from 'vitest';
import {
  getQuantity,
  getSize,
  truthyNumber,
  truthy,
  convertToPercent,
  millions,
  billions,
  trillion,
  quadrillion,
  numberWithComma,
  getPrecision,
  checkNullAndUndefined,
  mobileCheck,
} from './utils.js';

describe('utils 함수 테스트', () => {
  describe('getQuantity', () => {
    describe('정상 케이스', () => {
      test('숫자 문자열을 파싱해야 한다', () => {
        expect(getQuantity('100')).toEqual({ value: 100, unit: undefined });
        expect(getQuantity('50.5')).toEqual({ value: 50.5, unit: undefined });
        expect(getQuantity('-25')).toEqual({ value: -25, unit: undefined });
      });

      test('픽셀 단위를 파싱해야 한다', () => {
        expect(getQuantity('100px')).toEqual({ value: 100, unit: 'px' });
        expect(getQuantity('0px')).toEqual({ value: 0, unit: 'px' });
        expect(getQuantity('-50px')).toEqual({ value: -50, unit: 'px' });
      });

      test('퍼센트 단위를 파싱해야 한다', () => {
        expect(getQuantity('50%')).toEqual({ value: 50, unit: '%' });
        expect(getQuantity('100%')).toEqual({ value: 100, unit: '%' });
        expect(getQuantity('0%')).toEqual({ value: 0, unit: '%' });
      });

      test('normal 값을 처리해야 한다', () => {
        expect(getQuantity('normal')).toEqual({ value: NaN, unit: undefined });
      });

      test('숫자 타입을 처리해야 한다', () => {
        expect(getQuantity(100)).toEqual({ value: 100, unit: undefined });
        expect(getQuantity(0)).toEqual({ value: 0, unit: undefined });
        expect(getQuantity(-50)).toEqual({ value: -50, unit: undefined });
        expect(getQuantity(50.5)).toEqual({ value: 50.5, unit: undefined });
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('잘못된 형식의 문자열은 null을 반환해야 한다', () => {
        expect(getQuantity('abc')).toBeNull();
        expect(getQuantity('100em')).toBeNull();
        expect(getQuantity('px100')).toBeNull();
        expect(getQuantity('100 px')).toBeNull();
      });

      test('null, undefined는 null을 반환해야 한다', () => {
        expect(getQuantity(null)).toBeNull();
        expect(getQuantity(undefined)).toBeNull();
      });

      test('빈 문자열은 null을 반환해야 한다', () => {
        expect(getQuantity('')).toBeNull();
      });

      test('객체나 배열은 null을 반환해야 한다', () => {
        expect(getQuantity({})).toBeNull();
        expect(getQuantity([])).toBeNull();
        expect(getQuantity(true)).toBeNull();
      });

      test('특수 숫자 값들을 처리해야 한다', () => {
        expect(getQuantity(NaN)).toEqual({ value: NaN, unit: undefined });
        expect(getQuantity(Infinity)).toEqual({ value: Infinity, unit: undefined });
        expect(getQuantity(-Infinity)).toEqual({ value: -Infinity, unit: undefined });
      });
    });
  });

  describe('getSize', () => {
    describe('정상 케이스', () => {
      test('unit이 있는 size 객체를 처리해야 한다', () => {
        expect(getSize({ value: 100, unit: 'px' })).toBe('100px');
        expect(getSize({ value: 50, unit: '%' })).toBe('50%');
        expect(getSize({ value: 0, unit: 'px' })).toBe('0px');
      });

      test('unit이 없는 size 객체는 px을 기본으로 해야 한다', () => {
        expect(getSize({ value: 100 })).toBe('100px');
        expect(getSize({ value: 0 })).toBe('0px');
        expect(getSize({ value: -50 })).toBe('-50px');
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('falsy 값은 100%를 반환해야 한다', () => {
        expect(getSize(null)).toBe('100%');
        expect(getSize(undefined)).toBe('100%');
        expect(getSize(false)).toBe('100%');
        expect(getSize(0)).toBe('100%');
        expect(getSize('')).toBe('100%');
      });

      test('빈 객체는 100%를 반환해야 한다', () => {
        expect(getSize({})).toBe('100%');
      });
    });
  });

  describe('truthyNumber', () => {
    describe('정상 케이스', () => {
      test('유효한 숫자는 true를 반환해야 한다', () => {
        expect(truthyNumber(0)).toBe(true);
        expect(truthyNumber(1)).toBe(true);
        expect(truthyNumber(-1)).toBe(true);
        expect(truthyNumber(3.14)).toBe(true);
        expect(truthyNumber(Infinity)).toBe(true);
        expect(truthyNumber(-Infinity)).toBe(true);
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('NaN은 false를 반환해야 한다', () => {
        expect(truthyNumber(NaN)).toBe(false);
      });

      test('숫자가 아닌 값은 false를 반환해야 한다', () => {
        expect(truthyNumber('1')).toBe(false);
        expect(truthyNumber(null)).toBe(false);
        expect(truthyNumber(undefined)).toBe(false);
        expect(truthyNumber(true)).toBe(false);
        expect(truthyNumber([])).toBe(false);
        expect(truthyNumber({})).toBe(false);
      });
    });
  });

  describe('truthy', () => {
    describe('정상 케이스', () => {
      test('모든 인자가 유효한 숫자면 true를 반환해야 한다', () => {
        expect(truthy(1)).toBe(true);
        expect(truthy(1, 2, 3)).toBe(true);
        expect(truthy(0, -1, 3.14)).toBe(true);
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('인자가 없으면 true를 반환해야 한다', () => {
        expect(truthy()).toBe(true);
      });

      test('하나라도 유효하지 않은 숫자가 있으면 false를 반환해야 한다', () => {
        expect(truthy(1, NaN, 3)).toBe(false);
        expect(truthy(1, '2', 3)).toBe(false);
        expect(truthy(null, 1, 2)).toBe(false);
        expect(truthy(1, undefined, 3)).toBe(false);
      });
    });
  });

  describe('convertToPercent', () => {
    describe('정상 케이스', () => {
      test('정상적인 백분율 변환을 해야 한다', () => {
        expect(convertToPercent(50, 100)).toBe('50.00');
        expect(convertToPercent(25, 100)).toBe('25.00');
        expect(convertToPercent(75, 150)).toBe('50.00');
        expect(convertToPercent(1, 3)).toBe('33.33');
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('0으로 나누거나 0 값은 0을 반환해야 한다', () => {
        expect(convertToPercent(50, 0)).toBe(0);
        expect(convertToPercent(0, 100)).toBe(0);
        expect(convertToPercent(0, 0)).toBe(0);
      });

      test('유효하지 않은 숫자는 0을 반환해야 한다', () => {
        expect(convertToPercent(NaN, 100)).toBe(0);
        expect(convertToPercent(50, NaN)).toBe(0);
        expect(convertToPercent('50', 100)).toBe(0);
        expect(convertToPercent(50, '100')).toBe(0);
        expect(convertToPercent(null, 100)).toBe(0);
        expect(convertToPercent(50, undefined)).toBe(0);
      });

      test('결과가 유효하지 않으면 0을 반환해야 한다', () => {
        expect(convertToPercent(Infinity, 100)).toBe(0);
        expect(convertToPercent(100, Infinity)).toBe(0);
      });
    });
  });

  describe('대용량 숫자 변환 함수들', () => {
    describe('millions', () => {
      test('정상적인 백만 단위 변환을 해야 한다', () => {
        expect(millions(1)).toBe(1000000);
        expect(millions(2.5)).toBe(2500000);
        expect(millions(0)).toBe(0);
        expect(millions(-1)).toBe(-1000000);
      });

      test('유효하지 않은 값은 0을 반환해야 한다', () => {
        expect(millions(NaN)).toBe(0);
        expect(millions('1')).toBe(0);
        expect(millions(null)).toBe(0);
        expect(millions(undefined)).toBe(0);
      });
    });

    describe('billions', () => {
      test('정상적인 십억 단위 변환을 해야 한다', () => {
        expect(billions(1)).toBe(1000000000);
        expect(billions(2.5)).toBe(2500000000);
        expect(billions(0)).toBe(0);
        expect(billions(-1)).toBe(-1000000000);
      });

      test('유효하지 않은 값은 0을 반환해야 한다', () => {
        expect(billions(NaN)).toBe(0);
        expect(billions('1')).toBe(0);
        expect(billions(null)).toBe(0);
      });
    });

    describe('trillion', () => {
      test('정상적인 조 단위 변환을 해야 한다', () => {
        expect(trillion(1)).toBe(1000000000000);
        expect(trillion(2.5)).toBe(2500000000000);
        expect(trillion(0)).toBe(0);
      });

      test('유효하지 않은 값은 0을 반환해야 한다', () => {
        expect(trillion(NaN)).toBe(0);
        expect(trillion('1')).toBe(0);
      });
    });

    describe('quadrillion', () => {
      test('정상적인 천조 단위 변환을 해야 한다', () => {
        expect(quadrillion(1)).toBe(1000000000000000);
        expect(quadrillion(2.5)).toBe(2500000000000000);
        expect(quadrillion(0)).toBe(0);
      });

      test('유효하지 않은 값은 0을 반환해야 한다', () => {
        expect(quadrillion(NaN)).toBe(0);
        expect(quadrillion('1')).toBe(0);
      });
    });
  });

  describe('numberWithComma', () => {
    describe('정상 케이스', () => {
      test('정수에 콤마를 추가해야 한다', () => {
        expect(numberWithComma(1000)).toBe('1,000');
        expect(numberWithComma(1234567)).toBe('1,234,567');
        expect(numberWithComma(0)).toBe('0');
        expect(numberWithComma(-1000)).toBe('-1,000');
      });

      test('소수에 콤마를 추가해야 한다', () => {
        expect(numberWithComma(1000.5)).toBe('1,000.5');
        expect(numberWithComma(1234567.89)).toBe('1,234,567.89');
        expect(numberWithComma(1000.123456)).toBe('1,000.123456');
      });

      test('작은 숫자는 콤마 없이 반환해야 한다', () => {
        expect(numberWithComma(999)).toBe('999');
        expect(numberWithComma(99.99)).toBe('99.99');
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('유효하지 않은 숫자는 false를 반환해야 한다', () => {
        expect(numberWithComma(NaN)).toBe(false);
        expect(numberWithComma('1000')).toBe(false);
        expect(numberWithComma(null)).toBe(false);
        expect(numberWithComma(undefined)).toBe(false);
        expect(numberWithComma([])).toBe(false);
        expect(numberWithComma({})).toBe(false);
      });

      test('특수 숫자 값들을 처리해야 한다', () => {
        expect(numberWithComma(Infinity)).toBe('Infinity');
        expect(numberWithComma(-Infinity)).toBe('-Infinity');
      });
    });
  });

  describe('getPrecision', () => {
    describe('정상 케이스', () => {
      test('소수점 자릿수를 정확히 계산해야 한다', () => {
        expect(getPrecision(1.2)).toBe(1);
        expect(getPrecision(1.23)).toBe(2);
        expect(getPrecision(1.234567)).toBe(6);
        expect(getPrecision(-1.23)).toBe(2);
      });

      test('정수는 0을 반환해야 한다', () => {
        expect(getPrecision(1)).toBe(0);
        expect(getPrecision(100)).toBe(0);
        expect(getPrecision(-50)).toBe(0);
        expect(getPrecision(0)).toBe(0);
      });

      test('문자열 숫자도 처리해야 한다', () => {
        expect(getPrecision('1.23')).toBe(2);
        expect(getPrecision('100')).toBe(0);
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('null, undefined는 0을 반환해야 한다', () => {
        expect(getPrecision(null)).toBe(0);
        expect(getPrecision(undefined)).toBe(0);
      });

      test('특수 값들을 처리해야 한다', () => {
        expect(getPrecision(NaN)).toBe(0);
        expect(getPrecision(Infinity)).toBe(0);
        expect(getPrecision(-Infinity)).toBe(0);
      });

      test('소수점이 없는 문자열은 0을 반환해야 한다', () => {
        expect(getPrecision('abc')).toBe(0);
        expect(getPrecision('')).toBe(0);
      });
    });
  });

  describe('checkNullAndUndefined', () => {
    describe('정상 케이스', () => {
      test('null은 true를 반환해야 한다', () => {
        expect(checkNullAndUndefined(null)).toBe(true);
      });

      test('undefined는 true를 반환해야 한다', () => {
        expect(checkNullAndUndefined(undefined)).toBe(true);
      });
    });

    describe('에러 케이스 및 엣지 케이스', () => {
      test('다른 falsy 값들은 false를 반환해야 한다', () => {
        expect(checkNullAndUndefined(0)).toBe(false);
        expect(checkNullAndUndefined('')).toBe(false);
        expect(checkNullAndUndefined(false)).toBe(false);
        expect(checkNullAndUndefined(NaN)).toBe(false);
      });

      test('truthy 값들은 false를 반환해야 한다', () => {
        expect(checkNullAndUndefined(1)).toBe(false);
        expect(checkNullAndUndefined('test')).toBe(false);
        expect(checkNullAndUndefined([])).toBe(false);
        expect(checkNullAndUndefined({})).toBe(false);
        expect(checkNullAndUndefined(true)).toBe(false);
      });
    });
  });

  describe('mobileCheck', () => {
    const originalUserAgent = navigator.userAgent;
    const originalOntouchstart = window.ontouchstart;

    afterEach(() => {
      // userAgent를 원래대로 복원
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true,
      });
      
      // ontouchstart를 원래대로 복원
      if (originalOntouchstart !== undefined) {
        window.ontouchstart = originalOntouchstart;
      } else {
        delete window.ontouchstart;
      }
    });

    describe('정상 케이스', () => {
      test('모바일 userAgent를 감지해야 한다', () => {
        const mobileUserAgents = [
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
          'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
          'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X)',
          'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+',
          'Opera Mini/7.6.35766/35.5936',
        ];

        mobileUserAgents.forEach(ua => {
          Object.defineProperty(navigator, 'userAgent', {
            value: ua,
            writable: true,
          });
          expect(mobileCheck()).toBe(true);
        });
      });

      test('ontouchstart 속성이 있으면 모바일로 감지해야 한다', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/91.0.4472.124',
          writable: true,
        });
        
        window.ontouchstart = null;
        expect(mobileCheck()).toBe(true);
      });
    });

    // describe('데스크톱 케이스', () => {
    //   test('데스크톱 userAgent는 false를 반환해야 한다', () => {
    //     const desktopUserAgents = [
    //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
    //       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91.0.4472.124',
    //       'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/91.0.4472.124',
    //     ];

    //     desktopUserAgents.forEach(ua => {
    //       Object.defineProperty(navigator, 'userAgent', {
    //         value: ua,
    //         writable: true,
    //       });
          
    //       delete window.ontouchstart;
    //       expect(mobileCheck()).toBe(false);
    //     });
    //   });
    // });
  });
});
