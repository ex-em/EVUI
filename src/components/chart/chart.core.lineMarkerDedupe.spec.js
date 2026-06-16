import { describe, it, expect, vi } from 'vitest';
import EvChart from './chart.core';
import Line from './element/element.line';

/**
 * line 마커 cross-series 픽셀 dedupe 회귀 테스트.
 *
 * 배경: 200시리즈 × 50% 교차 null line 차트에서 모든 점이 isSingle 마커가 되어(point:false인데도)
 * offscreen buffer 에 ~수만 개의 원(arc) 을 fill 하는 비용이 commit drawImage 로 표면화됐다.
 * 마커가 불투명이라 같은 device-pixel 에 겹친 점은 화면상 1개만 보이므로, owner(그리는 순서상
 * 마지막 = 최상위 시리즈)만 그려도 출력이 불변이면서 마커 비용이 줄어든다.
 *
 * 검증:
 *  1) collectMarkerOwners: 같은 픽셀 owner = 최상위(나중 등록) 시리즈 (출력 불변의 핵심)
 *  2) draw: markerOwners 가 있으면 owner 아닌 마커는 skip, owner 는 픽셀당 1회만 그림
 *  3) drawSeriesLayer 배선: coordinateDedupe opt-in 시에만 line 에 공유 markerOwners 전달(기본 off 무회귀)
 */

// arc/fill 호출 수만 세는 mock canvas context (마커 1개 = arc 1회).
const makeCtx = () => {
  const noop = () => {};
  const ctx = {
    nArc: 0,
    nFill: 0,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    stroke: noop,
    setLineDash: noop,
    moveTo: noop,
    lineTo: noop,
    fillRect: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    arc() {
      ctx.nArc += 1;
    },
    fill() {
      ctx.nFill += 1;
    },
  };
  return ctx;
};

// 축 범위·차트 영역을 고정해 동일 raw → 동일 픽셀이 결정적으로 나오게 한다.
const baseParam = (ctx, extra = {}) => ({
  ctx,
  chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
  labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
  axesSteps: { x: [{ graphMin: 0, graphMax: 4 }], y: [{ graphMin: 0, graphMax: 100 }] },
  isBrush: false,
  ...extra,
});

// 가운데 점이 양옆 null 로 고립 → isSingle 마커. 같은 (x,y) 면 두 시리즈가 같은 픽셀에 겹친다.
const makeLine = (sId, data) => {
  const line = new Line(sId, {}, 0);
  line.data = data;
  line.xAxisIndex = 0;
  line.yAxisIndex = 0;
  line.interpolation = 'none';
  line.combo = false;
  line.isExistGrp = false;
  line.fill = false;
  line.point = false;
  line.show = true;
  line.color = '#000000';
  line.pointFill = '#000000';
  line.pointSize = 2;
  return line;
};

const singlePointData = () => [
  { x: 0, y: null, o: null },
  { x: 1, y: 20, o: 20 },
  { x: 2, y: null, o: null },
];

describe('element.line collectMarkerOwners (픽셀 owner = 최상위 시리즈)', () => {
  it('같은 픽셀에 겹친 두 시리즈는 나중에 등록한(=최상위) 시리즈가 owner 가 된다', () => {
    const owners = new Map();
    const s0 = makeLine('s0', singlePointData());
    const s1 = makeLine('s1', singlePointData());

    // 그리는 순서대로 등록 → Map.set 마지막-기록-승리.
    s0.collectMarkerOwners(baseParam(makeCtx()), owners);
    s1.collectMarkerOwners(baseParam(makeCtx()), owners);

    expect(owners.size).toBe(1);
    expect([...owners.values()][0]).toBe('s1');
  });

  it('isSingle 이 아닌 점(연결선 존재)은 owner 맵에 등록하지 않는다', () => {
    const owners = new Map();
    // 모든 점이 연속(non-null) → isSingle 아님, point:false → 마커 0개.
    const connected = makeLine('s0', [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 20, o: 20 },
      { x: 2, y: 30, o: 30 },
    ]);

    connected.collectMarkerOwners(baseParam(makeCtx()), owners);

    expect(owners.size).toBe(0);
  });
});

describe('element.line draw 마커 dedupe (owner 만, 픽셀당 1회)', () => {
  it('markerOwners 가 owner 아닌 시리즈의 마커를 skip 한다', () => {
    const owners = new Map();
    const s0 = makeLine('s0', singlePointData());
    const s1 = makeLine('s1', singlePointData());
    s0.collectMarkerOwners(baseParam(makeCtx()), owners);
    s1.collectMarkerOwners(baseParam(makeCtx()), owners); // owner = s1

    const ctx0 = makeCtx();
    s0.draw(baseParam(ctx0, { markerOwners: owners }));
    const ctx1 = makeCtx();
    s1.draw(baseParam(ctx1, { markerOwners: owners }));

    expect(ctx0.nArc).toBe(0); // owner 아님 → skip
    expect(ctx1.nArc).toBe(1); // owner → 그림
  });

  it('markerOwners 가 없으면(기본 off) 두 시리즈 모두 마커를 그린다 (무회귀)', () => {
    const s0 = makeLine('s0', singlePointData());
    const s1 = makeLine('s1', singlePointData());

    const ctx0 = makeCtx();
    s0.draw(baseParam(ctx0));
    const ctx1 = makeCtx();
    s1.draw(baseParam(ctx1));

    expect(ctx0.nArc).toBe(1);
    expect(ctx1.nArc).toBe(1);
  });

  it('한 시리즈 안에서 같은 픽셀에 겹친 마커는 owner 라도 1회만 그린다(drawnKeys)', () => {
    const owners = new Map();
    // 고립점 2개가 같은 (x,y) → 같은 픽셀.
    const data = [
      { x: 1, y: 20, o: 20 },
      { x: 0, y: null, o: null },
      { x: 1, y: 20, o: 20 },
    ];
    const s0 = makeLine('s0', data);
    s0.collectMarkerOwners(baseParam(makeCtx()), owners);

    const ctx = makeCtx();
    s0.draw(baseParam(ctx, { markerOwners: owners }));

    expect(ctx.nArc).toBe(1);
  });
});

/**
 * drawSeriesLayer → element 배선 테스트. coordinateDedupe opt-in 판정과 공유 markerOwners 전달이
 * 깨지면(예: 항상 null 전달, 또는 시리즈마다 다른 Map) dedupe 가 silent 하게 무력화/오작동한다.
 */
describe('EvChart.drawSeriesLayer (line markerOwners 배선)', () => {
  const createCore = (lineIds, options = {}) => {
    const core = Object.create(EvChart.prototype);
    core.options = {
      maxTip: { background: '#000', color: '#fff' },
      selectLabel: {},
      selectItem: { use: false },
      selectSeries: {},
      brush: null,
      displayOverflow: false,
      unSelectedOpacity: 0.3,
      horizontal: false,
      ...options,
    };
    core.bufferCtx = {};
    core.chartRect = {};
    core.labelOffset = {};
    core.axesSteps = {};
    core.defaultSelectInfo = null;
    core.defaultSelectItemInfo = null;
    core.lastHitInfo = null;
    core._dataEpoch = 1;
    core._scaleVersion = 1;
    const seriesList = {};
    lineIds.forEach((id) => {
      seriesList[id] = { sId: id, show: true, draw: vi.fn(), collectMarkerOwners: vi.fn() };
    });
    core.seriesList = seriesList;
    core.seriesInfo = {
      charts: { bar: [], line: lineIds, heatMap: [], pie: [], scatter: [] },
    };
    return core;
  };

  it('coordinateDedupe:true + line 2개: 공유 markerOwners(Map) 를 전달하고 사전 패스를 호출한다', () => {
    const core = createCore(['s0', 's1'], { coordinateDedupe: true });

    core.drawSeriesLayer(core.bufferCtx);

    const owners0 = core.seriesList.s0.draw.mock.calls[0][0].markerOwners;
    const owners1 = core.seriesList.s1.draw.mock.calls[0][0].markerOwners;
    expect(owners0).toBeInstanceOf(Map);
    expect(owners1).toBe(owners0); // 동일 인스턴스 공유
    // 그리기 전 사전 패스에서 owner 수집이 line 시리즈마다 1회씩 호출됐다.
    expect(core.seriesList.s0.collectMarkerOwners).toHaveBeenCalledTimes(1);
    expect(core.seriesList.s1.collectMarkerOwners).toHaveBeenCalledTimes(1);
    expect(core.seriesList.s0.collectMarkerOwners.mock.calls[0][1]).toBe(owners0);
  });

  it('coordinateDedupe 미설정(기본 off): markerOwners=null, 사전 패스 미호출 (무회귀)', () => {
    const core = createCore(['s0', 's1']);

    core.drawSeriesLayer(core.bufferCtx);

    expect(core.seriesList.s0.draw.mock.calls[0][0].markerOwners).toBe(null);
    expect(core.seriesList.s0.collectMarkerOwners).not.toHaveBeenCalled();
  });
});
