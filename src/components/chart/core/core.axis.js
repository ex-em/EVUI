import moment from 'moment';

export default class Axis {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }

  createAxis() {
    this.calcLabel();
    if (this.type === 'x') {
      this.calcXInc();
      this.createXAxis();
    } else if (this.type === 'y') {
      this.calcYInc();
      this.createYAxis();
    } else {
      throw new Error('[EVUI][ERROR][ChartAxis]-Incorrect Axis Type');
    }
  }

  createXAxis() {
    const padding = this.size.padding;
    const chartWidth = this.size.chartWidth;
    const chartHeight = this.size.chartHeight;
    const labelData = this.labels.data;

    let labelTxt;
    let xPos = padding.left;

    this.ctx.lineWidth = '2';
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(padding.left, chartHeight + padding.top);
    this.ctx.lineTo(chartWidth + padding.left, chartHeight + padding.top);
    this.ctx.stroke();
    this.ctx.closePath();

    for (let ix = 0, ixLen = labelData.length; ix < ixLen; ix++) {
      labelTxt = labelData[ix];
      this.ctx.font = '12px Arial';
      this.ctx.fillText(labelTxt, xPos, chartHeight + padding.top + 15);
      xPos += this.xInc;
    }
  }

  createYAxis() {
    const padding = this.size.padding;
    // const chartWidth = this.size.chartWidth;
    const chartHeight = this.size.chartHeight;
    const totalHeight = this.size.totalHeight;

    const labelData = this.labels.data;

    let labelTxt;
    let yPos = padding.top + chartHeight;

    this.ctx.lineWidth = '2';
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.translate(0, totalHeight);
    this.ctx.scale(1, -1);
    this.ctx.moveTo(padding.left, padding.bottom);
    this.ctx.lineTo(padding.left, chartHeight + padding.bottom);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.save();
    this.ctx.translate(0, totalHeight);
    this.ctx.scale(1, -1);
    for (let ix = 0, ixLen = labelData.length; ix < ixLen; ix++) {
      yPos -= this.yInc;
      if (ix > 0 || labelData[ix] !== 0) {
        labelTxt = labelData[ix];
        this.ctx.font = '12px Arial';
        this.ctx.fillText(labelTxt, padding.left - 10, yPos + 4);
      }
    }
    this.ctx.restore();
  }

  getMaxDataYValue() {
    const data = this.dataStore.data;
    const keys = Object.keys(data);
    let seriesData;
    let maxYValue = 0;

    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      seriesData = data[keys[ix]];
      for (let jx = 0, jxLen = seriesData.length; jx < jxLen; jx++) {
        maxYValue = +seriesData[jx].y > maxYValue ? +seriesData[jx].y : maxYValue;
      }
    }

    return maxYValue;
  }

  calcLabel() {
    this.labels = { style: {}, data: [] };

    for (let ix = 0, ixLen = this.axisProps.length; ix < ixLen; ix++) {
      if (this.axisProps[ix].unit === 'time') {
        this.labels.data = this.getTimeTypeLabel(this.axisProps[ix].format);
      } else if (this.axisProps[ix].unit === 'number') {
        this.labels.data = this.getNumberTypeLabel();
      }
      this.labels.style = {
        labelStyle: this.axisProps[ix].labelStyle,
      };
    }
  }

  getTimeTypeLabel(format) {
    const min = this.type === 'x' ? this.range.minX : this.range.minY;
    const max = this.type === 'x' ? this.range.maxX : this.range.maxY;

    const values = [];
    const from = moment(min) || moment();
    const to = moment(max) || moment();

    // 현재 날짜를 하루씩 올리고 있으나, format에 따라 변경 필요
    to.add(1, 'day');
    while (from._d < to._d) {
      values.push(from.format(format));
      from.add(1, 'day');
    }

    return values;
  }

  getNumberTypeLabel() {
    // 현재 미구현 함수 (형태만 갖추어 둠)
    const min = this.type === 'x' ? this.range.minX : this.range.minY;
    const max = this.type === 'x' ? this.range.maxX : this.range.maxY;

    const values = [];
    let from = min || 0;
    let to = max || 0;

    to += 10;
    while (from < to) {
      values.push(from);
      from += 10;
    }

    return values;
  }

  calcXInc() {
    this.xInc = Math.round(this.size.chartWidth / this.labels.data.length) - 1;
  }

  calcYInc() {
    this.yInc = Math.round(this.size.chartHeight / this.labels.data.length) - 1;
  }
}
