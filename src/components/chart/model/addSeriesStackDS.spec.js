import { describe, it, expect } from 'vitest';
import modules from './model.store';

/**
 * addSeriesStackDS 최적화(죽은 캐시 제거 + 점객체 풀 재사용) 회귀 가드.
 * 두 변경 모두 출력 불변(무손실)이어야 한다.
 */
describe('addSeriesStackDS — 죽은 캐시 제거 + 풀 재사용', () => {
  const makeCtx = () => ({
    options: { horizontal: false },
    seriesList: {},
    addData: modules.addData,
  });

  // 베이스(s0) + 그 위(s1) 2단 스택을 빌드한다.
  // createDataSet 와 동일하게 그룹 누적 top(stackTops)을 유지하며 base→top 순으로 빌드한다.
  const buildStack = (ctx, s0vals, s1vals, prev0, prev1) => {
    const labels = s0vals.map((_, i) => i);
    ctx.seriesList.s0 = ctx.seriesList.s0
      ?? { show: true, passingValue: null, isExistGrp: true, stackIndex: 0, data: [] };
    ctx.seriesList.s1 = ctx.seriesList.s1
      ?? { show: true, passingValue: null, isExistGrp: true, stackIndex: 1, data: [] };
    const tops = { pos: [], neg: [] };
    ctx.seriesList.s0.data = modules.addSeriesStackDS.call(ctx, s0vals, labels, 0, tops, prev0);
    modules.updateStackTops.call(ctx, tops, ctx.seriesList.s0);
    ctx.seriesList.s1.data = modules.addSeriesStackDS.call(ctx, s1vals, labels, 1, tops, prev1);
    modules.updateStackTops.call(ctx, tops, ctx.seriesList.s1);
    return { s0: ctx.seriesList.s0.data, s1: ctx.seriesList.s1.data };
  };

  it('스택 누적값(y=base+own, o=원본, b=base position)이 정확하다', () => {
    const ctx = makeCtx();
    const { s0, s1 } = buildStack(ctx, [10, 20], [5, 7]);
    // base
    expect(s0.map((d) => d.y)).toEqual([10, 20]);
    expect(s0.map((d) => d.b)).toEqual([0, 0]);
    // 위 시리즈: y = base.y + own, o = own, b = base.y
    expect(s1.map((d) => d.o)).toEqual([5, 7]);
    expect(s1.map((d) => d.y)).toEqual([15, 27]);
    expect(s1.map((d) => d.b)).toEqual([10, 20]);
  });

  it('prevData 를 주면 점객체를 재사용한다(같은 참조) + 값은 새 데이터로 갱신', () => {
    const ctx = makeCtx();
    const first = buildStack(ctx, [10, 20], [5, 7]);
    const prev0 = first.s0;
    const prev1 = first.s1;
    const ref0 = prev0[0];
    const ref1 = prev1[1];

    const second = buildStack(ctx, [1, 2], [3, 4], prev0, prev1);
    // 같은 객체 재사용
    expect(second.s0[0]).toBe(ref0);
    expect(second.s1[1]).toBe(ref1);
    // 값은 갱신: s1 y = base(1,2)+(3,4) = (4,6)
    expect(second.s0.map((d) => d.y)).toEqual([1, 2]);
    expect(second.s1.map((d) => d.y)).toEqual([4, 6]);
    expect(second.s1.map((d) => d.o)).toEqual([3, 4]);
  });

  it('새 데이터가 더 짧으면 잉여 없이 새 길이만 반환(stale 없음)', () => {
    const ctx = makeCtx();
    const first = buildStack(ctx, [10, 20, 30], [1, 2, 3]);
    const second = buildStack(ctx, [5, 6], [7, 8], first.s0, first.s1);
    expect(second.s0).toHaveLength(2);
    expect(second.s1).toHaveLength(2);
    expect(second.s1.map((d) => d.y)).toEqual([12, 14]);
  });

  it('pool 미전달(prevData undefined)이면 새 객체로 동일 출력', () => {
    const ctxA = makeCtx();
    const ctxB = makeCtx();
    const withPool = buildStack(ctxA, [10, 20], [5, 7]);
    buildStack(ctxA, [3, 4], [1, 2], withPool.s0, withPool.s1); // 2틱째 풀 사용
    const noPool = buildStack(ctxB, [3, 4], [1, 2]); // 풀 없이 동일 입력
    // 값 동일(풀 사용 여부와 무관)
    expect(ctxA.seriesList.s1.data.map((d) => d.y)).toEqual(noPool.s1.map((d) => d.y));
    expect(ctxA.seriesList.s1.data.map((d) => d.b)).toEqual(noPool.s1.map((d) => d.b));
  });
});
