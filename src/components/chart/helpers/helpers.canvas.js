import Util from './helpers.util';

export default {
  /**
   * Calculate X position
   * @param {any}    value         graph value
   * @param {number} min           min value
   * @param {number} max           max value
   * @param {number} area          height for axis
   * @param {number} startPoint    startPoint
   *
   * @returns {any} position
   */
  calculateX(value, min, max, area, startPoint = 0) {
    if (value === null) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }

    const scalingFactor = area / (max - min);
    return Math.ceil(startPoint + (scalingFactor * (value - min)));
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
    if (value === null) {
      return null;
    }

    const scalingFactor = area / (max - min);
    return Math.ceil(startPoint + (scalingFactor * (value - min)));
  },

  /**
   * Calculate Y position
   * @param {any}    value         graph value
   * @param {number} min           min value
   * @param {number} max           max value
   * @param {number} area          height for axis
   * @param {number} startPoint    startPoint
   *
   * @returns {any} position
   */
  calculateY(value, min, max, area, startPoint = 0) {
    let calcY;

    if (value === null) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }
    // Bar차트의 fillRect처리를 위해 invert값 추가 하여 Y값을 처리
    const scalingFactor = area / (max - min);
    if (startPoint) {
      calcY = startPoint - (scalingFactor * (value - (min || 0)));
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
    let edgeLength;
    let xOffset;
    let yOffset;
    let height;
    let size;

    if (isNaN(radius) || radius <= 0) {
      return;
    }

    let offset;
    let leftX;
    let topY;
    let sideSize;

    switch (style) {
      // Default includes circle
      case 'triangle':
        ctx.beginPath();
        edgeLength = (3 * radius) / Math.sqrt(3);
        height = (edgeLength * Math.sqrt(3)) / 2;
        ctx.moveTo(x - (edgeLength / 2), y + (height / 3));
        ctx.lineTo(x + (edgeLength / 2), y + (height / 3));
        ctx.lineTo(x, y - ((2 * height) / 3));
        ctx.closePath();
        ctx.fill();
        break;
      case 'rect':
        size = (1 / Math.SQRT2) * radius;
        ctx.beginPath();
        ctx.fillRect(x - size, y - size, 2 * size, 2 * size);
        ctx.strokeRect(x - size, y - size, 2 * size, 2 * size);
        break;
      case 'rectRounded':
        offset = radius / Math.SQRT2;
        leftX = x - offset;
        topY = y - offset;
        sideSize = Math.SQRT2 * radius;
        ctx.beginPath();
        this.roundedRect(ctx, leftX, topY, sideSize, sideSize, radius / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'rectRot':
        size = (1 / Math.SQRT2) * radius;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y - size);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cross':
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y - radius);
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      case 'crossRot':
        ctx.beginPath();
        xOffset = Math.cos(Math.PI / 4) * radius;
        yOffset = Math.sin(Math.PI / 4) * radius;
        ctx.moveTo(x - xOffset, y - yOffset);
        ctx.lineTo(x + xOffset, y + yOffset);
        ctx.moveTo(x - xOffset, y + yOffset);
        ctx.lineTo(x + xOffset, y - yOffset);
        ctx.closePath();
        break;
      case 'star':
        ctx.beginPath();
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
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      default:
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        break;
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
      const right = (x + width) - r;
      const bottom = (y + height) - r;

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
   *
   * @returns {object} gradient
   */
  createGradient(ctx, isHorizontal, positions, stops, isDownplay) {
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
      const opacity = isDownplay ? 0.1 : noneDownplayOpacity;

      gradient.addColorStop(stopIdx, Util.colorStringToRgba(stopColor, opacity));
    }

    return gradient;
  },
};
