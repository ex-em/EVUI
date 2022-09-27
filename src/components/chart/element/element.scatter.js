import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Scatter {
  constructor(sId, opt, sIdx) {
    const merged = merge({}, LINE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = COLOR[sIdx];
      }
    });

    this.sId = sId;
    this.data = [];
    this.type = 'scatter';
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

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const displayOverflow = param.displayOverflow;

    let x;
    let y;
    let aliasPixel;
    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    if (displayOverflow) {
      this.data = this.data.map(val => ({
        ...val,
        y: val.y > minmaxY.graphMax ? minmaxY.graphMax : val.y,
      }));
    }

    this.data.forEach((item) => {
      x = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
      y = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

      if (x !== null) {
        aliasPixel = Util.aliasPixel(x);
        x += aliasPixel;
      }

      item.xp = x; // eslint-disable-line
      item.yp = y; // eslint-disable-line

      return item;
    }, this.data[0]);

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

    this.data.forEach((curr, idx) => {
      if (curr.xp !== null && curr.yp !== null) {
        const color = curr.dataColor || this.color;
        ctx.strokeStyle = Util.colorStringToRgba(color, getOpacity(color, idx));

        const pointFillColor = curr.dataColor || this.pointFill;
        ctx.fillStyle = Util.colorStringToRgba(pointFillColor, getOpacity(pointFillColor, idx));

        Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
      }
    });
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
    const items = gdata.filter(seriesData =>
        (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
        && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));

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
