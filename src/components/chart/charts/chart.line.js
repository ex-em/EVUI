import BaseChart from './chart.base';
import Util from '../core/core.util';

export default class LineChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);

    this.seriesList = this.dataStore.getSeriesList();
  }

  drawChart() {
    this.setLabelOffset();
    this.createAxis();
    this.createLine();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createLine() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        this.drawSeries(ix);
      }
    }

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].highlight.show) {
        this.seriesHighlight(ix);
        break;
      }
    }
  }

  drawSeries(seriesIndex) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesIndex];
    const ctx = this.bufferCtx;
    // series에 특정한 color 값이 없다면, options의 colors 참조
    const color = series.color;

    const isFill = this.options.fill;
    const isStack = this.options.stack;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;

    if (series.fillStyle === undefined) {
      series.fillStyle = series.fill === undefined ? '' :
        `rgba(${Util.hexToRgb(color)},${series.fill})`;
    }

    if (isFill !== null) {
      ctx.fillStyle = series.fillStyle;
    }
    ctx.strokeStyle = color;

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = series.drawInfo.xPoint;
    const yPoint = series.drawInfo.yPoint;

    // const xAreaPoint = [];
    let startFillIndex = 0;
    const endPoint = this.chartRect.y2 - this.labelOffset.bottom;
    let x = null;
    let y = null;
    let data;
    let convX;
    let convY;

    for (let ix = 0, ixLen = series.cData.length; ix < ixLen; ix++) {
      data = series.cData[ix];

      x = this.calculateX(data.x, series.axisIndex.x);
      y = this.calculateY(data.y, series.axisIndex.y, false);

      if (y === null) {
        if (ix - 1 >= 0) {
          if (isFill && series.cData[ix - 1].y !== null) {
            ctx.stroke();
            ctx.fillStyle = `rgba(${Util.hexToRgb(color)},${series.fillOpacity})`;

            if (isStack && series.hasAccumulate) {
              for (let jx = ix; jx >= startFillIndex; jx--) {
                for (let kx = series.cData[jx].b.length - 1; kx >= 0; kx--) {
                  convX = this.calculateX(series.cData[jx].b[kx].x, series.axisIndex.x);
                  convY = this.calculateY(series.cData[jx].b[kx].y, series.axisIndex.y);
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
      } else if (ix === 0 || series.cData[ix - 1].y === null || series.cData[ix].y === null ||
        // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
        // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
        series.cData[ix - 1].x === null || series.cData[ix].x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      xPoint.push(x);
      yPoint.push(y);
    }

    ctx.stroke();
    if (isFill && series.cData.length && series.cData[series.cData.length - 1].y !== null) {
      ctx.stroke();

      ctx.fillStyle = `rgba(${Util.hexToRgb(color)},${series.fillOpacity})`;

      if (isStack && series.hasAccumulate) {
        for (let ix = series.cData.length - 1; ix >= startFillIndex; ix--) {
          for (let jx = series.cData[ix].b.length - 1; jx >= 0; jx--) {
            this.tmp = series.cData[ix];
            convX = this.calculateX(series.cData[ix].b[jx].x, series.axisIndex.x);
            convY = this.calculateY(series.cData[ix].b[jx].y, series.axisIndex.y);
            ctx.lineTo(convX, convY);
          }
        }
      } else {
        ctx.lineTo(xPoint[series.cData.length - 1], endPoint);
        ctx.lineTo(xPoint[startFillIndex], endPoint);
      }
      // 단순히 fill을 위해서 하단 lineTo는 의미가 없으나 명확성을 위해 남겨둠
      // ctx.lineTo(xPoint[startFillIndex], yPoint[startFillIndex]);

      ctx.fill();
    }

    // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 다른 그림과 겹치지 않음.
    if (series.point) {
      ctx.strokeStyle = color;
      ctx.fillStyle = series.pointFill;
      ctx.lineWidth = series.lineWidth;
      for (let ix = 0, ixLen = series.cData.length; ix < ixLen; ix++) {
        if (xPoint[ix] !== null && yPoint[ix] !== null && series.cData[ix].point) {
          this.drawPoint(ctx, series.pointStyle, series.pointSize, xPoint[ix], yPoint[ix]);
        }
      }
    }
  }

  seriesHighlight(seriesIndex) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesIndex];
    const color = series.color;

    const xPoint = series.drawInfo.xPoint;
    const yPoint = series.drawInfo.yPoint;

    let x = null;
    let y = null;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;

    for (let ix = 0, ixLen = xPoint.length; ix < ixLen; ix++) {
      x = xPoint[ix];
      y = yPoint[ix];

      if (ix === 0 || series.cData[ix - 1].y === null || series.cData[ix].y === null ||
        // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
        // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
        xPoint[ix - 1] === null || xPoint[ix] === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.closePath();

    if (series.point) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;

      for (let ix = 0, ixLen = xPoint.length; ix < ixLen; ix++) {
        this.drawPoint(ctx, series.pointStyle, series.pointSize, xPoint[ix], yPoint[ix]);
      }
    }
  }

  itemHighlight(item) {
    if (item.dataIndex === null || item.seriesIndex === null) {
      return;
    }
    const ctx = this.overlayCtx;
    const series = this.seriesList[item.seriesIndex];

    if (!series.point) {
      return;
    }

    const color = series.color;
    const x = series.drawInfo.xPoint[item.dataIndex];
    const y = series.drawInfo.yPoint[item.dataIndex];

    ctx.strokeStyle = color;
    ctx.lineWidth = series.lineWidth;
    ctx.fillStyle = series.pointFill;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;

    this.drawPoint(ctx, series.pointStyle, 5, x, y);
  }

  showCrosshair(offset) {
    const ctx = this.overlayCtx;
    const x = offset[0];
    const y = offset[1];
    const graphPos = this.getChartGraphPos();

    if ((x >= (graphPos.x1 - 1) && x <= (graphPos.x2 + 1))
      && (y >= (graphPos.y1 - 1) && y <= (graphPos.y2 + 1))) {
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.moveTo(x, graphPos.y1);
      ctx.lineTo(x, graphPos.y2);

      ctx.stroke();
      ctx.restore();
    }
  }
}
