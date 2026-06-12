/**
 * RenderCore worker 입력/기하 계약.
 *
 * worker(OffscreenCanvas)로 넘길 렌더 입력은 **plain · serializable · versioned · deterministic** 이어야
 * 한다. 이 모듈은 그 계약을 코드로 고정한다:
 *
 *  - `toRenderSnapshot(core, epoch)` : RenderCore(prepare + series raster)가 필요로 하는 최소 입력을
 *    Vue proxy / function(formatter) / class instance / circular ref 없이 plain object 로 추출한다.
 *  - `extractRenderGeometry(core)`   : hit-test 가 소비하는 기하(xp/yp/w/h, pie 는 각도 기반)를 plain 으로
 *    추출한다. **기본 정책 = main 의 computeGeometry 계산이 정답** — 기하는 싸고 hit-test 가
 *    main 에서 즉시 필요하므로 worker 가 계산해 되돌려주지 않는다. 이 함수는 그 main-계산 결과를
 *    그대로 읽어 계약 형태로 노출할 뿐, 재계산하지 않는다(두 번째 진실 원천 방지).
 *  - `packSeries(snapshot)`          : 대량 수치를 Float64 typed array + Transferable ArrayBuffer 로 묶는다.
 *    **항상 copy**(원본 detach 금지) — main 이 계속 쓰는 source 버퍼를 transfer 하면 깨진다.
 */

/** 스냅샷 포맷 버전. 호환 깨짐 변경 시 +1. worker 가 버전 불일치 시 main fallback 판정에 사용. */
export const RENDER_SNAPSHOT_VERSION = 1;

/**
 * RenderInput 에 담는 옵션 원시값 화이트리스트.
 * 선택/hover 등 interaction 상태(defaultSelectInfo·selectItem.selected 등)는 main overlay 소유라 제외.
 */
const OPTION_KEYS = [
  'type',
  'horizontal',
  'sunburst',
  'coordinateDedupe',
  'unSelectedOpacity',
  'displayOverflow',
  'thickness',
  'cPadRatio',
  'borderRadius',
  'seriesReverse',
  'maxTip',
  'padding',
  'heatMapColor',
];

/** SeriesSnapshot 에 담는 시리즈 메타 원시값 화이트리스트(function/class 제외, formatter 는 toPlain 이 drop). */
const SERIES_META_KEYS = [
  'sId',
  'type',
  'name',
  'show',
  'color',
  'fill',
  'fillColor',
  'pointFill',
  'lineWidth',
  'thickness',
  'pointSize',
  'pointStyle',
  'interpolation',
  'combo',
  'xAxisIndex',
  'yAxisIndex',
  'stackIndex',
  'groupIndex',
  'isExistGrp',
  'showValue',
];

/**
 * function / Vue proxy / class instance 를 떨궈 plain·structured-clone 가능한 값으로 변환한다.
 *  - 원시값(number/string/boolean/null) → 그대로
 *  - function → undefined (호출처에서 키 자체를 누락시킴; formatter/range/color 콜백 차단)
 *  - Array → 원소별 재귀
 *  - plain object 형태 → 키별 재귀 (Date/Map/Set/RegExp 등 비-plain 은 제외)
 *  - 그 외(class instance 등) → undefined
 * 화이트리스트만 통과시키므로 circular ref 는 구조상 발생하지 않는다.
 * @param {*} value
 * @returns {*} plain value 또는 undefined(직렬화 불가)
 */
function toPlain(value) {
  if (value === null) {
    return null;
  }

  const t = typeof value;
  if (t === 'number' || t === 'string' || t === 'boolean') {
    return value;
  }
  if (t === 'function' || t === 'undefined' || t === 'symbol' || t === 'bigint') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((v) => toPlain(v) ?? null);
  }

  // plain object 만(Date/Map/Set/RegExp/class instance 제외).
  const proto = Object.getPrototypeOf(value);
  if (proto === Object.prototype || proto === null) {
    const out = {};
    Object.keys(value).forEach((key) => {
      const plain = toPlain(value[key]);
      if (plain !== undefined) {
        out[key] = plain;
      }
    });
    return out;
  }

  return undefined;
}

/**
 * 객체에서 주어진 키만 골라 toPlain 적용한 새 plain object 를 만든다(누락 키·function 값은 빠짐).
 * @param {object} source
 * @param {string[]} keys
 * @returns {object}
 */
function pickPlain(source, keys) {
  const out = {};
  if (!source) {
    return out;
  }
  keys.forEach((key) => {
    const plain = toPlain(source[key]);
    if (plain !== undefined) {
      out[key] = plain;
    }
  });
  return out;
}

/**
 * 시리즈 한 개의 수치 데이터를 컬럼형(plain number 배열)으로 추출한다.
 * pie 는 x/y 좌표가 없으므로 value 컬럼으로, 나머지는 x/y/o/b 컬럼으로.
 * null 은 plain 배열에선 null 로 보존(typed array pack 시 NaN sentinel 로 치환 — packSeries 참고).
 * @param {{type:string, data:Array}} series
 * @returns {object} columnar data
 */
function extractSeriesData(series) {
  const data = series.data ?? [];

  if (series.type === 'pie') {
    return {
      value: data.map((d) => (typeof d?.value === 'number' ? d.value : null)),
    };
  }

  const x = new Array(data.length);
  const y = new Array(data.length);
  const o = new Array(data.length);
  const b = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const d = data[i] ?? {};
    x[i] = typeof d.x === 'number' ? d.x : null;
    y[i] = typeof d.y === 'number' ? d.y : null;
    o[i] = typeof d.o === 'number' ? d.o : null;
    b[i] = typeof d.b === 'number' ? d.b : null;
  }
  return { x, y, o, b };
}

/**
 * RenderCore(prepare + series raster)가 필요로 하는 최소 입력을 plain·serializable·versioned 스냅샷으로
 * 추출한다. function / Vue proxy / class instance / circular ref 없음(structured-clone 가능).
 *
 * @param {object} core   EvChart 인스턴스(또는 동등한 필드를 가진 객체).
 *                        chartRect/labelOffset/axesSteps/pixelRatio/options/seriesInfo/seriesList 소비.
 * @param {number} [epoch=0]  단조 증가 epoch(호출처가 관리). display frame ↔ hit-test model 일관성/
 *                            stale drop 에 사용. 같은 model 입력이면 epoch 외 모든 필드가 동일하다.
 * @returns {object} RenderInput 스냅샷
 */
export function toRenderSnapshot(core, epoch = 0) {
  const series = {};
  const seriesList = core.seriesList ?? {};
  Object.keys(seriesList).forEach((id) => {
    const s = seriesList[id];
    // 전부 null 인 line 시리즈는 worker 가 그려도 픽셀 0개(element.line draw-skip)라 pack/postMessage 를
    // 생략한다 — element.line.draw 와 동일 판정(hasRenderableValue, isExistGrp 제외).
    if (!s || (typeof s.hasRenderableValue === 'function' && !s.isExistGrp && !s.hasRenderableValue())) {
      return;
    }
    series[id] = {
      ...pickPlain(s, SERIES_META_KEYS),
      data: extractSeriesData(s),
    };
    // heatMap 래스터는 category label 배열(this.labels)을 calculateXY 에서 소비한다.
    // 문자열 label 은 Float64 pack 불가라 별도 plain 배열로 전달(per-type pack 한계 → render-contract §5).
    if (s.type === 'heatMap' && s.labels) {
      series[id].labels = toPlain(s.labels) ?? {};
    }
  });

  // seriesOrder 는 스냅샷에 포함된 시리즈만 참조한다(제외된 빈 시리즈는 worker 가 그리지 않음).
  const seriesOrder = {};
  const charts = core.seriesInfo?.charts ?? {};
  Object.keys(charts).forEach((type) => {
    seriesOrder[type] = (charts[type] ?? []).filter((id) => series[id]);
  });

  return {
    version: RENDER_SNAPSHOT_VERSION,
    epoch,
    pixelRatio: core.pixelRatio ?? 1,
    chartRect: toPlain(core.chartRect) ?? {},
    labelOffset: toPlain(core.labelOffset) ?? {},
    axesSteps: {
      x: toPlain(core.axesSteps?.x) ?? [],
      y: toPlain(core.axesSteps?.y) ?? [],
    },
    options: {
      ...pickPlain(core.options, OPTION_KEYS),
      // heatMap 재구성 입력: legend.type 파생 plain boolean(함수/객체 아님).
      isGradient: core.options?.legend?.type === 'gradient',
    },
    seriesOrder,
    series,
  };
}

/**
 * hit-test 가 소비하는 기하를 plain 으로 추출한다(RenderGeometry 계약).
 * **재계산하지 않는다** — main 의 computeGeometry 가 이미 각 data point/series 인스턴스에 써 둔
 * 값을 그대로 읽어 타입별 형태로 노출할 뿐이다(두 번째 진실 원천 방지). 따라서 computeGeometry 를
 * 선행 호출한 model 에서만 의미 있는 값이 나온다.
 *
 * 타입별 형태:
 *  - line / scatter : { kind:'point', xp:number[], yp:number[] }
 *  - bar / heatMap  : { kind:'rect',  xp:number[], yp:number[], w:number[], h:number[] }
 *  - pie / doughnut : { kind:'arc', centerX, centerY, radius, startAngle, endAngle, slices:[{sa,ea}] }
 *    (pie 를 xp/yp/w/h 로 강제하지 않는다 — element.pie.js 는 각도 기반)
 *
 * @param {object} core   EvChart 인스턴스(또는 seriesList 를 가진 객체)
 * @returns {Object<string, object>} seriesId → RenderGeometry
 */
export function extractRenderGeometry(core) {
  const out = {};
  const seriesList = core.seriesList ?? {};

  Object.keys(seriesList).forEach((id) => {
    const s = seriesList[id];
    if (!s) {
      return;
    }

    if (s.type === 'pie') {
      const slices = (s.data ?? []).map((d) => ({
        sa: typeof d?.sa === 'number' ? d.sa : null,
        ea: typeof d?.ea === 'number' ? d.ea : null,
      }));
      out[id] = {
        kind: 'arc',
        centerX: s.centerX ?? null,
        centerY: s.centerY ?? null,
        radius: s.radius ?? null,
        startAngle: s.startAngle ?? null,
        endAngle: s.endAngle ?? null,
        slices,
      };
      return;
    }

    const data = s.data ?? [];
    const isRect = s.type === 'bar' || s.type === 'heatMap';
    const xp = new Array(data.length);
    const yp = new Array(data.length);
    const w = isRect ? new Array(data.length) : undefined;
    const h = isRect ? new Array(data.length) : undefined;
    for (let i = 0; i < data.length; i++) {
      const d = data[i] ?? {};
      xp[i] = d.xp ?? null;
      yp[i] = d.yp ?? null;
      if (isRect) {
        w[i] = d.w ?? null;
        h[i] = d.h ?? null;
      }
    }

    out[id] = isRect ? { kind: 'rect', xp, yp, w, h } : { kind: 'point', xp, yp };
  });

  return out;
}

/**
 * 스냅샷의 시리즈 수치를 Float64 typed array + Transferable ArrayBuffer 로 묶는다.
 *
 * **copy 경계**: 새 Float64Array 를 만들어 채우므로(원본 plain 배열을 transfer 하지 않음) main 이 계속
 * 쓰는 source 가 detach 되지 않는다. 반환 transferList 의 버퍼는 모두 이 함수가 새로 만든 copy 라
 * worker 로 transfer 해도 안전하다. null/비수치는 NaN sentinel 로 채운다(worker 에서 null 로 환원).
 *
 * @param {object} snapshot  toRenderSnapshot 결과
 * @returns {{ columns: object, transferList: ArrayBuffer[] }}
 *   columns[id] = { length, <col>: Float64Array } (pie=value, 그 외=x/y/o/b)
 */
export function packSeries(snapshot) {
  const columns = {};
  const transferList = [];

  const series = snapshot.series ?? {};
  Object.keys(series).forEach((id) => {
    const data = series[id].data ?? {};
    const packed = {};
    let length = 0;

    Object.keys(data).forEach((col) => {
      const arr = data[col] ?? [];
      length = arr.length;
      const typed = new Float64Array(arr.length);
      for (let i = 0; i < arr.length; i++) {
        typed[i] = typeof arr[i] === 'number' ? arr[i] : NaN;
      }
      packed[col] = typed;
      transferList.push(typed.buffer);
    });

    packed.length = length;
    columns[id] = packed;
  });

  return { columns, transferList };
}
