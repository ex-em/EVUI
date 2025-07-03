import BigNumber from 'bignumber.js';

/**
 * 숫자를 BigNumber 객체로 변환합니다.
 * JavaScript의 부동소수점 연산 정밀도 문제를 해결하기 위해 사용됩니다.
 * @param {Number} value - BigNumber로 변환할 숫자값
 * @return {BigNumber} BigNumber 객체
 */
function toBigNumber(value) { return new BigNumber(value); }

/**
 * 두 숫자를 정밀하게 더합니다.
 * JavaScript의 부동소수점 연산 오차를 방지하기 위해 BigNumber를 사용합니다.
 * @param {Number} num1 - 첫 번째 숫자 (피가수)
 * @param {Number} num2 - 두 번째 숫자 (가수)
 * @return {Number} 두 숫자의 합
 * @example
 * bnPlus(0.1, 0.2) // 0.3 (JavaScript 기본 연산: 0.30000000000000004)
 */
function bnPlus(num1, num2) {
  return toBigNumber(num1).plus(toBigNumber(num2)).toNumber();
}

/**
 * 두 숫자를 정밀하게 뺍니다.
 * JavaScript의 부동소수점 연산 오차를 방지하기 위해 BigNumber를 사용합니다.
 * @param {Number} num1 - 첫 번째 숫자 (피감수)
 * @param {Number} num2 - 두 번째 숫자 (감수)
 * @return {Number} 두 숫자의 차
 * @example
 * bnMinus(1.0, 0.9) // 0.1 (JavaScript 기본 연산: 0.09999999999999998)
 */
function bnMinus(num1, num2) {
  return toBigNumber(num1).minus(toBigNumber(num2)).toNumber();
}

/**
 * 두 숫자를 정밀하게 곱합니다.
 * JavaScript의 부동소수점 연산 오차를 방지하기 위해 BigNumber를 사용합니다.
 * @param {Number} num1 - 첫 번째 숫자 (피승수)
 * @param {Number} num2 - 두 번째 숫자 (승수)
 * @return {Number} 두 숫자의 곱
 * @example
 * bnMultiply(0.1, 3) // 0.3 (JavaScript 기본 연산: 0.30000000000000004)
 */
function bnMultiply(num1, num2) {
  return toBigNumber(num1).multipliedBy(toBigNumber(num2)).toNumber();
}

/**
 * 두 숫자를 정밀하게 나눕니다.
 * JavaScript의 부동소수점 연산 오차를 방지하기 위해 BigNumber를 사용합니다.
 * @param {Number} dividend - 나누어지는 수 (피제수)
 * @param {Number} divisor - 나누는 수 (제수), 0이면 Infinity 반환
 * @return {Number} 나눗셈의 결과
 * @example
 * bnDivide(0.3, 0.1) // 3 (JavaScript 기본 연산: 2.9999999999999996)
 */
function bnDivide(dividend, divisor) {
  return toBigNumber(dividend).dividedBy(toBigNumber((divisor))).toNumber();
}

/**
 * 숫자의 소수점을 지정된 자리수에서 버림합니다.
 * Math.floor()와 달리 소수점 자리수를 지정할 수 있습니다.
 * @param {Number} num - 버림할 숫자
 * @param {Number} decimal - 소수점 자리수 (0: 정수, 1: 소수점 첫째 자리까지)
 * @return {Number} 지정된 소수점 자리수에서 버림된 숫자
 * @example
 * bnFloor(3.14159, 2) // 3.14
 * bnFloor(3.14159, 0) // 3
 */
function bnFloor(num, decimal) {
  return toBigNumber(num).decimalPlaces(decimal, BigNumber.ROUND_DOWN).toNumber();
}

export {
  toBigNumber,
  bnPlus,
  bnMinus,
  bnMultiply,
  bnDivide,
  bnFloor,
};
