import Bar from '@/components/chart/element/element.bar';

const createBar = (overrides = {}) => {
  const bar = Object.create(Bar.prototype);
  Object.assign(bar, overrides);
  return bar;
};

describe('Bar Element', () => {
  describe('calculateBarSize', () => {
    it('px 문자열을 파싱하여 크기를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('30px', 50)).toBe(30);
    });

    it('px 값이 bArea보다 크면 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('100px', 50)).toBe(50);
    });

    it('0~1 사이 숫자는 비율로 계산한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0.5, 100)).toBe(50);
    });

    it('비율 0은 0을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(0, 100)).toBe(0);
    });

    it('비율 1은 전체 영역을 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize(1, 100)).toBe(100);
    });

    it('유효하지 않은 값은 bArea를 반환한다', () => {
      const bar = createBar();
      expect(bar.calculateBarSize('auto', 80)).toBe(80);
      expect(bar.calculateBarSize(null, 80)).toBe(80);
      expect(bar.calculateBarSize(2, 80)).toBe(80);
    });
  });

  describe('isPointInBar', () => {
    it('바 영역 내 점은 true를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      // bar: x 10~30, y 20~50
      expect(bar.isPointInBar([15, 40], barData)).toBe(true);
    });

    it('바 영역 밖 점은 false를 반환한다', () => {
      const bar = createBar();
      const barData = { xp: 10, yp: 50, w: 20, h: -30 };
      expect(bar.isPointInBar([5, 40], barData)).toBe(false);
      expect(bar.isPointInBar([35, 40], barData)).toBe(false);
    });
  });

  describe('findGraphData directHit 플래그', () => {
    // bar: x 10~30, y 20~50
    const barData = { xp: 10, yp: 50, w: 20, h: -30, index: 0 };

    const createBarWithData = () =>
      createBar({
        data: [barData],
        show: true,
        color: '#000',
        visibleStartIndex: 0,
        filteredCount: 1,
      });

    it('bar 박스 내부 클릭은 hit=true, directHit=true를 반환한다', () => {
      const bar = createBarWithData();
      const item = bar.findGraphData([15, 40], false, 0, true);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
    });

    it('bar 박스 밖 클릭은 hit=false, directHit=false를 반환한다', () => {
      const bar = createBarWithData();
      const item = bar.findGraphData([5, 40], false, 0, true);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBe(false);
    });

    it('binarySearchBar 경로(findGraphRange)에서도 directHit를 세팅한다', () => {
      // useIndicatorOnLabel=false로 두면 findGraphRange → binarySearchBar 경로 진입
      const bar = createBarWithData();
      const item = bar.findGraphData([15, 40], false, undefined, false);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
    });

    it('binarySearchBar에서 x범위 밖 클릭은 directHit가 세팅되지 않는다', () => {
      // binarySearchBar는 inRange 조건을 만족해야 item이 세팅됨.
      // 범위 밖이면 초기값 { hit: false } 유지 (directHit 없음 = falsy).
      const bar = createBarWithData();
      const item = bar.findGraphData([50, 40], false, undefined, false);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });
  });

  describe('null 데이터 안전 fall-through (회귀 가드)', () => {
    // bar 박스 비교는 null 좌표에서 NaN 으로 false fall-through.
    const nullBar = { xp: null, yp: null, w: null, h: null, o: null, index: 0 };
    const createBarWithNullData = () =>
      createBar({
        data: [nullBar],
        show: true,
        color: '#000',
        visibleStartIndex: 0,
        filteredCount: 1,
      });

    it('isPointInBar 는 null 박스 좌표에서 false 를 반환한다', () => {
      const bar = createBar();
      expect(bar.isPointInBar([40, 10], { xp: null, yp: null, w: null, h: null })).toBe(false);
    });

    it('dataIndex 분기(useIndicatorOnLabel=true) + null 데이터 → hit=false', () => {
      const bar = createBarWithNullData();
      const item = bar.findGraphData([40, 10], false, 0, true);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });

    it('binarySearchBar 경로(useIndicatorOnLabel=false) + null 데이터 → hit=false', () => {
      const bar = createBarWithNullData();
      const item = bar.findGraphData([40, 10], false, undefined, false);
      expect(item.hit).toBe(false);
      expect(item.directHit).toBeFalsy();
    });
  });
});
