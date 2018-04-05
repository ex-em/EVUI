import moment from 'moment';
import { AXIS_UNITS } from '../core.constant';
import Util from '../core.util';

class AxisAutoScale {
  constructor(type, data, chartRect, options, ctx, labelOffset) {
    this.ctx = ctx;
    this.units = AXIS_UNITS[type];
    this.chartRect = chartRect;
    this.options = options;
    this.dataSet = data;
    this.labelOffset = labelOffset;
    this.graphMax = 0;
    this.graphMin = 0;
  }

  createAxis() {
    this.calculateRange();
    this.drawAxis();
  }

  calculateRange() {
    // init variable
    const options = this.options;
    const chartRect = this.chartRect;
    const dataSet = this.dataSet;

    const maxLabelInfo = dataSet.getLabelTextMaxInfo();
    // 실제 Axis가 그려질 영역
    const chartSize = this.units.pos === 'x' ? chartRect.chartWidth : chartRect.chartHeight;
    let currentLabelOffset = null;
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

    let skipFitting = (minSteps >= maxSteps);

    let maxValue;
    let minValue;
    if (options.type === 'time') {
      // axis option의 type이 time일 경우 moment로 date객체 생성 후 long type으로 변환
      maxValue = +moment(options.max)._d;
      minValue = +moment(options.min)._d;
    } else {
      maxValue = options.max;
      minValue = options.min;
    }

    if (options.autoScaleRatio !== null) {
      maxValue *= (options.autoScaleRatio + 1);
    }

    const startFromZero = minValue <= 10;
    const integersOnly = true;

    if (maxValue < 1) {
      maxValue = 1;
    }

    if (maxValue === minValue) {
      maxValue += 0.5;
      if (minValue >= 0.5 && !startFromZero) {
        minValue -= 0.5;
      } else {
        maxValue += 0.5;
      }
    }

    // nice numbers algorithm 연산시작
    const valueRange = Math.abs(maxValue - minValue);
    const rangeMagnitude = Util.calculateMagnitude(valueRange);
    this.graphMax = Math.ceil(maxValue / (10 ** rangeMagnitude)) * (10 ** rangeMagnitude);
    this.graphMin = (startFromZero) ? 0 : minValue;
    const graphRange = this.graphMax - this.graphMin;
    let stepValue = 10 ** rangeMagnitude;
    let numberOfSteps = Math.round(graphRange / stepValue);

    if (maxValue === 1) {
      stepValue = 0.2;
      numberOfSteps = 5;
    }

    while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
      if (numberOfSteps > maxSteps) {
        stepValue *= 2;
        numberOfSteps = Math.round(graphRange / stepValue);

        if (numberOfSteps % 1 !== 0) {
          skipFitting = true;
        }
      } else if (integersOnly && rangeMagnitude >= 0) {
        if ((stepValue / 2) % 1 === 0) {
          stepValue /= 2;
          numberOfSteps = Math.round(graphRange / stepValue);
        } else {
          break;
        }
      } else {
        stepValue /= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      }
    }

    if (skipFitting) {
      numberOfSteps = minSteps;
      stepValue = graphRange / numberOfSteps;
    }

    this.steps = numberOfSteps;
    this.stepValue = stepValue;
    this.isStepValueFloat = (`${stepValue}`).indexOf('.') > -1;
    this.axisMin = this.graphMin;
    this.axisMax = Math.round((this.graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;

    // labelOffset 처리 이후.
    this.axisPosInfo = {
      x1: chartRect.x1 + this.labelOffset.left,
      x2: chartRect.x2 - this.labelOffset.right,
      y1: chartRect.y1 + this.labelOffset.top,
      y2: chartRect.y2 - this.labelOffset.bottom,
    };
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
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
    } else if (this.units.pos === 'y') {
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
    }
    this.ctx.fillStyle = options.labelStyle.color;

    if (this.steps === 0) {
      return;
    }

    // 각 라벨간 간격
    const labelGap = (endPoint - startPoint) / this.steps;

    let labelCenter = null;
    let linePosition = null;

    this.ticks = [];

    if (options.ticks === undefined) {
      options.ticks = [];
    } else {
      options.ticks.length = 0;
    }

    // let yLabelCenter = null;
    // let linePositionY = null;

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
    for (let ix = 0, ixLen = this.steps; ix <= ixLen; ix++) {
      if (this.isStepValueFloat) {
        options.ticks[ix] = Math.round(this.axisMin + ((ix * this.stepValue) * 10)) / 10;
      } else {
        options.ticks[ix] = this.axisMin + (ix * this.stepValue);
      }

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.labelFormat(options.ticks[ix]);

      if (this.units.pos === 'x') {
        this.ctx.fillText(labelText, labelCenter, offsetPoint + 10);

        if (ix !== 0 && this.options.showGrid) {
          this.ctx.moveTo(linePosition, offsetPoint);
          this.ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        this.ctx.fillText(labelText, endPoint + 20, labelCenter);

        if (ix !== 0 && this.options.showGrid) {
          this.ctx.moveTo(offsetPoint, linePosition);
          this.ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }
    }

    this.ctx.stroke();
  }

  labelFormat(value) {
    let formattingValue;
    if (this.options.type === 'time') {
      formattingValue = moment(value).format(this.options.tickFormat);
    } else {
      formattingValue = value;
    }

    return formattingValue;
  }
}

export default AxisAutoScale;
