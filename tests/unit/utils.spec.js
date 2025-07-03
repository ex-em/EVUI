import {
  getQuantity,
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
} from '../../src/common/utils';

describe('getQuantity 함수', () => {
  describe('문자열 파싱', () => {
    describe('기본 숫자 문자열', () => {
      test('양수 문자열을 처리해야 함', () => {
        const result = getQuantity('10');
        expect(result).toEqual({ value: 10, unit: undefined });
      });

      test('음수 문자열을 처리해야 함', () => {
        const result = getQuantity('-5');
        expect(result).toEqual({ value: -5, unit: undefined });
      });

      test('소수점이 있는 양수 문자열을 처리해야 함', () => {
        const result = getQuantity('3.14');
        expect(result).toEqual({ value: 3.14, unit: undefined });
      });

      test('소수점이 있는 음수 문자열을 처리해야 함', () => {
        const result = getQuantity('-2.5');
        expect(result).toEqual({ value: -2.5, unit: undefined });
      });

      test('0 값을 처리해야 함', () => {
        const result = getQuantity('0');
        expect(result).toEqual({ value: 0, unit: undefined });
      });
    });

    describe('단위가 포함된 문자열', () => {
      test('px 단위가 있는 양수를 처리해야 함', () => {
        const result = getQuantity('100px');
        expect(result).toEqual({ value: 100, unit: 'px' });
      });

      test('px 단위가 있는 음수를 처리해야 함', () => {
        const result = getQuantity('-20px');
        expect(result).toEqual({ value: -20, unit: 'px' });
      });

      test('% 단위가 있는 양수를 처리해야 함', () => {
        const result = getQuantity('50%');
        expect(result).toEqual({ value: 50, unit: '%' });
      });

      test('% 단위가 있는 소수를 처리해야 함', () => {
        const result = getQuantity('75.5%');
        expect(result).toEqual({ value: 75.5, unit: '%' });
      });

      test('0과 단위가 있는 문자열을 처리해야 함', () => {
        const result = getQuantity('0px');
        expect(result).toEqual({ value: 0, unit: 'px' });
      });
    });
  });

  describe('숫자 타입 입력', () => {
    test('양수 숫자를 처리해야 함', () => {
      const result = getQuantity(1);
      expect(result).toEqual({ value: 1, unit: undefined });
    });

    test('음수 숫자를 처리해야 함', () => {
      const result = getQuantity(-5);
      expect(result).toEqual({ value: -5, unit: undefined });
    });

    test('소수 숫자를 처리해야 함', () => {
      const result = getQuantity(3.14);
      expect(result).toEqual({ value: 3.14, unit: undefined });
    });

    test('0 숫자를 처리해야 함', () => {
      const result = getQuantity(0);
      expect(result).toEqual({ value: 0, unit: undefined });
    });
  });

  describe('특별 케이스', () => {
    test('"normal" 문자열은 null을 반환해야 함', () => {
      const result = getQuantity('normal');
      expect(result).toBeNull();
    });

    test('이중 음수 부호는 양수로 변환하고 unit을 null로 설정해야 함', () => {
      const result = getQuantity('--10');
      expect(result).toEqual({ value: 10, unit: null });
    });

    test('삼중 음수 부호는 양수로 변환하고 unit을 null로 설정해야 함', () => {
      const result = getQuantity('---5');
      expect(result).toEqual({ value: 5, unit: null });
    });

    test('사중 음수 부호는 양수로 변환하고 unit을 null로 설정해야 함', () => {
      const result = getQuantity('----10');
      expect(result).toEqual({ value: 10, unit: null });
    });

    test('다중 음수 부호와 소수는 양수로 변환하고 unit을 null로 설정해야 함', () => {
      const result = getQuantity('--5.5');
      expect(result).toEqual({ value: 5.5, unit: null });
    });

    test('Infinity 숫자를 처리해야 함', () => {
      const result = getQuantity(Infinity);
      expect(result).toEqual({ value: Infinity, unit: undefined });
    });

    test('-Infinity 숫자를 처리해야 함', () => {
      const result = getQuantity(-Infinity);
      expect(result).toEqual({ value: -Infinity, unit: undefined });
    });

    test('Infinity 문자열을 처리해야 함', () => {
      const result = getQuantity('Infinity');
      expect(result).toEqual({ value: Infinity, unit: undefined });
    });

    test('-Infinity 문자열을 처리해야 함', () => {
      const result = getQuantity('-Infinity');
      expect(result).toEqual({ value: -Infinity, unit: undefined });
    });
  });

  describe('에러 케이스 - null/undefined 타입', () => {
    test('null 입력시 null을 반환해야 함', () => {
      expect(getQuantity(null)).toBeNull();
    });

    test('undefined 입력시 null을 반환해야 함', () => {
      expect(getQuantity(undefined)).toBeNull();
    });
  });

  describe('에러 케이스 - 기본 타입', () => {
    test('true 입력시 null을 반환해야 함', () => {
      expect(getQuantity(true)).toBeNull();
    });

    test('false 입력시 null을 반환해야 함', () => {
      expect(getQuantity(false)).toBeNull();
    });

    test('빈 객체 입력시 null을 반환해야 함', () => {
      expect(getQuantity({})).toBeNull();
    });

    test('값이 있는 객체 입력시 null을 반환해야 함', () => {
      expect(getQuantity({ value: 10 })).toBeNull();
    });

    test('빈 배열 입력시 null을 반환해야 함', () => {
      expect(getQuantity([])).toBeNull();
    });

    test('값이 있는 배열 입력시 null을 반환해야 함', () => {
      expect(getQuantity([1, 2, 3])).toBeNull();
    });

    test('함수 입력시 null을 반환해야 함', () => {
      expect(getQuantity(() => {})).toBeNull();
    });

    test('Symbol 입력시 null을 반환해야 함', () => {
      expect(getQuantity(Symbol('test'))).toBeNull();
    });
  });

  describe('에러 케이스 - 잘못된 문자열', () => {
    test('빈 문자열 입력시 null을 반환해야 함', () => {
      expect(getQuantity('')).toBeNull();
    });

    test('알파벳 문자열 입력시 null을 반환해야 함', () => {
      expect(getQuantity('abc')).toBeNull();
    });

    test('지원하지 않는 단위 입력시 null을 반환해야 함', () => {
      expect(getQuantity('10em')).toBeNull();
    });

    test('단위가 앞에 오는 경우 null을 반환해야 함', () => {
      expect(getQuantity('px10')).toBeNull();
    });

    test('공백이 있는 경우 null을 반환해야 함', () => {
      expect(getQuantity('10 px')).toBeNull();
    });

    test('잘못된 소수점 형식 입력시 null을 반환해야 함', () => {
      expect(getQuantity('10.5.5')).toBeNull();
    });

    test('양수 부호만 입력시 null을 반환해야 함', () => {
      expect(getQuantity('+')).toBeNull();
    });

    test('음수 부호만 입력시 null을 반환해야 함', () => {
      expect(getQuantity('-')).toBeNull();
    });

    test('소수점만 입력시 null을 반환해야 함', () => {
      expect(getQuantity('.')).toBeNull();
    });

    test('normal과 숫자가 혼합된 경우 null을 반환해야 함', () => {
      expect(getQuantity('normal10')).toBeNull();
    });

    test('숫자와 normal이 혼합된 경우 null을 반환해야 함', () => {
      expect(getQuantity('10normal')).toBeNull();
    });
  });

  describe('에러 케이스 - NaN 및 공백', () => {
    test('NaN 문자열 입력시 null을 반환해야 함', () => {
      expect(getQuantity('NaN')).toBeNull();
    });

    test('NaN 숫자 입력시 null을 반환해야 함', () => {
      expect(getQuantity(NaN)).toBeNull();
    });

    test('공백 문자열 입력시 null을 반환해야 함', () => {
      expect(getQuantity(' ')).toBeNull();
    });

    test('여러 공백 문자열 입력시 null을 반환해야 함', () => {
      expect(getQuantity('  ')).toBeNull();
    });

    test('탭 문자 입력시 null을 반환해야 함', () => {
      expect(getQuantity('\t')).toBeNull();
    });

    test('개행 문자 입력시 null을 반환해야 함', () => {
      expect(getQuantity('\n')).toBeNull();
    });
  });

  describe('경계값 테스트', () => {
    test('매우 큰 숫자를 처리해야 함', () => {
      const result = getQuantity('999999999999');
      expect(result).toEqual({ value: 999999999999, unit: undefined });
    });

    test('매우 작은 소수를 처리해야 함', () => {
      const result = getQuantity('0.00001');
      expect(result).toEqual({ value: 0.00001, unit: undefined });
    });

    test('매우 긴 소수점을 처리해야 함', () => {
      const result = getQuantity('1.123456789');
      expect(result).toEqual({ value: 1.123456789, unit: undefined });
    });
  });
});

describe('truthyNumber 함수', () => {
  describe('정상 케이스', () => {
    test('양수는 true를 반환해야 함', () => {
      expect(truthyNumber(10)).toBe(true);
    });

    test('음수는 true를 반환해야 함', () => {
      expect(truthyNumber(-5)).toBe(true);
    });

    test('0은 true를 반환해야 함', () => {
      expect(truthyNumber(0)).toBe(true);
    });

    test('소수는 true를 반환해야 함', () => {
      expect(truthyNumber(3.14)).toBe(true);
    });

    test('Infinity는 true를 반환해야 함', () => {
      expect(truthyNumber(Infinity)).toBe(true);
    });

    test('-Infinity는 true를 반환해야 함', () => {
      expect(truthyNumber(-Infinity)).toBe(true);
    });
  });

  describe('에러 케이스', () => {
    test('NaN은 false를 반환해야 함', () => {
      expect(truthyNumber(NaN)).toBe(false);
    });

    test('문자열 숫자는 false를 반환해야 함', () => {
      expect(truthyNumber('10')).toBe(false);
    });

    test('문자열은 false를 반환해야 함', () => {
      expect(truthyNumber('abc')).toBe(false);
    });

    test('null은 false를 반환해야 함', () => {
      expect(truthyNumber(null)).toBe(false);
    });

    test('undefined는 false를 반환해야 함', () => {
      expect(truthyNumber(undefined)).toBe(false);
    });

    test('boolean은 false를 반환해야 함', () => {
      expect(truthyNumber(true)).toBe(false);
      expect(truthyNumber(false)).toBe(false);
    });

    test('객체는 false를 반환해야 함', () => {
      expect(truthyNumber({})).toBe(false);
    });

    test('배열은 false를 반환해야 함', () => {
      expect(truthyNumber([])).toBe(false);
    });
  });
});

describe('truthy 함수', () => {
  describe('정상 케이스', () => {
    test('모든 인자가 유효한 숫자이면 true를 반환해야 함', () => {
      expect(truthy(1, 2, 3)).toBe(true);
    });

    test('단일 인자가 유효한 숫자이면 true를 반환해야 함', () => {
      expect(truthy(10)).toBe(true);
    });

    test('0을 포함한 숫자들이면 true를 반환해야 함', () => {
      expect(truthy(0, 1, 2)).toBe(true);
    });

    test('음수와 양수가 혼합되어도 true를 반환해야 함', () => {
      expect(truthy(-1, 2, -3)).toBe(true);
    });

    test('소수가 포함되어도 true를 반환해야 함', () => {
      expect(truthy(1.5, 2.7, 3.14)).toBe(true);
    });

    test('인자가 없으면 true를 반환해야 함', () => {
      expect(truthy()).toBe(true);
    });
  });

  describe('에러 케이스', () => {
    test('하나라도 NaN이면 false를 반환해야 함', () => {
      expect(truthy(1, NaN, 3)).toBe(false);
    });

    test('하나라도 문자열이면 false를 반환해야 함', () => {
      expect(truthy(1, '2', 3)).toBe(false);
    });

    test('하나라도 null이면 false를 반환해야 함', () => {
      expect(truthy(1, null, 3)).toBe(false);
    });

    test('하나라도 undefined이면 false를 반환해야 함', () => {
      expect(truthy(1, undefined, 3)).toBe(false);
    });

    test('모든 값이 잘못된 타입이면 false를 반환해야 함', () => {
      expect(truthy('a', 'b', 'c')).toBe(false);
    });
  });
});

describe('convertToPercent 함수', () => {
  describe('정상 케이스', () => {
    test('일반적인 백분율 계산을 해야 함', () => {
      expect(convertToPercent(25, 100)).toBe('25.00');
    });

    test('소수점이 있는 백분율 계산을 해야 함', () => {
      expect(convertToPercent(33, 100)).toBe('33.00');
    });

    test('1보다 작은 값의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(1, 100)).toBe('1.00');
    });

    test('100%보다 큰 값의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(150, 100)).toBe('150.00');
    });

    test('소수점 값의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(12.5, 50)).toBe('25.00');
    });
  });

  describe('에러 케이스', () => {
    test('value가 0이면 0을 반환해야 함', () => {
      expect(convertToPercent(0, 100)).toBe(0);
    });

    test('totalValue가 0이면 0을 반환해야 함', () => {
      expect(convertToPercent(25, 0)).toBe(0);
    });

    test('value가 NaN이면 0을 반환해야 함', () => {
      expect(convertToPercent(NaN, 100)).toBe(0);
    });

    test('totalValue가 NaN이면 0을 반환해야 함', () => {
      expect(convertToPercent(25, NaN)).toBe(0);
    });

    test('value가 문자열이면 0을 반환해야 함', () => {
      expect(convertToPercent('25', 100)).toBe(0);
    });

    test('totalValue가 문자열이면 0을 반환해야 함', () => {
      expect(convertToPercent(25, '100')).toBe(0);
    });

    test('둘 다 잘못된 값이면 0을 반환해야 함', () => {
      expect(convertToPercent(null, undefined)).toBe(0);
    });
  });

  describe('엣지 케이스', () => {
    test('매우 작은 값의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(0.01, 100)).toBe('0.01');
    });

    test('음수 값의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(-25, 100)).toBe('-25.00');
    });

    test('음수 totalValue의 백분율 계산을 해야 함', () => {
      expect(convertToPercent(25, -100)).toBe('-25.00');
    });
  });
});

describe('millions 함수', () => {
  describe('정상 케이스', () => {
    test('양수를 백만 단위로 변환해야 함', () => {
      expect(millions(5)).toBe(5000000);
    });

    test('소수를 백만 단위로 변환해야 함', () => {
      expect(millions(1.5)).toBe(1500000);
    });

    test('0을 백만 단위로 변환해야 함', () => {
      expect(millions(0)).toBe(0);
    });

    test('음수를 백만 단위로 변환해야 함', () => {
      expect(millions(-2)).toBe(-2000000);
    });
  });

  describe('에러 케이스', () => {
    test('NaN이면 0을 반환해야 함', () => {
      expect(millions(NaN)).toBe(0);
    });

    test('문자열이면 0을 반환해야 함', () => {
      expect(millions('5')).toBe(0);
    });

    test('null이면 0을 반환해야 함', () => {
      expect(millions(null)).toBe(0);
    });

    test('undefined이면 0을 반환해야 함', () => {
      expect(millions(undefined)).toBe(0);
    });
  });

  describe('엣지 케이스', () => {
    test('매우 작은 소수를 변환해야 함', () => {
      expect(millions(0.000001)).toBe(1);
    });

    test('Infinity를 변환해야 함', () => {
      expect(millions(Infinity)).toBe(Infinity);
    });

    test('-Infinity를 변환해야 함', () => {
      expect(millions(-Infinity)).toBe(-Infinity);
    });
  });
});

describe('billions 함수', () => {
  describe('정상 케이스', () => {
    test('양수를 십억 단위로 변환해야 함', () => {
      expect(billions(5)).toBe(5000000000);
    });

    test('소수를 십억 단위로 변환해야 함', () => {
      expect(billions(1.5)).toBe(1500000000);
    });

    test('0을 십억 단위로 변환해야 함', () => {
      expect(billions(0)).toBe(0);
    });
  });

  describe('에러 케이스', () => {
    test('NaN이면 0을 반환해야 함', () => {
      expect(billions(NaN)).toBe(0);
    });

    test('문자열이면 0을 반환해야 함', () => {
      expect(billions('5')).toBe(0);
    });
  });
});

describe('trillion 함수', () => {
  describe('정상 케이스', () => {
    test('양수를 조 단위로 변환해야 함', () => {
      expect(trillion(5)).toBe(5000000000000);
    });

    test('소수를 조 단위로 변환해야 함', () => {
      expect(trillion(1.5)).toBe(1500000000000);
    });
  });

  describe('에러 케이스', () => {
    test('NaN이면 0을 반환해야 함', () => {
      expect(trillion(NaN)).toBe(0);
    });
  });
});

describe('quadrillion 함수', () => {
  describe('정상 케이스', () => {
    test('양수를 천조 단위로 변환해야 함', () => {
      expect(quadrillion(5)).toBe(5000000000000000);
    });

    test('소수를 천조 단위로 변환해야 함', () => {
      expect(quadrillion(1.5)).toBe(1500000000000000);
    });
  });

  describe('에러 케이스', () => {
    test('NaN이면 0을 반환해야 함', () => {
      expect(quadrillion(NaN)).toBe(0);
    });
  });
});

describe('numberWithComma 함수', () => {
  describe('정상 케이스', () => {
    test('정수에 콤마를 추가해야 함', () => {
      expect(numberWithComma(1234567)).toBe('1,234,567');
    });

    test('소수에 콤마를 추가해야 함', () => {
      expect(numberWithComma(1234.56)).toBe('1,234.56');
    });

    test('천 미만의 수는 콤마 없이 반환해야 함', () => {
      expect(numberWithComma(999)).toBe('999');
    });

    test('음수에 콤마를 추가해야 함', () => {
      expect(numberWithComma(-1234567)).toBe('-1,234,567');
    });

    test('0을 처리해야 함', () => {
      expect(numberWithComma(0)).toBe('0');
    });

    test('긴 소수점 숫자를 처리해야 함', () => {
      expect(numberWithComma(1234567.123456)).toBe('1,234,567.123456');
    });
  });

  describe('에러 케이스', () => {
    test('NaN이면 false를 반환해야 함', () => {
      expect(numberWithComma(NaN)).toBe(false);
    });

    test('문자열이면 false를 반환해야 함', () => {
      expect(numberWithComma('1234')).toBe(false);
    });

    test('null이면 false를 반환해야 함', () => {
      expect(numberWithComma(null)).toBe(false);
    });

    test('undefined이면 false를 반환해야 함', () => {
      expect(numberWithComma(undefined)).toBe(false);
    });

    test('객체이면 false를 반환해야 함', () => {
      expect(numberWithComma({})).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    test('매우 큰 수를 처리해야 함', () => {
      expect(numberWithComma(123456789012345)).toBe('123,456,789,012,345');
    });

    test('매우 작은 소수를 처리해야 함', () => {
      expect(numberWithComma(0.123456)).toBe('0.123456');
    });

    test('Infinity를 처리해야 함', () => {
      expect(numberWithComma(Infinity)).toBe('Infinity');
    });

    test('-Infinity를 처리해야 함', () => {
      expect(numberWithComma(-Infinity)).toBe('-Infinity');
    });
  });
});

describe('getPrecision 함수', () => {
  describe('정상 케이스', () => {
    test('소수점이 있는 숫자의 자릿수를 반환해야 함', () => {
      expect(getPrecision(3.14159)).toBe(5);
    });

    test('정수는 0을 반환해야 함', () => {
      expect(getPrecision(10)).toBe(0);
    });

    test('한 자리 소수는 1을 반환해야 함', () => {
      expect(getPrecision(10.5)).toBe(1);
    });

    test('0.0의 경우 1을 반환해야 함', () => {
      expect(getPrecision(0.0)).toBe(0);
    });

    test('음수 소수의 자릿수를 반환해야 함', () => {
      expect(getPrecision(-3.14)).toBe(2);
    });
  });

  describe('에러 케이스', () => {
    test('null은 0을 반환해야 함', () => {
      expect(getPrecision(null)).toBe(0);
    });

    test('undefined는 0을 반환해야 함', () => {
      expect(getPrecision(undefined)).toBe(0);
    });

    test('문자열 숫자의 소수점 자릿수를 반환해야 함', () => {
      expect(getPrecision('3.14')).toBe(2);
    });

    test('NaN은 3을 반환해야 함 (NaN.toString() = "NaN"이므로)', () => {
      expect(getPrecision(NaN)).toBe(0);
    });
  });

  describe('엣지 케이스', () => {
    test('매우 긴 소수점의 자릿수를 반환해야 함', () => {
      expect(getPrecision(1.123456789012345)).toBe(15);
    });

    test('Infinity는 0을 반환해야 함', () => {
      expect(getPrecision(Infinity)).toBe(0);
    });

    test('매우 작은 소수의 자릿수를 반환해야 함', () => {
      expect(getPrecision(0.00000001)).toBe(8);
    });
  });
});

describe('checkNullAndUndefined 함수', () => {
  describe('정상 케이스 - true 반환', () => {
    test('null이면 true를 반환해야 함', () => {
      expect(checkNullAndUndefined(null)).toBe(true);
    });

    test('undefined이면 true를 반환해야 함', () => {
      expect(checkNullAndUndefined(undefined)).toBe(true);
    });
  });

  describe('정상 케이스 - false 반환', () => {
    test('0이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined(0)).toBe(false);
    });

    test('빈 문자열이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined('')).toBe(false);
    });

    test('false이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined(false)).toBe(false);
    });

    test('NaN이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined(NaN)).toBe(false);
    });

    test('빈 객체이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined({})).toBe(false);
    });

    test('빈 배열이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined([])).toBe(false);
    });

    test('일반 숫자이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined(123)).toBe(false);
    });

    test('일반 문자열이면 false를 반환해야 함', () => {
      expect(checkNullAndUndefined('hello')).toBe(false);
    });
  });
});

describe('mobileCheck 함수', () => {
  // 원래 navigator 객체 백업
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    // 각 테스트 전에 초기화
    delete global.navigator;
    delete global.window;
  });

  afterAll(() => {
    // 테스트 완료 후 원래 객체 복원
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  describe('모바일 기기 감지 - UserAgent 기반', () => {
    test('Android 기기를 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('iPhone을 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('iPad를 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('iPod을 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('BlackBerry를 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('webOS를 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.0',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('Opera Mini를 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Opera/9.60 (J2ME/MIDP; Opera Mini/4.2.14912/812; U; ru) Presto/2.2.0',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });

    test('IEMobile을 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; IEMobile 8.12; MSIEMobile6.0)',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });
  });

    describe('터치 지원 기반 감지', () => {
    test('ontouchstart가 있으면 모바일로 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };
      global.window = {
        ontouchstart: true,
      };
      expect(mobileCheck()).toBe(true);
    });

    test('ontouchstart가 null이어도 모바일로 감지해야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };
      global.window = {
        ontouchstart: null,
      };
      expect(mobileCheck()).toBe(true);
    });
  });

  describe('데스크톱 기기', () => {
    test('일반적인 Chrome 데스크톱을 감지하지 않아야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      };
      global.window = {};
      expect(mobileCheck()).toBe(false);
    });

    test('Firefox 데스크톱을 감지하지 않아야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      };
      global.window = {};
      expect(mobileCheck()).toBe(false);
    });

    test('Safari Mac을 감지하지 않아야 함', () => {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      };
      global.window = {};
      expect(mobileCheck()).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    test('navigator가 없으면 오류를 발생시켜야 함', () => {
      global.window = {};
      expect(() => mobileCheck()).toThrow();
    });

    test('대소문자 구분 없이 모바일을 감지해야 함', () => {
      global.navigator = {
        userAgent: 'mozilla/5.0 (android 10; mobile; rv:89.0) gecko/20100101 firefox/89.0',
      };
      global.window = {};
      expect(mobileCheck()).toBe(true);
    });
  });
});
