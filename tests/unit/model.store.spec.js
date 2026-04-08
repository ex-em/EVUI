import modules from '@/components/chart/model/model.store';

/**
 * model.store의 메서드들은 차트 인스턴스의 this에 바인딩되어 사용됨.
 * 테스트에서는 필요한 속성만 주입한 가짜 컨텍스트를 만들어 메서드를 직접 호출한다.
 */
const createStore = (seriesList, options = {}, extras = {}) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false, ...options },
    ...extras,
  });

/**
 * findGraphData mock.
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
 * 인덱스별 데이터 포인트 배열을 받아, 호출 시 dataIndex가 주어지면 그 인덱스 포인트를,
 * 주어지지 않으면 "가장 가까운 non-null 포인트"(binary-search 경로 근사)를 반환한다.
 * line.findGraphData의 null 필터링 동작을 재현하기 위함이다.
 */
const mockLineWithIndexedData = ({ points, hitIndex = null, directHitIndex = null }) => ({
  type: 'line',
  show: true,
  data: points, // 로컬 nearest label 계산에 사용됨
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
    // dataIndex가 없으면 가장 가까운 non-null 포인트 반환 (line binary-search 모방)
    const firstNonNullIdx = points.findIndex(p => p && p.o !== null);
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
  describe('fallback 등록 조건 — null 값 제외', () => {
    it('값(data.o)이 null인 첫 시리즈는 fallback 후보가 아니다', () => {
      // combo area 차트: 같은 라벨 위치에서 A는 값이 없고 B만 값이 있음.
      // 어느 시리즈도 hit=false인 "빈 영역 클릭" 상황.
      // 기대: fallback이 값이 존재하는 B로 잡혀야 한다.
      const noValueSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: null, o: null, xp: 100, yp: null, index: 2 },
        hit: false,
        directHit: false,
      });
      const valueSeries = mockSeries({
        type: 'line',
        data: { x: '2026-01-01', y: 50, o: 50, xp: 100, yp: 80, index: 2 },
        hit: false,
        directHit: false,
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
      // NaN/null만 제외해야 한다. 0은 정상 값.
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

      // nullSeries가 먼저이지만 값이 없으니 fallback은 zeroSeries여야 한다.
      const store = createStore({ null1: nullSeries, zero1: zeroSeries });
      const result = store.getHitItemByPosition([100, 200]);

      expect(result.sId).toBe('zero1');
      expect(result.value).toBe(0);
    });
  });

  describe('dataIndex 미지정 시 로컬 nearest 라벨 계산', () => {
    it('클릭 라벨에서 값이 null인 시리즈는 이웃 라벨의 값으로 잘못 선택되지 않는다', () => {
      // series1 의 index 1 만 null, series2 는 index 1 에 값 있음.
      // 클릭 좌표는 index 1 근처 (xp=50 부근).
      // 기대: 로컬 nearest 가 index 1 을 리턴 → series1 은 null 로 제외 → series2 선택.
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

    it('두 시리즈 모두 null 인 라벨 클릭 시 이웃 라벨의 값이 잘못 선택되지 않는다', () => {
      // index 1 에서 두 시리즈 모두 null, 이웃 라벨 (0, 2) 에는 값 존재.
      // findClosestDataIndex 는 hasValidData 필터로 index 1 을 건너뛰지만,
      // 로컬 nearest 는 필터 없이 index 1 을 리턴 → 두 시리즈 모두 null 값 가드에
      // 걸려 제외 → sId='' 리턴 (미선택).
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
      const result = store.getHitItemByPosition([50, 250]);

      expect(result.sId).toBe('');
      expect(result.dataIndex).toBe(null);
    });
  });

  describe('fallback 거리 기반 선택', () => {
    it('두 시리즈 모두 값이 있고 hit=false일 때, 클릭 좌표에 더 가까운 시리즈가 선택된다', () => {
      // 같은 라벨에 두 area 시리즈가 모두 값을 가진 상황.
      // 클릭이 두 포인트 사이 어딘가에 있고, 어느 쪽도 hit 임계치를 넘지 않는 경우.
      // 기대: 좌표상 더 가까운 series2가 선택되어야 한다.
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

      // 클릭: (50, 210) — nearSeries(거리 10)가 farSeries(거리 110)보다 훨씬 가까움.
      // 시리즈 순서는 "far가 먼저". 과거엔 첫 시리즈 고정이라 far가 선택되었으나,
      // 이제 거리 기반이라 near가 선택되어야 한다.
      const store = createStore({ far: farSeries, near: nearSeries });
      const result = store.getHitItemByPosition([50, 210]);

      expect(result.sId).toBe('near');
      expect(result.value).toBe(50);
    });

    it('bar+line combo: bar 위쪽 빈 영역 클릭 시, 박스 거리 기준으로 bar가 선택된다', () => {
      // 재현 시나리오:
      //   series1 (line, 작은 값): 포인트 yp=200
      //   series2 (bar, 큰 값): 박스 xp=40, yp=300, w=20, h=-200 → 박스 y [100, 300]
      // 클릭 (50, 50) — 바 상단(100) 위쪽의 빈 영역. 어느 쪽도 hit 아님.
      //
      // 단순 "(xp, yp) 거리" 로 재면:
      //   bar  : (50-40)² + (50-300)² = 100 + 62500 = 62600
      //   line : (50-50)² + (50-200)² =   0 + 22500 = 22500
      // → line 이 이겨서 사용자의 "bar 가 선택되어야 한다" 기대에 어긋남.
      //
      // "박스 거리" 로 재면 (bar 는 박스, line 은 포인트):
      //   bar  : dx=0(박스 x 범위 내), dy=100-50=50 → 2500
      //   line : 22500
      // → bar 가 이긴다 ✓
      const lineSeries = mockSeries({
        type: 'line',
        data: { x: 'L1', y: 30, o: 30, xp: 50, yp: 200, w: null, h: null, index: 1 },
        hit: false,
        directHit: false,
      });
      const barSeries = mockSeries({
        type: 'bar',
        data: { x: 'L1', y: 50, o: 50, xp: 40, yp: 300, w: 20, h: -200, index: 1 },
        hit: false,
        directHit: false,
      });

      const store = createStore({ series1: lineSeries, series2: barSeries });
      const result = store.getHitItemByPosition([50, 50]);

      expect(result.sId).toBe('series2');
      expect(result.type).toBe('bar');
    });

    it('null인 시리즈는 더 가까워도 fallback에서 제외된다 (값 가드 우선)', () => {
      // 거리만 놓고 보면 nullSeries가 더 가깝지만, 값이 null이므로 후보에서 제외.
      // 값이 있는 valueSeries가 선택되어야 한다.
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

  describe('기존 hit 기반 우선순위 회귀 방지', () => {
    it('bar 박스 내부 클릭(directHit)은 더 가까운 line 포인트(hit)보다 우선 선택된다', () => {
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
    });

    it('값이 있는 hit=false 시리즈는 여전히 fallback으로 선택된다 (거리 기반)', () => {
      // 클릭에 더 가까운 s1이 fallback으로 잡히는지 확인.
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
});
