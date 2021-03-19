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

    this.tooltipHeaderDOM = document.createElement('div');
    this.tooltipHeaderDOM.className = 'ev-chart-tooltip-header';

    this.tooltipBodyDOM = document.createElement('div');
    this.tooltipBodyDOM.className = 'ev-chart-tooltip-body';

    this.tooltipCanvas = document.createElement('canvas');
    this.tooltipCanvas.className = 'ev-chart-tooltip-canvas';
    this.tooltipCtx = this.tooltipCanvas.getContext('2d');

    this.tooltipDOM.style.display = 'none';

    this.tooltipBodyDOM.appendChild(this.tooltipCanvas);
    this.tooltipDOM.appendChild(this.tooltipHeaderDOM);
    this.tooltipDOM.appendChild(this.tooltipBodyDOM);

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
   * Set tooltip DOM's position and style
   * @param {object} hitInfo    value and mouse position touched
   * @param {object} e          mousemove callback
   *
   * @returns {object} tooltip layout information
   */
  setTooltipLayoutPosition(hitInfo, e) {
    const ctx = this.tooltipCtx;
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    const items = hitInfo.items;
    const [maxSeries, maxValue] = hitInfo.maxTip;

    const seriesKeys = Object.keys(items);
    const seriesLen = seriesKeys.length;
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const lineSpacing = 8;
    const colorMargin = 16;
    const valueMargin = 50;
    const textHeight = 14;
    const titleHeight = 30;
    const scrollWidth = 17;
    const opt = this.options.tooltip;

    // calculate height and width of canvas in tooltip DOM
    const calHeight = seriesCnt => boxPadding.t + (seriesCnt * textHeight)
      + (seriesCnt * lineSpacing) + boxPadding.b;

    ctx.save();
    ctx.font = '12px Roboto';
    const nw = Math.round(ctx.measureText(maxSeries).width);
    const vw = Math.round(ctx.measureText(maxValue).width);
    ctx.restore();

    const contentsWidth = nw + vw + boxPadding.l + boxPadding.r
      + colorMargin + valueMargin + scrollWidth;
    let contentsHeight = calHeight(seriesLen);

    // set tooltip's width / height
    this.tooltipCanvas.width = (contentsWidth + 6) * this.pixelRatio;
    this.tooltipCanvas.height = (contentsHeight + 5) * this.pixelRatio;
    this.tooltipCanvas.style.width = `${contentsWidth + 6}px`;
    this.tooltipCanvas.style.height = `${contentsHeight + 5}px`;

    if (opt.scrollbar.use && seriesLen > opt.scrollbar.maxSeriesCount) {
      this.tooltipBodyDOM.style.overflowY = 'auto';
      contentsHeight = calHeight(opt.scrollbar.maxSeriesCount);
    } else {
      this.tooltipBodyDOM.style.overflowY = 'hidden';
    }
    this.tooltipHeaderDOM.style.height = `${titleHeight}px`;
    this.tooltipDOM.style.height = `${titleHeight + contentsHeight}px`;
    this.tooltipBodyDOM.style.height = `${contentsHeight}px`;

    // set tooltipDOM's positions
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;
    this.tooltipDOM.style.left = mouseX > bodyWidth - contentsWidth - 20
      ? `${mouseX - contentsWidth - 20}px`
      : `${mouseX + 20}px`;
    this.tooltipDOM.style.top = mouseY > bodyHeight - (titleHeight + contentsHeight) - 20
      ? `${mouseY - (titleHeight + contentsHeight) - 20}px`
      : `${mouseY + 20}px`;
  },

  /**
   * Draw tooltip canvas
   * @param {object} hitInfo    mousemove callback
   * @param {object} context    tooltip canvas context
   *
   * @returns {undefined}
   */
  drawTooltip(hitInfo, context) {
    const ctx = context;
    const items = hitInfo.items;
    const sId = hitInfo.hitId;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const seriesKeys = this.alignSeriesList(Object.keys(items));
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const lineSpacing = 8;
    const colorMargin = 16;
    const textHeight = 14;
    const scrollWidth = 17;
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;

    // draw tooltip Title(axis label)
    const title = this.options.horizontal
      ? this.axesY[hitAxis.y].getLabelFormat(hitItem.y)
      : this.axesX[hitAxis.x].getLabelFormat(hitItem.x);

    this.tooltipHeaderDOM.textContent = title;

    // draw tooltip contents (series, value combination)
    let x = 2;
    let y = 2;

    x += Util.aliasPixel(x);
    y += Util.aliasPixel(y);

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    if (this.tooltipBodyDOM.style.overflowY === 'auto') {
      boxPadding.r += scrollWidth;
    }

    x += boxPadding.l;
    y += boxPadding.t;

    ctx.font = 'normal normal lighter 14px Roboto';

    const seriesList = [];
    seriesKeys.forEach((seriesName) => {
      seriesList.push({
        data: items[seriesName].data,
        color: items[seriesName].color,
        name: items[seriesName].name,
      });
    });

    if (opt.sortByValue) {
      seriesList.sort((a, b) => {
        let prev = a.data.o;
        let next = b.data.o;

        if (!prev) {
          prev = isHorizontal ? a.data.x : a.data.y;
        }

        if (!next) {
          next = isHorizontal ? b.data.x : b.data.y;
        }
        return next - prev;
      });
    }

    for (let ix = 0; ix < seriesList.length; ix++) {
      const gdata = seriesList[ix].data;
      const color = seriesList[ix].color;
      const name = seriesList[ix].name;

      let value;

      if (gdata.o === null) {
        value = isHorizontal ? gdata.x : gdata.y;
      } else if (!isNaN(gdata.o)) {
        value = gdata.o;
      }

      let itemX = x + 4;
      let itemY = y + ((ix + 1) * textHeight);

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
      ctx.fillStyle = opt.fontColor;
      ctx.textBaseline = 'Bottom';
      ctx.fillText(name, (itemX + colorMargin), itemY);
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText(numberWithComma(value), this.tooltipDOM.offsetWidth - boxPadding.r, itemY);
      ctx.restore();
      ctx.closePath();
      y += lineSpacing;
    }

    ctx.restore();

    // set tooltipDOM's style
    this.tooltipDOM.style.overflowY = 'hidden';
    this.tooltipDOM.style.backgroundColor = opt.backgroundColor;
    this.tooltipDOM.style.border = `1px solid ${opt.borderColor}`;
    this.tooltipDOM.style.color = opt.fontColor;

    if (opt.useShadow) {
      const shadowColor = `rgba(${Util.hexToRgb('#000000')}, ${opt.shadowOpacity})` || '';
      this.tooltipDOM.style.boxShadow = `2px 2px 2px ${shadowColor}`;
    }

    this.tooltipDOM.style.display = 'block';
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

    this.tooltipDOM.style.display = 'none';
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
