import BaseChart from './chart.base';
import Util from '../core/core.util';

export default class LineChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);
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
        `rgba(${Util.hexToRgb(color)},${series.fill})`;
    }

    if (series.fill !== null) {
      ctx.fillStyle = series.fillStyle;
    }
    ctx.strokeStyle = color;

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = [];
    const yPoint = [];

    // const xAreaPoint = [];
    let startFillIndex = 0;
    const endPoint = this.chartRect.y2 - this.labelOffset.bottom;
    let x = null;
    let y = null;
    let data;
    let convX;
    let convY;

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];

      x = this.calculateX(data.x, series.axisIndex.x);
      y = this.calculateY(data.y, series.axisIndex.y, false);

      if (y === null) {
        if (ix - 1 >= 0) {
          if (series.fill && series.data[ix - 1].y !== null) {
            ctx.stroke();
            ctx.fillStyle = `rgba(${Util.hexToRgb(color)},${series.fillOpacity})`;

            if (series.stack && series.hasAccumulate) {
              for (let jx = ix; jx >= startFillIndex; jx--) {
                for (let kx = series.data[jx].b.length - 1; kx >= 0; kx--) {
                  convX = this.calculateX(series.data[jx].b[kx].x, series.axisIndex.x);
                  convY = this.calculateY(series.data[jx].b[kx].y, series.axisIndex.y);
                  ctx.lineTo(convX, convY);
                }
              }
            } else {
              ctx.lineTo(xPoint[ix - 1], endPoint);
              ctx.lineTo(xPoint[startFillIndex], endPoint);
            }
            // 단순히 fill을 위해서 하단 lineTo는 의미가 없으나 명확성을 위해 남겨둠
            // ctx.lineTo(xPoint[startFillIndex], yPoint[startFillIndex]);

            ctx.fill();
            ctx.beginPath();
          }
        }

        startFillIndex = ix + 1;
      } else if (ix === 0 || series.data[ix - 1].y === null || series.data[ix].y === null ||
        // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
        // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
        series.data[ix - 1].x === null || series.data[ix].x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      xPoint.push(x);
      yPoint.push(y);
    }

    ctx.stroke();
    if (series.fill && series.data[series.data.length - 1].y !== null) {
      ctx.stroke();

      ctx.fillStyle = `rgba(${Util.hexToRgb(color)},${series.fillOpacity})`;

      if (series.stack && series.hasAccumulate) {
        for (let ix = series.data.length - 1; ix >= startFillIndex; ix--) {
          for (let jx = series.data[ix].b.length - 1; jx >= 0; jx--) {
            this.tmp = series.data[ix];
            convX = this.calculateX(series.data[ix].b[jx].x, series.axisIndex.x);
            convY = this.calculateY(series.data[ix].b[jx].y, series.axisIndex.y);
            ctx.lineTo(convX, convY);
          }
        }
      } else {
        ctx.lineTo(xPoint[series.data.length - 1], endPoint);
        ctx.lineTo(xPoint[startFillIndex], endPoint);
      }
      // 단순히 fill을 위해서 하단 lineTo는 의미가 없으나 명확성을 위해 남겨둠
      // ctx.lineTo(xPoint[startFillIndex], yPoint[startFillIndex]);

      ctx.fill();
    }

    // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 다른 그림과 겹치지 않음.
    if (series.point) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = series.fillColor || '#fff';
      ctx.lineWidth = series.lineWidth;
      for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
        if (xPoint[ix] !== null && yPoint[ix] !== null && series.data[ix].point) {
          this.drawPoint(ctx, series.pointStyle, series.pointSize, xPoint[ix], yPoint[ix]);
        }
      }
      ctx.stroke();
      ctx.fill();
    }
  }
}
