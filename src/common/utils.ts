import type { Quantity, SizeInput } from '@/types/common';

const windowConsole = window.console;
export const Console = {
  log(...data: unknown[]) {
    windowConsole.log(...data);
  },
  warn(...data: unknown[]) {
    windowConsole.warn(...data);
  },
  info(...data: unknown[]) {
    windowConsole.info(...data);
  },
  error(...data: unknown[]) {
    windowConsole.error(...data);
  },
  debug(...data: unknown[]) {
    windowConsole.debug(...data);
  },
  dir(item: unknown, options?: object) {
    windowConsole.dir(item, options);
  },
};

export function getQuantity(input: SizeInput): Quantity | null {
  let output: Quantity | null = null;
  if (typeof input === 'string' || typeof input === 'number') {
    const match = /^(normal|(-*\d+(?:\.\d+)?)(px|%)?)$/.exec(String(input));
    output = match ? { value: +match[2], unit: match[3] || undefined } : null;
  }

  return output;
}

export function getSize(size: Quantity | null | undefined): string {
  let sizeValue = '100%';
  if (size) {
    sizeValue = size.unit ? size.value + size.unit : `${size.value}px`;
  }

  return sizeValue;
}

export function getMatchedComponentsDownward(context: any, componentName: string): any[] {
  const children = context.$children;
  const result: any[] = [];
  if (!children) {
    return result;
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

export function getMatchedComponentUpward(context: any, componentName: string): any {
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

export function truthyNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

export function truthy(...args: unknown[]): boolean {
  return args.every(truthyNumber);
}

export function convertToPercent(value: number, totalValue: number): number | string {
  const res = (value / totalValue) * 100;
  if (!truthy(value, totalValue, res) || value === 0 || totalValue === 0) {
    return 0;
  }

  return res.toFixed(2);
}

export function convertToValue(value: number, totalValue: number): number | string {
  const res = (value / 100) * totalValue;
  if (!truthy(value, totalValue, res) || value === 0 || totalValue === 0) {
    return 0;
  }

  return res.toFixed(2);
}

export function millions(v: number): number {
  return truthy(v) ? 1e6 * v : 0;
}

export function billions(v: number): number {
  return truthy(v) ? 1e9 * v : 0;
}

export function trillion(v: number): number {
  return truthy(v) ? 1e12 * v : 0;
}

export function quadrillion(v: number): number {
  return truthy(v) ? 1e15 * v : 0;
}

export function numberWithComma(v: number): string | false {
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

export function getPrecision(v: number | string | null | undefined): number {
  const decimal = v?.toString().split('.')[1] || 0;
  return decimal ? (decimal as string).length : 0;
}

export function checkNullAndUndefined(value: unknown): boolean {
  return value === null || value === undefined;
}

export function mobileCheck(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    'ontouchstart' in window
  );
}
