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
    const { min, max, categoryCnt, error, stroke } = colorOpt;

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
    this.stroke = stroke;
  }

  getColorIndex(value) {
    const existError = this.valueOpt.existError;
    const maxIndex = this.colorAxis.length - 1;
    if (existError && value < 0) {
      return maxIndex;
    }

    const colorIndex = Math.floor(value / this.valueOpt.interval);
    if (colorIndex >= maxIndex) {
      return existError ? maxIndex - 1 : maxIndex;
    }

    return colorIndex;
  }

  drawItem(ctx, x, y, w, h) {
    ctx.beginPath();
    if (this.stroke.show) {
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);
    } else {
      const aliasPixel = Util.aliasPixel(1);
      ctx.fillRect(
        x,
        y - aliasPixel,
        w + aliasPixel,
        h + aliasPixel,
      );
    }
    ctx.closePath();
  }

  calculateXY(dir, value, startPoint) {
    let point = null;

    if (this.labels[dir] && this.labels[dir].length) {
      const index = this.labels[dir].findIndex(label => label === value);

      if (index > -1) {
        point = dir === 'x'
          ? startPoint + (this.size.w * index)
          : startPoint - (this.size.h * (index + 1));
      } else {
        const timeIndex = this.labels[dir].findIndex(label =>
          new Date(label).getTime() === new Date(value).getTime(),
        );
        if (timeIndex > -1) {
          point = dir === 'x'
            ? startPoint + (this.size.w * timeIndex)
            : startPoint - (this.size.h * (timeIndex + 1));
        }
      }
    }

    return point;
  }

  draw(param) {
    if (!this.show) {
      return;
    }

    const { ctx, chartRect, labelOffset } = param;

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    this.size.w = xArea / this.labels.x.length;
    this.size.h = yArea / this.labels.y.length;

    this.data.forEach((item) => {
      let xp = this.calculateXY('x', item.x, xsp);
      let yp = this.calculateXY('y', item.y, ysp);
      let w = this.size.w;
      let h = this.size.h;
      const value = item.o;

      if (xp !== null && yp !== null
         && (value !== null && value !== undefined)) {
        const colorIndex = this.getColorIndex(value);
        const opacity = this.colorAxis[colorIndex].state === 'downplay' ? 0.1 : 1;
        item.dataColor = value < 0 ? this.errorColor : this.colorAxis[colorIndex].value;
        item.cId = this.colorAxis[colorIndex].id;
        if (this.colorAxis[colorIndex].show) {
          ctx.fillStyle = Util.colorStringToRgba(item.dataColor, opacity);
          if (this.stroke.show) {
            const { color, lineWidth, opacity: sOpacity } = this.stroke;
            ctx.strokeStyle = Util.colorStringToRgba(
              color,
              opacity === 1 ? sOpacity : opacity,
            );
            ctx.lineWidth = lineWidth;
            xp += (lineWidth * 1.5);
            yp += (lineWidth * 1.5);
            w -= (lineWidth * 2);
            h -= (lineWidth * 2);
          }
          this.drawItem(ctx, xp, yp, w, h);

          if (this.showValue.use) {
            this.drawValueLabels({
              context: ctx,
              data: item,
              positions: {
                x: xp,
                y: yp,
                w,
                h,
              },
            });
          }
        }

        item.xp = xp;
        item.yp = yp;
        item.w = w;
        item.h = h;
      }
    });
  }

  /**
   * Draw value label if series 'use' of showValue option is true
   *
   * @param context           canvas context
   * @param data              series value data (model.store.js addData return value)
   */
  drawValueLabels({ context, data, positions }) {
    const { fontSize, textColor, align, formatter, decimalPoint } = this.showValue;
    const { x, y, w, h } = positions;
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

    if (vw >= w || vh >= h || formattedTxt < 0) {
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
    return gdata.filter(({ xp, yp, w, h }) => {
      const x1 = xp;
      const x2 = xp + w;
      const y1 = yp;
      const y2 = yp + h;

      return ((x1 >= xsp && x1 <= xep) && (y1 >= ysp && y1 <= yep))
         || ((x1 >= xsp && x1 <= xep) && (y2 >= ysp && y2 <= yep))
         || ((x2 >= xsp && x2 <= xep) && (y1 >= ysp && y1 <= yep))
        || ((x2 >= xsp && x2 <= xep) && (y2 >= ysp && y2 <= yep));
    });
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
    const w = gdata.w;
    const h = gdata.h;

    ctx.save();
    if (x !== null && y !== null) {
      const color = gdata.dataColor;
      ctx.strokeStyle = Util.colorStringToRgba(color, 1);
      ctx.fillStyle = Util.colorStringToRgba(color, this.highlight.maxShadowOpacity);
      ctx.shadowColor = color;
      this.drawItem(ctx, x, y, w, h);

      if (this.showValue.use) {
        this.drawValueLabels({
          context: ctx,
          data: gdata,
          positions: {
            x,
            y,
            w,
            h,
          },
        });
      }
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

  findBlockRange({ xcp, xep, ycp, yep, range }) {
    const { x: labelX, y: labelY } = this.labels;

    const blockRange = {
      xsp: Math.min(xcp, xep),
      ysp: Math.min(ycp, yep),
      width: Math.ceil(Math.abs(xep - xcp)),
      height: Math.ceil(Math.abs(yep - ycp)),
    };

    if (labelX.length && labelY.length) {
      const { x1, x2, y1, y2 } = range;
      const gapX = (x2 - x1) / labelX.length;
      const gapY = (y2 - y1) / labelY.length;

      const point = {
        xsp: xcp,
        xep,
        ysp: ycp,
        yep,
      };

      const setPoint = (type, dir) => {
        let itemPoint;
        let list;
        let target;
        let gap;
        let key;
        let start;
        const isStart = dir === 'start';

        if (type === 'x') {
          list = labelX;
          gap = gapX;
          target = isStart ? Math.min(xcp, xep) : Math.max(xcp, xep);
          key = isStart ? 'xsp' : 'xep';
          start = x1;
        } else {
          list = labelY;
          gap = gapY;
          target = isStart ? Math.min(ycp, yep) : Math.max(ycp, yep);
          key = isStart ? 'ysp' : 'yep';
          start = y1;
        }

        const findItem = list.findIndex((item, index) => {
          itemPoint = Math.round(start + (gap * index)) + Util.aliasPixel(1);
          return itemPoint <= target && target <= itemPoint + gap;
        });

        if (findItem > -1) {
          point[key] = isStart ? itemPoint : itemPoint + gap;
        }
      };

      setPoint('x', 'start');
      setPoint('x', 'end');
      setPoint('y', 'start');
      setPoint('y', 'end');

      blockRange.xsp = Math.min(point.xsp, point.xep);
      blockRange.ysp = Math.min(point.ysp, point.yep);
      blockRange.width = Math.abs(point.xep - point.xsp);
      blockRange.height = Math.abs(point.yep - point.ysp);
    }

    return blockRange;
  }

  findSelectionRange(rangeInfo) {
    const { xcp, ycp, width, height, range } = rangeInfo;

    let selectionRange = null;

    const { x1, x2, y1, y2 } = range;
    const { x: labelX, y: labelY } = this.labels;

    if (labelX.length && labelY.length) {
      const gapX = (x2 - x1) / labelX.length;
      const gapY = (y2 - y1) / labelY.length;

      const xsp = xcp;
      const xep = xcp + width;
      const ysp = ycp;
      const yep = ycp + height;

      const xIndex = {
        min: Math.floor((xsp - x1) / gapX),
        max: Math.floor((xep - x1 - gapX) / gapX),
      };

      const lastIndexY = labelY.length - 1;
      const yIndex = {
        min: lastIndexY - Math.floor((yep - y1 - gapY) / gapY),
        max: lastIndexY - Math.floor((ysp - y1) / gapY),
      };

      selectionRange = {
        xMin: labelX[xIndex.min],
        xMax: labelX[xIndex.max],
        yMin: labelY[yIndex.min],
        yMax: labelY[yIndex.max],
      };
    }

    return selectionRange;
  }
}

export default HeatMap;
