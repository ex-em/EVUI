import type { Quantity, SizeInput } from '@/types/common';

export default {
  quantity(input: SizeInput): Quantity | undefined {
    let output: Quantity | undefined;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = /^(normal|(\d+(?:\.\d+)?)(px|%)?)$/.exec(String(input));
      output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
    } else {
      output = undefined;
    }
    return output;
  },

  /**
   * % 는 퍼센트로 숫자 및 문자 숫자는  px로 이상한값은 0px로 반환
   */
  numberToPixel(input: SizeInput): string | undefined {
    let output: Quantity | undefined;
    let result: string | undefined;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = /^(normal|(\d+(?:\.\d+)?)(px|%)?)$/.exec(String(input));
      output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
    } else {
      output = undefined;
    }

    if (output === null || output === undefined) {
      result = undefined;
    } else if (output.unit === '%') {
      result = `${output.value}%`;
    } else {
      result = `${output.value}px`;
    }
    return result;
  },

  /**
   * % 값인지 확인 하기
   */
  isPercentValue(val: unknown): boolean {
    let result: boolean;
    if (typeof val !== 'string') {
      result = false;
    } else if (val.indexOf('%') === val.length - 1) {
      result = true;
    } else {
      result = false;
    }

    return result;
  },

  /**
   * 컬럼 min max 체크하기
   */
  checkColSize(val: number, min: number | undefined, max: number | undefined): number {
    let result: number;

    if (min && val < min) {
      result = min;
    } else if (max && val > max) {
      result = max;
    } else {
      result = val;
    }

    return result;
  },
};
