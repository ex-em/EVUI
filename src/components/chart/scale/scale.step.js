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
  draw(chartRect, labelOffset, stepInfo, hitInfo) {
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

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelCenter + (labelGap / 2), labelPoint);
        if (this.options?.selectItem?.showLabelTip && hitInfo?.label && !this.options?.horizontal) {
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

  /**
   * Transforming label by designated format
   * @param {string} value       label value
   * @param {number} maxWidth    max width for each label
   *
   * @returns {string} formatted label
   */
  getLabelFormat(value, maxWidth) {
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
