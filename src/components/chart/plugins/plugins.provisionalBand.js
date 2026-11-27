import dayjs from 'dayjs';
import { truthyNumber } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';
import { normalizeAxisValue } from '../annotation/annotation.axis';
import { getTimeBarOffset } from '../element/element.bar.time';

const SUPPORTED_CHART_TYPES = ['line', 'bar'];
const TIME_AXIS = { type: 'time' };
const DEFAULT_COLOR = 'rgba(128, 128, 128, 0.12)';
const DEFAULT_BORDER_SEGMENTS = [4, 4];
const zoomNeighbors = new WeakMap();

/**
 * 양쪽 경계선을 따로 알아볼 수 있는 최소 영역 폭(px). 이보다 좁으면 두 선이 붙어 굵은 이중선처럼 보인다.
 * 두 선 굵기에 그 사이로 점선 간격만큼의 배경이 보여야 띠로 읽히므로 선 굵기·점선 모양에 비례한다
 * (1px·[4, 4] 이면 6px). Canvas 는 홀수 길이 패턴을 두 번 이어 쓰므로([2] → [2, 2]) 간격이 없으면 첫 값이
 * 간격이 된다. 빈 배열(실선)이면 기본 점선 간격을 쓴다.
 * @param {{ width: number, segments?: number[]|null }} border
 * @returns {number}
 */
export const getMinDoubleBorderWidth = (border) => {
  const segments = border.segments ?? DEFAULT_BORDER_SEGMENTS;
  const gap = segments[1] ?? segments[0] ?? DEFAULT_BORDER_SEGMENTS[1];
  return border.width * 2 + gap;
};

/**
 * provisionalBand 를 그릴 수 있는 차트인지 판정한다. 시간 흐름에 따라 마지막 구간이 갱신되는 것은
 * time x축 시계열뿐이라 그 외 축·방향에서는 옵션을 켜도 무시한다. 시리즈가 연결된 축이 time 인지는
 * 그릴 때 시리즈 단위로 다시 확인한다.
 * @param {object} options  정규화된 차트 옵션
 * @returns {boolean}
 */
export const isProvisionalBandTarget = (options) =>
  !!options?.provisionalBand?.use &&
  SUPPORTED_CHART_TYPES.includes(options.type) &&
  !options.horizontal &&
  !!options.axesX?.some((axis) => axis?.type === 'time');

const toTime = (value) => {
  const isDate = typeof value === 'object' && (value instanceof Date || dayjs.isDayjs(value));
  const time = isDate ? value.valueOf() : value;
  return normalizeAxisValue(time, TIME_AXIS);
};

/**
 * 시각 오름차순 데이터에서 target 시각의 인덱스를 이진 탐색한다. drawChart 는 범례 호버·스크롤에도
 * 불리므로 시리즈 길이에 비례해 훑지 않는다. x 를 해석할 수 없는 점을 만나면 정렬을 믿을 수 없어 -1 이다.
 * @param {object[]} data
 * @param {number} target
 * @returns {number}
 */
const findIndexByTime = (data, target) => {
  let lo = 0;
  let hi = data.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const x = toTime(data[mid]?.x);
    if (x === null) {
      return -1;
    }
    if (x === target) {
      return mid;
    }
    if (x < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
};

const toPoint = (series, index, curX) => {
  const len = series.data.length;
  return {
    series,
    index,
    curX,
    prevX: index > 0 ? toTime(series.data[index - 1]?.x) : null,
    nextX: index < len - 1 ? toTime(series.data[index + 1]?.x) : null,
  };
};

/**
 * 영역을 칠할 수 있는 데이터 지점 후보를 우선순위대로 고른다. 숨긴 시리즈·accept 를 통과하지 못한 시리즈
 * (time 축이 아닌 시리즈 등)는 화면 기준이 될 수 없으므로 뺀다. 앞 후보의 영역을 그릴 수 없으면
 * 같은 시각의 다음 후보를 검사한다.
 * - targetX 가 있으면: 그 시각의 점을 가진 시리즈들, 시리즈 순서대로 (집계 중 버킷이 중간에 있을 때)
 * - 없으면: 표시 중인 시리즈의 마지막 점 중 가장 늦은 시각과 일치하는 점
 * @param {object[]} seriesList  element 인스턴스 목록
 * @param {*} [targetX]  집계 중 버킷의 x 값(time 축 값)
 * @param {(series: object) => boolean} [accept]
 * @yields {{ series: object, index: number, curX: number, prevX: number|null, nextX: number|null }}
 */
function* findTargetPoints(seriesList, targetX, accept = () => true) {
  const target = toTime(targetX);
  if (targetX != null && target === null) {
    return;
  }

  const latestSeries = [];
  let latestTime = -Infinity;
  for (const series of seriesList) {
    const length = series?.data?.length;
    if (length && series.show !== false && accept(series)) {
      if (target !== null) {
        const index = findIndexByTime(series.data, target);
        if (index >= 0) {
          yield toPoint(series, index, target);
        }
      } else {
        const time = toTime(series.data[length - 1]?.x);
        if (time !== null && time >= latestTime) {
          if (time > latestTime) {
            latestTime = time;
            latestSeries.length = 0;
          }
          latestSeries.push(series);
        }
      }
    }
  }

  for (const series of latestSeries) {
    yield toPoint(series, series.data.length - 1, latestTime);
  }
}

/**
 * findTargetPoints 의 첫 후보.
 * @returns {{ series: object, index: number, curX: number, prevX: number|null, nextX: number|null }|null}
 */
export const findTargetPoint = (seriesList, targetX, accept) =>
  findTargetPoints(seriesList, targetX, accept).next().value ?? null;

const findZoomNeighbor = ({ data, labels }, index, step, isStacked) => {
  for (let i = index; i >= 0 && i < data.length; i += step) {
    const label = labels?.[i];
    if (!isStacked || label != null) {
      // model.store 의 addSeriesDS/addSeriesStackDS 와 같은 X 값을 읽는다.
      const item = data[i];
      const isXY =
        item && typeof item === 'object' &&
        (isStacked ? 'x' in item || 'y' in item : item.x || item.y);
      const x = toTime(isXY ? item.x : label);
      if (x !== null) {
        return x;
      }
    }
  }
  return null;
};

const getZoomSeriesCache = (series, source) => {
  const { data, labels, range } = source;
  const isStacked = !!(series.isExistGrp && !series.isOverlapping && series.stackIndex);
  let bySeries = zoomNeighbors.get(range);
  if (!bySeries) {
    bySeries = new WeakMap();
    zoomNeighbors.set(range, bySeries);
  }
  let cached = bySeries.get(series);
  if (
    !cached ||
    cached.data !== data ||
    cached.labels !== labels ||
    cached.isStacked !== isStacked
  ) {
    cached = { data, labels, isStacked };
    bySeries.set(series, cached);
  }
  return cached;
};

const getZoomNeighbors = ({ series, prevX, nextX }, source) => {
  const cached = getZoomSeriesCache(series, source);
  // null 도 조회 결과로 기억한다. 같은 줌 구간에서 비어 있는 라벨을 반복해서 훑지 않는다.
  const [start, end] = source.range;
  if (prevX === null && cached.prevX === undefined) {
    cached.prevX = findZoomNeighbor(source, start - 1, -1, cached.isStacked);
  }
  if (nextX === null && cached.nextX === undefined) {
    cached.nextX = findZoomNeighbor(source, end + 1, 1, cached.isStacked);
  }
  return { prevX: prevX ?? cached.prevX, nextX: nextX ?? cached.nextX };
};

const getLatestOriginalX = (seriesList, accept, getSource) => {
  let latest = null;
  for (const series of seriesList) {
    if (series && series.show !== false && accept(series)) {
      const source = getSource?.(series.sId);
      if (source) {
        const cached = getZoomSeriesCache(series, source);
        if (cached.lastX === undefined) {
          cached.lastX = findZoomNeighbor(source, source.data.length - 1, -1, cached.isStacked);
        }
        if (cached.lastX !== null && (latest === null || cached.lastX > latest)) {
          latest = cached.lastX;
        }
      }
    }
  }
  return latest;
};

/**
 * 시각으로 배치되는 line 에서 영역의 가로 범위를 구한다.
 * 집계 중인 점이 축 범위(스크롤·줌·사용자 range) 밖이면 화면에 없으므로 null 이다.
 * 점은 구간 시작 시각에 찍혀 그 시각부터 칠하면 점이 경계선에 걸치므로 앞뒤 점과의 중간을 경계로 삼는다.
 * 다음 점이 없으면 마지막 버킷이라 플롯 오른쪽 끝까지 칠한다. 줌으로 잘린 이웃은 원본 시각을 받는다.
 * @param {object} param
 * @param {number} param.curX  집계 중인 점의 시각
 * @param {number|null} param.prevX  직전 점 시각
 * @param {number|null} param.nextX  다음 점 시각
 * @param {{ graphMin: number, graphMax: number }} param.axis  시리즈가 연결된 x축
 * @param {number} param.xArea  시리즈가 쓰는 가로 폭(px)
 * @param {number} param.xsp  시리즈의 x 시작 픽셀
 * @param {number} param.minX  플롯 왼쪽 끝 픽셀
 * @param {number} param.maxX  플롯 오른쪽 끝 픽셀
 * @returns {{ startX: number, endX: number, isClipped: boolean }|null}
 */
export const getTimeRegion = ({ curX, prevX, nextX, axis, xArea, xsp, minX, maxX }) => {
  const { graphMin, graphMax } = axis;
  if (curX > graphMax || curX < graphMin) {
    return null;
  }

  const from = prevX === null ? curX : (prevX + curX) / 2;
  const to = nextX === null ? null : (curX + nextX) / 2;
  const isClipped = from <= graphMin;
  const startX = isClipped ? minX : Canvas.calculateX(from, graphMin, graphMax, xArea, xsp);
  const endX =
    to === null || to >= graphMax ? maxX : Canvas.calculateX(to, graphMin, graphMax, xArea, xsp);
  return { startX, endX, isClipped };
};

/**
 * timeMode 막대의 실제 너비로 가시성을 판정하고 해당 슬롯을 칠한다.
 * @param {object} param
 * @param {number} param.curX  집계 중인 막대의 시각
 * @param {number} param.slotWidth  막대 슬롯 폭(px)
 * @param {number} param.barWidth  패딩, 두께, 그룹 배치를 반영한 막대 폭(px)
 * @param {number} [param.barOffset]  슬롯 안에서 시리즈가 실제로 시작하는 위치(px)
 * @param {{ graphMin: number, graphMax: number }} param.axis
 * @param {number} param.xArea  플롯 가로 폭(px)
 * @param {number} param.minX  플롯 왼쪽 끝 픽셀
 * @param {number} param.maxX  플롯 오른쪽 끝 픽셀
 * @returns {{ startX: number, endX: number, isClipped: boolean }|null}
 */
export const getTimeBarRange = ({
  curX, slotWidth, barWidth, barOffset = 0, axis, xArea, minX, maxX,
}) => {
  const x = Canvas.calculateSubX(curX, axis.graphMin, axis.graphMax, xArea, minX);
  if (!Number.isFinite(x) || barWidth <= 0 || x >= maxX || x + barWidth < minX) {
    return null;
  }
  const barX = Math.max(x, minX) + barOffset;
  if (barX >= maxX || barX + barWidth <= minX) {
    return null;
  }
  const isClipped = x <= minX;
  const endX = Math.min(Math.ceil(x + slotWidth), maxX);
  return { startX: isClipped ? minX : x, endX, isClipped };
};

/**
 * 슬롯으로 배치되는 bar(timeMode 아님)에서 index 번째 막대 슬롯의 가로 범위를 구한다.
 * 일반 bar 는 x 값이 아니라 가시 구간을 개수로 나눈 슬롯 순서로 그리므로(element.bar) 같은 규칙을 따른다.
 * @param {object} param
 * @param {number} param.index  막대 인덱스
 * @param {number} param.count  데이터 개수
 * @param {number} [param.minIndex]  가시 구간 시작 인덱스(스크롤·줌)
 * @param {number} [param.maxIndex]  가시 구간 끝 인덱스
 * @param {number} param.xArea  플롯 가로 폭(px)
 * @param {number} param.minX  플롯 왼쪽 끝 픽셀
 * @returns {{ startX: number, endX: number }|null} 슬롯이 가시 구간 밖이면 null
 */
export const getSlotRange = ({ index, count, minIndex, maxIndex, xArea, minX }) => {
  if (!count) {
    return null;
  }

  const hasWindow = truthyNumber(minIndex) && truthyNumber(maxIndex);
  const startIndex = hasWindow ? minIndex : 0;
  const endIndex = hasWindow ? maxIndex : count - 1;
  if (endIndex < startIndex || index < startIndex || index > endIndex) {
    return null;
  }

  const slotWidth = xArea / (endIndex - startIndex + 1);
  // calculateX 와 같이 올림해 소수 좌표로 영역 가장자리가 흐려지지 않게 한다.
  const slotX = (offset) => Math.min(Math.ceil(minX + slotWidth * offset), minX + xArea);
  return { startX: slotX(index - startIndex), endX: slotX(index - startIndex + 1) };
};

const modules = {
  /**
   * 호출자가 지정한 데이터 구간에 배경과 경계선을 표시한다.
   * @param {CanvasRenderingContext2D} ctx
   *
   * @returns {undefined}
   */
  /**
   * x 가 직전 렌더에서 provisionalBand 를 실제로 칠한 점인지. 툴팁 formatter(html·title)·click·
   * dbl-click·mouse-move 인자의 provisional 필드가 이 판정을 쓴다. 지정한 x 를 찾지 못했거나 경계가
   * 뒤집혀(DST 종료 등) 칠하지 못한 프레임에는 어떤 점도 해당하지 않는다.
   * @param {*} x 점의 x 값(number·string·Date·dayjs)
   * @returns {boolean}
   */
  isProvisionalBandX(x) {
    const drawnX = this.provisionalBandDrawnX ?? null;
    return drawnX !== null && x != null && toTime(x) === drawnX;
  },

  drawProvisionalBand(ctx) {
    // 실제로 칠한 점의 x 를 남긴다 — 못 칠한 프레임은 null. 툴팁·클릭 인자의 provisional 판정
    // (isProvisionalBandX)이 이 값을 읽어, 음영이 없는 점에 표시가 붙지 않게 한다.
    this.provisionalBandDrawnX = null;
    if (!isProvisionalBandTarget(this.options)) {
      return;
    }

    const { x: targetX = null, color, border } = this.options.provisionalBand;
    const isBar = this.options.type === 'bar';
    const chartType = isBar ? 'bar' : 'line';
    const seriesList = (this.seriesInfo?.charts?.[chartType] ?? []).map(
      (id) => this.seriesList?.[id],
    );
    const isOnTimeAxis = (series) => {
      const axisIndex = series.xAxisIndex ?? 0;
      return !!this.axesSteps?.x?.[axisIndex] && this.options.axesX?.[axisIndex]?.type === 'time';
    };
    // 줌이 데이터 끝을 잘랐을 때는 표시 대상인 시리즈에서 원본 최신 시각을 확인한다.
    const hasClippedTail = targetX === null && this.isLatestDataInView?.() === false;
    const originalX = hasClippedTail
      ? getLatestOriginalX(seriesList, isOnTimeAxis, this.getZoomSeriesSource)
      : null;
    if (hasClippedTail && originalX === null) {
      return;
    }

    const { chartRect, labelOffset } = this;
    const minX = chartRect.x1 + labelOffset.left;
    const maxX = chartRect.x2 - labelOffset.right;
    const minY = chartRect.y1 + labelOffset.top;
    const maxY = chartRect.y2 - labelOffset.bottom;
    const plotWidth = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    let visibleBarIndices;

    const getRegion = (point) => {
      const { series } = point;
      const axis = this.axesSteps.x[series.xAxisIndex ?? 0];
      if (isBar && !series.timeMode) {
        const slot = getSlotRange({
          index: point.index,
          count: series.data.length,
          minIndex: axis.minIndex,
          maxIndex: axis.maxIndex,
          xArea: plotWidth,
          minX,
        });
        return slot && { ...slot, isClipped: false };
      }
      if (isBar) {
        if (!visibleBarIndices) {
          visibleBarIndices = new Map();
          seriesList.forEach((item) => {
            if (item?.show) {
              visibleBarIndices.set(item, visibleBarIndices.size);
            }
          });
        }
        const { cArea, size, bArea, bPad, barSeriesX } = series.getTimeBarLayout(
          plotWidth,
          this.options.thickness,
          visibleBarIndices.size,
          visibleBarIndices.get(series),
        );
        return getTimeBarRange({
          curX: point.curX,
          slotWidth: cArea,
          barWidth: size,
          barOffset: getTimeBarOffset(bArea, barSeriesX, size, bPad),
          axis,
          xArea: plotWidth,
          minX,
          maxX,
        });
      }
      let { prevX, nextX } = point;
      if (targetX !== null && (prevX === null || nextX === null)) {
        const source = this.getZoomSeriesSource?.(series.sId);
        if (source) {
          ({ prevX, nextX } = getZoomNeighbors(point, source));
        }
      }
      // combo line 은 막대 슬롯 중앙에 점을 찍도록 폭을 한 슬롯 줄이고 반 슬롯 오른쪽에서 시작한다(element.line).
      const comboSlot = series.combo ? plotWidth / (series.data.length || 1) : 0;
      return getTimeRegion({
        curX: point.curX,
        prevX,
        nextX,
        axis,
        xArea: plotWidth - comboSlot,
        xsp: minX + comboSlot / 2,
        minX,
        maxX,
      });
    };

    let region = null;
    for (const point of findTargetPoints(seriesList, targetX, isOnTimeAxis)) {
      if (hasClippedTail && point.curX !== originalX) {
        break;
      }
      const candidate = getRegion(point);
      if (Number.isFinite(candidate?.startX) && Number.isFinite(candidate?.endX)) {
        const { startX, isClipped } = candidate;
        const endX = isBar && targetX === null ? maxX : Math.min(candidate.endX, maxX);
        // 반올림으로 폭이 0이면 그릴 수 있는 경계선이 있어야 이 후보를 선택한다.
        const hasVisibleBoundary = startX === endX && !isClipped && border?.width > 0;
        if (startX < maxX && (startX < endX || hasVisibleBoundary)) {
          region = { startX, endX, isClipped, x: point.curX };
          break;
        }
      }
    }
    if (!region) {
      return;
    }
    const { startX, endX, isClipped } = region;
    this.provisionalBandDrawnX = region.x;

    ctx.save();
    // defaultsDeep 은 null 을 채우지 않아, null 이면 fillStyle 이 무시돼 검정으로 칠해진다.
    ctx.fillStyle = color || DEFAULT_COLOR;
    // 1분 버킷을 하루 범위에 그리면 두 경계가 같은 픽셀로 반올림된다 — 배경은 없어도 위치는 점선 한 줄로 남긴다.
    if (endX > startX) {
      ctx.fillRect(startX, minY, endX - startX, maxY - minY);
    }

    // 왼쪽 경계는 축 범위 밖으로 잘렸으면 실제 시작점이 아니므로 긋지 않는다.
    // 오른쪽 경계는 중간 버킷처럼 플롯 끝 전에 끝날 때만 긋는다 — 끝까지 칠하면 플롯 경계가 곧 끝이다.
    // 좁은 영역은 한 줄만 긋는다 — 마지막 버킷과 같은 모양이 되도록 왼쪽(잘렸으면 오른쪽)을 남긴다.
    const edges = [];
    if (!isClipped) {
      edges.push(startX);
    }
    const isNarrow = border?.width > 0 && endX - startX < getMinDoubleBorderWidth(border);
    if (endX < maxX && !(edges.length && isNarrow)) {
      edges.push(endX);
    }
    if (edges.length && border?.width > 0) {
      const alias = Util.aliasPixel(border.width);
      ctx.beginPath();
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.width;
      ctx.setLineDash(border.segments ?? DEFAULT_BORDER_SEGMENTS);
      edges.forEach((edgeX) => {
        ctx.moveTo(edgeX + alias, minY);
        ctx.lineTo(edgeX + alias, maxY);
      });
      ctx.stroke();
    }
    ctx.restore();
  },
};

export default modules;
