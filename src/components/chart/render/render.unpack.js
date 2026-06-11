/**
 * RenderCore worker 측 재구성/래스터 (Step 8: worker-micro-poc).
 *
 * worker 는 main 으로부터 **plain RenderInput 스냅샷(Step 6)** 만 받는다(class instance/함수 clone 없음).
 * 이 모듈은 그 스냅샷에서 element 렌더러 인스턴스를 **재구성**하고 worker 의 OffscreenCanvas ctx 에
 * **Step 3 의 series 래스터(element `draw()`)를 그대로 호출**해 그린다.
 *
 * 핵심(금지사항 준수): **series 래스터를 새로 구현하지 않는다.** stroke/fill/path 빌드 알고리즘은
 * `element.line.js` / `element.bar.js` / `element.heatmap.js` 의 `draw()` 를 재사용한다. 이 모듈이 하는 일은
 *  (1) 스냅샷 메타 → `new Line/Bar/HeatMap(...)` 생성자 재구성(생성자의 defaultsDeep 가 기본값 채움),
 *  (2) packed 컬럼(Float64, NaN sentinel) → data point 객체 복원,
 *  (3) drawSeriesLayer(chart.core.js)와 동일한 per-type 디스패치 루프(트리비얼 orchestration).
 * 좌표/기하(xp/yp/w/h)는 `draw()` 가 내부 `computeGeometry` 로 재계산하므로 worker 로 보낼 필요가 없다
 * (hit-test 용 main 기하는 Step 2 가 main 에서 계산 — render-contract.md §2).
 *
 * micro PoC 범위: line / bar / heatMap, interaction 비활성(select 옵션·legendHitInfo 없음).
 * scatter / pie 는 Step 9 통합에서.
 */

import Line from '../element/element.line';
import Bar from '../element/element.bar';
import HeatMap from '../element/element.heatmap';

/** NaN sentinel(packSeries) → null 환원. 그 외 number 는 그대로. */
function nanToNull(value) {
  if (value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
    return null;
  }
  return value;
}

/**
 * packed 컬럼(Float64Array + length)을 data point 객체 배열로 복원한다.
 * line/bar/heatMap = {x,y,o,b}. (pie=value 는 micro 범위 밖)
 * @param {{length:number, x?:Float64Array, y?:Float64Array, o?:Float64Array, b?:Float64Array}} cols
 * @returns {Array<{x:?number,y:?number,o:?number,b:?number}>}
 */
function rebuildData(cols) {
  const length = cols?.length ?? 0;
  const x = cols?.x;
  const y = cols?.y;
  const o = cols?.o;
  const b = cols?.b;
  const data = new Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = {
      x: nanToNull(x?.[i]),
      y: nanToNull(y?.[i]),
      o: nanToNull(o?.[i]),
      b: nanToNull(b?.[i]),
    };
  }
  return data;
}

/**
 * 스냅샷 + packed 컬럼에서 element 렌더러 인스턴스를 재구성한다(class/함수 clone 없이 plain 입력만으로).
 * 생성자의 defaultsDeep/merge 가 메타에 없는 옵션을 기본값으로 채우므로, 메타 화이트리스트(Step 6)만으로
 * 기본 line/bar/heatMap 렌더러가 복원된다.
 * @param {object} snapshot   toRenderSnapshot 결과
 * @param {object} columns    packSeries(snapshot).columns
 * @returns {Object<string, object>} seriesId → element 인스턴스
 */
export function reconstructSeries(snapshot, columns) {
  const series = snapshot.series ?? {};
  const options = snapshot.options ?? {};
  const instances = {};

  let sIdx = 0;
  Object.keys(series).forEach((id) => {
    const meta = series[id];
    const data = rebuildData(columns?.[id]);

    let inst = null;
    switch (meta.type) {
      case 'line':
        inst = new Line(meta.sId ?? id, meta, sIdx);
        break;
      case 'bar':
        inst = new Bar(meta.sId ?? id, meta, sIdx, !!options.horizontal);
        break;
      case 'heatMap':
        inst = new HeatMap(
          meta.sId ?? id,
          meta,
          options.heatMapColor,
          !!options.horizontal,
          !!options.isGradient,
        );
        break;
      default:
        inst = null;
    }

    if (inst) {
      inst.data = data;
      // heatMap 은 calculateXY 가 category label 배열을 쓰므로 복원한다(Step 8 발견).
      if (meta.type === 'heatMap' && meta.labels) {
        inst.labels = meta.labels;
      }
      instances[id] = inst;
    }
    sIdx += 1;
  });

  return instances;
}

/**
 * 재구성한 인스턴스를 worker ctx 에 래스터한다. drawSeriesLayer(chart.core.js)의 per-type 디스패치를
 * micro 범위(line/bar/heatMap, interaction off)로 좁혀 그대로 따른다 — 래스터는 element `draw()` 재사용.
 * @param {object} snapshot    toRenderSnapshot 결과
 * @param {Object<string,object>} instances   reconstructSeries 결과
 * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx   worker offscreen ctx
 * @returns {undefined}
 */
export function rasterSeries(snapshot, instances, ctx) {
  const options = snapshot.options ?? {};
  const order = snapshot.seriesOrder ?? {};

  // micro PoC = interaction off. select* 는 main overlay 소유라 스냅샷에서 제외(Step 6) →
  // element draw 가 destructure 만 하므로 inert default(use:false / selected null)를 주입한다.
  const inertSelect = { option: { use: false }, selected: null };
  const opt = {
    ctx,
    chartRect: snapshot.chartRect,
    labelOffset: snapshot.labelOffset,
    axesSteps: snapshot.axesSteps,
    isHorizontal: !!options.horizontal,
    displayOverflow: options.displayOverflow,
    unSelectedOpacity: options.unSelectedOpacity,
    selectItem: inertSelect,
    selectLabel: inertSelect,
    selectSeries: inertSelect,
  };

  (order.line ?? []).forEach((id) => instances[id]?.draw({ ...opt }));
  (order.heatMap ?? []).forEach((id) => instances[id]?.draw({ ...opt }));

  const barIds = order.bar ?? [];
  let showSeriesCount = 0;
  barIds.forEach((id) => {
    if (instances[id]?.show) {
      showSeriesCount += 1;
    }
  });
  let showIndex = 0;
  barIds.forEach((id) => {
    const inst = instances[id];
    if (!inst) {
      return;
    }
    inst.draw({
      ...opt,
      thickness: options.thickness,
      cPadRatio: options.cPadRatio,
      borderRadius: options.borderRadius,
      showSeriesCount,
      showIndex,
    });
    if (inst.show) {
      showIndex += 1;
    }
  });
}
