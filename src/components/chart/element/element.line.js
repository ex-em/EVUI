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
    this.extent = {
      downplay: { opacity: 0.1, lineWidth: 1 },
      normal: { opacity: 1, lineWidth: 1 },
      highlight: { opacity: 1, lineWidth: 2 },
    };
    this.data = [];
    this.beforeMouseXp = 0;
    this.beforeMouseYp = 0;
    this.beforeFindItemIndex = -1;
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

    const {
      ctx, chartRect,
      labelOffset, axesSteps,
      selectLabel, selectSeries, legendHitInfo,
      isBrush,
    } = param;

    // about selectLabel
    const selectLabelOption = selectLabel?.option;
    const useSelectLabel = selectLabelOption?.use && selectLabelOption?.useSeriesOpacity;
    const selectedLabelIndexList = selectLabel?.selected?.dataIndex ?? [];

    // set Style
    let extent;
    if (legendHitInfo) {
      extent = this.extent[legendHitInfo?.sId === this.sId ? 'highlight' : 'downplay'];
    } else if (selectSeries?.option?.use && selectSeries?.selected?.seriesId?.length) {
      const isSelectedSeries = selectSeries?.selected?.seriesId?.includes(this.sId);
      extent = this.extent[isSelectedSeries ? 'highlight' : 'downplay'];
    } else if (useSelectLabel && selectedLabelIndexList.length) {
      extent = this.extent.downplay;
    } else {
      extent = this.extent.normal;
    }

    const getOpacity = colorStr => (colorStr.includes('rgba') ? Util.getOpacity(colorStr) : extent.opacity);
    const mainColor = this.color;
    const mainColorOpacity = getOpacity(mainColor);
    const pointFillColor = this.pointFill;
    const pointFillColorOpacity = getOpacity(pointFillColor);
    const fillOpacity = getOpacity(mainColor) * this.fillOpacity;
    const lineWidth = this.lineWidth * extent.lineWidth;

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

    // draw line
    this.data.reduce((prev, curr, ix) => {
      x = getXPos(curr.x);
      y = getYPos(curr.y);

      if (x !== null) {
        x += Util.aliasPixel(x);
      }

      if (ix === 0) {
        ctx.moveTo(x, y);
      }

      const isNullValue = prev.y === null || curr.y === null || prev.x === null || curr.x === null;
      if (isNullValue) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      curr.xp = x; // eslint-disable-line
      curr.yp = y; // eslint-disable-line

      return curr;
    }, this.data[0]);

    ctx.stroke();

    // draw fill
    if (this.fill && this.data.length) {
      ctx.beginPath();

      const fillColor = Util.colorStringToRgba(mainColor, fillOpacity);

      if (this.fill?.gradient) {
        let maxValueYPos = this.data[0].yp;
        let minValueYBottomPos = this.data[0].y;
        this.data.forEach((data) => {
          if (data.yp && data.yp <= maxValueYPos) {
            maxValueYPos = data.yp;
          } else if (data.y && data.y >= minValueYBottomPos) {
            minValueYBottomPos = data.y;
          }
        });
        const gradient = ctx.createLinearGradient(0, chartRect.y2, 0, maxValueYPos);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(0.5, fillColor);
        gradient.addColorStop(1, (extent.opacity < 1 ? fillColor : mainColor));

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = fillColor;
      }

      this.data.forEach((currData, ix) => {
        const isEmptyPoint = data => data?.x === null || data?.y === null
          || data?.x === undefined || data?.y === undefined;

        const nextData = this.data[ix + 1];

        if (isEmptyPoint(currData)) {
          startFillIndex = ix + 1;

          if (!isEmptyPoint(nextData)) {
            ctx.moveTo(nextData.xp, nextData.yp);
          }

          return;
        }

        ctx.lineTo(currData.xp, currData.yp);

        if (isEmptyPoint(nextData)) {
          for (let jx = ix; jx >= startFillIndex; jx--) {
            const prevData = this.data[jx];
            const xp = prevData.xp;
            const bp = getYPos(prevData.b) ?? endPoint;
            ctx.lineTo(xp, bp);
          }

          ctx.closePath();
        }
      });

      ctx.fill();
    }

    // Draw points
    if (!isBrush) {
      ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
      const focusStyle = Util.colorStringToRgba(pointFillColor, 1);
      const blurStyle = Util.colorStringToRgba(pointFillColor, pointFillColorOpacity);

      this.data.forEach((curr, ix) => {
        if (curr.xp === null || curr.yp === null) {
          return;
        }

        const isSingle = this.data[ix - 1]?.o === null && this.data[ix + 1]?.o === null;
        const isSelectedLabel = selectedLabelIndexList.includes(ix);
        if (this.point || isSingle || isSelectedLabel) {
          ctx.fillStyle = isSelectedLabel && !legendHitInfo ? focusStyle : blurStyle;
          Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
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
   * @param {array}    offset          mouse position
   * @param {boolean}  isHorizontal
   * @param {number}   dataIndex       selected label data index
   * @param {boolean}  useSelectLabelOrItem   used to display select label/item at tooltip location
   *
   * @returns {object} graph item
   */
  findGraphData(offset, isHorizontal, dataIndex, useSelectLabelOrItem) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;
    const SPARE_XP = 0.5;

    if (gdata?.length) {
      if (typeof dataIndex === 'number' && this.show) {
        item.data = gdata[dataIndex];
        item.index = dataIndex;
      } else if (typeof this.beforeFindItemIndex === 'number' && this.show && useSelectLabelOrItem) {
        item.data = gdata[this.beforeFindItemIndex];
        item.index = this.beforeFindItemIndex;
      } else {
        let s = 0;
        let e = gdata.length - 1;
        const xpInterval = gdata[1]?.xp - gdata[0].xp < 6 ? 1.5 : 6;

        while (s <= e) {
          const m = Math.floor((s + e) / 2);
          const x = gdata[m].xp;
          const y = gdata[m].yp;

          if (x - xpInterval < xp && xp < x + xpInterval) {
            const curXpInterval = gdata[m]?.xp - (gdata[m - 1]?.xp ?? 0);

            if (gdata[m - 1]?.xp && gdata[m + 1]?.xp && curXpInterval > 0) {
              const leftXp = xp - gdata[m - 1].xp;
              const midXp = Math.abs(xp - gdata[m].xp);
              const rightXp = gdata[m + 1].xp - xp;

              if (
                Math.abs(this.beforeMouseXp - xp) >= curXpInterval - SPARE_XP
                && (this.beforeFindItemIndex === m || midXp === rightXp || midXp === leftXp)
              ) {
                if (this.beforeMouseXp - xp > 0) {
                  item.data = gdata[this.beforeFindItemIndex - 1];
                  item.index = this.beforeFindItemIndex - 1;
                } else if (this.beforeMouseXp - xp < 0) {
                  item.data = gdata[this.beforeFindItemIndex + 1];
                  item.index = this.beforeFindItemIndex + 1;
                } else if (this.beforeMouseYp !== yp) {
                  item.data = gdata[this.beforeFindItemIndex];
                  item.index = this.beforeFindItemIndex;
                }
              } else {
                const closeXp = Math.min(leftXp, midXp, rightXp);

                if (closeXp === leftXp) {
                  item.data = gdata[m - 1];
                  item.index = m - 1;
                } else if (closeXp === rightXp) {
                  item.data = gdata[m + 1];
                  item.index = m + 1;
                } else {
                  item.data = gdata[m];
                  item.index = m;
                }
              }
            } else {
              item.data = gdata[m];
              item.index = m;
            }

            if ((y - 6 <= yp) && (yp <= y + 6)) {
              item.hit = true;
            }

            break;
          } else if (x + xpInterval > xp) {
            e = m - 1;
          } else {
            s = m + 1;
          }
        }
      }
    }

    if (!useSelectLabelOrItem) {
      this.beforeMouseXp = xp;
      this.beforeMouseYp = yp;

      if (typeof item.index === 'number') {
        this.beforeFindItemIndex = item.index;
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
