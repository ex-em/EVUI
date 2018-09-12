import BaseChart from './chart.base';
import Util from '../core/core.util';

export default class LineChart extends BaseChart {
  drawChart() {
    if (!this.chartRect.width || !this.chartRect.height ||
      this.chartRect.width < 1 || this.chartRect.height < 1) {
      return;
    }

    this.setLabelOffset();
    this.createAxis();
    this.createLine();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createLine() {
    const groups = this.data.groups;
    const graphData = this.graphData;
    const skey = Object.keys(graphData);
    let series;

    if (groups.length) {
      for (let ix = 0, ixLen = groups.length; ix < ixLen; ix++) {
        const group = groups[ix];
        for (let jx = 0, jxLen = group.length; jx < jxLen; jx++) {
          series = this.seriesList[group[jx]];

          if (series.show) {
            this.drawSeries(group[jx], graphData[group[jx]]);
          }
        }
      }
    }

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = this.seriesList[skey[ix]];

      if (!series.isExistGrp && series.show) {
        this.drawSeries(skey[ix], graphData[skey[ix]]);
      }
    }
  }

  drawSeries(seriesId, data) {
    const series = this.seriesList[seriesId];
    const ctx = this.bufferCtx;
    const color = series.color;

    const isFill = series.fill;
    const stackIndex = series.stackIndex;

    let fillStyle = '';

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;
    ctx.strokeStyle = color;

    if (isFill) {
      fillStyle = isFill ? `rgba(${Util.hexToRgb(color)},${series.fillOpacity})` : '';
      ctx.fillStyle = fillStyle;
    }

    let startFillIndex = 0;
    const endPoint = this.chartRect.y2 - this.labelOffset.bottom;
    let x = null;
    let y = null;
    let gdata;
    let convX;
    let convY;
    let aliasPixel;

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      gdata = data[ix];

      x = this.calculateX(gdata.x, series.xAxisIndex, true);
      y = this.calculateY(gdata.y, series.yAxisIndex, false);

      aliasPixel = Util.aliasPixel(x);
      x += aliasPixel;

      if (y === null) {
        if (ix - 1 >= 0) {
          if (isFill && data[ix - 1].y !== null) {
            ctx.stroke();
            ctx.lineTo(data[ix - 1].xp, endPoint);
            ctx.lineTo(data[startFillIndex].xp, endPoint);

            // 단순히 fill을 위해서 하단 lineTo는 의미가 없으나 명확성을 위해 남겨둠
            ctx.lineTo(data[startFillIndex].xp, data[startFillIndex].yp);

            ctx.fill();
            ctx.beginPath();
          }
        }

        startFillIndex = ix + 1;
      } else if (ix === 0 || data[ix - 1].y === null || data[ix].y === null ||
        // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
        // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
        data[ix - 1].x === null || data[ix].x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      gdata.xp = x;
      gdata.yp = y;
    }

    ctx.stroke();
    if (isFill && data.length && data[data.length - 1].y !== null) {
      ctx.fillStyle = `rgba(${Util.hexToRgb(color)},${series.fillOpacity})`;

      if (stackIndex) {
        for (let ix = data.length - 1; ix >= startFillIndex; ix--) {
          convX = this.calculateX(data[ix].x, series.xAxisIndex, true);
          convY = this.calculateY(data[ix].b, series.yAxisIndex, false);

          ctx.lineTo(convX, convY);
        }
      } else {
        ctx.lineTo(data[data.length - 1].xp, endPoint);
        ctx.lineTo(data[startFillIndex].xp, endPoint);
      }
      // 단순히 fill을 위해서 하단 lineTo는 의미가 없으나 명확성을 위해 남겨둠
      ctx.lineTo(data[startFillIndex].xp, data[startFillIndex].yp);

      ctx.fill();
    }

    // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 다른 그림과 겹치지 않음.
    if (series.point) {
      ctx.strokeStyle = color;
      ctx.fillStyle = series.pointFill;
      ctx.lineWidth = series.lineWidth;
      for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
        if (data[ix].xp !== null && data[ix].yp !== null) {
          this.drawPoint(ctx, series.pointStyle, series.pointSize, data[ix].xp, data[ix].yp);
        }
      }
    }
  }

  seriesHighlight(seriesId) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesId];
    const graphData = this.graphData;
    const gdata = graphData[seriesId];
    const color = series.color;

    let x = null;
    let y = null;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    for (let ix = 0, ixLen = gdata.length; ix < ixLen; ix++) {
      x = gdata[ix].xp;
      y = gdata[ix].yp;

      // 시작 지점 혹은 이전/현 X또는 Y값이 없다면 moveTo로 좌표를 이동
      // null 데이터가 들어왔을 시 차트를 끊어내기 위함.
      if (ix === 0 || gdata[ix - 1].y === null || gdata[ix].y === null ||
        gdata[ix - 1].x === null || gdata[ix].x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.closePath();

    if (series.point) {
      const pSize = series.highlight.pointSize;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;

      for (let ix = 0, ixLen = gdata.length; ix < ixLen; ix++) {
        if (gdata[ix].xp !== null && gdata[ix].yp !== null) {
          this.drawPoint(ctx, series.pointStyle, pSize, gdata[ix].xp, gdata[ix].yp);
        }
      }
    }
  }

  itemHighlight(item) {
    if (item.index === null || item.sId === null) {
      return;
    }

    const graphData = this.graphData;
    const gdata = graphData[item.sId];
    const ctx = this.overlayCtx;
    const series = this.seriesList[item.sId];

    if (!series.point) {
      return;
    }

    const color = series.color;
    const x = gdata[item.index].xp;
    const y = gdata[item.index].yp;
    const pSize = series.highlight.pointSize;

    ctx.strokeStyle = color;
    ctx.lineWidth = series.lineWidth;
    ctx.fillStyle = series.pointFill;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;

    this.drawPoint(ctx, series.pointStyle, pSize, x, y);
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
