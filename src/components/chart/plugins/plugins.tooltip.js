import { numberWithComma } from '@/common/utils';
import debounce from '@/common/utils.debounce';
import Util from '../helpers/helpers.util';

const modules = {
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
    const boxPadding = { t: 8, b: 8, r: 16, l: 16 };
    const lineSpacing = 6;
    const colorMargin = 10;
    const textHeight = 14;
    const scrollWidth = 17;
    const mouseXIp = 2; // mouseInterpolation
    const mouseYIp = 10;

    ctx.font = '14px Roboto';
    const nw = Math.round(ctx.measureText(maxSeries).width);
    const vw = Math.round(ctx.measureText(maxValue).width);

    const width = nw + vw + boxPadding.l + boxPadding.r + (colorMargin * 2);
    const height = ((seriesKeys.length + 1) * textHeight) + ((seriesKeys.length + 1) * lineSpacing)
      + boxPadding.t + boxPadding.b;

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

      if (offsetY > (graphPos.y2 / 2) || clientY > ((bodyHeight * 9) / 10)) {
        this.tooltipDOM.style.top = `${mouseY - height - 6}px`;
        pos += 1;
      } else {
        this.tooltipDOM.style.top = `${mouseY + 10}px`;
      }

      this.tooltipCanvas.width = Math.round(width * this.pixelRatio) + 5;
      this.tooltipCanvas.height = Math.round(height * this.pixelRatio) + 5;
      this.tooltipCanvas.style.width = `${width + 6}px`;
      this.tooltipCanvas.style.height = `${height + 6}px`;
    } else {
      pos = -1;
    }

    return { nw, width, height, pos };
  },

  drawTooltip(hitInfo, context, size) {
    const ctx = context;
    const sId = hitInfo.hitId;
    const items = hitInfo.items;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const seriesKeys = Object.keys(items);
    const boxPadding = { t: 4, b: 4, r: 16, l: 16 };
    const borderRadius = 10;
    const lineSpacing = 6;
    const textHeight = 14;
    const { nw, height, pos } = size;
    const width = size.width - 5;
    const arrowTY = 30;
    const arrowBY = -10;
    const arrowLX = -5;
    const arrowRX = 5;

    if (pos < 0) {
      return;
    }

    const title = this.options.horizontal ?
      this.axesY[hitAxis.y].getLabelFormat(hitItem.y) :
      this.axesX[hitAxis.x].getLabelFormat(hitItem.x);

    let x = pos > 1 ? 5 : 2;
    let y = 2;

    x += Util.aliasPixel(x);
    y += Util.aliasPixel(y);

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    ctx.lineWidth = 2;
    ctx.font = '14px Roboto';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(51, 67, 80, 0.9)';
    ctx.strokeStyle = '#1F303A';

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
    ctx.fill();
    ctx.stroke();

    x += boxPadding.l;
    y += boxPadding.t + textHeight;

    ctx.fillStyle = '#F4FAFF';
    ctx.strokeStyle = '#F4FAFF';
    ctx.lineWidth = 1;
    ctx.textBaseline = 'Bottom';

    ctx.fillText(title, x, y);
    y += lineSpacing;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo((x + width) - (boxPadding.r + boxPadding.l), y);
    ctx.stroke();
    ctx.closePath();
    y += lineSpacing;

    seriesKeys.forEach((s, index) => {
      const gdata = items[s].data;
      const color = items[s].color;
      const value = gdata.b || gdata.y || 0;

      let itemX = x;
      let itemY = y + ((index + 1) * textHeight);

      itemX += Util.aliasPixel(itemX);
      itemY += Util.aliasPixel(itemY);

      ctx.beginPath();
      ctx.fillStyle = color;

      ctx.fillRect(itemX - 4, itemY - 10, 10, 10);
      ctx.fillStyle = '#F4FAFF';
      ctx.textBaseline = 'Bottom';
      ctx.fillText(this.seriesList[s].name, (itemX + 10), itemY);
      ctx.fillText(numberWithComma(value), (itemX + 10 + nw) + 5, itemY);
      ctx.closePath();
      y += lineSpacing;
    });

    ctx.restore();
  },

  drawItemsHighlight(hitInfo, ctx) {
    const { maxHighlight } = hitInfo;
    const maxSID = maxHighlight ? maxHighlight[0] : null;

    Object.keys(hitInfo.items).forEach((sId) => {
      const isMaxHighlight = maxSID === sId;
      this.seriesList[sId].itemHighlight(hitInfo.items[sId], ctx, isMaxHighlight);
    });
  },

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
  },

  tooltipClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width / this.clearRectRatio,
      this.tooltipCanvas.height / this.clearRectRatio);
  },
};

export default modules;
