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
  }

  /**
   * Draw series data
   * @param context
   *
   * @returns {undefined}
   */
  draw(context) {
    this.ctx = context;

    const color = this.color;
    const noneDownplayOpacity = color.includes('rgba') ? Util.getOpacity(color) : 1;
    const opacity = this.state === 'downplay' ? 0.1 : noneDownplayOpacity;

    this.ctx.beginPath();
    this.slice = new Path2D();
    this.slice.moveTo(this.centerX, this.centerY);
    this.slice.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle);
    this.ctx.fillStyle = Util.colorStringToRgba(color, opacity);
    this.ctx.fill(this.slice);
    this.ctx.closePath();
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphData([offsetX, offsetY]) {
    const item = { data: null, hit: false, color: null, index: -1 };

    if (this.ctx?.isPointInPath(this.slice, offsetX, offsetY)) {
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

    ctx.save();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    const color = item.data.dataColor || this.color;
    ctx.fillStyle = color;
    ctx.shadowColor = color;

    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}

export default Pie;
