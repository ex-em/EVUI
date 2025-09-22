import { defaultsDeep } from 'lodash-es';
import { truthy, truthyNumber } from '@/common/utils';
import { COLOR, BAR_OPTION } from '../helpers/helpers.constant';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';

class Bar {
  constructor(sId, opt, sIdx, isHorizontal) {
    const merged = defaultsDeep({}, opt, BAR_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    if (this.color === undefined) {
      this.color = COLOR[sIdx];
    }

    this.type = 'bar';
    this.sId = sId;
    this.data = [];
    this.isHorizontal = isHorizontal;
    this.size = {
      cat: 0,
      bar: 0,
      cPad: 0,
      bPad: 0,
      w: 0,
      h: 0,
      ix: 0,
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

    const { isHorizontal, showValue } = this;
    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const thickness = param.thickness;
    const showSeriesCount = param.showSeriesCount;

    let x;
    let y;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let totalCount = this.data.length;
    const [minIndex, maxIndex] = isHorizontal
      ? [minmaxY.minIndex, minmaxY.maxIndex]
      : [minmaxX.minIndex, minmaxX.maxIndex];

    // minIndex, maxIndex가 유효하면 실제 그릴 데이터 개수로 보정
    if (truthyNumber(minIndex) && truthyNumber(maxIndex)) {
      totalCount = (maxIndex - minIndex) + 1;
    }

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xsp = chartRect.x1 + labelOffset.left;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const dArea = isHorizontal ? yArea : xArea;
    const cArea = dArea / (totalCount || 1);

    let cPad;
    const isUnableToDrawCategoryPadding = param.cPadRatio >= 1 || param.cPadRatio <= 0;
    if (isUnableToDrawCategoryPadding) {
      cPad = 2;
    } else {
      cPad = Math.max((dArea * (param.cPadRatio / 2)) / totalCount, 2);
    }

    let bArea;
    let w;
    let h;

    bArea = cArea > (cPad * 2) ? (cArea - (cPad * 2)) : cArea;
    bArea = this.isExistGrp ? bArea : bArea / showSeriesCount;

    const size = this.calculateBarSize(thickness, bArea);
    w = isHorizontal ? null : size;
    h = isHorizontal ? size : null;

    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    const barSeriesX = this.isExistGrp ? 1 : showIndex + 1;

    this.size.cat = cArea;
    this.size.bar = bArea;
    this.size.cPad = cPad;
    this.size.bPad = bPad;
    this.size.w = w;
    this.size.h = h;
    this.size.ix = barSeriesX;
    this.chartRect = chartRect;
    this.labelOffset = labelOffset;
    this.borderRadius = param.borderRadius;
    this.filteredCount = totalCount;

    const startIndex = truthyNumber(minIndex) ? minIndex : 0;
    const endIndex = truthyNumber(maxIndex) ? maxIndex : this.data.length - 1;

    // 스크롤 범위 내에서만 루프 돌림
    for (let i = startIndex; i <= endIndex; i++) {
      const screenIndex = i - startIndex; // 현재 화면상의 위치 인덱스
      const item = this.data[i]; // 실제 데이터 인덱스에 해당하는 항목
      if (item) {
        // 스크롤 offset(minIndex)만큼 보정해서 그리기

        const categoryPoint = isHorizontal
          ? ysp - (cArea * screenIndex) - cPad
          : xsp + (cArea * screenIndex) + cPad;

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

        const barColor = item.dataColor || this.color;

        const legendHitInfo = param?.legendHitInfo;
        const selectLabelOption = param?.selectLabel?.option;
        const selectItemOption = param?.selectItem?.option;
        const selectedLabelList = param?.selectLabel?.selected?.dataIndex ?? [];
        const {
          dataIndex: selectedItemDataIndex,
          seriesID: selectedItemSeriesId,
        } = param?.selectItem?.selected ?? {};

        let isDownplay = false;

        if (legendHitInfo) {
          isDownplay = legendHitInfo?.sId !== this.sId;
        } else if (selectLabelOption?.use && selectLabelOption?.useSeriesOpacity) {
          isDownplay = selectedLabelList.length && !selectedLabelList.includes(i);
        } else if (truthy(selectedItemDataIndex) && selectItemOption?.useSeriesOpacity) {
          if (this.isExistGrp) {
            isDownplay = selectedItemDataIndex !== i;
          } else {
            isDownplay = selectedItemDataIndex !== i || selectedItemSeriesId !== this.sId;
          }
        }

        if (typeof barColor !== 'string') {
          ctx.fillStyle = Canvas.createGradient(
            ctx,
            isHorizontal,
            { x, y, w, h },
            barColor,
            isDownplay,
          );
        } else {
          const noneDownplayOpacity = barColor.includes('rgba') ? Util.getOpacity(barColor) : 1;
          const opacity = isDownplay ? 0.1 : noneDownplayOpacity;

          ctx.fillStyle = Util.colorStringToRgba(barColor, opacity);
        }

        this.drawBar({
          ctx,
          positions: { x, y, w, h },
        });

        if (showValue.use) {
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
            textColor: item.dataTextColor,
            index: i,
          });
        }

        // 좌표 및 인덱스 정보 세팅 (툴팁/hover용)
        item.xp = x; // eslint-disable-line
        item.yp = y; // eslint-disable-line
        item.w = w; // eslint-disable-line
        item.h = isHorizontal ? -h : h; // eslint-disable-line
        item.index = i; // 실제 데이터 인덱스 (스크롤 offset 포함)

        // 검색(hitInfo) 로직은 this.data[0..filteredCount-1] 범위만 검사하므로,
        // 현재 화면에 그린 항목을 배열 앞쪽으로 매핑해준다.
        this.data[screenIndex] = item;
      }
    }
  }

  /**
   * Draw item highlight
   * @param {object}  item       object for drawing series data
   * @param {CanvasRenderingContext2D}  context    canvas context
   * @param {number}  index      label index
   *
   * @returns {undefined}
   */
  itemHighlight(item, context, index) {
    const showValue = this.showValue;

    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;
    const w = gdata.w;
    const h = gdata.h;

    ctx.save();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

    const color = item.data.dataColor || this.color;
    if (typeof color !== 'string') {
      const grd = Canvas.createGradient(ctx, this.isHorizontal, { x, y, w, h }, color);
      ctx.fillStyle = grd;
      ctx.shadowColor = color[color.length - 1][1];
    } else {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
    }

    ctx.beginPath();

    this.drawBar({
      ctx,
      positions: { x, y, w, h: this.isHorizontal ? -h : h },
    });

    if (showValue.use) {
      this.drawValueLabels({
        context: ctx,
        data: gdata,
        positions: {
          x,
          y,
          h,
          w,
        },
        isHighlight: true,
        textColor: item.data.dataTextColor || item.dataTextColor,
        index,
      });
    }

    ctx.restore();
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   * @param {boolean}  isHorizontal    determines if a horizontal option's value
   * @param {number}   dataIndex       selected label data index
   * @param {boolean}  useIndicatorOnLabel
   *
   * @returns {object} graph item
   */
  findGraphData(offset, isHorizontal, dataIndex, useIndicatorOnLabel) {
    if (typeof dataIndex === 'number' && this.show && useIndicatorOnLabel) {
      const gdata = this.data;
      const item = { data: null, hit: false, color: this.color };

      if (gdata[dataIndex]) {
        item.data = gdata[dataIndex];
        item.index = dataIndex;
        item.hit = this.isPointInBar(offset, gdata[dataIndex]);
      }

      return item;
    }

    return isHorizontal ? this.findGraphRangeCount(offset) : this.findGraphRange(offset);
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  /**
   * Binary search for finding graph item
   * @private
   * @param {array} offset - mouse position
   * @param {boolean} isHorizontal - search orientation
   * @returns {object} graph item
   */
  binarySearchBar(offset, isHorizontal) {
    const [xp, yp] = offset;
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;
    const totalCount = this.filteredCount ?? gdata.length;

    let s = 0;
    let e = totalCount - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const barData = gdata[m];
      const { xp: sx, yp: sy, w, h } = barData;
      const ex = sx + w;
      const ey = sy + h;

      const inRange = isHorizontal
        ? ((ey <= yp) && (yp <= sy))
        : ((sx <= xp) && (xp <= ex));

      if (inRange) {
        item.data = barData;
        item.index = barData.index;
        item.hit = this.isPointInBar(offset, barData);
        return item;
      }

      const shouldGoRight = isHorizontal
        ? (!(ey < yp))
        : (sx + 4 < xp);

      if (shouldGoRight) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }

  findGraphRange(offset) {
    return this.binarySearchBar(offset, false);
  }

  /**
   * Find graph item (horizontal)
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphRangeCount(offset) {
    return this.binarySearchBar(offset, true);
  }

  /**
   * Draw value label if series 'use' of showValue option is true
   *
   * @param context           canvas context
   * @param data              series value data (model.store.js addData return value)
   * @param positions         series value positions
   * @param isHighlight       draw label with highlight effect
   * @param textColor         data text color
   * @param index             label index
   */
  drawValueLabels({ context, data, positions, isHighlight, textColor, index }) {
    const isHorizontal = this.isHorizontal;
    const { fontSize, textColor: seriesTextColor, align, formatter, decimalPoint } = this.showValue;
    const { x, y, w, h } = positions;
    const ctx = context;

    ctx.save();
    ctx.beginPath();

    ctx.font = `normal normal normal ${fontSize}px Roboto`;
    ctx.fillStyle = textColor || seriesTextColor;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = isHorizontal && align !== 'center' ? 'left' : 'center';

    let value;
    const isStacked = truthy(this.stackIndex);
    if (isStacked) {
      value = data.o;
    } else {
      value = (isHorizontal ? data.x : data.y) ?? '';
    }

    let formattedTxt;
    if (formatter) {
      formattedTxt = formatter(value, {
        label: isHorizontal ? data.y : data.x,
        index,
      });
    }

    if (!formatter || typeof formattedTxt !== 'string') {
      formattedTxt = Util.labelSignFormat(value, decimalPoint) ?? '';
    }

    const textWidth = Math.round(ctx.measureText(formattedTxt).width);
    const textHeight = fontSize + 4;
    const minXPos = x + 10;
    const minYPos = y - 10;
    const widthFreeSpaceToDraw = w - 10;
    const heightFreeSpaceToDraw = Math.abs(h + 10);
    const centerX = x + (w / 2) <= minXPos ? minXPos : x + (w / 2);
    const centerY = y + (h / 2) >= minYPos ? minYPos : y + (h / 2);
    const centerYHorizontal = isHighlight ? y + (h / 2) : y - (h / 2);

    switch (align) {
      case 'start': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            ctx.fillText(formattedTxt, minXPos, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          ctx.fillText(formattedTxt, centerX, minYPos);
        }

        break;
      }

      case 'center': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            ctx.fillText(formattedTxt, centerX, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          ctx.fillText(formattedTxt, centerX, centerY);
        }

        break;
      }

      case 'out': {
        if (isStacked) {
          console.warn('[EVUI][Bar Chart] In case of Stack Bar Chart, \'out\' of \'showValue\'\'s align is not supported.');
          return;
        }

        if (isHorizontal) {
          ctx.fillText(formattedTxt, minXPos + w, centerYHorizontal);
        } else {
          ctx.fillText(formattedTxt, centerX, y + h - (textHeight / 2));
        }

        break;
      }

      default:
      case 'end': {
        if (isHorizontal) {
          if (textWidth < widthFreeSpaceToDraw) {
            const xPos = x + w - (textWidth * 2);
            ctx.fillText(formattedTxt, xPos <= minXPos ? minXPos : xPos, centerYHorizontal);
          }
        } else if (textHeight < heightFreeSpaceToDraw) {
          const yPos = y + h + textHeight;
          ctx.fillText(formattedTxt, centerX, yPos >= minYPos ? minYPos : yPos);
        }

        break;
      }
    }

    ctx.restore();
  }

  /**
   * Calculate bar size based on thickness
   * @private
   * @param {string|number} thickness - thickness value
   * @param {number} bArea - available bar area
   * @returns {number} calculated size
   */
  calculateBarSize(thickness, bArea) {
    if (typeof thickness === 'string' && /[0-9]+px/.test(thickness)) {
      return Math.min(bArea, Number(thickness.replace('px', '')));
    }
    if (typeof thickness === 'number' && thickness <= 1 && thickness >= 0) {
      return Math.ceil(bArea * thickness);
    }
    return bArea;
  }

  drawBar({ ctx, positions }) {
    const { isHorizontal, borderRadius } = this;
    const isStackBar = 'stackIndex' in this;
    const isBorderRadius = borderRadius && borderRadius > 0;
    const { x, y, w } = positions;
    const h = isHorizontal ? -positions.h : positions.h;

    // Dont's draw bar that has value 0
    if (w === 0 || h === 0) {
      return;
    }

    ctx.save();

    if (isBorderRadius && !isStackBar) {
      try {
        this.drawRoundedRect(ctx, positions);
      } catch (e) {
        ctx.fillRect(x, y, w, h);
      }
    } else {
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  }

  /**
   * Check if point is within bar boundaries
   * @param {array} offset - [x, y] mouse position
   * @param {object} barData - bar data object with xp, yp, w, h properties
   * @returns {boolean} true if point is within bar
   */
  isPointInBar(offset, barData) {
    const [xp, yp] = offset;
    const { xp: sx, yp: sy, w, h } = barData;
    const ex = sx + w;
    const ey = sy + h;

    return (sx <= xp) && (xp <= ex) && (ey <= yp) && (yp <= sy);
  }

  drawRoundedRect(ctx, positions) {
    const { chartRect, labelOffset, isHorizontal, borderRadius } = this;
    const { x, y } = positions;
    let { w, h } = positions;
    let r = borderRadius;

    const squarePath = new Path2D();
    squarePath.rect(
      chartRect.x1 + labelOffset.left,
      chartRect.y1,
      chartRect.chartWidth - labelOffset.right,
      chartRect.chartHeight - labelOffset.bottom,
    );

    ctx.clip(squarePath);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isHorizontal) {
      if (h < r * 2) {
        r = h / 2;
      }

      w -= r;
      ctx.lineTo(x + w, y);
      ctx.arcTo(x + w + r, y, x + w + r, y - r, r);
      ctx.arcTo(x + w + r, y - h, x + w, y - h, r);
      ctx.lineTo(x, y - h);
      ctx.lineTo(x, y);
    } else {
      if (w < r * 2) {
        r = w / 2;
      }

      h += r;
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.arcTo(x + w, y + h - r, x + w - r, y + h - r, r);
      ctx.arcTo(x, y + h - r, x, y + h, r);
      ctx.lineTo(x, y);
    }

    ctx.fill();
    ctx.closePath();
  }
}

export default Bar;
