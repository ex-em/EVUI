import _ from 'lodash';
import moment from 'moment';
import BaseChart from './chart.base';
import Util from '../core/core.util';
import AxisAutoScale from '../core/axis/axis.scale.auto';

export default class LineChart extends BaseChart {
  constructor(target, data, options) {
    const defaultOptions = {
      isScatter: false,
      lineWidth: 2,
      pointSize: 5,
    };

    super(target, data, _.merge({}, defaultOptions, options));
    this.seriesList = this.dataSet.getSeriesList();
  }

  createChart() {
    if (this.options.title.show) {
      this.createTitle();
    }
    this.setLabelOffset();
    this.createAxis();
    this.createLine();
  }

  createAxis() {
    this.xAxes = [];
    this.yAxes = [];

    for (let ix = 0, ixLen = this.options.xAxes.length; ix < ixLen; ix++) {
      if (this.options.xAxes[ix].type !== null && this.options.xAxes[ix].max !== null) {
        this.xAxes.push(new AxisAutoScale('x', this.dataSet, this.chartRect,
          this.options.xAxes[ix], this.bufferCtx, this.labelOffset));
      }
    }

    for (let ix = 0, ixLen = this.options.yAxes.length; ix < ixLen; ix++) {
      this.yAxes.push(new AxisAutoScale('y', this.dataSet, this.chartRect,
        this.options.yAxes[ix], this.bufferCtx, this.labelOffset));
    }

    for (let ix = 0, ixLen = this.xAxes.length; ix < ixLen; ix++) {
      this.xAxes[ix].createAxis();
    }

    for (let ix = 0, ixLen = this.yAxes.length; ix < ixLen; ix++) {
      this.yAxes[ix].createAxis();
    }

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createLine() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      this.drawSeries(ix);
    }
  }

  drawSeries(seriesIndex) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesIndex];
    const ctx = this.bufferCtx;
    // series에 특정한 color 값이 없다면, options의 colors 참조
    const color = series.color || this.options.colors[seriesIndex];

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;

    if (series.fillStyle === undefined) {
      series.fillStyle = series.fill === undefined ? '' :
        `rgba(${Util.hexToRgb(series.color || this.colors[seriesIndex])},${series.fill})`;
    }

    if (series.fill !== null) {
      ctx.fillStyle = series.fillStyle;
    }
    ctx.strokeStyle = color;

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = [];
    const yPoint = [];

    let x = null;
    let y = null;
    let data;

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];

      x = data.x === null ? null : this.calculateX(data.x, series.axisIndex.x);
      y = data.y === null ? null : this.calculateY(data.y, series.axisIndex.y);

      // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
      // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
      if (ix === 0 || series.data[ix - 1].y === null || series.data[ix].y === null ||
        series.data[ix - 1].x === null || series.data[ix].x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      xPoint.push(x);
      yPoint.push(y);
    }

    ctx.stroke();

    // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 다른 그림과 겹치지 않음.
    const pointOption = true;
    if (series.point) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = series.fillColor || pointOption.fillColor || '#fff';
      ctx.lineWidth = pointOption.lineWidth;
      for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
        if (xPoint[ix] !== null && yPoint[ix] !== null) {
          ctx.moveTo(xPoint[ix], yPoint[ix]);
          ctx.arc(xPoint[ix], yPoint[ix], series.pointSize, 0, Math.PI * 2);
        }
      }
      ctx.stroke();
      ctx.fill();
    }
  }

  calculateX(value, xAxisIndex) {
    const maxValue = this.xAxes[xAxisIndex].axisMax;
    const minValue = this.xAxes[xAxisIndex].axisMin;
    let convertValue;

    if (value === undefined) {
      return undefined;
    }

    if (this.options.xAxes[xAxisIndex].type === 'time') {
      convertValue = +moment(value)._d;
    } else {
      convertValue = value;
    }

    const scalingFactor = this.drawingXArea() / (maxValue - minValue);
    return (this.chartRect.x1 + this.labelOffset.left) +
      (scalingFactor * (convertValue - (minValue || 0)));
  }

  calculateY(value, yAxisIndex) {
    const maxValue = this.yAxes[yAxisIndex].axisMax;
    const minValue = this.yAxes[yAxisIndex].axisMin;
    let convertValue;

    if (value === undefined) {
      return undefined;
    }

    if (this.options.yAxes[yAxisIndex].type === 'time') {
      convertValue = +moment(value)._d;
    } else {
      convertValue = value;
    }

    const scalingFactor = this.drawingYArea() / (maxValue - minValue);
    return (this.chartRect.y2 - this.labelOffset.bottom) -
      (scalingFactor * (convertValue - (minValue || 0)));
  }

  drawingXArea() {
    return this.chartRect.chartWidth - (this.labelOffset.left + this.labelOffset.right);
  }

  drawingYArea() {
    return this.chartRect.chartHeight - (this.labelOffset.top + this.labelOffset.bottom);
  }
}
