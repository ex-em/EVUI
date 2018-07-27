import Axis from './axis';
import Util from '../core.util';

class AxisStepsScale extends Axis {
  calculateRange() {
    // init variable
    const options = this.options;
    const chartRect = this.chartRect;
    const dataStore = this.dataStore;

    const maxLabelInfo = dataStore.getLabelTextMaxInfo();
    // 실제 Axis가 그려질 영역
    const chartSize = this.units.pos === 'x' ? chartRect.chartWidth : chartRect.chartHeight;
    this.axisPosInfo = {
      x1: chartRect.x1 + this.labelOffset.left,
      x2: chartRect.x2 - this.labelOffset.right,
      y1: chartRect.y1 + this.labelOffset.top,
      y2: chartRect.y2 - this.labelOffset.bottom,
    };

    let currentLabelOffset;
    if (this.units.pos === 'x') {
      currentLabelOffset = [this.labelOffset.left, this.labelOffset.right];
    } else {
      currentLabelOffset = [this.labelOffset.top, this.labelOffset.bottom];
    }
    const drawRange = chartSize - (currentLabelOffset[0] + currentLabelOffset[1]);

    let tickSize;
    if (this.units.pos === 'x') {
      // tickSize는 실제 step을 구하기 위해 각 축의 Label중 가장 큰 값을 기준으로 Size를 구한다.
      tickSize = this.ctx.measureText(this.labelFormat(maxLabelInfo.xText)).width + 20;
    } else {
      // Y축의 경우 글자의 높이로 전체 영역을 나누기 위함.
      tickSize = options.labelStyle.fontSize * 2;
    }

    const minSteps = 2;
    const maxSteps = Math.floor(drawRange / tickSize);

    this.skipFitting = minSteps >= maxSteps;

    this.calculateSteps(maxSteps, minSteps);
  }

  calculateSteps(maxSteps, minSteps) {
    const graphMax = this.category[this.category.length - 1];
    const graphMin = this.category[0];
    const graphRange = this.category.length;

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
    const options = this.options;
    const startPoint = this.axisPosInfo[this.units.rectStart];
    const endPoint = this.axisPosInfo[this.units.rectEnd];
    const offsetPoint = this.axisPosInfo[this.units.rectOffset(options.position)];
    const offsetCounterPoint = this.axisPosInfo[this.units.rectOffsetCounter(options.position)];

    // label font 설정
    this.ctx.font = Util.getLabelStyle(options);

    if (this.units.pos === 'x') {
      this.ctx.textAlign = this.stepValue > 1 ? 'start' : 'center';
      this.ctx.textBaseline = options.position === 'top' ? 'bottom' : 'top';
    } else if (this.units.pos === 'y') {
      this.ctx.textAlign = options.position === 'left' ? 'right' : 'left';
      this.ctx.textBaseline = 'middle';
    }
    this.ctx.fillStyle = options.labelStyle.color;

    if (this.steps === 0) {
      return;
    }

    // 각 라벨간 간격
    const labelGap = (endPoint - startPoint) / this.category.length;

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
    let labelPos;

    for (let ix = 0, ixLen = this.category.length; ix <= ixLen; ix++) {
      if (this.category[ix]) {
        options.ticks[ix] = this.category[ix];
      } else {
        options.ticks[ix] = '';
      }
      // step Skip이 존재할 때 label 위치 보정
      labelPos = this.stepValue > 1 ? 0 : labelGap / 2;

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
