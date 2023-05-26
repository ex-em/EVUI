import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class RealTimeScatter {
  constructor(sId, opt, sIdx) {
    const merged = merge({}, LINE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor', 'overflowColor'].forEach((colorProp) => {
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
    const displayOverflow = param.displayOverflow;
    const duple = param.duple;

    let x;
    let y;
    let aliasPixel;
    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;
    const pointStyle = typeof this.pointStyle === 'string' ? this.pointStyle : this.pointStyle.value;
    const pointSize = typeof this.pointSize === 'number' ? this.pointSize : this.pointSize.value;

    for (let i = 0; i < this.data[this.sId].dataGroup.length; i++) {
      for (let j = 0; j < this.data[this.sId].dataGroup[i].data.length; j++) {
        const item = this.data[this.sId].dataGroup[i].data[j];

        if (!duple.has(`${item.x}${item.y}`)) {
          duple.add(`${item.x}${item.y}`);

          x = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
          y = Canvas.calculateY(
            displayOverflow && item.y > minmaxY.graphMax
              ? minmaxY.graphMax
              : item.y,
            minmaxY.graphMin,
            minmaxY.graphMax,
            yArea,
            ysp,
          );

          if (x !== null) {
            aliasPixel = Util.aliasPixel(x);
            x += aliasPixel;
          }

          item.xp = x;
          item.yp = y;

          if (item.xp !== null && item.yp !== null) {
            const overflowColor = item.y > minmaxY.graphMax && this.overflowColor;
            const color = overflowColor || item.color || this.color;

            ctx.strokeStyle = color;

            const pointFillColor = overflowColor || this.pointFill || item.color || this.color;
            ctx.fillStyle = pointFillColor;

            Canvas.drawPoint(ctx, pointStyle, pointSize, item.xp, item.yp);
          }
        }
      }
    }
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
    const wholeData = [];

    for (let j = 0; j < gdata[this.sId].dataGroup.length; j++) {
      const obj = gdata[this.sId].dataGroup[j];
      for (let k = 0; k < obj.data.length; k++) {
        wholeData.push(obj.data[k]);
      }
    }

    const items = wholeData.filter(seriesData =>
        (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
        && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));

    return items;
  }
}

export default RealTimeScatter;
