import BaseChart from './chart.base';

export default class ScatterChart extends BaseChart {
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
    this.createScatter();
  }

  createScatter() {
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

    ctx.strokeStyle = color;

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = [];
    const yPoint = [];

    let x = null;
    let y = null;
    let data;

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];

      x = this.calculateX(data.x, series.axisIndex.x);
      y = this.calculateY(data.y, series.axisIndex.y, false);

      xPoint.push(x);
      yPoint.push(y);
    }

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
    }
  }
}
