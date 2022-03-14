import { merge } from 'lodash-es';
import { PIE_OPTION, COLOR } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';

class Pie {
  constructor(sId, opt, sIdx) {
    const merged = merge({}, PIE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    if (this.color === undefined) {
      this.color = COLOR[sIdx];
    }

    this.sId = sId;
    this.show = true;
    this.data = [];
    this.type = 'pie';
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
    this.doughnutHoleSize = 0;
    this.startAngle = 0;
    this.endAngle = 0;
    this.slice = null;
    this.state = null;
    this.ctx = null;
    this.isSelect = false;
  }

  /**
   * Draw series data
   * @param context
   * @param strokeOptions
   *
   *
   * @returns {undefined}
   */
  draw(context, strokeOptions) {
    const ctx = context ?? this.ctx;
    const slice = new Path2D();

    const radius = this.isSelect ? this.radius + 5 : this.radius;
    const doughnutHoleRadius = this.radius * this.doughnutHoleSize;

    const color = this.color;
    const noneDownplayOpacity = color.includes('rgba') ? Util.getOpacity(color) : 1;
    const opacity = this.state === 'downplay' ? 0.1 : noneDownplayOpacity;

    ctx.beginPath();
    slice.moveTo(this.centerX, this.centerY);
    slice.arc(this.centerX, this.centerY, radius, this.startAngle, this.endAngle);
    slice.lineTo(this.centerX, this.centerY);
    ctx.fillStyle = Util.colorStringToRgba(color, opacity);
    ctx.fill(slice);

    if (strokeOptions.use) {
      ctx.lineCap = 'round';
      ctx.lineWidth = strokeOptions?.lineWidth;
      ctx.strokeStyle = strokeOptions?.color;
      ctx.stroke(slice);
    }

    if (this.showValue?.use) {
      this.drawValueLabels(ctx, doughnutHoleRadius);
    }

    ctx.closePath();

    this.slice = slice;
    this.ctx = ctx;
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphData([offsetX, offsetY]) {
    const item = { data: null, hit: false, color: null, index: -1 };

    if (this.show && this.ctx?.isPointInPath(this.slice, offsetX, offsetY)) {
      item.type = this.type;
      item.data = this.data;
      item.hit = true;
      item.color = this.color;
      item.index = 0;
    }

    return item;
  }

  /**
   * Draw item highlight
   *
   * @param item {object} object for drawing series data
   * @param context {CanvasRenderingContext2D} canvas context
   *
   * @returns {undefined}
   */
  itemHighlight(item, context) {
    const ctx = context;
    const radius = this.isSelect ? this.radius + 5 : this.radius;
    const doughnutHoleRadius = this.radius * this.doughnutHoleSize;

    ctx.save();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    const color = item.data.dataColor || this.color;
    ctx.fillStyle = color;
    ctx.shadowColor = color;

    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.arc(this.centerX, this.centerY, radius, this.startAngle, this.endAngle);
    ctx.lineTo(this.centerX, this.centerY);
    ctx.fill();

    if (this.showValue?.use) {
      this.drawValueLabels(ctx, doughnutHoleRadius);
    }

    ctx.closePath();
    ctx.restore();
  }

  /**
   * Draw value label if series 'use' of showValue option is true
   *
   * @param context           canvas context
   */
  drawValueLabels(context) {
    const { fontSize, textColor, formatter } = this.showValue;
    const ctx = context;

    ctx.save();
    ctx.beginPath();

    ctx.font = `normal normal normal ${fontSize}px Roboto`;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const value = this.data.o;

    let formattedTxt;
    if (formatter) {
      formattedTxt = formatter(value);
    }

    if (!formatter || typeof formattedTxt !== 'string') {
      formattedTxt = Util.labelSignFormat(value);
    }

    const ratio = 1.8;
    const radius = this.radius - this.doughnutHoleSize;
    const innerAngle = ((this.endAngle - this.startAngle) * 180) / Math.PI;
    const valueHeight = fontSize + 4;
    const valueWidth = Math.round(ctx.measureText(formattedTxt).width);

    if (innerAngle >= valueWidth * ratio
      && innerAngle >= valueHeight * ratio
      && radius >= valueWidth * ratio
      && radius >= valueHeight * ratio
    ) {
      const halfRadius = (radius / 2) + this.doughnutHoleSize;
      const centerAngle = ((this.endAngle - this.startAngle) / 2) + this.startAngle;
      const xPos = halfRadius * Math.cos(centerAngle) + this.centerX;
      const yPos = halfRadius * Math.sin(centerAngle) + this.centerY;

      ctx.fillText(formattedTxt, xPos, yPos);
    }

    ctx.restore();
  }
}

export default Pie;
