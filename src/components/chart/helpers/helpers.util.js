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

  labelSignFormat(value) {
    let label;
    if (typeof value === 'number') {
      if (value >= 1000000000) {
        if (value % 1000000000 === 0) {
          label = `${(value / 1000000000).toFixed(1)}G`;
        } else {
          label = `${(value / 1000000000).toFixed(1)}G`;
        }
      } else if (value >= 1000000) {
        if (value % 1000000 === 0) {
          label = `${(value / 1000000).toFixed(1)}M`;
        } else {
          label = `${(value / 1000000).toFixed(1)}M`;
        }
      } else if (value >= 1000) {
        if (value % 1000 === 0) {
          label = `${(value / 1000).toFixed(1)}k`;
        } else {
          label = `${(value / 1000).toFixed(1)}k`;
        }
      } else {
        label = value.toFixed(1);
      }
    } else {
      label = value;
    }

    return label;
  },

  calcTextSize(text, fontStyle) {
    const calc = document.createElement('span');
    calc.setAttribute('style', 'visibility:hidden; position:absolute; top:-10000px;');
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
