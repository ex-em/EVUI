import Axis from './core.axis';
import Util from '../core/core.util';

export default class XAxis extends Axis {
  constructor(props) {
    super(props);

    this.width = this.sizeInfo.width;
    this.height = this.sizeInfo.height;
    this.xScalePaddingLeft = this.sizeInfo.xScalePaddingLeft;
    this.xScalePaddingRight = this.sizeInfo.xScalePaddingRight;
  }

  createXAxis() {
    if (this.xAxes.length === 2) {
      // multi
    } else if (this.xAxes.length === 1) {
      this.xAxis = this.xAxes[0];
      this.createSingleXAxis();
    } else {
      throw new Error('[EVUI][ERROR][ChartXAxis]-Inaccurate Axis Info');
    }
  }

  createSingleXAxis() {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = this.xAxis.labelStyle.color;

    const point = this.offset.xAxis.point;
    const step = this.offset.xAxis.step;
    const grid = this.grid;
    const standardSeries = this.standardSeries;

    let xPos;

    for (let ix = 0; ix < this.valuesMaxCount; ix++) {
      xPos = this.offset.xAxis.point[ix];

      if (ix % step === 0) {
        if (ix === 0) {
          // 왼쪽 y축 border
          this.ctx.beginPath();
          this.ctx.lineWidth = grid.gridLineWidth;
          this.ctx.strokeStyle = grid.border.color;

          this.ctx.moveTo(xPos, this.offset.yAxis.endPoint);
          this.ctx.lineTo(xPos, this.offset.yAxis.startPoint - 3);
          this.ctx.stroke();
        }

        if (ix !== 0 && grid.showYLine) {
          this.ctx.beginPath();
          this.ctx.lineWidth = grid.gridLineWidth;
          this.ctx.strokeStyle = grid.gridLineColor;

          this.ctx.moveTo(xPos, this.offset.yAxis.endPoint);
          this.ctx.lineTo(xPos, this.offset.yAxis.startPoint - 3);
          this.ctx.stroke();
        }
        // x축 label 그리기
        if (standardSeries && standardSeries.data[ix]) {
          this.ctx.fillText(Util.xLabelFormat(standardSeries.data[ix].x),
            xPos, this.offset.yAxis.endPoint + 8);
        }
      }
      point[ix] = xPos;
    }

    if ((this.valuesMaxCount - 1) % step !== 0 && this.valuesMaxCount % step === 0) {
      // 마지막 x축 label 그리기
      if (standardSeries.data[this.valuesMaxCount - 1]) {
        this.ctx.fillText(this.xLabelFormat(
          standardSeries.data[standardSeries.data.length - 1].x), point[this.valuesMaxCount - 1],
          this.offset.yAxis.endPoint + 8);
      }
    }
  }
}
