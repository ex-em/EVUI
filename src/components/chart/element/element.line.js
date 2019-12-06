import _merge from 'lodash/merge';
import { numberWithComma } from '@/common/utils';
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

    const { ctx, chartRect, labelOffset, axesSteps, showMaxTip, maxTipOpt } = param;

    ctx.beginPath();
    ctx.save();
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

    ctx.restore();

    if (showMaxTip && this.data.length > 1) {
      const { maxDomain, maxY } = this.minMax;
      const maxValue = numberWithComma(maxY);

      if (maxValue === false) {
        return;
      }

      const arrowSize = 4;
      const maxTipHeight = 20;
      const borderRadius = 4;

      let maxTipType = 'center';

      x = Canvas.calculateX(maxDomain, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(maxY, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp)
        - (this.pointSize * 2);

      ctx.save();
      ctx.font = 'bold 14px Roboto';
      const maxTipWidth = Math.round(Math.max(ctx.measureText(maxValue).width + 12, 40));

      if (x + (maxTipWidth / 2) > chartRect.x2 - labelOffset.right - 10) {
        maxTipType = 'right';
        x -= (maxTipWidth / 2) - (arrowSize * 2);
      } else if (x - (maxTipWidth / 2) < chartRect.x1 + labelOffset.left + 10) {
        maxTipType = 'left';
        x += (maxTipWidth / 2) - (arrowSize * 2);
      }
      ctx.restore();
      this.showMaxTip({
        context: ctx,
        type: maxTipType,
        width: maxTipWidth,
        height: maxTipHeight,
        opt: maxTipOpt,
        x,
        y,
        arrowSize,
        borderRadius,
        maxValue,
      });
    }
  }

  showMaxTip(param) {
    const { type, width, height, x, y, arrowSize, borderRadius, maxValue, opt } = param;
    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = 'bold 14px Roboto';

    ctx.fillStyle = opt.background;
    ctx.shadowColor = opt.color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.moveTo(sx + borderRadius, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + borderRadius);
    ctx.lineTo(sx, ey - borderRadius);
    ctx.quadraticCurveTo(sx, ey, sx + borderRadius, ey);

    if (type === 'left') {
      ctx.lineTo(sx + borderRadius + arrowSize, ey + arrowSize);
      ctx.lineTo(sx + borderRadius + (arrowSize * 2), ey);
      ctx.lineTo(ex - borderRadius, ey);
    } else if (type === 'right') {
      ctx.lineTo(ex - (arrowSize * 2) - borderRadius, ey);
      ctx.lineTo(ex - arrowSize - borderRadius, ey + arrowSize);
      ctx.lineTo(ex - borderRadius, ey);
    } else {
      ctx.lineTo(x - arrowSize, ey);
      ctx.lineTo(x, ey + arrowSize);
      ctx.lineTo(x + arrowSize, ey);
      ctx.lineTo(ex - borderRadius, ey);
    }

    ctx.quadraticCurveTo(ex, ey, ex, ey - borderRadius);
    ctx.lineTo(ex, sy + borderRadius);
    ctx.quadraticCurveTo(ex, sy, ex - borderRadius, sy);
    ctx.lineTo(sx + borderRadius, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.font = 'bold 14px Roboto';
    ctx.fillStyle = opt.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${maxValue}`, x, sy + (height / 2));
    ctx.restore();
  }

  itemHighlight(item, context) {
    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.color;

    if (x !== null && y !== null) {
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.pointSize, x, y);
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
      const sx = gdata[m].xp;
      const sy = gdata[m].yp;
      const ex = sx + gdata[m].w;
      const ey = sy + gdata[m].h;

      if ((sx - 2 <= xp) && (xp <= ex + 2)) {
        item.data = gdata[m];

        if ((ey - 2 <= yp) && (yp <= sy + 2)) {
          item.hit = true;
        }
        return item;
      } else if (sx + 2 < xp) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }
}

export default Line;
