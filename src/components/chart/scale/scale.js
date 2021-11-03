import Canvas from '@/components/chart/helpers/helpers.canvas';
import { defaultsDeep } from 'lodash-es';
import {
  AXIS_OPTION,
  AXIS_UNITS,
  PLOT_LINE_OPTION,
  PLOT_LINE_LABEL_OPTION,
  PLOT_BAND_OPTION,
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

    // Draw plot lines and plot bands
    if (this.plotBands?.length || this.plotLines?.length) {
      const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
      const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
      const padding = aliasPixel + 1;
      const minX = aPos.x1 + padding;
      const maxX = aPos.x2;
      const minY = aPos.y1 + padding; // top
      const maxY = aPos.y2; // bottom

      this.plotBands?.forEach((plotBand) => {
        if (!plotBand.from && !plotBand.to) {
          return;
        }

        const mergedPlotBandOpt = defaultsDeep({}, plotBand, PLOT_BAND_OPTION);
        const { from, to, label: labelOpt } = mergedPlotBandOpt;

        this.setPlotBandStyle(mergedPlotBandOpt);

        let fromPos;
        let toPos;
        if (this.type === 'x') {
          fromPos = Canvas.calculateX(from ?? minX, axisMin, axisMax, xArea, minX);
          toPos = Canvas.calculateX(to ?? maxX, axisMin, axisMax, xArea, minX);
          this.drawXPlotBand(fromPos, toPos, minX, maxX, minY, maxY);
        } else {
          fromPos = Canvas.calculateY(from ?? axisMin, axisMin, axisMax, yArea, maxY);
          toPos = Canvas.calculateY(to ?? axisMax, axisMin, axisMax, yArea, maxY);
          this.drawYPlotBand(fromPos, toPos, minX, maxX, minY, maxY);
        }

        if (labelOpt.show) {
          const labelOptions = this.getNormalizedLabelOptions(chartRect, labelOpt);
          const textXY = this.getPlotBandLabelPosition(fromPos, toPos, labelOptions, maxX, minY);
          this.drawPlotLabel(labelOptions, textXY);
        }

        ctx.restore();
      });

      this.plotLines?.forEach((plotLine) => {
        if (!plotLine.value) {
          return;
        }

        const mergedPlotLineOpt = defaultsDeep({}, plotLine, PLOT_LINE_OPTION);
        const { value, label: labelOpt } = mergedPlotLineOpt;

        this.setPlotLineStyle(mergedPlotLineOpt);

        let dataPos;
        if (this.type === 'x') {
          dataPos = Canvas.calculateX(value, axisMin, axisMax, xArea, minX);
          this.drawXPlotLine(dataPos, minX, maxX, minY, maxY);
        } else {
          dataPos = Canvas.calculateY(value, axisMin, axisMax, yArea, maxY);
          this.drawYPlotLine(dataPos, minX, maxX, minY, maxY);
        }

        if (labelOpt.show) {
          const labelOptions = this.getNormalizedLabelOptions(chartRect, labelOpt);
          const textXY = this.getPlotLineLabelPosition(dataPos, labelOptions, maxX, minY);
          this.drawPlotLabel(labelOptions, textXY);
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
   * Set plot band style
   * @param {object} plotBand      plotBand Options
   *
   * @returns {undefined}
   */
  setPlotBandStyle(plotBand) {
    const ctx = this.ctx;
    const { color } = plotBand;

    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = color;
  }

  /**
   * Draw X Plot band
   * @param {number} fromDataX     From data's X Position
   * @param {number} toDataX       To data's X Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawXPlotBand(fromDataX, toDataX, minX, maxX, minY, maxY) {
    const ctx = this.ctx;

    const checkValidPosition = x => x || x > minX || x < maxX;

    if (!checkValidPosition(fromDataX) || !checkValidPosition(toDataX)) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(fromDataX, minY);
    ctx.lineTo(fromDataX, maxY);
    ctx.lineTo(toDataX, maxY);
    ctx.lineTo(toDataX, minY);
    ctx.lineTo(fromDataX, minY);

    ctx.stroke();
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * Draw X Plot line
   * @param {object} dataX         Data's X Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawXPlotLine(dataX, minX, maxX, minY, maxY) {
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
  }

  /**
   * Draw Y Plot line
   * @param {object} dataY         Data's Y Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawYPlotLine(dataY, minX, maxX, minY, maxY) {
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
  }

  /**
   * Draw Y Plot band
   * @param {number} fromDataY     From data's Y Position (bottom)
   * @param {number} toDataY       To data's Y Position (top)
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawYPlotBand(fromDataY, toDataY, minX, maxX, minY, maxY) {
    const ctx = this.ctx;

    const checkValidPosition = y => y || y > minY || y < maxY;

    if (!checkValidPosition(fromDataY) || !checkValidPosition(toDataY)) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(minX, fromDataY);
    ctx.lineTo(minX, toDataY);
    ctx.lineTo(maxX, toDataY);
    ctx.lineTo(maxX, fromDataY);
    ctx.lineTo(minX, fromDataY);

    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * get normalized options for plot label
   * @param {object} chartRect     chartRect
   * @param {object} labelOpt      plotLine Options
   *
   * @returns {object}
   */
  getNormalizedLabelOptions(chartRect, labelOpt) {
    const mergedLabelOpt = defaultsDeep({}, labelOpt, PLOT_LINE_LABEL_OPTION);

    const ctx = this.ctx;
    const { maxWidth } = mergedLabelOpt;
    const fontSize = mergedLabelOpt.fontSize > 20 ? 20 : mergedLabelOpt.fontSize;
    let label = mergedLabelOpt.text;
    let labelWidth = maxWidth ?? ctx.measureText(label).width;

    const plotLabelAreaWidth = this.type === 'y'
      ? chartRect.width - chartRect.chartWidth
      : maxWidth ?? chartRect.width;

    if (plotLabelAreaWidth < ctx.measureText(label).width && mergedLabelOpt.textOverflow === 'ellipsis') {
      label = Util.truncateLabelWithEllipsis(mergedLabelOpt.text, plotLabelAreaWidth, ctx);
      labelWidth = ctx.measureText(label).width;
    }

    return {
      label,
      fontSize,
      labelWidth,
      labelBoxPadding: fontSize / 4,
      labelHalfWidth: labelWidth / 2,
      labelHalfHeight: fontSize / 2,
      ...mergedLabelOpt,
    };
  }

  /**
   * Calculate position of plot band's label
   * @param {object} fromPos       from data position
   * @param {object} toPos         to data position
   * @param {object} labelOpt      label options
   * @param {object} maxX          max x position
   * @param {object} minY          min y position
   *
   * @returns {object}
   */
  getPlotBandLabelPosition(fromPos, toPos, labelOpt, maxX, minY) {
    const {
      fontSize,
      labelWidth,
      labelHalfWidth,
      labelHalfHeight,
      labelBoxPadding,
      textAlign,
      verticalAlign,
    } = labelOpt;

    if (fontSize <= 0) {
      return { textX: 0, textY: 0 };
    }

    let textX;
    let textY;

    if (this.type === 'x') {
      textY = minY - labelBoxPadding - fontSize;

      switch (textAlign) {
        case 'left':
          textX = fromPos + labelHalfWidth + labelBoxPadding;
          break;

        case 'right':
          textX = toPos - labelHalfWidth - labelBoxPadding;
          break;

        case 'center':
        default:
          textX = ((toPos - fromPos) / 2) + fromPos;
          break;
      }
    } else {
      textX = maxX + labelWidth + labelBoxPadding;

      switch (verticalAlign) {
        case 'top':
          textY = toPos + labelHalfHeight + labelBoxPadding;
          break;

        case 'bottom':
          textY = fromPos - labelHalfHeight - labelBoxPadding;
          break;

        case 'middle':
        default:
          textY = ((fromPos - toPos) / 2) + toPos;
          break;
      }
    }

    return { textX, textY };
  }

  /**
   * Calculate position of plot line's label
   * @param {object} dataPos       data position
   * @param {object} labelOpt      label options
   * @param {object} maxX          max x position
   * @param {object} minY          min y position
   *
   * @returns {undefined}
   */
  getPlotLineLabelPosition(dataPos, labelOpt, maxX, minY) {
    const {
      fontSize,
      labelWidth,
      labelHalfWidth,
      labelHalfHeight,
      labelBoxPadding,
    } = labelOpt;

    if (fontSize <= 0) {
      return { textX: 0, textY: 0 };
    }

    let textX;
    let textY;

    if (this.type === 'x') {
      textY = minY - labelBoxPadding - fontSize;

      switch (labelOpt.textAlign) {
        case 'left':
          textX = dataPos - labelHalfWidth - labelBoxPadding;
          break;

        case 'right':
          textX = dataPos + labelHalfWidth + labelBoxPadding;
          break;

        case 'center':
        default:
          textX = dataPos;
          break;
      }
    } else {
      textX = maxX + labelWidth + labelBoxPadding;

      switch (labelOpt.verticalAlign) {
        case 'top':
          textY = dataPos - labelHalfHeight - labelBoxPadding;
          break;

        case 'bottom':
          textY = dataPos + labelHalfHeight + labelBoxPadding;
          break;

        case 'middle':
        default:
          textY = dataPos;
          break;
      }
    }

    return { textX, textY };
  }

  /**
   * Calculate Values for drawing label
   * @param {object} labelOptions  plot line Label Options
   * @param {object} positions     x, y Position
   *
   * @returns {undefined}
   */
  drawPlotLabel(labelOptions, positions) {
    if (!positions) {
      return;
    }

    const { textX, textY } = positions;
    const {
      label,
      fontSize,
      fontColor,
      fillColor,
      lineColor,
      lineWidth,
      labelBoxPadding,
      labelWidth,
      labelHalfWidth,
      labelHalfHeight,
    } = labelOptions;

    if (fontSize <= 0) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.font = Util.getLabelStyle(labelOptions);

    let top = 0;
    let bottom = 0;
    let left = 0;
    let right = 0;

    if (this.type === 'x') {
      top = textY - labelBoxPadding;
      bottom = textY + fontSize;
      left = textX - labelHalfWidth - labelBoxPadding;
      right = textX + labelHalfWidth + labelBoxPadding;
    } else {
      top = textY - labelHalfHeight - labelBoxPadding;
      bottom = textY + labelHalfHeight + labelBoxPadding;
      left = textX - labelWidth;
      right = textX + labelBoxPadding;
    }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.fill();

    if (lineWidth > 0) {
      ctx.stroke();
    }

    ctx.fillStyle = fontColor;

    ctx.fillText(label, textX, textY);
    ctx.closePath();
  }
}

export default Scale;
