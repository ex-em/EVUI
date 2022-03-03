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
  findGraphRange(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    let s = 0;
    let e = gdata.length - 1;

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
    ctx.closePath();

    ctx.restore();
  }
}

export default Pie;
