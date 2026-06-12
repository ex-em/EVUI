import { describe, it, expect, vi, afterEach } from 'vitest';
import Line from './element.line';
import Canvas from '../helpers/helpers.canvas';
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

/**
 * line 연속 동일픽셀 lineTo 생략(path 생략) 테스트 — 시각 회귀(Chart.visual.spec.js)와 분리된 축.
 *
 * 검증 목표:
 *  1) 데이터 불변성: 직전에 찍은 점과 완전히 같은 픽셀로의 lineTo 만 생략한다. 동일 좌표로의
 *     lineTo 는 zero-length no-op 이므로, 중복 점을 가진 데이터의 stroke 명령 시퀀스가
 *     중복을 제거한 데이터의 시퀀스와 완전히 동일해야 한다.
 *  2) 생략 제외 조건: 서로 다른 픽셀의 점(방향 전환점 포함)·null 경계(moveTo)·marker 기준점
 *     (xp/yp)은 생략되지 않는다.
 *
 * fill(area)·marker 는 stroke path 와 분리된 별도 경로다 — fill 은 자체 path 를 xp/yp 로 다시
 * 그리고, marker 는 별도 루프가 xp/yp 를 읽어 그린다. 본 최적화는 stroke 의 lineTo 분기에만
 * 적용되고 xp/yp 는 매 점 항상 설정되므로(4번 테스트) fill/marker 경계는 보존된다. step-line
 * 보간은 element.line.js draw 에 존재하지 않으므로 적용 대상이 아니다.
 */
describe('element.line path 생략 (연속 동일 픽셀 lineTo)', () => {
  // stroke 의 moveTo/lineTo 만 기록하는 mock canvas context.
  const makeCtx = () => {
    const cmds = [];
    const noop = () => {};
    return {
      cmds,
      save: noop,
      restore: noop,
      beginPath: noop,
      closePath: noop,
      stroke: noop,
      fill: noop,
      setLineDash: noop,
      arc: noop,
      fillRect: noop,
      createLinearGradient: () => ({ addColorStop: noop }),
      moveTo(x, y) {
        cmds.push(['moveTo', x, y]);
      },
      lineTo(x, y) {
        cmds.push(['lineTo', x, y]);
      },
    };
  };

  // 축 범위·차트 영역을 고정해 동일 raw → 동일 픽셀이 결정적으로 나오게 한다.
  const baseParam = (ctx) => ({
    ctx,
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 4 }], y: [{ graphMin: 0, graphMax: 100 }] },
    isBrush: true,
  });

  const makeLine = (data) => {
    const line = new Line('s0', {}, 0);
    line.data = data;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.interpolation = 'none';
    line.combo = false;
    line.isExistGrp = false;
    line.fill = false;
    line.point = false;
    line.show = true;
    return line;
  };

  it('연속 동일 픽셀 점의 lineTo 를 생략하며, 중복 제거 데이터와 명령 시퀀스가 동일하다', () => {
    const dataWithDup = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 20, o: 20 },
      { x: 1, y: 20, o: 20 }, // 직전과 완전히 같은 픽셀 → 생략 대상
      { x: 1, y: 20, o: 20 }, // 생략 대상
      { x: 2, y: 30, o: 30 },
    ];
    const dataNoDup = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 20, o: 20 },
      { x: 2, y: 30, o: 30 },
    ];

    const ctxDup = makeCtx();
    makeLine(dataWithDup).draw(baseParam(ctxDup));

    const ctxNoDup = makeCtx();
    makeLine(dataNoDup).draw(baseParam(ctxNoDup));

    // 데이터 불변성: 중복 점이 있어도 stroke 명령 시퀀스는 중복 없는 데이터와 완전히 동일.
    expect(ctxDup.cmds).toEqual(ctxNoDup.cmds);
    expect(ctxDup.cmds.filter((c) => c[0] === 'moveTo')).toHaveLength(1);
    expect(ctxDup.cmds.filter((c) => c[0] === 'lineTo')).toHaveLength(2);

    // 연속 명령에 동일 좌표가 남아있지 않음(중복이 실제로 제거됨).
    for (let i = 1; i < ctxDup.cmds.length; i++) {
      const [, px, py] = ctxDup.cmds[i - 1];
      const [, x, y] = ctxDup.cmds[i];
      expect(px === x && py === y).toBe(false);
    }
  });

  it('서로 다른 픽셀의 점(방향 전환점 포함)은 모두 보존한다', () => {
    // V 형태: 가운데가 방향 전환점이며 세 점 모두 다른 픽셀.
    const data = [
      { x: 0, y: 0, o: 0 },
      { x: 1, y: 50, o: 50 },
      { x: 2, y: 0, o: 0 },
    ];
    const ctx = makeCtx();
    makeLine(data).draw(baseParam(ctx));

    expect(ctx.cmds.filter((c) => c[0] === 'moveTo')).toHaveLength(1);
    expect(ctx.cmds.filter((c) => c[0] === 'lineTo')).toHaveLength(2);
  });

  it('null 경계는 moveTo 로 끊기며 생략 대상이 아니다', () => {
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: null, o: null }, // null → path 끊김(moveTo)
      { x: 2, y: 20, o: 20 },
    ];
    const ctx = makeCtx();
    makeLine(data).draw(baseParam(ctx));

    // 생략은 lineTo 분기에만 적용 → null 경계의 moveTo 는 그대로 유지.
    expect(ctx.cmds.filter((c) => c[0] === 'moveTo')).toHaveLength(3);
    expect(ctx.cmds.filter((c) => c[0] === 'lineTo')).toHaveLength(0);
  });

  it('생략된 점도 xp/yp 가 설정된다 (marker/area fill 기준점 보존)', () => {
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 20, o: 20 },
      { x: 1, y: 20, o: 20 }, // lineTo 는 생략되지만 좌표는 계산되어야 함
    ];
    makeLine(data).draw(baseParam(makeCtx()));

    data.forEach((p) => {
      expect(typeof p.xp).toBe('number');
      expect(typeof p.yp).toBe('number');
    });
  });
});

/**
 * 빈(all-null) 시리즈 래스터 skip — 전부 null 인 line 시리즈는 픽셀을 0개 그리므로(선/마커/fill 없음)
 * 래스터를 통째로 건너뛴다. 단 computeGeometry(기하)는 유지해 hover/indicator/label-snap 이 동작하고,
 * series.data 는 그대로라 범례/툴팁도 불변. 'zero' 변환(o=0)·stacked(isExistGrp)는 제외 대상.
 */
describe('element.line 빈(all-null) 시리즈 래스터 skip', () => {
  const noop = () => {};
  const makeCtx = () => {
    const n = { beginPath: 0, moveTo: 0, lineTo: 0, stroke: 0, fill: 0, arc: 0 };
    return {
      n,
      save: noop,
      restore: noop,
      closePath: noop,
      setLineDash: noop,
      fillRect: noop,
      strokeRect: noop,
      createLinearGradient: () => ({ addColorStop: noop }),
      beginPath() { n.beginPath++; },
      moveTo() { n.moveTo++; },
      lineTo() { n.lineTo++; },
      stroke() { n.stroke++; },
      fill() { n.fill++; },
      arc() { n.arc++; },
    };
  };

  // isBrush:false 라야 마커 블록까지 실행된다(skip 이 마커도 막는지 검증).
  const baseParam = (ctx) => ({
    ctx,
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 4 }], y: [{ graphMin: 0, graphMax: 100 }] },
    isBrush: false,
  });

  const makeLine = (data, overrides = {}) => {
    const line = new Line('s0', { interpolation: overrides.interpolation ?? 'none' }, 0);
    line.data = data;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.combo = false;
    line.isExistGrp = overrides.isExistGrp ?? false;
    line.fill = false;
    line.point = false;
    line.show = true;
    return line;
  };

  it('all-null(interpolation none) 시리즈는 canvas 래스터를 전혀 호출하지 않는다', () => {
    const data = [
      { x: 0, y: null, o: null },
      { x: 1, y: null, o: null },
      { x: 2, y: null, o: null },
    ];
    const ctx = makeCtx();
    makeLine(data).draw(baseParam(ctx));

    expect(ctx.n.beginPath).toBe(0);
    expect(ctx.n.moveTo).toBe(0);
    expect(ctx.n.lineTo).toBe(0);
    expect(ctx.n.arc).toBe(0);
    expect(ctx.n.fill).toBe(0);
    // 기하는 유지: computeGeometry 가 xp 를 채웠다.
    data.forEach((p) => expect(typeof p.xp).toBe('number'));
  });

  it('값이 하나라도 있으면 정상적으로 그린다(skip 안 됨)', () => {
    const data = [
      { x: 0, y: null, o: null },
      { x: 1, y: 20, o: 20 },
      { x: 2, y: null, o: null },
    ];
    const ctx = makeCtx();
    makeLine(data).draw(baseParam(ctx));

    expect(ctx.n.beginPath).toBeGreaterThan(0);
    expect(ctx.n.moveTo).toBeGreaterThan(0);
  });

  it('빈 배열(data.length===0)도 skip 된다', () => {
    const ctx = makeCtx();
    makeLine([]).draw(baseParam(ctx));

    expect(ctx.n.beginPath).toBe(0);
    expect(ctx.n.moveTo).toBe(0);
  });

  it("interpolation 'zero' 로 0 변환된 데이터(o=0)는 skip 하지 않는다", () => {
    // createDataSet 이 null→0 으로 바꾼 뒤 상태 모사.
    const data = [
      { x: 0, y: 0, o: 0 },
      { x: 1, y: 0, o: 0 },
      { x: 2, y: 0, o: 0 },
    ];
    const ctx = makeCtx();
    makeLine(data, { interpolation: 'zero' }).draw(baseParam(ctx));

    expect(ctx.n.moveTo).toBeGreaterThan(0);
  });

  it('all-null + isExistGrp(stacked) 는 skip 하지 않는다', () => {
    const data = [
      { x: 0, y: null, o: null },
      { x: 1, y: null, o: null },
    ];
    const ctx = makeCtx();
    makeLine(data, { isExistGrp: true }).draw(baseParam(ctx));

    expect(ctx.n.beginPath).toBeGreaterThan(0);
  });
});

/**
 * 마커 배치 렌더링 — isSingle(양옆 null) 고립점이 point:false 에서도 마커로 그려지는데,
 * 이를 점마다 fill/stroke(path-per-point) 하던 것을 색(blur/focus)별 배치로 모은다.
 * 라이브 대시보드(5초 라벨 그리드 × 10초 데이터 → 50% null 교차)에서 fill/stroke 콜 폭주를 막는 핵심.
 */
describe('element.line 마커 배치 렌더링', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const noop = () => {};
  const makeCtx = () => ({
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    stroke: noop,
    fill: noop,
    setLineDash: noop,
    arc: noop,
    moveTo: noop,
    lineTo: noop,
    fillRect: noop,
    strokeRect: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
  });

  // isBrush:false 라야 마커 블록이 실행된다(true면 마커 자체를 건너뜀).
  const baseParam = (ctx) => ({
    ctx,
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 4 }], y: [{ graphMin: 0, graphMax: 100 }] },
    isBrush: false,
  });

  const makeLine = (data) => {
    const line = new Line('s0', {}, 0);
    line.data = data;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.interpolation = 'none';
    line.combo = false;
    line.isExistGrp = false;
    line.fill = false;
    line.point = false;
    line.show = true;
    return line;
  };

  it('교차 null 데이터: 모든 고립점(isSingle)을 단일 batch로 모아 그린다 (per-point drawPoint 미사용)', () => {
    // #.#.#  — 비-null 점(idx 0,2,4)이 전부 양옆 null → isSingle, point:false 여도 마커 그려짐.
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: null, o: null },
      { x: 2, y: 20, o: 20 },
      { x: 3, y: null, o: null },
      { x: 4, y: 30, o: 30 },
    ];
    const batchSpy = vi.spyOn(Canvas, 'drawPointBatch').mockImplementation(() => {});
    const pointSpy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});

    makeLine(data).draw(baseParam(makeCtx()));

    // 같은 색(blur) 한 그룹 → batch 1회, 점 3개. path-per-point drawPoint 는 호출되지 않음.
    expect(pointSpy).not.toHaveBeenCalled();
    expect(batchSpy).toHaveBeenCalledTimes(1);
    expect(batchSpy.mock.calls[0][3]).toHaveLength(3);
  });

  it('마커 대상이 없으면 batch 를 호출하지 않는다', () => {
    // 연속 데이터 + point:false → isSingle 아님, selectedLabel 없음 → 마커 없음.
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 20, o: 20 },
      { x: 2, y: 30, o: 30 },
    ];
    const batchSpy = vi.spyOn(Canvas, 'drawPointBatch').mockImplementation(() => {});

    makeLine(data).draw(baseParam(makeCtx()));

    expect(batchSpy).not.toHaveBeenCalled();
  });
});

/**
 * 기하/래스터 분리 회귀 가드 — computeGeometry(기하 패스, main 저장)와 draw(래스터 패스)의
 * hit-test 기하(xp/yp) 일관성을 검증한다.
 *
 *  1) computeGeometry 단독 호출만으로 hit-test가 읽는 xp/yp 가 채워진다(canvas 없이도).
 *  2) 래스터 패스(draw)는 기하를 바꾸지 않는다 — computeGeometry 결과와 draw 후 결과가 동일.
 *  3) update→hover 일관성: 데이터 갱신 후 다시 계산하면 xp/yp 가 최신 데이터로 갱신된다.
 */
describe('element.line 기하/래스터 분리 (computeGeometry ↔ draw)', () => {
  const noop = () => {};
  const makeCtx = () => ({
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    stroke: noop,
    fill: noop,
    setLineDash: noop,
    arc: noop,
    fillRect: noop,
    moveTo: noop,
    lineTo: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
  });

  const baseParam = (ctx) => ({
    ctx,
    chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
    labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
    axesSteps: { x: [{ graphMin: 0, graphMax: 4 }], y: [{ graphMin: 0, graphMax: 100 }] },
    isBrush: true,
  });

  const makeLine = (data) => {
    const line = new Line('s0', {}, 0);
    line.data = data;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.interpolation = 'none';
    line.combo = false;
    line.isExistGrp = false;
    line.fill = false;
    line.point = false;
    line.show = true;
    return line;
  };

  it('computeGeometry 단독으로 hit-test용 xp/yp 가 채워진다 (canvas 그리기 없이)', () => {
    const data = [
      { x: 0, y: 0, o: 0 },
      { x: 2, y: 50, o: 50 },
      { x: 4, y: 100, o: 100 },
    ];
    const line = makeLine(data);
    line.computeGeometry(baseParam(null)); // ctx 없이도 동작해야 함(그리기 없음)

    data.forEach((p) => {
      expect(typeof p.xp).toBe('number');
      expect(typeof p.yp).toBe('number');
    });
    // x:[0..4]→픽셀[0..100] 선형, y:[0..100]→아래가 큰 값(yp 작아짐) 순증가.
    expect(data[0].xp).toBeLessThan(data[1].xp);
    expect(data[1].xp).toBeLessThan(data[2].xp);
    expect(data[0].yp).toBeGreaterThan(data[2].yp);
  });

  it('래스터 패스(draw)는 기하를 바꾸지 않는다 — computeGeometry 결과와 동일', () => {
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 1, y: 80, o: 80 },
      { x: 3, y: 40, o: 40 },
      { x: 4, y: 55, o: 55 },
    ];
    const geomLine = makeLine(data.map((d) => ({ ...d })));
    geomLine.computeGeometry(baseParam(null));
    const expected = geomLine.data.map(({ xp, yp }) => ({ xp, yp }));

    const drawLine = makeLine(data.map((d) => ({ ...d })));
    drawLine.draw(baseParam(makeCtx()));
    const drawn = drawLine.data.map(({ xp, yp }) => ({ xp, yp }));

    expect(drawn).toEqual(expected);
  });

  it('update→hover 일관성: 데이터 갱신 후 다시 계산하면 xp/yp 가 최신 데이터로 갱신된다', () => {
    const data = [
      { x: 0, y: 10, o: 10 },
      { x: 2, y: 20, o: 20 },
      { x: 4, y: 30, o: 30 },
    ];
    const line = makeLine(data);
    line.computeGeometry(baseParam(null));
    const before = data[1].yp;

    // 가운데 점 값 갱신 → 다시 계산하면 yp 가 갱신되어야 한다.
    data[1].y = 90;
    data[1].o = 90;
    line.computeGeometry(baseParam(null));

    expect(data[1].yp).not.toBe(before);
    expect(data[1].yp).toBeLessThan(before); // 값이 커지면 yp(위쪽) 작아짐
  });
});
