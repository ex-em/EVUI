import { describe, it, expect } from 'vitest';
import {
  nearestBoxPoint,
  drawConnector,
  drawBox,
  drawCircle,
  drawText,
  renderAnnotation,
} from './annotation.renderer';
import { drawAnnotations } from './annotation.draw';

/** 호출을 기록하는 mock 2d context. */
function createMockCtx() {
  const calls = [];
  const rec = name => (...args) => calls.push({ name, args });
  return {
    calls,
    save: rec('save'),
    restore: rec('restore'),
    beginPath: rec('beginPath'),
    closePath: rec('closePath'),
    moveTo: rec('moveTo'),
    lineTo: rec('lineTo'),
    quadraticCurveTo: rec('quadraticCurveTo'),
    arc: rec('arc'),
    fill: rec('fill'),
    stroke: rec('stroke'),
    fillText: rec('fillText'),
    setLineDash: rec('setLineDash'),
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    font: null,
    textAlign: null,
    textBaseline: null,
  };
}
const names = ctx => ctx.calls.map(c => c.name);

describe('annotation.renderer', () => {
  describe('nearestBoxPoint', () => {
    const box = { x: 100, y: 100, w: 100, h: 50 };
    it('clamps point to box perimeter/interior', () => {
      expect(nearestBoxPoint(box, { x: 0, y: 0 })).toEqual({ x: 100, y: 100 });
      expect(nearestBoxPoint(box, { x: 150, y: 300 })).toEqual({ x: 150, y: 150 });
      expect(nearestBoxPoint(box, { x: 999, y: 120 })).toEqual({ x: 200, y: 120 });
    });
  });

  describe('drawConnector', () => {
    const box = { x: 100, y: 100, w: 80, h: 40 };
    it('skips when disabled', () => {
      const ctx = createMockCtx();
      drawConnector(ctx, { x: 0, y: 0 }, box, { enabled: false });
      expect(ctx.calls).toHaveLength(0);
    });
    it('straight line with dash applies setLineDash', () => {
      const ctx = createMockCtx();
      drawConnector(ctx, { x: 0, y: 0 }, box, { enabled: true, type: 'straight', style: { dashStyle: 'dash' } });
      expect(ctx.calls.find(c => c.name === 'setLineDash').args[0]).toEqual([4, 4]);
      expect(names(ctx)).toContain('stroke');
      // straight: one lineTo
      expect(ctx.calls.filter(c => c.name === 'lineTo')).toHaveLength(1);
    });
    it('elbow draws two segments', () => {
      const ctx = createMockCtx();
      drawConnector(ctx, { x: 0, y: 0 }, box, { enabled: true, type: 'elbow', style: {} });
      expect(ctx.calls.filter(c => c.name === 'lineTo')).toHaveLength(2);
    });
  });

  describe('drawBox', () => {
    it('fills and strokes when style present', () => {
      const ctx = createMockCtx();
      drawBox(ctx, { x: 0, y: 0, w: 10, h: 10 }, { backgroundColor: '#fff', borderColor: '#000', borderWidth: 1, borderRadius: 4 });
      expect(names(ctx)).toContain('fill');
      expect(names(ctx)).toContain('stroke');
    });
    it('does nothing for transparent/no-border', () => {
      const ctx = createMockCtx();
      drawBox(ctx, { x: 0, y: 0, w: 10, h: 10 }, { backgroundColor: 'transparent', borderWidth: 0 });
      expect(ctx.calls).toHaveLength(0);
    });
  });

  describe('drawCircle', () => {
    it('arcs and fills', () => {
      const ctx = createMockCtx();
      drawCircle(ctx, { cx: 5, cy: 5, r: 10 }, { backgroundColor: '#f00', borderColor: '#000', borderWidth: 1 });
      const arc = ctx.calls.find(c => c.name === 'arc');
      expect(arc.args.slice(0, 3)).toEqual([5, 5, 10]);
      expect(names(ctx)).toContain('fill');
    });
    it('restores canvas state even when a draw call throws (balanced save/restore)', () => {
      const ctx = createMockCtx();
      // 실제 캔버스는 음수 반지름 arc 에 IndexSizeError 를 던진다. throw 를 흉내낸다.
      ctx.arc = () => { throw new Error('IndexSizeError'); };
      expect(() => drawCircle(ctx, { cx: 0, cy: 0, r: -5 }, { backgroundColor: '#f00' })).toThrow();
      const saves = ctx.calls.filter(c => c.name === 'save').length;
      const restores = ctx.calls.filter(c => c.name === 'restore').length;
      expect(saves).toBe(restores); // finally 로 restore 가 보장되어 save 스택이 불균형해지지 않는다
    });
  });

  describe('drawText', () => {
    it('draws one fillText per line', () => {
      const ctx = createMockCtx();
      const content = { lines: [{ text: 'a' }, { text: 'b' }], lineHeight: 12 };
      drawText(ctx, { x: 0, y: 0, w: 40, h: 24 }, content, { color: '#000', fontSize: '11px' });
      expect(ctx.calls.filter(c => c.name === 'fillText')).toHaveLength(2);
      expect(ctx.textAlign).toBe('center');
    });
    it('defaults to center anchor (box center) when textAlign is absent', () => {
      const ctx = createMockCtx();
      const content = { lines: [{ text: 'a' }], lineHeight: 12 };
      drawText(ctx, { x: 0, y: 0, w: 40, h: 24 }, content, {});
      expect(ctx.textAlign).toBe('center');
      expect(ctx.calls.find(c => c.name === 'fillText').args[1]).toBe(20); // box.x + w/2
    });
    it('respects textAlign:left (anchors to left padding edge)', () => {
      const ctx = createMockCtx();
      const content = { lines: [{ text: 'a' }], lineHeight: 12 };
      drawText(ctx, { x: 0, y: 0, w: 40, h: 24 }, content, { textAlign: 'left', padding: [4, 8, 4, 6] });
      expect(ctx.textAlign).toBe('left');
      expect(ctx.calls.find(c => c.name === 'fillText').args[1]).toBe(6); // box.x + paddingLeft
    });
    it('respects textAlign:right (anchors to right padding edge)', () => {
      const ctx = createMockCtx();
      const content = { lines: [{ text: 'a' }], lineHeight: 12 };
      drawText(ctx, { x: 0, y: 0, w: 40, h: 24 }, content, { textAlign: 'right', padding: [4, 8, 4, 6] });
      expect(ctx.textAlign).toBe('right');
      expect(ctx.calls.find(c => c.name === 'fillText').args[1]).toBe(32); // box.x + w - paddingRight
    });
    it('falls back to center for an invalid textAlign value', () => {
      const ctx = createMockCtx();
      const content = { lines: [{ text: 'a' }], lineHeight: 12 };
      drawText(ctx, { x: 0, y: 0, w: 40, h: 24 }, content, { textAlign: 'justify' });
      expect(ctx.textAlign).toBe('center');
      expect(ctx.calls.find(c => c.name === 'fillText').args[1]).toBe(20);
    });
    it('skips empty content', () => {
      const ctx = createMockCtx();
      drawText(ctx, { x: 0, y: 0, w: 10, h: 10 }, { lines: [] }, {});
      expect(ctx.calls).toHaveLength(0);
    });
  });

  describe('renderAnnotation dispatch', () => {
    it('circle path only draws shape', () => {
      const ctx = createMockCtx();
      const ann = { type: 'circle', style: { backgroundColor: '#f00', borderWidth: 0 } };
      renderAnnotation(ctx, ann, { shape: { cx: 1, cy: 1, r: 5 } }, { anchorX: 1, anchorY: 1 });
      expect(names(ctx)).toContain('arc');
      expect(names(ctx)).not.toContain('fillText');
    });
    it('callout ignores connector even if enabled', () => {
      const ctx = createMockCtx();
      const ann = {
        type: 'callout',
        connector: { enabled: true, style: {} },
        style: { backgroundColor: '#fff', borderColor: '#000', borderWidth: 1 },
      };
      const layout = {
        box: { x: 10, y: 10, w: 40, h: 20 },
        tail: { side: 'bottom', tipX: 30, tipY: 60, baseAX: 22, baseAY: 30, baseBX: 38, baseBY: 30 },
        content: { lines: [{ text: 'C' }], lineHeight: 12 },
      };
      renderAnnotation(ctx, ann, layout, { anchorX: 30, anchorY: 60 });
      // no setLineDash because connector not drawn for callout
      expect(names(ctx)).not.toContain('setLineDash');
      expect(names(ctx)).toContain('fillText');
    });
  });
});

describe('annotation.draw orchestrator', () => {
  const viewportCtx = {
    chartRect: { x1: 50, x2: 450, y1: 20, y2: 320, chartWidth: 400, chartHeight: 300 },
    labelOffset: { left: 50, right: 50, top: 50, bottom: 50 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 100 }], y: [{ graphMin: 0, graphMax: 100 }] },
    seriesList: {},
  };

  // jsdom 에는 canvas 2d 가 없어 실제 측정 대신 결정론적 측정기를 주입한다.
  const fakeMeasure = t => ({ width: (t ? t.length : 0) * 10, height: 12 });

  it('skips hidden (out-of-range axis) annotations', () => {
    const ctx = createMockCtx();
    const annotations = [
      { id: 'a', type: 'badge', content: 'hidden', position: { type: 'axis', xValue: 999, yValue: 50 }, style: { backgroundColor: '#fff', borderWidth: 0 } },
    ];
    drawAnnotations(ctx, annotations, viewportCtx, fakeMeasure);
    expect(ctx.calls).toHaveLength(0);
  });

  it('draws a visible pixel badge with resolved token content', () => {
    const ctx = createMockCtx();
    const annotations = [{
      id: 'b',
      type: 'badge',
      content: 'x={xValue}',
      position: { type: 'pixel', x: 100, y: 100 },
      style: { backgroundColor: '#fff', borderColor: '#000', borderWidth: 1, borderRadius: 4, padding: [4, 4, 4, 4], fontSize: '11px' },
    }];
    drawAnnotations(ctx, annotations, viewportCtx, fakeMeasure);
    const text = ctx.calls.find(c => c.name === 'fillText');
    // pixel position has no xValue token source -> token kept verbatim
    expect(text.args[0]).toBe('x={xValue}');
  });

  it('no-ops on empty/invalid input', () => {
    const ctx = createMockCtx();
    drawAnnotations(ctx, [], viewportCtx, fakeMeasure);
    drawAnnotations(ctx, null, viewportCtx, fakeMeasure);
    drawAnnotations(null, [{}], viewportCtx, fakeMeasure);
    expect(ctx.calls).toHaveLength(0);
  });

  it('isolates a failing annotation; subsequent ones still render', () => {
    const ctx = createMockCtx();
    const annotations = [
      // style 누락 → computeLayout(circle)에서 throw, try/catch 로 격리되어야 함
      { id: 'bad', type: 'circle', position: { type: 'pixel', x: 10, y: 10 } },
      {
        id: 'ok',
        type: 'badge',
        content: 'OK',
        position: { type: 'pixel', x: 50, y: 50 },
        style: { backgroundColor: '#fff', borderColor: '#000', borderWidth: 1, borderRadius: 4, padding: [4, 4, 4, 4], fontSize: '11px' },
      },
    ];
    drawAnnotations(ctx, annotations, viewportCtx, fakeMeasure);
    // 두 번째(정상) 어노테이션은 그려진다
    const text = ctx.calls.find(c => c.name === 'fillText');
    expect(text && text.args[0]).toBe('OK');
  });
});
