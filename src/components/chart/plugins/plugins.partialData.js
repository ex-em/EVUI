import { truthyNumber } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';
import { normalizeAxisValue } from '../annotation/annotation.axis';

const SUPPORTED_CHART_TYPES = ['line', 'bar'];
const TIME_AXIS = { type: 'time' };
const DEFAULT_COLOR = 'rgba(214, 170, 98, 0.16)';
const DEFAULT_BORDER_SEGMENTS = [4, 4];

/**
 * partialData 를 그릴 수 있는 차트인지 판정한다. 시간 흐름에 따라 마지막 구간이 갱신되는 것은
 * time x축 시계열뿐이라 그 외 축·방향에서는 옵션을 켜도 무시한다. 시리즈가 연결된 축이 time 인지는
 * 그릴 때 시리즈 단위로 다시 확인한다.
 * @param {object} options  정규화된 차트 옵션
 * @returns {boolean}
 */
export const isPartialDataTarget = (options) =>
  !!options?.partialData?.use &&
  SUPPORTED_CHART_TYPES.includes(options.type) &&
  !options.horizontal &&
  !!options.axesX?.some((axis) => axis?.type === 'time');

const toTime = (item) => normalizeAxisValue(item?.x, TIME_AXIS);

/**
 * 표시 중인 시리즈 가운데 마지막 데이터 시각이 가장 늦은 시리즈를 고른다.
 * 숨긴 시리즈는 화면에 없으므로 배치 방식·경계 계산에 끼어들면 안 된다.
 * @param {object[]} seriesList  element 인스턴스 목록
 * @returns {{ series: object, lastX: number, prevX: number|null }|null}
 */
export const findLatestSeries = (seriesList) => {
  let latest = null;
  seriesList.forEach((series) => {
    const len = series?.data?.length ?? 0;
    if (!series || series.show === false || !len) {
      return;
    }
    const lastX = toTime(series.data[len - 1]);
    if (lastX === null || (latest && lastX <= latest.lastX)) {
      return;
    }
    latest = { series, lastX, prevX: len >= 2 ? toTime(series.data[len - 2]) : null };
  });
  return latest;
};

/**
 * 시각으로 배치되는 차트(line, timeMode bar)에서 영역 시작점을 구한다.
 * 마지막 데이터가 축 범위(스크롤·줌·사용자 range) 밖이면 집계 중인 구간이 화면에 없으므로 null 이다.
 * @param {object} param
 * @param {number} param.lastX  마지막 데이터 시각
 * @param {number|null} param.prevX  직전 데이터 시각
 * @param {boolean} param.isTimeBar  timeMode bar 여부
 * @param {{ graphMin: number, graphMax: number }} param.axis  시리즈가 연결된 x축
 * @param {number} param.xArea  시리즈가 쓰는 가로 폭(px)
 * @param {number} param.xsp  시리즈의 x 시작 픽셀
 * @param {number} param.minX  플롯 왼쪽 끝 픽셀
 * @returns {{ startX: number, isClipped: boolean }|null}
 */
export const getTimeRegionStart = ({ lastX, prevX, isTimeBar, axis, xArea, xsp, minX }) => {
  const { graphMin, graphMax } = axis;
  if (lastX > graphMax) {
    return null;
  }

  let from;
  if (isTimeBar) {
    // timeMode bar 는 막대를 라벨 시각에서 오른쪽으로 그린다 — 막대 끝이 축 시작 이전이면 화면에 없다.
    const barEnd = prevX === null ? lastX : lastX + (lastX - prevX);
    if (barEnd <= graphMin) {
      return null;
    }
    from = lastX;
  } else {
    // line 의 점이 축 시작 이전이면 마지막 점이 보이지 않는다.
    if (lastX < graphMin) {
      return null;
    }
    // 점은 구간 시작 시각에 찍혀 영역을 그 시각부터 칠하면 점이 경계선에 걸친다.
    // 직전 점과의 중간을 경계로 삼아 마지막 점이 영역 안쪽에 오게 한다.
    from = prevX === null ? lastX : (prevX + lastX) / 2;
  }

  if (from <= graphMin) {
    return { startX: minX, isClipped: true };
  }
  return { startX: Canvas.calculateX(from, graphMin, graphMax, xArea, xsp), isClipped: false };
};

/**
 * 슬롯으로 배치되는 bar(timeMode 아님)에서 마지막 막대 슬롯의 왼쪽 끝 픽셀을 구한다.
 * 일반 bar 는 x 값이 아니라 가시 구간을 개수로 나눈 슬롯 순서로 그리므로(element.bar) 같은 규칙을 따른다.
 * @param {object} param
 * @param {number} param.labelCount  데이터 개수
 * @param {number} [param.minIndex]  가시 구간 시작 인덱스(스크롤·줌)
 * @param {number} [param.maxIndex]  가시 구간 끝 인덱스
 * @param {number} param.xArea  플롯 가로 폭(px)
 * @param {number} param.minX  플롯 왼쪽 끝 픽셀
 * @returns {number|null} 마지막 슬롯이 가시 구간 밖이면 null
 */
export const getLastSlotStartX = ({ labelCount, minIndex, maxIndex, xArea, minX }) => {
  if (!labelCount) {
    return null;
  }

  const hasWindow = truthyNumber(minIndex) && truthyNumber(maxIndex);
  const startIndex = hasWindow ? minIndex : 0;
  const endIndex = hasWindow ? maxIndex : labelCount - 1;
  const lastIndex = labelCount - 1;
  if (endIndex < startIndex || lastIndex < startIndex || lastIndex > endIndex) {
    return null;
  }

  const slotWidth = xArea / (endIndex - startIndex + 1);
  // calculateX 와 같이 올림해 소수 좌표로 영역 가장자리가 흐려지지 않게 한다.
  return Math.ceil(minX + slotWidth * (lastIndex - startIndex));
};

const modules = {
  /**
   * 아직 집계 중인 마지막 데이터 구간을 배경 영역 + 왼쪽 경계 점선으로 표시한다.
   * 집계 중인지는 데이터 수신 시각을 아는 소비자만 판정할 수 있어, 차트는 partialData.use 를 따르기만 한다.
   * @param {CanvasRenderingContext2D} ctx
   *
   * @returns {undefined}
   */
  drawPartialData(ctx) {
    if (!isPartialDataTarget(this.options)) {
      return;
    }

    // 줌은 data 를 잘라 넘기므로 잘린 구간의 끝이 원본의 마지막이 아니면 집계 중인 구간이 화면에 없다.
    if (this.isLatestDataInView?.() === false) {
      return;
    }

    const isBar = this.options.type === 'bar';
    const chartType = isBar ? 'bar' : 'line';
    const seriesList = (this.seriesInfo?.charts?.[chartType] ?? []).map(
      (id) => this.seriesList?.[id],
    );
    const latest = findLatestSeries(seriesList);
    if (!latest) {
      return;
    }

    const { series } = latest;
    const axisIndex = series.xAxisIndex ?? 0;
    const axis = this.axesSteps?.x?.[axisIndex];
    if (!axis || this.options.axesX?.[axisIndex]?.type !== 'time') {
      return;
    }

    const { chartRect, labelOffset } = this;
    const minX = chartRect.x1 + labelOffset.left;
    const maxX = chartRect.x2 - labelOffset.right;
    const minY = chartRect.y1 + labelOffset.top;
    const maxY = chartRect.y2 - labelOffset.bottom;
    const plotWidth = chartRect.chartWidth - (labelOffset.left + labelOffset.right);

    let startX;
    let isClipped = false;
    if (isBar && !series.timeMode) {
      startX = getLastSlotStartX({
        labelCount: series.data.length,
        minIndex: axis.minIndex,
        maxIndex: axis.maxIndex,
        xArea: plotWidth,
        minX,
      });
    } else {
      // combo line 은 막대 슬롯 중앙에 점을 찍도록 폭을 한 슬롯 줄이고 반 슬롯 오른쪽에서 시작한다(element.line).
      const comboSlot = series.combo ? plotWidth / (series.data.length || 1) : 0;
      const region = getTimeRegionStart({
        lastX: latest.lastX,
        prevX: latest.prevX,
        isTimeBar: !!series.timeMode,
        axis,
        xArea: plotWidth - comboSlot,
        xsp: minX + comboSlot / 2,
        minX,
      });
      startX = region?.startX ?? null;
      isClipped = !!region?.isClipped;
    }

    if (startX === null || startX >= maxX) {
      return;
    }

    const { color, border } = this.options.partialData;

    ctx.save();
    // defaultsDeep 은 null 을 채우지 않아, null 이면 fillStyle 이 무시돼 검정으로 칠해진다.
    ctx.fillStyle = color || DEFAULT_COLOR;
    ctx.fillRect(startX, minY, maxX - startX, maxY - minY);

    // 경계가 축 범위 밖으로 잘렸으면 실제 시작점이 아니므로 점선을 긋지 않는다.
    if (!isClipped && border?.width > 0) {
      const lineX = startX + Util.aliasPixel(border.width);
      ctx.beginPath();
      ctx.strokeStyle = border.color;
      ctx.lineWidth = border.width;
      ctx.setLineDash(border.segments ?? DEFAULT_BORDER_SEGMENTS);
      ctx.moveTo(lineX, minY);
      ctx.lineTo(lineX, maxY);
      ctx.stroke();
    }
    ctx.restore();
  },
};

export default modules;
