import {
  billions,
  millions,
  quadrillion,
  trillion,
  truthy,
} from '@/common/utils';

export default {
  /**
   * Transforming hex to rgb code
   * @param {string} hex    hex color code
   *
   * @returns {string} rgb code
   */
  hexToRgb(hex) {
    if (!hex) {
      return false;
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `${r},${g},${b}`;
  },

  /**
   * Check color string and return what type it is. ('HEX', 'RGB', 'RGBA' or 'NONE')
   * @param colorStr
   * @returns {string} color type
   */
  getColorStringType(colorStr) {
    const noneWhiteSpaceColorStr = colorStr.replace(/ /g, '');
    const isHEX = /^#(?:[A-Fa-f0-9]{3}){1,2}$/.exec(noneWhiteSpaceColorStr);
    const isRGB = /^rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}[)]$/.exec(noneWhiteSpaceColorStr);
    const isRGBA = /^rgba[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*,){3}\s*0*(?:\.\d+|1?)\s*[)]$/.exec(noneWhiteSpaceColorStr);
    let result = '';

    if (isHEX) {
      result = 'HEX';
    } else if (isRGB) {
      result = 'RGB';
    } else if (isRGBA) {
      result = 'RGBA';
    } else {
      result = 'NONE';
    }

    return result;
  },

  /**
   * Transforming color string to rgba code
   * Return BLACK ('rgba(0, 0, 0, ${opacity})') if fail transforming
   * @param colorStr        hex color code, rgb, rgba .. etc
   * @param opacity            color opacity. (default 1)translate
   * @returns {string} transformed rgba
   */
  colorStringToRgba(colorStr, opacity = 1) {
    const noneWhiteSpaceColorStr = colorStr.replace(/ /g, '');
    const colorType = this.getColorStringType(noneWhiteSpaceColorStr);
    let resultRGBA = '';

    switch (colorType) {
      case 'HEX':
        resultRGBA = `rgba(${this.hexToRgb(noneWhiteSpaceColorStr)},${opacity})`;
        break;
      case 'RGB':
        resultRGBA = noneWhiteSpaceColorStr.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        break;
      case 'RGBA':
        resultRGBA = noneWhiteSpaceColorStr.replace(`${this.getOpacity(colorStr)})`, `${opacity})`);
        break;
      default:
        resultRGBA = `rgba(0, 0, 0, ${opacity})`;
        break;
    }

    return resultRGBA;
  },

  /**
   * get opacity value on rgba color string
   * ex) input  : rgba(255, 255, 255, 0.1)
   *     return : 0.1
   * @param rgbaColorString
   * @returns {string} opacity
   */
  getOpacity(rgbaColorString) {
    const noneWhiteSpaceColorStr = rgbaColorString.replace(/ /g, '');
    const colorType = this.getColorStringType(noneWhiteSpaceColorStr);

    if (colorType === 'RGBA') {
      return noneWhiteSpaceColorStr.replace(/^.*,(.+)\)/, '$1');
    }

    return '1';
  },

  /**
   * To logarithmic scale, compute log value
   * @param {number} value    graph value
   *
   * @returns {number} computed value
   */
  calculateMagnitude(value) {
    return Math.floor(Math.log(value) / Math.LN10);
  },

  /**
   * Set alias pixel to deal with anti-aliasing
   * @param {number} width    line width
   *
   * @returns {number} computed value
   */
  aliasPixel(width) {
    return width % 2 === 0 ? 0 : 0.5;
  },

  /**
   * Create string for canvas font style
   * @param {object} style    style object by user
   *
   * @returns {string} computed value
   */
  getLabelStyle(style) {
    const {
      fontStyle = 'normal',
      fontWeight = 'norma',
      fontSize = '12',
      fontFamily = 'Roboto',
    } = style;

    return `${fontStyle} normal ${fontWeight} ${fontSize}px ${fontFamily}`;
  },

  /**
   * Create sign format with number
   * @param {number} value           graph value
   * @param {number} decimalPoint    decimal point
   *
   * @returns {string} signed value
   */
  labelSignFormat(value, decimalPoint = 0) {
    const quad = quadrillion(1);
    const trill = trillion(1);
    const billi = billions(1);
    const milli = millions(1);
    const killo = 1000;

    let label;
    if (!truthy(value)) {
      return value;
    }

    const assignLabelWith = (v, target, lb) => {
      if (v % target === 0) {
        return `${(v / target).toFixed(decimalPoint)}${lb}`;
      }
      return `${(v / target).toFixed(1)}${lb}`;
    };

    if (value >= quad) {
      label = assignLabelWith(value, quad, 'P');
    } else if (value >= trill) {
      label = assignLabelWith(value, trill, 'T');
    } else if (value >= billi) {
      label = assignLabelWith(value, billi, 'G');
    } else if (value >= milli) {
      label = assignLabelWith(value, milli, 'M');
    } else if (value >= killo) {
      label = assignLabelWith(value, 1000, 'K');
    } else if (value < 1 && value > 0) {
      label = value.toFixed(1);
    } else {
      label = value.toFixed(decimalPoint);
    }

    return label;
  },

  /**
   * Calculate text size with html
   * @param {string} text         text is needed to check size
   * @param {string} fontStyle    text font style
   *
   * @returns {object} text size information
   */
  calcTextSize(text, fontStyle) {
    const calc = document.createElement('span');
    const style = `visibility:hidden; position:absolute; top:-10000px; font: ${fontStyle};`;

    calc.setAttribute('style', style);
    calc.style.font = fontStyle;
    calc.textContent = text;
    document.body.appendChild(calc);

    const rect = calc.getBoundingClientRect();
    const width = rect.width || 2;
    const height = rect.height || 2;

    calc.remove();

    return { width, height };
  },

  /**
   * Comparing strings
   * @param {array} array    compared array
   *
   * @returns {object} min/max information
   */
  getStringMinMax(array) {
    const minMax = {
      min: array[0],
      max: array[0],
    };

    array.forEach((item) => {
      if (minMax?.max?.length < item?.length) {
        minMax.max = item;
      }

      if (minMax?.min?.length > item?.length) {
        minMax.min = item;
      }
    });

    return minMax;
  },

  /**
   * Truncate the long string to short string with ellipsis until fitting maxWidth
   * @param {string} str         target string
   * @param {number} maxWidth    maximum string width on canvas
   * @param {Object} ctx         canvas context
   * @param {string} direction   left or right  (default: right)
   */
  truncateLabelWithEllipsis(str, maxWidth, ctx, direction = 'right') {
    if (!str) {
      return '';
    }

    if (!maxWidth) {
      return str;
    }

    const ellipsis = '…';
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    let temp = str;
    let tempWidth = ctx.measureText(temp).width;

    if (tempWidth <= maxWidth || tempWidth <= ellipsisWidth) {
      return str;
    }

    let len = temp.length;
    while (tempWidth >= maxWidth - ellipsisWidth && len-- > 0) {
      temp = direction === 'right' ? temp.substring(0, len) : temp.substring(1, temp.length);
      tempWidth = ctx.measureText(temp).width;
    }

    return direction === 'right' ? temp + ellipsis : ellipsis + temp;
  },
  /**
   * Draw text tip
   * @param {object} param     object for drawing text tip
   *
   * @returns {undefined}
   */
  showLabelTip(param) {
    const {
      ctx,
      width,
      height,
      x,
      y,
      arrowSize,
      borderRadius,
      text,
      backgroundColor,
      textColor,
    } = param;
    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = backgroundColor || '#E96E2C';
    ctx.strokeStyle = backgroundColor || '#E96E2C';
    ctx.shadowBlur = 0;
    ctx.moveTo(sx + borderRadius, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + borderRadius);
    ctx.lineTo(sx, ey - borderRadius);
    ctx.quadraticCurveTo(sx, ey, sx + borderRadius, ey);
    ctx.lineTo(ex - borderRadius, ey);
    ctx.quadraticCurveTo(ex, ey, ex, ey - borderRadius);
    ctx.lineTo(ex, sy + borderRadius);
    ctx.quadraticCurveTo(ex, sy, ex - borderRadius, sy);
    ctx.lineTo(x - arrowSize, sy);
    ctx.lineTo(x, sy - arrowSize);
    ctx.lineTo(x + arrowSize, sy);
    ctx.lineTo(sx + borderRadius, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.font = 'normal normal bold 12px Roboto';
    ctx.fillStyle = textColor || '#FFF';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${text}`, x, sy + (height / 2));
    ctx.restore();
    ctx.beginPath();
  },

  isPieType(type) {
    return type === 'pie' || type === 'doughnut' || type === 'sunburst';
  },

  isDoughnutHole(type) {
    return type === 'doughnut' || type === 'sunburst';
  },
};
