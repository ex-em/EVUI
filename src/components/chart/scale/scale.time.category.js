import dayjs from 'dayjs';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';
import { createNormalizedLabelsResolver, createVisibleIndexResolver } from './scale.utils';
import Util from '../helpers/helpers.util';

class TimeCategoryScale extends Scale {
  constructor(type, axisOpt, ctx, labels, options) {
    super(type, axisOpt, ctx);
    this.labels = labels;
    this.options = options;
  }

  /**
   * 임의의 값을 숫자(타임스탬프)로 정규화한다.
   * null/undefined → null, 유한한 숫자 → 그대로, 그 외(dayjs/Date/문자열 등) → dayjs 파싱 후 valueOf()
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
   * this.labels을 타임스탬프 배열로 정규화하고 캐시한다.
   * 캐시 키: ref + length + head + tail (shift+push 등 길이 보존 in-place 변형까지 검출).
   */
  _getNormalizedLabels() {
    if (!this._normalizedLabelsResolver) {
      this._normalizedLabelsResolver =
        createNormalizedLabelsResolver(v => this.normalizeTimeValue(v));
    }
    return this._normalizedLabelsResolver(this.labels);
  }

  /**
   * Transforming label by designated format
   * @param {number} value                   label value
   * @param {object} data                    data for formatting
   *
   * @returns {string} formatted label
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
   * Calculate min/max value and index range for time category scale.
   *
   * axis range / scrollbar range가 활성일 때만 minIndex/maxIndex를 함께 반환한다.
   * (LinearScale/TimeScale과 동일한 contract — range가 없으면 bar element는
   *  this.data 전체를 그리는 기존 경로로 동작한다.)
   *
   * Empty-range sentinel: { minIndex: 0, maxIndex: -1 }
   *   Callers must check maxIndex >= minIndex before treating minIndex as a
   *   valid start index — minIndex: 0 with maxIndex: -1 means "no visible labels",
   *   not "start from first label".
   *
   * @param {object} minMax       min/max information
   * @param {object} scrollbarOpt scrollbar option
   * @param {object} chartRect    chart size information
   *
   * @returns {object} min/max value, label, and (optional) index range
   */
  calculateScaleRange(minMax, scrollbarOpt, chartRect) {
    const baseRange = super.calculateScaleRange(minMax, scrollbarOpt, chartRect);

    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    const hasRangeOverride = Array.isArray(range) || typeof range === 'function';

    if (!hasRangeOverride || !this.labels?.length) {
      return baseRange;
    }

    if (!this._visibleIndexResolver) {
      this._visibleIndexResolver = createVisibleIndexResolver();
    }
    const { minIndex, maxIndex } = this._visibleIndexResolver(
      this._getNormalizedLabels(),
      this.normalizeTimeValue(baseRange.min),
      this.normalizeTimeValue(baseRange.max),
    );
    return { ...baseRange, minIndex, maxIndex };
  }

  /**
   * Calculate interval
   * @param {object} range    range information
   *
   * @returns {number} interval
   */
  getInterval(range) {
    const max = range.maxValue;
    const min = range.minValue;
    const step = range.maxSteps;

    if (this.interval) {
      if (typeof this.interval === 'string') {
        return TIME_INTERVALS[this.interval].size;
      } else if (typeof this.interval === 'object') {
        return this.interval.time * TIME_INTERVALS[this.interval.unit].size;
      } else if (typeof this.interval === 'number') {
        return this.interval;
      }
    }
    return Math.ceil((max - min) / step);
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { maxValue, minValue, maxSteps, minIndex, maxIndex } = range;
    const rawInterval = this.getInterval(range);

    let interval = rawInterval;
    let increase = minValue;
    let numberOfSteps;

    while (increase < maxValue) {
      increase += interval;
    }

    const graphMax = increase > maxValue ? maxValue : increase;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    numberOfSteps = Math.round(graphRange / interval) + 1;
    const oriSteps = numberOfSteps;

    if (maxValue === 1) {
      interval = 0.2;
      numberOfSteps = 5;
    }

    while (numberOfSteps > maxSteps) {
      interval *= 2;
      numberOfSteps = Math.round(graphRange / interval);
      interval = Math.ceil(graphRange / numberOfSteps);
    }

    if (graphMax - graphMin > numberOfSteps * interval) {
      interval = Math.ceil((graphMax - graphMin) / numberOfSteps);
    }

    return {
      steps: numberOfSteps,
      oriSteps,
      interval,
      rawInterval,
      graphMin,
      graphMax,
      minIndex,
      maxIndex,
    };
  }

  /**
   * Draw axis
   * @param {object} chartRect      min/max information
   * @param {object} labelOffset    label offset information
   * @param {object} stepInfo       label steps information
   *
   * @returns {undefined}
   */
  draw(chartRect, labelOffset, stepInfo, hitInfo, selectLabelInfo) {
    const ctx = this.ctx;
    const labels = this.labels;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const steps = stepInfo.steps;
    const axisMin = stepInfo.graphMin;
    const axisMax = stepInfo.graphMax;
    const stepValue = stepInfo.rawInterval;
    const oriSteps = stepInfo.oriSteps;

    let startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];

    const AXIS_TICK_LENGTH = 5;

    this.drawAxisTitle(chartRect, labelOffset);

    // label font 설정
    ctx.font = Util.getLabelStyle(this.labelStyle);

    if (this.type === 'x') {
      ctx.textAlign = 'center';
      ctx.textBaseline = this.position === 'top' ? 'bottom' : 'top';
    } else {
      ctx.textAlign = this.position === 'left' ? 'right' : 'left';
      ctx.textBaseline = 'middle';
    }

    ctx.fillStyle = this.labelStyle.color;
    ctx.lineWidth = this.axisLineWidth;
    const aliasPixel = Util.aliasPixel(ctx.lineWidth);

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

    if (steps === 0 || axisMin === null) {
      return;
    }

    const alignToGridLine = this.labelStyle.alignToGridLine;
    const graphGap = (endPoint - startPoint) / (oriSteps || 1);
    if (this.categoryMode && !alignToGridLine) {
      startPoint += Math.ceil(graphGap / 2) - 2;
    }

    const ticks = [];
    let labelCenter = null;
    let linePosition = null;

    ctx.beginPath();
    ctx.strokeStyle = this.gridLineColor;

    let labelText;
    let labelPoint;
    let ix;

    // 2개 이하일 경우, 첫번째와 마지막 라벨만 표시
    const count = steps <= 2 ? Math.max(1, oriSteps - 1) : Math.round(oriSteps / steps);

    const maxIndex = count === oriSteps ? oriSteps : oriSteps - 1;

    for (ix = 0; ix <= maxIndex; ix += count) {
      ticks[ix] = dayjs(axisMin).valueOf() + ix * stepValue;

      labelCenter = Math.round(startPoint + graphGap * ix);
      linePosition = labelCenter + aliasPixel;

      let prev;
      for (let jx = 0; jx < ticks.length; jx++) {
        if (ticks[jx] !== undefined && jx !== ix) {
          prev = ticks[jx];
        }
      }

      labelText = this.getLabelFormat(Math.min(axisMax, ticks[ix]), { prev });

      const isBlurredLabel =
        this.options?.selectLabel?.use &&
        this.options?.selectLabel?.useLabelOpacity &&
        this.options.horizontal === (this.type === 'y') &&
        selectLabelInfo?.dataIndex?.length &&
        !selectLabelInfo?.label
          .map((t) =>
            this.getLabelFormat(Math.min(axisMax, t), {
              prev,
            }),
          )
          .includes(labelText);

      const labelColor = this.labelStyle.color;
      let defaultOpacity = 1;

      if (Util.getColorStringType(labelColor) === 'RGBA') {
        defaultOpacity = Util.getOpacity(labelColor);
      }

      ctx.fillStyle = Util.colorStringToRgba(
        labelColor,
        isBlurredLabel ? this.options?.unSelectedOpacity : defaultOpacity,
      );

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(this.checkFixWidth(labelText), labelCenter, labelPoint);
        if (
          !isBlurredLabel &&
          this.options?.selectItem?.showLabelTip &&
          hitInfo?.label &&
          !this.options?.horizontal
        ) {
          const selectedLabel = this.getLabelFormat(
            Math.min(axisMax, hitInfo.label + 0 * stepValue),
          );
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
              backgroundColor: this.options?.selectItem?.labelTipStyle?.backgroundColor,
              textColor: this.options?.selectItem?.labelTipStyle?.textColor,
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

        if (ix < oriSteps && this.showGrid) {
          ctx.beginPath();
          ctx.strokeStyle = this.gridLineColor;
          ctx.moveTo(linePosition, offsetPoint);
          ctx.lineTo(linePosition, offsetCounterPoint);
          ctx.stroke();
          ctx.closePath();
        }
      } else {
        labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(this.checkFixWidth(labelText), labelPoint, labelCenter);

        if (this.showAxisTick) {
          ctx.beginPath();
          ctx.strokeStyle = this.axisLineColor;
          ctx.moveTo(offsetPoint + (this.axisLineWidth ?? 1), linePosition);
          ctx.lineTo(offsetPoint - AXIS_TICK_LENGTH, linePosition);
          ctx.stroke();
          ctx.closePath();
        }

        if (ix < oriSteps && this.showGrid) {
          ctx.beginPath();
          ctx.strokeStyle = this.gridLineColor;
          ctx.moveTo(offsetPoint, linePosition);
          ctx.lineTo(offsetCounterPoint, linePosition);
          ctx.stroke();
          ctx.closePath();
        }
      }

      ctx.stroke();
    }

    if (this.categoryMode && alignToGridLine && ix * count === oriSteps) {
      const diffTime = dayjs(labels[1]).diff(dayjs(labels[0]));
      const labelLastText = this.getLabelFormat(dayjs(ticks[oriSteps - 1] + diffTime));

      labelCenter = Math.round(startPoint + graphGap * oriSteps);
      linePosition = labelCenter + aliasPixel;

      if (this.type === 'x') {
        ctx.fillText(this.checkFixWidth(labelLastText), labelCenter, labelPoint);
        if (this.showGrid) {
          ctx.moveTo(linePosition, offsetPoint);
          ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        ctx.fillText(this.checkFixWidth(labelLastText), labelPoint, labelCenter);
        if (this.showGrid) {
          ctx.moveTo(offsetPoint, linePosition);
          ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }
      ctx.stroke();
    }

    ctx.closePath();
  }
}

export default TimeCategoryScale;
