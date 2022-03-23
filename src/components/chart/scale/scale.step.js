import { defaultsDeep } from 'lodash-es';
import { PLOT_BAND_OPTION, PLOT_LINE_OPTION } from '@/components/chart/helpers/helpers.constant';
import Scale from './scale';
import Util from '../helpers/helpers.util';

class StepScale extends Scale {
  constructor(type, opt, ctx, labels, options) {
    super(type, opt, ctx, options);
    this.labels = labels;
  }

  /**
   * Calculate min/max value, label and size information for step scale
   * @param {object} minMax       min/max information (unused on step scale)
   * @param {object} chartRect    chart size information
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax, chartRect) {
    const stepMinMax = Util.getStringMinMax(this.labels);
    const maxValue = stepMinMax.max;
    const minValue = stepMinMax.min;
    const maxWidth = chartRect.chartWidth / (this.labels.length + 2);

    return {
      min: minValue,
      max: maxValue,
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
    return {
      steps: this.labels.length,
      interval: 1,
      graphMin: range.minValue,
      graphMax: range.maxValue,
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

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];
    const maxWidth = chartRect.chartWidth / (this.labels.length + 2);

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
      ctx.lineWidth = 1;
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

      const labelGap = (endPoint - startPoint) / labels.length;
      let labelCenter = null;
      let linePosition = null;

      ctx.beginPath();
      ctx.strokeStyle = this.gridLineColor;

      let labelText;
      let labelPoint;

      labels.forEach((item, index) => {
        labelCenter = Math.round(startPoint + (labelGap * index));
        linePosition = labelCenter + aliasPixel;
        labelText = this.getLabelFormat(item, maxWidth);

        const isBlurredLabel = this.options?.selectLabel?.use
          && this.options?.selectLabel?.useLabelOpacity
          && (this.options.horizontal === (this.type === 'y'))
          && selectLabelInfo?.dataIndex?.length
          && !selectLabelInfo?.dataIndex?.includes(index);
        ctx.fillStyle = Util.colorStringToRgba(this.labelStyle.color, isBlurredLabel ? 0.1 : 1);

        if (this.type === 'x') {
          labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
          ctx.fillText(labelText, labelCenter + (labelGap / 2), labelPoint);

          if (!isBlurredLabel
              && this.options?.selectItem?.showLabelTip
              && hitInfo?.label
              && !this.options?.horizontal) {
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
                backgroundColor: this.options?.selectItem?.labelTipStyle?.backgroundColor,
                textColor: this.options?.selectItem?.labelTipStyle?.textColor,
              });
            }
          }

          if (index > 0 && this.showGrid) {
            ctx.moveTo(linePosition, offsetPoint);
            ctx.lineTo(linePosition, offsetCounterPoint);
          }
        } else {
          labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
          ctx.fillText(labelText, labelPoint, labelCenter + (labelGap / 2));

          if (index > 0 && this.showGrid) {
            ctx.moveTo(offsetPoint, linePosition);
            ctx.lineTo(offsetCounterPoint, linePosition);
          }
        }
        ctx.stroke();
      });

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
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value, maxWidth) {
    if (this.formatter) {
      const formattedLabel = this.formatter(value);

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
