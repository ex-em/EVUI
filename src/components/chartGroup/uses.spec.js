import { describe, it, expect } from 'vitest';
import { useGroupModel } from './uses';

describe('chartGroup uses', () => {
  describe('getNormalizedOptions', () => {
    const { getNormalizedOptions } = useGroupModel();

    it('빈 옵션에 기본값을 적용한다', () => {
      const result = getNormalizedOptions({});
      expect(result.zoom).toBeDefined();
      expect(result.zoom.bufferMemoryCnt).toBe(100);
      expect(result.zoom.keepZoomStatus).toBe(false);
      expect(result.zoom.useAnimation).toBe(true);
      expect(result.zoom.useWheelMove).toBe(true);
    });

    it('사용자 옵션이 기본값을 덮어쓴다', () => {
      const result = getNormalizedOptions({
        zoom: { bufferMemoryCnt: 50, keepZoomStatus: true },
      });
      expect(result.zoom.bufferMemoryCnt).toBe(50);
      expect(result.zoom.keepZoomStatus).toBe(true);
      expect(result.zoom.useAnimation).toBe(true);
    });

    it('toolbar 기본값이 적용된다', () => {
      const result = getNormalizedOptions({});
      expect(result.zoom.toolbar.show).toBe(false);
      expect(result.zoom.toolbar.items.reset).toBeDefined();
      expect(result.zoom.toolbar.items.reset.icon).toBe('ev-icon-redo');
    });

    it('toolbar 부분 덮어쓰기가 동작한다', () => {
      const result = getNormalizedOptions({
        zoom: { toolbar: { show: true } },
      });
      expect(result.zoom.toolbar.show).toBe(true);
      expect(result.zoom.toolbar.items.reset.icon).toBe('ev-icon-redo');
    });
  });

  describe('groupInteraction', () => {
    it('기본값은 at:0, deferUntil:0 이다', () => {
      const { groupInteraction } = useGroupModel();
      expect(groupInteraction).toEqual({ at: 0, deferUntil: 0 });
    });
  });
});
