import { describe, it, expect } from 'vitest';
import modules from './model.series';

/**
 * reconcileSeriesSet 회귀 가드.
 * updateSeries 시 series 인스턴스를 통째로 재생성하지 않고 변경분만 add/recreate, 나머지는 재사용한다.
 * - 그대로인 series: 인스턴스 참조 유지(.data 풀 + geometry 메모이즈 보존)
 * - 추가/삭제/opt변경/type변경: 해당 항목만 신규 생성
 * - index(순서) 변경: 재사용(색 명시 series 는 출력 불변)
 * - resolved 순서 보존, group/stack 메타 reset, show fresh 리셋
 */
describe('reconcileSeriesSet — series 증분 재조정', () => {
  const makeCtx = () => ({
    ...modules,
    options: {
      overlapping: { use: false },
      realTimeScatter: { use: false },
      legend: { type: 'plain' },
      horizontal: false,
    },
    seriesInfo: { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] }, count: 0 },
    seriesList: {},
  });

  // update() 의 updateSeries 블록을 흉내: prev 보관 → seriesInfo.charts 새로 → reconcile.
  const reconcile = (ctx, series, groups = []) => {
    const prev = ctx.seriesList;
    ctx.seriesInfo = { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] }, count: 0 };
    ctx.reconcileSeriesSet(series, 'line', false, groups, prev);
    return ctx.seriesList;
  };

  // 같은 내용의 새 series 객체(매 갱신 새 props 참조를 흉내).
  const mkSeries = (defs) => {
    const out = {};
    Object.keys(defs).forEach((id) => {
      out[id] = { ...defs[id] };
    });
    return out;
  };

  const defs = {
    s1: { name: 's1', color: '#111' },
    s2: { name: 's2', color: '#222' },
    s3: { name: 's3', color: '#333' },
  };

  it('같은 집합을 다시 reconcile 하면 모든 인스턴스를 재사용한다(참조 동일)', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    const first = { ...ctx.seriesList };

    reconcile(ctx, mkSeries(defs)); // 같은 내용, 새 객체
    expect(ctx.seriesList.s1).toBe(first.s1);
    expect(ctx.seriesList.s2).toBe(first.s2);
    expect(ctx.seriesList.s3).toBe(first.s3);
  });

  it('1개 추가 / 1개 삭제: 공통은 재사용, 추가분만 신규, 삭제분 제외', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    const first = { ...ctx.seriesList };

    // s2 삭제 + s4 추가
    const next = mkSeries({ s1: defs.s1, s3: defs.s3, s4: { name: 's4', color: '#444' } });
    reconcile(ctx, next);

    expect(ctx.seriesList.s1).toBe(first.s1); // 재사용
    expect(ctx.seriesList.s3).toBe(first.s3); // 재사용
    expect(ctx.seriesList.s2).toBeUndefined(); // 삭제
    expect(ctx.seriesList.s4).toBeDefined(); // 신규
    expect(ctx.seriesList.s4).not.toBe(first.s2);
  });

  it('index(순서)만 바뀌면 색 명시 series 는 재사용한다', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    const first = { ...ctx.seriesList };

    // 순서를 뒤집어 입력(앞에 신규를 넣어 index 를 민다)
    const next = mkSeries({
      s0: { name: 's0', color: '#000' },
      s1: defs.s1,
      s2: defs.s2,
      s3: defs.s3,
    });
    reconcile(ctx, next);

    expect(ctx.seriesList.s1).toBe(first.s1);
    expect(ctx.seriesList.s2).toBe(first.s2);
    expect(ctx.seriesList.s3).toBe(first.s3);
  });

  it('opt 메타가 바뀐 series 만 recreate 한다(나머지는 재사용)', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    const first = { ...ctx.seriesList };

    const next = mkSeries({ ...defs, s2: { name: 's2', color: '#999' } }); // s2 색 변경
    reconcile(ctx, next);

    expect(ctx.seriesList.s1).toBe(first.s1);
    expect(ctx.seriesList.s3).toBe(first.s3);
    expect(ctx.seriesList.s2).not.toBe(first.s2); // recreate
    expect(ctx.seriesList.s2.color).toBe('#999');
  });

  it('type 이 바뀌면 recreate 한다', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries({ s1: defs.s1 }));
    const firstS1 = ctx.seriesList.s1;
    expect(firstS1.type).toBe('line');

    reconcile(ctx, mkSeries({ s1: { name: 's1', color: '#111', type: 'bar' } }));
    expect(ctx.seriesList.s1).not.toBe(firstS1);
    expect(ctx.seriesList.s1.type).toBe('bar');
  });

  it('seriesInfo.charts 와 seriesList 가 resolved 순서를 보존한다', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    const next = mkSeries({ s3: defs.s3, s1: defs.s1, s2: defs.s2 }); // 입력 순서 변경
    reconcile(ctx, next);

    expect(Object.keys(ctx.seriesList)).toEqual(['s3', 's1', 's2']);
    expect(ctx.seriesInfo.charts.line).toEqual(['s3', 's1', 's2']);
  });

  it('재사용 인스턴스의 stale group/stack 메타를 reset 한다', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    // 이전 갱신에서 그룹에 속해 stack 메타가 박혔다고 가정
    Object.assign(ctx.seriesList.s1, {
      isExistGrp: true,
      stackIndex: 2,
      groupIndex: 0,
      bsId: 's0',
      bsIds: ['s0'],
      isOverlapping: true,
    });

    reconcile(ctx, mkSeries(defs), []); // groups 없이 재조정 → reset 돼야 함
    expect(ctx.seriesList.s1.isExistGrp).toBe(false);
    expect(ctx.seriesList.s1.stackIndex).toBe(0);
    expect(ctx.seriesList.s1.groupIndex).toBe(null);
    expect(ctx.seriesList.s1.bsId).toBe(null);
    expect(ctx.seriesList.s1.bsIds).toEqual([]);
    expect(ctx.seriesList.s1.isOverlapping).toBe(false);
  });

  it('재사용 시 show 를 생성 당시 fresh 값으로 리셋한다(범례 토글 폐기 — 현 동작 유지)', () => {
    const ctx = makeCtx();
    reconcile(ctx, mkSeries(defs));
    ctx.seriesList.s1.show = false; // 범례 토글로 끔

    reconcile(ctx, mkSeries(defs));
    expect(ctx.seriesList.s1.show).toBe(true); // opt.show(기본 true) 로 리셋
  });
});

/**
 * realTimeScatter 만료(prune) 후 부활 경로 가드.
 * reconcileSeriesSet 이 재추가 방지 가드(prunedRealTimeScatterSeries)의 단일 해제 지점이다:
 *  - 신규 점이 들어온 pruned 키 → 가드에서 빼고 일반 경로로 재생성(부활)
 *  - 신규 점이 없는 pruned 키 → data.series 에 키가 남아 있어도 재생성 대상에서 제외(비부활)
 */
describe('reconcileSeriesSet — realTimeScatter 만료 series 부활 가드 해제', () => {
  const makeCtx = () => ({
    ...modules,
    options: {
      overlapping: { use: false },
      realTimeScatter: { use: true },
      legend: { type: 'plain' },
      horizontal: false,
    },
    seriesInfo: { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] }, count: 0 },
    seriesList: {},
  });

  const reconcile = (ctx, series) => {
    const prev = ctx.seriesList;
    ctx.seriesInfo = { charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] }, count: 0 };
    ctx.reconcileSeriesSet(series, 'line', false, [], prev);
    return ctx.seriesList;
  };

  const series = {
    active: { name: 'active', color: '#a11' },
    dead: { name: 'dead', color: '#11a' },
  };

  it('신규 점이 들어온 pruned 키는 가드에서 빠지고 seriesList 에 부활한다', () => {
    const ctx = makeCtx();
    ctx.prunedRealTimeScatterSeries = new Set(['dead']);
    ctx.data = { data: { active: [{ x: 1, y: 1 }], dead: [{ x: 2, y: 2 }] } };

    reconcile(ctx, series);

    expect(ctx.prunedRealTimeScatterSeries.has('dead')).toBe(false); // 가드 해제(부활)
    expect(ctx.seriesList.dead).toBeDefined();
    expect(ctx.seriesList.active).toBeDefined();
  });

  it('신규 점이 없는 pruned 키는 가드에 남고 seriesList 에서 제외된다(비부활)', () => {
    const ctx = makeCtx();
    ctx.prunedRealTimeScatterSeries = new Set(['dead']);
    ctx.data = { data: { active: [{ x: 1, y: 1 }], dead: [] } };

    reconcile(ctx, series);

    expect(ctx.prunedRealTimeScatterSeries.has('dead')).toBe(true); // 가드 유지
    expect(ctx.seriesList.dead).toBeUndefined(); // 재생성 제외
    expect(ctx.seriesList.active).toBeDefined();
  });

  // 회귀: 부활 판정이 length 기준이면 y=null 축 패딩만 오는 소비자에서 prune 직후 매 틱 되살아나
  // 범례가 깜빡인다. 만료 판정과 같은 "값 있는 점" 기준을 써야 한다.
  it('y=null 경계 패딩만 오는 pruned 키는 부활하지 않는다', () => {
    const ctx = makeCtx();
    ctx.prunedRealTimeScatterSeries = new Set(['dead']);
    ctx.data = { data: { active: [{ x: 1, y: 1 }], dead: [{ x: 2, y: null }] } };

    reconcile(ctx, series);

    expect(ctx.prunedRealTimeScatterSeries.has('dead')).toBe(true);
    expect(ctx.seriesList.dead).toBeUndefined();
  });
});
