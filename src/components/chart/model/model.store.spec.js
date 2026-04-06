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
    it('bar/line 모두 hit=false면 데이터 있는 첫 시리즈로 fallback 한다', () => {
      const s1 = mockSeries({
        type: 'bar',
        data: { x: 0, y: 10, xp: 10, yp: 20, o: 10, index: 0 },
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
});
