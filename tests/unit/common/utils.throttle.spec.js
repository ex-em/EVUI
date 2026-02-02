import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import throttle from '@/common/utils.throttle';

describe('utils.throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic throttle', () => {
    it('should execute immediately on first call by default (leading: true)', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should limit execution frequency', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled();
      throttled();
      throttled();

      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should execute at most once per wait period', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled();
      vi.advanceTimersByTime(50);
      throttled();
      vi.advanceTimersByTime(50);
      throttled();

      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to the throttled function', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled('arg1', 'arg2');
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('leading option', () => {
    it('should not execute immediately when leading is false', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100, { leading: false });

      throttled();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing option', () => {
    it('should not execute at trailing edge when trailing is false', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100, { trailing: false });

      throttled();
      expect(func).toHaveBeenCalledTimes(1);

      throttled();
      throttled();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel method', () => {
    it('should cancel pending trailing invocation', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled();
      throttled();
      throttled.cancel();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('flush method', () => {
    it('should immediately invoke pending function', () => {
      const func = vi.fn();
      const throttled = throttle(func, 100);

      throttled();
      throttled();

      expect(func).toHaveBeenCalledTimes(1);

      throttled.flush();
      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should throw TypeError if func is not a function', () => {
      expect(() => throttle('not a function', 100)).toThrow(TypeError);
      expect(() => throttle(null, 100)).toThrow(TypeError);
    });
  });
});
