import { defaultsDeep } from 'lodash-es';
import { numberWithComma } from '@/common/utils';
import { COLOR, BAR_OPTION } from '../helpers/helpers.constant';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';

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

    const opacity = this.state === 'downplay' ? 0.1 : 1;
    ctx.fillStyle = `rgba(${Util.hexToRgb(this.color)},${opacity})` || '';

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
        this.drawValueLabels({
          context: ctx,
          data: item,
          positions: {
            x,
            y,
            h,
            w,
          },
          isHighlight: false,
        });
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
      this.drawValueLabels({
        context: ctx,
        data: gdata,
        positions: {
          x,
          y,
          h,
          w,
        },
        isHighlight: true,
      });
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

  drawValueLabels({ context, data, positions, isHighlight }) {
    const isHorizontal = this.isHorizontal;
    const showValue = this.showValue;
    const { x, y, w, h } = positions;
    const ctx = context;

    ctx.save();

    const value = numberWithComma(isHorizontal ? data.x : data.y);

    ctx.font = `normal normal normal ${showValue.fontSize}px Roboto`;
    ctx.fillStyle = showValue.textColor;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = isHorizontal && showValue.align !== 'center' ? 'left' : 'center';

    const vw = Math.round(ctx.measureText(value).width);
    const vh = showValue.fontSize + 4;
    const minXPos = x + 10;
    const minYPos = y - 10;
    const centerX = x + (w / 2) <= minXPos ? minXPos : x + (w / 2);
    const centerY = y + (h / 2) >= minYPos ? minYPos : y + (h / 2);
    const centerYHorizontal = isHighlight ? centerY : y - (h / 2);

    switch (showValue.align) {
      case 'start':
        if (isHorizontal) {
          ctx.fillText(value, minXPos, centerYHorizontal);
        } else {
          ctx.fillText(value, centerX, minYPos);
        }
        break;
      case 'center':
        if (isHorizontal) {
          ctx.fillText(value, centerX, centerYHorizontal);
        } else {
          ctx.fillText(value, centerX, centerY);
        }
        break;
      case 'out':
        if (isHorizontal) {
          ctx.fillText(value, minXPos + w, centerYHorizontal);
        } else {
          ctx.fillText(value, centerX, y + h - (vh / 2));
        }
        break;
      case 'end':
      default:
        if (isHorizontal) {
          const xPos = x + w - (vw * 2);
          ctx.fillText(value, xPos <= minXPos ? minXPos : xPos, centerYHorizontal);
        } else {
          const yPos = y + h + vh;
          ctx.fillText(value, centerX, yPos >= minYPos ? minYPos : yPos);
        }
        break;
    }

    ctx.restore();
  }
}

export default Bar;
