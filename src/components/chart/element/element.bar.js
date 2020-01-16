import { merge } from 'lodash-es';
import { COLOR, BAR_OPTION } from '../helpers/helpers.constant';
import Canvas from '../helpers/helpers.canvas';

class Bar {
  constructor(sId, opt, sIdx) {
    const merged = merge({}, BAR_OPTION, opt);
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

  draw(param) {
    if (!this.show) {
      return;
    }

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const isHorizontal = param.isHorizontal;
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
    if (this.isExistGrp) {
      bArea = (cArea - (cPad * 2));
    } else {
      bArea = (cArea - (cPad * 2)) / showSeriesCount;
    }
    let w = isHorizontal ? null : Math.round(bArea * thickness);
    let h = isHorizontal ? Math.round(bArea * thickness) : null;

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

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line
      item.w = w; // eslint-disable-line
      item.h = isHorizontal ? -h : h; // eslint-disable-line
    });
  }

  itemHighlight(item, context) {
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
    ctx.restore();
  }

  findGraphData(offset, isHorizontal) {
    return isHorizontal ? this.findGraphRangeCount(offset) : this.findGraphRange(offset);
  }

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
