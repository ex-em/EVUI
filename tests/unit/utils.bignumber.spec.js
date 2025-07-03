import BigNumber from 'bignumber.js';
import {
  toBigNumber,
  bnPlus,
  bnMinus,
  bnMultiply,
  bnDivide,
  bnFloor,
} from '@/common/utils.bignumber';

describe('toBigNumber', () => {
  describe('정상 케이스', () => {
    test('일반 정수를 BigNumber로 변환해야 한다', () => {
      const result = toBigNumber(42);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(42);
    });

    test('소수를 BigNumber로 변환해야 한다', () => {
      const result = toBigNumber(3.14);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(3.14);
    });

    test('음수를 BigNumber로 변환해야 한다', () => {
      const result = toBigNumber(-10);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(-10);
    });
  });

  describe('엣지 케이스', () => {
    test('0을 BigNumber로 변환해야 한다', () => {
      const result = toBigNumber(0);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(0);
    });

    test('매우 큰 수를 BigNumber로 변환해야 한다', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = toBigNumber(largeNumber);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(largeNumber);
    });

    test('매우 작은 소수를 BigNumber로 변환해야 한다', () => {
      const smallNumber = 0.0000001;
      const result = toBigNumber(smallNumber);
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(smallNumber);
    });
  });

  describe('오류 케이스', () => {
    test('문자열 숫자도 BigNumber로 변환할 수 있어야 한다', () => {
      const result = toBigNumber('123.45');
      expect(result).toBeInstanceOf(BigNumber);
      expect(result.toNumber()).toBe(123.45);
    });

    test('유효하지 않은 문자열은 NaN을 반환해야 한다', () => {
      const result = toBigNumber('invalid');
      expect(result.isNaN()).toBe(true);
    });

    test('null은 NaN을 반환해야 한다', () => {
      const result = toBigNumber(null);
      expect(result.isNaN()).toBe(true); // BigNumber에서 null은 NaN으로 처리
    });

    test('undefined는 NaN을 반환해야 한다', () => {
      const result = toBigNumber(undefined);
      expect(result.isNaN()).toBe(true);
    });
  });
});

describe('bnPlus', () => {
  describe('정상 케이스', () => {
    test('일반 정수 덧셈을 정확히 수행해야 한다', () => {
      expect(bnPlus(2, 3)).toBe(5);
      expect(bnPlus(10, 20)).toBe(30);
    });

    test('소수점 덧셈을 정확히 수행해야 한다', () => {
      // JavaScript 기본 연산: 0.1 + 0.2 = 0.30000000000000004
      expect(bnPlus(0.1, 0.2)).toBe(0.3);
      expect(bnPlus(0.7, 0.1)).toBe(0.8);
    });

    test('음수 덧셈을 정확히 수행해야 한다', () => {
      expect(bnPlus(-5, 3)).toBe(-2);
      expect(bnPlus(-10, -5)).toBe(-15);
    });
  });

  describe('엣지 케이스', () => {
    test('0과의 덧셈을 정확히 수행해야 한다', () => {
      expect(bnPlus(0, 5)).toBe(5);
      expect(bnPlus(5, 0)).toBe(5);
      expect(bnPlus(0, 0)).toBe(0);
    });

    test('큰 수 덧셈을 수행해야 한다', () => {
      const large1 = Number.MAX_SAFE_INTEGER;
      const large2 = 1000;
      expect(bnPlus(large1, large2)).toBe(large1 + large2);
    });

    test('매우 작은 소수 덧셈을 정확히 수행해야 한다', () => {
      expect(bnPlus(0.0000001, 0.0000002)).toBe(0.0000003);
    });
  });

  describe('오류 케이스', () => {
    test('NaN 입력 시 NaN을 반환해야 한다', () => {
      expect(bnPlus(NaN, 5)).toBeNaN();
      expect(bnPlus(5, NaN)).toBeNaN();
    });

    test('Infinity 입력 시 Infinity를 반환해야 한다', () => {
      expect(bnPlus(Infinity, 5)).toBe(Infinity);
      expect(bnPlus(5, Infinity)).toBe(Infinity);
    });
  });
});

describe('bnMinus', () => {
  describe('정상 케이스', () => {
    test('일반 정수 뺄셈을 정확히 수행해야 한다', () => {
      expect(bnMinus(5, 3)).toBe(2);
      expect(bnMinus(20, 10)).toBe(10);
    });

    test('소수점 뺄셈을 정확히 수행해야 한다', () => {
      // JavaScript 기본 연산: 1.0 - 0.9 = 0.09999999999999998
      expect(bnMinus(1.0, 0.9)).toBe(0.1);
      expect(bnMinus(0.3, 0.1)).toBe(0.2);
    });

    test('음수 뺄셈을 정확히 수행해야 한다', () => {
      expect(bnMinus(-5, -3)).toBe(-2);
      expect(bnMinus(5, -3)).toBe(8);
    });
  });

  describe('엣지 케이스', () => {
    test('0과의 뺄셈을 정확히 수행해야 한다', () => {
      expect(bnMinus(5, 0)).toBe(5);
      expect(bnMinus(0, 5)).toBe(-5);
      expect(bnMinus(0, 0)).toBe(0);
    });

    test('같은 수의 뺄셈은 0이어야 한다', () => {
      expect(bnMinus(5, 5)).toBe(0);
      expect(bnMinus(3.14, 3.14)).toBe(0);
    });

    test('큰 수 뺄셈을 수행해야 한다', () => {
      const large = Number.MAX_SAFE_INTEGER;
      expect(bnMinus(large, 1000)).toBe(large - 1000);
    });
  });

  describe('오류 케이스', () => {
    test('NaN 입력 시 NaN을 반환해야 한다', () => {
      expect(bnMinus(NaN, 5)).toBeNaN();
      expect(bnMinus(5, NaN)).toBeNaN();
    });

    test('Infinity 입력 시 적절히 처리해야 한다', () => {
      expect(bnMinus(Infinity, 5)).toBe(Infinity);
      expect(bnMinus(5, Infinity)).toBe(-Infinity);
    });
  });
});

describe('bnMultiply', () => {
  describe('정상 케이스', () => {
    test('일반 정수 곱셈을 정확히 수행해야 한다', () => {
      expect(bnMultiply(3, 4)).toBe(12);
      expect(bnMultiply(7, 8)).toBe(56);
    });

    test('소수점 곱셈을 정확히 수행해야 한다', () => {
      // JavaScript 기본 연산: 0.1 * 3 = 0.30000000000000004
      expect(bnMultiply(0.1, 3)).toBe(0.3);
      expect(bnMultiply(0.2, 0.2)).toBe(0.04);
    });

    test('음수 곱셈을 정확히 수행해야 한다', () => {
      expect(bnMultiply(-3, 4)).toBe(-12);
      expect(bnMultiply(-3, -4)).toBe(12);
    });
  });

  describe('엣지 케이스', () => {
    test('0과의 곱셈은 0이어야 한다', () => {
      expect(bnMultiply(0, 5)).toBe(0);
      expect(bnMultiply(5, 0)).toBe(0);
      expect(bnMultiply(0, 0)).toBe(0);
    });

    test('1과의 곱셈은 원래 값이어야 한다', () => {
      expect(bnMultiply(5, 1)).toBe(5);
      expect(bnMultiply(1, 5)).toBe(5);
      expect(bnMultiply(3.14, 1)).toBe(3.14);
    });

    test('큰 수 곱셈을 수행해야 한다', () => {
      expect(bnMultiply(1000000, 1000000)).toBe(1000000000000);
    });
  });

  describe('오류 케이스', () => {
    test('NaN 입력 시 NaN을 반환해야 한다', () => {
      expect(bnMultiply(NaN, 5)).toBeNaN();
      expect(bnMultiply(5, NaN)).toBeNaN();
    });

    test('Infinity 입력 시 적절히 처리해야 한다', () => {
      expect(bnMultiply(Infinity, 5)).toBe(Infinity);
      expect(bnMultiply(5, Infinity)).toBe(Infinity);
      expect(bnMultiply(Infinity, -5)).toBe(-Infinity);
    });
  });
});

describe('bnDivide', () => {
  describe('정상 케이스', () => {
    test('일반 정수 나눗셈을 정확히 수행해야 한다', () => {
      expect(bnDivide(12, 3)).toBe(4);
      expect(bnDivide(20, 4)).toBe(5);
    });

    test('소수점 나눗셈을 정확히 수행해야 한다', () => {
      // JavaScript 기본 연산: 0.3 / 0.1 = 2.9999999999999996
      expect(bnDivide(0.3, 0.1)).toBe(3);
      expect(bnDivide(1.5, 0.3)).toBe(5);
    });

    test('음수 나눗셈을 정확히 수행해야 한다', () => {
      expect(bnDivide(-12, 3)).toBe(-4);
      expect(bnDivide(12, -3)).toBe(-4);
      expect(bnDivide(-12, -3)).toBe(4);
    });
  });

  describe('엣지 케이스', () => {
    test('1로 나누기는 원래 값이어야 한다', () => {
      expect(bnDivide(5, 1)).toBe(5);
      expect(bnDivide(3.14, 1)).toBe(3.14);
      expect(bnDivide(-5, 1)).toBe(-5);
    });

    test('0을 나누기는 0이어야 한다', () => {
      expect(bnDivide(0, 5)).toBe(0);
      expect(bnDivide(0, 3.14)).toBe(0);
    });

    test('0으로 나누기는 Infinity를 반환해야 한다', () => {
      expect(bnDivide(5, 0)).toBe(Infinity);
      expect(bnDivide(-5, 0)).toBe(-Infinity);
    });

    test('같은 수로 나누기는 1이어야 한다', () => {
      expect(bnDivide(5, 5)).toBe(1);
      expect(bnDivide(3.14, 3.14)).toBe(1);
    });
  });

  describe('오류 케이스', () => {
    test('NaN 입력 시 NaN을 반환해야 한다', () => {
      expect(bnDivide(NaN, 5)).toBeNaN();
      expect(bnDivide(5, NaN)).toBeNaN();
    });

    test('Infinity 입력 시 적절히 처리해야 한다', () => {
      expect(bnDivide(Infinity, 5)).toBe(Infinity);
      expect(bnDivide(5, Infinity)).toBe(0);
      expect(bnDivide(Infinity, Infinity)).toBeNaN();
    });
  });
});

describe('bnFloor', () => {
  describe('정상 케이스', () => {
    test('소수점 버림을 정확히 수행해야 한다', () => {
      expect(bnFloor(3.14159, 2)).toBe(3.14);
      expect(bnFloor(3.14159, 1)).toBe(3.1);
      expect(bnFloor(3.14159, 0)).toBe(3);
    });

    test('음수의 소수점 버림을 정확히 수행해야 한다', () => {
      expect(bnFloor(-3.14159, 2)).toBe(-3.14); // ROUND_DOWN은 절댓값 기준 버림
      expect(bnFloor(-3.14159, 1)).toBe(-3.1);
      expect(bnFloor(-3.14159, 0)).toBe(-3);
    });

    test('다양한 소수점 자리수를 처리해야 한다', () => {
      expect(bnFloor(123.456789, 4)).toBe(123.4567);
      expect(bnFloor(123.456789, 3)).toBe(123.456);
      expect(bnFloor(123.456789, 5)).toBe(123.45678);
    });
  });

  describe('엣지 케이스', () => {
    test('이미 정수인 수는 그대로 반환해야 한다', () => {
      expect(bnFloor(5, 0)).toBe(5);
      expect(bnFloor(5, 2)).toBe(5);
    });

    test('0을 처리해야 한다', () => {
      expect(bnFloor(0, 0)).toBe(0);
      expect(bnFloor(0, 2)).toBe(0);
    });

    test('소수점 자리수가 0인 경우를 처리해야 한다', () => {
      expect(bnFloor(3.9, 0)).toBe(3);
      expect(bnFloor(-3.1, 0)).toBe(-3); // ROUND_DOWN은 절댓값 기준 버림
    });

    test('소수점 자리수가 실제 소수점보다 큰 경우를 처리해야 한다', () => {
      expect(bnFloor(3.14, 5)).toBe(3.14);
      expect(bnFloor(3.1, 3)).toBe(3.1);
    });
  });

  describe('오류 케이스', () => {
    test('NaN 입력 시 NaN을 반환해야 한다', () => {
      expect(bnFloor(NaN, 2)).toBeNaN();
    });

    test('Infinity 입력 시 Infinity를 반환해야 한다', () => {
      expect(bnFloor(Infinity, 2)).toBe(Infinity);
      expect(bnFloor(-Infinity, 2)).toBe(-Infinity);
    });

    test('음수 소수점 자리수는 에러를 발생시켜야 한다', () => {
      // BigNumber.js의 decimalPlaces는 음수 값을 허용하지 않음
      expect(() => bnFloor(1234.567, -1)).toThrow();
      expect(() => bnFloor(1234.567, -2)).toThrow();
    });
  });
});

describe('JavaScript 기본 연산과의 정밀도 비교', () => {
  test('부동소수점 덧셈 정밀도 개선을 확인해야 한다', () => {
    // JavaScript 기본 연산의 문제점 확인
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(0.1 + 0.2).toBe(0.30000000000000004);

    // BigNumber 유틸리티의 정확한 계산 확인
    expect(bnPlus(0.1, 0.2)).toBe(0.3);
  });

  test('부동소수점 뺄셈 정밀도 개선을 확인해야 한다', () => {
    // JavaScript 기본 연산의 문제점 확인
    expect(1.0 - 0.9).not.toBe(0.1);
    expect(1.0 - 0.9).toBe(0.09999999999999998);

    // BigNumber 유틸리티의 정확한 계산 확인
    expect(bnMinus(1.0, 0.9)).toBe(0.1);
  });

  test('부동소수점 곱셈 정밀도 개선을 확인해야 한다', () => {
    // JavaScript 기본 연산의 문제점 확인
    expect(0.1 * 3).not.toBe(0.3);
    expect(0.1 * 3).toBe(0.30000000000000004);

    // BigNumber 유틸리티의 정확한 계산 확인
    expect(bnMultiply(0.1, 3)).toBe(0.3);
  });

  test('부동소수점 나눗셈 정밀도 개선을 확인해야 한다', () => {
    // JavaScript 기본 연산의 문제점 확인
    expect(0.3 / 0.1).not.toBe(3);
    expect(0.3 / 0.1).toBe(2.9999999999999996);

    // BigNumber 유틸리티의 정확한 계산 확인
    expect(bnDivide(0.3, 0.1)).toBe(3);
  });
});
