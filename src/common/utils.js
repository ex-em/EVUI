const windowConsole = window.console;
export const Console = {
  log(...data) {
    windowConsole.log(...data);
  },
  warn(...data) {
    windowConsole.warn(...data);
  },
  info(...data) {
    windowConsole.info(...data);
  },
  error(...data) {
    windowConsole.error(...data);
  },
  debug(...data) {
    windowConsole.debug(...data);
  },
  dir(item, options) {
    windowConsole.dir(item, options);
  },
};

export function getQuantity(input) {
  let output;
  if (typeof input === 'string' || typeof input === 'number') {
    const match = (/^(normal|(-*\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
    output = match ? { value: +match[2], unit: match[3] || undefined } : null;
  } else {
    output = null;
  }
  return output;
}

export function getSize(size) {
  let sizeValue;

  if (size) {
    sizeValue = size.unit ? size.value + size.unit : `${size.value}px`;
  } else {
    sizeValue = '100%';
  }
  return sizeValue;
}

export function getMatchedComponentsDownward(context, componentName) {
  const children = context.$children;
  const result = [];
  if (!children) {
    return [];
  }
  for (let i = 0; i < children.length; i++) {
    const v = children[i];
    const name = v.$options.name;
    if (name === componentName) {
      result.push(v);
    } else {
      result.concat(getMatchedComponentsDownward(v, componentName));
    }
  }
  return result;
}

export function getMatchedComponentUpward(context, componentName) {
  let parent = context.$parent;
  let name = parent.$options.name;

  while (parent && (!name || componentName !== name)) {
    parent = parent.$parent;
    if (parent) {
      name = parent.$options.name;
    }
  }

  return parent;
}

export function convertToPercent(value, totalValue) {
  if (!value || !totalValue) {
    return 0;
  }

  return +((value / totalValue) * 100).toFixed(2);
}

export function convertToValue(value, totalValue) {
  let result = 0;

  if (!value || !totalValue) {
    return result;
  }

  result = (value / 100) * totalValue;

  return +result.toFixed(2);
}
