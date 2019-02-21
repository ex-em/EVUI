import _merge from 'lodash/merge';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Line {
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

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.color;

    if (this.fill) {
      ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)},${this.fillOpacity})` || '';
    }

    let startFillIndex = 0;
    const endPoint = chartRect.y2 - labelOffset.bottom;

    let x;
    let y;
    let aliasPixel;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.data.reduce((prev, curr, ix, item) => {
      x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(curr.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      aliasPixel = Util.aliasPixel(x);
      x += aliasPixel;

      if (y === null) {
        if (ix - 1 > -1) {
          if (this.fill && prev.y !== null) {
            ctx.stroke();
            ctx.lineTo(prev.xp, endPoint);
            ctx.lineTo(item[startFillIndex].xp, endPoint);

            ctx.fill();
            ctx.beginPath();
          }
        }

        startFillIndex = ix + 1;
      } else if (ix === 0 || prev.y === null || curr.y === null ||
        prev.x === null || curr.x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      curr.xp = x; // eslint-disable-line
      curr.yp = y; // eslint-disable-line

      return curr;
    }, this.data[0]);

    ctx.stroke();

    const dataLen = this.data.length;

    if (this.fill && dataLen) {
      ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)},${this.fillOpacity})` || '';
      if (this.stackIndex) {
        this.data.reverse().forEach((curr) => {
          x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
          y = Canvas.calculateY(curr.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

          ctx.lineTo(x, y);
        });
      } else {
        ctx.lineTo(this.data[dataLen - 1].xp, endPoint);
        ctx.lineTo(this.data[startFillIndex].xp, endPoint);
      }

      ctx.fill();
    }

    if (this.point) {
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.pointFill;

      this.data.forEach((curr) => {
        if (curr.xp !== null && curr.yp !== null) {
          Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
        }
      });
    }
  }
}

export default Line;
