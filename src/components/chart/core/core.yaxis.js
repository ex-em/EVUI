import Axis from './core.axis';
import Util from './core.util';

export default class YAxis extends Axis {
  constructor(props) {
    super(props);

    this.width = this.sizeInfo.width;
    this.height = this.sizeInfo.height;
    this.xScalePaddingLeft = this.sizeInfo.xScalePaddingLeft;
    this.xScalePaddingRight = this.sizeInfo.xScalePaddingRight;
  }

  createYAxis() {
    if (this.yAxes.length === 2) {
      // multi
    } else if (this.yAxes.length === 1) {
      this.yAxis = this.yAxes[0];
      this.createSingleYAxis(this.yAxes[0]);
    } else {
      throw new Error('[EVUI][ERROR][ChartYAxis]-Inaccurate Axis Info');
    }
  }

  createSingleYAxis(singleAxis) {
    const offsetAxis = this.offset.yAxis;
    const yAxis = singleAxis;

    this.ctx.font = Util.getLabelStyle(yAxis);

    if (offsetAxis.steps === 0) {
      return;
    }

    const grid = this.grid;
    const yLabelGap = (offsetAxis.endPoint - offsetAxis.startPoint) / offsetAxis.steps;
    const xStart = this.xScalePaddingLeft;
    const xEnd = this.width - this.xScalePaddingRight;

    let yLabelCenter = null;
    let linePositionY = null;

    if (yAxis.ticks === undefined) {
      yAxis.ticks = [];
    } else {
      yAxis.ticks.length = 0;
    }

    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = this.yAxis.labelStyle.color;

    this.ctx.lineWidth = grid.gridLineWidth;

    const aliasPixel = Util.aliasPixel(this.ctx.lineWidth);

    this.ctx.beginPath();
    this.ctx.strokeStyle = grid.border.color;
    this.ctx.moveTo(xStart, offsetAxis.endPoint + aliasPixel);
    this.ctx.lineTo(xEnd, offsetAxis.endPoint + aliasPixel);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.strokeStyle = grid.gridLineColor;

    for (let ix = 0, ixLen = offsetAxis.steps; ix <= ixLen; ix++) {
      if (offsetAxis.isStepValueFloat) {
        yAxis.ticks[ix] = Math.round(offsetAxis.min + ((ix * offsetAxis.stepValue) * 10)) / 10;
      } else {
        yAxis.ticks[ix] = offsetAxis.min + (ix * offsetAxis.stepValue);
      }

      yLabelCenter = Math.round(offsetAxis.endPoint - (yLabelGap * ix));

      linePositionY = yLabelCenter + aliasPixel;

      this.ctx.fillText(Util.yLabelFormat(yAxis.ticks[ix], this.yAxis),
        xStart - 8, yLabelCenter);

      if (ix !== 0) {
        this.ctx.moveTo(xStart, linePositionY);
        this.ctx.lineTo(xEnd, linePositionY);
      }
    }

    this.ctx.stroke();
  }
}
