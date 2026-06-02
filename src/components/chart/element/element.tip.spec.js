import { describe, it, expect } from 'vitest';
import modules from './element.tip';

const createCtx = ({ lastTip = { pos: null, value: null, label: null } } = {}) =>
  Object.assign(Object.create(modules), {
    options: { horizontal: false },
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 10 }], y: [{ graphMin: 0, graphMax: 100 }] },
    lastTip,
    scrollbar: { x: {}, y: {} },
  });

const buildSeries = (overrides = {}) => ({
  type: 'line',
  size: { comboOffset: 0 },
  xAxisIndex: 0,
  yAxisIndex: 0,
  minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 100 },
  ...overrides,
});

describe('element.tip calculateTipInfo — sel 분기 label 우선 동작', () => {
  it('hitInfo.value 가 valid → label/value 모두 hitInfo, lastTip 갱신', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildSeries(), 'sel', {
      label: 5, value: 50, useStack: false, dataIndex: 0,
    });

    expect(result.label).toBe(5);
    expect(result.value).toBe(50);
    expect(ctx.lastTip.label).toBe(5);
    expect(ctx.lastTip.value).toBe(50);
  });

  it('hitInfo.value=null + hitInfo.label valid + lastTip 비어있음 → label=hitInfo, value=default(maxY)', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildSeries(), 'sel', {
      label: 3, value: null, dataIndex: 3,
    });

    expect(result.label).toBe(3);
    expect(result.value).toBe(100); // series.minMax.maxY
  });

  it('(회귀 가드) hitInfo.value=null + hitInfo.label valid + lastTip.label 다른 값 → label=hitInfo, value=lastTip', () => {
    // 직전 클릭이 데이터 있는 라벨(idx=1, value=80)이고 현재 클릭이 null 라벨(idx=3).
    // 잘못된 fallback 으로 돌아가면 label=1 로 떨어진다 → RED.
    const ctx = createCtx({ lastTip: { pos: 1, value: 80, label: 1 } });
    const result = ctx.calculateTipInfo(buildSeries(), 'sel', {
      label: 3, value: null, dataIndex: 3,
    });

    expect(result.label).toBe(3);
    expect(result.value).toBe(80);
  });

  it('hitInfo.label=null + lastTip.label valid → lastTip 으로 fallback', () => {
    const ctx = createCtx({ lastTip: { pos: 2, value: 30, label: 2 } });
    const result = ctx.calculateTipInfo(buildSeries(), 'sel', {
      label: null, value: null,
    });

    expect(result.label).toBe(2);
    expect(result.value).toBe(30);
  });

  it('hitInfo.label=null + lastTip 도 모두 null → label=undefined, value=default', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildSeries(), 'sel', {
      label: null, value: null,
    });

    expect(result.label).toBeUndefined();
    expect(result.value).toBe(100);
  });

  it('bar 타입 + hitInfo → label/value 가 hitInfo 그대로 반영', () => {
    const ctx = createCtx();
    const series = buildSeries({
      type: 'bar',
      size: { w: 10, h: 0, cat: 20, cPad: 0, bar: 10, ix: 0, bPad: 0 },
    });
    const result = ctx.calculateTipInfo(series, 'sel', {
      label: 'A', value: 50, useStack: false, dataIndex: 2,
    });

    expect(result.label).toBe('A');
    expect(result.value).toBe(50);
  });
});

// ────────────────────────────────────────────────
// calculateTipInfo — max 분기 + 가시 윈도우 override
//
// axis range로 가시 인덱스 윈도우가 좁혀지면 drawTips가 미리 계산한
// { sId, value, index }를 hitInfo로 넘긴다. calculateTipInfo는 이 override를
// series.minMax(전역 캐시) 대신 사용해 윈도우 안의 max로 maxTip을 표시한다.
// ────────────────────────────────────────────────
describe('element.tip calculateTipInfo — max 분기 가시 윈도우 override', () => {
  const buildBarSeries = () => ({
    type: 'bar',
    size: { w: 10, h: 0, cat: 20, cPad: 0, bar: 10, ix: 0, bPad: 0 },
    xAxisIndex: 0,
    yAxisIndex: 0,
    minMax: { maxDomain: 9, maxDomainIndex: 9, maxX: 10, maxY: 999 },
  });

  it('hitInfo가 valid한 override면 value/ldata가 그 값으로 적용된다', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', {
      sId: 'b', value: 60, index: 3,
    });
    // ldata=3 → 윈도우 보정 없으므로 그대로 사용. value는 override의 60.
    expect(result.value).toBe(60);
  });

  it('hitInfo가 null이면 series.minMax(전역 캐시)를 그대로 쓴다', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', null);
    expect(result.value).toBe(999); // series.minMax.maxY
  });

  it('hitInfo.index가 비유한이면 override를 무시하고 전역 캐시 폴백', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', {
      sId: 'b', value: 60, index: NaN,
    });
    expect(result.value).toBe(999);
  });

  it('hitInfo.value가 비유한이면 override를 무시하고 전역 캐시 폴백', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', {
      sId: 'b', value: null, index: 3,
    });
    expect(result.value).toBe(999);
  });
});
