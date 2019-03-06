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
    return (width % 2 === 0) ? 0 : 0.5;
  },

  getLabelStyle(style) {
    return `normal ${style.fontSize}px ${style.fontFamily}`;
  },

  labelSignFormat(value, decimalPoint) {
    let label;
    if (typeof value === 'number') {
      if (value >= 1000000000000000) {
        if (value % 1000000000000000 === 0) {
          label = `${(value / 1000000000000000).toFixed(decimalPoint)}P`;
        } else {
          label = `${(value / 1000000000000000).toFixed(1)}P`;
        }
      } else if (value >= 1000000000000) {
        if (value % 1000000000000 === 0) {
          label = `${(value / 1000000000000).toFixed(decimalPoint)}T`;
        } else {
          label = `${(value / 1000000000000).toFixed(1)}T`;
        }
      } else if (value >= 1000000000) {
        if (value % 1000000000 === 0) {
          label = `${(value / 1000000000).toFixed(decimalPoint)}G`;
        } else {
          label = `${(value / 1000000000).toFixed(1)}G`;
        }
      } else if (value >= 1000000) {
        if (value % 1000000 === 0) {
          label = `${(value / 1000000).toFixed(decimalPoint)}M`;
        } else {
          label = `${(value / 1000000).toFixed(1)}M`;
        }
      } else if (value >= 1000) {
        if (value % 1000 === 0) {
          label = `${(value / 1000).toFixed(decimalPoint)}K`;
        } else {
          label = `${(value / 1000).toFixed(1)}K`;
        }
      } else if (value < 1 && value > 0) {
        label = value.toFixed(1);
      } else {
        label = value.toFixed(decimalPoint);
      }
    } else {
      label = value;
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
