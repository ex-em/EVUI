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
    let minIndex;
    let maxIndex;
    if (isHorizontal) {
      [minIndex, maxIndex] = [minmaxY.minIndex, minmaxY.maxIndex];
    } else {
      [minIndex, maxIndex] = [minmaxX.minIndex, minmaxX.maxIndex];
    }

    // minIndex, maxIndex가 유효하면 실제 그릴 데이터 개수로 보정
    if (truthyNumber(minIndex) && truthyNumber(maxIndex)) {
      totalCount = (maxIndex - minIndex) + 1;
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

    bArea = cArea > (cPad * 2) ? (cArea - (cPad * 2)) : cArea;
    bArea = this.isExistGrp ? bArea : bArea / showSeriesCount;

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
        let categoryPoint;
        if (isHorizontal) {
          categoryPoint = ysp - (cArea * (screenIndex)) - cPad;
        } else {
          categoryPoint = xsp + (cArea * (screenIndex)) + cPad;
        }

        // 기본 위치 설정
        if (isHorizontal) {
          x = xsp;
          y = Math.round(categoryPoint - ((bArea * barSeriesX) - (h + bPad)));
        } else {
          x = Math.round(categoryPoint + ((bArea * barSeriesX) - (w + bPad)));
          y = ysp;
        }

        // 너비 / 높이 계산, 스택의 경우 위치 값 재계산
        if (isHorizontal) {
          const barValue = item.b ? item.o : item.x;

          w = Canvas.calculateX(
            barValue, minmaxX.graphMin, minmaxX.graphMax, xArea, -xZeroPosition,
          );

          if (item.b) {
            x = Canvas.calculateX(
              item.b, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp - xZeroPosition,
            );
          }

          const minimumBarWidth = barValue > 0 ? -1 : 1;
          w = barValue && Math.abs(w) === 0 ? minimumBarWidth : w;
        } else {
          const barValue = item.b ? item.o : item.y;

          h = Canvas.calculateY(
            barValue, minmaxY.graphMin, minmaxY.graphMax, yArea, -yZeroPosition,
          );

          if (item.b) {
            y = Canvas.calculateY(
              item.b, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp - yZeroPosition,
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
   *
   * @returns {object} graph item
   */
  findGraphData(offset, isHorizontal) {
    return isHorizontal ? this.findGraphRangeCount(offset) : this.findGraphRange(offset);
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphRange(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    const totalCount = this.filteredCount ?? gdata.length;

    let s = 0;
    let e = totalCount - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const sx = gdata[m].xp;
      const sy = gdata[m].yp;
      const ex = sx + gdata[m].w;
      const ey = sy + gdata[m].h;

      if ((sx <= xp) && (xp <= ex)) {
        item.data = gdata[m];
        item.index = gdata[m].index; // 원본 데이터 인덱스 사용

        if ((ey <= yp) && (yp <= sy)) {
          item.hit = true;
        }
        return item;
      } else if (sx + 4 < xp) {
        s = m + 1;
      } else {
        e = m - 1;
      }
    }

    return item;
  }

  /**
   * Find graph item (horizontal)
   * @param {array}    offset          mouse position
   *
   * @returns {object} graph item
   */
  findGraphRangeCount(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data;

    const totalCount = this.filteredCount ?? gdata.length;

    let s = 0;
    let e = totalCount - 1;

    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const sx = gdata[m].xp;
      const sy = gdata[m].yp;
      const ex = sx + gdata[m].w;
      const ey = sy + gdata[m].h;

      if ((ey <= yp) && (yp <= sy)) {
        item.data = gdata[m];
        item.index = gdata[m].index; // 원본 데이터 인덱스 사용

        if ((sx <= xp) && (xp <= ex)) {
          item.hit = true;
        }
        return item;
      } else if (ey < yp) {
        e = m - 1;
      } else {
        s = m + 1;
      }
    }

    return item;
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

    const centerXOnBar = barX + (barWidth / 2);
    const centerYOnBar = isHighlight ? barY + (barHeight / 2) : barY - (barHeight / 2);

    const drawableBarWidth = Math.abs(barWidth) - GAP;
    const drawableBarHeight = Math.abs(barHeight) - GAP;

    switch (align) {
      case 'start': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          const xPos = isNegativeValue ? minXPos - textWidth : minXPos;
          ctx.fillText(formattedTxt, xPos, centerYOnBar);
        } else if (!isHorizontal && textHeight < drawableBarHeight) {
          const yPos = isNegativeValue
            ? barY + GAP
            : barY - GAP;
          ctx.fillText(formattedTxt, centerXOnBar, yPos);
        }

        break;
      }

      case 'center': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          ctx.fillText(formattedTxt, centerXOnBar, centerYOnBar);
        } else if (!isHorizontal && textHeight < drawableBarHeight) {
          ctx.fillText(formattedTxt, centerXOnBar, barY + (barHeight / 2));
        }

        break;
      }

      case 'out': {
        if (isStacked) {
          console.warn('[EVUI][Bar Chart] In case of Stack Bar Chart, \'out\' of \'showValue\'\'s align is not supported.');
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
          const yPos = isNegativeValue
            ? barY + barHeight + GAP
            : barY + barHeight - GAP;
          ctx.fillText(formattedTxt, centerXOnBar, yPos);
        }

        break;
      }

      default:
      case 'end': {
        if (isHorizontal && textWidth < drawableBarWidth) {
          const xPos = isNegativeValue
            ? barX + barWidth + GAP
            : barX + barWidth - textWidth - GAP;
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

  drawBar({ ctx, positions }) {
    const isHorizontal = this.isHorizontal;
    const isStackBar = 'stackIndex' in this;
    const isBorderRadius = this.borderRadius && this.borderRadius > 0;
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

  drawRoundedRect(ctx, positions) {
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const isHorizontal = this.isHorizontal;
    const { x, y } = positions;
    let { w, h } = positions;
    let r = this.borderRadius;

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
