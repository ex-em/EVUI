import { describe, it, expect } from 'vitest';
import EvChartZoom from './chartZoom.core';

const createZoom = (appliedZoomRange, cloneLabelsLastIdx = 9) =>
  Object.assign(Object.create(EvChartZoom.prototype), {
    appliedZoomRange,
    cloneLabelsLastIdx,
  });

describe('EvChartZoom.isLatestDataInView', () => {
  it.each([
    { name: '줌 전 전체 구간', range: null, expected: true },
    { name: '줌 초기값 [0, -1]', range: [0, -1], expected: true },
    { name: '끝을 포함한 확대', range: [5, 9], expected: true },
    { name: '과거 구간 확대', range: [0, 4], expected: false },
  ])('$name → $expected', ({ range, expected }) => {
    expect(createZoom(range).isLatestDataInView()).toBe(expected);
  });

  it('줌 유지 중 새 데이터가 붙어 원본 끝이 늘면 과거 구간으로 본다', () => {
    expect(createZoom([0, 9], 12).isLatestDataInView()).toBe(false);
  });

  // 브러시 드래그·[0, 0] 외부 인덱스는 data 를 자르지만 zoomAreaMemory 는 그대로다
  it('실제로 잘라 넘긴 구간이 있으면 줌 이력보다 그 구간을 따른다', () => {
    const zoom = createZoom([0, 0]);
    zoom.zoomAreaMemory = { current: [[0, 9]] };
    expect(zoom.isLatestDataInView()).toBe(false);
  });

  // 그룹은 같은 인덱스로 자르지만 차트마다 라벨 수가 다르다
  it('그룹 차트는 차트별 원본 라벨 끝과 비교한다', () => {
    const data = [
      { labels: [1, 2, 3], series: {}, data: {} },
      { labels: [1, 2, 3, 4], series: {}, data: {} },
    ];
    const zoom = new EvChartZoom(
      { props: { data: structuredClone(data) }, dom: [] },
      { data },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );
    zoom.executeZoom(0, 2);
    expect(zoom.isLatestDataInView(0)).toBe(true);
    expect(zoom.isLatestDataInView(1)).toBe(false);
  });

  it('아직 줌하지 않은 그룹은 더 긴 차트에서도 최신 데이터가 보인다', () => {
    const data = [
      { labels: [1, 2, 3], series: {}, data: {} },
      { labels: [1, 2, 3, 4], series: {}, data: {} },
    ];
    const zoom = new EvChartZoom(
      { props: { data: structuredClone(data) }, dom: [] },
      { data },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );

    expect(zoom.isLatestDataInView(1)).toBe(true);
    zoom.executeZoom(0, 2);
    expect(zoom.isLatestDataInView(1)).toBe(false);
  });

  it('라벨 없는 그룹 차트도 원본의 마지막 객체 점을 기준으로 판정한다', () => {
    const data = [
      { labels: [1, 2, 3], series: {}, data: {} },
      { labels: [], series: { s: {} }, data: { s: [1, 2, 3, 4].map(x => ({ x, y: 1 })) } },
    ];
    const zoom = new EvChartZoom(
      { props: { data: structuredClone(data) }, dom: [] },
      { data },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );

    zoom.executeZoom(0, 2);
    expect(zoom.isLatestDataInView(1)).toBe(false);
    zoom.executeZoom(0, 3);
    expect(zoom.isLatestDataInView(1)).toBe(true);
  });

  it('줌 유지 옵션이 켜져도 아직 줌하지 않은 그룹의 데이터를 자르지 않는다', () => {
    const data = [
      { labels: [1, 2, 3], series: {}, data: {} },
      { labels: [1, 2, 3, 4], series: {}, data: {} },
    ];
    const displayed = structuredClone(data);
    const zoom = new EvChartZoom(
      { props: { data: displayed }, dom: [] },
      { data },
      { zoom: { useAnimation: false } },
      null,
      null,
      {},
    );

    zoom.updateEvChartCloneData({ data }, { value: [0, 1] }, false, true);
    expect(displayed[1].labels).toEqual([1, 2, 3, 4]);
    expect(zoom.isLatestDataInView(1)).toBe(true);
  });
});
