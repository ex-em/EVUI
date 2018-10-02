import Axis from './axis';
import Util from '../core.util';

class AxisStepsScale extends Axis {
  calculateSteps(rangeInfo) {
    const maxSteps = rangeInfo.maxSteps;
    const minSteps = rangeInfo.minSteps;

    const graphMax = this.axisData[this.axisData.length - 1];
    const graphMin = this.axisData[0];
    const graphRange = this.axisData.length;

    let stepValue = 1;
    let numberOfSteps = Math.round(graphRange / stepValue);

    if (graphMax === 1) {
      stepValue = 1;
      numberOfSteps = 1;
    }

    while (numberOfSteps > maxSteps && !this.skipFitting) {
      stepValue *= 2;
      numberOfSteps = Math.round(graphRange / stepValue);

      if (numberOfSteps % 1 !== 0) {
        this.skipFitting = true;
      }
    }

    if (this.skipFitting) {
      numberOfSteps = minSteps;
      stepValue = graphRange / numberOfSteps;
    }

    this.steps = numberOfSteps;
    this.stepValue = stepValue;
    this.isStepValueFloat = false;
    this.axisMin = graphMin;
    this.axisMax = graphMax;
  }

  drawAxis() {
    if (this.steps === 0) {
      return;
    }

    const options = this.options;
    const startPoint = this.axisPosInfo[this.units.rectStart];
    const endPoint = this.axisPosInfo[this.units.rectEnd];
    const offsetPoint = this.axisPosInfo[this.units.rectOffset(options.position)];
    const offsetCounterPoint = this.axisPosInfo[this.units.rectOffsetCounter(options.position)];

    const labelType = options.labelType;

    if (this.units.pos === 'x') {
      this.ctx.textAlign = this.stepValue > 1 ? 'start' : 'center';
      this.ctx.textBaseline = options.position === 'top' ? 'bottom' : 'top';
    } else if (this.units.pos === 'y') {
      this.ctx.textAlign = options.position === 'left' ? 'right' : 'left';
      this.ctx.textBaseline = 'middle';
    }
    this.ctx.fillStyle = options.labelStyle.color;
    this.ctx.font = Util.getLabelStyle(options);


    let labelPos;

    const labelCount = labelType === 'category' ? this.axisData.length : this.axisData.length - 1;
    const labelGap = (endPoint - startPoint) / labelCount;

    if (labelType === 'category') {
      labelPos = this.stepValue > 1 ? 0 : labelGap / 2;
    } else {
      labelPos = 0;
    }

    let labelCenter = null;
    let linePosition = null;

    this.ticks = [];

    if (options.ticks === null) {
      options.ticks = [];
    } else {
      options.ticks.length = 0;
    }

    // grid 그리기
    this.ctx.lineWidth = 1;
    const aliasPixel = Util.aliasPixel(this.ctx.lineWidth);

    // Axis Line
    this.ctx.beginPath();
    this.ctx.strokeStyle = options.axisLineColor;
    if (this.units.pos === 'x') {
      this.ctx.moveTo(startPoint, offsetPoint + aliasPixel);
      this.ctx.lineTo(endPoint, offsetPoint + aliasPixel);
    } else {
      this.ctx.moveTo(offsetPoint + aliasPixel, startPoint);
      this.ctx.lineTo(offsetPoint + aliasPixel, endPoint);
    }
    this.ctx.stroke();

    // Grid
    this.ctx.beginPath();
    this.ctx.strokeStyle = options.gridLineColor;

    let labelText;

    for (let ix = 0, ixLen = labelType === 'category' ? labelCount - 1 : labelCount; ix <= ixLen; ix++) {
      if (this.axisData[ix]) {
        options.ticks[ix] = this.axisData[ix];
      } else {
        options.ticks[ix] = '';
      }

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.labelFormat(options.ticks[ix]);

      let labelPoint;
      if (this.units.pos === 'x') {
        if (ix % this.stepValue === 0 || ix === ixLen) {
          labelPoint = options.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
          this.ctx.fillText(labelText, labelCenter + labelPos, labelPoint);

          if (this.options.showGrid) {
            this.ctx.moveTo(linePosition, offsetPoint);
            this.ctx.lineTo(linePosition, offsetCounterPoint);
          }
        }
      } else if (this.units.pos === 'y') {
        if (ix % this.stepValue === 0 || ix === ixLen) {
          labelPoint = options.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
          this.ctx.fillText(labelText, labelPoint, labelCenter + labelPos);

          if (ix !== 0 && this.options.showGrid) {
            this.ctx.moveTo(offsetPoint, linePosition);
            this.ctx.lineTo(offsetCounterPoint, linePosition);
          }
        }
      }
    }

    this.ctx.stroke();
  }
}

export default AxisStepsScale;
