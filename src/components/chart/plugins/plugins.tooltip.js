import { numberWithComma } from '@/common/utils';
import debounce from '@/common/utils.debounce';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';

const modules = {
  /**
   * Create tooltip DOM
   *
   * @returns {undefined}
   */
  createTooltipDOM() {
    this.tooltipDOM = document.createElement('div');
    this.tooltipDOM.className = 'ev-chart-tooltip';
    this.tooltipCanvas = document.createElement('canvas');
    this.tooltipCanvas.className = 'ev-chart-tooltip-canvas';
    this.tooltipCtx = this.tooltipCanvas.getContext('2d');

    this.tooltipDOM.style.display = 'none';
    this.tooltipDOM.appendChild(this.tooltipCanvas);
    document.body.appendChild(this.tooltipDOM);

    if (this.options.tooltip.debouncedHide) {
      this.hideTooltipDOM = debounce(() => {
        this.tooltipDOM.style.display = 'none';
      }, 200);
    } else {
      this.hideTooltipDOM = () => {
        this.tooltipDOM.style.display = 'none';
      };
    }
  },

  /**
   * Set tooltip canvas layout
   * @param {object} hitInfo    mousemove callback
   * @param {object} e          mousemove callback
   * @param {object} offset     mousemove callback
   *
   * @returns {object} tooltip layout information
   */
  setTooltipLayout(hitInfo, e, offset) {
    const ctx = this.tooltipCtx;
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    const items = hitInfo.items;
    const [offsetX, offsetY] = offset;
    const [maxSeries, maxValue] = hitInfo.maxTip;

    const seriesKeys = Object.keys(items);
    const seriesLen = seriesKeys.length;
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const lineSpacing = 8;
    const colorMargin = 16;
    const valueMargin = 20;
    const textHeight = 14;
    const titleMargin = 12;
    const titleHeight = 16;
    const scrollWidth = 17;
    const mouseXIp = 4; // mouseInterpolation
    const mouseYIp = 10;

    const sId = hitInfo.hitId;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const isHorizontal = this.options.horizontal;

    const title = isHorizontal
      ? this.axesY[hitAxis.y].getLabelFormat(hitItem.y)
      : this.axesX[hitAxis.x].getLabelFormat(hitItem.x);
    ctx.save();
    ctx.font = '16px Roboto';
    const tw = Math.round(ctx.measureText(title).width);

    ctx.font = '14px Roboto';
    const nw = Math.round(ctx.measureText(maxSeries).width);
    const vw = Math.round(ctx.measureText(maxValue).width);
    ctx.restore();
    const width = Math.max((nw + vw), tw) + boxPadding.l + boxPadding.r + colorMargin + valueMargin;
    const height = boxPadding.t + titleHeight + titleMargin
      + (seriesLen * textHeight) + (seriesLen * lineSpacing) + boxPadding.b;

    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    this.tooltipDOM.style.width = `${width + scrollWidth}px`;
    this.tooltipDOM.style.height = `${height + 6}px`;

    let pos = 0; // tooltip position based on mouse cursor position. lb: 0, lt: 1, rb: 2, rt: 3

    if ((offsetX >= (graphPos.x1 - mouseXIp) && offsetX <= (graphPos.x2 + mouseXIp))
      && (offsetY >= (graphPos.y1 - mouseYIp) && offsetY <= (graphPos.y2 + mouseYIp))) {
      if (offsetX > ((graphPos.x2 * 4) / 5) || clientX > ((bodyWidth * 4) / 5)) {
        this.tooltipDOM.style.left = `${mouseX - (width + 6)}px`;
      } else {
        this.tooltipDOM.style.left = `${mouseX + 6}px`;
        pos += 2;
      }

      if ((offsetY > (graphPos.y2 / 2) || clientY > ((bodyHeight * 9) / 10))
        && (clientY > (height + 6))) {
        this.tooltipDOM.style.top = `${mouseY - height - 6}px`;
        pos += 1;
      } else {
        this.tooltipDOM.style.top = `${mouseY + 6}px`;
      }

      this.tooltipCanvas.width = (width + 6) * this.pixelRatio;
      this.tooltipCanvas.height = (height + 5) * this.pixelRatio;
      this.tooltipCanvas.style.width = `${width + 6}px`;
      this.tooltipCanvas.style.height = `${height + 5}px`;
    } else {
      pos = -1;
    }

    return { nw, width, height, pos };
  },

  /**
   * Draw tooltip canvas
   * @param {object} hitInfo    mousemove callback
   * @param {object} context    tooltip canvas context
   * @param {object} size       tooltip size information
   *
   * @returns {undefined}
   */
  drawTooltip(hitInfo, context, size) {
    const ctx = context;
    const sId = hitInfo.hitId;
    const items = hitInfo.items;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const seriesKeys = this.alignSeriesList(Object.keys(items));
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const borderRadius = 8;
    const titleMargin = 12;
    const lineSpacing = 8;
    const colorMargin = 16;
    const textHeight = 14;
    const { height, pos } = size;
    const width = size.width - 5;
    const arrowTY = 30;
    const arrowBY = -10;
    const arrowLX = -5;
    const arrowRX = 5;
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;

    if (pos < 0) {
      return;
    }

    const title = isHorizontal
      ? this.axesY[hitAxis.y].getLabelFormat(hitItem.y)
      : this.axesX[hitAxis.x].getLabelFormat(hitItem.x);

    let x = pos > 1 ? 5 : 2;
    let y = 2;

    x += Util.aliasPixel(x);
    y += Util.aliasPixel(y);

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 0;
    ctx.fillStyle = opt.backgroundColor;
    ctx.strokeStyle = opt.borderColor;

    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo((x + width) - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);

    // tooltip pos => lb: 0, lt: 1, rb: 2, rt: 3
    if (pos === 0) {
      ctx.lineTo(x + width, (y + arrowTY) - borderRadius - 5);
      ctx.lineTo(x + width + arrowRX, (y + arrowTY) - borderRadius);
      ctx.lineTo(x + width, ((y + arrowTY) - borderRadius) + 5);
    } else if (pos === 1) {
      ctx.lineTo(x + width, (y + height + arrowBY) - borderRadius - 5);
      ctx.lineTo(x + width + arrowRX, (y + height + arrowBY) - borderRadius);
      ctx.lineTo(x + width, ((y + height + arrowBY) - borderRadius) + 5);
    }

    ctx.lineTo(x + width, (y + height) - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, (x + width) - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, (y + height) - borderRadius);

    if (pos === 2) {
      ctx.lineTo(x, ((y + arrowTY) - borderRadius) + 5);
      ctx.lineTo(x + arrowLX, (y + arrowTY) - borderRadius);
      ctx.lineTo(x, (y + arrowTY) - borderRadius - 5);
    } else if (pos === 3) {
      ctx.lineTo(x, ((y + height + arrowBY) - borderRadius) + 5);
      ctx.lineTo(x + arrowLX, (y + height + arrowBY) - borderRadius);
      ctx.lineTo(x, (y + height + arrowBY) - borderRadius - 5);
    }

    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();

    if (opt.useShadow) {
      ctx.save();
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 2;
      ctx.shadowColor = `rgba(${Util.hexToRgb('#000000')}, ${opt.shadowOpacity})` || '';
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fill();
    }

    ctx.stroke();

    x += boxPadding.l;
    y += boxPadding.t + textHeight;

    ctx.font = 'normal normal normal 16px Roboto';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.textBaseline = 'Bottom';
    ctx.fillText(title, x, y);

    y += titleMargin;

    ctx.font = 'normal normal lighter 14px Roboto';
    seriesKeys.forEach((s, index) => {
      const gdata = items[s].data;
      const color = items[s].color;

      let value;

      if (gdata.o === null) {
        value = isHorizontal ? gdata.x : gdata.y;
      } else if (!isNaN(gdata.o)) {
        value = gdata.o;
      }

      let itemX = x + 4;
      let itemY = y + ((index + 1) * textHeight);

      itemX += Util.aliasPixel(itemX);
      itemY += Util.aliasPixel(itemY);

      ctx.beginPath();

      if (typeof color !== 'string') {
        ctx.fillStyle = Canvas.createGradient(
          ctx,
          isHorizontal,
          { x: itemX - 4, y: itemY, w: 12, h: -12 },
          color,
        );
      } else {
        ctx.fillStyle = color;
      }

      ctx.fillRect(itemX - 4, itemY - 12, 12, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'Bottom';
      ctx.fillText(this.seriesList[s].name, (itemX + colorMargin), itemY);
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText(numberWithComma(value), size.width - boxPadding.r, itemY);
      ctx.restore();
      ctx.closePath();
      y += lineSpacing;
    });

    ctx.restore();
  },

  /**
   * Draw graph item highlight
   * @param {object} hitInfo    mousemove callback
   * @param {object} ctx        overlayCanvas context
   *
   * @returns {undefined}
   */
  drawItemsHighlight(hitInfo, ctx) {
    Object.keys(hitInfo.items).forEach((sId) => {
      this.seriesList[sId].itemHighlight(hitInfo.items[sId], ctx);
    });
  },

  /**
   * Draw chart indicator with mousemove
   * @param {object} offset    mousemove callback
   * @param {string} color     indicator color
   *
   * @returns {undefined}
   */
  drawIndicator(offset, color) {
    const ctx = this.overlayCtx;
    const [offsetX, offsetY] = offset;
    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };
    const mouseXIp = 1; // mouseInterpolation
    const mouseYIp = 10;

    if (offsetX >= (graphPos.x1 - mouseXIp) && offsetX <= (graphPos.x2 + mouseXIp)
      && offsetY >= (graphPos.y1 - mouseYIp) && offsetY <= (graphPos.y2 + mouseYIp)) {
      if (this.options.horizontal) {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(graphPos.x1, offsetY + 0.5);
        ctx.lineTo(graphPos.x2, offsetY + 0.5);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(offsetX + 0.5, graphPos.y1);
        ctx.lineTo(offsetX + 0.5, graphPos.y2);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
      }
    }
  },

  /**
   * Clear tooltip canvas
   *
   * @returns {undefined}
   */
  tooltipClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width / this.clearRectRatio,
      this.tooltipCanvas.height / this.clearRectRatio);
  },

  /**
   * Order series list by groups
   * @param {array} sKeys    series list that is hit by mouse cursor. (not all of series)
   *
   * @returns {array} ordered series list by groups
   */

  alignSeriesList(sKeys) {
    const groups = this.data.groups;
    const seriesList = this.seriesList;
    const result = [];

    groups.forEach((group) => {
      group.slice().reverse().forEach((sId) => {
        const series = seriesList[sId];

        if (series && series.showLegend && sKeys.includes(sId)) {
          result.push(sId);
        }
      });
    });

    Object.keys(seriesList).forEach((sId) => {
      const series = seriesList[sId];

      if (!series.isExistGrp && series.showLegend && sKeys.includes(sId)) {
        result.push(sId);
      }
    });

    return result;
  },
};

export default modules;
