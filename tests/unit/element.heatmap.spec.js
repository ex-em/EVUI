import HeatMap from '@/components/chart/element/element.heatmap';

const createHeatMap = (overrides = {}) => {
  const hm = Object.create(HeatMap.prototype);
  Object.assign(hm, overrides);
  return hm;
};

describe('HeatMap Element', () => {
  describe('getAdjustedBounds', () => {
    it('기본 범위를 조정한다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10,
        yp: 20,
        width: 30,
        height: 40,
      });
      expect(result.xsp).toBe(10);
      expect(result.xep).toBe(40);
      expect(result.ysp).toBe(20);
      expect(result.yep).toBe(60);
    });

    it('음수 width/height는 0으로 조정된다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10,
        yp: 20,
        width: -5,
        height: -10,
      });
      expect(result.xep).toBeGreaterThanOrEqual(result.xsp);
      expect(result.yep).toBeGreaterThanOrEqual(result.ysp);
    });

    it('소수점 값의 부동소수점 오차를 보정한다', () => {
      const hm = createHeatMap();
      const result = hm.getAdjustedBounds({
        xp: 10.123,
        yp: 20.456,
        width: 5.789,
        height: 3.012,
      });
      // xsp는 floor, xep는 ceil 처리
      expect(result.xsp).toBeLessThanOrEqual(10.123);
      expect(result.xep).toBeGreaterThanOrEqual(10.123 + 5.789);
    });
  });

  describe('getFilteredLabel', () => {
    it('count가 일치하면 labels을 그대로 반환한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3, 4, 5];
      expect(hm.getFilteredLabel(labels, 5, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('count가 다르면 min/max 범위로 필터링한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3, 4, 5];
      expect(hm.getFilteredLabel(labels, 10, 2, 4)).toEqual([2, 3, 4]);
    });

    it('범위에 맞는 레이블이 없으면 빈 배열을 반환한다', () => {
      const hm = createHeatMap();
      const labels = [1, 2, 3];
      expect(hm.getFilteredLabel(labels, 10, 10, 20)).toEqual([]);
    });
  });

  describe('findGraphData null 데이터 안전 fall-through (회귀 가드)', () => {
    // 셀 박스 비교 `x <= xp && xp <= x+w` 는 null 좌표에서 NaN 비교로 false fall-through.
    it('null 좌표 셀은 hit=false 로 fall-through 한다', () => {
      const hm = createHeatMap({
        data: [{ xp: null, yp: null, w: null, h: null, value: null }],
      });
      const item = hm.findGraphData([40, 10]);
      expect(item.hit).toBe(false);
      expect(item.data).toBe(null);
    });

    it('정상 셀 내부 클릭은 hit=true (회귀 가드)', () => {
      const hm = createHeatMap({
        data: [{ xp: 30, yp: 0, w: 20, h: 20, value: 5, dataColor: '#abc' }],
      });
      const item = hm.findGraphData([40, 10]);
      expect(item.hit).toBe(true);
      expect(item.index).toBe(0);
    });
  });
});
