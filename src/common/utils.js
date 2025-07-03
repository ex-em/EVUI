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

export function truthyNumber(v) {
  return typeof v === 'number' && !Number.isNaN(v);
}

export function truthy(...args) {
  return args.every(truthyNumber);
}

export function convertToPercent(value, totalValue) {
  const res = (value / totalValue) * 100;
  if (!truthy(value, totalValue, res) || value === 0 || totalValue === 0) {
    return 0;
  }

  return res.toFixed(2);
}

export function millions(v) {
  return truthy(v) ? 1e6 * v : 0;
}

export function billions(v) {
  return truthy(v) ? 1e9 * v : 0;
}

export function trillion(v) {
  return truthy(v) ? 1e12 * v : 0;
}

export function quadrillion(v) {
  return truthy(v) ? 1e15 * v : 0;
}

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

export function getPrecision(v) {
  const decimal = v?.toString().split('.')[1] || 0;
  return decimal ? decimal.length : 0;
}

export function checkNullAndUndefined(value) {
  return value === null || value === undefined;
}

/**
 * Check if the device is mobile
 * @returns {boolean}
 */
export function mobileCheck() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    || 'ontouchstart' in window
  );
}
