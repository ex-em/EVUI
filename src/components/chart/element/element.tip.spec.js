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

describe('element.tip calculateTipInfo — axis range 밖 maxDomain', () => {
  // maxDomain 이 graphMax 를 초과하면 Canvas.calculateX 가 null 을 반환 → dp=null.
  // drawTips 의 호출부 가드(dp !== null) 가 빠지면 drawTextTip 이 null 을 0 으로 강제 변환해
  // maxTip 이 좌상단에 찍히는 회귀가 발생한다.
  it('maxDomain 이 graphMax 초과 → dp 는 null 로 반환된다', () => {
    const ctx = createCtx();
    const series = buildSeries({ minMax: { maxDomain: 9999, maxDomainIndex: 0, maxX: 10, maxY: 100 } });
    const result = ctx.calculateTipInfo(series, 'max', null);
    expect(result.dp).toBe(null);
  });

  it('maxDomain 이 graphMin 미만 → dp 는 null 로 반환된다', () => {
    const ctx = createCtx();
    const series = buildSeries({ minMax: { maxDomain: -1, maxDomainIndex: 0, maxX: 10, maxY: 100 } });
    const result = ctx.calculateTipInfo(series, 'max', null);
    expect(result.dp).toBe(null);
  });

  it('range 안 maxDomain 은 dp 가 valid 한 수치로 반환된다', () => {
    const ctx = createCtx();
    const series = buildSeries({ minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 100 } });
    const result = ctx.calculateTipInfo(series, 'max', null);
    expect(typeof result.dp).toBe('number');
    expect(result.dp).not.toBe(null);
  });
});
