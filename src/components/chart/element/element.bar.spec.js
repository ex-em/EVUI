import { describe, it, expect } from 'vitest';
import Bar from './element.bar';

const createBar = (overrides = {}) => {
  const bar = Object.create(Bar.prototype);
  Object.assign(bar, overrides);
  return bar;
};

describe('Bar Element', () => {
  describe('calculateBarSize', () => {
    it('px 문자열을 파싱하여 크기를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('30px', 50)).toBe(30);
    });

    it('px 값이 bArea보다 크면 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('100px', 50)).toBe(50);
    });

    it('0~1 사이 숫자는 비율로 계산한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0.5, 100)).toBe(50);
    });

    it('비율 0은 0을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0, 100)).toBe(0);
    });

    it('비율 1은 전체 영역을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(1, 100)).toBe(100);
    });

    it('유효하지 않은 값은 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('auto', 80)).toBe(80);
      expect(bar.calculateBarSize(null, 80)).toBe(80);
      expect(bar.calculateBarSize(2, 80)).toBe(80);
    });
  });

  describe('isPointInBar', () => {
    it('바 영역 내 점은 true를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      // bar: x 10~30, y 20~50
      expect(bar.isPointInBar([15, 40], barData)).toBe(true);
    });

    it('바 영역 밖 점은 false를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      expect(bar.isPointInBar([5, 40], barData)).toBe(false);
      expect(bar.isPointInBar([35, 40], barData)).toBe(false);
    });
  });
});
