import { defaultsDeep } from 'lodash-es';
import { numberWithComma } from '@/common/utils';
import { COLOR, BAR_OPTION } from '../helpers/helpers.constant';
import Canvas from '../helpers/helpers.canvas';

class Bar {
  constructor(sId, opt, sIdx, isHorizontal) {
    const merged = defaultsDeep({}, opt, BAR_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    if (this.color === undefined) {
      this.color = COLOR[sIdx];
    }

    this.type = 'bar';
    this.sId = sId;
    this.data = [];
    this.isHorizontal = isHorizontal;
    this.size = {
      cat: 0,
      bar: 0,
      cPad: 0,
      bPad: 0,
      w: 0,
      h: 0,
      ix: 0,
    };
  }

  /**
   * Draw series data
   * @param {object} param     object for drawing series data
   *
   * @returns {undefined}
   */
  draw(param) {
    if (!this.show) {
      return;
    }

    const { isHorizontal, showValue } = this;

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const thickness = param.thickness;
    const showSeriesCount = param.showSeriesCount;

    let x;
    let y;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const dArea = isHorizontal ? yArea : xArea;
    const cArea = dArea / (this.data.length || 1);
    const cPad = 2;

    let bArea;
    let w;
    let h;

    bArea = (cArea - (cPad * 2));
    bArea = this.isExistGrp ? bArea : bArea / showSeriesCount;

    const size = Math.round(bArea * thickness);

    w = isHorizontal ? null : size;
    h = isHorizontal ? size : null;

    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    const barSeriesX = this.isExistGrp ? 1 : showIndex + 1;

    this.size.cat = cArea;
    this.size.bar = bArea;
    this.size.cPad = cPad;
    this.size.bPad = bPad;
    this.size.w = w;
    this.size.ix = barSeriesX;

    let categoryPoint = null;

    ctx.beginPath();
    ctx.fillStyle = this.color;

    this.data.forEach((item, index) => {
      if (isHorizontal) {
        categoryPoint = ysp - (cArea * index) - cPad;
      } else {
        categoryPoint = xsp + (cArea * index) + cPad;
      }

      if (isHorizontal) {
        x = xsp;
        y = Math.round(categoryPoint - ((bArea * barSeriesX) - (h + bPad)));
      } else {
        x = Math.round(categoryPoint + ((bArea * barSeriesX) - (w + bPad)));
        y = ysp;
      }

      if (isHorizontal) {
        if (item.b) {
          w = Canvas.calculateX(item.x - item.b, minmaxX.graphMin, minmaxX.graphMax, xArea);
          x = Canvas.calculateX(item.b, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        } else {
          w = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea);
        }
      } else if (item.b) { // vertical stack bar chart
        h = Canvas.calculateY(item.y - item.b, minmaxY.graphMin, minmaxY.graphMax, yArea);
        y = Canvas.calculateY(item.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else { // vertical bar chart
        h = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea);
      }

      ctx.fillRect(x, y, w, isHorizontal ? -h : h);


      if (showValue.use) {
        ctx.save();

        const value = numberWithComma(isHorizontal ? item.x : item.y);

        ctx.font = `normal normal normal ${showValue.fontSize}px Roboto`;
        ctx.fillStyle = showValue.textColor;
        ctx.lineWidth = 1;
        ctx.textBaseline = isHorizontal ? 'middle' : 'bottom';
        ctx.textAlign = 'center';

        const vw = Math.round(ctx.measureText(value).width);
        const vh = showValue.fontSize + 4;

        if (vw < w && vh < Math.abs(h)) {
          if (isHorizontal) {
            ctx.fillText(value, x + w - vw, y - (h / 2));
          } else {
            ctx.fillText(value, x + (w / 2), y + h + vh);
          }
        }

        ctx.restore();
      }

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line
      item.w = w; // eslint-disable-line
      item.h = isHorizontal ? -h : h; // eslint-disable-line
    });
  }

  /**
   * Draw item highlight
   * @param {object}  item       object for drawing series data
   * @param {object}  context    canvas context
   *
   * @returns {undefined}
   */
  itemHighlight(item, context) {
    const isHorizontal = this.isHorizontal;
    const showValue = this.showValue;

    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;
    const w = gdata.w;
    const h = gdata.h;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = this.color;

    ctx.fillRect(x, y, w, h);

    if (showValue.use) {
      ctx.save();

      const value = numberWithComma(isHorizontal ? gdata.x : gdata.y);

      ctx.font = `normal normal normal ${showValue.fontSize}px Roboto`;
      ctx.fillStyle = showValue.textColor;
      ctx.lineWidth = 1;
      ctx.textBaseline = isHorizontal ? 'middle' : 'bottom';
      ctx.textAlign = 'center';

      const vw = Math.round(ctx.measureText(value).width);
      const vh = showValue.fontSize + 4;

      if (vw < w && vh < Math.abs(h)) {
        if (isHorizontal) {
          ctx.fillText(value, x + w - vw, y + (h / 2));
        } else {
          ctx.fillText(value, x + (w / 2), y + h + vh);
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   * @param {boolean}  isHorizontal    determines if a horizontal option's value
   *
   * @returns {object} graph item
   */
  findGraphData(offset, isHorizontal) {
    return isHorizontal ? this.findGraphRangeCount(offset) : this.findGraphRange(offset);
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphRange(offset) {
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

      if ((sx <= xp) && (xp <= ex)) {
        item.data = gdata[m];
        item.index = m;

        if ((ey <= yp) && (yp <= sy)) {
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

  /**
   * Find graph item (horizontal)
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphRangeCount(offset) {
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

      if ((ey <= yp) && (yp <= sy)) {
        item.data = gdata[m];
        item.index = m;

        if ((sx <= xp) && (xp <= ex)) {
          item.hit = true;
        }
        return item;
      } else if (ey < yp) {
        e = m - 1;
      } else {
        s = m + 1;
      }
    }

    return item;
  }
}

export default Bar;
