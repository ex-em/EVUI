import { describe, it, expect } from 'vitest';
import { reactive, isReactive } from 'vue';
import { cloneDeepWith } from 'lodash-es';
import { cloneChartData } from './uses';

/**
 * F1(데이터 파이프라인) 회귀 테스트 — cloneChartData가 reactive proxy를 toRaw로 벗겨 복사해도
 * 출력(값·구조·date 보존·격리)이 기존과 동일한지 검증.
 *
 * - reactive 입력을 복사하면 non-reactive plain 결과가 나오고 값은 동일해야 한다.
 * - dayjs/Date 같은 immutable date는 참조 보존(기존 동작).
 * - 결과는 입력과 분리된 객체여야 한다(격리).
 */

// 기존 동작(toRaw unwrap 없는) 기준선: immutable date만 보존하던 원래 cloneDeepWith.
const cloneLegacy = (data) =>
  cloneDeepWith(data, (value) => (value instanceof Date ? value : undefined));

describe('cloneChartData (F1: toRaw unwrap)', () => {
  const makeData = () => ({
    labels: ['L0', 'L1', 'L2'],
    series: { s1: { name: 'S1' } },
    groups: [['s1']],
    data: { s1: [1, 2, 3], s2: [{ x: 'L0', y: 5 }] },
  });

  it('reactive 입력을 복사하면 non-reactive plain 결과가 나온다', () => {
    const src = reactive(makeData());
    const out = cloneChartData(src);

    expect(isReactive(out)).toBe(false);
    expect(isReactive(out.data)).toBe(false);
    expect(isReactive(out.data.s1)).toBe(false);
  });

  it('값·구조가 입력과 동일하다', () => {
    const src = reactive(makeData());
    const out = cloneChartData(src);

    expect(out).toEqual(makeData());
  });

  it('plain 입력에서도 기존(legacy) 클론과 결과가 동일하다 (flag 무관 출력 동일)', () => {
    const src = makeData();

    expect(cloneChartData(src)).toEqual(cloneLegacy(src));
  });

  it('reactive 입력의 클론이 legacy(동일 입력) 클론과 값이 같다', () => {
    const data = makeData();

    expect(cloneChartData(reactive(data))).toEqual(cloneLegacy(data));
  });

  it('결과는 입력과 분리된 객체다 (격리 — 입력 변형이 결과에 새지 않음)', () => {
    const src = reactive(makeData());
    const out = cloneChartData(src);

    src.data.s1.push(999);
    src.labels.push('L3');

    expect(out.data.s1).toEqual([1, 2, 3]);
    expect(out.labels).toEqual(['L0', 'L1', 'L2']);
  });

  it('Date 값은 참조를 보존한다 (immutable date 격리 제외)', () => {
    const d = new Date(2020, 0, 1);
    const out = cloneChartData(reactive({ labels: [d], data: {} }));

    expect(out.labels[0]).toBe(d);
  });
});
