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
      this.color = COLOR[sIdx % COLOR.length];
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
      totalCount = maxIndex - minIndex + 1;
    }

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    const xAxisPosition = chartRect.x1 + labelOffset.left;
    const yAxisPosition = chartRect.y2 - labelOffset.bottom;
    const xZeroPosition = Canvas.calculateX(0, minmaxX.graphMin, minmaxX.graphMax, xArea);
    const yZeroPosition = Canvas.calculateY(0, minmaxY.graphMin, minmaxY.graphMax, yArea);

    const xsp = isHorizontal ? xAxisPosition + xZeroPosition : xAxisPosition;
    const ysp = isHorizontal ? yAxisPosition : yAxisPosition + yZeroPosition;

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

    bArea = cArea > cPad * 2 ? cArea - cPad * 2 : cArea;
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

    this.visibleStartIndex = startIndex;

    for (let i = startIndex; i <= endIndex; i++) {
      const screenIndex = i - startIndex;
      const item = this.data[i];
      if (item) {
        const categoryPoint = isHorizontal
          ? ysp - cArea * screenIndex - cPad
          : xsp + cArea * screenIndex + cPad;

        // 기본 위치 설정
        if (isHorizontal) {
          x = xsp;
          y = Math.round(categoryPoint - (bArea * barSeriesX - (h + bPad)));
        } else {
          x = Math.round(categoryPoint + (bArea * barSeriesX - (w + bPad)));
          y = ysp;
        }

        // 너비 / 높이 계산, 스택의 경우 위치 값 재계산
        if (isHorizontal) {
          const barValue = item.b ? item.o : item.x;
          const _barValue = Math.min(
            Math.max(barValue, minmaxX.graphMin),
            minmaxX.graphMax
          );
          w = Canvas.calculateX(
            _barValue,
            minmaxX.graphMin,
            minmaxX.graphMax,
            xArea,
            -xZeroPosition,
          );

          if (item.b) {
            const _baseValue = Math.min(
              Math.max(item.b, minmaxX.graphMin),
              minmaxX.graphMax
            );

            x = Canvas.calculateX(
              _baseValue,
              minmaxX.graphMin,
              minmaxX.graphMax,
              xArea,
              xsp - xZeroPosition,
            );
          }

          const minimumBarWidth = barValue > 0 ? -1 : 1;
          w = barValue && Math.abs(w) === 0 ? minimumBarWidth : w;
        } else {
          const barValue = item.b ? item.o : item.y;
          const _barValue = Math.min(
            Math.max(barValue, minmaxY.graphMin),
            minmaxY.graphMax
          );
          h = Canvas.calculateY(
            _barValue,
            minmaxY.graphMin,
            minmaxY.graphMax,
            yArea,
            -yZeroPosition,
          );

          if (item.b) {
            const _baseValue = Math.min(
              Math.max(item.b, minmaxY.graphMin),
              minmaxY.graphMax
            );
            y = Canvas.calculateY(
              _baseValue,
              minmaxY.graphMin,
              minmaxY.graphMax,
              yArea,
              ysp - yZeroPosition,
            );
          }

          const minimumBarHeight = barValue > 0 ? -1 : 1;
          h = barValue && Math.abs(h) === 0 ? minimumBarHeight : h;
        }

        const barColor = item.dataColor || this.color;
        const legendHitInfo = param?.legendHitInfo;
        const selectLabelOption = param?.selectLabel?.option;
        const selectItemOption = param?.selectItem?.option;
        const selectedLabelList = param?.selectLabel?.selected?.dataIndex ?? [];
        const { dataIndex: selectedItemDataIndex, seriesID: selectedItemSeriesId } =
          param?.selectItem?.selected ?? {};

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
            param.unSelectedOpacity,
          );
        } else {
          const noneDownplayOpacity = barColor.includes('rgba') ? Util.getOpacity(barColor) : 1;
          const opacity = isDownplay ? param.unSelectedOpacity : noneDownplayOpacity;

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
        item.index = i;
      }
    }
  }

  /**
   * Draw item highlight
   * @param {object}  item       object for drawing series data
   * @param {CanvasRenderingContext2D}  context    canvas context
   * @param {number}  index      label index
   * @param {number}  unSelectedOpacity - opacity when not selected (0-1)
   *
   * @returns {undefined}
   */
  itemHighlight(item, context, index, unSelectedOpacity) {
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
      const grd = Canvas.createGradient(
        ctx,
        this.isHorizontal,
        { x, y, w, h },
        color,
        false,
        unSelectedOpacity,
      );
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
      const barData = this.data;
      const item = { data: null, hit: false, color: this.color };

      // dataIndex를 현재 화면에 보이는 범위로 clamp하여 stale xp/yp 참조 방지
      const visStart = this.visibleStartIndex ?? 0;
      const visEnd = visStart + (this.filteredCount ?? barData.length) - 1;
      const clampedIndex = Math.max(visStart, Math.min(dataIndex, visEnd));

      if (barData[clampedIndex]) {
        item.data = barData[clampedIndex];
        item.index = clampedIndex;
        item.hit = this.isPointInBar(offset, barData[clampedIndex]);
        // bar 박스 내부 클릭은 "직접 박스 히트"로 표시.
        // findHitItem에서 line 포인트 근접 히트보다 우선 선택되도록 하기 위함.
        item.directHit = item.hit;
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
    const startIdx = this.visibleStartIndex ?? 0;
    const totalCount = this.filteredCount ?? gdata.length;

    let s = startIdx;
    let e = Math.min(startIdx + totalCount - 1, gdata.length - 1);

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const barData = gdata[m];
      if (!barData) {
        break;
      }
      const { xp: sx, yp: sy, w, h } = barData;
      const ex = sx + w;
      const ey = sy + h;

      const inRange = isHorizontal ? ey <= yp && yp <= sy : sx <= xp && xp <= ex;

      if (inRange) {
        item.data = barData;
        item.index = barData.index;
        item.hit = this.isPointInBar(offset, barData);
        item.directHit = item.hit;
        return item;
      }

      const shouldGoRight = isHorizontal ? !(ey < yp) : sx + 4 < xp;

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
    const { x: barX, y: barY, w: barWidth, h: barHeight } = positions;
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

    const isNegativeValue = value < 0;
    const textWidth = Math.round(ctx.measureText(formattedTxt).width);
    const textHeight = fontSize; // fontSize와 textHeight는 같을 수 없지만, 정확히 구할 필요 없음

    const GAP = 10;
    const minXPos = isNegativeValue ? barX - GAP : barX + GAP;
    const minYPos = isNegativeValue ? barY + GAP : barY - GAP;

    const centerXOnBar = barX + barWidth / 2;
    const centerYOnBar = isHighlight ? barY + barHeight / 2 : barY - barHeight / 2;

    const drawableBarWidth = Math.abs(barWidth) - GAP;
    const drawableBarHeight = Math.abs(barHeight) - GAP;

    switch (align) {
      case 'start': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          const xPos = isNegativeValue ? minXPos - textWidth : minXPos;
          ctx.fillText(formattedTxt, xPos, centerYOnBar);
        } else if (!isHorizontal && textHeight < drawableBarHeight) {
          const yPos = isNegativeValue ? barY + GAP : barY - GAP;
          ctx.fillText(formattedTxt, centerXOnBar, yPos);
        }

        break;
      }

      case 'center': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          ctx.fillText(formattedTxt, centerXOnBar, centerYOnBar);
        } else if (!isHorizontal && textHeight < drawableBarHeight) {
          ctx.fillText(formattedTxt, centerXOnBar, barY + barHeight / 2);
        }

        break;
      }

      case 'out': {
        if (isStacked) {
          console.warn(
            "[EVUI][Bar Chart] In case of Stack Bar Chart, 'out' of 'showValue''s align is not supported.",
          );
          return;
        }

        if (isHorizontal) {
          const minXOnChart = this.chartRect.x1 + this.labelOffset.left;
          const maxXOnChart = this.chartRect.x2 - this.labelOffset.right;

          if (isNegativeValue) {
            const xPos = barX - GAP + barWidth - textWidth;
            if (xPos > minXOnChart) {
              ctx.fillText(formattedTxt, xPos, centerYOnBar);
            }
          } else {
            const xPos = barX + GAP + barWidth;
            if (xPos + textWidth < maxXOnChart) {
              ctx.fillText(formattedTxt, xPos, centerYOnBar);
            }
          }
        } else {
          const yPos = isNegativeValue ? barY + barHeight + GAP : barY + barHeight - GAP;
          ctx.fillText(formattedTxt, centerXOnBar, yPos);
        }

        break;
      }

      default:
      case 'end': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          const xPos = isNegativeValue ? barX + barWidth + GAP : barX + barWidth - textWidth - GAP;
          ctx.fillText(formattedTxt, xPos, centerYOnBar);
        } else if (!isHorizontal) {
          if (isNegativeValue) {
            const yPos = barY + barHeight - GAP;
            if (yPos > minYPos) {
              ctx.fillText(formattedTxt, centerXOnBar, yPos);
            }
          } else if (textHeight < drawableBarHeight) {
            const yPos = barY + barHeight + GAP;
            ctx.fillText(formattedTxt, centerXOnBar, yPos);
          }
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

    return sx <= xp && xp <= ex && ey <= yp && yp <= sy;
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
    if (Math.abs(w) < r * 2) {
      r = Math.abs(w) / 2;
    }

    if (Math.abs(h) < r * 2) {
      r = Math.abs(h) / 2;
    }

    if (isHorizontal) {
      const isNegativeValue = w < 0;
      if (isNegativeValue) {
        w += r;
        ctx.lineTo(x + w, y);
        ctx.arcTo(x + w - r, y, x + w - r, y - r, r);
        ctx.arcTo(x + w - r, y - h, x + w, y - h, r);
        ctx.lineTo(x, y - h);
        ctx.lineTo(x, y);
      } else {
        w -= r;
        ctx.lineTo(x + w, y);
        ctx.arcTo(x + w + r, y, x + w + r, y - r, r);
        ctx.arcTo(x + w + r, y - h, x + w, y - h, r);
        ctx.lineTo(x, y - h);
        ctx.lineTo(x, y);
      }
    } else {
      const isNegativeValue = h > 0;
      if (isNegativeValue) {
        h -= r;
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.arcTo(x + w, y + h + r, x - w + r, y + h + r, r);
        ctx.arcTo(x, y + h + r, x, y + h, r);
        ctx.lineTo(x, y);
      } else {
        h += r;
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.arcTo(x + w, y + h - r, x + w - r, y + h - r, r);
        ctx.arcTo(x, y + h - r, x, y + h, r);
        ctx.lineTo(x, y);
      }
    }

    ctx.fill();
    ctx.closePath();
  }
}

export default Bar;
