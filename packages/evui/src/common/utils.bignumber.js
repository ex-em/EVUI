import BigNumber from 'bignumber.js';

/**
 * Convert Number to BigNumber
 * @param {Number} value
 * @return {BigNumber}
 */
function toBigNumber(value) { return new BigNumber(value); }

/**
 * plus(+)
 * @param {Number} num1
 * @param {Number} num2
 * @return {Number}
 */
function bnPlus(num1, num2) {
  return toBigNumber(num1).plus(toBigNumber(num2)).toNumber();
}

/**
 * minus(-)
 * @param {Number} num1
 * @param {Number} num2
 * @return {Number}
 */
function bnMinus(num1, num2) {
  return toBigNumber(num1).minus(toBigNumber(num2)).toNumber();
}

/**
 * multiply(*)
 * @param {Number} num1
 * @param {Number} num2
 * @return {Number}
 */
function bnMultiply(num1, num2) {
  return toBigNumber(num1).multipliedBy(toBigNumber(num2)).toNumber();
}

/**
 * divide(/)
 * @param {Number} dividend
 * @param {Number} divisor
 * @return {Number}
 */
function bnDivide(dividend, divisor) {
  return toBigNumber(dividend).dividedBy(toBigNumber((divisor))).toNumber();
}

/**
 * floor
 * @param {Number} num
 * @param {Number} decimal
 * @return {Number}
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
