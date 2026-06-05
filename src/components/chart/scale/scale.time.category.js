import dayjs from 'dayjs';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';
import Util from '../helpers/helpers.util';

class TimeCategoryScale extends Scale {
  constructor(type, axisOpt, ctx, labels, options) {
    super(type, axisOpt, ctx);
    this.labels = labels;
    this.options = options;
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
   * Adds minIndex/maxIndex so bar/tooltip can clip to the visible window.
   *
   * minIndex/maxIndex 세 가지 상태:
   *   - undefined: 윈도우 없음 → 전체 범위 (여기선 반환하지 않음).
   *   - maxIndex >= minIndex: [minIndex, maxIndex] 범위만.
   *   - sentinel { 0, -1 }: 빈 윈도우 → 아무것도 안 그림. undefined로 두지 않는
   *     이유는 undefined가 "전체 그림"을 뜻해 결과가 정반대이기 때문.
   * 단, baseRange.min/max가 non-finite(데이터 없음 또는 range 오설정)면 빈 범위가
   * 아니라 전체 라벨 범위 [0, last]로 폴백한다(빈 sentinel과 혼동 금지).
   * 소비자는 sentinel을 "아무것도 안 그림"으로 다뤄야 하며 minIndex를 단독
   * 시작 인덱스로 쓰려면 먼저 maxIndex >= minIndex 를 확인해야 한다.
   *
   * @param {object} minMax       min/max information
   * @param {object} scrollbarOpt scrollbar option
   * @param {object} chartRect    chart size information
   *
   * @returns {object} min/max value, label, and index range
   */
  calculateScaleRange(minMax, scrollbarOpt, chartRect) {
    const baseRange = super.calculateScaleRange(minMax, scrollbarOpt, chartRect);

    const labels = this.labels;
    if (!labels?.length) {
      return { ...baseRange, minIndex: 0, maxIndex: -1 };
    }

    let minIndex = 0;
    let maxIndex = labels.length - 1;

    const { min: rangeMin, max: rangeMax } = baseRange;
    // labels는 오름차순(시간순) 정렬 가정: findIndex(ts >= rangeMin) + 역방향 루프는
    // 정렬돼 있을 때만 올바른 [start, end] window를 준다(기존 코드베이스 전제와 동일).
    if (Number.isFinite(rangeMin) && Number.isFinite(rangeMax)) {
      const startIdx = labels.findIndex(ts => ts >= rangeMin);
      let endIdx = -1;
      for (let i = labels.length - 1; i >= 0; i -= 1) {
        if (labels[i] <= rangeMax) {
          endIdx = i;
          break;
        }
      }
      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        minIndex = 0;
        maxIndex = -1;
      } else {
        minIndex = startIdx;
        maxIndex = endIdx;
      }
    } else {
      // min/max가 non-finite → 전체 라벨 범위(0 ~ last)로 폴백.
      //   (a) 데이터 없는 초기 렌더링은 정상.
      //   (b) range 옵션이 지정됐는데 non-finite로 귀결되면 오설정 가능성이 크므로
      //       조용히 삼키지 말고 경고한다.
      const rangeOpt = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
      if (rangeOpt != null) {
        console.warn(
          '[EVUI][TimeCategoryScale] axis range가 유효한 min/max 숫자로 해석되지 ' +
            '않아 전체 라벨 범위로 폴백합니다. range 설정을 확인하세요:',
          rangeOpt,
        );
      }
    }

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
