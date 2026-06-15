import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import Line from '../element/element.line';
import Bar from '../element/element.bar';
import Pie from '../element/element.pie';
import {
  RENDER_SNAPSHOT_VERSION,
  toRenderSnapshot,
  extractRenderGeometry,
  packSeries,
} from './render.snapshot';

/**
 * worker 입력/기하 계약 가드.
 *
 * 계약(직렬화·결정성·기하 동치·pack copy 경계)을 검증한다.
 */

const baseParam = () => ({
  chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
  labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
  axesSteps: {
    x: [{ graphMin: 0, graphMax: 4, minIndex: 0, maxIndex: 4 }],
    y: [{ graphMin: 0, graphMax: 100, minIndex: 0, maxIndex: 4 }],
  },
});

const makeLine = () => {
  const line = new Line('lineA', { color: '#112233' }, 0);
  line.show = true;
  line.xAxisIndex = 0;
  line.yAxisIndex = 0;
  line.data = [
    { x: 0, y: 10, o: 10, b: 0 },
    { x: 1, y: 20, o: 20, b: 0 },
    { x: 2, y: null, o: null, b: 0 },
    { x: 3, y: 40, o: 40, b: 0 },
  ];
  return line;
};

const makeBar = () => {
  const bar = new Bar('barA', { color: '#445566' }, 0, false);
  bar.show = true;
  bar.xAxisIndex = 0;
  bar.yAxisIndex = 0;
  bar.data = [
    { x: 0, y: 10, o: 10, b: 0 },
    { x: 1, y: 30, o: 30, b: 0 },
    { x: 2, y: 50, o: 50, b: 0 },
  ];
  return bar;
};

const makePie = () => {
  const pie = new Pie('pieA', {}, 0);
  pie.data = [
    { value: 30, sa: 0, ea: 1 },
    { value: 70, sa: 1, ea: 4 },
  ];
  // pie 기하는 plugins.pie 가 main 에서 인스턴스에 써 둔다(여기선 그 결과를 직접 모사).
  pie.centerX = 50;
  pie.centerY = 60;
  pie.radius = 40;
  pie.startAngle = 0;
  pie.endAngle = 2 * Math.PI;
  return pie;
};

/**
 * computeGeometry 를 선행 호출한(=main 기하가 채워진) core-유사 fixture 를 만든다.
 * @param {object} [opts]
 * @returns {object}
 */
const makeCore = (opts = {}) => {
  const param = baseParam();
  const line = makeLine();
  const bar = makeBar();
  const pie = makePie();

  // main 기하 계산. draw 없이 기하만.
  line.computeGeometry(param);
  bar.computeGeometry({ ...param, showIndex: 0, showSeriesCount: 1, thickness: 1, cPadRatio: 0.2 });

  return {
    pixelRatio: 2,
    chartRect: param.chartRect,
    labelOffset: param.labelOffset,
    axesSteps: param.axesSteps,
    options: {
      type: 'line',
      horizontal: false,
      thickness: 1,
      cPadRatio: 0.2,
      coordinateDedupe: false,
      // 직렬화 불가 콜백이 섞여 들어와도 스냅샷에서 빠져야 한다.
      onClick: () => {},
      ...opts.options,
    },
    seriesInfo: { charts: { line: ['lineA'], bar: ['barA'], scatter: [], heatMap: [], pie: ['pieA'] } },
    seriesList: { lineA: line, barA: bar, pieA: pie },
  };
};

describe('render.snapshot — RenderInput 계약 (직렬화/결정성)', () => {
  it('structured-clone smoke: 스냅샷이 structuredClone 가능하고 function/class 가 없다', () => {
    const core = makeCore();
    const snapshot = toRenderSnapshot(core, 1);

    // function/class instance 가 섞였다면 structuredClone 이 throw 한다.
    expect(() => structuredClone(snapshot)).not.toThrow();

    // 어디에도 function 이 없어야 한다(재귀 검사).
    const assertNoFunction = (val) => {
      if (val && typeof val === 'object') {
        Object.values(val).forEach(assertNoFunction);
      } else {
        expect(typeof val).not.toBe('function');
      }
    };
    assertNoFunction(snapshot);

    // options 의 콜백(onClick)은 누락돼야 한다.
    expect(snapshot.options).not.toHaveProperty('onClick');
    // 시리즈 클래스 인스턴스가 plain 메타로 추출됐다.
    expect(snapshot.series.lineA.sId).toBe('lineA');
    expect(snapshot.series.lineA.type).toBe('line');
    expect(snapshot.version).toBe(RENDER_SNAPSHOT_VERSION);
  });

  it('series 메타에 function(showValue.formatter / color 콜백)이 들어와도 drop 된다', () => {
    const core = makeCore();
    core.seriesList.barA.showValue = { use: true, fontSize: 12, formatter: () => 'X' };
    core.seriesList.lineA.color = () => '#fff';

    const snapshot = toRenderSnapshot(core, 1);

    expect(() => structuredClone(snapshot)).not.toThrow();
    expect(snapshot.series.barA.showValue).toEqual({ use: true, fontSize: 12 });
    expect(snapshot.series.barA.showValue).not.toHaveProperty('formatter');
    // color 콜백은 drop → 키 누락(worker-unsupported → main fallback).
    expect(snapshot.series.lineA).not.toHaveProperty('color');
  });

  it('axesSteps 의 function 필드는 제외되고 수치만 남는다', () => {
    const core = makeCore();
    core.axesSteps.x[0].format = (v) => `${v}`;

    const snapshot = toRenderSnapshot(core, 1);

    expect(snapshot.axesSteps.x[0].graphMin).toBe(0);
    expect(snapshot.axesSteps.x[0].graphMax).toBe(4);
    expect(snapshot.axesSteps.x[0]).not.toHaveProperty('format');
  });

  it('deterministic: 같은 model 입력이면 epoch 외 모든 필드가 동일하다', () => {
    const a = toRenderSnapshot(makeCore(), 1);
    const b = toRenderSnapshot(makeCore(), 99);

    expect(a.epoch).toBe(1);
    expect(b.epoch).toBe(99);

    const stripEpoch = (s) => ({ ...s, epoch: 0 });
    expect(stripEpoch(a)).toEqual(stripEpoch(b));
  });

  it('seriesOrder 가 seriesInfo.charts 그리기 순서를 보존한다', () => {
    const snapshot = toRenderSnapshot(makeCore(), 1);
    expect(snapshot.seriesOrder).toEqual({
      line: ['lineA'],
      bar: ['barA'],
      scatter: [],
      heatMap: [],
      pie: ['pieA'],
    });
  });
});

describe('render.snapshot — RenderGeometry 계약 (main 계산 = 정답)', () => {
  it('geometry 동치: extractRenderGeometry 가 computeGeometry 후 item.xp/yp 와 동일(line)', () => {
    const core = makeCore();
    const geom = extractRenderGeometry(core);

    const line = core.seriesList.lineA;
    expect(geom.lineA.kind).toBe('point');
    expect(geom.lineA.xp).toEqual(line.data.map((d) => d.xp));
    expect(geom.lineA.yp).toEqual(line.data.map((d) => d.yp));
  });

  it('geometry 동치: bar 는 xp/yp/w/h 를 모두 노출한다', () => {
    const core = makeCore();
    const geom = extractRenderGeometry(core);

    const bar = core.seriesList.barA;
    expect(geom.barA.kind).toBe('rect');
    expect(geom.barA.xp).toEqual(bar.data.map((d) => d.xp));
    expect(geom.barA.yp).toEqual(bar.data.map((d) => d.yp));
    expect(geom.barA.w).toEqual(bar.data.map((d) => d.w));
    expect(geom.barA.h).toEqual(bar.data.map((d) => d.h));
    // 실제로 채워진 픽셀 기하다(전부 null 이 아님).
    expect(geom.barA.xp.some((v) => typeof v === 'number')).toBe(true);
  });

  it('pie 는 각도 기반 기하로 노출된다(xp/yp/w/h 강제 안 함)', () => {
    const core = makeCore();
    const geom = extractRenderGeometry(core);

    expect(geom.pieA).toEqual({
      kind: 'arc',
      centerX: 50,
      centerY: 60,
      radius: 40,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      slices: [
        { sa: 0, ea: 1 },
        { sa: 1, ea: 4 },
      ],
    });
  });

  it('extractRenderGeometry 는 재계산하지 않는다(computeGeometry 미선행이면 xp=null)', () => {
    const bareLine = makeLine(); // computeGeometry 호출 전
    const core = {
      seriesList: { lineA: bareLine },
    };
    const geom = extractRenderGeometry(core);
    expect(geom.lineA.xp).toEqual([null, null, null, null]);
  });
});

describe('render.snapshot — pack/transfer 안전 (copy 경계)', () => {
  it('packSeries 는 Float64Array + transferable buffer 로 묶고 null 은 NaN sentinel 이 된다', () => {
    const snapshot = toRenderSnapshot(makeCore(), 1);
    const { columns, transferList } = packSeries(snapshot);

    expect(columns.lineA.x).toBeInstanceOf(Float64Array);
    expect(columns.lineA.length).toBe(4);
    // line.data[2].y = null → NaN
    expect(Number.isNaN(columns.lineA.y[2])).toBe(true);
    expect(columns.lineA.y[0]).toBe(10);

    // pie 는 value 컬럼.
    expect(columns.pieA.value).toBeInstanceOf(Float64Array);
    expect(Array.from(columns.pieA.value)).toEqual([30, 70]);

    // transferList 는 새로 만든 사본 버퍼들.
    expect(transferList.length).toBeGreaterThan(0);
    transferList.forEach((buf) => expect(buf).toBeInstanceOf(ArrayBuffer));
  });

  it('항상 copy: pack 한 버퍼를 transfer(detach)해도 스냅샷 원본 배열이 멀쩡하다', () => {
    const snapshot = toRenderSnapshot(makeCore(), 1);
    const sourceX = snapshot.series.lineA.data.x;
    const sourceSnapshot = sourceX.slice();

    const { columns } = packSeries(snapshot);
    const packedBuffer = columns.lineA.x.buffer;

    // worker 로 transfer 하는 상황을 모사: 패킹된 버퍼를 detach.
    structuredClone(packedBuffer, { transfer: [packedBuffer] });
    expect(packedBuffer.byteLength).toBe(0); // 패킹 버퍼는 detach 됨

    // 그러나 main 이 계속 쓰는 원본 plain 배열은 detach 되지 않는다(copy 경계).
    expect(snapshot.series.lineA.data.x).toEqual(sourceSnapshot);
    expect(snapshot.series.lineA.data.x[0]).toBe(0);
  });

  it('대용량 직렬화 벤치(방향성): 1000×60 pack 시간 기록(packMs 기준선)', () => {
    // 60 시리즈 × 1000 포인트.
    const series = {};
    for (let s = 0; s < 60; s++) {
      const x = new Array(1000);
      const y = new Array(1000);
      const o = new Array(1000);
      const b = new Array(1000);
      for (let i = 0; i < 1000; i++) {
        x[i] = i;
        y[i] = i * 0.5;
        o[i] = i * 0.5;
        b[i] = 0;
      }
      series[`s${s}`] = { sId: `s${s}`, type: 'line', data: { x, y, o, b } };
    }
    const snapshot = { version: RENDER_SNAPSHOT_VERSION, epoch: 0, series };

    const t0 = performance.now();
    const { columns, transferList } = packSeries(snapshot);
    const packMs = performance.now() - t0;

    // eslint-disable-next-line no-console
    console.log(`[render.snapshot] pack 1000x60 (60 series x 1000 pts) packMs=${packMs.toFixed(2)}ms`);

    // 방향성 가드: 완료되고(throw 없음) 60×4 컬럼 버퍼가 나온다.
    expect(Object.keys(columns)).toHaveLength(60);
    expect(transferList).toHaveLength(60 * 4);
    expect(columns.s0.length).toBe(1000);
  });
});

/**
 * 빈(전부 null) line 시리즈는 worker 가 그려도 픽셀 0개라 스냅샷(=pack/postMessage)에서 제외한다.
 * element.line draw-skip 과 동일 판정(hasRenderableValue, isExistGrp 제외). 비-line·isExistGrp·값 있는
 * 시리즈는 그대로 포함.
 */
describe('render.snapshot — 빈 시리즈 제외 (worker 직렬화 비용 절감)', () => {
  const makeLineWith = (id, data, extra = {}) => {
    const line = new Line(id, { color: '#000' }, 0);
    line.show = true;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.isExistGrp = false;
    line.data = data;
    Object.assign(line, extra);
    return line;
  };

  const allNull = [
    { x: 0, y: null, o: null, b: 0 },
    { x: 1, y: null, o: null, b: 0 },
  ];
  const withValue = [
    { x: 0, y: 10, o: 10, b: 0 },
    { x: 1, y: 20, o: 20, b: 0 },
  ];

  const makeOrderedCore = (seriesList, order) => ({
    pixelRatio: 1,
    chartRect: {},
    labelOffset: {},
    axesSteps: { x: [], y: [] },
    options: { type: 'line' },
    seriesInfo: { charts: { line: order, bar: [], scatter: [], heatMap: [], pie: [] } },
    seriesList,
  });

  it('all-null line 시리즈는 series 맵·seriesOrder·pack 에서 모두 빠진다', () => {
    const core = makeOrderedCore(
      { full: makeLineWith('full', withValue), empty: makeLineWith('empty', allNull) },
      ['full', 'empty'],
    );
    const snapshot = toRenderSnapshot(core, 1);

    expect(Object.keys(snapshot.series)).toEqual(['full']);
    expect(snapshot.seriesOrder.line).toEqual(['full']);
    expect(Object.keys(packSeries(snapshot).columns)).toEqual(['full']);
  });

  it('isExistGrp(stacked) all-null 시리즈는 제외하지 않는다', () => {
    const core = makeOrderedCore(
      { grp: makeLineWith('grp', allNull, { isExistGrp: true }) },
      ['grp'],
    );
    const snapshot = toRenderSnapshot(core, 1);

    expect(Object.keys(snapshot.series)).toEqual(['grp']);
    expect(snapshot.seriesOrder.line).toEqual(['grp']);
  });

  it("값이 0(예: interpolation 'zero' 변환 결과)인 시리즈는 제외하지 않는다", () => {
    const zeros = [
      { x: 0, y: 0, o: 0, b: 0 },
      { x: 1, y: 0, o: 0, b: 0 },
    ];
    const core = makeOrderedCore({ z: makeLineWith('z', zeros) }, ['z']);
    const snapshot = toRenderSnapshot(core, 1);

    expect(Object.keys(snapshot.series)).toEqual(['z']);
  });
});

describe('render.snapshot — 축 타입별 좌표 정규화 (time/step worker 허용)', () => {
  const makeLineData = (id, data, axisType) => {
    const line = new Line(id, { color: '#000' }, 0);
    line.show = true;
    line.xAxisIndex = 0;
    line.yAxisIndex = 0;
    line.data = data;
    return {
      pixelRatio: 1,
      chartRect: {},
      labelOffset: {},
      axesSteps: { x: [], y: [] },
      options: { type: 'line', axesX: [{ type: axisType }], axesY: [{ type: 'linear' }] },
      seriesInfo: { charts: { line: [id], bar: [], scatter: [], heatMap: [], pie: [] } },
      seriesList: { [id]: line },
    };
  };

  it('time 축: Date/문자열 x 가 타임스탬프(숫자)로 정규화된다', () => {
    const date = new Date('2020-01-01');
    const core = makeLineData(
      't',
      [{ x: date, y: 10, o: 10, b: 0 }, { x: '2020-01-02', y: 20, o: 20, b: 0 }],
      'time',
    );
    const snapshot = toRenderSnapshot(core, 1);

    // Date 객체는 timestamp 가 그대로 보존되고, 문자열은 dayjs 파싱 결과와 동일해야 한다.
    expect(snapshot.series.t.data.x[0]).toBe(date.valueOf());
    expect(snapshot.series.t.data.x[1]).toBe(dayjs('2020-01-02').valueOf());
  });

  it('step 축: 숫자문자열 x 는 숫자로, 카테고리 문자열 x 는 null 로 정규화된다', () => {
    const core = makeLineData(
      's',
      [{ x: '5', y: 10, o: 10, b: 0 }, { x: 'Mon', y: 20, o: 20, b: 0 }],
      'step',
    );
    const snapshot = toRenderSnapshot(core, 1);

    expect(snapshot.series.s.data.x[0]).toBe(5);
    expect(snapshot.series.s.data.x[1]).toBeNull();
  });

  it('linear 축(회귀): 비숫자 x 는 기존대로 null', () => {
    const core = makeLineData(
      'l',
      [{ x: 0, y: 10, o: 10, b: 0 }, { x: 'nope', y: 20, o: 20, b: 0 }],
      'linear',
    );
    const snapshot = toRenderSnapshot(core, 1);

    expect(snapshot.series.l.data.x[0]).toBe(0);
    expect(snapshot.series.l.data.x[1]).toBeNull();
  });
});

describe('render.snapshot — selection 직렬화 (select 옵션 worker 허용)', () => {
  it('RENDER_SNAPSHOT_VERSION 은 2 (worker 입력 계약 변경)', () => {
    expect(RENDER_SNAPSHOT_VERSION).toBe(2);
  });

  it('selection 블록이 element draw 가 읽는 최소 필드만 담는다(rich data 제외)', () => {
    const core = makeCore({
      options: {
        selectSeries: { use: true },
        selectItem: { use: true, useSeriesOpacity: true, showBorder: true, borderStyle: { lineWidth: 2 } },
        selectLabel: { use: true, useSeriesOpacity: true, useBothAxis: true },
      },
    });
    core.defaultSelectInfo = {
      seriesId: ['lineA'],
      dataIndex: [1, 2],
      label: ['Mon', 'Tue'],
      targetAxis: 'xAxis',
      data: [{ huge: 'rich-object', fn: () => {} }], // draw 가 안 읽는 rich 배열
    };
    core.defaultSelectItemInfo = { dataIndex: 3, seriesID: 'barA', data: { rich: true } };

    const snapshot = toRenderSnapshot(core, 1);
    const sel = snapshot.selection;

    expect(sel.selectSeries).toEqual({ use: true, selected: { seriesId: ['lineA'] } });
    expect(sel.selectItem).toEqual({
      use: true, useSeriesOpacity: true, showBorder: true, borderStyle: { lineWidth: 2 },
      selected: { dataIndex: 3, seriesID: 'barA' },
    });
    expect(sel.selectLabel).toEqual({
      use: true, useSeriesOpacity: true, useBothAxis: true,
      selected: { dataIndex: [1, 2], label: ['Mon', 'Tue'], targetAxis: 'xAxis' },
    });
    // rich data 배열/함수는 selection 어디에도 없어야 한다.
    expect(JSON.stringify(sel)).not.toContain('rich');
    expect(() => structuredClone(snapshot)).not.toThrow();
  });

  it('선택 상태 없음(defaultSelectInfo 부재): use 플래그만 반영, selected 는 빈/null', () => {
    const core = makeCore({ options: { selectSeries: { use: true } } });
    const snapshot = toRenderSnapshot(core, 1);

    expect(snapshot.selection.selectSeries).toEqual({ use: true, selected: { seriesId: [] } });
    expect(snapshot.selection.selectItem.selected).toBeNull();
  });

  it('select 옵션의 formatter 콜백이 섞여도 snapshot 에 함수가 없다', () => {
    const core = makeCore({
      options: { selectItem: { use: true, formatter: () => 'X', borderStyle: { color: '#f00' } } },
    });
    const snapshot = toRenderSnapshot(core, 1);

    const assertNoFunction = (val) => {
      if (val && typeof val === 'object') {
        Object.values(val).forEach(assertNoFunction);
      } else {
        expect(typeof val).not.toBe('function');
      }
    };
    assertNoFunction(snapshot.selection);
    // borderStyle 의 plain 값은 보존.
    expect(snapshot.selection.selectItem.borderStyle).toEqual({ color: '#f00' });
  });
});
