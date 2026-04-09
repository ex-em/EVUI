import { describe, it, expect } from 'vitest';
import modules from './model.store';

/**
 * model.store의 메서드들은 차트 인스턴스의 this에 바인딩되어 사용됨.
 * 테스트에서는 필요한 속성만 주입한 가짜 컨텍스트를 만들어 메서드를 직접 호출한다.
 */
const createStore = (seriesList, options = {}) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false, ...options },
  });

/**
 * findGraphData mock을 만드는 헬퍼.
 * 실제 Bar/Line 클래스 대신 필요한 필드만 가진 객체를 리턴한다.
 */
const mockSeries = ({ type, data, hit = false, directHit = false, stackIndex = null }) => ({
  type,
  stackIndex,
  findGraphData: () => ({
    data,
    hit,
    directHit,
    index: data?.index ?? 0,
  }),
});

/**
 * dataIndex 인자에 반응하는 findGraphData mock.
 * 인덱스별 데이터 포인트 배열을 받아, dataIndex 가 주어지면 그 인덱스 포인트를,
 * 주어지지 않으면 "가장 가까운 non-null 포인트" (line binary-search 경로 근사) 를 반환한다.
 * show/data 속성을 포함해 로컬 nearest label 계산에 참여할 수 있다.
 */
const mockLineWithIndexedData = ({ points, hitIndex = null, directHitIndex = null }) => ({
  type: 'line',
  show: true,
  data: points,
  stackIndex: null,
  findGraphData: (offset, isHorizontal, dataIndex) => {
    if (typeof dataIndex === 'number') {
      const data = points[dataIndex] ?? null;
      return {
        data,
        hit: data && dataIndex === hitIndex,
        directHit: data && dataIndex === directHitIndex,
        index: dataIndex,
      };
    }
    const firstNonNullIdx = points.findIndex((p) => p && p.o !== null);
    if (firstNonNullIdx === -1) {
      return { data: null, hit: false, directHit: false, index: 0 };
    }
    return {
      data: points[firstNonNullIdx],
      hit: firstNonNullIdx === hitIndex,
      directHit: firstNonNullIdx === directHitIndex,
      index: firstNonNullIdx,
    };
  },
});

describe('model.store getHitItemByPosition', () => {
  describe('directHit 우선순위', () => {
    it('bar 박스 내부 클릭(directHit=true)은 좌표가 더 가까운 line(hit=true)보다 우선 선택된다', () => {
      // bar 시리즈: 클릭 좌표 [50, 100]에서 좀 떨어진 xp=10, yp=90 (박스 꼭짓점 기준)
      // line 시리즈: 클릭 좌표에 아주 가까운 xp=51, yp=101 (포인트 기준)
      // 기존 로직이면 line이 거리 기준 승자였음. directHit 도입 후 bar가 선택되어야 한다.
      const barSeries = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 10, yp: 90, o: 10, index: 0 },
        hit: true,
        directHit: true,
      });
      const lineSeries = mockSeries({
        type: 'line',
        data: { x: 0, y: 100, xp: 51, yp: 101, o: 100, index: 0 },
        hit: true,
        directHit: false,
      });

      const store = createStore({ bar1: barSeries, line1: lineSeries });
      const result = store.getHitItemByPosition([50, 100]);

      expect(result.sId).toBe('bar1');
      expect(result.type).toBe('bar');
    });

    it('여러 bar에 directHit가 겹치면 클릭 좌표에 가장 가까운 bar가 선택된다', () => {
      // 두 bar 모두 directHit=true. 거리 기준으로 더 가까운 쪽이 승자.
      const barFar = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 10, yp: 20, o: 10, index: 0 },
        hit: true,
        directHit: true,
      });
      const barNear = mockSeries({
        type: 'bar',
        data: { x: 0, y: 20, xp: 48, yp: 52, o: 20, index: 0 },
        hit: true,
        directHit: true,
      });

      const store = createStore({ far: barFar, near: barNear });
      const result = store.getHitItemByPosition([50, 50]);

      expect(result.sId).toBe('near');
    });

    it('같은 좌표에서 line 포인트 directHit는 bar 박스 directHit를 거리로 이긴다', () => {
      // combo 차트에서 line 포인트가 bar 박스 내부에 있어 둘 다 directHit인 경우.
      // bar.(xp,yp)는 박스 꼭짓점이라 클릭 좌표와 거리가 크고,
      // line.(xp,yp)는 포인트 중심이라 거의 0. 따라서 line이 이겨야 한다.
      const bar = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 30, yp: 20, o: 10, index: 0 },
        hit: true,
        directHit: true,
      });
      const line = mockSeries({
        type: 'line',
        data: { x: 0, y: 50, xp: 50, yp: 50, o: 50, index: 0 },
        hit: true,
        directHit: true,
      });

      const store = createStore({ bar, line });
      const result = store.getHitItemByPosition([50, 50]);

      expect(result.sId).toBe('line');
    });
  });

  describe('hit 없음 + directHit 없음', () => {
    it('값이 있는 hit=false 시리즈는 거리 기반 fallback 으로 선택된다', () => {
      // 클릭에 더 가까운 s1이 fallback 으로 잡히는지 확인.
      const s1 = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 990, yp: 990, o: 10, index: 0 },
        hit: false,
        directHit: false,
      });
      const s2 = mockSeries({
        type: 'line',
        data: { x: 0, y: 20, xp: 30, yp: 40, o: 20, index: 0 },
        hit: false,
      });

      const store = createStore({ s1, s2 });
      const result = store.getHitItemByPosition([1000, 1000]);

      expect(result.sId).toBe('s1');
    });
  });

  describe('일반 line 차트 회귀 방지', () => {
    it('directHit가 하나도 없는 경우 거리 기반으로 가장 가까운 hit 시리즈가 선택된다', () => {
      const lineFar = mockSeries({
        type: 'line',
        data: { x: 0, y: 10, xp: 10, yp: 10, o: 10, index: 0 },
        hit: true,
        directHit: false,
      });
      const lineNear = mockSeries({
        type: 'line',
        data: { x: 0, y: 20, xp: 49, yp: 51, o: 20, index: 0 },
        hit: true,
        directHit: false,
      });

      const store = createStore({ far: lineFar, near: lineNear });
      const result = store.getHitItemByPosition([50, 50]);

      expect(result.sId).toBe('near');
    });
  });

  describe('리턴 객체 형태', () => {
    it('dataIndex 키로 데이터 인덱스를 반환한다 (기존 maxIndex → dataIndex)', () => {
      const barSeries = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 10, yp: 20, o: 10, index: 3 },
        hit: true,
        directHit: true,
      });

      const store = createStore({ bar1: barSeries });
      const result = store.getHitItemByPosition([10, 20]);

      expect(result.dataIndex).toBe(3);
      expect(result.maxIndex).toBeUndefined();
    });
  });

  describe('fallback 등록 조건 — null 값 제외', () => {
    it('값(data.o)이 null인 첫 시리즈는 fallback 후보가 아니다', () => {
      // 같은 라벨에서 A는 값 없고 B만 값 있음. 어느 시리즈도 hit=false 인 빈 영역 클릭.
      // 기대: fallback 은 값이 존재하는 B.
      const noValueSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: null, o: null, xp: 100, yp: null, index: 2 },
        hit: false,
      });
      const valueSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: 50, o: 50, xp: 100, yp: 80, index: 2 },
        hit: false,
      });

      const store = createStore({ A: noValueSeries, B: valueSeries });
      const result = store.getHitItemByPosition([100, 200]);

      expect(result.sId).toBe('B');
      expect(result.value).toBe(50);
      expect(result.dataIndex).toBe(2);
    });

    it('두 시리즈 모두 값이 null이면 sId는 빈 문자열로 fallback도 없다', () => {
      const a = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: null, o: null, xp: 100, yp: null, index: 1 },
        hit: false,
      });
      const b = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: null, o: null, xp: 100, yp: null, index: 1 },
        hit: false,
      });

      const store = createStore({ A: a, B: b });
      const result = store.getHitItemByPosition([100, 200]);

      expect(result.sId).toBe('');
      expect(result.dataIndex).toBe(null);
    });

    it('값이 0인 시리즈도 fallback 후보에 포함된다 (0은 의미 있는 값)', () => {
      const zeroSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: 0, o: 0, xp: 100, yp: 250, index: 0 },
        hit: false,
      });
      const nullSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: null, o: null, xp: 100, yp: null, index: 0 },
        hit: false,
      });

      // nullSeries 가 먼저이지만 값이 없으니 fallback 은 zeroSeries.
      const store = createStore({ null1: nullSeries, zero1: zeroSeries });
      const result = store.getHitItemByPosition([100, 200]);

      expect(result.sId).toBe('zero1');
      expect(result.value).toBe(0);
    });
  });

  describe('fallback 거리 기반 선택', () => {
    it('두 시리즈 모두 값이 있고 hit=false일 때, 클릭 좌표에 더 가까운 시리즈가 선택된다', () => {
      const farSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: 10, o: 10, xp: 50, yp: 100, index: 1 },
        hit: false,
      });
      const nearSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: 50, o: 50, xp: 50, yp: 200, index: 1 },
        hit: false,
      });

      // 클릭 (50, 210) — near(거리 10) vs far(거리 110). 정의 순서상 far 가 먼저지만
      // 거리 기반이라 near 가 선택되어야 한다.
      const store = createStore({ far: farSeries, near: nearSeries });
      const result = store.getHitItemByPosition([50, 210]);

      expect(result.sId).toBe('near');
      expect(result.value).toBe(50);
    });

    it('bar+line combo: bar 위쪽 빈 영역 클릭 시, 박스 거리 기준으로 bar가 선택된다', () => {
      // line 포인트 yp=200, bar 박스 xp=40, yp=300, w=20, h=-200 → 박스 y [100, 300].
      // 클릭 (50, 50) — 바 상단 위쪽 빈 영역. 어느 쪽도 hit 아님.
      // 단순 (xp,yp) 거리로 재면 line 이 이김 (line 22500, bar 62600).
      // 박스 거리로 재면 bar 가 이김 (bar 2500, line 22500).
      const lineSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: 30, o: 30, xp: 50, yp: 200, w: null, h: null, index: 1 },
        hit: false,
      });
      const barSeries = mockSeries({
        type: 'bar',
        data: { x: 'L1', y: 50, o: 50, xp: 40, yp: 300, w: 20, h: -200, index: 1 },
        hit: false,
      });

      const store = createStore({ series1: lineSeries, series2: barSeries });
      const result = store.getHitItemByPosition([50, 50]);

      expect(result.sId).toBe('series2');
      expect(result.type).toBe('bar');
    });

    it('null인 시리즈는 더 가까워도 fallback에서 제외된다 (값 가드 우선)', () => {
      const nullSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: null, o: null, xp: 50, yp: 205, index: 1 },
        hit: false,
      });
      const valueSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: 50, o: 50, xp: 50, yp: 100, index: 1 },
        hit: false,
      });

      const store = createStore({ nullOne: nullSeries, valueOne: valueSeries });
      const result = store.getHitItemByPosition([50, 210]);

      expect(result.sId).toBe('valueOne');
    });
  });

  describe('dataIndex 미지정 시 로컬 nearest 라벨 계산', () => {
    it('클릭 라벨에서 값이 null인 시리즈는 이웃 라벨의 값으로 잘못 선택되지 않는다', () => {
      // series1 의 index 1 만 null, series2 는 index 1 에 값 있음.
      // 클릭 좌표가 index 1 근처. 로컬 nearest 가 index 1 을 리턴 →
      // series1 은 null 로 제외 → series2 선택.
      const series1Points = [
        { x: 'L0', y: 20, o: 20, xp: 10, yp: 180, index: 0 },
        { x: 'L1', y: null, o: null, xp: 50, yp: null, index: 1 },
        { x: 'L2', y: 80, o: 80, xp: 90, yp: 120, index: 2 },
      ];
      const series2Points = [
        { x: 'L0', y: 10, o: 10, xp: 10, yp: 190, index: 0 },
        { x: 'L1', y: 30, o: 30, xp: 50, yp: 170, index: 1 },
        { x: 'L2', y: 50, o: 50, xp: 90, yp: 150, index: 2 },
      ];

      const store = createStore({
        series1: mockLineWithIndexedData({ points: series1Points }),
        series2: mockLineWithIndexedData({ points: series2Points }),
      });
      const result = store.getHitItemByPosition([50, 300]);

      expect(result.sId).toBe('series2');
      expect(result.value).toBe(30);
      expect(result.dataIndex).toBe(1);
    });

    it('두 시리즈 모두 null 인 라벨 클릭 시 nearest valid 라벨(이웃)을 반환한다 (hover/dblclick 일관성)', () => {
      // index 1 에서 두 시리즈 모두 null, 이웃 라벨 (0, 2) 에는 값 존재.
      // hasValidData 필터로 index 1 을 건너뛰고 nearest valid(index 0 또는 2)를 resolvedDataIndex 로 사용.
      // hover/dblclick 이 findClosestDataIndex 로 이웃 라벨을 반환하는 것과 동일한 동작.
      const points1 = [
        { x: 'L0', y: 20, o: 20, xp: 10, yp: 180, index: 0 },
        { x: 'L1', y: null, o: null, xp: 50, yp: null, index: 1 },
        { x: 'L2', y: 80, o: 80, xp: 90, yp: 120, index: 2 },
      ];
      const points2 = [
        { x: 'L0', y: 30, o: 30, xp: 10, yp: 170, index: 0 },
        { x: 'L1', y: null, o: null, xp: 50, yp: null, index: 1 },
        { x: 'L2', y: 70, o: 70, xp: 90, yp: 130, index: 2 },
      ];

      const store = createStore({
        series1: mockLineWithIndexedData({ points: points1 }),
        series2: mockLineWithIndexedData({ points: points2 }),
      });
      // 클릭 xp=50 → index 0(xp=10, dist=40)과 index 2(xp=90, dist=40) 동거리 → index 0 선택.
      // index 0 에서 series1(yp=180, dist²=6500)이 series2(yp=170, dist²=8000)보다 가까움.
      const result = store.getHitItemByPosition([50, 250]);

      expect(result.sId).not.toBe('');
      expect(result.dataIndex).not.toBe(null);
    });

    it('차트 전체 데이터가 null 이면 empty 를 반환한다', () => {
      // 모든 라벨에서 모든 시리즈가 null → hasValidData 항상 false → resolvedDataIndex 미정 → empty.
      const points1 = [
        { x: 'L0', y: null, o: null, xp: 10, yp: null, index: 0 },
        { x: 'L1', y: null, o: null, xp: 50, yp: null, index: 1 },
      ];
      const points2 = [
        { x: 'L0', y: null, o: null, xp: 10, yp: null, index: 0 },
        { x: 'L1', y: null, o: null, xp: 50, yp: null, index: 1 },
      ];

      const store = createStore({
        series1: mockLineWithIndexedData({ points: points1 }),
        series2: mockLineWithIndexedData({ points: points2 }),
      });
      const result = store.getHitItemByPosition([50, 250]);

      expect(result.sId).toBe('');
      expect(result.dataIndex).toBe(null);
    });
  });
});
