import BaseChart from './chart.base';

export default class ScatterChart extends BaseChart {
  drawChart() {
    this.setLabelOffset();
    this.createAxis();
    this.createScatter();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createScatter() {
    const graphData = this.graphData;
    const skey = Object.keys(graphData);
    let series;

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = this.seriesList[skey[ix]];

      if (series.show) {
        this.drawSeries(skey[ix], graphData[skey[ix]]);
      }
    }
  }

  drawSeries(seriesId, data) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesId];
    const ctx = this.bufferCtx;
    const color = series.color;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;

    ctx.strokeStyle = color;

    let x = null;
    let y = null;
    let gdata;

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      gdata = data[ix];

      x = this.calculateX(gdata.x, series.xAxisIndex, true);
      y = this.calculateY(gdata.y, series.yAxisIndex, false);

      gdata.xp = x;
      gdata.yp = y;
    }

    if (series.point) {
      ctx.beginPath();
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

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

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
    if (item.dataIndex === null || item.seriesIndex === null) {
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
