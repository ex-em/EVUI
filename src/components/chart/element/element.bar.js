import { defaultsDeep } from 'lodash-es';
import { truthy } from '@/common/utils';
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

    let cPad;
    const isUnableToDrawCategoryPadding = param.cPadRatio >= 1 || param.cPadRatio <= 0;
    if (isUnableToDrawCategoryPadding) {
      cPad = 2;
    } else {
      cPad = Math.max((dArea * (param.cPadRatio / 2)) / this.data.length, 2);
    }

    let bArea;
    let w;
    let h;

    bArea = cArea > (cPad * 2) ? (cArea - (cPad * 2)) : cArea;
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
    this.size.h = h;
    this.size.ix = barSeriesX;
    this.chartRect = chartRect;
    this.labelOffset = labelOffset;
    this.borderRadius = param.borderRadius;

    let categoryPoint = null;

    this.data.forEach((dataItem, index) => {
      ctx.beginPath();

      const item = dataItem;

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

      const barColor = item.dataColor || this.color;

      const selectLabelOption = param.selectLabel.option;
      const selectedLabel = param.selectLabel.selected ?? { dataIndex: [] };

      const isDownplay = selectLabelOption.use && selectLabelOption.useSeriesOpacity
          ? selectedLabel.dataIndex.length && !selectedLabel.dataIndex.includes(index)
          : this.state === 'downplay';

      if (typeof barColor !== 'string') {
        ctx.fillStyle = Canvas.createGradient(
          ctx,
          isHorizontal,
          { x, y, w, h },
          barColor,
          isDownplay,
        );
      } else {
        const noneDownplayOpacity = barColor.includes('rgba') ? Util.getOpacity(barColor) : 1;
        const opacity = isDownplay ? 0.1 : noneDownplayOpacity;

        ctx.fillStyle = Util.colorStringToRgba(barColor, opacity);
      }

      this.drawBar({
        ctx,
        positions: { x, y, w, h },
      });

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
   * @param {CanvasRenderingContext2D}  context    canvas context
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
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    const color = item.data.dataColor || this.color;
    if (typeof color !== 'string') {
      const grd = Canvas.createGradient(ctx, this.isHorizontal, { x, y, w, h }, color);
      ctx.fillStyle = grd;
      ctx.shadowColor = color[color.length - 1][1];
    } else {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
    }

    ctx.beginPath();

    this.drawBar({
      ctx,
      positions: { x, y, w, h: this.isHorizontal ? -h : h },
    });

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

  /**
   * Draw value label if series 'use' of showValue option is true
   *
   * @param context           canvas context
   * @param data              series value data (model.store.js addData return value)
   * @param positions         series value positions
   * @param isHighlight       draw label with highlight effect
   */
  drawValueLabels({ context, data, positions, isHighlight }) {
    const isHorizontal = this.isHorizontal;
    const { fontSize, textColor, align, formatter, decimalPoint } = this.showValue;
    const { x, y, w, h } = positions;
    const ctx = context;

    ctx.save();
    ctx.beginPath();

    ctx.font = `normal normal normal ${fontSize}px Roboto`;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = isHorizontal && align !== 'center' ? 'left' : 'center';

    let value;
    const isStacked = truthy(this.stackIndex);
    if (isStacked) {
      value = data.o;
    } else {
      value = (isHorizontal ? data.x : data.y) ?? '';
    }

    let formattedTxt;
    if (formatter) {
      formattedTxt = formatter(value);
    }

    if (!formatter || typeof formattedTxt !== 'string') {
      formattedTxt = Util.labelSignFormat(value, decimalPoint) ?? '';
    }

    const textWidth = Math.round(ctx.measureText(formattedTxt).width);
    const textHeight = fontSize + 4;
    const minXPos = x + 10;
    const minYPos = y - 10;
    const widthFreeSpaceToDraw = w - 10;
    const heightFreeSpaceToDraw = Math.abs(h + 10);
    const centerX = x + (w / 2) <= minXPos ? minXPos : x + (w / 2);
    const centerY = y + (h / 2) >= minYPos ? minYPos : y + (h / 2);
    const centerYHorizontal = isHighlight ? y + (h / 2) : y - (h / 2);

    switch (align) {
      case 'start': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            ctx.fillText(formattedTxt, minXPos, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          ctx.fillText(formattedTxt, centerX, minYPos);
        }

        break;
      }

      case 'center': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            ctx.fillText(formattedTxt, centerX, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          ctx.fillText(formattedTxt, centerX, centerY);
        }

        break;
      }

      case 'out': {
        if (isStacked) {
          console.warn('[EVUI][Bar Chart] In case of Stack Bar Chart, \'out\' of \'showValue\'\'s align is not supported.');
          return;
        }

        if (isHorizontal) {
          ctx.fillText(formattedTxt, minXPos + w, centerYHorizontal);
        } else {
          ctx.fillText(formattedTxt, centerX, y + h - (textHeight / 2));
        }

        break;
      }

      default:
      case 'end': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            const xPos = x + w - (textWidth * 2);
            ctx.fillText(formattedTxt, xPos <= minXPos ? minXPos : xPos, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          const yPos = y + h + textHeight;
          ctx.fillText(formattedTxt, centerX, yPos >= minYPos ? minYPos : yPos);
        }

        break;
      }
    }

    ctx.restore();
  }

  drawBar({ ctx, positions }) {
    const isHorizontal = this.isHorizontal;
    const isStackBar = 'stackIndex' in this;
    const isBorderRadius = this.borderRadius && this.borderRadius > 0;
    const { x, y, w } = positions;
    const h = isHorizontal ? -positions.h : positions.h;

    // Dont's draw bar that has value 0
    if (w === 0 || h === 0) {
      return;
    }

    if (isBorderRadius && !isStackBar) {
      try {
        this.drawRoundedRect(ctx, positions);
      } catch (e) {
        ctx.fillRect(x, y, w, h);
      }
    } else {
      ctx.fillRect(x, y, w, h);
    }
  }

  drawRoundedRect(ctx, positions) {
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const isHorizontal = this.isHorizontal;
    const { x, y } = positions;
    let { w, h } = positions;
    let r = this.borderRadius;

    const squarePath = new Path2D();
    squarePath.rect(
      chartRect.x1 + labelOffset.left,
      chartRect.y1,
      chartRect.chartWidth - labelOffset.right,
      chartRect.chartHeight - labelOffset.bottom,
    );

    ctx.clip(squarePath);

    ctx.moveTo(x, y);

    if (isHorizontal) {
      if (h < r * 2) {
        r = h / 2;
      }

      w -= r;
      ctx.lineTo(x + w, y);
      ctx.arcTo(x + w + r, y, x + w + r, y - r, r);
      ctx.arcTo(x + w + r, y - h, x + w, y - h, r);
      ctx.lineTo(x, y - h);
      ctx.lineTo(x, y);
    } else {
      if (w < r * 2) {
        r = w / 2;
      }

      h += r;
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.arcTo(x + w, y + h - r, x + w - r, y + h - r, r);
      ctx.arcTo(x, y + h - r, x, y + h, r);
      ctx.lineTo(x, y);
    }

    ctx.fill();
    ctx.closePath();
  }
}

export default Bar;
