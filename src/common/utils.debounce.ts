/**
 * Original Code
 * https://github.com/lodash/lodash/blob/es/debounce.js
 * lodash/debounce.js
 */

declare const root: any;

function isObject(value: unknown): value is Record<string, unknown> {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

export interface DebounceOptions {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

/* eslint-disable */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait?: number,
  options?: DebounceOptions,
): DebouncedFunction<T> {
  let lastArgs: any;
  let lastThis: any;
  let maxWait: number | undefined;
  let result: any;
  let timerId: ReturnType<typeof setTimeout> | number | undefined;
  let lastCallTime: number | undefined;

  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF = !wait && wait !== 0 && typeof root.requestAnimationFrame === 'function';

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }
  wait = +wait! || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(+(options.maxWait as number) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc: () => void, waitMs: number): number | ReturnType<typeof setTimeout> {
    if (useRAF) {
      window.cancelAnimationFrame(timerId as number);
      return window.requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, waitMs);
  }

  function cancelTimer(id: number | ReturnType<typeof setTimeout>) {
    if (useRAF) {
      return window.cancelAnimationFrame(id as number);
    }
    clearTimeout(id);
  }

  function leadingEdge(time: number) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait!);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait! - timeSinceLastCall;

    return maxing ? Math.min(timeWaiting, maxWait! - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait! ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait!)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  function debounced(this: any, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = startTimer(timerExpired, wait!);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait!);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced as DebouncedFunction<T>;
}

export default debounce;
/* eslint-enable */
