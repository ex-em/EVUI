import Canvas from '@/components/chart/helpers/helpers.canvas';
import { defaultsDeep } from 'lodash-es';
import {
  AXIS_OPTION,
  AXIS_UNITS,
  PLOT_LINE_OPTION,
  PLOT_LINE_LABEL_OPTION,
} from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';

class Scale {
  constructor(type, opt, ctx, options) {
    const merged = defaultsDeep({}, opt, AXIS_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    this.type = type;
    this.ctx = ctx;
    this.units = AXIS_UNITS[this.type];
    this.options = options;

    if (!this.position) {
      this.position = type === 'x' ? 'bottom' : 'left';
    }
  }

  /**
   * Calculate axis's min/max label steps
   * @param {string} type           axis direction ('x', 'y')
   * @param {object} chartRect      chart size information
   * @param {object} labelOffset    chart label offset information
   * @param {number} tickSize       label's size
   *
   * @returns {object} label range
   */
  calculateLabelRange(type, chartRect, labelOffset, tickSize) {
    let chartSize;
    let axisOffset;
    let bufferedTickSize;

    if (type === 'x') {
      chartSize = chartRect.chartWidth;
      bufferedTickSize = Math.floor(tickSize * 1.1);
      axisOffset = [labelOffset.left, labelOffset.right];
    } else {
      chartSize = chartRect.chartHeight;
      axisOffset = [labelOffset.top, labelOffset.bottom];
      bufferedTickSize = tickSize + (Math.floor(chartSize * 0.1));
    }

    const drawRange = chartSize - (axisOffset[0] + axisOffset[1]);
    const minSteps = 1;
    const maxSteps = Math.max(Math.floor(drawRange / bufferedTickSize) - 1, 1);

    return {
      min: minSteps,
      max: maxSteps,
    };
  }

  /**
   * Calculate min/max value, label and size information for axis
   * @param {object} minMax    min/max information
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax) {
    let maxValue;
    let minValue;

    if (this.range?.length === 2) {
      maxValue = this.range[1];
      minValue = this.range[0];
    } else {
      maxValue = minMax.max;
      minValue = minMax.min;
    }

    if (this.autoScaleRatio) {
      maxValue = Math.ceil(maxValue * (this.autoScaleRatio + 1));
    }

    if (this.startToZero) {
      minValue = 0;
    }

    if (maxValue === minValue) {
      maxValue += 1;
    }

    const minLabel = this.getLabelFormat(minValue);
    const maxLabel = this.getLabelFormat(maxValue);

    return {
      min: minValue,
      max: maxValue,
      minLabel,
      maxLabel,
      size: Util.calcTextSize(maxLabel, Util.getLabelStyle(this.labelStyle)),
    };
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { maxValue, minValue } = range;
    let { maxSteps } = range;

    let interval = this.getInterval(range);
    let increase = minValue;
    let numberOfSteps;

    while (increase < maxValue) {
      increase += interval;
    }

    const graphMax = increase > maxValue ? maxValue : increase;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    numberOfSteps = Math.round(graphRange / interval);

    if (maxValue === 1) {
      if (maxSteps > 2) {
        interval = 0.2;
        numberOfSteps = 5;
        maxSteps = 5;
      } else {
        interval = 0.5;
        numberOfSteps = 2;
        maxSteps = 2;
      }
    }

    while (numberOfSteps > maxSteps) {
      interval *= 2;
      numberOfSteps = Math.round(graphRange / interval);
      interval = Math.ceil(graphRange / numberOfSteps);
    }

    if (graphMax - graphMin > (numberOfSteps * interval)) {
      interval = Math.ceil((graphMax - graphMin) / numberOfSteps);
    }

    return {
      steps: numberOfSteps,
      interval,
      graphMin,
      graphMax,
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
  draw(chartRect, labelOffset, stepInfo, hitInfo) {
    const ctx = this.ctx;
    const options = this.options;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const steps = stepInfo.steps;
    const axisMin = stepInfo.graphMin;
    const axisMax = stepInfo.graphMax;
    const stepValue = stepInfo.interval;

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];

    let aliasPixel;

    // label font 설정
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
      ctx.lineWidth = 2;
      aliasPixel = Util.aliasPixel(ctx.lineWidth);

      ctx.beginPath();
      ctx.strokeStyle = this.axisLineColor;

      if (this.type === 'x') {
        ctx.moveTo(startPoint, offsetPoint + aliasPixel);
        ctx.lineTo(endPoint, offsetPoint + aliasPixel);
      } else {
        ctx.moveTo(offsetPoint + aliasPixel + 1, startPoint);
        ctx.lineTo(offsetPoint + aliasPixel + 1, endPoint);
      }
      ctx.stroke();
      ctx.closePath();
    }

    if (steps === 0 || axisMin === null) {
      return;
    }

    const labelGap = (endPoint - startPoint) / steps;
    const ticks = [];
    let labelCenter = null;
    let linePosition = null;

    ctx.strokeStyle = this.gridLineColor;
    ctx.lineWidth = 1;
    aliasPixel = Util.aliasPixel(ctx.lineWidth);

    let labelText;
    for (let ix = 0; ix <= steps; ix++) {
      ctx.beginPath();
      ticks[ix] = axisMin + (ix * stepValue);

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.getLabelFormat(Math.min(axisMax, ticks[ix]));

      let labelPoint;

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelCenter, labelPoint);
        if (options?.selectItem?.showLabelTip && hitInfo?.label && !this.options?.horizontal) {
          const selectedLabel = this.getLabelFormat(
            Math.min(axisMax, hitInfo.label + (0 * stepValue)),
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
              backgroundColor: options?.selectItem?.labelTipStyle?.backgroundColor,
              textColor: options?.selectItem?.labelTipStyle?.textColor,
            });
          }
        }
        if (ix !== 0 && this.showGrid) {
          ctx.moveTo(linePosition, offsetPoint);
          ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelPoint, labelCenter);

        if (ix === steps) {
          linePosition += 1;
        }

        if (ix !== 0 && this.showGrid) {
          ctx.moveTo(offsetPoint, linePosition);
          ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }

      ctx.stroke();
      ctx.closePath();
    }

    // Draw plot line
    if (this.plotLines?.length) {
      const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
      const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
      const padding = aliasPixel + 1;
      const minX = aPos.x1 + padding;
      const maxX = aPos.x2;
      const minY = aPos.y1 + padding;
      const maxY = aPos.y2;

      this.plotLines.forEach((plotLine) => {
        if (!plotLine.value) {
          return;
        }

        const mergedPlotLineOpt = defaultsDeep({}, plotLine, PLOT_LINE_OPTION);
        const { value, label: labelOpt } = mergedPlotLineOpt;

        this.setPlotLineStyle(mergedPlotLineOpt);

        if (this.type === 'x') {
          const dataX = Canvas.calculateX(value, axisMin, axisMax, xArea, minX);
          this.drawXPlotLine(dataX, minX, maxX, minY, maxY, labelOpt);
        } else {
          const dataY = Canvas.calculateY(value, axisMin, axisMax, yArea, maxY);
          this.drawYPlotLine(dataY, minX, maxX, minY, maxY, labelOpt);
        }

        ctx.restore();
      });
    }
  }

  /**
   * Set plot line style
   * @param {object} plotLine      plotLine Options
   *
   * @returns {undefined}
   */
  setPlotLineStyle(plotLine) {
    const ctx = this.ctx;
    const { color, lineWidth } = plotLine;

    ctx.beginPath();
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    if (plotLine.segments) {
      ctx.setLineDash(plotLine.segments);
    }
  }

  /**
   * Draw X Plot line
   * @param {object} dataX         Data's X Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   * @param {object} labelOpt      plotLine Options
   *
   * @returns {undefined}
   */
  drawXPlotLine(dataX, minX, maxX, minY, maxY, labelOpt) {
    const ctx = this.ctx;

    if (!dataX || dataX < minX || dataX > maxX) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(dataX, maxY);
    ctx.lineTo(dataX, minY);

    ctx.stroke();
    ctx.restore();
    ctx.closePath();

    if (labelOpt) {
      const mergedLabelOpt = defaultsDeep({}, labelOpt, PLOT_LINE_LABEL_OPTION);

      ctx.save();
      ctx.beginPath();
      ctx.font = Util.getLabelStyle(mergedLabelOpt);

      const {
        fontSize,
        labelBoxPadding,
        labelHalfWidth,
      } = this.getLabelParameters(mergedLabelOpt);

      if (fontSize <= 0) {
        return;
      }

      let textX;
      switch (mergedLabelOpt.textAlign) {
        case 'left':
          textX = dataX - labelHalfWidth - labelBoxPadding;
          break;

        case 'right':
          textX = dataX + labelHalfWidth + labelBoxPadding;
          break;

        case 'center':
        default:
          textX = dataX;
          break;
      }

      const textY = minY - labelBoxPadding - fontSize;

      this.drawPlotLineLabel(mergedLabelOpt, {
        top: minY - (labelBoxPadding * 2) - fontSize,
        bottom: minY - labelBoxPadding,
        left: textX - labelHalfWidth - labelBoxPadding,
        right: textX + labelHalfWidth + labelBoxPadding,
        x: textX,
        y: textY,
      });
    }
  }

  /**
   * Draw Y Plot line
   * @param {object} dataY         Data's Y Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   * @param {object} labelOpt      plotLine Options
   *
   * @returns {undefined}
   */
  drawYPlotLine(dataY, minX, maxX, minY, maxY, labelOpt) {
    const ctx = this.ctx;

    if (!dataY || dataY > maxY || dataY < minY) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(minX, dataY);
    ctx.lineTo(maxX, dataY);

    ctx.stroke();
    ctx.restore();
    ctx.closePath();

    if (labelOpt) {
      const mergedLabelOpt = defaultsDeep({}, labelOpt, PLOT_LINE_LABEL_OPTION);

      ctx.save();
      ctx.beginPath();
      ctx.font = Util.getLabelStyle(mergedLabelOpt);

      const {
        fontSize,
        labelWidth,
        labelHalfHeight,
        labelBoxPadding,
      } = this.getLabelParameters(mergedLabelOpt);

      if (fontSize <= 0) {
        return;
      }

      let textY;
      switch (mergedLabelOpt.verticalAlign) {
        case 'top':
          textY = dataY - labelHalfHeight - labelBoxPadding;
          break;

        case 'bottom':
          textY = dataY + labelHalfHeight + labelBoxPadding;
          break;

        case 'middle':
        default:
          textY = dataY;
          break;
      }

      const textX = maxX + labelWidth + labelBoxPadding;

      this.drawPlotLineLabel(mergedLabelOpt, {
        top: textY - labelHalfHeight - labelBoxPadding,
        bottom: textY + labelHalfHeight + labelBoxPadding,
        left: textX - labelWidth - (labelBoxPadding / 2),
        right: textX + labelBoxPadding,
        x: textX,
        y: textY,
      });
    }
  }

  /**
   * Calculate Values for drawing label
   * @param {object} labelOpt      plotLine Options
   *
   * @returns {object}
   */
  getLabelParameters(labelOpt) {
    const ctx = this.ctx;
    const fontSize = labelOpt.fontSize > 20 ? 20 : labelOpt.fontSize;
    const labelBoxPadding = fontSize / 4;
    const labelWidth = ctx.measureText(labelOpt.text).width;
    const labelHalfWidth = labelWidth / 2;
    const labelHalfHeight = fontSize / 2;

    return {
      fontSize,
      labelBoxPadding,
      labelWidth,
      labelHalfWidth,
      labelHalfHeight,
    };
  }

  /**
   * Calculate Values for drawing label
   * @param {object} labelOpt      plot line Label Options
   * @param {object} positions     label positions
   *
   * @returns {undefined}
   */
  drawPlotLineLabel(labelOpt, positions) {
    const ctx = this.ctx;
    const { top, bottom, left, right, x, y } = positions;

    ctx.fillStyle = labelOpt.fillColor;
    ctx.strokeStyle = labelOpt.lineColor;
    ctx.lineWidth = labelOpt.lineWidth;
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.fill();

    if (labelOpt.lineWidth > 0) {
      ctx.stroke();
    }

    ctx.fillStyle = labelOpt.fontColor;
    ctx.fillText(labelOpt.text, x, y);
    ctx.closePath();
  }
}

export default Scale;
