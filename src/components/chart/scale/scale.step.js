import Scale from './scale';
import Util from '../helpers/helpers.util';

class StepScale extends Scale {
  constructor(type, opt, ctx, labels) {
    super(type, opt, ctx);
    this.labels = labels;
  }

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

  calculateSteps(range) {
    return {
      steps: this.labels.length,
      interval: 1,
      graphMin: range.minValue,
      graphMax: range.maxValue,
    };
  }

  draw(chartRect, labelOffset, stepInfo) {
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

  getLabelFormat(value, maxWidth) {
    return this.labelStyle.fitWidth ? this.fittingString(value, maxWidth) : value;
  }

  fittingString(value, maxWidth) {
    if (!value) {
      return '';
    }

    const ctx = this.ctx;

    ctx.save();
    ctx.font = Util.getLabelStyle(this.labelStyle);
    const dir = this.labelStyle.fitDir;

    const ellipsis = '…';
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    let str = value;
    let width = ctx.measureText(str).width;

    if (width <= maxWidth || width <= ellipsisWidth) {
      return str;
    }

    let len = str.length;
    while (width >= maxWidth - ellipsisWidth && len-- > 0) {
      str = dir === 'right' ? str.substring(0, len) : str.substring(1, str.length);
      width = ctx.measureText(str).width;
    }

    return dir === 'right' ? str + ellipsis : ellipsis + str;
  }
}

export default StepScale;
