import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Scatter {
  constructor(sId, opt, sIdx, realTimeScatter = false) {
    const merged = merge({}, LINE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor', 'overflowColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = COLOR[sIdx];
      }
    });

    this.sId = sId;
    this.data = [];
    this.type = 'scatter';
    this.realTimeScatter = realTimeScatter;
  }

  /**
   * Draw series data
   * @param {object} param     object for drawing series data
   *
   * @returns {undefined}
   */
  draw(param) {
    if (!this.show) {
      return;
    }

    const { ctx, chartRect, labelOffset, axesSteps, displayOverflow, duple } = param;

    let x;
    let y;
    let aliasPixel;
    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const getOpacity = (colorStr, dataIndex) => {
      const noneDownplayOpacity = colorStr.includes('rgba') ? Util.getOpacity(colorStr) : 1;
      let isDownplay = false;

      const { selectInfo, legendHitInfo } = param;
      if (legendHitInfo) {
        isDownplay = legendHitInfo.sId !== this.sId;
      } else if (selectInfo) {
        isDownplay = selectInfo?.seriesID !== this.sId || selectInfo?.dataIndex !== dataIndex;
      }

      return isDownplay ? 0.1 : noneDownplayOpacity;
    };

    const calcItem = (item) => {
      x = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(
        displayOverflow && item.y > minmaxY.graphMax
          ? minmaxY.graphMax
          : item.y,
        minmaxY.graphMin,
        minmaxY.graphMax,
        yArea,
        ysp,
      );

      if (x !== null) {
        aliasPixel = Util.aliasPixel(x);
        x += aliasPixel;
      }

      item.xp = x;
      item.yp = y;
    };

    const defaultScatterDraw = () => {
      this.data.forEach((item, idx) => {
        calcItem(item);

        if (item.xp !== null && item.yp !== null) {
          const color = item.dataColor || this.color;
          ctx.strokeStyle = Util.colorStringToRgba(color, getOpacity(color, idx));

          const pointFillColor = item.dataColor || this.pointFill;
          ctx.fillStyle = Util.colorStringToRgba(pointFillColor, getOpacity(pointFillColor, idx));

          Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, item.xp, item.yp);
        }
      });
    };

    const realTimeScatterDraw = () => {
      const pointStyle = typeof this.pointStyle === 'string' ? this.pointStyle : this.pointStyle.value;
      const pointSize = typeof this.pointSize === 'number' ? this.pointSize : this.pointSize.value;

      for (let i = 0; i < this.data[this.sId].dataGroup.length; i++) {
        for (let j = 0; j < this.data[this.sId].dataGroup[i].data.length; j++) {
          const item = this.data[this.sId].dataGroup[i].data[j];

          if (!duple.has(`${item.x}${item.y}`)) {
            duple.add(`${item.x}${item.y}`);

            calcItem(item);

            if (item.xp !== null && item.yp !== null) {
              const overflowColor = item.y > minmaxY.graphMax && this.overflowColor;
              const color = overflowColor || item.color || this.color;

              ctx.strokeStyle = color;

              const pointFillColor = overflowColor || this.pointFill || item.color || this.color;
              ctx.fillStyle = pointFillColor;

              Canvas.drawPoint(ctx, pointStyle, pointSize, item.xp, item.yp);
            }
          }
        }
      }
    };

    if (this.realTimeScatter) {
      realTimeScatterDraw();
    } else {
      defaultScatterDraw();
    }
  }

  /**
   *Returns items in range
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, ysp, width, height }) {
    const gdata = this.data;
    const xep = xsp + width;
    const yep = ysp + height;
    let items = [];

    const defaultScatterFindItems = () => {
      items = gdata.filter(seriesData =>
        (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
        && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));
    };

    const realTimeScatterFindItems = () => {
      for (let i = 0; i < gdata[this.sId].dataGroup.length; i++) {
        const obj = gdata[this.sId].dataGroup[i];
        for (let j = 0; j < obj.data.length; j++) {
          if (xsp - 1 <= obj.data[j].xp && obj.data[j].xp <= xep + 1
            && ysp - 1 <= obj.data[j].yp && obj.data[j].yp <= yep + 1) {
            items.push(obj.data[j]);
          }
        }
      }
    };

    if (this.realTimeScatter) {
      realTimeScatterFindItems();
    } else {
      defaultScatterFindItems();
    }

    return items;
  }

  /**
   * Draw item highlight
   * @param {object}   item       object for drawing series data
   * @param {object}   context    canvas context
   * @param {boolean}  isMax      determines if this series has max value
   *
   * @returns {undefined}
   */
  itemHighlight(item, context) {
    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.save();
    if (x !== null && y !== null) {
      const color = gdata.dataColor || this.color;
      const pointFillColor = gdata.dataColor || this.pointFill;

      ctx.strokeStyle = Util.colorStringToRgba(color, 0);

      ctx.fillStyle = Util.colorStringToRgba(pointFillColor, this.highlight.maxShadowOpacity);
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxShadowSize, x, y);

      ctx.fillStyle = color;
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, x, y);

      ctx.fillStyle = '#fff';
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, x, y);
    }

    ctx.restore();
  }

  /**
   * Find graph item for tooltip
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findGraphData(offset) {
    if (this.realTimeScatter) return false;

    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color, index: null };
    const pointSize = this.pointSize;
    const gdata = this.data;

    const targetIndex = gdata.findIndex((data) => {
      const x = data.xp;
      const y = data.yp;

      return (x - pointSize <= xp)
        && (xp <= x + pointSize)
        && (y - pointSize <= yp)
        && (yp <= y + pointSize);
    });

    if (targetIndex > -1) {
      item.data = gdata[targetIndex];
      item.index = targetIndex;
      item.hit = true;
    }

    return item;
  }
}

export default Scatter;
