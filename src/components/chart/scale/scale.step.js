import moment from 'moment';
import Scale from './scale';
import Util from '../helpers/helpers.util';

class StepScale extends Scale {
  constructor(type, opt, ctx, labels) {
    super(type, opt, ctx);
    this.integratedLabels = labels;
  }

  calculateScaleRange(minMax) {
    const stepMinMax = this.timeMode ? minMax : Util.getStringMinMax(this.integratedLabels);
    const maxValue = stepMinMax.max;
    const minValue = stepMinMax.min;

    return {
      min: minValue,
      max: maxValue,
      minLabel: this.getLabelFormat(minValue),
      maxLabel: this.getLabelFormat(maxValue),
      size: Util.calcTextSize(this.getLabelFormat(maxValue), Util.getLabelStyle(this.labelStyle)),
    };
  }

  calculateSteps(range) {
    const labels = this.integratedLabels;
    const maxSteps = range.maxSteps;

    let interval = 1;
    let numberOfSteps;

    const graphRange = labels.length;

    numberOfSteps = Math.round(graphRange / interval);

    while (numberOfSteps > maxSteps) {
      interval *= 2;
      numberOfSteps = Math.round(graphRange / interval);
    }

    return {
      steps: numberOfSteps,
      interval,
      graphMin: range.minValue,
      graphMax: range.maxValue,
    };
  }

  draw(chartRect, labelOffset, stepInfo) {
    const ctx = this.ctx;
    const labels = this.integratedLabels;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const steps = stepInfo.steps;
    const interval = stepInfo.interval;

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];

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
    let prevIndex = 0;

    labels.reduce((prev, curr, index) => {
      labelCenter = Math.round(startPoint + (labelGap * index));
      linePosition = labelCenter + aliasPixel;
      labelText = this.getLabelFormat(curr);

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        if (this.timeMode) {
          if (prev.label !== labelText && (index === 0 || index - prev.index > interval)) {
            prevIndex = index;
            ctx.fillText(labelText, labelCenter + (labelGap / 2), labelPoint);
          }
        } else {
          ctx.fillText(labelText, labelCenter + (labelGap / 2), labelPoint);
        }

        if (index > 0 && this.showGrid) {
          ctx.moveTo(linePosition, offsetPoint);
          ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        if (this.timeMode) {
          if (prev.label !== labelText && (index === 0 || index - prev.index > interval)) {
            prevIndex = index;
            ctx.fillText(labelText, labelPoint, labelCenter + (labelGap / 2));
          }
        } else {
          ctx.fillText(labelText, labelPoint, labelCenter + (labelGap / 2));
        }

        if (index > 0 && this.showGrid) {
          ctx.moveTo(offsetPoint, linePosition);
          ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }
      ctx.stroke();

      return { label: labelText, index: prevIndex };
    }, { label: '', index: prevIndex });

    ctx.closePath();
  }

  getLabelFormat(value) {
    if (this.timeMode) {
      return moment(new Date(value)).format(this.timeFormat);
    }
    return value;
  }
}

export default StepScale;
