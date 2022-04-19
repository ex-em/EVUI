import { defaultsDeep } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Line {
  constructor(sId, opt, sIdx) {
    const merged = defaultsDeep({}, opt, LINE_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = colorProp === 'pointFill' ? this.color : COLOR[sIdx];
      }
    });
    this.type = 'line';
    this.sId = sId;
    this.state = 'normal';
    this.extent = {
      downplay: { opacity: 0.1, lineWidth: 1 },
      normal: { opacity: 1, lineWidth: 1 },
      highlight: { opacity: 1, lineWidth: 2 },
    };
    this.data = [];
    this.size = {
      comboOffset: 0,
    };
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

    const { ctx, chartRect, labelOffset, axesSteps, selectLabel } = param;
    const extent = this.extent[this.state];
    const selectLabelOption = selectLabel.option;
    const selectedLabel = selectLabel.selected;
    const isExistSelectedLabel = selectLabelOption.use
      && selectLabelOption.useSeriesOpacity
      && selectedLabel.dataIndex?.length > 0;
    const downplayOpacity = this.extent.downplay.opacity;

    const fillOpacity = isExistSelectedLabel
      ? this.fillOpacity * downplayOpacity : this.fillOpacity * extent.opacity;
    const lineWidth = this.lineWidth * extent.lineWidth;

    const getOpacity = (colorStr) => {
      const noneDownplayOpacity = colorStr.includes('rgba') ? Util.getOpacity(colorStr) : 1;
      return this.state === 'downplay' || isExistSelectedLabel ? 0.1 : noneDownplayOpacity;
    };

    const mainColor = this.color;
    const mainColorOpacity = getOpacity(mainColor);
    const pointFillColor = this.pointFill;
    const pointFillColorOpacity = getOpacity(pointFillColor);

    ctx.beginPath();
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);

    if (this.fill) {
      ctx.fillStyle = Util.colorStringToRgba(mainColor, fillOpacity);
    }

    let startFillIndex = 0;
    const endPoint = chartRect.y2 - labelOffset.bottom;

    let x;
    let y;
    let barAreaByCombo = 0;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    if (this.combo) {
      barAreaByCombo = xArea / (this.data.length || 1);
      xArea -= barAreaByCombo;
      this.size.comboOffset = barAreaByCombo;
    }

    const xsp = chartRect.x1 + labelOffset.left + (barAreaByCombo / 2);
    const ysp = chartRect.y2 - labelOffset.bottom;

    const getXPos = val => Canvas.calculateX(val, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    const getYPos = val => Canvas.calculateY(val, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

    this.data.reduce((prev, curr, ix, item) => {
      x = getXPos(curr.x);
      y = getYPos(curr.y);

      if (x !== null) {
        x += Util.aliasPixel(x);
      }

      if (y === null || x === null) {
        if (ix - 1 > -1) {
          // draw fill(area) series not stacked
          if (this.fill && prev.y !== null && !this.stackIndex) {
            ctx.stroke();
            ctx.lineTo(prev.xp, endPoint);
            ctx.lineTo(item[startFillIndex].xp, endPoint);

            ctx.fill();
            ctx.beginPath();
          }
        }

        startFillIndex = ix + 1;
      } else if (ix === 0 || prev.y === null || curr.y === null
        || prev.x === null || curr.x === null) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      curr.xp = x; // eslint-disable-line
      curr.yp = y; // eslint-disable-line

      return curr;
    }, this.data[0]);

    ctx.stroke();

    const dataLen = this.data.length;

    if (this.fill && dataLen) {
      ctx.fillStyle = Util.colorStringToRgba(mainColor, fillOpacity);

      if (this.stackIndex) {
        const reversedDataList = this.data.slice().reverse();
        reversedDataList.forEach((curr, ix) => {
          x = getXPos(curr.x);
          y = getYPos(curr.b);

          const prev = reversedDataList[ix - 1];
          if (curr.o !== null) {
            if (prev && prev.o == null) {
              ctx.moveTo(x, getYPos(curr.b + curr.o));
            }

            ctx.lineTo(x, y);

            if (ix === reversedDataList.length - 1) {
              ctx.lineTo(x, getYPos(curr.b + curr.o));
            }
          } else if (prev && prev.o) {
            ctx.lineTo(getXPos(prev.x), getYPos(prev.b + prev.o));
          }
        });
      } else if (startFillIndex < dataLen) {
        ctx.lineTo(this.data[dataLen - 1].xp, endPoint);
        ctx.lineTo(this.data[startFillIndex].xp, endPoint);
      }

      ctx.fill();
    }
    if (this.point || isExistSelectedLabel) {
      ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
      const focusStyle = Util.colorStringToRgba(pointFillColor, 1);
      const blurStyle = Util.colorStringToRgba(pointFillColor, pointFillColorOpacity);

      this.data.forEach((curr, i) => {
        if (curr.xp !== null && curr.yp !== null) {
          ctx.fillStyle = isExistSelectedLabel && selectedLabel.dataIndex.includes(i)
            ? focusStyle : blurStyle;
          if (this.point || selectedLabel.dataIndex.includes(i)) {
            Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
          }
        }
      });
    }

    ctx.restore();
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
      ctx.strokeStyle = Util.colorStringToRgba(this.color, 0);
      ctx.fillStyle = Util.colorStringToRgba(this.color, this.highlight.maxShadowOpacity);
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxShadowSize, x, y);

      ctx.fillStyle = this.color;
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, x, y);

      ctx.fillStyle = '#fff';
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, x, y);
    }

    ctx.restore();
  }

  /**
   * Find graph item
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findGraphData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    let s = 0;
    let e = gdata.length - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const x = gdata[m].xp;
      const y = gdata[m].yp;

      if ((x - 6 <= xp) && (xp <= x + 6)) {
        item.data = gdata[m];
        item.index = m;

        if ((y - 6 <= yp) && (yp <= y + 6)) {
          item.hit = true;
        }
        return item;
      } else if (x + 6 < xp) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }

  /**
   * Find approximate graph item
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findApproximateData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    let s = 0;
    let e = gdata.length - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const x = gdata[m].xp;
      const y = gdata[m].yp;

      if ((x - 2 <= xp) && (xp <= x + 2)) {
        item.data = gdata[m];
        item.index = m;

        if ((y - 2 <= yp) && (yp <= y + 2)) {
          item.hit = true;
        }

        return item;
      } else if (x + 2 < xp) {
        if (m < e && xp < gdata[m + 1].xp) {
          const curr = Math.abs(gdata[m].xp - xp);
          const next = Math.abs(gdata[m + 1].xp - xp);

          item.data = curr > next ? gdata[m + 1] : gdata[m];
          item.index = curr > next ? m + 1 : m;
          return item;
        }
        s = m + 1;
      } else {
        if (m > 0 && xp > gdata[m - 1].xp) {
          const prev = Math.abs(gdata[m - 1].xp - xp);
          const curr = Math.abs(gdata[m].xp - xp);

          item.data = prev > curr ? gdata[m] : gdata[m - 1];
          item.index = prev > curr ? m : m - 1;
          return item;
        }
        e = m - 1;
      }
    }

    return item;
  }

  /**
   * Returns items in range
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, width }) {
    const xep = xsp + width;

    return this.data.filter(seriesData => (xsp - 1 <= seriesData.xp) && (seriesData.xp <= xep + 1));
  }
}

export default Line;
