import Util from './helpers.util';

// fill 없이 stroke만 하는 point style. 나머지(circle/triangle/rectRounded/rectRot)는 fill+stroke.
// 'rect'는 fillRect/strokeRect를 써서 path 기반 배치가 불가하므로 별도 처리한다.
const NON_FILL_POINT_STYLES = ['cross', 'crossRot', 'star', 'line'];

export default {
  /**
   * Calculate X position
   * @param {number|null|undefined}    value         graph value
   * @param {number} min           min value
   * @param {number} max           max value
   * @param {number} area          height for axis
   * @param {number} startPoint    startPoint
   *
   * @returns {number|null} position
   */
  calculateX(value, min, max, area, startPoint = 0) {
    if (value === null || value === undefined) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }

    const scalingFactor = area / (max - min);
    return Math.ceil(startPoint + scalingFactor * (value - min));
  },

  /**
   * Calculate X position (for timebar)
   * @param {any}    value         graph value
   * @param {number} min           min value
   * @param {number} max           max value
   * @param {number} area          height for axis
   * @param {number} startPoint    startPoint
   *
   * @returns {any} position
   */
  calculateSubX(value, min, max, area, startPoint = 0) {
    if (value === null || value === undefined) {
      return null;
    }

    const scalingFactor = area / (max - min);
    return Math.ceil(startPoint + scalingFactor * (value - min));
  },

  /**
   * Calculate Y position
   * @param {number|null|undefined}    value         graph value
   * @param {number} min           min value
   * @param {number} max           max value
   * @param {number} area          height for axis
   * @param {number} startPoint    startPoint
   *
   * @returns {number|null} position
   */
  calculateY(value, min, max, area, startPoint = 0) {
    let calcY;

    if (value === null || value === undefined) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }
    // Bar차트의 fillRect처리를 위해 invert값 추가 하여 Y값을 처리
    const scalingFactor = area / (max - min);
    if (startPoint) {
      calcY = startPoint - scalingFactor * (value - (min || 0));
    } else {
      calcY = -(scalingFactor * (value - (min || 0)));
    }
    return Math.floor(calcY);
  },

  /**
   * Draw point for chart
   * @param {object} ctx       canvas context
   * @param {string} style     point style
   * @param {number} radius    radius
   * @param {number} x         x position
   * @param {number} y         y position
   *
   * @returns {undefined}
   */
  drawPoint(ctx, style, radius, x, y) {
    if (isNaN(radius) || radius <= 0) {
      return;
    }

    // rect는 fillRect/strokeRect라 path 기반이 아님(기존과 동일). 기존 끝줄의 빈-path stroke()는 no-op이었음.
    if (style === 'rect') {
      const size = (1 / Math.SQRT2) * radius;
      ctx.fillRect(x - size, y - size, 2 * size, 2 * size);
      ctx.strokeRect(x - size, y - size, 2 * size, 2 * size);
      return;
    }

    ctx.beginPath();
    this._appendPointPath(ctx, style, radius, x, y);
    if (!NON_FILL_POINT_STYLES.includes(style)) {
      ctx.fill();
    }
    ctx.stroke();
  },

  /**
   * 점 하나의 도형을 현재 path에 append한다(beginPath/fill/stroke 없음).
   * 여러 점을 한 path에 모아 fill/stroke 1회로 배치 렌더링하기 위한 building block.
   * circle은 직전 subpath 끝점→arc 시작점 연결선이 stroke에 남지 않도록 leading moveTo를 넣는다
   * (단일 점에서는 path가 비어 있어 arc 암묵 시작점과 동일점이므로 zero-length no-op → 픽셀 불변).
   * @param {object} ctx
   * @param {string} style
   * @param {number} radius
   * @param {number} x
   * @param {number} y
   * @returns {undefined}
   */
  _appendPointPath(ctx, style, radius, x, y) {
    let edgeLength;
    let xOffset;
    let yOffset;
    let height;
    let size;
    let offset;
    let leftX;
    let topY;
    let sideSize;

    switch (style) {
      // Default includes circle
      case 'triangle':
        edgeLength = (3 * radius) / Math.sqrt(3);
        height = (edgeLength * Math.sqrt(3)) / 2;
        ctx.moveTo(x - edgeLength / 2, y + height / 3);
        ctx.lineTo(x + edgeLength / 2, y + height / 3);
        ctx.lineTo(x, y - (2 * height) / 3);
        ctx.closePath();
        break;
      case 'rectRounded':
        offset = radius / Math.SQRT2;
        leftX = x - offset;
        topY = y - offset;
        sideSize = Math.SQRT2 * radius;
        this.roundedRect(ctx, leftX, topY, sideSize, sideSize, radius / 2);
        ctx.closePath();
        break;
      case 'rectRot':
        size = (1 / Math.SQRT2) * radius;
        ctx.moveTo(x - size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y - size);
        ctx.closePath();
        break;
      case 'cross':
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y - radius);
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      case 'crossRot':
        xOffset = Math.cos(Math.PI / 4) * radius;
        yOffset = Math.sin(Math.PI / 4) * radius;
        ctx.moveTo(x - xOffset, y - yOffset);
        ctx.lineTo(x + xOffset, y + yOffset);
        ctx.moveTo(x - xOffset, y + yOffset);
        ctx.lineTo(x + xOffset, y - yOffset);
        ctx.closePath();
        break;
      case 'star':
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y - radius);
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        xOffset = Math.cos(Math.PI / 4) * radius;
        yOffset = Math.sin(Math.PI / 4) * radius;
        ctx.moveTo(x - xOffset, y - yOffset);
        ctx.lineTo(x + xOffset, y + yOffset);
        ctx.moveTo(x - xOffset, y + yOffset);
        ctx.lineTo(x + xOffset, y - yOffset);
        ctx.closePath();
        break;
      case 'line':
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      default:
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        break;
    }
  },

  /**
   * 같은 색(fillStyle/strokeStyle)인 점들을 한 path에 모아 fill/stroke를 1회만 호출한다.
   * 호출자가 ctx.fillStyle/strokeStyle을 미리 set해야 한다. 점마다 path-per-point fill/stroke를
   * 하던 비용을 그룹당 1회로 붕괴시킨다(라이브 대시보드 isSingle 마커 폭주 대응).
   * @param {object} ctx
   * @param {string} style
   * @param {number} radius
   * @param {Array<{xp:number, yp:number}>} points
   * @returns {undefined}
   */
  drawPointBatch(ctx, style, radius, points) {
    if (isNaN(radius) || radius <= 0 || !points || !points.length) {
      return;
    }

    // rect는 path 기반이 아니라 batch 불가 → per-point fillRect/strokeRect(색은 그룹당 1회 set됨).
    if (style === 'rect') {
      const size = (1 / Math.SQRT2) * radius;
      for (let i = 0; i < points.length; i++) {
        ctx.fillRect(points[i].xp - size, points[i].yp - size, 2 * size, 2 * size);
        ctx.strokeRect(points[i].xp - size, points[i].yp - size, 2 * size, 2 * size);
      }
      return;
    }

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      this._appendPointPath(ctx, style, radius, points[i].xp, points[i].yp);
    }
    if (!NON_FILL_POINT_STYLES.includes(style)) {
      ctx.fill();
    }
    ctx.stroke();
  },

  /**
   * Draw roundedRect point for chart
   * @param {object} ctx       canvas context
   * @param {number} x         x position
   * @param {number} y         y position
   * @param {string} width     width
   * @param {number} height    height
   * @param {number} radius    radius
   *
   * @returns {undefined}
   */
  roundedRect(ctx, x, y, width, height, radius) {
    const pi = Math.PI;
    const halfPi = pi / 2;

    if (radius) {
      const r = Math.min(radius, height / 2, width / 2);
      const left = x + r;
      const top = y + r;
      const right = x + width - r;
      const bottom = y + height - r;

      ctx.moveTo(x, top);
      if (left < right && top < bottom) {
        ctx.arc(left, top, r, -pi, -halfPi);
        ctx.arc(right, top, r, -halfPi, 0);
        ctx.arc(right, bottom, r, 0, halfPi);
        ctx.arc(left, bottom, r, halfPi, pi);
      } else if (left < right) {
        ctx.moveTo(left, y);
        ctx.arc(right, top, r, -halfPi, halfPi);
        ctx.arc(left, top, r, halfPi, pi + halfPi);
      } else if (top < bottom) {
        ctx.arc(left, top, r, -pi, 0);
        ctx.arc(left, bottom, r, 0, pi);
      } else {
        ctx.arc(left, top, r, -pi, pi);
      }
      ctx.closePath();
      ctx.moveTo(x, y);
    } else {
      ctx.rect(x, y, width, height);
    }
  },

  /**
   * create Linear Gradient
   * @param ctx
   * @param isHorizontal
   * @param positions
   * @param stops
   * @param isDownplay
   * @param unSelectedOpacity
   *
   * @returns {object} gradient
   */
  createGradient(ctx, isHorizontal, positions, stops, isDownplay, unSelectedOpacity) {
    const { x, y, w, h } = positions;
    let gradient;

    if (isHorizontal) {
      gradient = ctx.createLinearGradient(x, 0, x + w, 0);
    } else {
      gradient = ctx.createLinearGradient(0, y, 0, y + h);
    }

    for (let ix = 0; ix < stops.length; ix++) {
      const stopIdx = stops[ix][0] ?? 0;
      const stopColor = stops[ix][1] ?? 'rgba(255, 255, 255, 0)';
      const noneDownplayOpacity = stopColor.includes('rgba') ? Util.getOpacity(stopColor) : 1;
      const opacity = isDownplay ? unSelectedOpacity : noneDownplayOpacity;

      gradient.addColorStop(stopIdx, Util.colorStringToRgba(stopColor, opacity));
    }

    return gradient;
  },
};
