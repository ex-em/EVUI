import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import debounce from './utils.debounce';

describe('utils.debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic debounce', () => {
    it('should delay function execution', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should only execute once for multiple rapid calls', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on each call', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should use the last arguments for multiple calls', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced('first');
      debounced('second');
      debounced('third');

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledWith('third');
    });
  });

  describe('leading option', () => {
    it('should execute immediately when leading is true', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100, { leading: true, trailing: false });

      debounced();
      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should not execute again during wait period when leading is true', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100, { leading: true, trailing: false });

      debounced();
      debounced();
      debounced();

      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing option', () => {
    it('should execute at trailing edge by default', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should not execute at trailing edge when trailing is false', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100, { leading: true, trailing: false });

      debounced();
      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('maxWait option', () => {
    it('should execute after maxWait even if debouncing continues', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100, { maxWait: 200 });

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);

      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel method', () => {
    it('should cancel pending invocations', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      debounced.cancel();

      vi.advanceTimersByTime(100);
      expect(func).not.toHaveBeenCalled();
    });
  });

  describe('flush method', () => {
    it('should immediately invoke pending function', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      expect(func).not.toHaveBeenCalled();

      debounced.flush();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should return result of the flushed function', () => {
      const func = vi.fn().mockReturnValue('result');
      const debounced = debounce(func, 100);

      debounced();
      const result = debounced.flush();

      expect(result).toBe('result');
    });
  });

  describe('pending method', () => {
    it('should return true when there is a pending invocation', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      expect(debounced.pending()).toBe(false);

      debounced();
      expect(debounced.pending()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(debounced.pending()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw TypeError if func is not a function', () => {
      expect(() => debounce('not a function', 100)).toThrow(TypeError);
      expect(() => debounce(null, 100)).toThrow(TypeError);
    });
  });
});
