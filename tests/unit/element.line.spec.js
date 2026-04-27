import Line from '@/components/chart/element/element.line';

describe('Line Element findGraphData', () => {
  describe('null 데이터 위 dataIndex 호출 (onClick 경로)', () => {
    // FillWithNull.vue 데이터 모사. onClick 은 useSelectLabelOrItem=false 로 호출.
    const makeSeries1 = () => {
      const line = new Line('series1', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = [
        { x: '01/01', y: 20, o: 20, xp: 0, yp: 160 },
        { x: '01/02', y: 45, o: 45, xp: 20, yp: 110 },
        { x: '01/03', y: null, o: null, xp: 40, yp: null },
        { x: '01/04', y: null, o: null, xp: 60, yp: null },
        { x: '01/05', y: 80, o: 80, xp: 80, yp: 40 },
        { x: '01/06', y: 55, o: 55, xp: 100, yp: 90 },
        { x: '01/07', y: null, o: null, xp: 120, yp: null },
        { x: '01/08', y: 50, o: 50, xp: 140, yp: 100 },
      ];
      return line;
    };

    const makeSeries2 = () => {
      const line = new Line('series2', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = [
        { x: '01/01', y: 55, o: 55, xp: 0, yp: 90 },
        { x: '01/02', y: 30, o: 30, xp: 20, yp: 140 },
        { x: '01/03', y: 40, o: 40, xp: 40, yp: 120 },
        { x: '01/04', y: null, o: null, xp: 60, yp: null },
        { x: '01/05', y: 45, o: 45, xp: 80, yp: 110 },
        { x: '01/06', y: 25, o: 25, xp: 100, yp: 150 },
        { x: '01/07', y: 65, o: 65, xp: 120, yp: 70 },
        { x: '01/08', y: 40, o: 40, xp: 140, yp: 120 },
      ];
      return line;
    };

    it('series1 dataIndex=2 (o=null, yp=null) 위쪽 클릭 → hit=false, directHit=false', () => {
      const line = makeSeries1();
      const item = line.findGraphData([40, 10], false, 2, false);
      expect(item.hit).toBeFalsy();
      expect(item.directHit).toBeFalsy();
    });

    it('series1 dataIndex=2 → 반환된 data.o 는 null 을 그대로 보존한다', () => {
      const line = makeSeries1();
      const item = line.findGraphData([40, 10], false, 2, false);
      expect(item.data?.o).toBe(null);
      expect(item.data?.yp).toBe(null);
    });

    it('series2 dataIndex=2 (o=40, yp=120) 위쪽(클릭 yp=10) → hit=false 이지만 data.o=40', () => {
      const line = makeSeries2();
      const item = line.findGraphData([40, 10], false, 2, false);
      expect(item.hit).toBeFalsy();
      expect(item.data?.o).toBe(40);
      expect(item.data?.yp).toBe(120);
    });

    it('o=0 인 데이터(0은 의미 있는 값) 위 dataIndex 호출 → hit 판정에 정상 진입', () => {
      // 가드가 truthy 체크(if (point.o))로 바뀌면 0 데이터가 깨짐 — 회귀 가드.
      const line = new Line('zeroSeries', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = [
        { x: 'L0', y: 0, o: 0, xp: 50, yp: 100 },
      ];
      const item = line.findGraphData([50, 100], false, 0, false);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
      expect(item.data?.o).toBe(0);
    });

    it('yp=0 인 데이터(차트 상단 baseline) 위 클릭 → hit 판정에 정상 진입', () => {
      const line = new Line('topSeries', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = [
        { x: 'L0', y: 100, o: 100, xp: 50, yp: 0 },
      ];
      const item = line.findGraphData([50, 5], false, 0, false);
      expect(item.hit).toBe(true);
      expect(item.data?.yp).toBe(0);
    });
  });
});
