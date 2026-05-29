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

  describe('axis range 밖 데이터 — clamp 회귀 방지', () => {
    // commit 2a1c2d0c 가 도입한 getXPos/getYPos 의 Math.min/max clamp 가 다시 들어오면
    // range 밖 포인트가 차트 edge 에 그려지고 hover/maxTip 에 잡혀 회귀가 발생한다.
    // axis range 밖 데이터는 xp/yp = null 이 되어 시각 표시·hit 판정에서 모두 제외돼야 한다.
    const makeStubCtx = () => ({
      calls: [],
      beginPath() { this.calls.push(['beginPath']); },
      save() {},
      restore() {},
      stroke() {},
      fill() {},
      closePath() {},
      setLineDash() {},
      moveTo(x, y) { this.calls.push(['moveTo', x, y]); },
      lineTo(x, y) { this.calls.push(['lineTo', x, y]); },
      arc() {},
      arcTo() {},
      fillRect() {},
      strokeRect() {},
      rect() {},
      clip() {},
      createLinearGradient: () => ({ addColorStop() {} }),
      measureText: () => ({ width: 0 }),
      strokeStyle: '',
      fillStyle: '',
      lineJoin: '',
      lineWidth: 1,
    });

    const drawWithRange = (data, { xMin = 0, xMax = 100, yMin = 0, yMax = 100 } = {}) => {
      const line = new Line('series', { interpolation: 'none' }, 0);
      line.show = true;
      line.pointSize = 3;
      line.data = data.map((d) => ({ ...d, o: d.o ?? d.y }));
      const ctx = makeStubCtx();
      line.draw({
        ctx,
        chartRect: { x1: 0, x2: 200, y1: 0, y2: 200, chartWidth: 200, chartHeight: 200 },
        labelOffset: { top: 0, bottom: 0, left: 0, right: 0 },
        axesSteps: {
          x: [{ graphMin: xMin, graphMax: xMax }],
          y: [{ graphMin: yMin, graphMax: yMax }],
        },
      });
      return { line, ctx };
    };

    it('X 가 graphMax 를 초과하는 데이터는 xp=null 로 세팅되어 hit 후보에서 제외된다', () => {
      const { line } = drawWithRange([
        { x: 10, y: 50 },
        { x: 50, y: 50 },
        { x: 200, y: 50 }, // graphMax(100) 초과
      ]);
      expect(line.data[0].xp).not.toBe(null);
      expect(line.data[1].xp).not.toBe(null);
      // X 가 range 밖이면 xp 가 null 이어야 함 — 이 한 값만 null 이어도 draw/hit 가드(`xp === null`)에 걸려 제외된다.
      expect(line.data[2].xp).toBe(null);
    });

    it('X 가 graphMin 미만인 데이터는 xp=null 로 세팅된다', () => {
      const { line } = drawWithRange([
        { x: -10, y: 50 }, // graphMin(0) 미만
        { x: 50, y: 50 },
      ]);
      expect(line.data[0].xp).toBe(null);
      expect(line.data[1].xp).not.toBe(null);
    });

    it('Y 가 graphMax 를 초과하는 데이터는 yp=null 로 세팅된다 (clamp 미적용)', () => {
      const { line } = drawWithRange([
        { x: 10, y: 50 },
        { x: 50, y: 500 }, // graphMax(100) 초과
      ]);
      expect(line.data[1].yp).toBe(null);
    });

    it('range 밖 포인트에서 ctx.moveTo/lineTo 가 null 좌표로 호출되지 않는다', () => {
      const { ctx } = drawWithRange([
        { x: 10, y: 50 },
        { x: 200, y: 50 }, // out of range
        { x: 90, y: 50 },
      ]);
      const pathCalls = ctx.calls.filter(([op]) => op === 'moveTo' || op === 'lineTo');
      for (const [, x, y] of pathCalls) {
        expect(x).not.toBe(null);
        expect(y).not.toBe(null);
      }
    });

    it('range 밖에서 라인이 끊기고 in-range 재진입 시 moveTo 로 다시 시작한다', () => {
      const { ctx } = drawWithRange([
        { x: 10, y: 50 },
        { x: 200, y: 50 }, // out of range — 라인 끊김
        { x: 90, y: 50 },
      ]);
      const moveLineOps = ctx.calls.filter(([op]) => op === 'moveTo' || op === 'lineTo');
      // 첫 in-range 포인트 → moveTo, range 밖 skip, 그 다음 in-range 포인트는 prevValid=undefined 라 다시 moveTo.
      expect(moveLineOps[0][0]).toBe('moveTo');
      expect(moveLineOps[1][0]).toBe('moveTo');
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
