import moment from 'moment';
import { AXIS_UNITS } from '../core.constant';
import Util from '../core.util';

class Axis {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    if (!this.options.scaleType) {
      this.options.scaleType = 'auto';
    }

    if (!this.options.labelType) {
      this.options.labelType = 'linear';
    }

    this.units = AXIS_UNITS[this.type];
    this.startFromZero = false;
    this.skipFitting = false;
    this.integersOnly = true;
  }

  createAxis() {
    this.calculateRange();
    this.drawAxis();
  }

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

    let maxValue;
    let minValue;
    let minMaxValue;

    if (this.units.pos === 'x') {
      minMaxValue = this.dataStore.getXValueAxisPerSeries(this.axisIndex);
    } else {
      minMaxValue = this.dataStore.getYValueAxisPerSeries(this.axisIndex);
    }

    if (options.labelType === 'time') {
      // axis option의 label type이 time일 경우 moment로 date객체 생성 후 long type으로 변환
      maxValue = +moment(options.max || minMaxValue.max)._d;
      minValue = +moment(options.min || minMaxValue.min)._d;
    } else {
      maxValue = options.max || minMaxValue.max;
      minValue = options.min || minMaxValue.min;
    }

    if (options.autoScaleRatio !== null) {
      maxValue *= (options.autoScaleRatio + 1);
    }

    if (options.labelType === 'linear' && maxValue <= 100) {
      this.startFromZero = true;
    }

    if (maxValue < 1) {
      maxValue = 1;
    }

    if (maxValue === minValue) {
      maxValue += 0.5;
      if (minValue >= 0.5 && !this.startFromZero) {
        minValue -= 0.5;
      } else {
        maxValue += 0.5;
      }
    }

    this.calculateSteps(maxValue, minValue, maxSteps, minSteps);
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
    for (let ix = 0, ixLen = this.steps; ix <= ixLen; ix++) {
      if (this.isStepValueFloat) {
        options.ticks[ix] = Math.round(this.axisMin + ((ix * this.stepValue) * 10)) / 10;
      } else {
        options.ticks[ix] = this.axisMin + (ix * this.stepValue);
      }

      labelCenter = Math.round(startPoint + (labelGap * ix));
      linePosition = labelCenter + aliasPixel;
      labelText = this.labelFormat(options.ticks[ix]);

      let labelPoint;

      if (this.units.pos === 'x') {
        labelPoint = options.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
        this.ctx.fillText(labelText, labelCenter, labelPoint);

        if (ix !== 0 && this.options.showGrid) {
          this.ctx.moveTo(linePosition, offsetPoint);
          this.ctx.lineTo(linePosition, offsetCounterPoint);
        }
      } else {
        labelPoint = options.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
        this.ctx.fillText(labelText, labelPoint, labelCenter);

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
    if (this.options.labelType === 'time') {
      formattingValue = moment(value).format(this.options.tickFormat);
    } else if (this.options.labelType === 'linear') {
      if (value >= 1000000000) {
        if (value % 1000000000 === 0) {
          formattingValue = `${(value / 1000000000).toFixed(1)}G`;
        } else {
          formattingValue = `${(value / 1000000000).toFixed(1)}G`;
        }
      } else if (value >= 1000000) {
        if (value % 1000000 === 0) {
          formattingValue = `${(value / 1000000).toFixed(1)}M`;
        } else {
          formattingValue = `${(value / 1000000).toFixed(1)}M`;
        }
      } else if (value >= 1000) {
        if (value % 1000 === 0) {
          formattingValue = `${(value / 1000).toFixed(1)}k`;
        } else {
          formattingValue = `${(value / 1000).toFixed(1)}k`;
        }
      } else {
        formattingValue = value.toFixed(1);
      }
    } else {
      formattingValue = value;
    }

    return formattingValue;
  }
}

export default Axis;
