import _merge from 'lodash/merge';
import { PIE_OPTION, COLOR } from '../helpers/helpers.constant';

class Pie {
  constructor(sId, opt, sIdx) {
    const merged = _merge({}, PIE_OPTION, opt);
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
  }

  draw(param) {
    const ctx = param.ctx;
    const centerX = param.centerX;
    const centerY = param.centerY;
    const radius = param.radius;
    const startAngle = param.startAngle;
    const endAngle = param.endAngle;

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
    ctx.closePath();
  }
}

export default Pie;
