import { merge } from 'lodash-es';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';
import { HEAT_MAP_OPTION } from '../helpers/helpers.constant';

class HeatMap {
  constructor(sId, opt) {
    const merged = merge({}, HEAT_MAP_OPTION, opt);
      Object.keys(merged).forEach((key) => {
        this[key] = merged[key];
    });

    this.sId = sId;
    this.data = [];
    this.valueOpt = {};
    this.size = {
      w: 0,
      h: 0,
    };
    this.type = 'heatMap';
  }

  /**
   * create series color axis
   * @param colorOpt
   * @returns {*[]}
   */
  createColorAxis(colorOpt) {
    const colorAxis = [];
    const { min, max, categoryCnt, error, border } = colorOpt;

    const minColor = min.includes('#') ? Util.hexToRgb(min) : min;
    const maxColor = max.includes('#') ? Util.hexToRgb(max) : max;

    const [minR, minG, minB] = minColor.split(',');
    const [maxR, maxG, maxB] = maxColor.split(',');

    const unitR = Math.floor((minR - maxR) / (categoryCnt - 1));
    const unitG = Math.floor((minG - maxG) / (categoryCnt - 1));
    const unitB = Math.floor((minB - maxB) / (categoryCnt - 1));

    for (let ix = 0; ix < categoryCnt; ix++) {
       const r = +minR - (unitR * ix);
       const g = +minG - (unitG * ix);
       const b = +minB - (unitB * ix);

       colorAxis.push({
         id: `color#${ix}`,
         value: `rgb(${r},${g},${b})`,
         state: 'normal',
         show: true,
       });
    }

    if (this.valueOpt.existError) {
      colorAxis.push({
        id: `color#${categoryCnt}`,
        value: colorOpt.error,
        state: 'normal',
        show: true,
      });
    }

    this.colorAxis = colorAxis;
    this.errorColor = error;
    this.borderColor = border;
  }

  getColorIndex(value) {
    const existError = this.valueOpt.existError;
    const maxIndex = this.colorAxis.length;
    if (value < 0) {
      return maxIndex - 1;
    }

    const colorIndex = Math.floor(value / this.valueOpt.interval);
    if (colorIndex >= maxIndex) {
      return existError ? maxIndex - 2 : maxIndex - 1;
    }

    return colorIndex;
  }

  drawItem(ctx, xp, yp) {
    ctx.beginPath();
    ctx.strokeRect(xp - this.size.w, yp + Math.SQRT2, this.size.w, this.size.h);
    ctx.fillRect(xp - this.size.w, yp + Math.SQRT2, this.size.w, this.size.h);
    ctx.closePath();
    ctx.stroke();
  }

  draw(param) {
    if (!this.show) {
      return;
    }

    const { ctx, chartRect, labelOffset, axesSteps, labels } = param;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.size.w = xArea / labels.x.length;
    this.size.h = xArea / labels.y.length;

    this.data.forEach((item) => {
      item.xp = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      item.yp = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      const { xp, yp, o: value } = item;

      if (xp !== null && yp !== null) {
        const colorIndex = this.getColorIndex(value);
        const opacity = this.colorAxis[colorIndex].state === 'downplay' ? 0.1 : 1;
        item.dataColor = value < 0 ? this.errorColor : this.colorAxis[colorIndex].value;
        item.cId = this.colorAxis[colorIndex].id;
        if (this.colorAxis[colorIndex].show) {
          ctx.strokeStyle = Util.colorStringToRgba(this.borderColor, opacity);
          ctx.fillStyle = Util.colorStringToRgba(item.dataColor, opacity);
          this.drawItem(ctx, xp, yp);
        }
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
    return gdata.filter(seriesData =>
      (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
        && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));
  }

  /**
   * Draw item highlight
   * @param {object}   item       object for drawing series data
   * @param {object}   context    canvas context
   *
   * @returns {undefined}
   */
  itemHighlight(item, context) {
    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.save();
    if (x !== null && y !== null) {
      const color = gdata.dataColor;
      ctx.strokeStyle = Util.colorStringToRgba(color, 1);
      ctx.fillStyle = Util.colorStringToRgba(color, this.highlight.maxShadowOpacity);
      this.drawItem(ctx, x, y);
    }

    ctx.restore();
  }

  /**
   * Find graph item for tooltip
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findGraphData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = {
      data: null,
      hit: false,
      color: null,
      name: null,
    };
    const wSize = this.size.w;
    const hSize = this.size.h;
    const gdata = this.data;

    const foundItem = gdata.find((data) => {
      const x = data.xp;
      const y = data.yp;

      return (x - wSize <= xp)
        && (xp <= x)
        && (y <= yp)
        && (yp <= y + hSize);
    });

    if (foundItem) {
      item.data = foundItem;
      item.color = foundItem.dataColor;
      item.hit = true;
    }

    return item;
  }
}

export default HeatMap;
