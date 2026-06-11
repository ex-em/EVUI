import Canvas from '../helpers/helpers.canvas';
import Bar from './element.bar';
import Util from '../helpers/helpers.util';

class TimeBar extends Bar {
  /**
   * Compute pixel geometry (xp/yp/w/h) for each time bar and store it on the main model.
   * 기하 계산만 수행한다(canvas 그리기 없음). subW(부분 bar 클리핑) 누적과 gradient용 w 보정까지
   * draw와 동일하게 반영해 hit-test가 동일한 item.xp/yp/w/h를 소비하도록 한다.
   * @param {object} param     object for drawing series data
   * @returns {undefined}
   */
  computeGeometry(param) {
    if (!this.show) {
      return;
    }

    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const isHorizontal = param.isHorizontal;
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
    const xep = chartRect.x2 - labelOffset.right;

    const dArea = isHorizontal ? yArea : xArea;
    const cArea = dArea / (this.data.length || 1);
    const cPad = 2;

    let bArea;
    if (this.isExistGrp) {
      bArea = cArea - cPad * 2;
    } else {
      bArea = (cArea - cPad * 2) / showSeriesCount;
    }

    const getSize = () => {
      if (typeof thickness === 'string' && /[0-9]+px/.test(thickness)) {
        return Math.min(bArea, Number(thickness.replace('px', '')));
      }
      if (typeof thickness === 'number' && thickness <= 1 && thickness >= 0) {
        return Math.ceil(bArea * thickness);
      }
      return bArea;
    };
    const size = getSize();

    let w = isHorizontal ? null : size;
    let subW = isHorizontal ? null : size;
    let h = isHorizontal ? size : null;

    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    const barSeriesX = this.isExistGrp ? 1 : showIndex + 1;

    this.size.cat = cArea;
    this.size.bar = bArea;
    this.size.cPad = cPad;
    this.size.bPad = bPad;
    this.size.w = w;
    this.size.ix = barSeriesX;
    this.chartRect = chartRect;
    this.labelOffset = labelOffset;
    this.borderRadius = param.borderRadius;

    this.data.forEach((item) => {
      if (isHorizontal) {
        x = xsp;
        y = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else {
        x = Canvas.calculateSubX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        if (x < xsp) {
          subW -= xsp - x;
          x = x + w < xsp ? null : xsp;
        } else if (x + w > xep) {
          subW -= subW - (xep - x);
        }

        if (x >= xep) {
          x = null;
        }

        if (x !== null) {
          x += Math.ceil(bArea * barSeriesX) - Math.round(w + bPad);
        }
        y = ysp;
      }

      if (isHorizontal) {
        if (item.b) {
          w = Canvas.calculateX(item.x - item.b, minmaxX.graphMin, minmaxX.graphMax, xArea);
          x = Canvas.calculateX(item.b, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        } else {
          w = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea);
        }
      } else if (item.b) {
        h = Canvas.calculateY(item.y - item.b, minmaxY.graphMin, minmaxY.graphMax, yArea);
        y = Canvas.calculateY(item.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else {
        h = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea);
      }

      if (x !== null && y !== null) {
        const barColor = item.dataColor || this.color;
        // gradient 색일 때 draw가 적용하는 w 보정을 기하에도 동일하게 반영한다.
        if (typeof barColor !== 'string') {
          w = w !== subW ? subW : w;
        }
      }
      subW = w;

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line
      item.w = w; // eslint-disable-line
      item.h = isHorizontal ? -h : h; // eslint-disable-line
    });
  }

  /**
   * Draw series data
   * It shows partial bar item as time goes by.
   * @param {object} param     object for drawing series data
   *
   * @returns {undefined}
   */
  draw(param) {
    if (!this.show) {
      return;
    }

    // 기하는 기하 패스가 채운다. 아래 래스터 패스는 로컬 재계산으로 그리며 mutate하지 않는다.
    this.computeGeometry(param);

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const isHorizontal = param.isHorizontal;
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
    const xep = chartRect.x2 - labelOffset.right;

    const dArea = isHorizontal ? yArea : xArea;
    const cArea = dArea / (this.data.length || 1);
    const cPad = 2;

    let bArea;
    if (this.isExistGrp) {
      bArea = cArea - cPad * 2;
    } else {
      bArea = (cArea - cPad * 2) / showSeriesCount;
    }

    const getSize = () => {
      if (typeof thickness === 'string' && /[0-9]+px/.test(thickness)) {
        return Math.min(bArea, Number(thickness.replace('px', '')));
      }
      if (typeof thickness === 'number' && thickness <= 1 && thickness >= 0) {
        return Math.ceil(bArea * thickness);
      }
      return bArea;
    };
    const size = getSize();

    let w = isHorizontal ? null : size;
    let subW = isHorizontal ? null : size;
    let h = isHorizontal ? size : null;

    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    const barSeriesX = this.isExistGrp ? 1 : showIndex + 1;

    this.size.cat = cArea;
    this.size.bar = bArea;
    this.size.cPad = cPad;
    this.size.bPad = bPad;
    this.size.w = w;
    this.size.ix = barSeriesX;
    this.chartRect = chartRect;
    this.labelOffset = labelOffset;
    this.borderRadius = param.borderRadius;

    this.data.forEach((item, index) => {
      ctx.beginPath();

      if (isHorizontal) {
        x = xsp;
        y = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else {
        x = Canvas.calculateSubX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        if (x < xsp) {
          subW -= xsp - x;
          x = x + w < xsp ? null : xsp;
        } else if (x + w > xep) {
          subW -= subW - (xep - x);
        }

        if (x >= xep) {
          x = null;
        }

        if (x !== null) {
          x += Math.ceil(bArea * barSeriesX) - Math.round(w + bPad);
        }
        y = ysp;
      }

      if (isHorizontal) {
        if (item.b) {
          w = Canvas.calculateX(item.x - item.b, minmaxX.graphMin, minmaxX.graphMax, xArea);
          x = Canvas.calculateX(item.b, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
        } else {
          w = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea);
        }
      } else if (item.b) {
        // vertical stack bar chart
        h = Canvas.calculateY(item.y - item.b, minmaxY.graphMin, minmaxY.graphMax, yArea);
        y = Canvas.calculateY(item.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);
      } else {
        // vertical bar chart
        h = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea);
      }

      if (x !== null && y !== null) {
        const barColor = item.dataColor || this.color;
        const noneDownplayOpacity = barColor.includes('rgba') ? Util.getOpacity(barColor) : 1;
        const opacity = this.state === 'downplay' ? param.unSelectedOpacity : noneDownplayOpacity;

        if (typeof barColor !== 'string') {
          w = w !== subW ? subW : w;

          ctx.fillStyle = Canvas.createGradient(
            ctx,
            isHorizontal,
            { x, y, w, h },
            barColor,
            this.state === 'downplay',
            param.unSelectedOpacity,
          );
        } else {
          ctx.fillStyle = Util.colorStringToRgba(barColor, opacity);
        }

        this.drawBar({
          ctx,
          positions: { x, y, w, h },
        });

        if (this.showValue.use) {
          this.drawValueLabels({
            context: ctx,
            data: item,
            positions: {
              x,
              y,
              h,
              w,
            },
            isHighlight: false,
            index,
          });
        }
      }
      subW = w;
      // 기하(xp/yp/w/h)는 computeGeometry가 채운다. 래스터 패스는 mutate하지 않는다.
    });
  }
}

export default TimeBar;
