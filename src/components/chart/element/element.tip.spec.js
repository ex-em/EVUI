import { describe, it, expect, vi } from 'vitest';
import modules from './element.tip';
import storeModules from '../model/model.store';

const createCtx = ({ lastTip = { pos: null, value: null, label: null }, displayOverflow = false } = {}) =>
  Object.assign(Object.create(modules), {
    options: { horizontal: false, displayOverflow },
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

describe('element.tip calculateTipInfo — displayOverflow 값축 초과 가드', () => {
  // 값(maxY)이 Y graphMax 를 초과하면 displayOverflow 여부에 따라 tip 표시가 갈린다.
  // displayOverflow=false → 포인트가 숨겨지므로 maxTip/sel tip 도 숨김(false 반환).
  // displayOverflow=true → 경계에 표시되므로 tip 도 표시.
  const overflowSeries = () =>
    buildSeries({ minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 150 } });

  it('값(maxY)>graphMax + displayOverflow=false → max tip false(숨김)', () => {
    const ctx = createCtx({ displayOverflow: false });
    expect(ctx.calculateTipInfo(overflowSeries(), 'max', null)).toBe(false);
  });

  it('값>graphMax + displayOverflow=true → tip 표시(객체, dp non-null)', () => {
    const ctx = createCtx({ displayOverflow: true });
    const result = ctx.calculateTipInfo(overflowSeries(), 'max', null);
    expect(result).not.toBe(false);
    expect(result.dp).not.toBe(null);
  });

  it('sel: 값>graphMax + displayOverflow=false → false(hover tip 숨김)', () => {
    const ctx = createCtx({ displayOverflow: false });
    const result = ctx.calculateTipInfo(overflowSeries(), 'sel', {
      label: 5, value: 150, useStack: false, dataIndex: 0,
    });
    expect(result).toBe(false);
  });

  it('값이 range 안이면 displayOverflow=false 라도 정상 tip', () => {
    const ctx = createCtx({ displayOverflow: false });
    const series = buildSeries({ minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 80 } });
    const result = ctx.calculateTipInfo(series, 'max', null);
    expect(result).not.toBe(false);
  });
});

// ────────────────────────────────────────────────
// calculateTipInfo — max 분기 + 가시 윈도우 override
//
// axis range로 가시 인덱스 윈도우가 좁혀지면 drawTips가 미리 계산한
// { sId, value, index, domain }을 hitInfo로 넘긴다. calculateTipInfo는 이 override를
// series.minMax(전역 캐시) 대신 사용해 윈도우 안의 max로 maxTip을 표시한다.
// bar는 index로, line/scatter는 domain(도메인 값)으로 위치를 잡는다.
// ────────────────────────────────────────────────
describe('element.tip calculateTipInfo — max 분기 가시 윈도우 override', () => {
  // maxY 는 ctx 의 graphMax(100) 안이어야 displayOverflow 가드에 안 걸려 전역 폴백 value 가
  // 관측된다(값이 graphMax 를 넘으면 가드가 false 를 반환해 무엇을 폴백했는지 가려진다).
  const buildBarSeries = () => ({
    type: 'bar',
    size: { w: 10, h: 0, cat: 20, cPad: 0, bar: 10, ix: 0, bPad: 0 },
    xAxisIndex: 0,
    yAxisIndex: 0,
    minMax: { maxDomain: 9, maxDomainIndex: 9, maxX: 10, maxY: 99 },
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
    expect(result.value).toBe(99); // series.minMax.maxY
  });

  it('hitInfo.index가 비유한이면 override를 무시하고 전역 캐시 폴백', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', {
      sId: 'b', value: 60, index: NaN,
    });
    expect(result.value).toBe(99);
  });

  it('hitInfo.value가 비유한이면 override를 무시하고 전역 캐시 폴백', () => {
    const ctx = createCtx();
    const result = ctx.calculateTipInfo(buildBarSeries(), 'max', {
      sId: 'b', value: null, index: 3,
    });
    expect(result.value).toBe(99);
  });

  // line/scatter는 인덱스가 아니라 domain(도메인 값)으로 위치를 잡는다.
  // override의 domain=2 → dp=ceil(100/10*2)=20. (index=3이면 30, 전역 maxDomain=5면 50)
  it('line override는 index가 아니라 domain으로 위치를 잡는다', () => {
    const ctx = createCtx();
    const series = buildSeries({
      type: 'line',
      minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 100 },
    });
    const result = ctx.calculateTipInfo(series, 'max', {
      sId: 'b', value: 60, index: 3, domain: 2,
    });
    expect(result.value).toBe(60);
    expect(result.dp).toBe(20);
  });

  // line override의 domain이 비유한이면 override를 무시하고 전역 캐시(maxDomain=5 → dp=50)로 폴백.
  it('line override의 domain이 비유한이면 전역 캐시 폴백', () => {
    const ctx = createCtx();
    const series = buildSeries({
      type: 'line',
      minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 100 },
    });
    const result = ctx.calculateTipInfo(series, 'max', {
      sId: 'b', value: 60, index: 3, domain: NaN,
    });
    expect(result.value).toBe(100);
    expect(result.dp).toBe(50);
  });

  // value가 0인 경우도 정상 값이다. 가드를 `if (value)`처럼 바꾸면 0을 "값이 없다"로
  // 잘못 보고 전역 캐시로 빠지게 되는데, 그렇게 되지 않도록 막아두는 테스트.
  it('override value가 0이어도 전역 폴백하지 않고 0을 그대로 쓴다', () => {
    const ctx = createCtx();
    const series = buildSeries({
      type: 'line',
      minMax: { maxDomain: 5, maxDomainIndex: 0, maxX: 10, maxY: 100 },
    });
    const result = ctx.calculateTipInfo(series, 'max', {
      sId: 'b', value: 0, index: 3, domain: 2,
    });
    expect(result.value).toBe(0); // 전역 maxY(100)로 폴백하면 안 됨
    expect(result.dp).toBe(20); // domain=2 기반 → 전역 maxDomain=5(dp=50)가 아님
  });
});

// ────────────────────────────────────────────────
// drawTips — window 판정 → 헬퍼 호출 → override 전달 통합
//
// 헬퍼/calculateTipInfo의 격리 테스트만으로는 drawTips의 실제 배선(어떤 조건에서
// getVisibleWindowMaxSeries를 호출하고 그 결과를 어떻게 넘기는지)을 검증하지 못한다.
// 예컨대 windowMax를 null로 되돌리는 회귀(=원래 버그 복원)도 격리 테스트는 전부 통과한다.
// 여기서는 drawTextTip 스파이로 "어떤 시리즈/값으로 maxTip이 그려지는가"를 고정한다.
// ────────────────────────────────────────────────
describe('element.tip drawTips — 가시 윈도우 통합', () => {
  const lineSeries = (sId, ys, minMax) => ({
    sId, type: 'line', show: true,
    data: ys.map((y, i) => ({ x: i, y })),
    size: { comboOffset: 0 },
    xAxisIndex: 0, yAxisIndex: 0,
    minMax,
  });
  const barSeries = (sId, ys, minMax) => ({
    sId, type: 'bar', show: true,
    data: ys.map((y, i) => ({ x: i, y })),
    size: { w: 10, h: 0, cat: 20, cPad: 0, bar: 10, ix: 0, bPad: 0 },
    xAxisIndex: 0, yAxisIndex: 0,
    minMax,
  });
  // horizontal bar: 값 축이 X라 p.x=값, p.y=카테고리 인덱스.
  const hBarSeries = (sId, values, minMax) => ({
    sId, type: 'bar', show: true,
    data: values.map((x, i) => ({ x, y: i })),
    size: { w: 0, h: 10, cat: 20, cPad: 0, bar: 10, ix: 0, bPad: 0 },
    xAxisIndex: 0, yAxisIndex: 0,
    minMax,
  });

  const createDrawCtx = ({ seriesList, windowAxis, globalMaxSID, horizontal = false, labelCount }) => {
    const drawTextTip = vi.fn();
    const valueAxis = { graphMin: 0, graphMax: 100 };
    // labelCount가 주어지면 라벨 축에 labels를 달아 "전체를 덮는 윈도우" 판정을 가능케 한다.
    const labelAxis = Number.isFinite(labelCount)
      ? { labels: Array.from({ length: labelCount }, (_, i) => i) }
      : undefined;
    // 실제 헬퍼를 붙이되 스파이로 감싸 "full window에서 재스캔을 건너뛰는지"까지 검증한다.
    const getVisibleWindowMaxSeries = vi.fn(storeModules.getVisibleWindowMaxSeries);
    const ctx = Object.assign(Object.create(modules), {
      options: {
        horizontal,
        displayOverflow: false,
        type: 'line',
        tooltip: {},
        maxTip: { use: true, showIndicator: false, tipStyle: { height: 20 } },
        selectItem: { use: false },
        selectLabel: { use: false },
      },
      seriesList,
      // 윈도잉(카테고리) 축은 vertical=X, horizontal=Y. 값 축은 반대편.
      axesSteps: {
        x: [horizontal ? valueAxis : windowAxis],
        y: [horizontal ? windowAxis : valueAxis],
      },
      // 라벨 축: vertical=X, horizontal=Y. drawTips가 labels.length로 full window를 판정.
      axesX: [horizontal ? undefined : labelAxis],
      axesY: [horizontal ? labelAxis : undefined],
      minMax: { x: [{ maxSID: globalMaxSID }], y: [{ maxSID: globalMaxSID }] },
      chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      lastTip: { pos: null, value: null, label: null },
      scrollbar: { x: {}, y: {} },
      getVisibleWindowMaxSeries,
      drawTextTip,
      drawFixedIndicator: vi.fn(),
    });
    return { ctx, drawTextTip, getVisibleWindowMaxSeries };
  };

  it('window 활성: 전역 max가 bar여도 윈도우 max인 line 시리즈/값으로 maxTip을 그린다', () => {
    // 윈도우 [1,3]: bar max=50(idx2), line max=80(idx1) → 윈도우 전체 max=80(line).
    // 전역 maxSID는 bar1이지만 윈도우 판정이 우선해야 한다(combo 회귀 가드).
    const { ctx, drawTextTip } = createDrawCtx({
      seriesList: {
        bar1: barSeries('bar1', [10, 20, 50, 30, 40],
          { maxDomain: 2, maxDomainIndex: 2, maxX: 4, maxY: 50 }),
        line1: lineSeries('line1', [5, 80, 60, 70, 15],
          { maxDomain: 1, maxDomainIndex: 1, maxX: 4, maxY: 80 }),
      },
      windowAxis: { graphMin: 0, graphMax: 4, minIndex: 1, maxIndex: 3 },
      globalMaxSID: 'bar1',
    });

    ctx.drawTips([]);

    expect(drawTextTip).toHaveBeenCalledTimes(1);
    const arg = drawTextTip.mock.calls[0][0];
    expect(arg.tipType).toBe('max');
    expect(arg.seriesOpt.sId).toBe('line1');
    expect(arg.value).toBe(80);
    expect(arg.dp).not.toBe(null);
  });

  it('빈 윈도우(maxIndex < minIndex): 윈도우 밖 전역 max를 그리지 않는다', () => {
    // range가 데이터 밖이라 scale이 maxIndex=-1 반환. 보이는 데이터가 없으므로 maxTip 미표시.
    // 기존 hasWindow 폴백이면 전역 max를 그려버린다 → RED.
    const { ctx, drawTextTip } = createDrawCtx({
      seriesList: {
        g: lineSeries('g', [10, 20, 50, 30, 40],
          { maxDomain: 2, maxDomainIndex: 2, maxX: 4, maxY: 50 }),
      },
      windowAxis: { graphMin: 0, graphMax: 4, minIndex: 0, maxIndex: -1 },
      globalMaxSID: 'g',
    });

    ctx.drawTips([]);

    expect(drawTextTip).not.toHaveBeenCalled();
  });

  it('비윈도잉 축(minIndex/maxIndex 없음): 전역 max로 maxTip을 그린다', () => {
    // linear/time 등은 윈도잉이 없으므로 전역 maxSID 경로를 그대로 타야 한다.
    const { ctx, drawTextTip } = createDrawCtx({
      seriesList: {
        g: lineSeries('g', [10, 20, 50, 30, 40],
          { maxDomain: 2, maxDomainIndex: 2, maxX: 4, maxY: 50 }),
      },
      windowAxis: { graphMin: 0, graphMax: 4 },
      globalMaxSID: 'g',
    });

    ctx.drawTips([]);

    expect(drawTextTip).toHaveBeenCalledTimes(1);
    const arg = drawTextTip.mock.calls[0][0];
    expect(arg.seriesOpt.sId).toBe('g');
    expect(arg.value).toBe(50);
  });

  it('horizontal: 윈도잉 축이 Y(axesSteps.y[0])이고 bar 좌표 보정 경로로 그린다', () => {
    // horizontal에서 drawTips는 axesSteps.y[0]에서 minIndex/maxIndex를 읽어야 한다.
    // 윈도우 [1,3]: 값(p.x) 20,80,30 → max=80(idx2). bar는 ldata -= minIndex 보정 후 위치.
    const { ctx, drawTextTip } = createDrawCtx({
      seriesList: {
        b: hBarSeries('b', [10, 20, 80, 30, 40],
          { maxDomain: 2, maxDomainIndex: 2, maxX: 80, maxY: 4 }),
      },
      windowAxis: { graphMin: 0, graphMax: 4, minIndex: 1, maxIndex: 3 },
      globalMaxSID: 'b',
      horizontal: true,
    });

    ctx.drawTips([]);

    expect(drawTextTip).toHaveBeenCalledTimes(1);
    const arg = drawTextTip.mock.calls[0][0];
    expect(arg.seriesOpt.sId).toBe('b');
    expect(arg.value).toBe(80);
    expect(arg.dp).not.toBe(null);
  });

  it('full window(range 미적용): 재스캔을 건너뛰고 전역 maxSID 캐시로 그린다', () => {
    // step/time-category 축은 range가 없어도 minIndex=0, maxIndex=last를 항상 세팅한다.
    // 윈도우가 전체(labels 5개 → [0,4])를 덮으면 전역 캐시면 충분하므로
    // getVisibleWindowMaxSeries(O(시리즈×포인트) 재스캔)를 호출하지 않아야 한다(perf 회귀 가드).
    const { ctx, drawTextTip, getVisibleWindowMaxSeries } = createDrawCtx({
      seriesList: {
        g: lineSeries('g', [10, 20, 50, 30, 40],
          { maxDomain: 2, maxDomainIndex: 2, maxX: 4, maxY: 50 }),
      },
      windowAxis: { graphMin: 0, graphMax: 4, minIndex: 0, maxIndex: 4 },
      globalMaxSID: 'g',
      labelCount: 5,
    });

    ctx.drawTips([]);

    expect(getVisibleWindowMaxSeries).not.toHaveBeenCalled();
    expect(drawTextTip).toHaveBeenCalledTimes(1);
    const arg = drawTextTip.mock.calls[0][0];
    expect(arg.seriesOpt.sId).toBe('g');
    expect(arg.value).toBe(50);
  });
});
