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

  calculateMagnitude(val) {
    return Math.floor(Math.log(val) / Math.LN10);
  },

  aliasPixel(pixelWidth) {
    return (pixelWidth % 2 === 0) ? 0 : 0.5;
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
    const calcSpan = document.createElement('span');
    calcSpan.setAttribute('style', 'visibility:hidden; position:absolute; top:-10000;');
    calcSpan.style.font = fontStyle;
    calcSpan.textContent = text;
    document.body.appendChild(calcSpan);

    return {
      width: Math.ceil(calcSpan.getBoundingClientRect().width) || 2,
      height: Math.ceil(calcSpan.getBoundingClientRect().height) || 2,
    };
  },
};
