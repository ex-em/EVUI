import { defaultsDeep } from 'lodash-es';
import dayjs from 'dayjs';
import Canvas from '@/components/chart/helpers/helpers.canvas';
import {
  TIME_INTERVALS,
  PLOT_LINE_OPTION,
  PLOT_BAND_OPTION,
} from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Scale from './scale';

/**
 * 사용자 interval 옵션을 정규화된 meta 객체로 변환한다.
 * string/object interval은 boundary 정렬을 수행하고,
 * number interval은 boundary 정렬 없이 ms 기반으로 계산한다.
 *
 * @param {string|object|number} interval 사용자 interval 옵션
 * @returns {{ ms: number, unit: string|null, time: number|null }|null}
 */
function getIntervalMeta(interval) {
  if (typeof interval === 'string' && TIME_INTERVALS[interval]) {
    return {
      ms: TIME_INTERVALS[interval].size,
      unit: interval,
      time: 1,
    };
  }

  if (typeof interval === 'object' && interval !== null && interval.unit && interval.time > 0) {
    const unitInfo = TIME_INTERVALS[interval.unit];
    if (!unitInfo) {
      return null;
    }
    return {
      ms: interval.time * unitInfo.size,
      unit: interval.unit,
      time: interval.time,
    };
  }

  if (typeof interval === 'number' && interval > 0 && Number.isFinite(interval)) {
    return {
      ms: interval,
      unit: null,
      time: null,
    };
  }

  return null;
}

/**
 * dayjs 객체에 interval 한 단위를 더한다.
 * month/quarter/year는 dayjs를 사용하여 달력 기반으로 증가한다.
 *
 * @param {dayjs.Dayjs} d dayjs 객체
 * @param {{ unit: string|null, time: number|null, ms: number }} meta interval 메타 정보
 * @returns {dayjs.Dayjs} interval이 더해진 dayjs 객체
 */
function addIntervalDayjs(d, meta) {
  if (!meta.unit) {
    return dayjs(d.valueOf() + meta.ms);
  }

  const t = meta.time || 1;
  switch (meta.unit) {
    case 'month':
      return d.add(t, 'month');
    case 'quarter':
      return d.add(t * 3, 'month');
    case 'year':
      return d.add(t, 'year');
    case 'week':
      return d.add(t * 7, 'day');
    default:
      return dayjs(d.valueOf() + meta.ms);
  }
}

/**
 * timestamp에 interval 한 단위를 더한다.
 *
 * @param {number} timestamp 기준 타임스탬프
 * @param {{ unit: string|null, time: number|null, ms: number }} meta interval 메타 정보
 * @returns {number} interval이 더해진 타임스탬프
 */
function addInterval(timestamp, meta) {
  if (!meta.unit) {
    return timestamp + meta.ms;
  }
  return addIntervalDayjs(dayjs(timestamp), meta).valueOf();
}

/**
 * timestamp를 다음 interval 정렬 boundary로 올림(ceil)한다.
 *
 * time > 1일 때도 정확한 배수 boundary에 맞춘다.
 * 예: { time: 10, unit: 'minute' }, 12:56 → 13:00 (10분 배수)
 *
 * 각 unit별 anchor(기준점):
 *   sub-day (ms/s/m/h) → start of day
 *   day               → start of year
 *   week              → start of year 기준 Monday
 *   month/quarter     → start of year (달력 기반)
 *   year              → epoch year 2000 (달력 기반)
 *
 * number interval → Math.ceil(timestamp / ms) * ms (boundary 정렬 없음)
 *
 * @param {number} timestamp 기준 타임스탬프
 * @param {{ ms: number, unit: string|null, time: number|null }} meta interval 메타 정보
 * @returns {number} boundary에 정렬된 타임스탬프
 */
function ceilToBoundary(timestamp, meta) {
  if (!meta.unit) {
    return Math.ceil(timestamp / meta.ms) * meta.ms;
  }

  const time = meta.time || 1;
  const d = dayjs(timestamp);

  // --- sub-day: start of day 기준 ms 연산 ---
  if (['millisecond', 'second', 'minute', 'hour'].includes(meta.unit)) {
    const anchor = d.startOf('day').valueOf();
    const intervalMs = TIME_INTERVALS[meta.unit].size * time;
    const elapsed = timestamp - anchor;
    return anchor + Math.ceil(elapsed / intervalMs) * intervalMs;
  }

  // --- day: start of year 기준 ms 연산 ---
  if (meta.unit === 'day') {
    const anchor = d.startOf('year').valueOf();
    const intervalMs = TIME_INTERVALS.day.size * time;
    const elapsed = timestamp - anchor;
    return anchor + Math.ceil(elapsed / intervalMs) * intervalMs;
  }

  // --- week: start of year 기준 Monday에서 ms 연산 ---
  if (meta.unit === 'week') {
    let anchor = d.startOf('year');
    const dow = anchor.day();
    anchor = anchor.subtract((dow + 6) % 7, 'day');
    const anchorMs = anchor.valueOf();
    const intervalMs = TIME_INTERVALS.week.size * time;
    const elapsed = timestamp - anchorMs;
    return anchorMs + Math.ceil(elapsed / intervalMs) * intervalMs;
  }

  // --- month: 달력 기반 ---
  if (meta.unit === 'month') {
    const yearStart = d.startOf('year');
    const monthStart = d.startOf('month');
    const monthIndex = d.month();
    const offset = monthStart.valueOf() >= timestamp ? monthIndex : monthIndex + 1;
    const aligned = Math.ceil(offset / time) * time;
    return yearStart.add(aligned, 'month').valueOf();
  }

  // --- quarter: 달력 기반 ---
  if (meta.unit === 'quarter') {
    const yearStart = d.startOf('year');
    const qIndex = Math.floor(d.month() / 3);
    const qStart = d.month(qIndex * 3).startOf('month');
    const offset = qStart.valueOf() >= timestamp ? qIndex : qIndex + 1;
    const aligned = Math.ceil(offset / time) * time;
    return yearStart.add(aligned * 3, 'month').valueOf();
  }

  // --- year: 달력 기반, epoch = 2000 ---
  if (meta.unit === 'year') {
    const yearStart = d.startOf('year');
    const epochYear = 2000;
    const offset = yearStart.valueOf() >= timestamp
      ? d.year() - epochYear
      : d.year() + 1 - epochYear;
    const aligned = Math.ceil(offset / time) * time;
    return dayjs(`${epochYear + aligned}-01-01`).startOf('day').valueOf();
  }

  // fallback
  return timestamp;
}

/**
 * graphMin 이상 graphMax 이하인 visible tick을 생성한다.
 *
 * 첫 tick은 ceilToBoundary(graphMin, meta)로 결정되고,
 * 이후 meta 간격으로 증가한다.
 * maxSteps로 interval이 확장된 경우에도 확장된 interval의 boundary를 사용하여
 * tick 위치가 안정적으로 유지된다 (실시간 데이터 시나리오에서 중요).
 *
 * @param {number} graphMin 그래프 최솟값
 * @param {number} graphMax 그래프 최댓값
 * @param {{ ms: number, unit: string|null, time: number|null }} meta interval 메타 정보
 * @returns {number[]} 생성된 tick 타임스탬프 배열
 */
function generateVisibleTicks(graphMin, graphMax, meta) {
  const ticks = [];
  let tick = ceilToBoundary(graphMin, meta);
  const MAX_TICKS = 10000;

  while (tick <= graphMax && ticks.length < MAX_TICKS) {
    ticks.push(tick);
    tick = addInterval(tick, meta);
  }

  return ticks;
}

class TimeScale extends Scale {
  /**
   * 임의의 값을 숫자(타임스탬프)로 정규화한다.
   * null/undefined → null, 유한한 숫자 → 그대로, 그 외 → dayjs로 파싱 후 valueOf()
   *
   * @param {*} value 정규화할 값
   * @returns {number|null} 정규화된 타임스탬프 (유효하지 않으면 null)
   */
  normalizeTimeValue(value) {
    if (value == null) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    const normalized = dayjs(value).valueOf();
    return Number.isFinite(normalized) ? normalized : null;
  }

  /**
   * min/max 값을 타임스탬프로 정규화하고, super.calculateScaleRange를 호출한다.
   *
   * @param {object} minMax        min/max 정보
   * @param {object} scrollbarOpt  스크롤바 옵션
   * @returns {object} 정규화된 min/max 값과 라벨
   */
  calculateScaleRange(minMax, scrollbarOpt) {
    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    const hasRangeOverride = Array.isArray(range) || typeof range === 'function';

    if (!hasRangeOverride && (minMax?.min == null || minMax?.max == null)) {
      return {
        min: null,
        max: null,
        minLabel: '',
        maxLabel: '',
        size: Util.calcTextSizeCanvas('', Util.getLabelStyle(this.labelStyle)),
      };
    }

    let normalizedRange = range;

    if (Array.isArray(range) && range.length === 2) {
      normalizedRange = [
        this.normalizeTimeValue(range[0]),
        this.normalizeTimeValue(range[1]),
      ];
    } else if (typeof range === 'function') {
      normalizedRange = (...args) => {
        const [min, max] = range(...args);
        return [
          this.normalizeTimeValue(min),
          this.normalizeTimeValue(max),
        ];
      };
    }

    const originalRange = this.range;
    const safeScrollbarOpt = scrollbarOpt?.use
      ? { ...scrollbarOpt, range: normalizedRange }
      : scrollbarOpt;

    const normalizedMinMax = {
      ...minMax,
      min: this.normalizeTimeValue(minMax?.min),
      max: this.normalizeTimeValue(minMax?.max),
    };

    let result;
    try {
      if (!scrollbarOpt?.use) {
        this.range = normalizedRange;
      }
      result = super.calculateScaleRange(normalizedMinMax, safeScrollbarOpt);
    } finally {
      this.range = originalRange;
    }

    return {
      ...result,
      min: this.normalizeTimeValue(result.min),
      max: this.normalizeTimeValue(result.max),
    };
  }

  /**
   * 지정된 포맷에 따라 라벨 텍스트를 생성한다.
   *
   * @param {number} value 라벨 값 (타임스탬프)
   * @param {object} data  포맷팅에 사용할 데이터 (prev 등)
   * @returns {string} 포맷된 라벨 문자열
   */
  getLabelFormat(value, data = {}) {
    if (this.formatter) {
      const formattedLabel = this.formatter(value, data);

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

    return dayjs(value).format(this.timeFormat);
  }

  /**
   * interval을 계산한다 (스크롤바 플러그인 등 외부에서 사용).
   *
   * @param {object} range 범위 정보 (minValue, maxValue, maxSteps)
   * @returns {number} 계산된 interval (ms)
   */
  getInterval(range) {
    const max = this.normalizeTimeValue(range.maxValue);
    const min = this.normalizeTimeValue(range.minValue);
    const step = range.maxSteps;

    if (this.interval) {
      let userInterval;
      if (typeof this.interval === 'string') {
        userInterval = TIME_INTERVALS[this.interval].size;
      } else if (typeof this.interval === 'object') {
        userInterval = this.interval.time * TIME_INTERVALS[this.interval.unit].size;
      } else if (typeof this.interval === 'number') {
        userInterval = this.interval;
      }

      if (userInterval > 0 && Number.isFinite(userInterval)) {
        return userInterval;
      }
    }
    return Math.ceil((max - min) / step);
  }

  /**
   * Visible tick 기반으로 steps 정보를 계산한다.
   *
   * 기존 균등분할(labelGap) 방식 대신, interval boundary에 맞는 tick만 생성하고
   * graphMin/graphMax는 변경하지 않는다.
   *
   * @param {object} range min/max 정보 (minValue, maxValue, maxSteps)
   * @returns {object} { steps, interval, baseInterval, graphMin, graphMax, ticks }
   */
  calculateSteps(range) {
    const minValue = this.normalizeTimeValue(range.minValue);
    const maxValue = this.normalizeTimeValue(range.maxValue);
    const maxSteps = Math.max(1, range.maxSteps ?? 1);

    if (minValue == null || maxValue == null) {
      return {
        steps: 0,
        interval: 0,
        baseInterval: 0,
        graphMin: null,
        graphMax: null,
        ticks: [],
      };
    }

    const graphMin = +minValue;
    const graphMax = +maxValue;

    if (graphMin >= graphMax) {
      return {
        steps: 0,
        interval: 0,
        baseInterval: 0,
        graphMin,
        graphMax,
        ticks: [],
      };
    }

    // interval meta 결정
    const meta = getIntervalMeta(this.interval);

    let baseMeta;
    if (meta) {
      baseMeta = meta;
    } else {
      // 사용자 interval이 없으면 auto (number interval, boundary 정렬 없음)
      const autoMs = Math.max(1, Math.ceil((graphMax - graphMin) / Math.max(1, maxSteps)));
      baseMeta = { ms: autoMs, unit: null, time: null };
    }

    // tick 생성 + maxSteps 초과 시 interval을 strict 배수로 확장
    // 예상 tick 수에서 초기 multiplier를 추정하여 불필요한 반복을 줄인다
    // fixedSteps인 경우 interval 확장을 하지 않으므로 multiplier는 항상 1
    const estimatedTicks = Math.ceil((graphMax - graphMin) / baseMeta.ms);
    let multiplier = (!this.fixedSteps && estimatedTicks > maxSteps)
      ? Math.max(1, Math.floor(estimatedTicks / maxSteps))
      : 1;
    let ticks;
    let currentMs;

    const MAX_MULTIPLIER = multiplier + 10000;
    while (multiplier <= MAX_MULTIPLIER) {
      const currentMeta = baseMeta.unit
        ? {
            ms: baseMeta.ms * multiplier,
            unit: baseMeta.unit,
            time: (baseMeta.time || 1) * multiplier,
          }
        : {
            ms: baseMeta.ms * multiplier,
            unit: null,
            time: null,
          };

      currentMs = currentMeta.ms;
      ticks = generateVisibleTicks(graphMin, graphMax, currentMeta);

      if (ticks.length <= maxSteps || this.fixedSteps) {
        break;
      }
      multiplier++;
    }

    return {
      steps: Math.max(0, ticks.length - 1),
      interval: currentMs,
      baseInterval: baseMeta.ms,
      graphMin,
      graphMax,
      ticks,
    };
  }

  /**
   * Time axis 전용 draw.
   * 기존 균등분할(labelGap = distance / steps) 방식이 아니라,
   * stepInfo.ticks[]의 실제 값으로부터 Canvas.calculateX/Y를 통해
   * 픽셀 좌표를 계산하여 label / grid / axis tick을 그린다.
   *
   * @param {object} chartRect      차트 크기 정보
   * @param {object} labelOffset    라벨 오프셋 정보
   * @param {object} stepInfo       라벨 steps 정보 (ticks[] 포함)
   * @param {object} hitInfo        히트(클릭/호버) 정보
   * @param {object} selectLabelInfo 선택된 라벨 정보
   */
  draw(chartRect, labelOffset, stepInfo, hitInfo, selectLabelInfo) {
    const ctx = this.ctx;
    const options = this.options;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const axisMin = stepInfo.graphMin;
    const axisMax = stepInfo.graphMax;
    const ticks = stepInfo.ticks;

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];

    const AXIS_TICK_LENGTH = 5;

    let aliasPixel = 0;

    this.drawAxisTitle(chartRect, labelOffset);

    ctx.font = Util.getLabelStyle(this.labelStyle);
    ctx.fillStyle = this.labelStyle.color;

    if (this.type === 'x') {
      ctx.textAlign = 'center';
      ctx.textBaseline = this.position === 'top' ? 'bottom' : 'top';
    } else {
      ctx.textAlign = this.position === 'left' ? 'right' : 'left';
      ctx.textBaseline = 'middle';
    }

    if (this.showAxis) {
      ctx.lineWidth = this.axisLineWidth;
      aliasPixel = Util.aliasPixel(ctx.lineWidth);

      ctx.beginPath();
      ctx.strokeStyle = this.axisLineColor;

      if (this.type === 'x') {
        ctx.moveTo(startPoint, offsetPoint + aliasPixel);
        ctx.lineTo(endPoint, offsetPoint + aliasPixel);
      } else {
        ctx.moveTo(offsetPoint + aliasPixel, startPoint);
        ctx.lineTo(offsetPoint + aliasPixel, endPoint);
      }
      ctx.stroke();
      ctx.closePath();
    }

    // ticks가 없으면 축 선만 그리고 종료
    if (!ticks?.length || axisMin === null) {
      return;
    }

    if (this.labelStyle?.show) {
      // tick 값 기반 좌표 계산을 위한 area 정보
      const xArea = aPos.x2 - aPos.x1;
      const yArea = aPos.y2 - aPos.y1;

      ctx.strokeStyle = this.gridLineColor;
      ctx.lineWidth = 1;
      aliasPixel = Util.aliasPixel(ctx.lineWidth);

      let labelText;
      for (let ix = 0; ix < ticks.length; ix++) {
        const tick = ticks[ix];

        // tick 값에서 실제 픽셀 좌표를 계산
        let labelCenter;
        if (this.type === 'x') {
          labelCenter = Canvas.calculateX(tick, axisMin, axisMax, xArea, aPos.x1);
        } else {
          labelCenter = Canvas.calculateY(tick, axisMin, axisMax, yArea, aPos.y2);
        }

        if (labelCenter === null) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const isZeroLine = tick === 0;
        if (isZeroLine && this.zeroLineColor) {
          ctx.strokeStyle = this.zeroLineColor;
        } else {
          ctx.strokeStyle = this.gridLineColor;
        }

        const linePosition = labelCenter + aliasPixel;
        labelText = this.getLabelFormat(tick, {
          prev: ticks[ix - 1] ?? '',
        });

        const isBlurredLabel =
          this.options?.selectLabel?.use &&
          this.options?.selectLabel?.useLabelOpacity &&
          this.options.horizontal === (this.type === 'y') &&
          selectLabelInfo?.dataIndex?.length &&
          !selectLabelInfo?.label
            .map((t) =>
              this.getLabelFormat(t, {
                prev: ticks[ix - 1] ?? '',
              }),
            )
            .includes(labelText);

        let labelColor;
        if (ix === ticks.length - 1 && this.lastLabelFontStyle) {
          ctx.font = Util.getLabelStyle(this.lastLabelFontStyle);
          labelColor = this.lastLabelFontStyle.color;
        } else if (ix === 0 && this.firstLabelFontStyle) {
          ctx.font = Util.getLabelStyle(this.firstLabelFontStyle);
          labelColor = this.firstLabelFontStyle.color;
        } else {
          ctx.font = Util.getLabelStyle(this.labelStyle);
          labelColor = this.labelStyle.color;
        }

        let defaultOpacity = 1;

        if (Util.getColorStringType(labelColor) === 'RGBA') {
          defaultOpacity = Util.getOpacity(labelColor);
        }

        ctx.fillStyle = Util.colorStringToRgba(
          labelColor,
          isBlurredLabel ? this.options?.unSelectedOpacity : defaultOpacity,
        );

        let labelPoint;

        if (this.type === 'x') {
          labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
          if (options?.brush?.showLabel || !options?.brush) {
            ctx.fillText(this.checkFixWidth(labelText), labelCenter, labelPoint);
          }

          if (
            !isBlurredLabel &&
            options?.selectItem?.showLabelTip &&
            hitInfo?.label &&
            !this.options?.horizontal
          ) {
            const selectedLabel = this.getLabelFormat(hitInfo.label);
            if (selectedLabel === labelText) {
              const height = Math.round(ctx.measureText(this.labelStyle?.fontSize).width);
              Util.showLabelTip({
                ctx: this.ctx,
                width: Math.round(ctx.measureText(selectedLabel).width) + 10,
                height,
                x: labelCenter,
                y: labelPoint + (height - 2),
                borderRadius: 2,
                arrowSize: 3,
                text: labelText,
                backgroundColor: options?.selectItem?.labelTipStyle?.backgroundColor,
                textColor: options?.selectItem?.labelTipStyle?.textColor,
              });
            }
          }

          if (this.showAxisTick) {
            ctx.beginPath();
            ctx.strokeStyle = this.axisLineColor;
            ctx.moveTo(linePosition, offsetPoint);
            ctx.lineTo(linePosition, offsetPoint + AXIS_TICK_LENGTH);
            ctx.stroke();
            ctx.closePath();
          }

          // ix === 0 이라는 이유만으로 grid를 생략하지 않는다
          if (this.showGrid) {
            ctx.beginPath();
            ctx.strokeStyle = this.gridLineColor;
            ctx.moveTo(linePosition, offsetPoint);
            ctx.lineTo(linePosition, offsetCounterPoint);
            ctx.stroke();
            ctx.closePath();
          }
        } else {
          labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
          if (options?.brush?.showLabel || !options?.brush) {
            ctx.fillText(this.checkFixWidth(labelText), labelPoint, labelCenter);
          }

          let adjustedLinePosition = linePosition;
          if (ix === ticks.length - 1) {
            adjustedLinePosition -= 1;
          }

          if (this.showAxisTick) {
            ctx.beginPath();
            ctx.strokeStyle = this.axisLineColor;
            ctx.moveTo(
              offsetPoint + (this.axisLineWidth ?? 1),
              adjustedLinePosition,
            );
            ctx.lineTo(offsetPoint - AXIS_TICK_LENGTH, adjustedLinePosition);
            ctx.stroke();
            ctx.closePath();
          }

          // ix === 0 이라는 이유만으로 grid를 생략하지 않는다
          if (this.showGrid) {
            ctx.beginPath();
            ctx.strokeStyle = this.gridLineColor;
            ctx.moveTo(offsetPoint, adjustedLinePosition);
            ctx.lineTo(offsetCounterPoint, adjustedLinePosition);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    }

    // plotBand / plotLine은 axisMin/axisMax 기준으로 위치를 계산하는 기존 구조를 유지
    if (this.plotBands?.length || this.plotLines?.length) {
      const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
      const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
      const padding = aliasPixel + 1;
      const minX = aPos.x1;
      const maxX = aPos.x2 + padding;
      const minY = aPos.y1 - padding;
      const maxY = aPos.y2;

      this.plotBands?.forEach((plotBand) => {
        const mergedPlotBandOpt = defaultsDeep({}, plotBand, PLOT_BAND_OPTION);
        const {
          from: userDefinedFrom,
          to: userDefinedTo,
          label: labelOpt,
        } = mergedPlotBandOpt;
        const from = !Util.isNullOrUndefined(userDefinedFrom)
          ? Math.max(userDefinedFrom, axisMin)
          : axisMin;
        const to = !Util.isNullOrUndefined(userDefinedTo)
          ? Math.min(userDefinedTo, axisMax)
          : axisMax;

        this.setPlotBandStyle(mergedPlotBandOpt);

        let fromPos;
        let toPos;
        if (this.type === 'x') {
          fromPos = Canvas.calculateX(from, axisMin, axisMax, xArea, minX);
          toPos = Canvas.calculateX(to, axisMin, axisMax, xArea, minX);

          if (fromPos === null || toPos === null) {
            return;
          }

          this.drawXPlotBand(fromPos, toPos, minX, maxX, minY, maxY);
        } else {
          fromPos = Canvas.calculateY(from, axisMin, axisMax, yArea, maxY);
          toPos = Canvas.calculateY(to, axisMin, axisMax, yArea, maxY);

          if (fromPos === null || toPos === null) {
            return;
          }

          this.drawYPlotBand(fromPos, toPos, minX, maxX, minY, maxY);
        }

        if (labelOpt.show) {
          const labelOptions = this.getNormalizedLabelOptions(chartRect, labelOpt);
          const textXY = this.getPlotBandLabelPosition(
            fromPos, toPos, labelOptions, maxX, minY,
          );
          this.drawPlotLabel(labelOptions, textXY);
        }

        ctx.restore();
      });

      this.plotLines?.forEach((plotLine) => {
        if (!Number.isFinite(+plotLine.value)) {
          return;
        }

        const mergedPlotLineOpt = defaultsDeep({}, plotLine, PLOT_LINE_OPTION);
        const { value, label: labelOpt } = mergedPlotLineOpt;

        let dataPos;
        if (this.type === 'x') {
          dataPos = Canvas.calculateX(value, axisMin, axisMax, xArea, minX);

          if (dataPos === null) {
            return;
          }

          this.setPlotLineStyle(mergedPlotLineOpt);
          this.drawXPlotLine(dataPos, minX, maxX, minY, maxY);
        } else {
          dataPos = Canvas.calculateY(value, axisMin, axisMax, yArea, maxY);

          if (dataPos === null) {
            return;
          }

          this.setPlotLineStyle(mergedPlotLineOpt);
          this.drawYPlotLine(dataPos, minX, maxX, minY, maxY);
        }

        if (labelOpt.show) {
          const labelOptions = this.getNormalizedLabelOptions(chartRect, labelOpt);
          const textXY = this.getPlotLineLabelPosition(
            dataPos, labelOptions, maxX, minY,
          );
          this.drawPlotLabel(labelOptions, textXY);
        }

        ctx.restore();
      });
    }
  }
}

export default TimeScale;
