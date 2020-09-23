import Canvas from '../helpers/helpers.canvas';
import Bar from './element.bar';

class TimeBar extends Bar {
  /**
   * Draw series data
   * It shows partial bar item as time goes by.
   * @param {object} param     object for drawing series data
   *
   * @returns {undefined}
   */
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
    const xep = chartRect.x2 - labelOffset.right;

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
    let subW = isHorizontal ? null : Math.round(bArea * thickness);
    let h = isHorizontal ? Math.round(bArea * thickness) : null;

    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    const barSeriesX = this.isExistGrp ? 1 : showIndex + 1;

    this.size.cat = cArea;
    this.size.bar = bArea;
    this.size.cPad = cPad;
    this.size.bPad = bPad;
    this.size.w = w;
    this.size.ix = barSeriesX;

    ctx.beginPath();
    ctx.fillStyle = this.color;

    this.data.forEach((item) => {
      if (isHorizontal) {
        x = xsp;
        y = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else {
        x = Canvas.calculateSubX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        if (x < xsp) {
          subW -= xsp - x;
          x = (x + w < xsp) ? null : xsp;
        } else if (x + w > xep) {
          subW -= subW - (xep - x);
        }

        if (x >= xep) {
          x = null;
        }

        if (x !== null) {
          x += Math.ceil(bArea * barSeriesX) - Math.round(w + bPad);
        }
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

      if (x !== null && y !== null) {
        ctx.fillRect(x, y, w !== subW ? subW : w, isHorizontal ? -h : h);
      }
      subW = w;

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line
      item.w = w !== subW ? subW : w; // eslint-disable-line
      item.h = isHorizontal ? -h : h; // eslint-disable-line
    });
  }
}

export default TimeBar;
