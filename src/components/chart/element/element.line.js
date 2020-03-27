import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Line {
  constructor(sId, opt, sIdx) {
    const merged = merge({}, LINE_OPTION, opt);
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
    this.type = 'line';
    this.sId = sId;
    this.state = 'normal';
    this.extent = {
      downplay: { opacity: 0.1, lineWidth: 1 },
      normal: { opacity: 1, lineWidth: 1 },
      highlight: { opacity: 1, lineWidth: 2 },
    };
    this.data = [];
    this.size = {
      comboOffset: 0,
    };
  }

  draw(param) {
    if (!this.show) {
      return;
    }

    const { ctx, chartRect, labelOffset, axesSteps } = param;
    const extent = this.extent[this.state];

    const blurOpacity = extent.opacity;
    const fillOpacity = this.fillOpacity * extent.opacity;
    const lineWidth = this.lineWidth * extent.lineWidth;

    ctx.beginPath();
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(${Util.hexToRgb(this.color)},${blurOpacity})` || '';

    if (this.fill) {
      ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)},${fillOpacity})` || '';
    }

    let startFillIndex = 0;
    const endPoint = chartRect.y2 - labelOffset.bottom;

    let x;
    let y;
    let barAreaByCombo = 0;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    if (this.combo) {
      barAreaByCombo = xArea / (this.data.length || 1);
      xArea -= barAreaByCombo;
      this.size.comboOffset = barAreaByCombo;
    }

    const xsp = chartRect.x1 + labelOffset.left + (barAreaByCombo / 2);
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.data.reduce((prev, curr, ix, item) => {
      x = Canvas.calculateX(curr.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(curr.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      if (x !== null) {
        x += Util.aliasPixel(x);
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
      } else if (ix === 0 || prev.y === null || curr.y === null
        || prev.x === null || curr.x === null) {
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
      ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)},${fillOpacity})` || '';
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
      ctx.strokeStyle = `rgba(${Util.hexToRgb(this.color)},${blurOpacity})` || '';
      ctx.fillStyle = `rgba(${Util.hexToRgb(this.pointFill)},${blurOpacity})` || '';

      this.data.forEach((curr) => {
        if (curr.xp !== null && curr.yp !== null) {
          Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
        }
      });
    }

    ctx.restore();
  }

  itemHighlight(item, context, isMax) {
    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.save();
    if (x !== null && y !== null) {
      if (isMax) {
        ctx.strokeStyle = `rgba(${Util.hexToRgb(this.color)}, 0)` || '';
        ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)}, ${this.highlight.maxShadowOpacity})` || '';
        Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxShadowSize, x, y);

        ctx.fillStyle = this.color;
        Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, x, y);

        ctx.fillStyle = '#fff';
        Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, x, y);
      } else {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.color;

        Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, x, y);
      }
    }

    ctx.restore();
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
      const x = gdata[m].xp;
      const y = gdata[m].yp;

      if ((x - 2 <= xp) && (xp <= x + 2)) {
        item.data = gdata[m];
        item.index = m;

        if ((y - 2 <= yp) && (yp <= y + 2)) {
          item.hit = true;
        }
        return item;
      } else if (x + 2 < xp) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }

  findApproximateData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    let s = 0;
    let e = gdata.length - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const x = gdata[m].xp;
      const y = gdata[m].yp;

      if ((x - 2 <= xp) && (xp <= x + 2)) {
        item.data = gdata[m];
        item.index = m;

        if ((y - 2 <= yp) && (yp <= y + 2)) {
          item.hit = true;
        }

        return item;
      } else if (x + 2 < xp) {
        if (m < e && xp < gdata[m + 1].xp) {
          const curr = Math.abs(gdata[m].xp - xp);
          const next = Math.abs(gdata[m + 1].xp - xp);

          item.data = curr > next ? gdata[m + 1] : gdata[m];
          item.index = curr > next ? m + 1 : m;
          return item;
        }
        s = m + 1;
      } else {
        if (m > 0 && xp > gdata[m - 1].xp) {
          const prev = Math.abs(gdata[m - 1].xp - xp);
          const curr = Math.abs(gdata[m].xp - xp);

          item.data = prev > curr ? gdata[m] : gdata[m - 1];
          item.index = prev > curr ? m : m - 1;
          return item;
        }
        e = m - 1;
      }
    }

    return item;
  }
}

export default Line;
