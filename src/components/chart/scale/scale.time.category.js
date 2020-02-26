import moment from 'moment';
import { TIME_INTERVALS } from '../helpers/helpers.constant';
import Scale from './scale';
import Util from '../helpers/helpers.util';

class TimeCategoryScale extends Scale {
  getLabelFormat(value) {
    return moment(value).format(this.timeFormat);
  }

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

  calculateSteps(range) {
    const { maxValue, minValue, maxSteps } = range;
    const rawInterval = this.getInterval(range);

    let count = 1;
    let interval = rawInterval;
    let increase = minValue;
    let numberOfSteps;

    while (increase < maxValue) {
      increase += interval;
    }

    const graphMax = increase > maxValue ? maxValue : increase;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    numberOfSteps = Math.round(graphRange / interval);
    const oriSteps = numberOfSteps;

    if (maxValue === 1) {
      interval = 0.2;
      numberOfSteps = 5;
    }

    while (numberOfSteps > maxSteps) {
      interval *= 2;
      count *= 2;
      numberOfSteps = Math.round(graphRange / interval);
    }

    return {
      steps: numberOfSteps,
      oriSteps,
      interval,
      rawInterval,
      graphMin,
      graphMax,
      count,
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
    const stepValue = stepInfo.rawInterval;
    const oriSteps = stepInfo.oriSteps + 1;
    const count = stepInfo.count;

    let startPoint = aPos[this.units.rectStart];
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
    ctx.closePath();

    if (steps === 0 || axisMin === null) {
      return;
    }

    const graphGap = (endPoint - startPoint) / oriSteps;
    if (this.categoryMode) {
      startPoint += Math.ceil(graphGap / 2) - 2;
    }

    const ticks = [];
    let labelCenter = null;
    let linePosition = null;

    ctx.beginPath();
    ctx.strokeStyle = this.gridLineColor;

    let labelText;
    for (let ix = 0; ix < oriSteps; ix += count) {
      ticks[ix] = axisMin + (ix * stepValue);

      labelCenter = Math.round(startPoint + (graphGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.getLabelFormat(Math.min(axisMax, ticks[ix]));

      let labelPoint;

      if (this.type === 'x') {
        labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelCenter, labelPoint);

        if ((ix !== 0 && ix < oriSteps && this.showGrid)) {
          ctx.moveTo(linePosition, offsetPoint);
          ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        ctx.fillText(labelText, labelPoint, labelCenter);

        if ((ix !== 0 && ix < oriSteps && this.showGrid)) {
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
