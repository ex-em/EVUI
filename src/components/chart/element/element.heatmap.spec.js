import { describe, it, expect } from 'vitest';
import HeatMap from './element.heatmap';

const createHeatMap = (overrides = {}) => {
  const hm = Object.create(HeatMap.prototype);
  Object.assign(hm, overrides);
  return hm;
};

describe('HeatMap Element', () => {
  describe('getAdjustedBounds', () => {
    it('기본 범위를 조정한다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10,
        yp: 20,
        width: 30,
        height: 40,
      });
      expect(result.xsp).toBe(10);
      expect(result.xep).toBe(40);
      expect(result.ysp).toBe(20);
      expect(result.yep).toBe(60);
    });

    it('음수 width/height는 0으로 조정된다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10,
        yp: 20,
        width: -5,
        height: -10,
      });
      expect(result.xep).toBeGreaterThanOrEqual(result.xsp);
      expect(result.yep).toBeGreaterThanOrEqual(result.ysp);
    });

    it('소수점 값의 부동소수점 오차를 보정한다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10.123,
        yp: 20.456,
        width: 5.789,
        height: 3.012,
      });
      // xsp는 floor, xep는 ceil 처리
      expect(result.xsp).toBeLessThanOrEqual(10.123);
      expect(result.xep).toBeGreaterThanOrEqual(10.123 + 5.789);
    });
  });

  describe('getFilteredLabel', () => {
    it('count가 일치하면 labels을 그대로 반환한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3, 4, 5];
      expect(hm.getFilteredLabel(labels, 5, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('count가 다르면 min/max 범위로 필터링한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3, 4, 5];
      expect(hm.getFilteredLabel(labels, 10, 2, 4)).toEqual([2, 3, 4]);
    });

    it('범위에 맞는 레이블이 없으면 빈 배열을 반환한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3];
      expect(hm.getFilteredLabel(labels, 10, 10, 20)).toEqual([]);
    });
  });

  describe('findGraphData null 데이터 안전 fall-through (회귀 가드)', () => {
    // 셀 박스 비교 `x <= xp && xp <= x+w` 는 null 좌표에서 NaN 비교로 false fall-through.
    it('null 좌표 셀은 hit=false 로 fall-through 한다', () => {
      const hm = createHeatMap({
        data: [{ xp: null, yp: null, w: null, h: null, value: null }],
      });
      const item = hm.findGraphData([40, 10]);
      expect(item.hit).toBe(false);
      expect(item.data).toBe(null);
    });

    it('정상 셀 내부 클릭은 hit=true (회귀 가드)', () => {
      const hm = createHeatMap({
        data: [{ xp: 30, yp: 0, w: 20, h: 20, value: 5, dataColor: '#abc' }],
      });
      const item = hm.findGraphData([40, 10]);
      expect(item.hit).toBe(true);
      expect(item.index).toBe(0);
    });
  });
});

/**
 * heatMap overlay 분리 회귀 가드 — 래스터(draw, worker 후보)와 highlight overlay(drawOverlay, main)
 * 분리(Step 3 rendercore-series-raster).
 *
 *  1) draw(래스터)는 overlayCtx를 만지지 않는다 — getItemInfo가 isHighlight를 줘도 itemHighlight를
 *     호출하지 않는다(=overlay가 worker 후보 raster에 섞이지 않는다).
 *  2) drawOverlay(main)는 show && isHighlight 항목만 전달된 overlayCtx로 highlight한다.
 *  3) overlayCtx가 없으면(brush) drawOverlay는 no-op.
 */
describe('element.heatMap overlay 분리 (draw 래스터 ↔ drawOverlay overlay)', () => {
  const noop = () => {};
  const makeCtx = () => ({
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    arc: noop,
    rect: noop,
    fillRect: noop,
    measureText: () => ({ width: 0 }),
    fillText: noop,
  });

  // 기하/색 결정 로직은 stub으로 고정해 overlay 라우팅만 검증한다.
  const makeHeatMap = () => {
    const hm = Object.create(HeatMap.prototype);
    Object.assign(hm, {
      show: true,
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: [{ x: 0, y: 0, o: 50 }],
      size: { w: 0, h: 0 },
      stroke: { show: false, lineWidth: 0 },
      showValue: { use: false },
      computeGeometry: noop,
      calculateXY: () => 10,
      getItemInfo: () => ({
        show: true,
        opacity: 1,
        dataColor: 'rgb(1,2,3)',
        id: 'color#0',
        isHighlight: true,
      }),
      drawItem: noop,
      drawValueLabels: noop,
    });

    const highlightCtxList = [];
    hm.itemHighlight = (_item, ctx) => highlightCtxList.push(ctx);

    return { hm, highlightCtxList };
  };

  const baseParam = (extra) => ({
    chartRect: { x1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: {
      x: [{ oriSteps: 1, graphMin: 0, graphMax: 1 }],
      y: [{ oriSteps: 1, graphMin: 0, graphMax: 1 }],
    },
    selectItem: { option: {}, selected: {} },
    selectLabel: { option: {}, selected: {} },
    ...extra,
  });

  it('draw(래스터)는 isHighlight여도 itemHighlight(overlay)를 호출하지 않는다', () => {
    const { hm, highlightCtxList } = makeHeatMap();
    hm.draw(baseParam({ ctx: makeCtx() }));
    expect(highlightCtxList).toHaveLength(0);
  });

  it('drawOverlay(main)는 show && isHighlight 항목을 전달된 overlayCtx로 highlight한다', () => {
    const { hm, highlightCtxList } = makeHeatMap();
    const overlayCtx = makeCtx();
    hm.drawOverlay(baseParam({ overlayCtx }));
    expect(highlightCtxList).toEqual([overlayCtx]);
  });

  it('drawOverlay는 overlayCtx가 없으면(brush) no-op', () => {
    const { hm, highlightCtxList } = makeHeatMap();
    hm.drawOverlay(baseParam({ overlayCtx: undefined }));
    expect(highlightCtxList).toHaveLength(0);
  });

  it('drawOverlay는 isHighlight=false면 highlight하지 않는다', () => {
    const { hm, highlightCtxList } = makeHeatMap();
    hm.getItemInfo = () => ({ show: true, isHighlight: false });
    hm.drawOverlay(baseParam({ overlayCtx: makeCtx() }));
    expect(highlightCtxList).toHaveLength(0);
  });
});
