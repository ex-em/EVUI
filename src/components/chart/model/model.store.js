import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import Util from '../helpers/helpers.util';
import { isEmptySecondLogOn, logEmptySeconds } from '../chart.inspect';

// plugins.interaction findClosestDataIndex 의 최소 hover 스냅 반경과 같은 값.
const MIN_SNAP_THRESHOLD_PX = 6;

// mixed 일반 bar 배치(#2352) — 값 위치 배치 표식과, labels 없는 step 축의 빈 칸 맵.
const MIXED_BY_VALUE = Object.freeze({ byValue: true });
const NO_LABEL_SLOTS = Object.freeze({
  indexByX: new Map(),
  count: 0,
  times: null,
  interval: null,
});

// 오름차순 값의 양수 간격 중앙값(없으면 null). 중복 수집 한 쌍 같은 튀는 간격에 흔들리지 않게 중앙값을 쓴다.
const getMedianGap = (values) => {
  const gaps = [];
  for (let i = 1; i < values.length; i++) {
    const gap = values[i] - values[i - 1];
    if (gap > 0) {
      gaps.push(gap);
    }
  }
  gaps.sort((a, b) => a - b);
  return gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
};

// 범주 순서가 labels·시리즈 순서로 정해지지 않을 때의 비교 — 숫자·Date 는 값, 그 외는 문자열 사전순.
const compareXKey = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const sa = String(a);
  const sb = String(b);
  if (sa === sb) {
    return 0;
  }
  return sa < sb ? -1 : 1;
};

/**
 * step 축(범주) mixed(#2352)의 범주 목록 — labels 순서와 각 시리즈 x 순서를 모두 지키며 labels 에 없는 x 를
 * 끼우고, 두 순서로 앞뒤가 안 정해지는 값끼리는 compareXKey 로 놓는다. 끼울 게 없으면 null.
 * labelSlots 는 labels 자리마다의 범주 인덱스다 — labels 에 같은 값이 있어도 자리마다 다르다.
 * @returns {{values: array, labelSlots: number[]}|null}
 */
export const buildMixedCategories = (labels, pointLists) => {
  // 라벨은 자리마다(중복 라벨 포함), 끼울 x 는 키마다 노드 하나. 간선 = "앞에 와야 한다".
  const values = [];
  const keys = [];
  const nextOf = [];
  const inDegree = [];
  const addNode = (value, key) => {
    values.push(value);
    keys.push(key);
    nextOf.push([]);
    inDegree.push(0);
    return values.length - 1;
  };
  const addEdge = (from, to) => {
    if (from !== to) {
      nextOf[from].push(to);
      inDegree[to] += 1;
    }
  };

  const labelNodeOf = new Map();
  labels.forEach((labelValue, i) => {
    const key = Util.toXKey(labelValue);
    const id = addNode(labelValue, key);
    if (!labelNodeOf.has(key)) {
      labelNodeOf.set(key, id);
    }
    if (i > 0) {
      addEdge(id - 1, id);
    }
  });

  const insertedNodeOf = new Map();
  pointLists.forEach((points) => {
    let prev = null;
    points.forEach((point) => {
      const key = Util.toXKey(point.x);
      let id = labelNodeOf.get(key) ?? insertedNodeOf.get(key);
      if (id === undefined) {
        id = addNode(point.x, key);
        insertedNodeOf.set(key, id);
      }
      if (prev !== null) {
        addEdge(prev, id);
      }
      prev = id;
    });
  });
  if (!insertedNodeOf.size) {
    return null;
  }

  // 위상 정렬. 준비된 노드는 시리즈 수 + 1 개를 넘지 않아 선형 탐색으로 고른다. 순서가 서로 어긋난
  // 입력(순환)이면 아직 안 놓인 가장 앞 노드를 놓아 모든 값을 한 번씩 담는다.
  const placed = new Array(values.length).fill(false);
  const ready = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) {
      ready.push(id);
    }
  });
  const result = [];
  const labelSlots = new Array(labels.length);
  let cursor = 0;
  while (result.length < values.length) {
    let pick = -1;
    let pickAt = -1;
    ready.forEach((id, at) => {
      const order = pick === -1 ? -1 : compareXKey(keys[id], keys[pick]);
      if (order < 0 || (order === 0 && id < pick)) {
        pick = id;
        pickAt = at;
      }
    });
    if (pick === -1) {
      while (placed[cursor]) cursor += 1;
      pick = cursor;
    } else {
      ready.splice(pickAt, 1);
    }

    placed[pick] = true;
    if (pick < labels.length) {
      labelSlots[pick] = result.length;
    }
    result.push(values[pick]);
    nextOf[pick].forEach((id) => {
      inDegree[id] -= 1;
      if (inDegree[id] === 0 && !placed[id]) {
        ready.push(id);
      }
    });
  }
  return { values: result, labelSlots };
};

// { x, y } 스택(tops.byX)은 같은 시각의 아래 값만 base 로 본다(#2352). 원시값은 라벨 인덱스.
const getStackTop = (tops, isPositive, index, labelValue) => {
  if (!tops) {
    return undefined;
  }
  const bucket = isPositive ? tops.pos : tops.neg;
  return tops.byX ? bucket.get(Util.toXKey(labelValue)) : bucket[index];
};

// 원시값 시리즈가 쌓은 인덱스 top 을 시각 키 top 으로 바꾼다 — 인덱스는 labels 인덱스다. labels 에 같은
// 값이 있으면 첫 자리 top 을 둔다({ x, y } 점이 그려지는 칸과 같다).
const toStackTopsByX = ({ pos, neg }, label) => {
  const toMap = (bucket) => {
    const byX = new Map();
    bucket.forEach((top, index) => {
      const key = Util.toXKey(label[index]);
      if (!byX.has(key)) {
        byX.set(key, top);
      }
    });
    return byX;
  };
  return { pos: toMap(pos), neg: toMap(neg), byX: true };
};

// findGraphData 가 인덱싱하는 배열 — line 은 x 가 있는 점만 거른 배열, 그 외는 data 그대로.
const getHitTestPoints = (series) =>
  typeof series._getValidGData === 'function' ? series._getValidGData() : (series.data ?? []);

const hitPosOf = (point) => (point.xp == null ? null : point.xp + (point.w ? point.w / 2 : 0));
const hasValue = (point) => point.o !== null && point.o !== undefined;

// 그리지 않은 막대(labels 칸이 없는 x — 기하 null)는 같은 시각이어도 hover·클릭·selectItem 에 넣지 않는다.
const dropUndrawn = (indices, seriesList) => {
  indices.forEach((index, sId) => {
    if (hitPosOf(getHitTestPoints(seriesList[sId])[index]) === null) {
      indices.delete(sId);
    }
  });
  return indices;
};

// 원시값 bar 끼리는 labels 순서를 공유해 같은 칸이 같은 data 인덱스다(#2352) — x 첫 일치 대신 그 인덱스를
// 담고, labels 보다 짧아 그 인덱스가 없는 시리즈는 뺀다.
const pinRawIndices = (indices, rawIds, index, seriesList) => {
  indices.forEach((_, sId) => {
    if (!rawIds.has(sId)) {
      return;
    }
    if (index < seriesList[sId].data.length) {
      indices.set(sId, index);
    } else {
      indices.delete(sId);
    }
  });
};

/**
 * 픽셀 위치에 가장 가까운, 값이 있는 점. xp 는 x 오름차순과 같은 순서이고 위치가 없는 점(축 범위 밖 null,
 * 그리지 않는 step 축 line 의 NaN)은 양 끝에만 있다는 전제로 이진 탐색한다. spacing 은 점 사이 평균 픽셀 간격.
 */
const findNearestValuedByPos = (points, pos) => {
  let lo = 0;
  let hi = points.length - 1;
  // 정렬 차트처럼 그리지 않는 점은 hover·클릭 기준점이 되지 않는다(같은 시각 포함은 dropUndrawn 이 정한다).
  while (lo <= hi && !Number.isFinite(hitPosOf(points[lo]))) lo += 1;
  while (hi >= lo && !Number.isFinite(hitPosOf(points[hi]))) hi -= 1;
  if (lo > hi) {
    return null;
  }

  let l = lo;
  let h = hi;
  while (l < h) {
    const m = (l + h) >> 1;
    if (hitPosOf(points[m]) < pos) l = m + 1;
    else h = m;
  }

  let left = l - 1;
  while (left >= lo && !hasValue(points[left])) left -= 1;
  let right = l;
  while (right <= hi && !hasValue(points[right])) right += 1;

  const leftDist = left >= lo ? Math.abs(pos - hitPosOf(points[left])) : Infinity;
  const rightDist = right <= hi ? Math.abs(pos - hitPosOf(points[right])) : Infinity;
  if (leftDist === Infinity && rightDist === Infinity) {
    return null;
  }

  const spacing = hi > lo ? (hitPosOf(points[hi]) - hitPosOf(points[lo])) / (hi - lo) : 0;
  return leftDist <= rightDist
    ? { index: left, distance: leftDist, spacing }
    : { index: right, distance: rightDist, spacing };
};

/**
 * x 가 같은 첫 점의 인덱스(없으면 -1). 시각은 숫자로 비교하고(Date·dayjs 포함),
 * 숫자로 바꿀 수 없는 범주 값(step 라벨 문자열)은 그대로 비교한다.
 */
const findIndexByX = (points, x) => {
  const target = +x;
  if (Number.isNaN(target)) {
    return points.findIndex((point) => point.x === x);
  }

  let l = 0;
  let h = points.length - 1;
  while (l <= h) {
    const m = (l + h) >> 1;
    const value = +points[m].x;
    if (value === target) {
      let first = m;
      while (first > 0 && +points[first - 1].x === target) first -= 1;
      return first;
    }
    if (value < target) l = m + 1;
    else h = m - 1;
  }
  return -1;
};

const modules = {
  /**
   * Take chart data and labels to create normalized data and min/max info
   * @param {object}  data    chart series info
   * @param {object}  rawLabel   chart label
   *
   * @returns {undefined}
   */
  createDataSet(data, rawLabel) {
    // mixed step(#2352)이 범주를 늘려 둔 this.data.labels 로 다시 불리면(데이터 없이 옵션만 바뀐 갱신)
    // 원래 labels 로 되돌린다 — 원시값 시리즈가 늘어난 범주 인덱스로 밀리지 않게.
    const label = rawLabel === this.mixedCategoryLabels ? this.mixedSourceLabels : rawLabel;
    // 데이터셋이 재생성될 때마다 +1. computeGeometry 가 (dataEpoch, scaleVersion) 키로 geometry
    // 재계산을 skip 하는 데 쓴다 — 데이터 변경 프레임은 이 증가로 전 시리즈 geometry 가 무효화된다.
    this._dataEpoch = (this._dataEpoch ?? 0) + 1;
    Object.keys(this.seriesInfo.charts).forEach((typeKey) => {
      const seriesIDs = this.seriesInfo.charts[typeKey];

      if (seriesIDs.length) {
        if (typeKey === 'pie') {
          if (this.options.sunburst) {
            this.createSunburstDataSet(data);
          } else {
            this.createPieDataSet(data, seriesIDs);
          }
        } else if (typeKey === 'scatter') {
          seriesIDs.forEach((seriesID) => {
            const series = this.seriesList[seriesID];
            const sData = data[seriesID];
            const passingValue = series?.passingValue;

            if (series && sData) {
              series.data = this.addSeriesDSforScatter(sData);
              series.minMax = this.getSeriesMinMax(series.data, passingValue);
            }
          });
        } else if (typeKey === 'heatMap') {
          seriesIDs.forEach((seriesID) => {
            const series = this.seriesList[seriesID];
            const passingValue = series?.passingValue;
            const sData = data[seriesID];

            if (series && sData) {
              series.labels = label;
              series.data = this.addSeriesDSForHeatMap(sData);
              series.minMax = this.getSeriesMinMax(series.data, passingValue);
              series.valueOpt = this.getSeriesValueOptForHeatMap(series);
            }
          });
        } else {
          // 시리즈마다 동일한 값이므로 루프 밖에서 1회만 계산 (O(N²) → O(N))
          const firstSeriesId = seriesIDs[0];
          const basePassingValue = this.seriesList[firstSeriesId]?.passingValue;

          // 스택 그룹별 부호별 누적 top(base 위치)을 유지해 base 조회를 O(1)로 만든다.
          // (기존 addSeriesStackDS 의 bsIds 역방향 탐색 O(S) 제거 → 그룹 전체 O(L·S²)→O(L·S).
          //  null 이 많아도 비용이 일정 — 매 포인트마다 바닥까지 훑던 최악 케이스가 사라진다.)
          const stackTops = new Map();

          for (let s = 0; s < seriesIDs.length; s++) {
            const seriesID = seriesIDs[s];
            const series = this.seriesList[seriesID];

            // show=false 시리즈는 element.draw 가 이미 그리지 않고, getStoreMinMax·
            // buildLabelValidMask 도 show 시리즈만 집계하므로(축 범위·hit test 에 미반영)
            // 변환 자체를 건너뛴다 — 출력 불변. show 상태는 덮어쓰지 않는다(다시 켜면
            // update()→createDataSet 재호출로 현재 데이터로 변환됨).
            if (series && series.show !== false) {
              const rawData = data?.[seriesID];
              const { passingValue, interpolation } = series;
              const needsTransform =
                interpolation === 'zero' || (passingValue != null && passingValue !== undefined);

              let hasPassingValueInData = false;
              let sData;

              if (!rawData) {
                sData = rawData;
              } else if (!needsTransform) {
                sData = rawData;
              } else {
                sData = new Array(rawData.length);
                for (let i = 0; i < rawData.length; i++) {
                  const item = rawData[i];
                  if (interpolation === 'zero' && !item) {
                    sData[i] = 0;
                  } else if (item === passingValue) {
                    hasPassingValueInData = true;
                    sData[i] = null;
                  } else {
                    sData[i] = item;
                  }
                }
              }

              series.hasPassingValueInData = hasPassingValueInData;

              if (sData) {
                const inStackGroup = series.isExistGrp && !series.isOverlapping;
                // 점 모양은 zero 변환 전 원본으로 본다(첫 원소가 0 으로 채워져도 { x, y }).
                const stacksByX =
                  inStackGroup &&
                  Util.isPointSeries(rawData) &&
                  !Util.isAlignedToLabels(sData, label, this.options.horizontal);
                let tops = null;
                if (inStackGroup) {
                  tops = stackTops.get(series.groupIndex);
                  if (!tops) {
                    // { x, y } 스택은 시리즈마다 같은 인덱스가 같은 시각이 아닐 수 있어 시각을 키로 쌓는다.
                    // x 가 labels 와 자리마다 같으면 원시값처럼 인덱스로 쌓는다(중복 라벨도 칸마다).
                    tops = stacksByX
                      ? { pos: new Map(), neg: new Map(), byX: true }
                      : { pos: [], neg: [] };
                    stackTops.set(series.groupIndex, tops);
                  } else if (!tops.byX && stacksByX) {
                    // 원시값 위에 x 가 labels 와 어긋난 { x, y } 가 오면 같은 시각끼리 쌓도록 시각 키로 바꾼다.
                    tops = toStackTopsByX(tops, label);
                    stackTops.set(series.groupIndex, tops);
                  }
                }

                if (inStackGroup && series.stackIndex) {
                  // 3.4 stackTops base 조회(O(1)) 유지 + 직전 data 를 풀로 전달(점객체 재사용, GC 절감)
                  series.data = this.addSeriesStackDS(
                    sData,
                    label,
                    series.stackIndex,
                    tops,
                    series.data,
                  );
                } else {
                  series.data = this.addSeriesDS(
                    sData,
                    label,
                    series.isExistGrp,
                    basePassingValue,
                    series.data,
                  );
                }
                series.minMax = this.getSeriesMinMax(series.data, series.passingValue);

                // 이 시리즈가 이후 스택 시리즈의 base 가 되므로 누적 top 갱신
                if (inStackGroup) {
                  this.updateStackTops(tops, series);
                }
              }
            }
          }
        }
      }
    });

    // ③ hit test 사전계산: 라벨별 "유효 데이터를 가진 가시 시리즈 존재" mask 를 여기서 1회 만든다.
    // 데이터 변경·범례(show) 토글은 모두 update()→createDataSet() 를 거치므로 이 시점 재계산이 곧 무효화다.
    // (interaction 모듈이 mixin 된 정상 인스턴스에서만 동작. createDataSet 단독 단위 테스트 대비 optional 호출.)
    this.buildLabelValidMask?.();
    this.buildMixedXState(data, label);
  },

  /**
   * 보이는 line·bar 시리즈의 x 가 인덱스마다 같은지 판정해 `this.isMixedX` 에 둔다(#2352).
   * aligned(false)면 hit-test·기하가 기존 공통 인덱스 경로를 그대로 탄다. 원시값 + labels 만 쓰는
   * 차트는 같은 label 을 공유하므로 판정하지 않는다. mixed 일 때만 시리즈별 간격을 계산한다.
   * @param {object} data  createDataSet 이 받은 원본 data
   * @param {array} labels  createDataSet 이 받은 labels(공통 시간 격자)
   * @returns {undefined}
   */
  buildMixedXState(data, labels) {
    this.isMixedX = false;
    this.xIntervalBySeries = null;
    this.mixedLabels = null;
    // 늘려 둔 step 범주는 판정마다 다시 만든다(혼합이 아니게 되면 원래 labels 로 돌아간다).
    if (this.mixedCategoryLabels && this.data?.labels === this.mixedCategoryLabels) {
      this.data.labels = this.mixedSourceLabels;
    }
    this.mixedCategoryLabels = null;
    this.mixedSourceLabels = null;
    this.mixedSourceSlots = null;

    if (this.options.horizontal) {
      return;
    }

    const { line = [], bar = [] } = this.seriesInfo.charts;
    const ids = [...line, ...bar].filter((sId) => {
      const series = this.seriesList[sId];
      return series && series.show !== false && Array.isArray(series.data);
    });
    if (ids.length < 2 || !ids.some((sId) => Util.isPointSeries(data?.[sId]))) {
      return;
    }

    // 시리즈마다 {x: Date} 객체가 따로 생기므로 참조 비교만으로는 같은 시각을 못 알아본다.
    const sameX = (a, b) => a === b || (a != null && b != null && +a === +b);
    const ref = this.seriesList[ids[0]].data;
    this.isMixedX = ids.slice(1).some((sId) => {
      const target = this.seriesList[sId].data;
      if (target.length !== ref.length) {
        return true;
      }
      for (let i = 0; i < target.length; i++) {
        if (!sameX(target[i].x, ref[i].x)) {
          return true;
        }
      }
      return false;
    });

    if (!this.isMixedX) {
      return;
    }

    this.xIntervalBySeries = {};
    ids.forEach((sId) => {
      const points = this.seriesList[sId].data;
      const gaps = [];
      let isAscending = true;
      for (let i = 1; i < points.length; i++) {
        const gap = +points[i].x - +points[i - 1].x;
        if (gap > 0) {
          gaps.push(gap);
        } else if (gap < 0) {
          isAscending = false;
        }
      }

      if (!isAscending && !this._mixedXWarnedOrder) {
        this._mixedXWarnedOrder = true;
        // eslint-disable-next-line no-console
        console.warn(`[evui] chart series "${sId}": x must be ascending for mixed-interval data.`);
      }

      // 최솟값이 아니라 중앙값 — 중복 수집된 한 쌍(수 ms 차이)이 간격을 무너뜨리지 않게 한다.
      if (gaps.length) {
        gaps.sort((a, b) => a - b);
        this.xIntervalBySeries[sId] = gaps[Math.floor(gaps.length / 2)];
      }
    });

    // step 축은 범주 축이라 labels 에 없는 x 는 자리가 없다 — 범주를 늘려 일반 bar 의 모든 점을 그린다.
    // 늘린 범주는 차트 자기 data 복제본의 labels 로 두어 축·selectLabel·툴팁이 같은 인덱스를 쓴다. step 축
    // line·timeMode bar 는 정렬 차트에서도 그리지 않으므로 범주를 늘리는 데 쓰지 않는다.
    const isStepX = this.options.axesX?.[0]?.type === 'step';
    let slotLabels = labels;
    if (isStepX) {
      const pointLists = bar
        .map((sId) => this.seriesList[sId])
        .filter((series) => series && !series.timeMode && Array.isArray(series.data))
        .map((series) => series.data);
      const mixedCategories = buildMixedCategories(labels ?? [], pointLists);
      if (mixedCategories) {
        const categories = mixedCategories.values;
        this.mixedSourceLabels = labels;
        this.mixedSourceSlots = mixedCategories.labelSlots;
        this.mixedCategoryLabels = categories;
        this.data.labels = categories;
        slotLabels = categories;
      }
    }

    // labels(공통 시간 격자)가 있으면 x → 라벨 칸 맵을 둔다. 범주형 축 배치와 maxTip 창이 쓴다. 시각
    // 라벨(categoryMode)이면 labels 에 없는 시각을 앞뒤 칸 사이로 보간하도록 시각 배열과 라벨 간격도 둔다.
    if (slotLabels?.length) {
      const indexByX = new Map();
      slotLabels.forEach((labelValue, index) => {
        const key = Util.toXKey(labelValue);
        if (!indexByX.has(key)) {
          indexByX.set(key, index);
        }
      });
      const times = isStepX ? null : slotLabels.map((labelValue) => +labelValue);
      const isTimeLabels = !!times?.every(Number.isFinite);
      this.mixedLabels = {
        indexByX,
        count: slotLabels.length,
        times: isTimeLabels ? times : null,
        interval: isTimeLabels ? getMedianGap(times) : null,
        // 원시값 bar 는 labels 순서라 x 가 아니라 자기 순서로 칸을 찾는다(labels 에 같은 값이 있어도 각자 칸).
        rawIds: new Set(bar.filter((sId) => ids.includes(sId) && !Util.isPointSeries(data?.[sId]))),
        sourceSlots: this.mixedSourceSlots,
      };
    }

    // selectLabel·줌 인덱스는 labels 칸을 가리키므로 labels 없이는 고를 칸이 없다.
    if (!this.mixedLabels && this.options.selectLabel?.use && !this._mixedXWarnedSelectLabel) {
      this._mixedXWarnedSelectLabel = true;
      // eslint-disable-next-line no-console
      console.warn('[evui] selectLabel on mixed-interval series needs data.labels.');
    }
  },

  /**
   * Take chart data and create a two-dimensional array, specify max/min and delete/add over time.
   * @param {object}  datas    chart series info
   *
   * @returns {undefined}
   */
  createRealTimeScatterDataSet(datas) {
    // 만료 제거(expire)된 series 는 신규 점이 도착하기 전까지 누적 저장소를 재생성하지 않는다.
    // 소비자가 증분 틱에서 죽은 series 키(data.data 의 빈 배열)를 계속 보내도 orphan dataSet 으로
    // 되살아나지 않게, 처리 대상 키에서 제외한다. 신규 점이 다시 오면 부활은 reconcileSeriesSet
    // (updateSeries 강제)에서 일원화 처리하며, 그 시점엔 이미 prunedRealTimeScatterSeries 에서 빠진다.
    const prunedSet = this.prunedRealTimeScatterSeries;
    let keys = prunedSet?.size
      ? Object.keys(datas).filter((key) => !prunedSet.has(key))
      : Object.keys(datas);
    // 처리할 키가 없는 배치(소비자가 마지막 키까지 뺀 `data: {}`)는 기존 series 전부를 빈 배치로 처리한다.
    // 루프가 돌지 않으면 축 우측단·Y 범위가 0 으로 남고 lastTick 도 그대로라 점 레이어가 다시 그려지지 않는다.
    if (!keys.length) {
      keys = Object.keys(this.dataSet);
    }

    const minMaxValues = {
      // 음수 전용 데이터에서 maxY 가 0 으로 clamp 되지 않도록 -Infinity 에서 시작한다.
      // 유효 데이터가 하나도 없으면 아래 fallback(isFinite(minY) 검사)에서 0/0 으로 되돌린다.
      maxY: -Infinity,
      minY: Infinity,
      fromTime: 0,
      toTime: 0,
    };
    const noDataEdge = { fromTime: 0, toTime: 0 };

    for (let x = 0; x < keys.length; x++) {
      const key = keys[x];
      const data = datas[key];
      const storeLength = data?.length;

      // 1) init / updateSeries 시 dataset shape 보장
      if (!this.isInit || this.updateSeries || !this.dataSet[key]) {
        const defaultValues = {
          dataGroup: [],
          startIndex: 0,
          endIndex: null,
          length: 0,
          fromTime: 0,
          toTime: 0,
          lastDataTime: 0,
        };

        this.dataSet[key] = {
          ...defaultValues,
          ...this.dataSet[key],
        };
      }

      const dataset = this.dataSet[key];
      const dataGroup = dataset.dataGroup;

      // 2) range(length) 결정 + 변경 감지
      const nextLength = this.options.realTimeScatter.range || 300;
      const lengthChanged = dataset.length !== nextLength;
      dataset.length = nextLength;
      const length = dataset.length;

      // 3) 이번 배치의 lastTime(초 단위) 계산
      let lastTime = 0;
      for (let i = 0; i < storeLength; i++) {
        const item = data[i];
        if (item && lastTime < item.x) {
          lastTime = item.x;
        }
      }

      lastTime = lastTime ? Math.floor(lastTime / 1000) * 1000 : 0;

      const dataGroupLastTime = dataGroup.at(-1)?.data?.at(-1)?.x || Date.now();
      const fallbackTime = Math.floor(dataGroupLastTime / 1000) * 1000;

      // 4) prevToTime은 덮기 전 값 (없으면 fallback)
      const prevToTime = dataset.toTime || fallbackTime;

      // 5) nextToTime 결정: 새 데이터가 있으면 lastTime, 없으면 이전 유지.
      // 실제 점이 준 최신 시각(lastDataTime) 아래로는 내려가지 않는다 — 늦게 온 옛 배치가 기준을 되돌리면
      // 다음 배치의 gap 이 그만큼 부풀어 좌단 버킷이 일찍 비워진다. 하한을 toTime 으로 두지 않는 건
      // 점 없는 배치에서 toTime 이 Date.now() fallback 으로 채워질 수 있어서다.
      // 단, 창(fromTime)에 한 점도 못 들어갈 만큼 과거인 배치는 늦은 응답이 아니라 시각 이동(시계 보정·
      // 미래 이상치 이후)으로 보고 기준을 다시 잡는다 — 하한을 고집하면 이후 점이 전부 창 밖에 버려진다.
      let nextToTime = prevToTime;
      if (lastTime) {
        const isBeforeWindow = lastTime < dataset.lastDataTime - length * 1000;
        nextToTime = isBeforeWindow ? lastTime : Math.max(lastTime, dataset.lastDataTime);
        dataset.lastDataTime = nextToTime;
      }

      const resetDataGroup = (group) => {
        group.data.length = 0;
        if (group.dataKeys) {
          group.dataKeys.clear();
        } else {
          group.dataKeys = new Set();
        }
        group.max = 0;
        group.min = Infinity;
      };

      // 6) endIndex/startIndex 초기화 (최초 1회) + length 변경 시 재구성
      if (dataset.endIndex == null || lengthChanged) {
        dataset.startIndex = 0;
        dataset.endIndex = length - 1;

        // dataGroup 크기 맞추고 모두 reset
        dataGroup.length = length;
        for (let i = 0; i < length; i++) {
          dataGroup[i] = dataGroup[i] || { data: [], dataKeys: new Set(), max: 0, min: Infinity };
          resetDataGroup(dataGroup[i]);
        }

        // toTime/fromTime도 새 기준으로 맞춤
        dataset.toTime = nextToTime;
        dataset.fromTime = dataset.toTime - length * 1000;
      }

      // 7) gapCount 계산 (반드시 정수) — prevToTime 기준
      const rawGap = (nextToTime - prevToTime) / 1000;
      const gapCount = Number.isFinite(rawGap) ? Math.max(0, Math.floor(rawGap)) : 0;

      // 8) to/from 갱신
      dataset.toTime = nextToTime;
      dataset.fromTime = dataset.toTime - length * 1000;

      // 9) dataGroup 슬롯 확보
      for (let i = 0; i < length; i++) {
        if (!dataGroup[i]) {
          dataGroup[i] = { data: [], dataKeys: new Set(), max: 0, min: Infinity };
        } else if (!dataGroup[i].data) {
          dataGroup[i].data = [];
          dataGroup[i].dataKeys = new Set();
          dataGroup[i].max = 0;
          dataGroup[i].min = Infinity;
        } else if (!dataGroup[i].dataKeys) {
          dataGroup[i].dataKeys = new Set();
        }
      }

      // 10) gap만큼 링 전진 + 지나간 버킷 clear
      if (gapCount > 0) {
        if (gapCount >= length) {
          for (let i = 0; i < length; i++) resetDataGroup(dataGroup[i]);
          dataset.startIndex = 0;
          dataset.endIndex = length - 1;
        } else {
          let currentStart = dataset.startIndex;
          let currentEnd = dataset.endIndex;

          for (let i = 0; i < gapCount; i++) {
            resetDataGroup(dataGroup[currentStart]);
            currentStart = (currentStart + 1) % length;
            currentEnd = (currentEnd + 1) % length;
          }

          dataset.startIndex = currentStart;
          dataset.endIndex = currentEnd;
        }
      }

      // 11) 데이터 push (윈도우 안에 들어오는 것만)
      // coordinateDedupe=false 는 #2011 에서 "모든 중복 좌표 표시" opt-out 으로 도입됐다.
      // data 레이어에서 dedupe 가 강제되면 draw 레이어의 opt-out 도 무력화되므로 옵션을 존중한다.
      const isDedupeOn = this.options.coordinateDedupe !== false;
      // blit fast-path 안전장치: 이번 틱 신규 점이 윈도우 우측단(toTime)에서 몇 초(=버킷) 뒤까지
      // 들어왔는지의 최댓값. 신규 점이 우측 strip 보다 오래된 버킷에 떨어지면(지연/역순 데이터)
      // strip-only redraw 로는 그 점이 누락되므로, draw 단계가 이 값을 보고 full redraw 로 폴백한다.
      let maxDirtyAge = -1;
      for (let i = 0; i < storeLength; i++) {
        const item = data[i];
        if (item) {
          const xAxisTime = Math.floor(item.x / 1000) * 1000;

          if (dataset.fromTime <= xAxisTime) {
            let index = dataset.endIndex - (dataset.toTime - xAxisTime) / 1000;
            if (index < 0) index = length + index;

            const group = dataGroup[index];
            const dedupeKey = Util.coordinateKey(item.x, item.y);
            const isDuplicate = isDedupeOn && group.dataKeys.has(dedupeKey);

            if (!isDuplicate) {
              if (isDedupeOn) {
                group.dataKeys.add(dedupeKey);
              }
              group.data.push({
                x: item.x,
                y: item.y,
                o: item.value ?? item.y,
                color: item.color,
                // 렌더 단계 dedupe 가 매 프레임 재생성하던 좌표 키를 push 시점에 1회 캐시.
                // dedupe off 면 draw 가 키를 보지 않으므로 저장하지 않는다.
                // 단일 scatter series 면 canSkipRealtimeScatterDedupe 가 항상 스킵 → element 가
                // k 를 읽지 않으므로 저장 자체를 생략한다(configured count 는 legend toggle 에 안 흔들림).
                k: isDedupeOn && this.seriesInfo.charts.scatter.length > 1 ? dedupeKey : undefined,
              });

              group.max = Math.max(group.max, item.y);
              group.min = Math.min(group.min, item.y);

              // 신규 점이 우측단에서 (toTime - xAxisTime)/1000 버킷만큼 뒤. 시간 정렬돼 있어 비용 0에 가까움.
              const age = (dataset.toTime - xAxisTime) / 1000;
              if (age > maxDirtyAge) {
                maxDirtyAge = age;
              }
            }
          }
        }
      }

      // 11.5) blit fast-path 용 틱 메타 기록. 모두 위에서 이미 계산된 값이라 추가 비용이 없다.
      //  - gapCount   : 이번 틱 링 전진량(왼쪽으로 시프트될 버킷 수)
      //  - prevToTime : 덮기 전 윈도우 우측단 시간(시프트량 dx 산출용)
      //  - toTime     : 갱신된 우측단 시간
      //  - length     : 윈도우 버킷 수(= range)
      //  - start/endIndex : 링 포인터(신규 strip 버킷 매핑용)
      //  - maxDirtyAge : 신규 점이 우측단에서 떨어진 최대 버킷 거리(-1=신규 없음). strip 범위 밖이면 full 폴백.
      // draw 단계(chart.core.evaluateBlitGate / element.scatter.realTimeScatterDrawStrip)가 소비한다.
      dataset.lastTick = {
        // 데이터 틱 단조 시퀀스. toTime/endIndex 는 sub-second 틱(gapCount 0)에서 그대로라
        // "데이터가 갱신됐는가" 판정(points layer 스탬프)에는 seq 가 필요하다.
        seq: (dataset.lastTick?.seq ?? 0) + 1,
        gapCount,
        prevToTime,
        toTime: dataset.toTime,
        length,
        startIndex: dataset.startIndex,
        endIndex: dataset.endIndex,
        maxDirtyAge,
      };

      // 12) series min/max 계산 (fromTime ~ toTime 범위 내 데이터만 포함)
      const MS_PER_SECOND = 1000;
      // maxY 도 minY 와 대칭으로 -Infinity 에서 시작 — 음수 데이터의 실제 최대값을 잡는다.
      const tempMinMax = { maxY: -Infinity, minY: Infinity };

      for (let i = 0; i < length; i++) {
        const g = dataGroup[i];
        for (let j = 0; j < g.data.length; j++) {
          const point = g.data[j];
          // point.x(ms)를 초 단위로 내림하여 슬롯 기준 시간(fromTime/toTime)과 비교 가능하게 맞춤
          const pointTimeInSeconds = Math.floor(point.x / MS_PER_SECOND) * MS_PER_SECOND;
          const isInTimeRange =
            pointTimeInSeconds >= dataset.fromTime && pointTimeInSeconds <= dataset.toTime;
          if (isInTimeRange && Number.isFinite(point.y)) {
            if (point.y > tempMinMax.maxY) tempMinMax.maxY = point.y;
            if (point.y < tempMinMax.minY) tempMinMax.minY = point.y;
          }
        }
      }

      const hasValidData = Number.isFinite(tempMinMax.minY);
      if (hasValidData) {
        minMaxValues.maxY = Math.max(minMaxValues.maxY, tempMinMax.maxY);
        minMaxValues.minY = Math.min(minMaxValues.minY, tempMinMax.minY);
      }
      // 렌더 X축 윈도우는 전역 우측단(= 점을 받은 series 의 toTime 최댓값)을 따라야 prune 윈도우(globalToTime)와
      // 일치한다. last-write-wins 로 마지막 처리 키의 toTime 을 쓰면, 신규 점이 끊긴 stale series 가 마지막
      // 키일 때 살아있는 series 의 maxX 까지 그 옛 시각에 묶여 축이 prune 전까지 freeze 된다. fromTime 은
      // 항상 toTime - length*1000 이므로 max 인 series 의 fromTime 을 함께 취한다.
      // 점을 받은 적 없는 series(lastDataTime 0)는 리셋 전 시각·Date.now() fallback 을 들고 있어 따로 모은다.
      const edge = dataset.lastDataTime ? minMaxValues : noDataEdge;
      if (dataset.toTime > edge.toTime) {
        edge.toTime = dataset.toTime;
        edge.fromTime = dataset.fromTime;
      }
    }

    // 점을 받은 series 가 하나도 없을 때(마운트·리셋 직후)만 나머지 series 로 우측단을 잡는다.
    if (!minMaxValues.toTime) {
      minMaxValues.toTime = noDataEdge.toTime;
      minMaxValues.fromTime = noDataEdge.fromTime;
    }

    if (!Number.isFinite(minMaxValues.minY)) {
      minMaxValues.minY = 0;
      minMaxValues.maxY = 0;
    }

    // 개별 series 만료 제거(realTimeScatter 기본 동작). append 직후 스캔하므로 toTime 이 최신 상태다.
    // seriesInfo.charts.scatter 를 splice 한 뒤 아래 forEach 가 잔여 series 만 순회하도록 여기서 호출.
    this.pruneExpiredRealTimeScatterSeries(datas);

    this.seriesInfo.charts.scatter.forEach((seriesID) => {
      const series = this.seriesList[seriesID];
      series.data = this.dataSet;
      series.minMax = {
        // X축 좌단은 "실제 보유한 가장 오래된 버킷"에 맞춘다. fromTime(= toTime - range*1000)은 링이
        // 보유하는 가장 오래된 버킷(toTime - (range-1)*1000)보다 1버킷(=1초) 더 왼쪽이라, 그대로 쓰면
        // 맨 왼쪽 1버킷이 항상 비어 좌단 결손(full redraw)·좌단 깜빡임(blit 고스트)이 생긴다.
        minX: dayjs(minMaxValues.fromTime + 1000),
        minY: minMaxValues.minY,
        maxX: dayjs(minMaxValues.toTime),
        maxY: minMaxValues.maxY,
      };
    });

    // 콘솔 진단(chart.inspect): localStorage 로 켠 경우에만 마운트 뒤 새로 지나간 빈 초를 찍는다.
    if (isEmptySecondLogOn()) {
      logEmptySeconds(this, minMaxValues.fromTime + 1000, minMaxValues.toTime);
    }
  },

  /**
   * realTimeScatter 누적 저장소에서 개별 series 를 만료 제거한다.
   *
   * realTimeScatter 의 기본 동작이다(별도 옵션 없이 항상 동작). 가시 범위 밖으로 완전히 밀려나고
   * 신규 점도 끊긴 series 가 누적 저장소·범례에 무한정 남지 않도록 자동 정리한다.
   * 제거 조건(AND)을 만족하면 즉시 제거한다(grace 없음):
   *  - (a) 렌더되는 가시 윈도우 안에 점이 하나도 없음. 좌단은 렌더 좌단(series minMax.minX)과
   *        같은 값을 써야 등가다 — 아래 `visibleStart` 주석 참고.
   *  - (b) 이번 수신 틱에 그 series 의 신규 점이 없음(`!datas[sId]?.length`).
   *        이번 틱에 점을 보낸 series 는 (오래된 점이라도) 활성으로 보고 보존한다.
   * "series 키 부재"로는 판정하지 않는다 — 죽은 키가 data.series/data.data 에 남아 있을 수 있어서다.
   *
   * @param {object} datas  이번 틱 수신 데이터(createRealTimeScatterDataSet 인자)
   * @returns {undefined}
   */
  pruneExpiredRealTimeScatterSeries(datas) {
    const dataSet = this.dataSet;
    const keys = Object.keys(dataSet);
    if (!keys.length) {
      return;
    }

    // 전역 윈도우 우측단 — 렌더 우측단과 같은 규칙(점을 받은 series 의 toTime 최댓값, 없으면 전 series).
    let globalToTime = 0;
    let noDataToTime = 0;
    for (let i = 0; i < keys.length; i++) {
      const ds = dataSet[keys[i]];
      const t = ds.toTime || 0;
      if (ds.lastDataTime) {
        globalToTime = Math.max(globalToTime, t);
      } else {
        noDataToTime = Math.max(noDataToTime, t);
      }
    }
    if (!globalToTime) {
      globalToTime = noDataToTime;
    }

    const range = this.options.realTimeScatter?.range || 300;
    // 렌더 좌단(= series minMax.minX = fromTime + 1000)까지 포함해야 "가시 점 0개"와 일치한다.
    const visibleStart = globalToTime - (range - 1) * 1000;

    const pruned = [];
    for (let i = 0; i < keys.length; i++) {
      const sId = keys[i];
      const ds = dataSet[sId];
      const hasNoVisiblePoint = ds.toTime < visibleStart; // (a)
      const hasNoNewData = !datas[sId]?.length; // (b)

      // (a)+(b)면 가시 범위 밖으로 완전히 밀려났고 신규 점도 없으므로 즉시 제거한다(grace 없음).
      if (hasNoVisiblePoint && hasNoNewData) {
        pruned.push(sId);
      }
    }

    if (!pruned.length) {
      return;
    }

    for (let i = 0; i < pruned.length; i++) {
      this.removeRealTimeScatterSeries(pruned[i]);
    }

    // 외부 범례는 update() 의 emitLegendData(매 데이터 틱) 로도 갱신되지만, 내부 범례는
    // updateSeries=false 인 정상 틱에서 행이 재생성되지 않으므로 여기서 직접 rebuild 한다.
    // (단위 테스트 store 에는 두 메서드가 없어 optional 호출.)
    const legend = this.options.legend;
    if (legend?.show && legend?.external) {
      this.emitLegendData?.();
    } else if (legend?.show) {
      this.updateLegend?.();
    }
  },

  /**
   * 만료된 realTimeScatter series 하나를 누적 저장소·레지스트리·선택 상태에서 제거한다.
   * 재추가 방지 가드(prunedRealTimeScatterSeries)에 등록해, data.series 에 키가 남아 있어도
   * 신규 점이 오기 전까지는 createRealTimeScatterDataSet/reconcileSeriesSet 가 재생성하지 않는다.
   *
   * @param {string} sId  제거할 series ID
   * @returns {undefined}
   */
  removeRealTimeScatterSeries(sId) {
    delete this.dataSet[sId];

    if (this.seriesList?.[sId]) {
      delete this.seriesList[sId];
    }

    const scatter = this.seriesInfo?.charts?.scatter;
    if (Array.isArray(scatter)) {
      const idx = scatter.indexOf(sId);
      if (idx !== -1) {
        scatter.splice(idx, 1);
      }
    }

    // show series 수 재계산(외부 범례 toggle 로직과 드리프트 방지). 단위 테스트엔 없어 optional.
    this._updateSeriesCount?.();

    // 재추가 방지 가드.
    (this.prunedRealTimeScatterSeries ??= new Set()).add(sId);

    // 선택 상태가 제거된 series 를 가리키면 해제.
    const selSeriesId = this.defaultSelectInfo?.seriesId;
    if (Array.isArray(selSeriesId)) {
      const idx = selSeriesId.indexOf(sId);
      if (idx !== -1) {
        selSeriesId.splice(idx, 1);
      }
    }
    if (this.defaultSelectItemInfo?.seriesID === sId) {
      this.defaultSelectItemInfo = null;
    }
  },

  /**
   * realTimeScatterReset 용 — 전 series 링을 비우고 기준 시각 하한(lastDataTime)을 푼다.
   * 하한이 남으면 리셋 뒤 과거 시각 데이터가 모두 창 밖으로 취급돼 차트가 멈춘다.
   * toTime·링 포인터는 그대로 두어 리셋 직후 첫 배치의 만료 판정이 리셋 전과 같다.
   *
   * @returns {undefined}
   */
  resetRealTimeScatterDataSet() {
    Object.values(this.dataSet ?? {}).forEach((dataset) => {
      dataset.dataGroup = [];
      dataset.lastDataTime = 0;
    });
  },

  /**
   * Take chart data and to create normalized pie data
   * @param {object}  data    chart series info
   *
   * @returns {undefined}
   */
  createSunburstDataSet(data) {
    this.pieDataSet = [];
    const ds = this.pieDataSet;
    const sunburstQueue = [];

    for (let ix = 0; ix < data.length; ix++) {
      const slice = data[ix];
      const series = this.seriesList[slice.id];
      let showChildren = false;

      if (!ds[0]) {
        ds[0] = { ir: 0, or: 0, total: 0, data: [] };
      }

      if (series.show) {
        ds[0].total += slice.value || 0;
        ds[0].data.push({ parent: '$ev-root', id: slice.id, value: slice.value, sa: 0, ea: 0 });

        if (slice.children) {
          for (let jx = 0; jx < slice.children.length; jx++) {
            const childSeries = this.seriesList[slice.children[jx].id];
            if (childSeries.show) {
              showChildren = true;
            }
            sunburstQueue.push({ parent: slice.id, data: slice.children[jx], depth: 1 });
          }
        } else {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: 1 });
        }

        if (!showChildren) {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: 1 });
        }
      }
    }

    ds[0].data.sort((a, b) => b.value - a.value);

    while (sunburstQueue.length) {
      const item = sunburstQueue.shift();
      const parent = item.parent;
      const slice = item.data;
      const depth = item.depth;
      let showChildren = false;

      if (!ds[depth]) {
        ds[depth] = { ir: 0, or: 0, total: {}, data: [] };
      }

      if (!ds[depth].total[parent]) {
        ds[depth].total[parent] = 0;
      }

      const series = this.seriesList[slice.id];
      if (slice.id === 'dummy') {
        ds[depth].data.push({ parent, id: 'dummy', value: slice.value, sa: 0, ea: 0 });
        ds[depth].total[parent] += slice.value;
      } else if (series && series.show) {
        ds[depth].data.push({ parent, id: slice.id, value: slice.value, sa: 0, ea: 0 });
        ds[depth].total[parent] += slice.value;

        if (slice.children) {
          for (let ix = 0; ix < slice.children.length; ix++) {
            if (this.seriesList[slice.children[ix].id].show) {
              showChildren = true;
            }
            sunburstQueue.push({ parent: slice.id, data: slice.children[ix], depth: depth + 1 });
          }
        } else {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: depth + 1 });
        }

        if (!showChildren) {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: depth + 1 });
        }
      }

      ds[depth].data.sort((a, b) => b.value - a.value);
    }
  },

  /**
   * Take chart data and to create normalized pie data
   * @param {object}  data    chart data
   * @param {String[]}  seriesIDs     chart series info
   *
   * @returns {undefined}
   */
  createPieDataSet(data, seriesIDs) {
    this.pieDataSet = [];
    const ds = this.pieDataSet;
    ds[0] = { data: [], ir: 0, or: 0, total: 0 };

    seriesIDs.forEach((sId) => {
      if (this.seriesList[sId].show) {
        const value = data[sId][0] ?? 0;
        ds[0].total += value;
        ds[0].data.push({ id: sId, value, sa: 0, ea: 0 });
      }
    });

    ds.forEach((item) => {
      item.data.sort((a, b) => b.value - a.value);
    });
  },

  /**
   * Take data and label to create stack data for each series
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   * @param {number}  sIdx    series ordered index
   * @param {{pos: number[], neg: number[]}}  tops  스택 그룹의 부호별 누적 top(base 위치)
   * @param {ChartSeriesDataPoint[]} [prevData]  직전 데이터셋(점객체 풀 재사용용)
   *
   * @typedef {import('./index').ChartSeriesDataPoint} ChartSeriesDataPoint
   *
   * @returns {ChartSeriesDataPoint[]} data for each series
   */
  addSeriesStackDS(data, label, sIdx = 0, tops = null, prevData) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];
    // 직전 데이터셋의 점객체를 재사용(addSeriesDS 와 동일 전략) — 매 틱 N개 객체 할당/GC 제거.
    const pool = Array.isArray(prevData) ? prevData : null;

    data.forEach((curr, index) => {
      let odata = curr; // current series original data
      let ldata = label[index]; // label data
      let gdata = curr; // current series data which added previous series's value
      let signValue = curr;

      // { x, y } 는 labels 가 없어도(값 기반 축) 자기 x 로 점을 만들고, 부호도 값으로 본다(#2352).
      if (curr && typeof curr === 'object' && ('x' in curr || 'y' in curr)) {
        odata = isHorizontal ? curr.x : curr.y;
        ldata = isHorizontal ? curr.y : curr.x;
        signValue = odata?.value ?? odata;
      }

      // base(아래 스택) 위치: 부호별 누적 top 에서 O(1) 조회.
      // 기존 bsIds 역방향 탐색과 동치 — 가장 최근에 갱신된 "보이는 동일부호 유효 base"가 곧 누적 top.
      let bdata = getStackTop(tops, signValue >= 0, index, ldata) ?? 0; // base(previous) series data

      if (ldata != null) {
        const oData = odata?.value ?? odata;
        if (sIdx > 0) {
          if (oData != null) {
            gdata = bdata + oData;
          } else {
            gdata = odata;
          }
        } else {
          bdata = 0;
          gdata = oData;
        }

        const reused = pool && pool[sdata.length];
        sdata.push(this.addData(gdata, ldata, odata, bdata, reused || null));
      }
    });

    return sdata;
  },

  /**
   * 방금 data 가 계산된 스택 시리즈로 그룹의 부호별 누적 top(base 위치)을 갱신한다.
   * addSeriesStackDS 의 base 조회를 O(1) 로 만들기 위한 보조 상태이며,
   * 갱신 규칙은 기존 getBaseDataPosition 의 accept 조건과 동치다:
   *   show 시리즈만, position(null 아님) && passingValue 아님 → 해당 부호 버킷에 기록.
   * 인덱스는 series.data(압축본) 기준으로 기록하고 조회는 라벨 인덱스로 하므로
   * 기존 `baseSeries.data[dataIndex]` 접근과 동일한 정렬을 유지한다.
   * @param {{pos: number[], neg: number[]}}  tops  그룹 누적 top
   * @param {object}  series  방금 data 가 계산된 시리즈
   *
   * @returns {undefined}
   */
  updateStackTops(tops, series) {
    if (!series.show) {
      return;
    }

    const isHorizontal = this.options.horizontal;
    const passingValue = series.passingValue;
    const usePassingValue = !Util.isNullOrUndefined(passingValue);
    const data = series.data;
    const pos = tops.pos;
    const neg = tops.neg;
    // 시각 키 top 은 한 시리즈 안에서 같은 키의 첫 자리만 쓴다 — labels 에 같은 값이 있으면 첫 칸 기준(#2352).
    const written = tops.byX ? { pos: new Set(), neg: new Set() } : null;

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const position = isHorizontal ? p.x : p.y;
      const baseValue = p.o;
      const isPassingValue = usePassingValue && baseValue === passingValue;

      if (position != null && !isPassingValue) {
        const bucket = baseValue >= 0 ? pos : neg;
        if (tops.byX) {
          const key = Util.toXKey(isHorizontal ? p.y : p.x);
          const keys = baseValue >= 0 ? written.pos : written.neg;
          if (!keys.has(key)) {
            keys.add(key);
            bucket.set(key, position);
          }
        } else {
          bucket[i] = position;
        }
      }
    }
  },

  /**
   * Take data and label to create data for each series
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   * @param {boolean}  isBase   is Base(bottommost) series at stack chart
   *
   * @typedef {import('./index').ChartSeriesDataPoint} ChartSeriesDataPoint
   *
   * @returns {ChartSeriesDataPoint[]} data for each series
   */
  addSeriesDS(data, label, isBase, passingValue, prevData) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];
    const usePassingValue = isBase && !Util.isNullOrUndefined(passingValue);
    // 직전 데이터셋의 포인트 객체를 재사용해 매 update마다의 N개 객체 할당(GC 압력)을 제거한다.
    // 모든 포인트 객체는 동일한 10필드 형태이고 아래에서 전 필드를 덮어쓰므로 stale 값 위험이 없다.
    const pool = Array.isArray(prevData) ? prevData : null;

    for (let i = 0; i < data.length; i++) {
      let gdata = data[i];
      let ldata = label[i];

      if (gdata && typeof gdata === 'object' && (gdata.x || gdata.y)) {
        gdata = isHorizontal ? gdata.x : gdata.y;
        ldata = isHorizontal ? data[i].y : data[i].x;
      }

      if (ldata !== null) {
        const value = usePassingValue && gdata === passingValue ? 0 : gdata;

        if (
          (value !== null && typeof value === 'object') ||
          (gdata !== null && typeof gdata === 'object')
        ) {
          sdata.push(this.addData(value, ldata, gdata));
        } else {
          const v = value ?? null;
          const o = gdata ?? null;
          const reused = pool && pool[sdata.length];

          if (reused && typeof reused === 'object') {
            reused.x = isHorizontal ? v : ldata;
            reused.y = isHorizontal ? ldata : v;
            reused.o = o;
            reused.b = null;
            reused.xp = null;
            reused.yp = null;
            reused.w = null;
            reused.h = null;
            reused.dataColor = null;
            reused.dataTextColor = null;
            sdata.push(reused);
          } else {
            sdata.push(
              isHorizontal
                ? {
                    x: v,
                    y: ldata,
                    o,
                    b: null,
                    xp: null,
                    yp: null,
                    w: null,
                    h: null,
                    dataColor: null,
                    dataTextColor: null,
                  }
                : {
                    x: ldata,
                    y: v,
                    o,
                    b: null,
                    xp: null,
                    yp: null,
                    w: null,
                    h: null,
                    dataColor: null,
                    dataTextColor: null,
                  },
            );
          }
        }
      }
    }

    return sdata;
  },

  /**
   * Take data to create data for each series
   * @param {array}  data   data array for each series
   * @returns {array} data info added position and etc
   */
  addSeriesDSforScatter(data) {
    return data.map((item) => {
      const ldata = item.x;
      const gdata = {
        value: item.y,
        color: item?.color || null,
      };

      return this.addData(gdata, ldata, gdata);
    });
  },

  /**
   * Take data to create data for each series
   * @param {array} data data array for each series
   *
   * @returns {array} data info added position and etc
   */
  addSeriesDSForHeatMap(data) {
    return data.map(({ x, y, value, color = null }) => ({
      x,
      y,
      o: value,
      xp: null,
      yp: null,
      w: null,
      h: null,
      dataColor: color,
      cId: null,
    }));
  },

  /**
   * Take data to create data object for graph
   * @param {object}  gdata    graph data (y-axis value for vertical chart)
   * @param {object}  ldata    label data (x-axis value for vertical chart)
   * @param {object}  odata    original data (without stacked value)
   * @param {object}  bdata    base data (stacked value)
   *
   * @typedef {import('./index').ChartSeriesDataPoint} ChartSeriesDataPoint
   *
   * @returns {ChartSeriesDataPoint} data for each graph point
   */
  addData(gdata, ldata, odata = null, bdata = null, target = null) {
    let gdataValue = null;
    let odataValue = null;
    let gdataColor = null;
    let odataColor = null;
    let dataTextColor = null;

    if (gdata !== null && typeof gdata === 'object') {
      gdataValue = gdata.value;
      gdataColor = gdata.color;
      dataTextColor = gdata.textColor;
    } else {
      gdataValue = gdata ?? null;
    }

    if (odata !== null && typeof odata === 'object') {
      odataValue = odata.value;
      odataColor = odata.color;
    } else {
      odataValue = odata ?? null;
    }

    // target 이 주어지면 그 객체를 재사용(점객체 풀)해 매 틱 N개 객체 할당(GC 압력)을 줄인다.
    // 주의: 객체 identity 가 유지되므로 점객체를 키로 하는 외부 캐시(WeakMap 등)나 외부 모듈이
    // 붙인 파생 필드(예: tooltip 의 data.formatted — 아래 리셋 필드에 없음)는 여기서 자동
    // 무효화되지 않는다. 소비자는 _dataEpoch(createDataSet 진입 시 +1)로 무효화해야 한다.
    const data = target || {};
    if (this.options.horizontal) {
      data.x = gdataValue;
      data.y = ldata;
    } else {
      data.x = ldata;
      data.y = gdataValue;
    }
    data.o = odataValue;
    data.b = bdata;
    data.xp = null;
    data.yp = null;
    data.w = null;
    data.h = null;
    data.dataColor = gdataColor ?? odataColor;
    data.dataTextColor = dataTextColor;

    return data;
  },

  /**
   * Take series data to create min/max info for each series
   * @param {object}  data    series data
   *
   * @returns {object} min/max info for series
   */
  getSeriesMinMax(data, passingValue) {
    const def = { minX: null, minY: null, maxX: null, maxY: null, maxDomain: null };
    const isHorizontal = this.options.horizontal;

    if (data.length) {
      const usePassingValue = !Util.isNullOrUndefined(passingValue);
      const minmax = {
        minX: data[0].x,
        minY: data[0].y,
        maxX: data[0].x,
        maxY: data[0].y,
        maxDomain: isHorizontal ? data[0].y : data[0].x,
        maxDomainIndex: 0,
      };

      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        // addData/addSeriesDS/addSeriesDSforScatter/addSeriesDSForHeatMap 결과 객체의
        // x/y/o는 항상 primitive(또는 null) — 옵셔널 체이닝 불필요
        const px = p.x;
        const py = p.y;
        const po = p.o;

        if (!usePassingValue || po !== passingValue) {
          if (px <= minmax.minX) {
            minmax.minX = px === null ? 0 : px;
          }

          if (py <= minmax.minY) {
            minmax.minY = py === null ? 0 : py;
          }

          if (px >= minmax.maxX) {
            minmax.maxX = px === null ? 0 : px;

            if (isHorizontal && px !== null) {
              minmax.maxDomain = py;
              minmax.maxDomainIndex = i;
            }
          }

          if (py >= minmax.maxY) {
            minmax.maxY = py === null ? 0 : py;

            if (!isHorizontal && py !== null) {
              minmax.maxDomain = px;
              minmax.maxDomainIndex = i;
            }
          }
        }
      }

      return minmax;
    }

    return def;
  },

  /**
   * 가시 윈도우 [minIndex, maxIndex] 안에서 visible 시리즈를 스캔해 최댓값 점을
   * { sId, value, index, domain }으로 반환한다. axis range로 일부만 보일 때 maxTip이
   * 윈도우 밖 전역 max를 가리키지 않게 하기 위함(전역 series.minMax 캐시는 안 건드림).
   *
   * bar/line/scatter 모두 후보다(combo에서 line이 윈도우 max거나 line-only 카테고리/step
   * 축에서도 maxTip 필요). 위치 좌표가 타입별로 다르므로(bar=index, line/scatter=domain)
   * 비교용 value와 위치용 domain을 함께 돌려준다.
   *
   * @param {number} minIndex 윈도우 시작 인덱스
   * @param {number} maxIndex 윈도우 끝 인덱스 (inclusive)
   * @returns {{sId: string, value: number, index: number, domain: number}|null}
   *   value: 값 축 값(vertical=y, horizontal=x), domain: 도메인 축 값(vertical=x, horizontal=y).
   *   null인 경우 두 가지:
   *   (1) minIndex/maxIndex가 비유한이거나 빈 윈도우(maxIndex < minIndex),
   *   (2) 윈도우 안에 유효한(finite) 값이 하나도 없음.
   */
  getVisibleWindowMaxSeries(minIndex, maxIndex) {
    if (!Number.isFinite(minIndex) || !Number.isFinite(maxIndex) || maxIndex < minIndex) {
      return null;
    }

    const isHorizontal = this.options.horizontal;
    let best = null;
    // mixed(#2352)는 data 인덱스가 라벨 칸이 아니므로 전체를 돌며 막대 배치와 같은 x 의 칸(칸 사이 보간
    // 포함)으로 윈도우를 판정한다.
    const mixedLabels = this.isMixedX ? this.mixedLabels : null;

    const sIds = Object.keys(this.seriesList);
    for (let s = 0; s < sIds.length; s += 1) {
      const series = this.seriesList[sIds[s]];
      if (series?.show && series.data?.length) {
        const lo = mixedLabels ? 0 : Math.max(0, minIndex);
        const hi = mixedLabels
          ? series.data.length - 1
          : Math.min(series.data.length - 1, maxIndex);
        for (let i = lo; i <= hi; i += 1) {
          const p = series.data[i];
          const slot = mixedLabels ? Util.getMixedSlotOf(sIds[s], i, p?.x, mixedLabels) : i;
          const inWindow = slot !== null && slot >= minIndex && slot < maxIndex + 1;
          const value = isHorizontal ? p?.x : p?.y;
          const v = inWindow ? value : null;
          // null뿐 아니라 NaN/Infinity도 후보에서 제외한다. 비유한값이 best로 뽑히면
          // calculateTipInfo의 Number.isFinite 가드에서 탈락해 윈도우와 무관한 전역 max로
          // 조용히 폴백하기 때문(maxTip이 엉뚱한 위치에 그려짐).
          if (Number.isFinite(v) && (!best || v > best.value)) {
            best = { sId: series.sId, value: v, index: i, domain: isHorizontal ? p?.y : p?.x };
          }
        }
      }
    }

    return best;
  },

  getSeriesValueOptForHeatMap(series) {
    const { data, colorState, isGradient } = series;
    const colorOpt = this.options.heatMapColor;
    const rangeCount = colorOpt.colorsByRange.length || colorOpt.rangeCount;
    const decimalPoint = colorOpt.decimalPoint;

    let minValue;
    let maxValue = 0;

    let isExistError = false;
    data.forEach(({ o: value }) => {
      if (maxValue < value) {
        maxValue = Math.max(maxValue, value);
      }

      if (value < 0) {
        isExistError = true;
      } else if (minValue === undefined) {
        minValue = value;
      } else {
        minValue = Math.min(minValue, value);
      }
    });

    if (isExistError && !isGradient && colorState.length === rangeCount) {
      colorState.push({
        id: `color#${rangeCount}`,
        color: colorOpt.error,
        state: 'normal',
        label: 'Error',
        show: true,
      });
    }

    let interval = maxValue > minValue ? Math.floor((maxValue - minValue) / rangeCount) : 1;
    if (maxValue - minValue <= rangeCount) {
      if (decimalPoint > 0) {
        interval = +((maxValue - minValue) / rangeCount).toFixed(decimalPoint);
      } else {
        interval = 1;
      }
    }

    return {
      min: minValue,
      max: maxValue,
      interval,
      existError: isExistError,
      decimalPoint,
    };
  },

  /**
   * Get graph items for each series by label index
   * @param {number} labelIndex  label index
   *
   * @returns {object} graph item
   */
  getItemByLabelIndex(labelIndex) {
    if (labelIndex < 0) {
      return false;
    }

    const sIds = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxl = null;
    let maxp = null;
    let maxg = null;
    let maxSID = '';
    let acc = 0;
    let useStack = false;
    let findInfo = false;

    // mixed(#2352)는 라벨 인덱스가 시리즈 data 인덱스가 아니라 labels[labelIndex] 시각과 같은 점을 본다.
    const labelValue = this.data?.labels?.[labelIndex];
    const mixedIndices =
      this.isMixedX && labelValue !== undefined
        ? this.findMixedIndicesAtLabel(labelIndex, sIds)
        : null;

    if (labelIndex > -1) {
      for (let ix = 0; ix < sIds.length; ix++) {
        const sId = sIds[ix];
        const series = this.seriesList[sId];
        const data = series.data[mixedIndices ? mixedIndices.get(sId) : labelIndex];

        if (data && series.show && series.showLegend) {
          const ldata = isHorizontal ? data.y : data.x;
          const lp = isHorizontal ? data.yp : data.xp;

          if (ldata !== null && ldata !== undefined) {
            const g = isHorizontal ? data.o || data.x : data.o || data.y;

            if (series.stackIndex) {
              acc += !isNaN(data.o) ? data.o : 0;
              useStack = true;
            } else {
              acc += data.y;
            }

            if (maxg === null || maxg <= g) {
              maxg = g;
              maxSID = sId;
              maxl = ldata;
              maxp = lp;
            }
          }
        }
      }

      findInfo = {
        label: maxl,
        pos: maxp,
        value: maxg === null ? 0 : maxg,
        sId: maxSID,
        acc,
        useStack,
        maxIndex: labelIndex,
      };
    }

    return findInfo;
  },

  getItem(selectedInfo, useApproximate = false) {
    const { seriesID, dataIndex } = selectedInfo;

    let itemPosition;
    if ('seriesID' in selectedInfo) {
      const dataInfo = this.getDataByValues(seriesID, dataIndex);

      if (!dataInfo || !dataInfo?.xp || !dataInfo?.yp) {
        return null;
      }

      // mixed 차트에서 dataIndex 는 선택 시리즈 배열 기준이다. 나머지는 선택 점과 x 가 같은 점만 본다.
      let indexBySeries = null;
      if (this.isMixedX) {
        indexBySeries = dropUndrawn(
          this.findMixedIndicesAtPoint(
            seriesID,
            dataIndex,
            dataInfo.x,
            Object.keys(this.seriesList),
          ),
          this.seriesList,
        );
        indexBySeries.set(seriesID, dataIndex);
      }

      itemPosition = [
        this.getHitItemByPosition(
          [dataInfo.xp, dataInfo.yp],
          useApproximate,
          dataIndex,
          true,
          false,
          indexBySeries,
        ),
      ];
    } else {
      const seriesList = Object.entries(this.seriesList);
      let firShowSeriesID;

      for (let i = 0; i < seriesList.length; i++) {
        const [id, info] = seriesList[i];

        if (info.show) {
          firShowSeriesID = id;
          break;
        }
      }

      itemPosition = dataIndex?.map((idx) => {
        if (this.isMixedX) {
          return this.getMixedItemAtLabel(idx, useApproximate);
        }

        const dataInfo = this.getDataByValues(firShowSeriesID, idx);

        if (!dataInfo) {
          return null;
        }

        const hitInfo = this.getHitItemByPosition(
          [dataInfo?.xp ?? 0, dataInfo?.yp ?? 0],
          useApproximate,
          idx,
          true,
        );

        // 모두 null 라벨에서 sId='' 반환 → element.tip indicator 그리기 skip 회피.
        if (hitInfo && !hitInfo.sId) {
          hitInfo.sId = firShowSeriesID;
          hitInfo.label = this.data?.labels?.[idx] ?? hitInfo.label;
          hitInfo.dataIndex = idx;
        }

        return hitInfo;
      });
    }

    return itemPosition;
  },

  /**
   *
   * @param seriesID
   * @param dataIndex
   * @returns {*}
   */
  getDataByValues(seriesID, dataIndex) {
    const series = this.seriesList[seriesID];
    if (!series || isNaN(dataIndex) || dataIndex < 0 || series?.data.length <= dataIndex) {
      return false;
    }

    return series.data[dataIndex];
  },

  /**
   * mixed 차트 timeMode bar 의 공통 칸 폭(x 단위) — 보이는 bar 시리즈 간격 중 최솟값(#2352).
   * aligned 이거나 간격을 알 수 없으면 null 이고, 그때는 기존처럼 시리즈 점 개수로 칸을 나눈다.
   * @returns {number|null}
   */
  getMixedBarInterval() {
    if (!this.isMixedX || !this.xIntervalBySeries) {
      return null;
    }

    let min = null;
    this.seriesInfo.charts.bar.forEach((sId) => {
      const interval = this.xIntervalBySeries[sId];
      if (this.seriesList[sId]?.show && interval && (min === null || interval < min)) {
        min = interval;
      }
    });
    return min;
  },

  /**
   * mixed 일반 bar 배치(#2352). 범주형 축(step·time categoryMode)은 labels 칸 맵이고, 그 외 축과 labels 없는
   * categoryMode 는 x 값 위치(`byValue`)다.
   * @returns {object|null} mixed 가 아니면 null
   */
  getMixedXLayout() {
    if (!this.isMixedX) {
      return null;
    }
    const axisX = this.options.axesX?.[0];
    if (axisX?.type === 'step') {
      return this.mixedLabels ?? NO_LABEL_SLOTS;
    }
    const isCategoryTime = axisX?.type === 'time' && !!axisX.categoryMode;
    return isCategoryTime && this.mixedLabels ? this.mixedLabels : MIXED_BY_VALUE;
  },

  /**
   * mixed 차트 hover·클릭에서 시리즈별로 볼 인덱스를 정한다(#2352). 커서에 가장 가까운 유효 점의 x 를
   * 기준 시각으로 삼고, 다른 시리즈는 그 x 와 같은 점만 넣는다(없으면 Map 에 없음).
   * @returns {Map<string, number>|null} sId → findGraphData 인덱스. 스냅 반경 밖이면 null
   */
  resolveMixedHitIndices(offset, seriesIDs) {
    const visibleIDs = seriesIDs.filter((sId) => {
      const series = this.seriesList[sId];
      return series?.show && series.findGraphData;
    });

    let ref = null;
    for (let i = 0; i < visibleIDs.length; i++) {
      const sId = visibleIDs[i];
      const found = findNearestValuedByPos(getHitTestPoints(this.seriesList[sId]), offset[0]);
      if (found && (!ref || found.distance < ref.distance)) {
        ref = { ...found, sId };
      }
    }
    if (!ref) {
      return null;
    }

    // findClosestDataIndex 와 같은 스냅 규칙: 반경은 max(기준 시리즈 평균 점 간격, 6px),
    // 반경 밖이어도 선형 보간 시리즈가 있으면 스냅한다.
    if (ref.distance >= Math.max(ref.spacing, MIN_SNAP_THRESHOLD_PX)) {
      const useLinearInterpolation = visibleIDs.some((sId) => {
        const { interpolation, passingValue, hasPassingValueInData } = this.seriesList[sId];
        return (
          interpolation === 'linear' ||
          (interpolation === 'none' && !!passingValue && hasPassingValueInData)
        );
      });
      if (!useLinearInterpolation) {
        return null;
      }
    }

    const refX = getHitTestPoints(this.seriesList[ref.sId])[ref.index].x;
    const indices = dropUndrawn(
      this.findMixedIndicesAtPoint(ref.sId, ref.index, refX, visibleIDs),
      this.seriesList,
    );
    indices.set(ref.sId, ref.index);
    return indices;
  },

  /**
   * 시리즈별로 x 가 정확히 같은 점의 인덱스를 찾는다(mixed 툴팁 포함 규칙).
   * @returns {Map<string, number>} 같은 x 가 있는 시리즈만 담는다
   */
  findMixedIndicesAtX(x, seriesIDs) {
    const indices = new Map();
    seriesIDs.forEach((sId) => {
      const series = this.seriesList[sId];
      if (!series?.show) {
        return;
      }
      const index = findIndexByX(getHitTestPoints(series), x);
      if (index !== -1) {
        indices.set(sId, index);
      }
    });
    return indices;
  },

  /**
   * mixed 차트 selectLabel 의 라벨 인덱스 목록을 시리즈별 data 인덱스 목록으로 바꾼다(#2352).
   * labels[라벨 인덱스] 시각과 x 가 같은 점만 담는다.
   * @returns {Map<string, number[]>}
   */
  getMixedSelectedIndices(labelIndexList) {
    const sIds = Object.keys(this.seriesList);
    const selected = new Map(sIds.map((sId) => [sId, []]));
    labelIndexList.forEach((labelIndex) => {
      const labelValue = this.data?.labels?.[labelIndex];
      if (labelValue !== undefined) {
        this.findMixedIndicesAtLabel(labelIndex, sIds).forEach((index, sId) => {
          selected.get(sId).push(index);
        });
      }
    });
    return selected;
  },

  /**
   * 기준 점과 같은 칸의 시리즈별 인덱스(#2352). 기준이 원시값 bar 면 다른 원시값 bar 는 같은 data 인덱스이고
   * (labels 순서를 공유 — labels 에 같은 값이 있어도 그 칸), 나머지는 x 가 같은 점이다.
   * @returns {Map<string, number>} 그 칸에 점이 있는 시리즈만 담는다(기준 시리즈는 호출부가 넣는다)
   */
  findMixedIndicesAtPoint(sId, index, x, seriesIDs) {
    const indices = this.findMixedIndicesAtX(x, seriesIDs);
    const rawIds = this.mixedLabels?.rawIds;
    if (rawIds?.has(sId)) {
      pinRawIndices(indices, rawIds, index, this.seriesList);
    }
    return indices;
  },

  /**
   * labels 칸 하나에 놓인 점의 시리즈별 인덱스(#2352). { x, y } 는 그 칸 라벨과 x 가 같은 점이고, 원시값 bar 는
   * 그 칸에 놓인 자기 순서의 점이다(labels 에 같은 값이 있어도 칸마다 다르다).
   * @returns {Map<string, number>} 그 칸에 점이 있는 시리즈만 담는다
   */
  findMixedIndicesAtLabel(labelIndex, seriesIDs) {
    const indices = this.findMixedIndicesAtX(this.data?.labels?.[labelIndex], seriesIDs);
    const rawIds = this.mixedLabels?.rawIds;
    if (rawIds?.size) {
      const rawIndex = this.mixedSourceSlots
        ? this.mixedSourceSlots.indexOf(labelIndex)
        : labelIndex;
      pinRawIndices(indices, rawIds, rawIndex, this.seriesList);
    }
    return indices;
  },

  /**
   * mixed 차트에서 선택 라벨 하나의 tip 위치 정보 — labels[labelIndex] 시각에 점이 있는 시리즈만 본다.
   * @returns {object|null} getHitItemByPosition 결과. 그 시각에 점이 하나도 없으면 null
   */
  getMixedItemAtLabel(labelIndex, useApproximate) {
    const labelValue = this.data?.labels?.[labelIndex];
    if (labelValue === undefined) {
      return null;
    }

    const indexBySeries = this.findMixedIndicesAtLabel(labelIndex, Object.keys(this.seriesList));
    const [refId, refIndex] = indexBySeries.entries().next().value ?? [];
    const refPoint = refId ? getHitTestPoints(this.seriesList[refId])[refIndex] : null;
    if (!refPoint) {
      return null;
    }

    return this.getHitItemByPosition(
      [refPoint.xp ?? 0, refPoint.yp ?? 0],
      useApproximate,
      labelIndex,
      true,
      false,
      indexBySeries,
    );
  },

  /**
   * Find the hit item at the given position (x, y).
   *
   * 선택 우선순위:
   *   1. directHit (bar 박스 내부 클릭) — 가장 가까운 것
   *   2. hit (line 포인트 근접 등) — 가장 가까운 것
   *   3. hit 없으면 클릭 좌표에 가장 가까운 시리즈로 fallback (distance 기반)
   *
   * @param {array}   offset          position x and y
   * @param {boolean} useApproximate  if it's true. it'll look for closed item on mouse position
   * @param {number} dataIndex        selected data index
   * @param {boolean}  useSelectLabelOrItem   used to display select label/item at tooltip location
   * @param {boolean}  disableNullLabelSnap   true 이면 all-null 라벨도 그대로 반환 (click/dblclick 용)
   * @param {Map<string, number>} [indexBySeries]  mixed 차트의 시리즈별 인덱스. 주면 dataIndex 대신 쓴다
   *
   * @returns {object} hit item information
   */
  getHitItemByPosition(
    offset,
    useApproximate = false,
    dataIndex,
    useSelectLabelOrItem = false,
    disableNullLabelSnap = false,
    indexBySeries = null,
  ) {
    const seriesIDs = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    const [cx, cy] = offset;

    // mixed 차트는 시리즈마다 같은 인덱스가 같은 시각이 아니므로 시리즈별 인덱스로 찾는다(#2352).
    let seriesIndices = indexBySeries;
    if (!seriesIndices && this.isMixedX && dataIndex === undefined && !useApproximate) {
      seriesIndices = this.resolveMixedHitIndices(offset, seriesIDs) ?? new Map();
    }

    // dataIndex 미지정 시 클릭 좌표에 가장 가까운 valid 라벨 인덱스 결정.
    // disableNullLabelSnap=true 이면 all-null 라벨도 후보로 인정.
    let resolvedDataIndex = dataIndex;
    if (resolvedDataIndex === undefined && !useApproximate && !seriesIndices) {
      const refSeriesID = seriesIDs.find((sId) => {
        const s = this.seriesList[sId];
        return s?.show && s?.data?.length > 0;
      });
      if (refSeriesID) {
        const refData = this.seriesList[refSeriesID].data;
        const clickPos = isHorizontal ? offset[1] : offset[0];
        let nearestDistance = Infinity;
        let nearestIndex = -1;
        for (let i = 0; i < refData.length; i++) {
          const hasValidData =
            disableNullLabelSnap ||
            seriesIDs.some((sId) => {
              const s = this.seriesList[sId];
              return s?.show && s.data?.[i]?.o !== null && s.data?.[i]?.o !== undefined;
            });

          const p = refData[i];
          if (hasValidData && p) {
            let labelPos;
            if (isHorizontal) {
              labelPos = p.h ? p.yp + p.h / 2 : p.yp;
            } else {
              labelPos = p.w ? p.xp + p.w / 2 : p.xp;
            }
            if (labelPos !== null && labelPos !== undefined) {
              const d = Math.abs(clickPos - labelPos);
              if (d < nearestDistance) {
                nearestDistance = d;
                nearestIndex = i;
              }
            }
          }
        }
        if (nearestIndex !== -1) resolvedDataIndex = nearestIndex;
      }
    }

    // hit 기반 결과 (최우선)
    let hitType = null;
    let hitLabel = null;
    let hitValuePos = null;
    let hitValue = null;
    let hitSeriesID = '';
    let hitDataIndex = null;
    let hitDistance = Infinity;
    let hasDirectHit = false;

    // hit 없을 때 쓸 fallback — 값이 있는 시리즈 중 클릭 좌표에 가장 가까운 것.
    let fallbackType = null;
    let fallbackLabel = null;
    let fallbackValuePos = null;
    let fallbackValue = null;
    let fallbackSeriesID = '';
    let fallbackDataIndex = null;
    let fallbackDistance = Infinity;

    let acc = 0;
    let useStack = false;

    for (let ix = 0; ix < seriesIDs.length; ix++) {
      const seriesID = seriesIDs[ix];
      const series = this.seriesList[seriesID];
      const findFn = useApproximate ? series.findApproximateData : series.findGraphData;

      // bar 는 useSelectLabelOrItem 이 아니면 인덱스 없이 박스 hit 으로 찾는다. 그 외에는 같은 x 가
      // 없는 시리즈를 빼야 findGraphData 가 다른 시각의 점(근접 탐색)을 돌려주지 않는다.
      const seriesDataIndex = seriesIndices ? seriesIndices.get(seriesID) : resolvedDataIndex;
      const usesIndex = series.type !== 'bar' || useSelectLabelOrItem;
      const hasNoSameX = !!seriesIndices && seriesDataIndex === undefined && usesIndex;

      if (findFn && !hasNoSameX) {
        const item = findFn.call(
          series,
          offset,
          isHorizontal,
          seriesDataIndex,
          useSelectLabelOrItem,
        );
        const data = item.data;
        const index = item.index;

        if (data) {
          if (Util.isPieType(item.type)) {
            // pie 차트는 hit detection 체계가 달라 기존 동작 유지 (단일 pie 시리즈가 일반적)
            hitType = item.type;
            hitLabel = seriesID;
            hitSeriesID = seriesID;
            hitValuePos = (data.ea - data.sa) / 2;
            hitValue = data.o;
            hitDataIndex = data.index;
          } else {
            const ldata = isHorizontal ? data.y : data.x;
            const lp = isHorizontal ? data.yp : data.xp;

            if (ldata !== null && ldata !== undefined) {
              const g = isHorizontal ? data.o || data.x : data.o || data.y;

              if (series.stackIndex != null) {
                acc += !isNaN(data.o) ? data.o : 0;
                useStack = true;
              } else {
                acc += data.y;
              }

              // fallback 후보: 값이 있는 시리즈 중 거리가 가장 가까운 쪽.
              // 값이 null 인 시리즈는 제외.
              const hasMeaningfulValue = g !== null && g !== undefined && !Number.isNaN(g);
              const hasCoords =
                data.xp !== null &&
                data.xp !== undefined &&
                data.yp !== null &&
                data.yp !== undefined;
              if (hasMeaningfulValue && hasCoords) {
                const distance = Util.calcBoxDistance(data, cx, cy);
                if (fallbackSeriesID === '' || distance < fallbackDistance) {
                  fallbackDistance = distance;
                  fallbackType = series.type;
                  fallbackLabel = ldata;
                  fallbackValuePos = lp;
                  fallbackValue = g;
                  fallbackSeriesID = seriesID;
                  fallbackDataIndex = index;
                }
              } else if (hasMeaningfulValue && fallbackSeriesID === '') {
                // 좌표 없는 예외 케이스 — 첫 후보로만 등록
                fallbackType = series.type;
                fallbackLabel = ldata;
                fallbackValuePos = lp;
                fallbackValue = g;
                fallbackSeriesID = seriesID;
                fallbackDataIndex = index;
              }

              // hit 기반 선택: item.hit이 true이고 유효한 좌표가 있을 때만 고려
              if (item.hit && data.xp !== undefined && data.yp !== undefined) {
                const distance = (data.xp - offset[0]) ** 2 + (data.yp - offset[1]) ** 2;

                if (item.directHit) {
                  // 직접 박스 히트는 최우선. 여러 개이면 가장 가까운 것.
                  if (!hasDirectHit || distance < hitDistance) {
                    hitDistance = distance;
                    hitType = series.type;
                    hitLabel = ldata;
                    hitValuePos = lp;
                    hitValue = g;
                    hitSeriesID = seriesID;
                    hitDataIndex = index;
                  }
                  hasDirectHit = true;
                } else if (!hasDirectHit) {
                  // directHit가 없을 때만 일반 hit 거리 비교 참여
                  // (라인 근접 히트가 박스 직접 히트를 이기지 못하도록)
                  if (distance < hitDistance) {
                    hitDistance = distance;
                    hitType = series.type;
                    hitLabel = ldata;
                    hitValuePos = lp;
                    hitValue = g;
                    hitSeriesID = seriesID;
                    hitDataIndex = index;
                  }
                }
              }
            }
          }
        }
      }
    }

    // all-null 라벨인 경우 label/dataIndex 만 채워 반환 (sId='', value=0).
    if (
      disableNullLabelSnap &&
      hitSeriesID === '' &&
      fallbackSeriesID === '' &&
      resolvedDataIndex !== undefined &&
      resolvedDataIndex >= 0
    ) {
      const refSeriesID = seriesIDs.find((sId) => {
        const s = this.seriesList[sId];
        return s?.show && s?.data?.length > 0;
      });
      const refPoint = refSeriesID ? this.seriesList[refSeriesID].data?.[resolvedDataIndex] : null;
      if (refPoint) {
        fallbackLabel = isHorizontal ? refPoint.y : refPoint.x;
        fallbackDataIndex = resolvedDataIndex;
      }
    }

    const hasHit = hitSeriesID !== '';

    return {
      type: hasHit ? hitType : fallbackType,
      label: hasHit ? hitLabel : fallbackLabel,
      pos: hasHit ? hitValuePos : fallbackValuePos,
      value: hasHit ? hitValue : fallbackValue,
      sId: hasHit ? hitSeriesID : fallbackSeriesID,
      acc,
      useStack,
      dataIndex: hasHit ? hitDataIndex : fallbackDataIndex,
    };
  },

  /**
   * @typedef {Object} LabelInfoResult
   * @property {number} labelIndex - 선택된 라벨의 인덱스
   * @property {object} hitInfo - 해당 위치에서의 히트 정보 (getHitItemByPosition 반환값)
   */
  /**
   * Find label info by position x and y
   * @param {array}   offset          position x and y
   * @param {string | null}  targetAxis    target Axis Location ('xAxis', 'yAxis' , null)
   *
   * @returns {LabelInfoResult} clicked label information
   */
  getLabelInfoByPosition(offset, targetAxis) {
    const [x, y] = offset;
    const aPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    const seriesList = this.data.series;
    const pointSize =
      Object.values(seriesList).sort((a, b) => b.pointSize ?? 0 - a.pointSize ?? 0)[0]?.pointSize ??
      3; // default pointSize 3
    const { horizontal, selectLabel } = this.options;

    let scale;
    let scrollbarOpt;
    if (targetAxis === 'xAxis') {
      scale = this.axesX[0];
      scrollbarOpt = this.scrollbar.x;
    } else if (targetAxis === 'yAxis') {
      scale = this.axesY[0];
      scrollbarOpt = this.scrollbar.y;
    } else {
      scale = horizontal ? this.axesY[0] : this.axesX[0];
      scrollbarOpt = horizontal ? this.scrollbar.y : this.scrollbar.x;
    }

    const startPoint = aPos[scale.units.rectStart];
    const endPoint = aPos[scale.units.rectEnd];

    let labelIndex;
    let hitInfo;
    if (scrollbarOpt?.use && scale?.labels?.length) {
      const { type, range, interval = 1 } = scrollbarOpt;
      const [min, max] = range ?? [0, scale.labels.length];
      const labelCount = Math.floor((+max - +min) / interval) + 1;
      const labelGap = (endPoint - startPoint) / labelCount;

      const isYAxis = targetAxis === 'yAxis' || horizontal;
      const index = Math.floor(((isYAxis ? y : x) - startPoint) / labelGap);
      if (type === 'step') {
        labelIndex = min + index;
      } else {
        const minIndex = scale?.labels.findIndex((label) => label === +min);
        labelIndex = minIndex + index;
      }
    } else if (scale?.labels?.length) {
      const labelGap = (endPoint - startPoint) / scale.labels.length;
      const isYAxis = targetAxis === 'yAxis';
      const index = Math.floor(((isYAxis ? y : x) - startPoint) / labelGap);
      labelIndex = scale.labels.length > index ? index : -1;
    } else {
      let offsetX;
      let dataIndex;
      if (x < startPoint - pointSize) {
        offsetX = startPoint;
        dataIndex = 0;
      } else if (x > endPoint + pointSize) {
        offsetX = endPoint;
        dataIndex = this.data.labels.length - 1;
      } else {
        offsetX = x;
      }

      hitInfo = this.getHitItemByPosition(
        [offsetX, y],
        selectLabel?.useApproximateValue,
        dataIndex,
        true,
        true,
      );
      // mixed(#2352)의 dataIndex 는 hit 시리즈 data 인덱스라 x 의 labels 칸으로 바꾼다(labels 없으면 선택 불가).
      labelIndex = this.isMixedX
        ? (this.mixedLabels?.indexByX.get(Util.toXKey(hitInfo.label)) ?? -1)
        : (hitInfo.dataIndex ?? -1);
    }

    return {
      labelIndex,
      hitInfo,
    };
  },

  /**
   * Get current mouse target label value in label array or calculated using mouse position
   *
   * @typedef {import('./index').MouseLabelValue} MouseLabelValue
   *
   * @param {string}   targetAxis          target Axis Location ('xAxis', 'yAxis')
   * @param {array}  offset    return value from getMousePosition()
   * @param {number}  labelIndex
   *
   * @returns {MouseLabelValue} current mouse target label value
   */
  getCurMouseLabelVal(targetAxis, offset, labelIndex) {
    const { type: chartType, horizontal } = this.options;
    const isXAxis = targetAxis === 'xAxis';
    const targetAxisDirection = isXAxis ? 'x' : 'y';

    let labelVal = '';
    let labelIdx = -1;

    const findLabelValInLabelArr = () => {
      let result = '';
      switch (chartType) {
        case 'bar':
        case 'line': {
          result =
            (horizontal && !isXAxis) || (!horizontal && isXAxis)
              ? this.data.labels[labelIndex]
              : '';
          break;
        }
        case 'heatMap': {
          result = this.data.labels[targetAxisDirection][labelIndex];
          break;
        }
        default:
          break;
      }

      return result;
    };

    const calLabelValUseMousePos = () => {
      let result = '';
      const aPos = {
        x1: this.chartRect.x1 + this.labelOffset.left,
        x2: this.chartRect.x2 - this.labelOffset.right,
        y1: this.chartRect.y1 + this.labelOffset.top,
        y2: this.chartRect.y2 - this.labelOffset.bottom,
      };
      const {
        steps,
        interval: labelValInterval,
        graphMin,
      } = this.axesSteps[targetAxisDirection][0];
      const { width: labelWidth, height: labelHeight } =
        this.axesRange[targetAxisDirection][0].size;
      const axes = isXAxis ? this.axesX : this.axesY;
      const axisStartPoint = aPos[axes[0].units.rectStart];
      const axisEndPoint = aPos[axes[0].units.rectEnd];
      const curMousePosInAxis = Math.abs(offset[isXAxis ? 0 : 1] - axisStartPoint);
      const labelMidLength = (isXAxis ? labelWidth : labelHeight) / 2;
      const labelPosInterval = Math.abs(axisStartPoint - axisEndPoint) / steps;
      const labelStep = Math.floor((curMousePosInAxis + labelMidLength) / labelPosInterval);

      if (
        labelPosInterval * labelStep + labelMidLength > curMousePosInAxis &&
        labelPosInterval * labelStep - labelMidLength < curMousePosInAxis
      ) {
        result = labelStep * labelValInterval + graphMin;
      }

      return result;
    };

    if (typeof labelIndex === 'number') {
      labelVal = findLabelValInLabelArr();
      labelIdx = labelIndex;
    }

    if (!labelVal) {
      labelVal = calLabelValUseMousePos();
      labelIdx = -1;
    }

    return { labelVal, labelIdx };
  },

  /**
   * Create min/max information for all of data
   * @property seriesList
   *
   * @returns {object} min/max info for all of data
   */
  getStoreMinMax() {
    const keys = Object.keys(this.seriesList);
    const isHorizontal = this.options.horizontal;
    const def = {
      x: [{ min: null, max: null }],
      y: [{ min: null, max: null }],
    };

    if (keys.length) {
      return keys.reduce(
        (acc, key) => {
          const minmax = acc;
          const series = this.seriesList[key];
          const smm = series.minMax;
          const axisX = series.xAxisIndex;
          const axisY = series.yAxisIndex;

          if (!minmax.x[axisX]) {
            minmax.x[axisX] = { min: null, max: null, maxSID: null };
          }
          if (!minmax.y[axisY]) {
            minmax.y[axisY] = { min: null, max: null, maxSID: null };
          }

          if (smm && series.show) {
            if (!isHorizontal) {
              if (
                smm.minX !== null &&
                (minmax.x[axisX].min === null ||
                  (smm.minX !== null && smm.minX < minmax.x[axisX].min))
              ) {
                minmax.x[axisX].min = smm.minX;
              }
              if (
                minmax.y[axisY].min === null ||
                (smm.minY !== null && smm.minY < minmax.y[axisY].min)
              ) {
                minmax.y[axisY].min = smm.minY;
              }
            } else {
              if (
                minmax.x[axisX].min === null ||
                (smm.minX !== null && smm.minX < minmax.x[axisX].min)
              ) {
                minmax.x[axisX].min = smm.minX;
              }
              if (
                smm.minY !== null &&
                (minmax.y[axisY].min === null ||
                  (smm.minY !== null && smm.minY < minmax.y[axisY].min))
              ) {
                minmax.y[axisY].min = smm.minY;
              }
            }

            const isExistGrp = this.seriesList[key].isExistGrp;
            const maxXisNegative = minmax.x[axisX].max < 0;

            if (isExistGrp && maxXisNegative) {
              minmax.x[axisX].max = smm.maxX;
              minmax.x[axisX].maxSID = key;
            } else if (!minmax.x[axisX].max || smm.maxX >= minmax.x[axisX].max) {
              minmax.x[axisX].max = smm.maxX;
              minmax.x[axisX].maxSID = key;
            }

            const maxYisNegative = minmax.y[axisY].max < 0;
            if (isExistGrp && maxYisNegative) {
              minmax.y[axisY].max = smm.maxY;
              minmax.y[axisY].maxSID = key;
            } else if (!minmax.y[axisY].max || smm.maxY >= minmax.y[axisY].max) {
              minmax.y[axisY].max = smm.maxY;
              minmax.y[axisY].maxSID = key;
            }
          }

          return minmax;
        },
        {
          x: [{ min: null, max: null, maxSID: null }],
          y: [{ min: null, max: null, maxSID: null }],
        },
      );
    }

    return def;
  },

  calculateAngle() {
    const pieDataSet = this.pieDataSet;

    let slice;
    let value;
    let parent;
    let totalValue;

    let sliceAngle;
    let startAngle;
    let endAngle;
    let totalAngle;
    let isDummy;

    const dummyIndex = [];
    const saStore = {
      '$ev-root': 1.5 * Math.PI,
    };

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      isDummy = true;

      for (let jx = 0; jx < pie.data.length; jx++) {
        slice = pie.data[jx];
        value = slice.value;

        if (isDummy) {
          isDummy = slice.id === 'dummy';
        }

        if (!ix) {
          startAngle = saStore['$ev-root'];
          sliceAngle = 2 * Math.PI * (value / pie.total);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;
          saStore['$ev-root'] += sliceAngle;
        } else {
          parent = this.getParentInfo(ix - 1, slice.parent);
          if (!parent) {
            break;
          }

          if (!saStore[slice.parent]) {
            saStore[slice.parent] = parent.sa;
          }

          startAngle = saStore[slice.parent];
          totalAngle = parent.ea - parent.sa;
          totalValue = pie.total[slice.parent] || 0;
          sliceAngle = totalAngle * (value / totalValue);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;

          saStore[slice.parent] += sliceAngle;
        }
      }

      if (isDummy) {
        dummyIndex.push(ix);
      }
    }

    for (let ix = 0; ix < dummyIndex.length; ix++) {
      this.pieDataSet.splice(dummyIndex, 1);
    }

    if (this.options.reverse) {
      this.pieDataSet = reverse(this.pieDataSet);
    }
  },

  getParentInfo(depth, parentId) {
    for (let ix = depth; ix >= 0; ix--) {
      const pie = this.pieDataSet[ix];
      for (let jx = 0; jx < pie.data.length; jx++) {
        if (pie.data[jx].id === parentId) {
          return pie.data[jx];
        }
      }
    }

    return null;
  },

  /**
   * Get Aggregations (
   * @returns {{}}
   */
  getAggregations() {
    const allData = this.data.data;
    const series = this.data.series;
    const aggregationDataSet = {};
    const seriesIds = Object.keys(series);

    seriesIds?.forEach((sId) => {
      const dataList = allData[sId].map((data) => (data?.value ? data.value : data));
      const last = dataList[dataList.length - 1];

      const dataListExcludedNull = dataList.filter(
        (value) => value !== undefined && value !== null,
      );
      const min = Math.min(...dataListExcludedNull);
      const max = Math.max(...dataListExcludedNull);
      const total = dataListExcludedNull.reduce((a, b) => a + b, 0);
      const avg = total / dataListExcludedNull.length || 0;

      if (
        !Util.checkSafeInteger(min) ||
        !Util.checkSafeInteger(max) ||
        !Util.checkSafeInteger(avg) ||
        !Util.checkSafeInteger(total) ||
        !Util.checkSafeInteger(last)
      ) {
        console.warn(
          '[EVUI][Chart] The aggregated value exceeds 9007199254740991 or less than -9007199254740991.',
        );
      }

      aggregationDataSet[sId] = { min, max, avg, total, last };
    });

    return aggregationDataSet;
  },
};

export default modules;
