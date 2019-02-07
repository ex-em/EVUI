import moment from 'moment';
import { AXIS_UNITS } from '../core.constant';
import Util from '../core.util';

class Axis {
  constructor(props) {
    this.type = props.type;
    this.options = props.options;
    this.ctx = props.ctx;

    this.chartRect = props.chartRect;
    this.labelOffset = props.labelOffset;
  }

  createAxis(axisMinMax) {
    this.units = AXIS_UNITS[this.type];
    this.skipFitting = false;

    this.axisPosInfo = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    this.calculateRange(axisMinMax);
    this.drawAxis();
  }

  calculateRange(axisMinMax) {
    if (!axisMinMax) {
      return;
    }

    // init variable
    const options = this.options;
    const chartRect = this.chartRect;

    let maxValue;
    let minValue;

    if (options.range && options.range.length === 2) {
      if (options.labelType === 'time') {
        maxValue = +moment(options.range[1]);
        minValue = +moment(options.range[0]);
      } else {
        maxValue = options.labelType === 'time' ? +moment(options.range[1]) : options.range[1];
        minValue = options.labelType === 'time' ? +moment(options.range[0]) : options.range[0];
      }
    } else {
      maxValue = axisMinMax ? (axisMinMax.max || 1) : 1;
      minValue = axisMinMax ? (axisMinMax.min || 0) : 0;
    }

    if (options.autoScaleRatio) {
      maxValue = Math.round(maxValue * (options.autoScaleRatio + 1));
    }

    if (options.isSetMinZero && options.labelType === 'linear') {
      minValue = 0;
    }

    let currentLabelOffset;
    let tickSize;

    // 실제 Axis가 그려질 영역
    const chartSize = this.units.pos === 'x' ? chartRect.chartWidth : chartRect.chartHeight;

    if (this.units.pos === 'x') {
      currentLabelOffset = [this.labelOffset.left, this.labelOffset.right];
    } else {
      currentLabelOffset = [this.labelOffset.top, this.labelOffset.bottom];
    }
    const drawRange = chartSize - (currentLabelOffset[0] + currentLabelOffset[1]);

    if (this.units.pos === 'x') {
      // tickSize는 실제 step을 구하기 위해 각 축의 Label중 가장 큰 값을 기준으로 Size를 구한다.
      tickSize = this.ctx.measureText(this.labelFormat(maxValue)).width + 20;
    } else {
     // Y축의 경우 글자의 높이로 전체 영역을 나누기 위함.
      tickSize = options.labelStyle.fontSize * 2;
    }

    const minSteps = 2;
    const maxSteps = Math.floor(drawRange / tickSize);

    this.skipFitting = minSteps >= maxSteps;

    if (maxValue < 1) {
      maxValue = 1;
    }

    if (maxValue === minValue) {
      maxValue += 0.5;
      if (minValue >= 0.5 && !options.isSetMinZero) {
        minValue -= 0.5;
      } else {
        maxValue += 0.5;
      }
    }

    this.calculateSteps({ maxValue, minValue, maxSteps, minSteps });
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
    const labelGap = (endPoint - startPoint) / this.steps;

    let labelCenter = null;
    let linePosition = null;

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

    const ticks = options.ticks;
    const showGrid = options.showGrid;
    let labelText;

    for (let ix = 0; ix <= this.steps; ix++) {
      if (this.isStepValueFloat) {
        ticks[ix] = Math.round(this.axisMin + ((ix * this.stepValue) * 10)) / 10;
      } else {
        ticks[ix] = this.axisMin + (ix * this.stepValue);
      }

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.labelFormat(ticks[ix]);

      let labelPoint;

      if (this.units.pos === 'x') {
        labelPoint = options.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        this.ctx.fillText(labelText, labelCenter, labelPoint);

        if (ix !== 0 && showGrid) {
          this.ctx.moveTo(linePosition, offsetPoint);
          this.ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        labelPoint = options.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        this.ctx.fillText(labelText, labelPoint, labelCenter);

        if (ix !== 0 && showGrid) {
          this.ctx.moveTo(offsetPoint, linePosition);
          this.ctx.lineTo(offsetCounterPoint, linePosition);
        }
      }

      this.ctx.stroke();
    }

    this.ctx.closePath();
  }

  labelFormat(value) {
    const options = this.options;
    let label;

    if (options.timeFormat !== null) {
      label = moment(value).format(options.timeFormat);
    } else if (options.labelType === 'linear') {
      label = Util.labelFormat(value);
    } else {
      label = value;
    }

    return label;
  }
}

export default Axis;
