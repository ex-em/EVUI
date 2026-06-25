import { describe, it, expect } from 'vitest';
import {
  resolveAnchor,
  resolveLocationIndex,
  resolveContent,
  buildContentContext,
} from './annotation.resolver';

// graphMin=0, graphMax=100, area=200 => 1 unit = 2px
const ctx = {
  chartRect: { x1: 50, x2: 450, y1: 20, y2: 320, chartWidth: 400, chartHeight: 300 },
  labelOffset: { left: 50, right: 50, top: 50, bottom: 50 },
  axesSteps: {
    x: [{ graphMin: 0, graphMax: 100 }],
    y: [{ graphMin: 0, graphMax: 100 }],
  },
  seriesList: {
    s1: {
      name: 'Series One',
      data: [
        { x: 0, y: 10, xp: 100, yp: 260 },
        { x: 1, y: 20, xp: 150, yp: 240 },
        { x: 2, y: 30, xp: 200, yp: null }, // zoomed-out point
      ],
    },
  },
};

describe('annotation.resolver', () => {
  describe('resolveLocationIndex', () => {
    it('start/end/number/clamp/empty (length 하위호환)', () => {
      expect(resolveLocationIndex('start', 5)).toBe(0);
      expect(resolveLocationIndex('end', 5)).toBe(4);
      expect(resolveLocationIndex(2, 5)).toBe(2);
      expect(resolveLocationIndex(99, 5)).toBe(4); // clamp
      expect(resolveLocationIndex(-3, 5)).toBe(0); // clamp
      expect(resolveLocationIndex('end', 0)).toBe(-1);
    });
    it('array: start/end 는 데이터 있는(non-null) 첫/마지막', () => {
      const data = [{ y: null }, { y: 5 }, { y: 6 }, { y: null }];
      expect(resolveLocationIndex('start', data)).toBe(1);
      expect(resolveLocationIndex('end', data)).toBe(2);
    });
    it('array: 명시 인덱스는 null 여부 무관하게 그대로(clamp)', () => {
      const data = [{ y: null }, { y: 5 }];
      expect(resolveLocationIndex(0, data)).toBe(0);
      expect(resolveLocationIndex(9, data)).toBe(1);
    });
    it('array: 전부 null 이면 -1', () => {
      expect(resolveLocationIndex('start', [{ y: null }, { y: null }])).toBe(-1);
      expect(resolveLocationIndex('end', [{ y: null }, { y: null }])).toBe(-1);
    });
    it('horizontal 은 x 필드로 값 유무 판정', () => {
      const data = [{ x: null }, { x: 5 }];
      expect(resolveLocationIndex('start', data, true)).toBe(1);
    });
  });

  describe('resolveAnchor - pixel', () => {
    it('absolute canvas coord + offset, always visible', () => {
      const ann = { position: { type: 'pixel', x: 30, y: 40, offsetX: 5, offsetY: -10 } };
      expect(resolveAnchor(ann, ctx)).toMatchObject({ x: 35, y: 30, isVisible: true });
    });
  });

  describe('resolveAnchor - axis', () => {
    // xAxisPosition = x1 + left = 100; xArea = chartWidth - (left+right) = 300
    // value 50 => 100 + (300/100)*50 = 250
    it('maps axis value to pixel + offset', () => {
      const ann = {
        position: {
          type: 'axis', xAxisIndex: 0, yAxisIndex: 0, xValue: 50, yValue: 50, offsetX: 0, offsetY: 0,
        },
      };
      const r = resolveAnchor(ann, ctx);
      expect(r.isVisible).toBe(true);
      expect(r.x).toBe(250);
      // yAxisPosition = y2 - bottom = 270; yArea = 300 - 100 = 200; 270 - (200/100)*50 = 170
      expect(r.y).toBe(170);
    });

    it('hides when value is out of axis range', () => {
      const ann = { position: { type: 'axis', xValue: 999, yValue: 50 } };
      expect(resolveAnchor(ann, ctx).isVisible).toBe(false);
    });

    it('hides when axis step missing', () => {
      const ann = { position: { type: 'axis', xAxisIndex: 3, xValue: 1, yValue: 1 } };
      expect(resolveAnchor(ann, ctx).isVisible).toBe(false);
    });
  });

  describe('resolveAnchor - series', () => {
    it('start tracks first point', () => {
      const ann = { position: { type: 'series', seriesId: 's1', location: 'start', offsetX: 0, offsetY: -30 } };
      expect(resolveAnchor(ann, ctx)).toMatchObject({ x: 100, y: 230, anchorX: 100, anchorY: 260, isVisible: true });
    });
    it('end tracks last point with non-null xp/yp gating', () => {
      const ann = { position: { type: 'series', seriesId: 's1', location: 'end' } };
      // last index has yp null => hidden
      expect(resolveAnchor(ann, ctx).isVisible).toBe(false);
    });

    it('start skips leading null values to first data point', () => {
      const skipCtx = {
        seriesList: {
          s: {
            data: [
              { x: 0, y: null, xp: 50, yp: null },
              { x: 1, y: 20, xp: 100, yp: 240 },
              { x: 2, y: 30, xp: 150, yp: 220 },
            ],
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's', location: 'start' } };
      expect(resolveAnchor(ann, skipCtx)).toMatchObject({ x: 100, y: 240, isVisible: true });
    });

    it('end skips trailing null values to last data point', () => {
      const skipCtx = {
        seriesList: {
          s: {
            data: [
              { x: 0, y: 10, xp: 50, yp: 260 },
              { x: 1, y: 20, xp: 100, yp: 240 },
              { x: 2, y: null, xp: 150, yp: null },
            ],
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's', location: 'end' } };
      expect(resolveAnchor(ann, skipCtx)).toMatchObject({ x: 100, y: 240, isVisible: true });
    });

    it('hides when all data points are null', () => {
      const allNull = { seriesList: { s: { data: [{ y: null, xp: null, yp: null }, { y: null, xp: null, yp: null }] } } };
      const ann = { position: { type: 'series', seriesId: 's', location: 'start' } };
      expect(resolveAnchor(ann, allNull).isVisible).toBe(false);
    });

    it('numeric index is literal (does not skip null)', () => {
      const nullAt0 = { seriesList: { s: { data: [{ x: 0, y: null, xp: 50, yp: null }, { x: 1, y: 20, xp: 100, yp: 240 }] } } };
      const ann = { position: { type: 'series', seriesId: 's', location: 0 } };
      // 명시 인덱스 0 은 null 이어도 그대로 → yp null → 숨김
      expect(resolveAnchor(ann, nullAt0).isVisible).toBe(false);
    });
    it('numeric index', () => {
      const ann = { position: { type: 'series', seriesId: 's1', location: 1 } };
      expect(resolveAnchor(ann, ctx)).toMatchObject({ x: 150, y: 240, isVisible: true });
    });
    it('hides for unknown series', () => {
      const ann = { position: { type: 'series', seriesId: 'nope', location: 'end' } };
      expect(resolveAnchor(ann, ctx).isVisible).toBe(false);
    });

    it('hides when the tracked series is not visible (show:false)', () => {
      const hiddenCtx = {
        seriesList: { s1: { show: false, data: [{ xp: 100, yp: 200 }] } },
      };
      const ann = { position: { type: 'series', seriesId: 's1', location: 0 } };
      expect(resolveAnchor(ann, hiddenCtx).isVisible).toBe(false);
    });

    it('hides pie slice when its series is not visible (legend toggle)', () => {
      const hiddenPie = {
        seriesList: {
          's-0': {
            type: 'pie', show: false, centerX: 100, centerY: 100, radius: 80,
            startAngle: 0, endAngle: Math.PI, data: { o: 1, percentage: 50 },
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      expect(resolveAnchor(ann, hiddenPie).isVisible).toBe(false);
    });

    it('vertical bar anchors to value-end edge center (top-center)', () => {
      const barCtx = {
        seriesList: {
          // 수직 bar: xp/yp = 좌상단 코너, h 음수(위로 확장)
          bars: { type: 'bar', isHorizontal: false, name: 'Bars', data: [{ x: 0, y: 60, xp: 100, yp: 200, w: 40, h: -60 }] },
        },
      };
      const ann = { position: { type: 'series', seriesId: 'bars', location: 0 } };
      // 카테고리축(X) 중앙 = 100+40/2 = 120, 값축(Y) 막대 끝 = 200+(-60) = 140
      expect(resolveAnchor(ann, barCtx)).toMatchObject({
        x: 120, y: 140, anchorX: 120, anchorY: 140, isVisible: true,
      });
    });

    it('horizontal bar anchors to value-end edge center (end-center)', () => {
      const barCtx = {
        seriesList: {
          bars: { type: 'bar', isHorizontal: true, data: [{ xp: 50, yp: 100, w: 80, h: -20 }] },
        },
      };
      const ann = { position: { type: 'series', seriesId: 'bars', location: 0 } };
      // 값축(X) 막대 끝 = 50+80 = 130, 카테고리축(Y) 중앙 = 100+(-20)/2 = 90
      expect(resolveAnchor(ann, barCtx)).toMatchObject({
        x: 130, y: 90, anchorX: 130, anchorY: 90, isVisible: true,
      });
    });

    it('bar respects offset on top of edge center', () => {
      const barCtx = {
        seriesList: { bars: { type: 'bar', isHorizontal: false, data: [{ xp: 50, yp: 100, w: 80, h: -20 }] } },
      };
      const ann = { position: { type: 'series', seriesId: 'bars', location: 0, offsetX: 5, offsetY: -10 } };
      // edge center = (50+40, 100-20) = (90, 80); +offset => (95, 70); anchor stays at edge center
      expect(resolveAnchor(ann, barCtx)).toMatchObject({
        x: 95, y: 70, anchorX: 90, anchorY: 80, isVisible: true,
      });
    });

    it('non-bar box (heatMap) still anchors to cell center', () => {
      const hmCtx = {
        seriesList: { cells: { type: 'heatMap', data: [{ xp: 10, yp: 10, w: 20, h: 20 }] } },
      };
      const ann = { position: { type: 'series', seriesId: 'cells', location: 0 } };
      // center = (20, 20)
      expect(resolveAnchor(ann, hmCtx)).toMatchObject({ x: 20, y: 20, isVisible: true });
    });

    it('pie slice anchors to outer circumference at mid-angle', () => {
      const pieCtx = {
        seriesList: {
          's-0': {
            type: 'pie', name: 'A', centerX: 100, centerY: 100, radius: 80,
            startAngle: 0, endAngle: Math.PI, doughnutHoleSize: 0,
            data: { o: 250, percentage: 25 },
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      // midAngle = π/2 → cos=0, sin=1; outer radius 80 → (100, 180)
      const r = resolveAnchor(ann, pieCtx);
      expect(r.isVisible).toBe(true);
      expect(Math.round(r.x)).toBe(100);
      expect(Math.round(r.y)).toBe(180);
    });

    it('single full-circle slice anchors to the right (3 o\'clock), not bottom', () => {
      const pieCtx = {
        seriesList: {
          's-0': {
            type: 'pie', centerX: 100, centerY: 100, radius: 80,
            // 전체 원: 12시(1.5π) 시작 + 2π sweep
            startAngle: 1.5 * Math.PI, endAngle: 3.5 * Math.PI, doughnutHoleSize: 0,
            data: { o: 1, percentage: 100 },
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      // sweep≈2π → midAngle 0(오른쪽) → (180, 100)
      const r = resolveAnchor(ann, pieCtx);
      expect(Math.round(r.x)).toBe(180);
      expect(Math.round(r.y)).toBe(100);
    });

    it('doughnut anchors at outer circumference (hole-independent)', () => {
      const pieCtx = {
        seriesList: {
          's-0': {
            type: 'pie', centerX: 100, centerY: 100, radius: 80,
            startAngle: 0, endAngle: Math.PI, doughnutHoleSize: 40,
            data: { o: 1, percentage: 50 },
          },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      // 바깥 반지름 80 기준(hole 무관) → (100, 180)
      const r = resolveAnchor(ann, pieCtx);
      expect(Math.round(r.x)).toBe(100);
      expect(Math.round(r.y)).toBe(180);
    });

    it('pie hidden when geometry not yet populated', () => {
      const pieCtx = { seriesList: { 's-0': { type: 'pie', name: 'A' } } };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      expect(resolveAnchor(ann, pieCtx).isVisible).toBe(false);
    });

    it('pie content context exposes value and percentage', () => {
      const pieCtx = {
        seriesList: {
          's-0': { type: 'pie', name: 'Sales', data: { o: 250, percentage: 25 } },
        },
      };
      const ann = { position: { type: 'series', seriesId: 's-0' } };
      const ec = buildContentContext(ann, pieCtx);
      expect(ec).toMatchObject({ seriesName: 'Sales', yValue: 250, percentage: 25 });
      expect(resolveContent('{seriesName} {percentage}%', ec)).toBe('Sales 25%');
    });
  });

  describe('buildContentContext + resolveContent', () => {
    it('series tokens', () => {
      const ann = { position: { type: 'series', seriesId: 's1', location: 1 } };
      const ec = buildContentContext(ann, ctx);
      expect(ec).toMatchObject({ seriesName: 'Series One', xValue: 1, yValue: 20, dataIndex: 1 });
      expect(resolveContent('{seriesName}: {yValue}', ec)).toBe('Series One: 20');
    });
    it('axis tokens', () => {
      const ann = { position: { type: 'axis', xValue: 5, yValue: 15000 } };
      const ec = buildContentContext(ann, ctx);
      expect(resolveContent('y={yValue}', ec)).toBe('y=15000');
    });
    it('unknown token kept verbatim', () => {
      expect(resolveContent('{nope}', {})).toBe('{nope}');
    });
    it('callback content receives ctx', () => {
      const fn = c => `val ${c.yValue}`;
      expect(resolveContent(fn, { yValue: 42 })).toBe('val 42');
    });
    it('callback throwing yields empty string', () => {
      const fn = () => { throw new Error('boom'); };
      expect(resolveContent(fn, {})).toBe('');
    });
  });
});
