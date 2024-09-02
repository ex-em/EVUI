import { defaultsDeep } from 'lodash-es';
import { PLOT_BAND_OPTION, PLOT_LINE_OPTION } from '@/components/chart/helpers/helpers.constant';
import Scale from './scale';
import Util from '../helpers/helpers.util';
import { truthyNumber } from '../../../common/utils';

class StepScale extends Scale {
  constructor(type, axisOpt, ctx, labels, options) {
    super(type, axisOpt, ctx, options);
    this.labels = labels;
  }

  /**
   * Calculate min/max value, label and size information for step scale
   * @param {object} minMax       min/max information (unused on step scale)
   * @param {object} scrollbarOpt    scroll bar option
   * @param {object} chartRect    chart size information
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax, scrollbarOpt, chartRect) {
    const stepMinMax = this.labelStyle.alignToGridLine
      ? minMax : Util.getStringMinMax(this.labels);
    let maxValue = stepMinMax.max;
    let minValue = stepMinMax.min;

    let minIndex = 0;
    let maxIndex = this.labels.length - 1;
    let labelCount = this.labels.length;

    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    if (range?.length) {
      const [min, max] = range;
      if (truthyNumber(min) && truthyNumber(max)) {
        minIndex = min < minIndex ? minIndex : min;
        maxIndex = max > maxIndex ? maxIndex : max;
        maxValue = this.labels[maxIndex];
        minValue = this.labels[minIndex];
        labelCount = maxIndex - minIndex + 1;
      }
    }

    const maxWidth = chartRect.chartWidth / (labelCount + 2);

    return {
      min: minValue,
      max: maxValue,
      minIndex,
      maxIndex,
      minLabel: this.getLabelFormat(minValue, maxWidth),
      maxLabel: this.getLabelFormat(maxValue, maxWidth),
      size: Util.calcTextSize(
        this.getLabelFormat(maxValue, maxWidth),
        Util.getLabelStyle(this.labelStyle),
      ),
    };
  }

  /**
   * With range information, calculate how many labels in axis
   * @param {object}  range          min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const {
      minValue,
      maxValue,
      minIndex,
      maxIndex,
      maxSteps,
    } = range;

    let numberOfSteps = (maxIndex - minIndex) + 1;
    let interval = 1;

    const oriSteps = numberOfSteps;
    const isNumbersArray = this.labels.every(label => !isNaN(label));
    if (this.labelStyle.alignToGridLine && isNumbersArray) {
      if (maxSteps > 2) {
        while (numberOfSteps > maxSteps * 2) {
          interval *= 2;
          numberOfSteps = Math.round(numberOfSteps / interval);
        }
      } else {
        interval = oriSteps;
      }
    }

    return {
      oriSteps,
      steps: numberOfSteps,
      interval,
      graphMin: minValue,
      graphMax: maxValue,
      minIndex,
      maxIndex,
    };
  }

  /**
   * Draw axis
   * @param {object} chartRect  min/max information
   * @param {object} labelOffset  label offset information
   * @param {object} stepInfo  label steps information
   * @param {object} hitInfo  legend Hit Info
   * @param {object} selectedLabelInfo Selected Label Info
   *
   * @returns {undefined}
   */
  draw(chartRect, labelOffset, stepInfo, hitInfo, selectedLabelInfo) {
    const ctx = this.ctx;
    const labels = this.labels;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const steps = stepInfo.steps;
    const count = stepInfo.interval;
    const startIndex = stepInfo.minIndex;

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];
    const maxWidth = chartRect.chartWidth / (steps + 2);

    this.drawAxisTitle(chartRect, labelOffset);

    if (this.labelStyle?.show) {
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

      if (steps === 0) {
        return;
      }

      const labelGap = (endPoint - startPoint) / steps;
      const alignToGridLine = this.labelStyle.alignToGridLine;
      let labelCenter = null;
      let linePosition = null;

      ctx.beginPath();
      ctx.strokeStyle = this.gridLineColor;

      let labelText;
      let labelPoint;
      let index;

      for (index = 0; index < steps; index += count) {
        const labelIndex = startIndex + index;
        const item = this.labels[labelIndex];
        labelCenter = Math.round(startPoint + (labelGap * index));
        linePosition = labelCenter + aliasPixel;
        labelText = this.getLabelFormat(item, maxWidth);

        const {
          selectLabel: selectLabelOpt,
          selectItem: selectItemOpt,
          horizontal,
        } = this.options;

        let targetAxis;
        if (selectedLabelInfo?.targetAxis) {
          targetAxis = selectedLabelInfo?.targetAxis === 'yAxis' ? 'y' : 'x';
        } else {
          targetAxis = horizontal ? 'y' : 'x';
        }

        const isBlurredLabel = selectLabelOpt?.use
          && selectLabelOpt?.useLabelOpacity
          && targetAxis === this.type
          && selectedLabelInfo?.dataIndex?.length
          && !selectedLabelInfo?.dataIndex?.includes(labelIndex);

        const labelColor = this.labelStyle.color;
        let defaultOpacity = 1;

        if (Util.getColorStringType(labelColor) === 'RGBA') {
          defaultOpacity = Util.getOpacity(labelColor);
        }

        ctx.fillStyle = Util.colorStringToRgba(labelColor, isBlurredLabel ? 0.1 : defaultOpacity);

        if (this.type === 'x') {
          labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
          const xPoint = alignToGridLine ? labelCenter : labelCenter + (labelGap / 2);
          ctx.fillText(labelText, xPoint, labelPoint);

          if (!isBlurredLabel
            && selectItemOpt?.showLabelTip
            && hitInfo?.label
            && !horizontal) {
            const selectedLabel = hitInfo.label;
            if (selectedLabel === labelText) {
              const height = Math.round(ctx.measureText(this.labelStyle?.fontSize).width);
              Util.showLabelTip({
                ctx: this.ctx,
                width: Math.round(ctx.measureText(selectedLabel).width) + 10,
                height,
                x: labelCenter + (labelGap / 2),
                y: labelPoint + (height - 2),
                borderRadius: 2,
                arrowSize: 3,
                text: labelText,
                backgroundColor: selectItemOpt?.labelTipStyle?.backgroundColor,
                textColor: selectItemOpt?.labelTipStyle?.textColor,
              });
            }
          }

          if (index > 0 && this.showGrid) {
            ctx.moveTo(linePosition, offsetPoint);
            ctx.lineTo(linePosition, offsetCounterPoint);
          }
        } else {
          labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
          const yPoint = alignToGridLine ? labelCenter : labelCenter + (labelGap / 2);
          ctx.fillText(labelText, labelPoint, yPoint);

          if (index > 0 && this.showGrid) {
            ctx.moveTo(offsetPoint, linePosition);
            ctx.lineTo(offsetCounterPoint, linePosition);
          }
        }
        ctx.stroke();
      }

      if (alignToGridLine && (index === this.labels.length)) {
        let labelLastText = +labels[labels.length - 1] + (+labels[1] - +labels[0]);
        if (isNaN(labelLastText)) {
          labelLastText = 'Max';
        }
        labelCenter = Math.round(startPoint + (labelGap * labels.length));
        linePosition = labelCenter + aliasPixel;

        if (this.type === 'x') {
          ctx.fillText(labelLastText, labelCenter, labelPoint);
          if (this.showGrid) {
            ctx.moveTo(linePosition, offsetPoint);
            ctx.lineTo(linePosition, offsetCounterPoint);
          }
        } else {
          ctx.fillText(labelLastText, labelPoint, labelCenter);
          if (this.showGrid) {
            ctx.moveTo(offsetPoint, linePosition);
            ctx.lineTo(offsetCounterPoint, linePosition);
          }
        }
        ctx.stroke();
      }

      ctx.closePath();
    }

    // draw plot lines and plot bands
    if (this.plotBands?.length || this.plotLines?.length) {
      const padding = Util.aliasPixel(ctx.lineWidth) + 1;
      const minX = aPos.x1 + padding;
      const maxX = aPos.x2;
      const minY = aPos.y1 + padding;
      const maxY = aPos.y2;
      const labelGap = (endPoint - startPoint) / (this.labelStyle.show ? labels.length : 1);

      this.plotBands?.forEach((plotBand) => {
        if (!plotBand.from && !plotBand.to) {
          return;
        }

        const mergedPlotBandOpt = defaultsDeep({}, plotBand, PLOT_BAND_OPTION);
        const { from = 0, to = labels.length, label: labelOpt } = mergedPlotBandOpt;
        const fromPos = Math.round(startPoint + (labelGap * from));
        const toPos = Math.round(startPoint + (labelGap * to));

        this.setPlotBandStyle(mergedPlotBandOpt);

        if (this.type === 'x') {
          this.drawXPlotBand(fromPos, toPos, minX, maxX, minY, maxY);
        } else {
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
        const dataPos = Math.round(startPoint + (labelGap * value)) + (labelGap / 2);

        this.setPlotLineStyle(mergedPlotLineOpt);

        if (this.type === 'x') {
          this.drawXPlotLine(dataPos, minX, maxX, minY, maxY);
        } else {
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
   * Transforming label by designated format
   * @param {string} value       label value
   * @param {number} maxWidth    max width for each label
   * @param {object} data        data for formatting
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value, maxWidth, data = {}) {
    if (this.formatter) {
      const formattedLabel = this.formatter(value, data);

      if (typeof formattedLabel === 'string') {
        return formattedLabel;
      }
    }

    return this.labelStyle.fitWidth ? this.fittingString(value, maxWidth) : value;
  }

  /**
   * Transforming ellipsis label by designated format and specific width
   * @param {string} value       label value
   * @param {number} maxWidth    max width for each label
   *
   * @returns {string} formatted label
   */
  fittingString(value, maxWidth) {
    const ctx = this.ctx;

    ctx.save();
    ctx.font = Util.getLabelStyle(this.labelStyle);
    const dir = this.labelStyle.fitDir;

    return Util.truncateLabelWithEllipsis(value, maxWidth, ctx, dir);
  }
}

export default StepScale;
