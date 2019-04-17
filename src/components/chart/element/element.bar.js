import _merge from 'lodash/merge';
import { COLOR, BAR_OPTION } from '../helpers/helpers.constant';
import Canvas from '../helpers/helpers.canvas';

class Bar {
  constructor(sId, opt, sIdx) {
    const merged = _merge({}, BAR_OPTION, opt);
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
    if (!this.show) {
      return;
    }

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const index = param.showIndex;
    const isHorizontal = param.isHorizontal;
    const labels = param.integratedLabels;
    const thickness = param.thickness;
    const showSeriesCount = param.showSeriesCount;

    let x;
    let y;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const dArea = isHorizontal ? yArea : xArea;
    const cArea = dArea / (labels.length || 1);
    const cPad = 2;

    let bArea;
    if (this.isExistGrp) {
      bArea = (cArea - (cPad * 2));
    } else {
      bArea = (cArea - (cPad * 2)) / showSeriesCount;
    }
    let w = isHorizontal ? null : Math.round(bArea * thickness);
    let h = isHorizontal ? Math.round(bArea * thickness) : null;

    // barArea내에서 barWidth로 빠진 부분을 계산.
    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    // series index에 따라 시작 X값 보정을 위한 변수.
    const barSeriesX = this.isExistGrp ? 1 : index + 1;

    let categoryPoint = null;

    ctx.beginPath();
    ctx.fillStyle = this.color;

    this.data.forEach((item) => {
      const posIdx = labels.indexOf(isHorizontal ? item.y : item.x);
      if (posIdx < 0) {
        return;
      }

      if (isHorizontal) {
        categoryPoint = ysp - (cArea * posIdx) - cPad;
      } else {
        categoryPoint = xsp + (cArea * posIdx) + cPad;
      }

      if (isHorizontal) {
        x = xsp;
        y = Math.round(categoryPoint - ((bArea * barSeriesX) - (h + bPad)));
      } else {
        x = Math.round(categoryPoint + ((bArea * barSeriesX) - (w + bPad)));
        y = ysp;
      }

      if (isHorizontal) {
        if (item.b) {
          w = Canvas.calculateX(item.x - item.b, minmaxX.graphMin, minmaxX.graphMax, xArea);
          x = Canvas.calculateX(item.b, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        } else {
          w = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea);
        }
      } else if (item.b) { // vertical stack bar chart
        h = Canvas.calculateY(item.y - item.b, minmaxY.graphMin, minmaxY.graphMax, yArea);
        y = Canvas.calculateY(item.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else { // vertical bar chart
        h = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea);
      }

      ctx.fillRect(x, y, w, isHorizontal ? -h : h);

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line
      item.w = w; // eslint-disable-line
      item.h = isHorizontal ? -h : h; // eslint-disable-line
    });
  }
}

export default Bar;
