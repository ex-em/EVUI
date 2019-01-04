export default {
  defaultColor: ['#2b99f0', '#8ac449', '#009697', '#959c2c', '#004ae7', '#01cc00', '#15679a',
    '#43bcd7', '#e76627', '#5C8558', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE',
    '#BCF061', '#B26600', '#27358F', '#A4534D', '#B89630', '#A865B4', '#254763', '#536859',
    '#E9F378', '#888A79', '#D67D4B', '#2BEC69', '#4A2BEC', '#2BBEEC', '#DDACDF'],

  extraColor: [],

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

  getLabelStyle(axis) {
    const style = axis.labelStyle;
    return `normal ${style.fontSize}px ${style.fontFamily}`;
  },

  labelFormat(value) {
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
};
