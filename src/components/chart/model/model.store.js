import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import Util from '../helpers/helpers.util';

const modules = {
  /**
   * Take chart data and labels to create normalized data and min/max info
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   *
   * @returns {undefined}
   */
  createDataSet(data, label) {
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

            if (series && sData) {
              const inStackGroup = series.isExistGrp && !series.isOverlapping;
              let tops = null;
              if (inStackGroup) {
                tops = stackTops.get(series.groupIndex);
                if (!tops) {
                  tops = { pos: [], neg: [] };
                  stackTops.set(series.groupIndex, tops);
                }
              }

              if (inStackGroup && series.stackIndex) {
                series.data = this.addSeriesStackDS(sData, label, series.stackIndex, tops);
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
    });
  },

  /**
   * Take chart data and create a two-dimensional array, specify max/min and delete/add over time.
   * @param {object}  datas    chart series info
   *
   * @returns {undefined}
   */
  createRealTimeScatterDataSet(datas) {
    const keys = Object.keys(datas);

    const minMaxValues = {
      // 음수 전용 데이터에서 maxY 가 0 으로 clamp 되지 않도록 -Infinity 에서 시작한다.
      // 유효 데이터가 하나도 없으면 아래 fallback(isFinite(minY) 검사)에서 0/0 으로 되돌린다.
      maxY: -Infinity,
      minY: Infinity,
      fromTime: 0,
      toTime: 0,
    };

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

      // 5) nextToTime 결정: 새 데이터가 있으면 lastTime, 없으면 이전 유지
      const nextToTime = lastTime || prevToTime;

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

      // (원래 코드에 있던 early return 유지)
      if (lastTime && (dataset.toTime - lastTime) / 1000 > length && key === '') {
        return;
      }

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
      minMaxValues.fromTime = dataset.fromTime;
      minMaxValues.toTime = dataset.toTime;
    }

    if (!Number.isFinite(minMaxValues.minY)) {
      minMaxValues.minY = 0;
      minMaxValues.maxY = 0;
    }

    this.seriesInfo.charts.scatter.forEach((seriesID) => {
      const series = this.seriesList[seriesID];
      series.data = this.dataSet;
      series.minMax = {
        minX: dayjs(minMaxValues.fromTime),
        minY: minMaxValues.minY,
        maxX: dayjs(minMaxValues.toTime),
        maxY: minMaxValues.maxY,
      };
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
   *
   * @typedef {import('./index').ChartSeriesDataPoint} ChartSeriesDataPoint
   *
   * @returns {ChartSeriesDataPoint[]} data for each series
   */
  addSeriesStackDS(data, label, sIdx = 0, tops = null) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];
    const posTop = tops?.pos;
    const negTop = tops?.neg;

    data.forEach((curr, index) => {
      // base(아래 스택) 위치: 부호별 누적 top 에서 O(1) 조회.
      // 기존 bsIds 역방향 탐색과 동치 — 가장 최근에 갱신된 "보이는 동일부호 유효 base"가 곧 누적 top.
      let bdata = (curr >= 0 ? posTop?.[index] : negTop?.[index]) ?? 0; // base(previous) series data
      let odata = curr; // current series original data
      let ldata = label[index]; // label data
      let gdata = curr; // current series data which added previous series's value

      if (bdata != null && ldata != null) {
        if (gdata && typeof gdata === 'object' && ('x' in gdata || 'y' in gdata)) {
          odata = isHorizontal ? curr.x : curr.y;
          ldata = isHorizontal ? curr.y : curr.x;
        }

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

        sdata.push(this.addData(gdata, ldata, odata, bdata));
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

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const position = isHorizontal ? p.x : p.y;
      const baseValue = p.o;
      const isPassingValue = usePassingValue && baseValue === passingValue;

      if (position != null && !isPassingValue) {
        if (baseValue >= 0) {
          pos[i] = position;
        } else {
          neg[i] = position;
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
            sdata.push(isHorizontal
              ? { x: v, y: ldata, o, b: null, xp: null, yp: null,
                  w: null, h: null, dataColor: null, dataTextColor: null }
              : { x: ldata, y: v, o, b: null, xp: null, yp: null,
                  w: null, h: null, dataColor: null, dataTextColor: null },
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
  addData(gdata, ldata, odata = null, bdata = null) {
    let data;
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

    if (this.options.horizontal) {
      data = { x: gdataValue, y: ldata, o: odataValue, b: bdata };
    } else {
      data = { x: ldata, y: gdataValue, o: odataValue, b: bdata };
    }

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
    if (
      !Number.isFinite(minIndex)
      || !Number.isFinite(maxIndex)
      || maxIndex < minIndex
    ) {
      return null;
    }

    const isHorizontal = this.options.horizontal;
    let best = null;

    const sIds = Object.keys(this.seriesList);
    for (let s = 0; s < sIds.length; s += 1) {
      const series = this.seriesList[sIds[s]];
      if (series?.show && series.data?.length) {
        const lo = Math.max(0, minIndex);
        const hi = Math.min(series.data.length - 1, maxIndex);
        for (let i = lo; i <= hi; i += 1) {
          const p = series.data[i];
          const v = isHorizontal ? p?.x : p?.y;
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

    if (labelIndex > -1) {
      for (let ix = 0; ix < sIds.length; ix++) {
        const sId = sIds[ix];
        const series = this.seriesList[sId];
        const data = series.data[labelIndex];

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

      itemPosition = [
        this.getHitItemByPosition([dataInfo.xp, dataInfo.yp], useApproximate, dataIndex, true),
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
   *
   * @returns {object} hit item information
   */
  getHitItemByPosition(
    offset,
    useApproximate = false,
    dataIndex,
    useSelectLabelOrItem = false,
    disableNullLabelSnap = false,
  ) {
    const seriesIDs = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    const [cx, cy] = offset;

    // dataIndex 미지정 시 클릭 좌표에 가장 가까운 valid 라벨 인덱스 결정.
    // disableNullLabelSnap=true 이면 all-null 라벨도 후보로 인정.
    let resolvedDataIndex = dataIndex;
    if (resolvedDataIndex === undefined && !useApproximate) {
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

      if (findFn) {
        const item = findFn.call(
          series,
          offset,
          isHorizontal,
          resolvedDataIndex,
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
      labelIndex = hitInfo.dataIndex ?? -1;
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
