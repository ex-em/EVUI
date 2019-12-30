import { merge } from 'lodash-es';
import { PIE_OPTION, COLOR } from '../helpers/helpers.constant';

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

      if ((sx - 4 <= xp) && (xp <= ex + 4)) {
        item.data = gdata[m];

        if ((ey - 4 <= yp) && (yp <= sy + 4)) {
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
}

export default Pie;
