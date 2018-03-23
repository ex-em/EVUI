export default {
  getPaddingInfo(chartProps) {
    const xAxis = chartProps.xAxis;
    const yAxis = chartProps.yAxis;
    const props = chartProps;

    let tPad = 5;
    let lPad = 15;
    let rPad = 25;
    let bPad = 35;

    if (props.title.showTitle) {
      tPad += 40;
    }

    for (let ix = 0, ixLen = yAxis.length; ix < ixLen; ix++) {
      if (yAxis[ix].position === 'left') {
        lPad += 40;
        if (yAxis[ix].showAxisTitle) {
          lPad += 40;
        }
      } else if (yAxis[ix].position === 'right') {
        rPad += 40;
        if (yAxis[ix].showAxisTitle) {
          rPad += 40;
        }
      }
    }

    for (let ix = 0, ixLen = xAxis.length; ix < ixLen; ix++) {
      if (xAxis[ix].position === 'top') {
        tPad += 40;
        if (xAxis[ix].showAxisTitle) {
          tPad += 40;
        }
      } else if (xAxis[ix].position === 'bottom') {
        bPad += 40;
        if (xAxis[ix].showAxisTitle) {
          bPad += 40;
        }
      }
    }

    return { top: tPad, left: lPad, right: rPad, bottom: bPad };
  },

  getChartSizeInfo(target, context, props) {
    const ctx = context;
    const canvas = target;
    const padding = this.getPaddingInfo(props);

    let totalWidth = 0;
    let totalHeight = 0;
    let chartWidth = 0;
    let chartHeight = 0;
    let posInfo = {};

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    totalWidth = canvas.width;
    totalHeight = canvas.height;

    chartWidth = totalWidth - (padding.left + padding.right);
    chartHeight = totalHeight - (padding.top + padding.bottom);

    posInfo = {
      total: {
        x1: 0,
        y1: 0,
        x2: totalWidth,
        y2: totalHeight,
      },
      chart: {
        x1: padding.left,
        y1: padding.top,
        x2: padding.left + chartWidth,
        y2: padding.top + chartHeight,
      },
    };

    return {
      totalWidth,
      totalHeight,
      chartWidth,
      chartHeight,
      posInfo,
      padding,
    };
  },
};
