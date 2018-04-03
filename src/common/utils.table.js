export default {
  quantity(input) {
    let output;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
      output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
    } else {
      output = undefined;
    }
    return output;
  },

  /**
   * % 는 퍼센트로 숫자 및 문자 숫자는  px로 이상한값은 0px로 반환
   * @param input
   * @returns px | % | undefiend
   */
  numberToPixel(input) {
    let output;
    let result;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
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
   * @param val
   * @returns true | false
   */
  isPercentValue(val) {
    let result;
    if (typeof val !== 'string') {
      result = false;
    } else if (val.indexOf('%') > 0) {
      result = true;
    } else {
      result = false;
    }

    return result;
  },

  /**
   * 컬럼 min max 체크하기
   * @param val
   * @param min
   * @param max
   * @returns {*}
   */
  checkColSize(val, min, max) {
    let result;

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
