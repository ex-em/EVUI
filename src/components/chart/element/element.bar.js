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
   * Compute pixel geometry (xp/yp/w/h) for each bar and store it on the main model.
   * 기하 계산만 수행한다(canvas 그리기 없음). hit-test가 item.xp/yp/w/h 및 size/visibleStartIndex/
   * filteredCount를 소비한다. 좌표 의미·stacked 누적·반올림·null 처리는 draw와 동일해야 한다.
   * @param {object} param     object for drawing series data
   * @returns {undefined}
   */
  computeGeometry(param) {
    if (!this.show) {
      return;
    }

    // (데이터 버전, 스케일 버전, showIndex, showSeriesCount) 가 직전과 같고 data 참조도 동일하면
    // xp/yp/w/h 는 이미 current → skip. bar 는 가시성 토글로 막대 폭/위치(showIndex/showSeriesCount
    // 의존)가 바뀌므로 둘을 비교에 포함한다. 버전 미전달이면 canMemo=false 로 항상 재계산(무회귀).
    // 숫자 필드 비교 — 시리즈가 수만 개일 때 문자열 키 생성이 매 프레임 할당이 되지 않도록.
    const canMemo = param.scaleVersion != null && param.dataEpoch != null;
    const showIndex0 = param.showIndex ?? 0;
    const showSeriesCount0 = param.showSeriesCount ?? 0;
    if (
      canMemo
      && this._lastDataEpoch === param.dataEpoch
      && this._lastScaleVersion === param.scaleVersion
      && this._lastShowIndex === showIndex0
      && this._lastShowSeriesCount === showSeriesCount0
      && this._lastGeomData === this.data
    ) {
      return;
    }

    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const thickness = param.thickness;
    const showSeriesCount = param.showSeriesCount;

    this.isHorizontal = param.isHorizontal;

    const { isHorizontal } = this;

    let x;
    let y;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let totalCount = this.data.length;
    const [minIndex, maxIndex] = isHorizontal
      ? [minmaxY.minIndex, minmaxY.maxIndex]
      : [minmaxX.minIndex, minmaxX.maxIndex];

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

        if (isHorizontal) {
          x = xsp;
          y = Math.round(categoryPoint - (bArea * barSeriesX - (h + bPad)));
        } else {
          x = Math.round(categoryPoint + (bArea * barSeriesX - (w + bPad)));
          y = ysp;
        }

        if (isHorizontal) {
          const barValue = item.b ? item.o : item.x;
          // displayOverflow 가 켜졌을 때만 graphMax 초과 값을 경계로 clamp, 꺼지면 raw → null(숨김).
          // draw(래스터) 와 동일한 좌표 의미를 유지해 hit-test 기하가 일치하도록 한다.
          const drawValue =
            param.displayOverflow && barValue > minmaxX.graphMax ? minmaxX.graphMax : barValue;
          w = Canvas.calculateX(
            drawValue,
            minmaxX.graphMin,
            minmaxX.graphMax,
            xArea,
            -xZeroPosition,
          );

          if (item.b) {
            // stack-base 위치는 raw 유지 (세그먼트 값만 clamp).
            x = Canvas.calculateX(
              item.b,
              minmaxX.graphMin,
              minmaxX.graphMax,
              xArea,
              xsp - xZeroPosition,
            );
          }

          const minimumBarWidth = barValue > 0 ? -1 : 1;
          // w === null 은 axis range 밖이라는 신호이므로 minimumBarWidth 보정에서 제외한다.
          w = barValue && w !== null && Math.abs(w) === 0 ? minimumBarWidth : w;
        } else {
          const barValue = item.b ? item.o : item.y;
          const drawValue =
            param.displayOverflow && barValue > minmaxY.graphMax ? minmaxY.graphMax : barValue;
          h = Canvas.calculateY(
            drawValue,
            minmaxY.graphMin,
            minmaxY.graphMax,
            yArea,
            -yZeroPosition,
          );

          if (item.b) {
            // stack-base 위치는 raw 유지 (세그먼트 값만 clamp).
            y = Canvas.calculateY(
              item.b,
              minmaxY.graphMin,
              minmaxY.graphMax,
              yArea,
              ysp - yZeroPosition,
            );
          }

          const minimumBarHeight = barValue > 0 ? -1 : 1;
          h = barValue && h !== null && Math.abs(h) === 0 ? minimumBarHeight : h;
        }

        // 좌표 및 인덱스 정보 세팅 (툴팁/hover용)
        item.xp = x; // eslint-disable-line
        item.yp = y; // eslint-disable-line
        item.w = w; // eslint-disable-line
        item.h = isHorizontal ? -h : h; // eslint-disable-line
        item.index = i;
      }
    }

    if (canMemo) {
      this._lastDataEpoch = param.dataEpoch;
      this._lastScaleVersion = param.scaleVersion;
      this._lastShowIndex = showIndex0;
      this._lastShowSeriesCount = showSeriesCount0;
      this._lastGeomData = this.data;
    }
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

    // 기하(xp/yp/w/h)는 기하 패스가 채운다. 아래 래스터 패스는 로컬 재계산으로 그리며 mutate하지 않는다.
    this.computeGeometry(param);

    const ctx = param.ctx;
    const chartRect = param.chartRect;
    const labelOffset = param.labelOffset;
    const axesSteps = param.axesSteps;
    const showIndex = param.showIndex;
    const thickness = param.thickness;
    const showSeriesCount = param.showSeriesCount;
    const displayOverflow = param.displayOverflow;

    this.isHorizontal = param.isHorizontal;

    const { isHorizontal, showValue } = this;

    let x;
    let y;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const [minIndex, maxIndex] = isHorizontal
      ? [minmaxY.minIndex, minmaxY.maxIndex]
      : [minmaxX.minIndex, minmaxX.maxIndex];

    // 가시 인덱스 윈도우를 한 곳에서 일관되게 해석한다(start/end/count 동시 산출).
    //   - min/maxIndex가 number가 아님(undefined): 윈도우 미지정 → 전체 데이터 범위.
    //   - 유효 윈도우(maxIndex >= minIndex): [minIndex, maxIndex] 범위만.
    //   - 빈 윈도우(sentinel { minIndex: 0, maxIndex: -1 }): start > end 이므로
    //     totalCount === 0 이고 아래 for 루프도 0회 → 아무것도 그리지 않는다.
    const hasWindow = truthyNumber(minIndex) && truthyNumber(maxIndex);
    const startIndex = hasWindow ? minIndex : 0;
    const endIndex = hasWindow ? maxIndex : this.data.length - 1;
    const totalCount = endIndex - startIndex + 1;

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
        // displayOverflow 가 켜졌을 때만 값 축(horizontal: X, vertical: Y) graphMax 초과 값을
        // 경계로 clamp 해 막대를 경계까지 그린다. 꺼져 있으면 raw → calculateX/Y 가 null 반환 → 숨김.
        if (isHorizontal) {
          const barValue = item.b ? item.o : item.x;
          const drawValue =
            displayOverflow && barValue > minmaxX.graphMax ? minmaxX.graphMax : barValue;
          w = Canvas.calculateX(
            drawValue,
            minmaxX.graphMin,
            minmaxX.graphMax,
            xArea,
            -xZeroPosition,
          );

          if (item.b) {
            // stack-base 위치는 raw 유지 (세그먼트 값만 clamp).
            x = Canvas.calculateX(
              item.b,
              minmaxX.graphMin,
              minmaxX.graphMax,
              xArea,
              xsp - xZeroPosition,
            );
          }

          const minimumBarWidth = barValue > 0 ? -1 : 1;
          // w === null 은 axis range 밖이라는 신호이므로 minimumBarWidth 보정에서 제외한다.
          w = barValue && w !== null && Math.abs(w) === 0 ? minimumBarWidth : w;
        } else {
          const barValue = item.b ? item.o : item.y;
          const drawValue =
            displayOverflow && barValue > minmaxY.graphMax ? minmaxY.graphMax : barValue;
          h = Canvas.calculateY(
            drawValue,
            minmaxY.graphMin,
            minmaxY.graphMax,
            yArea,
            -yZeroPosition,
          );

          if (item.b) {
            // stack-base 위치는 raw 유지 (세그먼트 값만 clamp).
            y = Canvas.calculateY(
              item.b,
              minmaxY.graphMin,
              minmaxY.graphMax,
              yArea,
              ysp - yZeroPosition,
            );
          }

          const minimumBarHeight = barValue > 0 ? -1 : 1;
          // h === null 은 axis range 밖이라는 신호이므로 minimumBarHeight 보정에서 제외한다.
          h = barValue && h !== null && Math.abs(h) === 0 ? minimumBarHeight : h;
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
        // 기하(xp/yp/w/h/index)는 computeGeometry가 채운다. 래스터 패스는 mutate하지 않는다.
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
        console.warn(`[EVUI][Bar] binarySearchBar: gdata[${m}] is falsy`);
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

    const LABEL_MARGIN = isHorizontal && align !== 'end' ? 10 : 4; // text 끝과 bar 경계 사이의 최소 여백
    const minXPos = isNegativeValue ? barX - LABEL_MARGIN : barX + LABEL_MARGIN;
    const minYPos = isNegativeValue ? barY + LABEL_MARGIN : barY - LABEL_MARGIN;

    const centerXOnBar = barX + barWidth / 2;
    const barCenterY = isHighlight ? barY + barHeight / 2 : barY - barHeight / 2;
    // 수평바: textBaseline='middle'은 em 박스 중앙 기준이므로 실제 글자의 시각적 중앙과
    // 차이가 발생함 (fontSize에 비례). 고정 비율로 보정
    const centerYOnBar = isHorizontal ? barCenterY + fontSize * 0.1 : barCenterY;

    const absBarWidth = Math.abs(barWidth);
    const absBarHeight = Math.abs(barHeight);
    // long dim(텍스트 배치 방향)에만 GAP 적용, thin dim(중앙 정렬 방향)은 GAP 불필요
    const drawableBarWidth = absBarWidth - LABEL_MARGIN;
    const drawableBarHeight = absBarHeight - LABEL_MARGIN;
    // 비수평 bar의 너비(thin dim)는 중앙 정렬이므로 경계값(==)도 허용
    const fitsInVerticalBar = textWidth <= absBarWidth && absBarWidth >= textHeight;

    switch (align) {
      case 'start': {
        if (isHorizontal) {
          if (textWidth < drawableBarWidth && textHeight < absBarHeight) {
            const xPos = isNegativeValue ? minXPos - textWidth : minXPos;
            ctx.fillText(formattedTxt, xPos, centerYOnBar);
          }
        } else if (fitsInVerticalBar && textHeight + LABEL_MARGIN <= absBarHeight) {
          const yPos = isNegativeValue
            ? barY + textHeight / 2 + LABEL_MARGIN
            : barY - textHeight / 2 - LABEL_MARGIN;
          ctx.fillText(formattedTxt, centerXOnBar, yPos);
        }

        break;
      }

      case 'center': {
        if (isHorizontal) {
          if (textWidth < drawableBarWidth && textHeight < absBarHeight) {
            ctx.fillText(formattedTxt, centerXOnBar, centerYOnBar);
          }
        } else if (fitsInVerticalBar && textHeight < drawableBarHeight) {
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

          if (textHeight < this.size.bar) {
            if (isNegativeValue) {
              const xPos = barX - LABEL_MARGIN + barWidth - textWidth;
              if (xPos > minXOnChart) {
                ctx.fillText(formattedTxt, xPos, centerYOnBar);
              }
            } else {
              const xPos = barX + LABEL_MARGIN + barWidth;
              if (xPos + textWidth < maxXOnChart) {
                ctx.fillText(formattedTxt, xPos, centerYOnBar);
              }
            }
          }
        } else {
          const minYOnChart = this.chartRect.y1 + this.labelOffset.top;
          const maxYOnChart = this.chartRect.y2 - this.labelOffset.bottom;

          if (textWidth <= this.size.bar) {
            if (isNegativeValue) {
              const yPos = barY + barHeight + LABEL_MARGIN + textHeight / 2;
              if (yPos + textHeight / 2 <= maxYOnChart) {
                ctx.fillText(formattedTxt, centerXOnBar, yPos);
              }
            } else {
              const yPos = barY + barHeight - LABEL_MARGIN - textHeight / 2;
              if (yPos - textHeight / 2 >= minYOnChart) {
                ctx.fillText(formattedTxt, centerXOnBar, yPos);
              }
            }
          }
        }

        break;
      }

      default:
      case 'end': {
        if (isHorizontal) {
          if (textWidth < drawableBarWidth && textHeight < absBarHeight) {
            const xPos = isNegativeValue ? barX + barWidth + LABEL_MARGIN : barX + barWidth - textWidth - LABEL_MARGIN;
            ctx.fillText(formattedTxt, xPos, centerYOnBar);
          }
        } else if (isNegativeValue) {
          const yPos = barY + barHeight - textHeight / 2 - LABEL_MARGIN;
          if (yPos > minYPos && fitsInVerticalBar && textHeight + LABEL_MARGIN <= absBarHeight) {
            ctx.fillText(formattedTxt, centerXOnBar, yPos);
          }
        } else if (fitsInVerticalBar && textHeight + LABEL_MARGIN <= absBarHeight) {
          ctx.fillText(formattedTxt, centerXOnBar, barY + barHeight + textHeight / 2 + LABEL_MARGIN);
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

  /**
   * Returns items in range
   * 막대는 점이 아니라 폭을 가지므로 드래그 구간에 걸치기만 해도 포함한다(부분 겹침 허용).
   * 누적 막대는 `.y`가 누적 합, `.o`가 자기 값이다 — Line 과 같은 포인트 객체를 그대로 반환한다.
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, width }) {
    if (!this.show || this.isHorizontal) {
      return [];
    }

    const xep = xsp + width;

    // 스크롤바 이동은 lightUpdate 라 xp 를 null 로 되돌리는 경로를 건너뛴다 — 윈도우 밖 항목이
    // 직전 렌더의 좌표를 들고 있어 xp 가 있는지만 보면 걸러지지 않는다. binarySearchBar 와 같은
    // 산술로 가시 구간만 훑는다. 구간 안에도 값이 null 인 항목은 좌표가 없어 가드가 남는다.
    const startIdx = this.visibleStartIndex ?? 0;
    const totalCount = this.filteredCount ?? this.data.length;
    const endIdx = Math.min(startIdx + totalCount - 1, this.data.length - 1);

    return this.data
      .slice(startIdx, endIdx + 1)
      .filter(({ xp, w }) => xp !== null && xp !== undefined && xp <= xep && xp + w >= xsp);
  }
}

export default Bar;
