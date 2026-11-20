import { describe, it, expect } from 'vitest';
import EvChartZoom from './chartZoom.core';

// 생성자는 DOM·툴바를 요구한다 — 판정에 필요한 줌 구간 기억과 원본 마지막 인덱스만 둔다.
const createZoom = (current, cloneLabelsLastIdx = 9) =>
  Object.assign(Object.create(EvChartZoom.prototype), {
    zoomAreaMemory: { previous: [], current, latest: [] },
    cloneLabelsLastIdx,
  });

describe('EvChartZoom.isLatestDataInView', () => {
  it.each([
    { name: '줌 전 전체 구간', current: [[0, 9]], expected: true },
    { name: '줌 초기값 [0, -1]', current: [[0, -1]], expected: true },
    { name: '끝을 포함한 확대', current: [[5, 9]], expected: true },
    { name: '과거 구간 확대', current: [[0, 4]], expected: false },
    { name: '구간 기억 없음', current: [], expected: true },
  ])('$name → $expected', ({ current, expected }) => {
    expect(createZoom(current).isLatestDataInView()).toBe(expected);
  });

  it('줌 유지 중 새 데이터가 붙어 원본 끝이 늘면 과거 구간으로 본다', () => {
    expect(createZoom([[0, 9]], 12).isLatestDataInView()).toBe(false);
  });
});
