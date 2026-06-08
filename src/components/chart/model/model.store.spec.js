import { describe, it, expect } from 'vitest';
import modules from './model.store';
import Util from '../helpers/helpers.util';

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

    it('disableNullLabelSnap=true 면 모든 시리즈가 null 인 라벨도 그대로 반환한다', () => {
      // index 1 에서 두 시리즈 모두 null. 클릭 좌표는 xp=50 → index 1 이 가장 가깝다.
      // 기본 동작이라면 index 1 을 건너뛰고 nearest valid 로 snap 하지만,
      // disableNullLabelSnap=true 이면 index 1 그대로 반환 (sId='', value=0).
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
      const result = store.getHitItemByPosition([50, 250], false, undefined, false, true);

      expect(result.sId).toBe('');
      expect(result.value).toBeNull();
      expect(result.label).toBe('L1');
      expect(result.dataIndex).toBe(1);
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

  describe('Fill(with null) 8라벨 × 2시리즈 — onClick 경로 회귀', () => {
    // FillWithNull.vue 데이터 모사. onClick 경로 인자로 호출.
    const buildSeries1Points = () => [
      { x: '01/01', y: 20, o: 20, xp: 0, yp: 160, index: 0 },
      { x: '01/02', y: 45, o: 45, xp: 20, yp: 110, index: 1 },
      { x: '01/03', y: null, o: null, xp: 40, yp: null, index: 2 },
      { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
      { x: '01/05', y: 80, o: 80, xp: 80, yp: 40, index: 4 },
      { x: '01/06', y: 55, o: 55, xp: 100, yp: 90, index: 5 },
      { x: '01/07', y: null, o: null, xp: 120, yp: null, index: 6 },
      { x: '01/08', y: 50, o: 50, xp: 140, yp: 100, index: 7 },
    ];
    const buildSeries2Points = () => [
      { x: '01/01', y: 55, o: 55, xp: 0, yp: 90, index: 0 },
      { x: '01/02', y: 30, o: 30, xp: 20, yp: 140, index: 1 },
      { x: '01/03', y: 40, o: 40, xp: 40, yp: 120, index: 2 },
      { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
      { x: '01/05', y: 45, o: 45, xp: 80, yp: 110, index: 4 },
      { x: '01/06', y: 25, o: 25, xp: 100, yp: 150, index: 5 },
      { x: '01/07', y: 65, o: 65, xp: 120, yp: 70, index: 6 },
      { x: '01/08', y: 40, o: 40, xp: 140, yp: 120, index: 7 },
    ];

    const createFillStore = () =>
      createStore({
        series1: mockLineWithIndexedData({ points: buildSeries1Points() }),
        series2: mockLineWithIndexedData({ points: buildSeries2Points() }),
      });

    it('01/03 (series1 만 null) 위쪽 빈 영역 클릭 → series2 선택, value=40', () => {
      const store = createFillStore();
      const result = store.getHitItemByPosition([40, 10], false, undefined, false, true);

      expect(result.sId).toBe('series2');
      expect(result.value).toBe(40);
      expect(result.dataIndex).toBe(2);
    });

    it('01/04 (둘 다 null) 위쪽 빈 영역 클릭 → sId="", label="01/04", dataIndex=3', () => {
      const store = createFillStore();
      const result = store.getHitItemByPosition([60, 10], false, undefined, false, true);

      expect(result.sId).toBe('');
      expect(result.label).toBe('01/04');
      expect(result.dataIndex).toBe(3);
    });

    it('01/04 (둘 다 null) 클릭 시 value 는 null 로 emit 된다', () => {
      // 0 강제 변환 시 "값이 0" 과 "값이 없음" 구분 불가.
      const store = createFillStore();
      const result = store.getHitItemByPosition([60, 10], false, undefined, false, true);

      expect(result.value).toBeNull();
    });

    it('01/07 (series1 만 null) 위쪽 빈 영역 클릭 → series2 선택, value=65', () => {
      const store = createFillStore();
      const result = store.getHitItemByPosition([120, 10], false, undefined, false, true);

      expect(result.sId).toBe('series2');
      expect(result.value).toBe(65);
      expect(result.dataIndex).toBe(6);
    });

    it('01/01 (둘 다 값) 위쪽 빈 영역 클릭 → 클릭 좌표에 가까운 쪽이 선택된다', () => {
      const store = createFillStore();
      const result = store.getHitItemByPosition([0, 85], false, undefined, false, true);

      expect(result.sId).toBe('series2');
      expect(result.value).toBe(55);
      expect(result.dataIndex).toBe(0);
    });
  });

  describe('area 차트 — null 시리즈는 후보에서 제외', () => {
    // area 차트(line + fill) 의 null 데이터 처리. hit detection 흐름은 동일하지만,
    // isExistGrp + linear interpolation 시 element.line.draw 가 null 데이터의 yp 를
    // baseline 으로 채우는 케이스가 있다. 그래도 o=null 이면 후보에서 제외되어야 한다.

    it('o=null 시리즈는 yp 가 baseline 으로 채워져도 fallback 후보에서 제외된다', () => {
      // isExistGrp + linear interpolation 모방: yp=100 (baseline) 으로 set 되었지만 o=null.
      // hasMeaningfulValue 체크(g = data.o || data.y)가 모두 null 이라 후보 미등록.
      const nullSeries = mockSeries({
        type: 'line',
        isExistGrp: true,
        interpolation: 'linear',
        data: { x: 'L0', y: null, o: null, xp: 50, yp: 100, index: 0 },
        hit: false,
      });
      const valueSeries = mockSeries({
        type: 'line',
        data: { x: 'L0', y: 50, o: 50, xp: 50, yp: 80, index: 0 },
        hit: false,
      });

      const store = createStore({ nullOne: nullSeries, valueOne: valueSeries });
      const result = store.getHitItemByPosition([50, 100]);

      expect(result.sId).toBe('valueOne');
      expect(result.value).toBe(50);
    });

    it('o=null 시리즈가 클릭 좌표에 더 가까워도(yp 직격) 값 있는 시리즈가 선택된다', () => {
      // 클릭 (50, 100). nullOne.yp=100 정확히 직격(거리 0), valueOne.yp=80 (거리 20).
      // 거리만 보면 nullOne 이 이기지만 hasMeaningfulValue=false 라 후보 미등록.
      const nullSeries = mockSeries({
        type: 'line',
        data: { x: 'L0', y: null, o: null, xp: 50, yp: 100, index: 0 },
        hit: false,
      });
      const valueSeries = mockSeries({
        type: 'line',
        data: { x: 'L0', y: 50, o: 50, xp: 50, yp: 80, index: 0 },
        hit: false,
      });

      const store = createStore({ nullOne: nullSeries, valueOne: valueSeries });
      const result = store.getHitItemByPosition([50, 100]);

      expect(result.sId).toBe('valueOne');
      expect(result.value).toBe(50);
    });
  });
});

describe('model.store getItem (selectLabel indicator 용)', () => {
  // selectLabel 시 chart.core.drawTip → getItem 결과가 element.tip 에 전달된다.
  // 모두 null 라벨에서 sId='' 이면 indicator 그리기가 skip 되므로 sId 를 보정해야 한다.

  const buildSeries = (points) => ({
    type: 'line',
    show: true,
    data: points,
    stackIndex: null,
    findGraphData: (offset, isHorizontal, dataIndex) => {
      if (typeof dataIndex === 'number') {
        const data = points[dataIndex] ?? null;
        return { data, hit: false, directHit: false, index: dataIndex };
      }
      return { data: null, hit: false, directHit: false, index: 0 };
    },
  });

  const buildFillStore = () => {
    const points1 = [
      { x: '01/01', y: 20, o: 20, xp: 0, yp: 160, index: 0 },
      { x: '01/02', y: 45, o: 45, xp: 20, yp: 110, index: 1 },
      { x: '01/03', y: null, o: null, xp: 40, yp: null, index: 2 },
      { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
    ];
    const points2 = [
      { x: '01/01', y: 55, o: 55, xp: 0, yp: 90, index: 0 },
      { x: '01/02', y: 30, o: 30, xp: 20, yp: 140, index: 1 },
      { x: '01/03', y: 40, o: 40, xp: 40, yp: 120, index: 2 },
      { x: '01/04', y: null, o: null, xp: 60, yp: null, index: 3 },
    ];
    const store = createStore({
      series1: buildSeries(points1),
      series2: buildSeries(points2),
    });
    store.data = { labels: ['01/01', '01/02', '01/03', '01/04'] };
    return store;
  };

  it('모두 null 인 라벨(01/04) selectLabel → 첫 visible series 의 sId/label/dataIndex 가 보정된다', () => {
    const store = buildFillStore();
    const result = store.getItem({ dataIndex: [3] });

    expect(result).toHaveLength(1);
    expect(result[0]).not.toBeNull();
    expect(result[0].sId).toBe('series1');
    expect(result[0].label).toBe('01/04');
    expect(result[0].dataIndex).toBe(3);
  });

  it('일부 null 라벨(01/03) selectLabel → hit detection fallback 으로 series2 가 선택된다', () => {
    const store = buildFillStore();
    const result = store.getItem({ dataIndex: [2] });

    expect(result[0].sId).toBe('series2');
    expect(result[0].dataIndex).toBe(2);
  });
});

/**
 * createRealTimeScatterDataSet 의 시리즈 내부 (x,y) dedupe 회귀 테스트.
 * 같은 dataGroup 슬롯에 동일 (x,y) 가 두 번 들어오면 한 번만 push 되어야 한다.
 */
describe('model.store createRealTimeScatterDataSet (x,y) dedupe', () => {
  const SECOND = 1000;

  const buildRealTimeStore = (range = 5, options = {}, scatterIds = ['series1']) => {
    const store = Object.create(modules);
    Object.assign(store, {
      isInit: false,
      updateSeries: false,
      dataSet: {},
      options: { realTimeScatter: { range }, ...options },
      seriesInfo: { charts: { scatter: scatterIds } },
      seriesList: Object.fromEntries(scatterIds.map((id) => [id, {}])),
    });
    return store;
  };

  it('한 배치에 동일 (x,y) 가 N개 있어도 dataGroup 에는 한 번만 push 된다', () => {
    const store = buildRealTimeStore();
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({
      series1: [
        { x: t, y: 10 },
        { x: t, y: 10 },
        { x: t, y: 10 },
        { x: t, y: 20 },
      ],
    });

    const groups = store.dataSet.series1.dataGroup;
    const totalPoints = groups.reduce((acc, g) => acc + g.data.length, 0);
    expect(totalPoints).toBe(2);
  });

  it('서로 다른 (x,y) 는 모두 push 된다', () => {
    const store = buildRealTimeStore();
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({
      series1: [
        { x: t, y: 10 },
        { x: t, y: 20 },
        { x: t, y: 30 },
      ],
    });

    const groups = store.dataSet.series1.dataGroup;
    const totalPoints = groups.reduce((acc, g) => acc + g.data.length, 0);
    expect(totalPoints).toBe(3);
  });

  it('dataKeys Set 이 슬롯마다 생성되고 push 된 좌표를 보관한다', () => {
    const store = buildRealTimeStore();
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({
      series1: [{ x: t, y: 10 }],
    });

    const groups = store.dataSet.series1.dataGroup;
    const slotWithData = groups.find((g) => g.data.length > 0);
    expect(slotWithData.dataKeys).toBeInstanceOf(Set);
    expect(slotWithData.dataKeys.has(`${t}|10`)).toBe(true);
  });

  it('윈도우 밖으로 밀려난 슬롯이 reset 되면 dataKeys 도 비워져 같은 좌표를 재 push 할 수 있다', () => {
    const store = buildRealTimeStore(3);
    const t0 = Math.floor(Date.now() / SECOND) * SECOND;

    // 1차 batch: (t0, 10) push
    store.createRealTimeScatterDataSet({ series1: [{ x: t0, y: 10 }] });
    const firstTotal = store.dataSet.series1.dataGroup.reduce((acc, g) => acc + g.data.length, 0);
    expect(firstTotal).toBe(1);

    // 2차 batch: 같은 (x,y) 재 push → 이미 슬롯에 있으니 무시
    store.createRealTimeScatterDataSet({ series1: [{ x: t0, y: 10 }] });
    const secondTotal = store.dataSet.series1.dataGroup.reduce((acc, g) => acc + g.data.length, 0);
    expect(secondTotal).toBe(1);

    // 3차 batch: 시간이 length 초 이상 지나 모든 슬롯 reset → 같은 (x,y) 재 push 가능
    const t1 = t0 + 10 * SECOND;
    store.createRealTimeScatterDataSet({ series1: [{ x: t1, y: 10 }] });
    const slotsAfterReset = store.dataSet.series1.dataGroup;
    const containsKey = slotsAfterReset.some((g) => g.dataKeys?.has(`${t1}|10`));
    expect(containsKey).toBe(true);
  });

  it('coordinateDedupe=false 일 때 동일 (x,y) 가 N개여도 모두 push 된다 (#2011 opt-out 보존)', () => {
    const store = buildRealTimeStore(5, { coordinateDedupe: false });
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({
      series1: [
        { x: t, y: 10 },
        { x: t, y: 10 },
        { x: t, y: 10 },
        { x: t, y: 20 },
      ],
    });

    const groups = store.dataSet.series1.dataGroup;
    const totalPoints = groups.reduce((acc, g) => acc + g.data.length, 0);
    expect(totalPoints).toBe(4);
  });

  it('multi-series 면 push 된 point 에 좌표 키(k)를 캐시한다 (렌더 단계 재계산 제거)', () => {
    // configured scatter series 2개 이상이어야 cross-series dedupe 가 살아 element 가 k 를 읽는다.
    const store = buildRealTimeStore(5, {}, ['series1', 'series2']);
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({ series1: [{ x: t, y: 10 }] });

    const groups = store.dataSet.series1.dataGroup;
    const point = groups.flatMap((g) => g.data).find((p) => p.y === 10);
    // 캐시 키는 draw 폴백이 쓰는 Util.coordinateKey 와 동일 포맷이어야 한다(lockstep 보장).
    expect(point.k).toBe(Util.coordinateKey(point.x, point.y));
  });

  it('단일 scatter series 면 dedupe on 이어도 k 를 저장하지 않는다 (canSkip → element 가 k 미사용)', () => {
    const store = buildRealTimeStore(5, {}, ['series1']);
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({ series1: [{ x: t, y: 10 }] });

    const groups = store.dataSet.series1.dataGroup;
    const point = groups.flatMap((g) => g.data).find((p) => p.y === 10);
    expect(point.k).toBeUndefined();
  });

  it('coordinateDedupe=false 면 키를 캐시하지 않는다 (draw 가 키를 보지 않음)', () => {
    // multi-series 라 k 저장 게이트(series>1)는 통과 — 캐시 생략 사유는 오직 dedupe off.
    const store = buildRealTimeStore(5, { coordinateDedupe: false }, ['series1', 'series2']);
    const t = Math.floor(Date.now() / SECOND) * SECOND;

    store.createRealTimeScatterDataSet({ series1: [{ x: t, y: 10 }] });

    const groups = store.dataSet.series1.dataGroup;
    const point = groups.flatMap((g) => g.data).find((p) => p.y === 10);
    expect(point.k).toBeUndefined();
  });
});

describe('model.store createDataSet stack (누적 top 기반)', () => {
  /**
   * 세로 스택 막대 그룹 컨텍스트를 만든다.
   * series: [{ id, data, show?, passingValue? }] (스택 순서대로 = bottom→top)
   */
  const buildStackStore = (series, options = {}) => {
    const seriesList = {};
    const rawData = {};
    series.forEach((s, idx) => {
      seriesList[s.id] = {
        data: [],
        passingValue: s.passingValue ?? null,
        interpolation: null,
        isExistGrp: true,
        isOverlapping: false,
        groupIndex: 0,
        stackIndex: idx, // bottom(0) → addSeriesDS, 그 위는 addSeriesStackDS
        show: s.show ?? true,
        xAxisIndex: 0,
        yAxisIndex: 0,
      };
      rawData[s.id] = s.data;
    });

    const store = Object.assign(Object.create(modules), {
      seriesList,
      options: { horizontal: false, sunburst: false, ...options },
      seriesInfo: { charts: { bar: series.map((s) => s.id) } },
    });

    return { store, seriesList, rawData };
  };

  const ys = (series) => series.data.map((p) => p.y);
  const bs = (series) => series.data.map((p) => p.b);

  it('정상 값은 아래 시리즈의 누적 top 위에 쌓인다', () => {
    const { store, seriesList, rawData } = buildStackStore([
      { id: 's0', data: [10, 1, 5] },
      { id: 's1', data: [20, 30, 2] },
      { id: 's2', data: [5, 5, 5] },
    ]);

    store.createDataSet(rawData, [0, 1, 2]);

    expect(ys(seriesList.s0)).toEqual([10, 1, 5]);
    expect(ys(seriesList.s1)).toEqual([30, 31, 7]); // base + 값
    expect(ys(seriesList.s2)).toEqual([35, 36, 12]);
    expect(bs(seriesList.s2)).toEqual([30, 31, 7]); // 각 포인트의 base = 아래 누적 top
  });

  it('아래 시리즈가 null 인 라벨에서는 그 자리를 건너뛰고 다음 유효 base 위에 쌓인다', () => {
    const { store, seriesList, rawData } = buildStackStore([
      { id: 's0', data: [10, null, 5] }, // i1 null
      { id: 's1', data: [20, 30, null] }, // i2 null
      { id: 's2', data: [5, 5, 5] },
    ]);

    store.createDataSet(rawData, [0, 1, 2]);

    // s1 i1: s0 가 null → baseline(0) 위에 쌓임
    expect(seriesList.s1.data[1].b).toBe(0);
    expect(seriesList.s1.data[1].y).toBe(30);
    // s2 i2: s1 이 null → s0(=5) 위에 쌓임 (s1 자리를 건너뜀)
    expect(seriesList.s2.data[2].b).toBe(5);
    expect(seriesList.s2.data[2].y).toBe(10);
  });

  it('부호가 다른 base 는 건너뛰고 같은 부호의 누적 top 위에 쌓인다', () => {
    const { store, seriesList, rawData } = buildStackStore([
      { id: 's0', data: [10] }, // +
      { id: 's1', data: [-5] }, // -
      { id: 's2', data: [-3] }, // -
      { id: 's3', data: [4] }, // + → s0(=10) 위에
    ]);

    store.createDataSet(rawData, [0]);

    expect(seriesList.s1.data[0].b).toBe(0); // 첫 음수 → baseline
    expect(seriesList.s2.data[0].b).toBe(-5); // 음수 누적 top
    expect(seriesList.s2.data[0].y).toBe(-8);
    expect(seriesList.s3.data[0].b).toBe(10); // 양수 base(s0) 위 — s1/s2(음수) 건너뜀
    expect(seriesList.s3.data[0].y).toBe(14);
  });

  it('숨겨진(show=false) 시리즈는 누적 top 에 기여하지 않는다', () => {
    const { store, seriesList, rawData } = buildStackStore([
      { id: 's0', data: [10] },
      { id: 's1', data: [100], show: false }, // 숨김 → base 에서 제외
      { id: 's2', data: [5] },
    ]);

    store.createDataSet(rawData, [0]);

    // s2 는 숨겨진 s1(=100)이 아니라 s0(=10) 위에 쌓여야 한다
    expect(seriesList.s2.data[0].b).toBe(10);
    expect(seriesList.s2.data[0].y).toBe(15);
  });

  it('passingValue 인 base 는 건너뛴다', () => {
    const { store, seriesList, rawData } = buildStackStore([
      { id: 's0', data: [10] },
      { id: 's1', data: [-1], passingValue: -1 }, // passingValue → base 제외
      { id: 's2', data: [5] },
    ]);

    store.createDataSet(rawData, [0]);

    expect(seriesList.s2.data[0].b).toBe(10); // s1(passing) 건너뛰고 s0 위
    expect(seriesList.s2.data[0].y).toBe(15);
  });
});
