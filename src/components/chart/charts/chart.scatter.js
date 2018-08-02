import BaseChart from './chart.base';

export default class ScatterChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);
    this.seriesList = this.dataStore.getSeriesList();
  }

  drawChart() {
    this.setLabelOffset();
    this.createAxis();
    this.createScatter();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createScatter() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        this.drawSeries(ix);
      }
    }

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].isHighlight) {
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

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;

    ctx.strokeStyle = color;

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = series.drawInfo.xPoint;
    const yPoint = series.drawInfo.yPoint;

    let x = null;
    let y = null;
    let data;

    for (let ix = 0, ixLen = series.cData.length; ix < ixLen; ix++) {
      data = series.cData[ix];

      x = this.calculateX(data.x, series.axisIndex.x);
      y = this.calculateY(data.y, series.axisIndex.y, false);

      xPoint.push(x);
      yPoint.push(y);
    }

    this.xPoint = series.xPoint;
    if (series.point) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
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

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;


    for (let ix = 0, ixLen = xPoint.length; ix < ixLen; ix++) {
      this.drawPoint(ctx, series.pointStyle, series.highlight.item, xPoint[ix], yPoint[ix]);
    }
  }

  itemHighlight(item) {
    if (item.dataIndex === null || item.seriesIndex === null) {
      return;
    }
    const ctx = this.overlayCtx;
    const series = this.seriesList[item.seriesIndex];

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

    this.drawPoint(ctx, series.pointStyle, series.highlight.item, x, y);
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
