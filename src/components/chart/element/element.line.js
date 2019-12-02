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

  draw(param) {
    if (!this.show) {
      return;
    }

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;

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
    let barAreaByCombo = 0;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    if (this.combo) {
      barAreaByCombo = xArea / (this.data.length || 1);
      xArea -= barAreaByCombo;
    }

    const xsp = chartRect.x1 + labelOffset.left + (barAreaByCombo / 2);
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.data.reduce((prev, curr, ix, item) => {
      x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(curr.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      if (x !== null) {
        aliasPixel = Util.aliasPixel(x);
        x += aliasPixel;
      }

      if (y === null || x === null) {
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
        this.data.slice().reverse().forEach((curr) => {
          x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
          y = Canvas.calculateY(curr.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

          ctx.lineTo(x, y);
        });
      } else if (startFillIndex < dataLen) {
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

  itemHighlight(item, context) {
    const gdata = item.data;
    const ctx = context;

    if (!this.point) {
      return;
    }

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.color;

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = this.color;

    if (x !== null && y !== null) {
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.pointSize, x, y);
    }
  }

  findGraphData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    let s = 0;
    let e = gdata.length - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const sx = gdata[m].xp;
      const sy = gdata[m].yp;
      const ex = sx + gdata[m].w;
      const ey = sy + gdata[m].h;

      if ((sx - 4 <= xp) && (xp <= ex + 4)) {
        item.data = gdata[m];

        if ((ey - 4 <= yp) && (yp <= sy + 4)) {
          item.hit = true;
        }
        return item;
      } else if (sx + 4 < xp) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }
}

export default Line;
