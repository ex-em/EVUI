import { describe, it, expect, vi } from 'vitest';
import EvChart from './chart.core';

/**
 * scatter dedupe 비용 최적화 회귀 테스트.
 * - canSkipRealtimeScatterDedupe: 단일 realtime series 스킵 판정 (정지 모드 회귀 방지)
 * - collectDuplicatePoints: push 단계에서 캐시한 item.k 재사용 (없으면 폴백)
 * canvas/DOM 없이 prototype 메서드만 stub this 로 테스트한다.
 */
const createCore = ({ options = {}, seriesList = {} }) => {
  const core = Object.create(EvChart.prototype);
  core.options = options;
  core.seriesList = seriesList;
  return core;
};

describe('EvChart.canSkipRealtimeScatterDedupe', () => {
  it('realtime + 보이는 scatter series 1개면 스킵한다', () => {
    const core = createCore({
      options: { realTimeScatter: { use: true } },
      seriesList: { s0: { show: true } },
    });
    expect(core.canSkipRealtimeScatterDedupe(['s0'])).toBe(true);
  });

  it('realtime + 보이는 series 2개면 스킵하지 않는다 (cross-series dedupe 필요)', () => {
    const core = createCore({
      options: { realTimeScatter: { use: true } },
      seriesList: { s0: { show: true }, s1: { show: true } },
    });
    expect(core.canSkipRealtimeScatterDedupe(['s0', 's1'])).toBe(false);
  });

  it('숨겨진 series 는 카운트에서 제외한다 (1 보임 + 1 숨김 → 스킵)', () => {
    const core = createCore({
      options: { realTimeScatter: { use: true } },
      seriesList: { s0: { show: true }, s1: { show: false } },
    });
    expect(core.canSkipRealtimeScatterDedupe(['s0', 's1'])).toBe(true);
  });

  it('보이는 series 가 0개면 스킵하지 않는다', () => {
    const core = createCore({
      options: { realTimeScatter: { use: true } },
      seriesList: { s0: { show: false } },
    });
    expect(core.canSkipRealtimeScatterDedupe(['s0'])).toBe(false);
  });

  it('정지(non-realtime) 모드는 series 1개여도 스킵하지 않는다 (정지 dedupe 회귀 방지)', () => {
    const core = createCore({
      options: {},
      seriesList: { s0: { show: true } },
    });
    expect(core.canSkipRealtimeScatterDedupe(['s0'])).toBe(false);
  });
});

describe('EvChart.collectDuplicatePoints (캐시 키 재사용)', () => {
  const realtimeCore = (dataGroup) =>
    createCore({
      options: { realTimeScatter: { use: true } },
      seriesList: {
        s0: { show: true, sId: 's0', data: { s0: { dataGroup } } },
      },
    });

  it('item.k 가 있으면 좌표 재계산 없이 캐시 키를 duple 키로 쓴다', () => {
    const core = realtimeCore([{ data: [{ x: 1, y: 2, k: 'CACHED' }] }]);
    const duple = new Map();

    core.collectDuplicatePoints(duple, ['s0']);

    expect(duple.get('CACHED')).toBe('s0');
    expect(duple.has('1|2')).toBe(false);
  });

  it('item.k 가 없으면 coordinateKey(x,y) 로 폴백한다', () => {
    const core = realtimeCore([{ data: [{ x: 1, y: 2 }] }]);
    const duple = new Map();

    core.collectDuplicatePoints(duple, ['s0']);

    expect(duple.get('1|2')).toBe('s0');
  });
});

/**
 * drawSeries 게이트 → element 전달 합류점 통합 테스트.
 *
 * canSkipRealtimeScatterDedupe / collectDuplicatePoints / element.draw 가 각각 격리 검증되지만
 * "게이트 판정 결과(scatterDedupe)와 duple 을 scatter element 로 실제 넘기는 배선"은 어떤 테스트로도
 * 실행되지 않았다. 이 합류가 깨지면(예: ternary 를 raw coordinateDedupe 로 되돌림) 단일 series 경로에서
 * element 가 coordinateDedupe=true + 빈 duple 을 받아 owner 판정이 전부 탈락 → 예외 없이 빈 차트가 된다.
 * 데이터 손실/throw 가 없어 다른 단위 테스트는 GREEN 으로 남는 silent 회귀라 여기서 잠근다.
 *
 * element.draw 를 spy 로 가로채 element 가 실제로 받는 coordinateDedupe/duple 인자를 어설션한다.
 */
describe('EvChart.drawSeries (게이트 → element 배선)', () => {
  const createDrawCore = (seriesList) => {
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
      coordinateDedupe: true,
      realTimeScatter: { use: true },
      seriesReverse: false,
    };
    core.bufferCtx = {};
    core.overlayCtx = {};
    core.chartRect = {};
    core.labelOffset = {};
    core.axesSteps = {};
    core.defaultSelectInfo = null;
    core.defaultSelectItemInfo = null;
    core.lastHitInfo = null;
    core.seriesList = seriesList;
    core.seriesInfo = {
      charts: { bar: [], line: [], heatMap: [], pie: [], scatter: Object.keys(seriesList) },
    };
    return core;
  };

  const rtSeries = (sId, point, show = true) => ({
    sId,
    show,
    draw: vi.fn(),
    data: { [sId]: { dataGroup: [{ data: [point] }] } },
  });

  it('보이는 realtime series 1개: element 는 coordinateDedupe=false + 빈 duple 을 받는다 (전부 그림)', () => {
    const s0 = rtSeries('s0', { x: 1, y: 1, k: '1|1' });
    const core = createDrawCore({ s0 });

    core.drawSeries();

    expect(s0.draw).toHaveBeenCalledTimes(1);
    const arg = s0.draw.mock.calls[0][0];
    expect(arg.coordinateDedupe).toBe(false);
    expect(arg.duple.size).toBe(0);
  });

  it('보이는 realtime series 2개: element 는 coordinateDedupe=true + 채워진 duple 을 받는다 (cross-series owner 판정)', () => {
    const s0 = rtSeries('s0', { x: 1, y: 1, k: '1|1' });
    const s1 = rtSeries('s1', { x: 2, y: 2, k: '2|2' });
    const core = createDrawCore({ s0, s1 });

    core.drawSeries();

    expect(s0.draw).toHaveBeenCalledTimes(1);
    expect(s1.draw).toHaveBeenCalledTimes(1);

    const arg0 = s0.draw.mock.calls[0][0];
    expect(arg0.coordinateDedupe).toBe(true);
    expect(arg0.duple.size).toBe(2);
    expect(arg0.duple.get('1|1')).toBe('s0');
    expect(arg0.duple.get('2|2')).toBe('s1');

    // 두 scatter series 는 동일한 duple 인스턴스를 공유한다.
    expect(s1.draw.mock.calls[0][0].duple).toBe(arg0.duple);
  });

  it('보이는 series 1개 + 숨김 1개: 숨김은 카운트 제외 → coordinateDedupe=false (단일 series 스킵)', () => {
    const s0 = rtSeries('s0', { x: 1, y: 1, k: '1|1' });
    const s1 = rtSeries('s1', { x: 2, y: 2, k: '2|2' }, false);
    const core = createDrawCore({ s0, s1 });

    core.drawSeries();

    expect(s0.draw.mock.calls[0][0].coordinateDedupe).toBe(false);
  });
});
