import Util from './core.util';

export default class ChartBrush {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }

  draw() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      this.drawSeries(ix);
    }
  }

  drawSeries(seriesIndex) {
    if (this.type === 'line') {
      this.drawLine(seriesIndex);
    }
  }

  drawLine(seriesIndex) {
    if (this.seriesList[seriesIndex] === undefined || !this.seriesList[seriesIndex].visible) {
      return;
    }

    const series = this.seriesList[seriesIndex];
    let data = null;
    const yOffset = this.offset.yAxis;
    const yPoint = series.yPoint;
    const xPoint = this.offset.xAxis.point;

    const color = series.color || this.colors[seriesIndex];
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;
    // global alpha 보다 rgba 가 성능이 더 좋음
    if (series.fillStyle === undefined) {
      series.fillStyle = series.fill === undefined ? '' :
        `rgba(${Util.hexToRgb(series.color || this.colors[seriesIndex])},${series.fill})`;
    }

    if (series.fill != null) {
      ctx.fillStyle = series.fillStyle;
    }

    ctx.lineWidth = !series.overLineWidth ? series.lineWidth : series.overLineWidth;
    ctx.strokeStyle = color;

    let startFillIndex = 0;
    // var moveFlag = true;
    let x = null;
    let y = null;

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];
      x = xPoint[ix];
      y = null;

      if (data.y === null) {
        yPoint[ix] = null;

        if (ix - 1 >= 0) {
          if (series.fill !== undefined && series.data[ix - 1] !== undefined
            && series.data[ix - 1].y !== undefined) {
            ctx.stroke();

            ctx.fillStyle = series.fillStyle;
            ctx.lineTo(xPoint[ix - 1], yOffset.endPoint);
            ctx.lineTo(xPoint[startFillIndex], yOffset.endPoint);
            ctx.lineTo(xPoint[startFillIndex], yPoint[startFillIndex]);

            ctx.fill();
            ctx.beginPath();
          }
        }

        startFillIndex = ix + 1;
      } else {
        y = this.calculateY(data.y);
        yPoint[ix] = y;

        if (series.line) {
          if (ix === 0 || series.data[ix - 1] === undefined
            || series.data[ix - 1].y === undefined) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        } else if (ix === 0 || series.data[ix - 1] === undefined
          || series.data[ix - 1].y === undefined) {
          ctx.moveTo(x, y);
        }
      }
    }
    ctx.stroke();

    if (series.fill !== undefined && series.data[series.data.length - 1] !== undefined
      && series.data[series.data.length - 1].y !== undefined) {
      ctx.stroke();

      ctx.fillStyle = series.fillStyle;
      // ctx.strokeStyle = seriesFillStyle;
      ctx.lineTo(xPoint[series.data.length - 1], yOffset.endPoint);
      ctx.lineTo(xPoint[startFillIndex], yOffset.endPoint);
      ctx.lineTo(xPoint[startFillIndex], yPoint[startFillIndex]);

      ctx.fill();
    }

    // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 겹쳐 다른 그림과 겹치지 않기 위해서입니다.
    const pointOption = this.seriesProps.point;
    if (series.point || this.seriesProps.point.show) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = series.fillColor || pointOption.fillColor || '#fff';
      ctx.lineWidth = pointOption.lineWidth;
      for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
        if (xPoint[ix] !== undefined && yPoint[ix] !== undefined) {
          ctx.moveTo(xPoint[ix], yPoint[ix]);
          ctx.arc(xPoint[ix], yPoint[ix], pointOption.radius, 0, Math.PI * 2);
        }
      }
      ctx.stroke();
      ctx.fill();
    }
  }

  calculateY(value) {
    if (value === undefined) {
      return undefined;
    }

    const scalingFactor = this.drawingArea() / (this.offset.yAxis.max - this.minValueInfo);
    return this.offset.yAxis.endPoint - (scalingFactor * (value - (this.minValueInfo || 0)));
  }

  drawingArea() {
    return this.offset.yAxis.endPoint - this.offset.yAxis.startPoint;
  }
}
