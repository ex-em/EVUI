// @vitest-environment node
// jsdom 은 window === globalThis 라 두 참조의 차이를 볼 수 없어, worker 계약은 node 환경에서만 검증된다.
import { describe, it, expect, vi } from 'vitest';
import debounce from './utils.debounce';

describe('utils.debounce — worker 컨텍스트 (window 없음)', () => {
  it('rAF 타이머를 window 가 아닌 globalThis 로 참조한다', () => {
    expect(globalThis.window).toBeUndefined();

    const frames = [];
    globalThis.requestAnimationFrame = (cb) => frames.push(cb);
    globalThis.cancelAnimationFrame = vi.fn();

    try {
      const func = vi.fn();
      const debounced = debounce(func);

      debounced();
      frames.forEach((cb) => cb());

      expect(func).toHaveBeenCalledTimes(1);
    } finally {
      delete globalThis.requestAnimationFrame;
      delete globalThis.cancelAnimationFrame;
    }
  });

  it('rAF 가 없으면 setTimeout 경로로 내려간다', () => {
    expect(globalThis.requestAnimationFrame).toBeUndefined();

    vi.useFakeTimers();
    try {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
