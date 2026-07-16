import { describe, it, expect } from 'vitest';
import {
  buildFontStyle,
  measureContent,
  computeBoxSize,
  resolveCalloutSide,
  computeTail,
  computeLayout,
} from './annotation.layout';

// 결정론적 측정기: 글자당 폭 10, 줄 높이 12
const fakeMeasure = t => ({ width: (t ? t.length : 0) * 10, height: 12 });

describe('annotation.layout', () => {
  describe('buildFontStyle', () => {
    it('builds CSS font shorthand', () => {
      expect(buildFontStyle({ fontWeight: 'bold', fontSize: '11px', fontFamily: 'Roboto' }))
        .toBe('bold 11px Roboto');
    });
    it('numeric fontSize -> px, defaults', () => {
      expect(buildFontStyle({ fontSize: 12 })).toBe('normal 12px sans-serif');
      expect(buildFontStyle()).toBe('normal 11px sans-serif');
    });
  });

  describe('measureContent', () => {
    it('single line', () => {
      const r = measureContent('abc', 'x', fakeMeasure);
      expect(r).toMatchObject({ width: 30, height: 12, lineHeight: 12 });
      expect(r.lines).toHaveLength(1);
    });
    it('multiline takes max width, sums height', () => {
      const r = measureContent('a\nabcd', 'x', fakeMeasure);
      expect(r.width).toBe(40); // max(10, 40)
      expect(r.height).toBe(24); // 2 lines * 12
      expect(r.lines).toHaveLength(2);
    });
  });

  describe('computeBoxSize', () => {
    it('badge adds padding', () => {
      const ann = { type: 'badge', style: { padding: [6, 10, 6, 10] } };
      const s = computeBoxSize(ann, 'ab', fakeMeasure);
      expect(s.w).toBe(20 + 20); // content 20 + pl/pr 10+10
      expect(s.h).toBe(12 + 12); // content 12 + pt/pb 6+6
    });
    it('text has no padding by default', () => {
      const ann = { type: 'text', style: { padding: [0, 0, 0, 0] } };
      const s = computeBoxSize(ann, 'abc', fakeMeasure);
      expect(s).toMatchObject({ w: 30, h: 12 });
    });
    it('circle uses radius', () => {
      const ann = { type: 'circle', style: { radius: 8 } };
      expect(computeBoxSize(ann, '', fakeMeasure)).toMatchObject({ w: 16, h: 16, content: null });
    });
    it('caches measurement by (content, fontStyle); re-measures when content changes', () => {
      let calls = 0;
      const counting = (t) => { calls += 1; return { width: (t ? t.length : 0) * 10, height: 12 }; };
      const ann = { type: 'badge', style: { padding: [0, 0, 0, 0], fontSize: '11px' } };
      computeBoxSize(ann, 'ab', counting); // 측정 1회
      computeBoxSize(ann, 'ab', counting); // 동일 → 캐시 사용(추가 측정 없음)
      expect(calls).toBe(1);
      computeBoxSize(ann, 'abc', counting); // 내용 변경 → 재측정
      expect(calls).toBe(2);
    });
  });

  describe('resolveCalloutSide', () => {
    const center = { x: 100, y: 100 };
    it('explicit anchor wins', () => {
      expect(resolveCalloutSide('left', center, { x: 200, y: 100 })).toBe('left');
    });
    it('auto: tip below -> bottom', () => {
      expect(resolveCalloutSide('auto', center, { x: 100, y: 200 })).toBe('bottom');
    });
    it('auto: tip above -> top', () => {
      expect(resolveCalloutSide('auto', center, { x: 100, y: 10 })).toBe('top');
    });
    it('auto: tip right -> right', () => {
      expect(resolveCalloutSide('auto', center, { x: 300, y: 110 })).toBe('right');
    });
    it('auto: coincident -> bottom', () => {
      expect(resolveCalloutSide('auto', center, { x: 100, y: 100 })).toBe('bottom');
    });
  });

  describe('computeTail', () => {
    const box = { x: 100, y: 100, w: 80, h: 40 };
    it('bottom side base sits on bottom edge, tip at data point', () => {
      const t = computeTail(box, { x: 140, y: 200 }, 'bottom', 8);
      expect(t).toMatchObject({ side: 'bottom', tipX: 140, tipY: 200, baseAY: 140, baseBY: 140 });
      expect(t.baseAX).toBe(132); // 140 - 8
      expect(t.baseBX).toBe(148);
    });
    it('clamps base center within edge', () => {
      const t = computeTail(box, { x: 1000, y: 200 }, 'bottom', 8);
      // baseCenter clamped to box.x + w - a = 172
      expect(t.baseBX).toBe(180);
      expect(t.baseAX).toBe(164);
    });
    it('right side base on right edge', () => {
      const t = computeTail(box, { x: 300, y: 120 }, 'right', 8);
      expect(t).toMatchObject({ side: 'right', baseAX: 180, baseBX: 180 });
    });
  });

  describe('computeLayout', () => {
    it('badge centers box on anchor', () => {
      const ann = { type: 'badge', style: { padding: [0, 0, 0, 0] } };
      const anchor = { x: 100, y: 100, anchorX: 100, anchorY: 100 };
      const l = computeLayout(ann, anchor, 'ab', fakeMeasure);
      // size 20x12, centered
      expect(l.box).toMatchObject({ x: 90, y: 94, w: 20, h: 12 });
      expect(l.tail).toBeNull();
    });

    it('callout tail points to pre-offset data point', () => {
      const ann = { type: 'callout', style: { padding: [0, 0, 0, 0], anchor: 'auto', arrowSize: 8 } };
      // box centered at offset target (100,70); data point at (100,100) below -> side bottom
      const anchor = { x: 100, y: 70, anchorX: 100, anchorY: 100 };
      const l = computeLayout(ann, anchor, 'ab', fakeMeasure);
      expect(l.tail.side).toBe('bottom');
      expect(l.tail).toMatchObject({ tipX: 100, tipY: 100 });
    });

    it('circle returns shape', () => {
      const ann = { type: 'circle', style: { radius: 10 } };
      const anchor = { x: 50, y: 50, anchorX: 50, anchorY: 50 };
      const l = computeLayout(ann, anchor, '', fakeMeasure);
      expect(l.shape).toMatchObject({ cx: 50, cy: 50, r: 10 });
      expect(l.box).toMatchObject({ x: 40, y: 40, w: 20, h: 20 });
    });
  });
});
