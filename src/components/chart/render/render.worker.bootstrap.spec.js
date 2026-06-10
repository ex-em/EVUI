import { describe, it, expect } from 'vitest';
import Line from '../element/element.line';
import Bar from '../element/element.bar';
import HeatMap from '../element/element.heatmap';
import { toRenderSnapshot, packSeries } from './render.snapshot';
import { reconstructSeries, rasterSeries } from './render.unpack';

/**
 * Step 8 worker bootstrap 증명: 대표 타입(line/bar/heatMap)이 **RenderInput(plain snapshot)만으로**
 * worker 에서 재구성 + 래스터될 수 있음을 검증한다(class instance / 함수 clone 없이).
 *
 * 전송 경계를 실제로 흉내내기 위해 snapshot/columns 를 `structuredClone` 한 뒤(= 함수·class 가 있으면
 * throw, 통과하면 plain 보장) **그 사본에서** 재구성한다. 래스터는 element `draw()` 재사용(이중 구현 금지)
 * 여부를 recording ctx 로 확인한다(jsdom 엔 canvas 래스터가 없으므로 draw 경로 호출을 카운트).
 */

const HEAT_MAP_COLOR = {
  min: '#FFFFFF',
  max: '#0052FF',
  rangeCount: 1,
  colorsByRange: [],
  stroke: { show: false, color: '#FFFFFF', lineWidth: 1, opacity: 1, radius: 0 },
  error: '#FF0000',
  decimalPoint: 0,
};

/** 호출된 ctx 메서드 이름을 기록하는 recording context(jsdom 용 — 실제 픽셀 래스터는 browser PoC). */
function makeRecordingCtx() {
  const calls = new Set();
  const gradient = { addColorStop: () => {} };
  return new Proxy(
    { calls },
    {
      get(target, prop) {
        if (prop === 'calls') {
          return calls;
        }
        if (prop === 'canvas') {
          return { width: 400, height: 300 };
        }
        if (prop === 'measureText') {
          return () => ({ width: 0 });
        }
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return () => gradient;
        }
        if (prop === 'getImageData') {
          return () => ({ data: new Uint8ClampedArray(4) });
        }
        return () => {
          calls.add(typeof prop === 'string' ? prop : '');
          return undefined;
        };
      },
      set() {
        return true;
      },
    },
  );
}

const AXES_STEPS = {
  x: [{ graphMin: 0, graphMax: 4, minIndex: 0, maxIndex: 4, oriSteps: 5, steps: 5 }],
  y: [{ graphMin: 0, graphMax: 100, minIndex: 0, maxIndex: 4, oriSteps: 5, steps: 5 }],
};

const CHART_RECT = {
  x1: 0,
  x2: 400,
  y1: 0,
  y2: 300,
  chartWidth: 400,
  chartHeight: 300,
  width: 400,
  height: 300,
};

/** 타입별 element 인스턴스 + core-like 객체를 만들어 toRenderSnapshot 입력을 구성한다. */
function buildCore(type) {
  let inst;
  if (type === 'line') {
    inst = new Line('s0', { color: '#112233', lineWidth: 2 }, 0);
  } else if (type === 'bar') {
    inst = new Bar('s0', { color: '#112233' }, 0, false);
  } else {
    inst = new HeatMap('s0', {}, HEAT_MAP_COLOR, false, true);
  }
  inst.xAxisIndex = 0;
  inst.yAxisIndex = 0;
  inst.show = true;

  if (type === 'heatMap') {
    // heatMap = 2D 카테고리(x/y label)+값(o). 숫자 label 이라 Float64 pack 가능.
    inst.labels = { x: [0, 1, 2, 3, 4], y: [0] };
    inst.data = [
      { x: 0, y: 0, o: 10, b: null },
      { x: 1, y: 0, o: 40, b: null },
      { x: 2, y: 0, o: 25, b: null },
      { x: 3, y: 0, o: 70, b: null },
      { x: 4, y: 0, o: 55, b: null },
    ];
  } else {
    inst.data = [
      { x: 0, y: 10, o: 10, b: null },
      { x: 1, y: 40, o: 40, b: null },
      { x: 2, y: 25, o: 25, b: null },
      { x: 3, y: 70, o: 70, b: null },
      { x: 4, y: 55, o: 55, b: null },
    ];
  }

  const charts = { pie: [], bar: [], line: [], scatter: [], heatMap: [] };
  charts[type] = ['s0'];

  return {
    pixelRatio: 2,
    chartRect: CHART_RECT,
    labelOffset: { left: 10, right: 10, top: 10, bottom: 10 },
    axesSteps: AXES_STEPS,
    options: {
      type,
      horizontal: false,
      heatMapColor: HEAT_MAP_COLOR,
      legend: { type: 'gradient' },
      thickness: 1,
      cPadRatio: 0.2,
      borderRadius: 0,
    },
    seriesInfo: { charts },
    seriesList: { s0: inst },
  };
}

describe('render worker bootstrap (Step 8)', () => {
  const types = ['line', 'bar', 'heatMap'];

  types.forEach((type) => {
    it(`${type}: RenderInput(plain snapshot)만으로 worker 재구성 + 래스터된다`, () => {
      const core = buildCore(type);
      const snapshot = toRenderSnapshot(core, 1);
      const { columns, transferList } = packSeries(snapshot);

      // 전송 경계 시뮬레이션: structuredClone 가능 = 함수/class instance 없음(plain 보장).
      const clonedSnapshot = structuredClone(snapshot);
      const clonedColumns = structuredClone(columns);
      expect(transferList.length).toBeGreaterThan(0);

      // 사본(plain)에서만 재구성 — 원본 인스턴스 참조 없이.
      const instances = reconstructSeries(clonedSnapshot, clonedColumns);
      expect(Object.keys(instances)).toEqual(['s0']);
      expect(instances.s0.type).toBe(type);
      expect(instances.s0.data).toHaveLength(5);

      // 래스터: element draw() 재사용 경로가 실제로 호출됐는지 recording ctx 로 확인.
      const ctx = makeRecordingCtx();
      rasterSeries(clonedSnapshot, instances, ctx);

      if (type === 'line') {
        expect(ctx.calls.has('stroke')).toBe(true);
      } else {
        // bar / heatMap 은 rect 채우기 경로.
        expect(ctx.calls.has('fillRect') || ctx.calls.has('fill')).toBe(true);
      }
    });
  });

  it('스냅샷에 함수/class instance 가 들어가지 않는다(직렬화 가능)', () => {
    const core = buildCore('line');
    const snapshot = toRenderSnapshot(core, 7);
    expect(() => structuredClone(snapshot)).not.toThrow();
    // 메타에 draw/computeGeometry 같은 메서드가 새지 않음.
    expect(snapshot.series.s0.draw).toBeUndefined();
    expect(typeof snapshot.series.s0).toBe('object');
  });

  it('NaN sentinel 컬럼이 null data point 로 환원된다', () => {
    const core = buildCore('line');
    core.seriesList.s0.data = [
      { x: 0, y: 10, o: 10, b: null },
      { x: 1, y: null, o: null, b: null },
    ];
    const snapshot = toRenderSnapshot(core, 1);
    const { columns } = packSeries(snapshot);
    const instances = reconstructSeries(snapshot, columns);
    expect(instances.s0.data[1].o).toBeNull();
    expect(instances.s0.data[1].y).toBeNull();
  });
});
