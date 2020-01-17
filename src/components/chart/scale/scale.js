import { merge } from 'lodash-es';
import { AXIS_OPTION, AXIS_UNITS } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';

class Scale {
  constructor(type, opt, ctx) {
    const merged = merge({}, AXIS_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    this.type = type;
    this.ctx = ctx;
    this.units = AXIS_UNITS[this.type];

    if (!this.position) {
      this.position = type === 'x' ? 'bottom' : 'left';
    }
  }

  calculateLabelRange(type, chartRect, labelOffset, tickSize) {
    let chartSize;
    let axisOffset;
    let bufferedTickSize;

    if (type === 'x') {
      chartSize = chartRect.chartWidth;
      bufferedTickSize = Math.floor(tickSize * 1.2);
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

  calculateScaleRange(minMax) {
    let maxValue;
    let minValue;

    if (this.range && this.range.length === 2) {
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

  calculateSteps(range) {
    const maxValue = range.maxValue;
    const minValue = range.minValue;
    const maxSteps = range.maxSteps;

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
      interval = 0.2;
      numberOfSteps = 5;
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

  draw(chartRect, labelOffset, stepInfo) {
    const ctx = this.ctx;
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

    ctx.beginPath();
    ctx.strokeStyle = this.gridLineColor;
    ctx.lineWidth = 1;
    aliasPixel = Util.aliasPixel(ctx.lineWidth);

    let labelText;
    for (let ix = 0; ix <= steps; ix++) {
      ticks[ix] = axisMin + (ix * stepValue);

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel + (!ix ? 0 : -1);
      linePosition += Util.aliasPixel(linePosition);
      labelText = this.getLabelFormat(Math.min(axisMax, ticks[ix]));

      let labelPoint;

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelCenter, labelPoint);

        if (this.showIndicator) {
          ctx.moveTo(linePosition, offsetPoint + 6);
          ctx.lineTo(linePosition, offsetPoint);
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

        if (this.showIndicator) {
          ctx.moveTo(offsetPoint - 6, linePosition);
          ctx.lineTo(offsetPoint, linePosition);
        }

        if (ix !== 0 && this.showGrid) {
          ctx.moveTo(offsetPoint, linePosition);
          ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }

      ctx.stroke();
    }

    ctx.closePath();
  }
}

export default Scale;
