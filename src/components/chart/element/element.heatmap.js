import { merge } from 'lodash-es';
import { convertToPercent, truthy, truthyNumber, checkNullAndUndefined } from '@/common/utils';
import Util from '../helpers/helpers.util';
import { HEAT_MAP_OPTION } from '../helpers/helpers.constant';

class HeatMap {
  constructor(sId, opt, colorOpt, isHorizontal, isGradient) {
    const merged = merge({}, HEAT_MAP_OPTION, opt);
      Object.keys(merged).forEach((key) => {
        this[key] = merged[key];
    });

    this.isHorizontal = isHorizontal;
    this.isGradient = isGradient;
    this.createColorState(colorOpt);

    this.sId = sId;
    this.data = [];
    this.labels = {
      x: [],
      y: [],
    };
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
  createColorState(colorOpt) {
    const colorState = [];
    const regex = /[^0-9]&[^,]/g;
    const { min, max, rangeCount, colorsByRange, error, stroke } = colorOpt;

    const minColor = min.includes('#') ? Util.hexToRgb(min) : min.replace(regex, '');
    const maxColor = max.includes('#') ? Util.hexToRgb(max) : max.replace(regex, '');

    const [minR, minG, minB] = minColor.split(',');
    const [maxR, maxG, maxB] = maxColor.split(',');

    if (this.isGradient) {
      colorState.push({
        minColor: { minR, minG, minB },
        maxColor: { maxR, maxG, maxB },
        rangeCount,
        start: 0,
        end: 100,
        selectedValue: null,
      });
    } else if (colorsByRange.length) {
      colorsByRange.forEach(({ color, label }, ix) => {
        colorState.push({
          id: `color#${ix}`,
          color,
          label,
          state: 'normal',
          show: true,
        });
      });
    } else {
      const unitR = Math.floor((minR - maxR) / (rangeCount - 1));
      const unitG = Math.floor((minG - maxG) / (rangeCount - 1));
      const unitB = Math.floor((minB - maxB) / (rangeCount - 1));

      for (let ix = 0; ix < rangeCount; ix++) {
        const r = +minR - (unitR * ix);
        const g = +minG - (unitG * ix);
        const b = +minB - (unitB * ix);

        colorState.push({
          id: `color#${ix}`,
          color: `rgb(${r},${g},${b})`,
          state: 'normal',
          show: true,
        });
      }
    }

    this.colorState = colorState;
    this.errorColor = error;
    this.stroke = stroke;
  }

  getColorForGradient(value) {
    const { minColor, maxColor } = this.colorState[0];

    const { minR, minG, minB } = minColor;
    const { maxR, maxG, maxB } = maxColor;

    const r = +minR - Math.floor(((minR - maxR) * value) / 100);
    const g = +minG - Math.floor(((minG - maxG) * value) / 100);
    const b = +minB - Math.floor(((minB - maxB) * value) / 100);

    return `rgb(${r},${g},${b})`;
  }

  getColorIndexByValue(value) {
    const { existError, min, interval, decimalPoint } = this.valueOpt;
    const maxIndex = this.colorState.length - 1;
    if (existError && value < 0) {
      return maxIndex;
    }

    const colorIndex = Math.floor(+(value - min).toFixed(decimalPoint) / interval);

    if (colorIndex >= maxIndex) {
      return existError ? maxIndex - 1 : maxIndex;
    }

    return colorIndex;
  }

  getItemInfo(value) {
    const { min, max } = this.valueOpt;
    const itemInfo = {
      show: false,
      opacity: 1,
      dataColor: null,
      id: null,
      isHighlight: null,
    };
    if (this.isGradient) {
      const ratio = convertToPercent(value - min, max - min);
      const { start, end, selectedValue } = this.colorState[0];
      if (value < 0 || (start <= ratio && ratio <= end)) {
        itemInfo.show = true;
        itemInfo.isHighlight = selectedValue !== null
          && (Math.floor(value) === Math.floor(min + ((max - min) * (selectedValue / 100))));
        itemInfo.dataColor = value < 0
          ? this.errorColor : this.getColorForGradient(ratio);
      }
    } else {
      const colorIndex = this.getColorIndexByValue(value);
      const { show, state, color, id } = this.colorState[colorIndex];
      itemInfo.show = show;
      itemInfo.opacity = state === 'downplay' ? 0.1 : 1;
      itemInfo.dataColor = value < 0 ? this.errorColor : color;
      itemInfo.id = id;
    }
    return itemInfo;
  }

  drawItem(ctx, x, y, w, h, borderOpt) {
    ctx.beginPath();

    if (w < 0 || h < 0) {
      return;
    }

    if (borderOpt.show) {
      const { radius } = borderOpt;
      if (radius > 0) {
        const minSize = Math.min(w, h);
        let r = radius;
        if (r > (minSize / 2)) {
          r = Math.floor(minSize / 2);
        }
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.stroke();
        ctx.fill();
      } else {
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
      }
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

  calculateXY(dir, value, startPoint, minMax) {
    let point = null;

    if (this.labels[dir] && this.labels[dir].length) {
      let index = this.labels[dir].findIndex(label => label === value);

      if (index === -1) {
        index = this.labels[dir].findIndex(label => +label === +value);
      }

      const { minIndex, maxIndex, graphMin, graphMax } = minMax;
      if (truthyNumber(maxIndex) && index > maxIndex) {
        return null;
      }

      if (truthyNumber(minIndex) && index < minIndex) {
        return null;
      }

      if (checkNullAndUndefined(minIndex) && checkNullAndUndefined(maxIndex)) {
        if (value < graphMin || value > graphMax) {
          return null;
        }
      }

      const startIndex = minIndex ?? this.labels[dir].findIndex(label => +label === +graphMin);

      if (index > -1) {
        index -= (startIndex > -1 ? startIndex : 0);
        point = dir === 'x'
          ? startPoint + (this.size.w * index)
          : startPoint - (this.size.h * (index + 1));
      }
    }

    return point;
  }

  draw(param) {
    if (!this.show) {
      return;
    }

    const {
      ctx,
      chartRect,
      labelOffset,
      overlayCtx,
      selectLabel,
      legendHitInfo,
      selectItem,
      axesSteps,
    } = param;

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    this.size.w = xArea / minmaxX.oriSteps;
    this.size.h = yArea / minmaxY.oriSteps;

    const getOpacity = (item, opacity, index) => {
      if (!legendHitInfo) {
        let isDownplay;
        const {
          option: selectedItemOpt,
          selected: selectedItem,
        } = selectItem;

        const {
          option: selectedLabelOpt,
          selected: selectedLabel,
        } = selectLabel;

        const isSelectedItem = truthy(selectedItem?.dataIndex) && selectedItem?.dataIndex > -1;
        const isSelectedLabel = selectedLabel?.label?.length > 0;
        if (isSelectedItem) {
          isDownplay = selectedItemOpt.useSeriesOpacity
            ? index !== selectedItem?.dataIndex
            : false;
        } else if (isSelectedLabel) {
          isDownplay = selectedLabelOpt.useSeriesOpacity
            ? !selectedLabel?.label?.includes(this.getItemLabel(selectLabel, item))
            : false;
        }
        return isDownplay ? 0.1 : 1;
      }
      return opacity;
    };

    this.data.forEach((item, index) => {
      const axisLineWidth = 1;
      let xp = this.calculateXY('x', item.x, xsp, minmaxX);
      let yp = this.calculateXY('y', item.y, ysp, minmaxY);
      let w = this.size.w;
      let h = this.size.h;

      const value = item.o;

      if (xp !== null && yp !== null
         && (value !== null && value !== undefined)) {
        const {
          show,
          opacity,
          dataColor,
          id,
          isHighlight,
        } = this.getItemInfo(value);

        const itemOpacity = getOpacity(item, opacity, index);

        item.dataColor = dataColor;
        item.cId = id;
        ctx.save();

        if (show) {
          ctx.fillStyle = Util.colorStringToRgba(item.dataColor, itemOpacity);

          let borderOpt = this.stroke;
          const selectItemOption = selectItem?.option;
          const useSelectItem = selectItemOption?.use && selectItemOption?.showBorder;
          const isHit = (index === selectItem?.selected?.dataIndex);
          if (useSelectItem && isHit) {
            borderOpt = {
              show: selectItemOption?.showBorder,
              ...selectItemOption?.borderStyle,
            };
          }

          if (borderOpt.show) {
            const { color, lineWidth, opacity: borderOpacity } = borderOpt;
            ctx.strokeStyle = Util.colorStringToRgba(
              color,
              itemOpacity === 1 ? borderOpacity : itemOpacity,
            );

            // item 사이즈 보다 border 선 굵기가 큰 경우 lineWidth props 무시
            if (lineWidth < w && lineWidth < h) {
              ctx.lineWidth = lineWidth;
              xp += (lineWidth * 0.5);
              yp += (lineWidth * 0.5);
              w -= (lineWidth);
              h -= (lineWidth);
            }
          }

          xp += axisLineWidth;

          this.drawItem(ctx, xp, yp, w, h, borderOpt);
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

    let x = gdata.xp;
    let y = gdata.yp;
    let w = gdata.w;
    let h = gdata.h;
    const cId = gdata.cId;

    let isShow;
    if (this.isGradient) {
      const { min, max } = this.valueOpt;
      const ratio = convertToPercent(gdata.o - min, max - min);
      const { start, end } = this.colorState[0];
      isShow = (start <= ratio && ratio <= end) || gdata.o === -1;
    } else {
      isShow = this.colorState.find(({ id }) => id === cId)?.show;
    }
    ctx.save();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    if (x !== null && y !== null && isShow) {
      const color = gdata.dataColor;
      ctx.shadowColor = Util.colorStringToRgba('#959494');
      ctx.strokeStyle = Util.colorStringToRgba(color);
      ctx.fillStyle = Util.colorStringToRgba(color);

      if (this.stroke.show) {
        const { lineWidth } = this.stroke;
        if (lineWidth < w && lineWidth < h) {
          ctx.lineWidth = lineWidth;
          x += (lineWidth * 0.5);
          y += (lineWidth * 0.5);
          w -= (lineWidth);
          h -= (lineWidth);
        }
      }
      this.drawItem(ctx, x - 0.5, y - 0.5, w + 1, h + 1, this.stroke);

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

    const itemIndex = gdata.findIndex((data) => {
      const { xp: x, yp: y, w: wSize, h: hSize } = data;

      return (x <= xp)
        && (xp <= x + wSize)
        && (y <= yp)
        && (yp <= y + hSize);
    });

    if (itemIndex > -1) {
      const foundItem = gdata[itemIndex];
      item.data = foundItem;
      item.color = foundItem.dataColor;
      item.index = itemIndex;
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

  getItemLabel(selectLabel, item) {
    const {
      option: selectedLabelOpt,
      selected: selectedLabel,
    } = selectLabel;

    let targetLabel = this.isHorizontal ? item.y : item.x;
    if (selectedLabelOpt?.useBothAxis && selectedLabel?.targetAxis) {
      targetLabel = selectedLabel?.targetAxis === 'yAxis' ? item.y : item.x;
    }

    return targetLabel;
  }
}

export default HeatMap;
