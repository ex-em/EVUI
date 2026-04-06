import { describe, it, expect } from 'vitest';
import modules from './plugins.interaction';

/**
 * findHitItem 테스트를 위한 가짜 차트 컨텍스트.
 * plugins.interaction의 메서드들은 차트 인스턴스의 this에 바인딩되어 사용되므로,
 * 필요한 속성과 최소한의 의존 메서드를 주입한 컨텍스트를 만들어 직접 호출한다.
 */
const createChart = (seriesList, opts = {}) =>
  Object.assign(Object.create(modules), {
    seriesList,
    options: { horizontal: false, ...opts },
    tooltipCtx: null,
    getFormattedTooltipLabel: ({ seriesName }) => seriesName,
    getFormattedTooltipValue: ({ value }) => String(value),
    findClosestDataIndex: () => 0,
    isNotUseIndicator: () => false,
  });

/**
 * findGraphData가 고정된 item을 리턴하는 mock 시리즈.
 */
const mockSeries = ({
  show = true,
  data,
  hit = false,
  directHit = false,
  interpolation = 'linear',
  isExistGrp = false,
}) => ({
  show,
  id: 'mock-id',
  name: 'mock-name',
  xAxisIndex: 0,
  yAxisIndex: 0,
  interpolation,
  isExistGrp,
  findGraphData: () => ({
    data,
    hit,
    directHit,
    index: data?.index ?? 0,
  }),
});

describe('plugins.interaction findHitItem', () => {
  describe('directHit 우선순위', () => {
    it('bar directHit는 더 가까운 line 포인트보다 우선 선택된다 (DSP-37527)', () => {
      // bar: directHit=true, 좌표는 클릭 지점에서 멀리 있음 (박스 꼭짓점 기준)
      // line: hit=true (directHit 아님), 좌표는 클릭 지점에 매우 가까움 (포인트)
      // 기존엔 거리만 봐서 line이 이겼으나, directHit 도입 후 bar가 이겨야 한다.
      const chart = createChart({
        bar1: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 90, o: 10 },
          hit: true,
          directHit: true,
        }),
        line1: mockSeries({
          data: { x: 0, y: 100, xp: 51, yp: 101, o: 100 },
          hit: true,
          directHit: false,
        }),
      });

      const result = chart.findHitItem([50, 100]);
      expect(result.hitId).toBe('bar1');
    });

    it('여러 bar에 directHit가 겹치면 클릭 좌표에 가장 가까운 bar가 선택된다', () => {
      const chart = createChart({
        far: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 20, o: 10 },
          hit: true,
          directHit: true,
        }),
        near: mockSeries({
          data: { x: 0, y: 20, xp: 48, yp: 52, o: 20 },
          hit: true,
          directHit: true,
        }),
      });

      const result = chart.findHitItem([50, 50]);
      expect(result.hitId).toBe('near');
    });
  });

  describe('일반 line 차트 회귀 방지', () => {
    it('directHit가 없으면 거리 기반으로 가장 가까운 hit 시리즈가 선택된다', () => {
      const chart = createChart({
        far: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 10, o: 10 },
          hit: true,
        }),
        near: mockSeries({
          data: { x: 0, y: 20, xp: 49, yp: 51, o: 20 },
          hit: true,
        }),
      });

      const result = chart.findHitItem([50, 50]);
      expect(result.hitId).toBe('near');
    });
  });

  describe('hit 없을 때 fallback', () => {
    it('모든 시리즈가 hit=false면 items의 첫 번째 키로 fallback 한다', () => {
      const chart = createChart({
        s1: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 20, o: 10 },
          hit: false,
        }),
        s2: mockSeries({
          data: { x: 0, y: 20, xp: 30, yp: 40, o: 20 },
          hit: false,
        }),
      });

      const result = chart.findHitItem([1000, 1000]);
      expect(result.hitId).toBe('s1');
    });
  });

  describe('items 수집', () => {
    it('hit 여부와 무관하게 유효한 data를 가진 모든 시리즈가 items에 포함된다 (tooltip용)', () => {
      const chart = createChart({
        bar1: mockSeries({
          data: { x: 0, y: 10, xp: 10, yp: 20, o: 10 },
          hit: true,
          directHit: true,
        }),
        line1: mockSeries({
          data: { x: 0, y: 100, xp: 30, yp: 40, o: 100 },
          hit: true,
          directHit: false,
        }),
      });

      const result = chart.findHitItem([10, 20]);
      expect(Object.keys(result.items).sort()).toEqual(['bar1', 'line1']);
      expect(result.hitId).toBe('bar1');
    });
  });
});
