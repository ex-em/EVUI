import { merge } from 'lodash-es';
import Util from '../helpers/helpers.util';
import { HEAT_MAP_OPTION } from '../helpers/helpers.constant';

class HeatMap {
  constructor(sId, opt, colorOpt) {
    const merged = merge({}, HEAT_MAP_OPTION, opt);
      Object.keys(merged).forEach((key) => {
        this[key] = merged[key];
    });

    this.createColorAxis(colorOpt);

    this.sId = sId;
    this.data = [];
    this.labels = {};
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

  drawItem(ctx, xp, yp, aliasPixel) {
    ctx.beginPath();
    if (this.borderColor) {
      const sizeW = this.size.w - aliasPixel;
      const sizeH = this.size.h - aliasPixel;
      ctx.strokeRect(xp + aliasPixel, yp + aliasPixel, sizeW, sizeH);
      ctx.fillRect(xp + aliasPixel, yp + aliasPixel, sizeW, sizeH);
    } else {
      ctx.fillRect(
        xp,
        yp - aliasPixel,
        this.size.w + aliasPixel,
        this.size.h + aliasPixel,
      );
    }
    ctx.closePath();
  }

  calculateXY(dir, value, startPoint, area, max, min) {
    let point = null;

    if (this.labels[dir] && this.labels[dir].length) {
      const index = this.labels[dir].findIndex(label => label === value);

      if (index > -1) {
        point = dir === 'x'
          ? startPoint + (this.size.w * index)
          : startPoint - (this.size.h * (index + 1));
      }
    } else {
      if (value > max || value < min) {
        return null;
      }

      const scalingFactor = area / (max - min);
      point = dir === 'x'
        ? startPoint + (scalingFactor * (value - min))
        : startPoint - (scalingFactor * (value - (min || 0)));
    }

    return point;
  }

  getSize(dir, area, minMax, axesType) {
    const axes = axesType[dir][0];
    const isCategoryMode = axes.type === 'step' || (axes.type === 'time' && axes.categoryMode);
    const steps = isCategoryMode
      ? this.labels[dir].length
      : this.spaces[dir] || (minMax.graphMax - minMax.graphMin);
    return area / steps;
  }

  draw(param) {
    if (!this.show) {
      return;
    }

    const { ctx, chartRect, labelOffset, axesSteps, axesType } = param;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.size.w = this.getSize('x', xArea, minmaxX, axesType);
    this.size.h = this.getSize('y', yArea, minmaxY, axesType);

    this.data.forEach((item) => {
      item.xp = this.calculateXY('x', item.x, xsp, xArea, minmaxX.graphMax, minmaxX.graphMin);
      item.yp = this.calculateXY('y', item.y, ysp, yArea, minmaxY.graphMax, minmaxY.graphMin);
      item.w = this.size.w;
      item.h = this.size.h;

      const { xp, yp, o: value } = item;

      if (xp !== null && yp !== null && value) {
        const colorIndex = this.getColorIndex(value);
        const opacity = this.colorAxis[colorIndex].state === 'downplay' ? 0.1 : 1;
        item.dataColor = value < 0 ? this.errorColor : this.colorAxis[colorIndex].value;
        item.cId = this.colorAxis[colorIndex].id;
        if (this.colorAxis[colorIndex].show) {
          if (this.borderColor) {
            ctx.strokeStyle = Util.colorStringToRgba(this.borderColor, opacity);
          }
          ctx.fillStyle = Util.colorStringToRgba(item.dataColor, opacity);
          this.drawItem(ctx, xp, yp, Util.aliasPixel(1));
        }

        if (this.showValue.use) {
          this.drawValueLabels({
            context: ctx,
            data: item,
            positions: {
              x: xp,
              y: yp,
              w: item.w,
              h: item.h,
            },
          });
        }
      }
    });
  }

  /**
   * Draw value label if series 'use' of showValue option is true
   *
   * @param context           canvas context
   * @param data              series value data (model.store.js addData return value)
   */
  drawValueLabels({ context, data }) {
    const { fontSize, textColor, align, formatter, decimalPoint } = this.showValue;
    const { xp: x, yp: y, w, h } = data;
    const ctx = context;

    ctx.save();
    ctx.beginPath();

    ctx.font = `normal normal normal ${fontSize}px Roboto`;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align !== 'center' ? 'left' : 'center';

    const value = data.o;

    let formattedTxt;
    if (formatter) {
      formattedTxt = formatter(value);
    }

    if (!formatter || typeof formattedTxt !== 'string') {
      formattedTxt = Util.labelSignFormat(value, decimalPoint);
    }

    const vw = Math.round(ctx.measureText(formattedTxt).width);
    const vh = fontSize;
    const centerX = x + (w / 2);
    const centerY = y + (h / 2);

    if (vw >= w || formattedTxt < 0) {
      return;
    }

    switch (align) {
      case 'top': {
        const xPos = centerX - (vw / 2);
        const yPos = centerY - (vh / 2);
        ctx.fillText(formattedTxt, xPos, yPos);
        break;
      }
      case 'right': {
        const xPos = x + w - vw;
        ctx.fillText(formattedTxt, xPos, centerY);
        break;
      }
      case 'bottom': {
        const xPos = centerX - (vw / 2);
        const yPos = centerY + (vh / 2);
        ctx.fillText(formattedTxt, xPos, yPos);
        break;
      }
      case 'left':
        ctx.fillText(formattedTxt, x, centerY);
        break;
      default: {
        const xPos = centerX - (vw / 2);
        ctx.fillText(formattedTxt, xPos, centerY);
        break;
      }
    }

    ctx.restore();
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
    const gdata = this.data;

    const foundItem = gdata.find((data) => {
      const { xp: x, yp: y, w: wSize, h: hSize } = data;

      return (x <= xp)
        && (xp <= x + wSize)
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
