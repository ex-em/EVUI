import { describe, it, expect } from 'vitest';
import Line from './element.line';
import { LINE_OPTION } from '../helpers/helpers.constant';

describe('Chart Interpolation', () => {
  describe('LINE_OPTION 기본값 테스트', () => {
    it('none이 기본값이어야 함', () => {
      expect(LINE_OPTION.interpolation).toBe('none');
    });

    it('passingValue는 null이어야 함', () => {
      expect(LINE_OPTION.passingValue).toBe(null);
    });
  });

  describe('Line class constructor 테스트', () => {
    it('interpolation === "linear" 일 때 useLinearInterpolation === true', () => {
      const line = new Line('test', { interpolation: 'linear' }, 0);
      expect(line.interpolation).toBe('linear');
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation === "none" && passingValue == null, useLinearInterpolation === false', () => {
      const line = new Line('test', { interpolation: 'none' }, 0);
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(null);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation === "none" && passingValue != null && hasPassingValueInData === true, useLinearInterpolation === true', () => {
      const line = new Line('test', { interpolation: 'none', passingValue: -1 }, 0);
      line.hasPassingValueInData = true;
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation === "linear" && passingValue != null, useLinearInterpolation === true', () => {
      const line = new Line('test', { interpolation: 'linear', passingValue: -1 }, 0);
      expect(line.interpolation).toBe('linear');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation === "zero", useLinearInterpolation === false', () => {
      const line = new Line('test', { interpolation: 'zero' }, 0);
      expect(line.interpolation).toBe('zero');
      expect(line.useLinearInterpolation()).toBe(false);
    });
  });

  describe('기존 로직 호환 테스트', () => {
    it('기존 사용법: passingValue만 설정, hasPassingValueInData === true, useLinearInterpolation === true', () => {
      // 기존 사용법: passingValue만 설정
      const line = new Line('test', { passingValue: -1 }, 0);
      line.hasPassingValueInData = true;

      // interpolation은 기본값 'none'이지만 useLinearInterpolation은 true여야 함
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('기존 사용법: passingValue만 설정, hasPassingValueInData === false, useLinearInterpolation === false', () => {
      const line = new Line('test', { passingValue: -1 }, 0);
      line.hasPassingValueInData = false;
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation === "none" && passingValue == null, useLinearInterpolation === false', () => {
      const line = new Line('test', {}, 0);

      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(null);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation === "linear" && passingValue == null, useLinearInterpolation === true', () => {
      const line = new Line('test', { interpolation: 'linear' }, 0);

      expect(line.interpolation).toBe('linear');
      expect(line.useLinearInterpolation()).toBe(true);
    });
  });

  describe('findGraphData directHit 판정', () => {
    // 라인 포인트를 "직격"한 경우(포인트 중심 근처)에는 item.directHit=true로 표시되어,
    // 같은 좌표에 겹친 bar의 directHit보다 우선되어야 한다.
    const makeLine = () => {
      const line = new Line('s1', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = [{ x: 0, y: 100, xp: 50, yp: 100, o: 100 }];
      return line;
    };

    it('라인 포인트 중심을 정확히 클릭하면 hit=true, directHit=true', () => {
      const line = makeLine();
      const item = line.findGraphData([50, 100], false, 0, false);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBe(true);
    });

    it('포인트에서 먼 Y(15px 이내)는 기존처럼 hit=true, directHit=false', () => {
      const line = makeLine();
      // y만 10px 떨어진 위치: yDist < 15이지만 유클리드 거리가 directHitRadius(= 6) 초과
      const item = line.findGraphData([50, 110], false, 0, false);
      expect(item.hit).toBe(true);
      expect(item.directHit).toBeFalsy();
    });

    it('포인트에서 Y/X 모두 크게 떨어지면 hit=false, directHit=false', () => {
      const line = makeLine();
      const item = line.findGraphData([50, 200], false, 0, false);
      expect(item.hit).toBeFalsy();
      expect(item.directHit).toBeFalsy();
    });
  });

  describe('findGraphData — null 데이터 위 dataIndex 호출 (onClick 경로)', () => {
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
  });
});
