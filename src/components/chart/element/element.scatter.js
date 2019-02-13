import _merge from 'lodash/merge';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Scatter {
  constructor(sId, opt, sIdx) {
    const merged = _merge({}, LINE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = COLOR[sIdx];
      }
    });

    this.sId = sId;
    this.data = [];
  }

  draw(context, chartRect, labelOffset, axesSteps) {
    const ctx = context;

    let x;
    let y;
    let aliasPixel;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.data.reduce((prev, curr) => {
      x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(curr.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      aliasPixel = Util.aliasPixel(x);
      x += aliasPixel;

      curr.xp = x; // eslint-disable-line
      curr.yp = y; // eslint-disable-line

      return curr;
    }, this.data[0]);

    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.pointFill;

    this.data.forEach((curr) => {
      if (curr.xp !== null && curr.yp !== null) {
        Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
      }
    });
  }
}

export default Scatter;
