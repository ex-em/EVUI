export function getQuantity(input) {
  let output = null;
  if (typeof input === 'string' || typeof input === 'number') {
    const match = /^(normal|(-*\d+(?:\.\d+)?)(px|%)?)$/.exec(input);
    output = match ? { value: +match[2], unit: match[3] || undefined } : null;
  }

  return output;
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
