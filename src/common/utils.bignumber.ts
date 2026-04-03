import BigNumber from 'bignumber.js';

function toBigNumber(value: number): BigNumber {
  return new BigNumber(value);
}

function bnPlus(num1: number, num2: number): number {
  return toBigNumber(num1).plus(toBigNumber(num2)).toNumber();
}

function bnMinus(num1: number, num2: number): number {
  return toBigNumber(num1).minus(toBigNumber(num2)).toNumber();
}

function bnMultiply(num1: number, num2: number): number {
  return toBigNumber(num1).multipliedBy(toBigNumber(num2)).toNumber();
}

function bnDivide(dividend: number, divisor: number): number {
  return toBigNumber(dividend).dividedBy(toBigNumber(divisor)).toNumber();
}

function bnFloor(num: number, decimal: number): number {
  return toBigNumber(num).decimalPlaces(decimal, BigNumber.ROUND_DOWN).toNumber();
}

export { toBigNumber, bnPlus, bnMinus, bnMultiply, bnDivide, bnFloor };
