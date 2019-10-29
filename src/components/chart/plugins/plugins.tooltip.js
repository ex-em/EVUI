const module = {
  createTooltipDOM() {
    this.tooltipDOM = document.createElement('div');
    this.tooltipDOM.className = 'ev-chart-tooltip';
    this.tooltipCanvas = document.createElement('canvas');
    this.tooltipCanvas.className = 'ev-chart-tooltip-canvas';
    this.tooltipCtx = this.tooltipCanvas.getContext('2d');

    this.tooltipDOM.style.display = 'none';
    this.tooltipDOM.appendChild(this.tooltipCanvas);
    document.body.appendChild(this.tooltipDOM);
  },
  setTooltipLayout(hitInfo, e, offset) {
    this.tooltipCtx.font = '14px Droid Sans';

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
    const boxPadding = { t: 4, b: 4, r: 10, l: 10 };
    const lineSpacing = 4;
    const colorHalfRadius = 2;
    const colorMargin = 10;
    const textHeight = 14;

    const nw = Math.round(this.tooltipCtx.measureText(maxSeries).width);
    const vw = Math.round(this.tooltipCtx.measureText(maxValue).width);
    const width = nw + vw + boxPadding.l + boxPadding.r + colorMargin
      + (colorMargin - colorHalfRadius);
    const height = ((seriesKeys.length + 1) * textHeight) + ((seriesKeys.length + 1) * lineSpacing)
      + boxPadding.t + boxPadding.b;

    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    this.tooltipDOM.style.width = `${width + 17}px`;
    this.tooltipDOM.style.height = `${height <= 500 ? height : 500}px`;

    if ((offsetX >= (graphPos.x1 - 1) && offsetX <= (graphPos.x2))
      && (offsetY >= (graphPos.y1 - 1) && offsetY <= (graphPos.y2 + 1))) {
      if (offsetX > ((graphPos.x2 * 4) / 5) || clientX > ((bodyWidth * 4) / 5)) {
        this.tooltipDOM.style.left = `${mouseX - (width + 10)}px`;
      } else {
        this.tooltipDOM.style.left = `${mouseX + 10}px`;
      }

      if (offsetY > ((graphPos.y2 * 3) / 4) || clientY > ((bodyHeight * 3) / 4)) {
        this.tooltipDOM.style.top = `${mouseY - ((height <= 500 ? height : 500) + 10)}px`;
      } else {
        this.tooltipDOM.style.top = `${mouseY + 10}px`;
      }

      this.tooltipCanvas.width = width * this.pixelRatio;
      this.tooltipCanvas.height = height;
      this.tooltipCanvas.style.width = `${width}px`;
      this.tooltipCanvas.style.height = `${height}px`;
    }

    return { nw, width, height };
  },
  drawTooltip(hitInfo, context, size) {
    const ctx = context;
    const sId = hitInfo.hitId;
    const items = hitInfo.items;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const seriesKeys = Object.keys(items);
    const boxPadding = { t: 4, b: 4, r: 10, l: 10 };
    const borderRadius = 4;
    const lineSpacing = 4;
    const colorHalfRadius = 2;
    const textHeight = 14;
    const { nw, width, height } = size;
    const title = this.options.horizontal ?
      this.axesY[hitAxis.y].getLabelFormat(hitItem.y) :
      this.axesX[hitAxis.x].getLabelFormat(hitItem.x);

    let x = 0;
    let y = 0;

    ctx.font = '14px Droid Sans';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(51, 67, 80, 0.9)';
    ctx.strokeStyle = '#1F303A';
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo((x + width) - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, (y + height) - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, (x + width) - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, (y + height) - borderRadius);
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
    ctx.moveTo(x - (colorHalfRadius * 2), y);
    ctx.lineTo((x + width) - (boxPadding.r + boxPadding.l), y);
    ctx.stroke();
    ctx.closePath();
    y += lineSpacing;

    seriesKeys.forEach((s, index) => {
      const gdata = items[s].data;
      const color = items[s].color;
      const value = gdata.b || gdata.y || 0;

      const itemX = x;
      const itemY = y + ((index + 1) * textHeight);

      ctx.beginPath();
      ctx.strokeStyle = '#F4FAFF';
      ctx.lineWidth = 1;
      ctx.fillStyle = color;

      ctx.arc(itemX, itemY - (colorHalfRadius * 2), (colorHalfRadius * 2), 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F4FAFF';
      ctx.textBaseline = 'Bottom';
      ctx.fillText(this.seriesList[s].name, itemX + 10, itemY);
      ctx.fillText(value, (itemX + 10 + nw) + 5, itemY);
      ctx.closePath();
      y += lineSpacing;
    });
  },
};

export default module;
