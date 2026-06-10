import { describe, it, expect } from 'vitest';
import EvChart from './chart.core';

/**
 * realtime scatter blit fast-path 진입 게이트와 폴백 헬퍼 단위 테스트.
 * canvas/DOM 없이 prototype 메서드만 stub this 로 검증한다(축/기하 값을 직접 주입).
 *
 * 게이트 항목마다 fast→full 로 뒤집는 케이스를 1개씩 단언한다.
 * 특히 y 매핑이 변하면(autoScale 로 maxValue 상승 등) 반드시 full 로 폴백해야 한다.
 */

// 모든 게이트를 통과하는 baseline this 를 만든다(각 테스트가 한 항목만 뒤집는다).
const makeCore = (overrides = {}) => {
  const core = Object.create(EvChart.prototype);

  core.isInit = true;
  core.updateSeries = false;
  core.pixelRatio = 1;
  core.legendHover = null;
  core.lastHitInfo = null;
  core.defaultSelectItemInfo = null;
  core.defaultSelectInfo = null;

  core.options = {
    realTimeScatter: { use: true },
    brush: false,
    selectItem: { use: false },
    selectSeries: { use: false },
    displayOverflow: false,
    coordinateDedupe: true,
  };

  core.scrollbar = { x: { use: false }, y: { use: false } };

  core.seriesInfo = { charts: { scatter: ['s0'] } };
  core.seriesList = { s0: { show: true, xAxisIndex: 0, yAxisIndex: 0 } };

  core.axesSteps = {
    x: [{ graphMin: 1000, graphMax: 61000 }], // width 60000
    y: [{ graphMin: 0, graphMax: 100 }],
  };
  core.chartRect = {
    x1: 10,
    x2: 590,
    y1: 10,
    y2: 390,
    chartWidth: 580,
    chartHeight: 380,
  };
  core.labelOffset = { left: 40, right: 4, top: 20, bottom: 20 };

  core.dataSet = {
    s0: { lastTick: { gapCount: 3, length: 60, endIndex: 59, maxDirtyAge: 1, toTime: 60000 } },
  };

  // 직전 스냅샷: x 는 3000ms 전진(width 동일), y/기하/디바이스/옵션 모두 동일 → 전 게이트 통과.
  core._blitPrev = {
    sId: 's0',
    graphMinX: -2000,
    graphMaxX: 58000, // width 60000 동일
    graphMinY: 0,
    graphMaxY: 100,
    xArea: 580 - (40 + 4), // 536
    labelOffsetLeft: 40,
    labelOffsetRight: 4,
    pixelRatio: 1,
    chartWidth: 580,
    chartHeight: 380,
    x1: 10,
    y2: 390,
    optionsRef: core.options,
  };

  return Object.assign(core, overrides);
};

describe('EvChart.evaluateBlitGate — 진입 게이트', () => {
  it('모든 조건 충족 시 ok=true (fast-path 진입)', () => {
    const gate = makeCore().evaluateBlitGate(undefined);
    expect(gate.ok, JSON.stringify(gate.parts)).toBe(true);
  });

  it('hitInfo 존재(click/legend hit 등) → modeOk=false → full', () => {
    const gate = makeCore().evaluateBlitGate({ legend: { sId: 's0' } });
    expect(gate.parts.modeOk).toBe(false);
    expect(gate.ok).toBe(false);
  });

  it('selectItem 활성 + 선택 dataIndex 존재 → selectionOk=false → full', () => {
    const core = makeCore();
    core.options.selectItem = { use: true };
    core.defaultSelectItemInfo = { dataIndex: 2 };
    expect(core.evaluateBlitGate(undefined).parts.selectionOk).toBe(false);
  });

  it('★ y 매핑 변경(autoScale maxValue ↑ 등) → yFixed=false → full', () => {
    const core = makeCore();
    core.axesSteps.y[0].graphMax = 200; // 직전 100 → 상승
    const gate = core.evaluateBlitGate(undefined);
    expect(gate.parts.yFixed).toBe(false);
    expect(gate.ok).toBe(false);
  });

  it('윈도우 폭 변경 → xWidthStable=false → full', () => {
    const core = makeCore();
    core.axesSteps.x[0].graphMax = 71000; // width 70000 (직전 60000)
    expect(core.evaluateBlitGate(undefined).parts.xWidthStable).toBe(false);
  });

  it('시간 역행/정지(shiftMs<=0) → xMonotonic=false → full', () => {
    const core = makeCore();
    core._blitPrev.graphMinX = 1000; // 현재와 동일 → shiftMs=0
    core._blitPrev.graphMaxX = 61000;
    expect(core.evaluateBlitGate(undefined).parts.xMonotonic).toBe(false);
  });

  it('pixelRatio 변경(레티나 이동 등) → deviceStable=false → full', () => {
    const core = makeCore();
    core.pixelRatio = 2;
    expect(core.evaluateBlitGate(undefined).parts.deviceStable).toBe(false);
  });

  it('옵션 참조 교체(Chart.vue options watcher) → optionsStable=false → full', () => {
    const core = makeCore();
    core.options = { ...core.options };
    expect(core.evaluateBlitGate(undefined).parts.optionsStable).toBe(false);
  });

  it('직전 스냅샷 없음(첫 프레임/resize 직후) → full', () => {
    const core = makeCore();
    core._blitPrev = null;
    expect(core.evaluateBlitGate(undefined).parts.hasPrev).toBe(false);
  });

  it('gapCount=0(시프트 없는 sub-second 틱) → gapOk=false → full', () => {
    const core = makeCore();
    core.dataSet.s0.lastTick.gapCount = 0;
    expect(core.evaluateBlitGate(undefined).parts.gapOk).toBe(false);
  });

  it('gapCount>=length(큰 점프/탭 복귀) → gapOk=false → full', () => {
    const core = makeCore();
    core.dataSet.s0.lastTick.gapCount = 60; // == length
    expect(core.evaluateBlitGate(undefined).parts.gapOk).toBe(false);
  });

  it('보이는 비-scatter series 존재(combo) → scatterOnly=false → full', () => {
    const core = makeCore();
    core.seriesInfo.charts.line = ['l0'];
    core.seriesList.l0 = { show: true };
    const gate = core.evaluateBlitGate(undefined);
    expect(gate.parts.scatterOnly).toBe(false);
    expect(gate.ok).toBe(false);
  });

  it('비-scatter series 가 숨김(show=false)이면 → scatterOnly=true', () => {
    const core = makeCore();
    core.seriesInfo.charts.line = ['l0'];
    core.seriesList.l0 = { show: false };
    expect(core.evaluateBlitGate(undefined).parts.scatterOnly).toBe(true);
  });
});

describe('EvChart.evaluateBlitGate — multi-series ring 정렬', () => {
  const make2 = (s1Tick) => {
    const core = makeCore();
    core.seriesInfo.charts.scatter = ['s0', 's1'];
    core.seriesList.s1 = { show: true, xAxisIndex: 0, yAxisIndex: 0 };
    core.dataSet.s1 = { lastTick: s1Tick };
    return core;
  };
  const ALIGNED = { gapCount: 3, length: 60, endIndex: 59, maxDirtyAge: 1, toTime: 60000 };

  it('두 series 의 ring 이 정렬되면 → ok=true (multi-series blit)', () => {
    const gate = make2({ ...ALIGNED }).evaluateBlitGate(undefined);
    expect(gate.parts.seriesAligned).toBe(true);
    expect(gate.ok).toBe(true);
  });

  it('series 별 데이터 도착이 어긋나면(toTime 불일치) → full', () => {
    const gate = make2({ ...ALIGNED, toTime: 57000 }).evaluateBlitGate(undefined);
    expect(gate.parts.seriesAligned).toBe(false);
    expect(gate.ok).toBe(false);
  });
});

describe('EvChart.maybeRebuildPointsLayer — 폴백 시 레이어 재구성 여부', () => {
  const makeRebuildCore = () => {
    const core = makeCore();
    core.bufferCanvas = { width: 580, height: 380 };
    core.dataSet.s0.lastTick.seq = 7;
    core.rebuildCalls = 0;
    core.rebuildPointsLayer = () => {
      core.rebuildCalls++;
      core.pointsLayerValid = true;
    };
    return core;
  };

  it('데이터·매핑·옵션 불변(legend hover 등) → 재구성 생략', () => {
    const core = makeRebuildCore();
    expect(core.maybeRebuildPointsLayer()).toBe(true); // 최초 1회는 재구성
    expect(core.maybeRebuildPointsLayer()).toBe(false); // 이후 동일 상태 → 생략
    expect(core.rebuildCalls).toBe(1);
  });

  it('데이터 틱(lastTick.seq 증가) → 재구성', () => {
    const core = makeRebuildCore();
    core.maybeRebuildPointsLayer();
    core.dataSet.s0.lastTick.seq = 8;
    expect(core.maybeRebuildPointsLayer()).toBe(true);
    expect(core.rebuildCalls).toBe(2);
  });
});

describe('EvChart.canRouteFallbackViaLayer — 폴백 렌더의 layer 합성 라우팅', () => {
  const makeRouteCore = () => {
    const core = makeCore();
    core.bufferCanvas = { width: 580, height: 380 };
    core.pointsLayerA = { width: 580, height: 380 };
    return core;
  };

  it('기본 외형 폴백(hitInfo 없음, selection 비활성, 전부 scatter) → 라우팅 가능', () => {
    expect(makeRouteCore().canRouteFallbackViaLayer(undefined)).toBe(true);
  });

  it('hitInfo 렌더(legend hover 진입 등)는 점 외형이 달라 직접 그린다', () => {
    expect(makeRouteCore().canRouteFallbackViaLayer({ legend: { sId: 's0' } })).toBe(false);
  });

  it('보이는 비-scatter series 존재(combo) → 직접 그린다', () => {
    const core = makeRouteCore();
    core.seriesInfo.charts.line = ['l0'];
    core.seriesList.l0 = { show: true };
    expect(core.canRouteFallbackViaLayer(undefined)).toBe(false);
  });
});

describe('EvChart.ensureHitCoordsFresh — blit 후 hit-test 좌표 지연 복구', () => {
  const makeHitCore = () => {
    const core = makeCore();
    core._hitCoordsDirty = true;
    core.refreshed = 0;
    core.seriesList.s0.refreshRtHitCoords = () => {
      core.refreshed++;
    };
    return core;
  };

  it('dirty 면 보이는 scatter series 좌표를 재계산하고 플래그를 내린다(이후 noop)', () => {
    const core = makeHitCore();
    core.ensureHitCoordsFresh();
    expect(core.refreshed).toBe(1);
    expect(core._hitCoordsDirty).toBe(false);
    core.ensureHitCoordsFresh();
    expect(core.refreshed).toBe(1);
  });
});
