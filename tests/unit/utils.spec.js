import { getQuantity } from '../../src/common/utils';

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
