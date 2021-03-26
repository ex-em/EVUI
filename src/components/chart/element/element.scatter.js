import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Scatter {
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

    this.sId = sId;
    this.data = [];
    this.type = 'scatter';
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

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;

    let x;
    let y;
    let aliasPixel;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.data.forEach((item) => {
      x = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      if (x !== null) {
        aliasPixel = Util.aliasPixel(x);
        x += aliasPixel;
      }


      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line

      return item;
    }, this.data[0]);

    const opacity = this.state === 'downplay' ? 0.1 : 1;
    ctx.fillStyle = `rgba(${Util.hexToRgb(this.pointFill)},${opacity})` || '';
    ctx.strokeStyle = `rgba(${Util.hexToRgb(this.color)},${opacity})` || '';

    this.data.forEach((curr) => {
      if (curr.xp !== null && curr.yp !== null) {
        Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
      }
    });
  }

  /**
   *Returns items in range
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, ysp, width, height }) {
    const gdata = this.data;
    const xep = xsp + width;
    const yep = ysp + height;
    const items = gdata.filter(seriesData =>
        (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
        && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));

    return items;
  }
}

export default Scatter;
