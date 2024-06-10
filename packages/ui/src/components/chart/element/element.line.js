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
    this.usePassingValue = !!this.passingValue;
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
      ctx,
      chartRect,
      labelOffset,
      axesSteps,
      selectLabel,
      selectSeries,
      legendHitInfo,
      isBrush,
    } = param;

    // about selectLabel
    const selectLabelOption = selectLabel?.option;
    const useSelectLabel =
      selectLabelOption?.use && selectLabelOption?.useSeriesOpacity;
    const selectedLabelIndexList = selectLabel?.selected?.dataIndex ?? [];

    // set Style
    let extent;
    if (legendHitInfo) {
      extent =
        this.extent[legendHitInfo?.sId === this.sId ? 'highlight' : 'downplay'];
    } else if (
      selectSeries?.option?.use &&
      selectSeries?.selected?.seriesId?.length
    ) {
      const isSelectedSeries = selectSeries?.selected?.seriesId?.includes(
        this.sId
      );
      extent = this.extent[isSelectedSeries ? 'highlight' : 'downplay'];
    } else if (useSelectLabel && selectedLabelIndexList.length) {
      extent = this.extent.downplay;
    } else {
      extent = this.extent.normal;
    }

    const getOpacity = (colorStr) =>
      colorStr.includes('rgba') ? Util.getOpacity(colorStr) : extent.opacity;
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

    const endPoint = chartRect.y2 - labelOffset.bottom;

    let x;
    let y;
    let barAreaByCombo = 0;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea =
      chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    if (this.combo) {
      barAreaByCombo = xArea / (this.data.length || 1);
      xArea -= barAreaByCombo;
      this.size.comboOffset = barAreaByCombo;
    }

    const xsp = chartRect.x1 + labelOffset.left + barAreaByCombo / 2;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const getXPos = (val) =>
      Canvas.calculateX(val, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    const getYPos = (val) =>
      Canvas.calculateY(val, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

    // draw line
    let needCutoff = false;
    this.data.reduce((prev, curr) => {
      x = getXPos(curr.x);
      y = getYPos(curr.y);

      if (x !== null) {
        x += Util.aliasPixel(x);
      }

      if (this.usePassingValue) {
        if (curr.o === this.passingValue) {
          y = getYPos(prev.y);

          if (prev.o === null) {
            needCutoff = true;
          }

          if (this.isExistGrp && !needCutoff) {
            y = getYPos(curr.b ?? 0);
            ctx.lineTo(x, y);
          }

          curr.xp = x;
          curr.yp = y;

          return curr;
        }
      }

      const isNullValue =
        Util.isNullOrUndefined(prev.o) ||
        Util.isNullOrUndefined(curr.o) ||
        Util.isNullOrUndefined(curr.x) ||
        Util.isNullOrUndefined(curr.y);
      if (isNullValue || needCutoff) {
        ctx.moveTo(x, y);
        needCutoff = false;
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
        const gradient = ctx.createLinearGradient(
          0,
          chartRect.y2,
          0,
          maxValueYPos
        );
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(0.5, fillColor);
        gradient.addColorStop(1, extent.opacity < 1 ? fillColor : mainColor);

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = fillColor;
      }

      // Set dataIndex List for filling
      // ex) [10, passing, null, 10, 10, passing, 10] -> [[0, 1], [3, 6]]
      let start = null;
      let end = null;
      const valueArray = this.data.map((item) => item?.o);
      const needFillDataIndexList = [];
      for (let i = 0; i < valueArray.length + 1; i++) {
        if (Util.isNullOrUndefined(valueArray[i])) {
          if (start !== null && end !== null) {
            const temp = valueArray.slice(start, i);
            const lastNormalValueIndex = temp.findLastIndex(
              (item) =>
                item !== Util.isNullOrUndefined(item) &&
                item !== this.passingValue
            );
            needFillDataIndexList.push([start, start + lastNormalValueIndex]);
            start = null;
            end = null;
          }
        } else if (valueArray[i] === this.passingValue) {
          end = i;
        } else {
          start = start === null ? i : start;
          end = i;
        }
      }

      // Draw rect for filling
      needFillDataIndexList.forEach(([startIndex, endIndex]) => {
        if (startIndex === endIndex) {
          const singleData = this.data[startIndex];
          ctx.moveTo(singleData.xp - lineWidth, singleData.yp);
          ctx.lineTo(singleData.xp + lineWidth, singleData.yp);
          ctx.lineTo(
            singleData.xp + lineWidth,
            getYPos(singleData.b) ?? endPoint
          );
          ctx.closePath();
          return;
        }

        for (let ix = startIndex; ix <= endIndex; ix++) {
          const currData = this.data[ix];

          if (ix === startIndex) {
            ctx.moveTo(currData.xp, currData.yp);
          } else if (this.isExistGrp || this.passingValue !== currData.o) {
            ctx.lineTo(currData.xp, currData.yp);
          }

          if (ix === endIndex) {
            for (let jx = endIndex; jx >= startIndex; jx--) {
              const nextData = this.data[jx];
              const xp = getXPos(nextData.x);
              const bp = getYPos(nextData.b) ?? endPoint;
              ctx.lineTo(xp, bp);
            }

            ctx.closePath();
          }
        }
      });

      ctx.fill();
    }

    // Draw points
    if (!isBrush) {
      ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
      const focusStyle = Util.colorStringToRgba(pointFillColor, 1);
      const blurStyle = Util.colorStringToRgba(
        pointFillColor,
        pointFillColorOpacity
      );

      this.data.forEach((curr, ix) => {
        if (
          curr.xp === null ||
          curr.yp === null ||
          curr.o === this.passingValue
        ) {
          return;
        }

        const isSingle =
          Util.isNullOrUndefined(this.data[ix - 1]?.o) &&
          Util.isNullOrUndefined(this.data[ix + 1]?.o);
        const isSelectedLabel = selectedLabelIndexList.includes(ix);
        if (this.point || isSingle || isSelectedLabel) {
          ctx.fillStyle =
            isSelectedLabel && !legendHitInfo ? focusStyle : blurStyle;
          Canvas.drawPoint(
            ctx,
            this.pointStyle,
            this.pointSize,
            curr.xp,
            curr.yp
          );
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

    const { xp, yp, o } = gdata;

    ctx.save();
    if (xp !== null && yp !== null && o !== this.passingValue) {
      ctx.strokeStyle = Util.colorStringToRgba(this.color, 0);
      ctx.fillStyle = Util.colorStringToRgba(
        this.color,
        this.highlight.maxShadowOpacity
      );
      Canvas.drawPoint(
        ctx,
        this.pointStyle,
        this.highlight.maxShadowSize,
        xp,
        yp
      );

      ctx.fillStyle = this.color;
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, xp, yp);

      ctx.fillStyle = '#fff';
      Canvas.drawPoint(
        ctx,
        this.pointStyle,
        this.highlight.defaultSize,
        xp,
        yp
      );
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
    const gdata = this.data.filter((data) => !Util.isNullOrUndefined(data.x));
    const SPARE_XP = 0.5;

    if (gdata?.length) {
      if (typeof dataIndex === 'number' && this.show) {
        item.data = gdata[dataIndex];
        item.index = dataIndex;
      } else if (
        typeof this.beforeFindItemIndex === 'number' &&
        this.show &&
        useSelectLabelOrItem
      ) {
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
                Math.abs(this.beforeMouseXp - xp) >= curXpInterval - SPARE_XP &&
                (this.beforeFindItemIndex === m ||
                  midXp === rightXp ||
                  midXp === leftXp)
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

            if (y - 6 <= yp && yp <= y + 6) {
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

    if (this.usePassingValue && item?.data?.o === this.passingValue) {
      item.data = null;
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
    const gdata = this.data.filter((data) => !Util.isNullOrUndefined(data.x));

    let s = 0;
    let e = gdata.length - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const x = gdata[m].xp;
      const y = gdata[m].yp;

      if (x - 2 <= xp && xp <= x + 2) {
        item.data = gdata[m];
        item.index = m;

        if (y - 2 <= yp && yp <= y + 2) {
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

    return this.data.filter(
      (seriesData) => xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
    );
  }
}

export default Line;
