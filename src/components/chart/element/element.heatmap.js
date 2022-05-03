import { merge } from 'lodash-es';
import Util from '../helpers/helpers.util';
import { HEAT_MAP_OPTION } from '../helpers/helpers.constant';
import { convertToPercent } from '../../../common/utils';

class HeatMap {
  constructor(sId, opt, colorOpt, isGradient) {
    const merged = merge({}, HEAT_MAP_OPTION, opt);
      Object.keys(merged).forEach((key) => {
        this[key] = merged[key];
    });

    this.createColorAxis(colorOpt);

    this.sId = sId;
    this.data = [];
    this.labels = {};
    this.valueOpt = {};
    this.isGradient = isGradient;
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
    const regex = /[^0-9]&[^,]/g;
    const { min, max, categoryCnt, error, stroke } = colorOpt;

    const minColor = min.includes('#') ? Util.hexToRgb(min) : min.replace(regex, '');
    const maxColor = max.includes('#') ? Util.hexToRgb(max) : max.replace(regex, '');

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
        color: `rgb(${r},${g},${b})`,
        state: 'normal',
        show: true,
       });
    }

    this.colorState = {
      min: minColor,
      max: maxColor,
      categoryCnt,
      start: 0,
      end: 100,
      selectedValue: null,
    };
    this.colorAxis = colorAxis;
    this.errorColor = error;
    this.stroke = stroke;
  }

  getColorForGradient(value, min, max) {
    const regex = /[^0-9]&[^,]/g;

    const minColor = min.includes('#') ? Util.hexToRgb(min) : min.replace(regex, '');
    const maxColor = max.includes('#') ? Util.hexToRgb(max) : max.replace(regex, '');

    const [minR, minG, minB] = minColor.split(',');
    const [maxR, maxG, maxB] = maxColor.split(',');

    const r = +minR - Math.floor(((minR - maxR) * value) / 100);
    const g = +minG - Math.floor(((minG - maxG) * value) / 100);
    const b = +minB - Math.floor(((minB - maxB) * value) / 100);

    return `rgb(${r},${g},${b})`;
  }

  getColorIndex(value) {
    const { existError, min, interval, decimalPoint } = this.valueOpt;
    const maxIndex = this.colorAxis.length - 1;
    if (existError && value < 0) {
      return maxIndex;
    }

    const colorIndex = Math.floor(+(value - min).toFixed(decimalPoint) / interval);

    if (colorIndex >= maxIndex) {
      return existError ? maxIndex - 1 : maxIndex;
    }

    return colorIndex;
  }

  getColorState(value) {
    const { min, max } = this.valueOpt;
    const colorState = {
      show: false,
      opacity: 0,
      dataColor: null,
      id: null,
      isHighlight: null,
    };
    if (this.isGradient) {
      const ratio = convertToPercent(value - min, max - min);
      const { start, end, min: minColor, max: maxColor, selectedValue } = this.colorState;
      if (value < 0 || (start <= ratio && ratio <= end)) {
        colorState.show = true;
        colorState.isHighlight = selectedValue
          && value === (min + Math.round((max - min) * (selectedValue / 100)));
        colorState.opacity = 1;
        colorState.dataColor = value < 0
          ? this.errorColor : this.getColorForGradient(ratio, minColor, maxColor);
      }
    } else {
      const colorIndex = this.getColorIndex(value);
      const { show, state, color, id } = this.colorAxis[colorIndex];
      colorState.show = show;
      colorState.opacity = state === 'downplay' ? 0.1 : 1;
      colorState.dataColor = value < 0 ? this.errorColor : color;
      colorState.id = id;
    }
    return colorState;
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

    const { ctx, chartRect, labelOffset, overlayCtx } = param;

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
        const { show, opacity, dataColor, id, isHighlight } = this.getColorState(value);
        item.dataColor = dataColor;
        item.cId = id;
        ctx.save();
        if (show) {
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
          ctx.restore();

          item.xp = xp;
          item.yp = yp;
          item.w = w;
          item.h = h;

          if (this.showValue.use) {
            this.drawValueLabels({
              context: ctx,
              data: item,
            });
          }
          if (isHighlight) {
            this.itemHighlight({
              data: item,
            }, overlayCtx);
          }
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
    const { xp: x, yp: y, w, h, o: value } = data;
    const ctx = context;

    ctx.save();
    ctx.beginPath();

    ctx.font = `normal normal normal ${fontSize}px Roboto`;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align !== 'center' ? 'left' : 'center';

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
    const cId = gdata.cId;

    let isShow;
    if (this.isGradient) {
      const { min, max } = this.valueOpt;
      const ratio = convertToPercent(gdata.o - min, max - min);
      const { start, end } = this.colorState;
      isShow = start <= ratio && ratio <= end;
    } else {
      isShow = this.colorAxis.find(({ id }) => id === cId)?.show;
    }
    ctx.save();
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;

    if (x !== null && y !== null && isShow) {
      const color = gdata.dataColor;
      ctx.shadowColor = Util.colorStringToRgba('#605F5F');
      ctx.strokeStyle = Util.colorStringToRgba(color);
      ctx.fillStyle = Util.colorStringToRgba(color);
      this.drawItem(ctx, x - 2, y - 2, w + 4, h + 4);

      ctx.restore();

      if (this.showValue.use) {
        this.drawValueLabels({
          context: ctx,
          data: gdata,
        });
      }
    }
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
    const labels = this.labels;

    const blockRange = {
      xsp: Math.min(xcp, xep),
      ysp: Math.min(ycp, yep),
      width: Math.ceil(Math.abs(xep - xcp)),
      height: Math.ceil(Math.abs(yep - ycp)),
    };

    if (labels.x.length && labels.y.length) {
      const { x1, x2, y1, y2 } = range;
      const gapX = (x2 - x1) / labels.x.length;
      const gapY = (y2 - y1) / labels.y.length;

      const point = {
        xsp: xcp,
        xep,
        ysp: ycp,
        yep,
      };

      const setPoint = (dir, target, key) => {
        let itemPoint;
        let gap;
        let startPoint;

        if (dir === 'x') {
          gap = gapX;
          startPoint = x1;
        } else {
          gap = gapY;
          startPoint = y1;
        }

        const findItem = labels[dir].findIndex((item, index) => {
          itemPoint = Math.round(startPoint + (gap * index)) + Util.aliasPixel(1);
          return itemPoint <= target && target <= itemPoint + gap;
        });

        if (findItem > -1) {
          point[key] = ['xsp', 'ysp'].includes(key) ? itemPoint : itemPoint + gap;
        }
      };

      setPoint('x', Math.min(xcp, xep), 'xsp');
      setPoint('x', Math.max(xcp, xep), 'xep');
      setPoint('y', Math.min(ycp, yep), 'ysp');
      setPoint('y', Math.max(ycp, yep), 'yep');

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
