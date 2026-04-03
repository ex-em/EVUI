import debounce from './utils.debounce';
import type { DebouncedFunction } from './utils.debounce';

/**
 * Original Code
 * https://github.com/lodash/lodash/blob/es/throttle.js
 * lodash/throttle.js
 */

function isObject(value: unknown): value is Record<string, unknown> {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

/** Error message constants. */
const FUNC_ERROR_TEXT = 'Expected a function';

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/* eslint-disable */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait?: number,
  options?: ThrottleOptions,
): DebouncedFunction<T> {
  let leading = true;
  let trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  return debounce(func, wait, {
    leading,
    maxWait: wait,
    trailing,
  });
}

export default throttle;
/* eslint-enable */
