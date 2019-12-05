import {
  billions,
  millions,
  quadrillion,
  trillion,
  truthy,
} from '@/common/utils';

export default {
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

  calculateMagnitude(value) {
    return Math.floor(Math.log(value) / Math.LN10);
  },

  aliasPixel(width) {
    return width % 2 === 0 ? 0 : 0.5;
  },

  getLabelStyle(style) {
    return `normal ${style.fontSize}px ${style.fontFamily}`;
  },

  labelSignFormat(value, decimalPoint) {
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

  getStringMinMax(array) {
    const minMax = {
      min: array[0],
      max: array[0],
    };

    array.forEach((item) => {
      if (minMax.max.length < item.length) {
        minMax.max = item;
      }

      if (minMax.min.length > item.length) {
        minMax.min = item;
      }
    });

    return minMax;
  },
};
