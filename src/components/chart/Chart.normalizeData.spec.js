import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { normalizeData } from './uses';

/**
 * F0(데이터 파이프라인) 회귀 테스트 — normalizeData가 소비자 원본을 변형하지 않는지 검증.
 *
 * 기존 `getNormalizedData = defaultsDeep(data, DEFAULT_DATA)`는 lodash가 첫 인자(원본)를
 * in-place mutate하고 같은 참조를 반환해, 누락 키가 소비자의 props.data에 주입됐다(원본 오염).
 * F0는 빈 shallow copy를 target으로 써서 원본 불변을 보장한다.
 */
describe('normalizeData (F0: non-mutating)', () => {
  it('원본 객체에 누락된 top-level 키를 주입하지 않는다 (원본 불변)', () => {
    const original = { labels: ['a', 'b'], data: { s1: [1, 2] } }; // series·groups 생략
    const before = Object.keys(original).sort();

    normalizeData(original);

    expect(Object.keys(original).sort()).toEqual(before); // series/groups가 원본에 안 생김
    expect('series' in original).toBe(false);
    expect('groups' in original).toBe(false);
  });

  it('reactive proxy 입력도 원본을 변형하지 않는다', () => {
    const original = reactive({ labels: ['a'], data: { s1: [1] } });

    normalizeData(original);

    expect('series' in original).toBe(false);
    expect('groups' in original).toBe(false);
  });

  it('누락 키는 출력에서 기본값으로 채워진다', () => {
    const out = normalizeData({ labels: ['a'], data: { s1: [1] } });

    expect(out.series).toEqual({});
    expect(out.groups).toEqual([]);
    expect(out.labels).toEqual(['a']);
    expect(out.data).toEqual({ s1: [1] });
  });

  it('이미 있는 키는 그대로 보존하고 추가 키도 유지한다', () => {
    const out = normalizeData({
      labels: ['a'],
      data: { s1: [1] },
      series: { s1: { name: 'S1' } },
      groups: [['s1']],
      chartIdx: 2,
    });

    expect(out.series).toEqual({ s1: { name: 'S1' } });
    expect(out.groups).toEqual([['s1']]);
    expect(out.chartIdx).toBe(2); // 추가 키 손실 없음
  });

  it('반환값은 입력과 다른 top-level 참조다 (격리)', () => {
    const original = { labels: ['a'], data: {} };
    const out = normalizeData(original);

    expect(out).not.toBe(original);
  });
});
