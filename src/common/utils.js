/**
 * 크기 값 문자열을 파싱하여 숫자와 단위로 분리합니다.
 * @param {string|number} input - 파싱할 크기 값 ('100px', '50%', 'normal' 등)
 * @returns {Object|null} { value: number, unit: string } 또는 null
 * @example
 * getQuantity('100px') // { value: 100, unit: 'px' }
 * getQuantity('normal') // null (자동 크기 계산)
 */
export function getQuantity(input) {
  // 타입 체크: string 또는 number만 처리
  if (typeof input !== 'string' && typeof input !== 'number') {
    return null;
  }

  // NaN 체크
  if (Number.isNaN(input)) {
    return null;
  }

  // Infinity 처리 (숫자와 문자열 모두)
  if (input === Infinity || input === -Infinity || input === 'Infinity' || input === '-Infinity') {
    return { value: +input, unit: undefined };
  }

  // 정규식으로 패턴 매치 시도
  const match = /^(normal|(-*\d+(?:\.\d+)?)(px|%)?)$/.exec(input);
  if (!match) {
    return null;
  }

  // 'normal' 키워드는 null 반환 (자동 크기 계산)
  if (match[1] === 'normal') {
    return null;
  }

  // 숫자 부분과 단위 부분 추출
  const numberPart = match[2];
  const unitPart = match[3];

  // 다중 음수 부호 처리 (--10, ---5 등)
  if (/^-{2,}/.test(numberPart)) {
    const cleanedValue = numberPart.replace(/^-+/, '');
    return { value: +cleanedValue, unit: null };
  }

  // 일반적인 숫자 파싱
  return {
    value: +numberPart,
    unit: unitPart || undefined,
  };
}

/**
 * 값이 유효한 숫자인지 확인합니다 (NaN이 아닌 number 타입).
 * @param {*} v - 확인할 값
 * @returns {boolean} 유효한 숫자이면 true, 아니면 false
 * @example
 * truthyNumber(10) // true
 * truthyNumber(NaN) // false
 * truthyNumber('10') // false
 */
export function truthyNumber(v) {
  return typeof v === 'number' && !Number.isNaN(v);
}

/**
 * 모든 인자가 유효한 숫자인지 확인합니다.
 * @param {...*} args - 확인할 값들
 * @returns {boolean} 모든 값이 유효한 숫자이면 true, 아니면 false
 * @example
 * truthy(1, 2, 3) // true
 * truthy(1, NaN, 3) // false
 */
export function truthy(...args) {
  return args.every(truthyNumber);
}

/**
 * 값을 전체 값에 대한 백분율로 변환합니다.
 * @param {number} value - 변환할 값
 * @param {number} totalValue - 전체 값
 * @returns {string|number} 백분율 문자열 (소수점 2자리) 또는 0
 * @example
 * convertToPercent(25, 100) // "25.00"
 * convertToPercent(0, 100) // 0
 */
export function convertToPercent(value, totalValue) {
  const res = (value / totalValue) * 100;
  if (!truthy(value, totalValue, res) || value === 0 || totalValue === 0) {
    return 0;
  }

  return res.toFixed(2);
}

/**
 * 값을 백만 단위로 변환합니다 (값 × 1,000,000).
 * @param {number} v - 변환할 값
 * @returns {number} 백만 단위로 변환된 값 또는 0
 * @example
 * millions(5) // 5000000
 * millions(NaN) // 0
 */
export function millions(v) {
  return truthy(v) ? 1e6 * v : 0;
}

/**
 * 값을 십억 단위로 변환합니다 (값 × 1,000,000,000).
 * @param {number} v - 변환할 값
 * @returns {number} 십억 단위로 변환된 값 또는 0
 * @example
 * billions(5) // 5000000000
 * billions(NaN) // 0
 */
export function billions(v) {
  return truthy(v) ? 1e9 * v : 0;
}

/**
 * 값을 조 단위로 변환합니다 (값 × 1,000,000,000,000).
 * @param {number} v - 변환할 값
 * @returns {number} 조 단위로 변환된 값 또는 0
 * @example
 * trillion(5) // 5000000000000
 * trillion(NaN) // 0
 */
export function trillion(v) {
  return truthy(v) ? 1e12 * v : 0;
}

/**
 * 값을 천조 단위로 변환합니다 (값 × 1,000,000,000,000,000).
 * @param {number} v - 변환할 값
 * @returns {number} 천조 단위로 변환된 값 또는 0
 * @example
 * quadrillion(5) // 5000000000000000
 * quadrillion(NaN) // 0
 */
export function quadrillion(v) {
  return truthy(v) ? 1e15 * v : 0;
}

/**
 * 숫자에 천 단위 구분자(콤마)를 추가합니다.
 * @param {number} v - 포맷할 숫자
 * @returns {string|boolean} 콤마가 추가된 문자열 또는 false (유효하지 않은 숫자인 경우)
 * @example
 * numberWithComma(1234567) // "1,234,567"
 * numberWithComma(1234.56) // "1,234.56"
 * numberWithComma(NaN) // false
 */
export function numberWithComma(v) {
  const reg = /\B(?=(\d{3})+(?!\d))/g;

  if (truthy(v)) {
    if (Number.isInteger(v)) {
      return v.toString().replace(reg, ',');
    }

    const part = v.toString().split('.');
    return part[0].replace(reg, ',') + (part[1] ? `.${part[1]}` : '');
  }

  return false;
}

/**
 * 숫자의 소수점 이하 자릿수를 구합니다.
 * @param {number} v - 확인할 숫자
 * @returns {number} 소수점 이하 자릿수
 * @example
 * getPrecision(3.14159) // 5
 * getPrecision(10) // 0
 * getPrecision(10.5) // 1
 */
export function getPrecision(v) {
  const decimal = v?.toString().split('.')[1] || 0;
  return decimal ? decimal.length : 0;
}

/**
 * 값이 null 또는 undefined인지 확인합니다.
 * @param {*} value - 확인할 값
 * @returns {boolean} null 또는 undefined이면 true, 아니면 false
 * @example
 * checkNullAndUndefined(null) // true
 * checkNullAndUndefined(undefined) // true
 * checkNullAndUndefined(0) // false
 * checkNullAndUndefined('') // false
 */
export function checkNullAndUndefined(value) {
  return value === null || value === undefined;
}

/**
 * 현재 기기가 모바일 기기인지 확인합니다.
 * @returns {boolean} 모바일 기기이면 true, 아니면 false
 * @example
 * mobileCheck() // true (모바일에서 실행 시)
 * mobileCheck() // false (데스크톱에서 실행 시)
 */
export function mobileCheck() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    || 'ontouchstart' in window
  );
}
