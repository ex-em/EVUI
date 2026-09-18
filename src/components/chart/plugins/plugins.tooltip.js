import { inRange } from 'lodash-es';
import { convertToPercent } from '@/common/utils';
import debounce from '@/common/utils.debounce';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';

/**
 * 문서 좌표계로 표현한 가시 영역(뷰포트).
 * tooltipDOM 은 body 직속 absolute 라 좌표는 문서 기준인데, 배치 한계는 "지금 보이는 화면"이어야 한다.
 * `document.body.clientWidth` 는 body 가 뷰포트보다 넓은 레이아웃에서 크게 어긋난다.
 *
 * @returns {{left: number, top: number, right: number, bottom: number}} 가시 영역 (문서 좌표)
 */
const getVisibleDocumentRect = () => {
  const doc = document.documentElement;
  const left = window.scrollX ?? 0;
  const top = window.scrollY ?? 0;

  return {
    left,
    top,
    right: left + (doc?.clientWidth || window.innerWidth || 0),
    bottom: top + (doc?.clientHeight || window.innerHeight || 0),
  };
};

/**
 * 상한이 실제로 툴팁 폭을 구속할 때만 쓰는 양자화. 상한은 커서 좌표의 함수라 1px 이동마다 값이
 * 달라지는데, 구속되는 구간에서는 그 값이 그대로 툴팁의 used width 가 되어 가상 스크롤의
 * 폭 감시 ResizeObserver(`plugins.tooltip.virtualScroll`)를 매 mousemove 발화시킨다 —
 * 행 측정 전량 무효화 + prefix sum 재계산 + 앵커 보정으로 커서만 움직여도 내부 스크롤이 흔들린다.
 * `floor` 라 항상 남은 폭 이하여서 넘침 차단은 그대로다.
 *
 * 구속되지 않는 구간(`width <= room`)에는 적용하지 않는다 — 상한을 실측 폭 아래로 내려
 * 멀쩡히 들어가던 내용을 줄바꿈시키고, 없던 RO 발화를 새로 만든다.
 *
 * @param {number} room  앵커에서 가시 영역 끝까지 남은 폭
 * @returns {number} STEP 배수로 내림한 상한
 */
const quantizeTooltipMaxWidth = (room) => {
  const STEP = 16;

  return Math.floor(room / STEP) * STEP;
};

const clampRatio = (r) => (Number.isFinite(r) ? Math.max(0, Math.min(1, r)) : 1);

/**
 * 스케일 범위(step) 대비 데이터 범위(range)의 픽셀 경계를 계산한다.
 * @param {object} step   axesSteps 항목 ({ graphMin, graphMax })
 * @param {object} range  axesRange 항목 ({ min, max })
 * @param {number} start  축 시작 픽셀 (X: graphPos.x1 / Y(반전): graphPos.y2)
 * @param {number} size   축 픽셀 크기 (graphPos.x2 - x1 또는 y2 - y1)
 * @param {boolean} inverted Y축처럼 값이 커질수록 픽셀이 감소하는 경우 true
 * @returns {[number, number] | null} [boundMin, boundMax] 또는 계산 불가 시 null
 */
const calcDomainBounds = (step, range, start, size, inverted) => {
  const span = step?.graphMax - step?.graphMin;
  if (!range || !Number.isFinite(span) || span <= 0) return null;
  const r0 = clampRatio((range.min - step.graphMin) / span);
  const r1 = clampRatio((range.max - step.graphMin) / span);
  const minRatio = Math.min(r0, r1);
  const maxRatio = Math.max(r0, r1);
  return inverted
    ? [Math.floor(start - size * maxRatio), Math.ceil(start - size * minRatio)]
    : [Math.floor(start + size * minRatio), Math.ceil(start + size * maxRatio)];
};

const LINE_SPACING = 8;
const VALUE_MARGIN = 50;
const SCROLL_WIDTH = 17;
const BODY_PADDING = 8;
const EDGE_TOLERANCE = 15; // mouse interpolation 더 넓은 범위에서 감지

const modules = {
  /**
   * Create tooltip DOM
   *
   * @returns {undefined}
   */
  createTooltipDOM() {
    this.tooltipDOM = document.createElement('div');
    this.tooltipDOM.className = 'ev-chart-tooltip';

    this.tooltipHeaderDOM = document.createElement('div');
    this.tooltipHeaderDOM.className = 'ev-chart-tooltip-header';

    this.tooltipBodyDOM = document.createElement('div');
    this.tooltipBodyDOM.className = 'ev-chart-tooltip-body';

    this.tooltipCanvas = document.createElement('canvas');
    this.tooltipCanvas.className = 'ev-chart-tooltip-canvas';
    this.tooltipCtx = this.tooltipCanvas.getContext('2d');

    this.tooltipDOM.style.display = 'none';

    if (!this.options.tooltip?.formatter?.html) {
      this.setDefaultTooltipLayout();
    }

    document.body.appendChild(this.tooltipDOM);

    if (this.options.tooltip.debouncedHide) {
      this.hideTooltipDOM = debounce(() => {
        this.tooltipDOM.style.display = 'none';
        this.resetTooltipPlacement();
      }, 200);
    } else {
      this.hideTooltipDOM = () => {
        this.tooltipDOM.style.display = 'none';
        this.resetTooltipPlacement();
      };
    }
    this.isInitTooltip = true;
  },

  setDefaultTooltipLayout() {
    this.tooltipBodyDOM.appendChild(this.tooltipCanvas);
    this.tooltipDOM.appendChild(this.tooltipHeaderDOM);
    this.tooltipDOM.appendChild(this.tooltipBodyDOM);
  },

  /**
   * value-only plot 라벨 hover 시 표시할 경량 텍스트 tooltip DOM 을 생성한다(지연 생성).
   * series tooltip(tooltipDOM)과 별개의 단일 텍스트 요소.
   *
   * @returns {undefined}
   */
  createPlotLabelTooltipDOM() {
    this.plotLabelTooltipDOM = document.createElement('div');
    this.plotLabelTooltipDOM.className = 'ev-chart-plot-label-tooltip';
    this.plotLabelTooltipDOM.style.position = 'fixed';
    this.plotLabelTooltipDOM.style.display = 'none';
    this.plotLabelTooltipDOM.style.pointerEvents = 'none';
    this.plotLabelTooltipDOM.style.zIndex = '1000';
    this.plotLabelTooltipDOM.style.whiteSpace = 'nowrap';
    document.body.appendChild(this.plotLabelTooltipDOM);
  },

  /**
   * plot 라벨 hover tooltip 을 region.text 로 표시한다.
   * @param {object} region   { text, style } hover hit 영역
   * @param {MouseEvent} evt  커서 위치(clientX/Y)
   *
   * @returns {undefined}
   */
  showPlotLabelTooltip(region, evt) {
    if (!this.plotLabelTooltipDOM) {
      this.createPlotLabelTooltipDOM();
    }

    const dom = this.plotLabelTooltipDOM;
    const style = region.style ?? {};
    const padding = style.padding ?? { top: 4, right: 8, bottom: 4, left: 8 };

    const backgroundColor = style.backgroundColor ?? '#4C4C4C';
    dom.textContent = region.text;
    dom.style.backgroundColor = backgroundColor;
    dom.style.color = style.fontColor ?? '#FFFFFF';
    // borderColor 미지정 시 배경색과 동일 → 테두리가 보이지 않음
    dom.style.border = `1px solid ${style.borderColor ?? backgroundColor}`;
    dom.style.borderRadius = `${style.borderRadius ?? 4}px`;
    dom.style.fontSize = `${style.fontSize ?? 12}px`;
    dom.style.fontWeight = `${style.fontWeight ?? 400}`;
    dom.style.fontFamily = style.fontFamily ?? 'Roboto';
    dom.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    dom.style.boxShadow = style.useShadow
      ? `2px 2px 4px rgba(0, 0, 0, ${style.shadowOpacity ?? 0.25})`
      : 'none';
    dom.style.left = `${evt.clientX + 10}px`;
    dom.style.top = `${evt.clientY + 10}px`;
    dom.style.display = 'block';
  },

  /**
   * plot 라벨 hover tooltip 을 숨긴다.
   *
   * @returns {undefined}
   */
  hidePlotLabelTooltip() {
    if (this.plotLabelTooltipDOM) {
      this.plotLabelTooltipDOM.style.display = 'none';
    }
  },

  /**
   * get Tooltip's font style by Type ('title' | 'contents')
   * @param {string} type  'title' | 'contents'
   * @returns {string}
   */
  getFontStyle(type) {
    const opt = this.options?.tooltip;
    const fontSize = opt?.fontSize?.[type] ?? 14;
    const fontFamily = opt?.fontFamily ?? 'Roboto';

    return `normal normal lighter ${Math.max(fontSize, 0)}px ${fontFamily}`;
  },

  getTextHeight() {
    return (this.options?.tooltip?.fontSize?.contents ?? 14) + 6;
  },

  getColorMargin() {
    return (this.options?.tooltip?.fontSize?.contents ?? 14) + 2;
  },

  getBoxPadding() {
    const { top = 0, right = 20, bottom = 3, left = 16 } = this.options?.tooltip?.rowPadding ?? {};

    return {
      t: top,
      l: left,
      b: bottom,
      r: right,
    };
  },

  /**
   * Set tooltip DOM's position and style
   * @param {object} hitInfo    value and mouse position touched
   * @param {object} e          mousemove callback
   *
   * @returns {object} tooltip layout information
   */
  setTooltipLayoutPosition(hitInfo, e) {
    const ctx = this.tooltipCtx;
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const items = hitInfo.items;
    const [maxSeries, maxValue] = hitInfo.maxTip;
    const seriesKeys = Object.keys(items);
    const seriesLen = seriesKeys.length;
    const boxPadding = this.getBoxPadding();
    const opt = this.options.tooltip;
    const seriesColorMarginRight = this.getColorMargin();

    // Draw hidden tooltip header DOM to calculate height
    const sId = hitInfo.hitId;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const titleFormatter = opt.formatter?.title;

    if (this.axesX.length && this.axesY.length && opt.showHeader) {
      if (titleFormatter) {
        this.tooltipHeaderDOM.textContent = titleFormatter({
          x: hitItem.x,
          y: hitItem.y,
        });
      } else {
        this.tooltipHeaderDOM.textContent = this.options.horizontal
          ? this.axesY[hitAxis.y].getLabelFormat(hitItem.y)
          : this.axesX[hitAxis.x].getLabelFormat(hitItem.x);
      }
    }

    if (opt.textOverflow) {
      this.tooltipHeaderDOM.classList.add(`ev-chart-tooltip-header--${opt.textOverflow}`);
    }

    this.tooltipHeaderDOM.style.visibility = 'hidden';

    // calculate and decide width of canvas El(contentsWidth)
    ctx.save();
    ctx.font = this.getFontStyle('contents');
    const isHorizontal = !!this.options.horizontal;
    const label = isHorizontal ? items[hitInfo.hitId]?.data?.y : items[hitInfo.hitId]?.data?.x;
    const tooltipValue = label?.length > maxSeries.length ? label : maxSeries;
    const nw = Math.round(ctx.measureText(tooltipValue).width);
    const vw = Math.round(ctx.measureText(maxValue).width);
    const expectedContentsWidth =
      nw + vw + boxPadding.l + boxPadding.r + seriesColorMarginRight + VALUE_MARGIN + SCROLL_WIDTH;
    const contentsWidth =
      expectedContentsWidth > opt.maxWidth ? opt.maxWidth : expectedContentsWidth;

    // Calculate height of canvas El(tooltip body El) with wrapped line count
    let textLineCnt = opt.textOverflow === 'wrap' ? 0 : seriesLen;

    if (opt.textOverflow === 'wrap') {
      const seriesNameSpaceWidth =
        opt.maxWidth -
        (Math.round(ctx.measureText(maxValue).width) +
          boxPadding.l +
          boxPadding.r +
          seriesColorMarginRight +
          VALUE_MARGIN +
          SCROLL_WIDTH);

      // count wrap line
      const seriesNames = Object.values(items).map((s) => s.name);
      seriesNames.forEach((name) => {
        if (ctx.measureText(name).width > seriesNameSpaceWidth) {
          let line = '';
          for (let jx = 0; jx < name.length; jx++) {
            const char = name[jx];
            const temp = `${line}${char}`;
            if (ctx.measureText(temp).width > seriesNameSpaceWidth) {
              line = char;
              textLineCnt += 1;
            } else {
              line = temp;
            }
          }
        }
        textLineCnt += 1;
      });
      ctx.restore();
    }

    // Calculate height of canvas El(tooltip body El) with useScrollbar, maxHeight option
    const expectedContentsHeight =
      boxPadding.t + textLineCnt * this.getTextHeight() + seriesLen * LINE_SPACING + boxPadding.b;

    let contentsHeight;
    if (opt.useScrollbar && expectedContentsHeight > opt.maxHeight) {
      this.tooltipBodyDOM.style.overflowY = 'auto';
      contentsHeight = opt.maxHeight;
    } else {
      this.tooltipBodyDOM.style.overflowY = 'hidden';
      contentsHeight = expectedContentsHeight;
    }

    // set width / height to all DOM elements (canvas, tooltip(wrapper), header, body)
    this.tooltipCanvas.width = contentsWidth * this.pixelRatio;
    this.tooltipCanvas.height = expectedContentsHeight * this.pixelRatio;
    this.tooltipCanvas.style.width = `${contentsWidth}px`;
    this.tooltipCanvas.style.height = `${expectedContentsHeight}px`;
    this.tooltipHeaderDOM.style.width = `${contentsWidth}px`;
    this.tooltipHeaderDOM.style.height = 'auto';
    this.tooltipDOM.style.height = 'auto';
    this.tooltipBodyDOM.style.height = `${contentsHeight + 6}px`;
    // 직전 배치가 걸어둔 폭 상한이 남아 있으면 자연 폭보다 작게 측정된다.
    this.tooltipDOM.style.maxWidth = '';
    this.tooltipDOM.style.display = 'block';

    const tooltipDOMHeight =
      this.tooltipDOM?.offsetHeight ||
      this.tooltipHeaderDOM?.offsetHeight + contentsHeight + BODY_PADDING;
    // 상한은 테두리를 포함한 tooltipDOM 전체에 걸리므로 반전 판정도 실측 폭으로 한다.
    // contentsWidth 는 canvas 폭이어서 header padding·테두리만큼 작다(호스트 전역 리셋 유무에 따라 최대 34px).
    const tooltipDOMWidth = this.tooltipDOM?.offsetWidth || contentsWidth;
    this.placeTooltipDOM(mouseX, mouseY, tooltipDOMWidth, tooltipDOMHeight);
  },

  /**
   * Draw series color shape
   * @param {object} context    tooltip canvas context
   * @param {string} shape  // 'circle' | 'rect' (default)
   * @param {object} centerPosition  // {x: number, y: number}
   */
  drawSeriesColorShape(context, shape, centerPosition) {
    const fontSize = this.options.tooltip?.fontSize?.contents;
    const { x, y } = centerPosition;

    if (shape === 'circle') {
      context.beginPath();
      const circleSize = fontSize / 2;
      context.arc(x, y - circleSize / 2, circleSize, 0, 2 * Math.PI);
      context.fill();
    } else {
      const rectSize = fontSize;
      context.fillRect(x - rectSize / 3, y - rectSize / 1.2, rectSize, rectSize);
    }
  },

  /**
   * Draw tooltip canvas
   * @param {object} hitInfo    mousemove callback
   * @param {object} context    tooltip canvas context
   *
   * @returns {undefined}
   */
  drawTooltip(hitInfo, context) {
    const ctx = context;
    const items = hitInfo.items;
    const [, maxValue] = hitInfo.maxTip;
    const seriesKeys = this.alignSeriesList(Object.keys(items));
    const boxPadding = this.getBoxPadding();
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;
    const textHeight = this.getTextHeight();
    const seriesColorMarginRight = this.getColorMargin();

    // draw Tooltip header DOM
    if (this.axesX.length && this.axesY.length && opt.showHeader) {
      this.tooltipHeaderDOM.style.visibility = 'visible';
    } else {
      this.tooltipHeaderDOM.style.display = 'none';
    }

    // draw tooltip contents (series, value combination)
    let x = 2;
    let y = 2;

    x += Util.aliasPixel(x);
    y += Util.aliasPixel(y);

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    if (this.tooltipBodyDOM.style.overflowY === 'auto') {
      boxPadding.r += SCROLL_WIDTH;
    }

    x += boxPadding.l;
    y += boxPadding.t;

    ctx.font = this.getFontStyle('contents');

    const seriesList = [];
    seriesKeys.forEach((seriesName) => {
      seriesList.push({
        id: seriesName,
        data: items[seriesName].data,
        color: items[seriesName].color,
        name: items[seriesName].name,
        dataId: items[seriesName].id,
      });
    });

    if (opt.sortByValue) {
      seriesList.sort((a, b) => {
        let prev = a.data.o;
        let next = b.data.o;

        if (prev === null || prev === undefined) {
          prev = isHorizontal ? a.data.x : a.data.y;
        }

        if (next === null || next === undefined) {
          next = isHorizontal ? b.data.x : b.data.y;
        }
        return next - prev;
      });
    }

    this.setTooltipDOMStyle(opt);

    // 루프 내에서 offsetWidth를 반복 읽으면 강제 동기 레이아웃이 발생하므로 한 번만 읽는다.
    const tooltipWidth = this.tooltipDOM.offsetWidth;

    let textLineCnt = 1;
    for (let ix = 0; ix < seriesList.length; ix++) {
      const gdata = seriesList[ix].data;
      const color = seriesList[ix].color;
      const name = seriesList[ix].name;
      const valueText = gdata.formatted;

      let itemX = x + 4;
      let itemY = y + textLineCnt * textHeight;
      itemX += Util.aliasPixel(itemX);
      itemY += Util.aliasPixel(itemY);

      ctx.beginPath();

      if (typeof color !== 'string') {
        ctx.fillStyle = Canvas.createGradient(
          ctx,
          isHorizontal,
          { x: itemX - 4, y: itemY, w: 12, h: -12 },
          color,
        );
      } else {
        ctx.fillStyle = color;
      }

      const curTooltipInfo = {
        id: seriesList[ix].id,
        name: seriesList[ix].name,
        value: valueText,
        dataId: seriesList[ix].dataId,
      };

      // 1. Draw series color
      this.drawSeriesColorShape(ctx, opt.colorShape, { x: itemX, y: itemY });

      // 2. Draw series name
      ctx.fillStyle =
        typeof opt.fontColor.label === 'function'
          ? opt.fontColor.label(curTooltipInfo)
          : (opt.fontColor.label ?? opt.fontColor);

      const seriesNameSpaceWidth =
        opt.maxWidth -
        Math.round(ctx.measureText(maxValue).width) -
        boxPadding.l -
        boxPadding.r -
        seriesColorMarginRight -
        VALUE_MARGIN;
      const xPos = itemX + seriesColorMarginRight;
      const yPos = itemY;

      if (seriesNameSpaceWidth > ctx.measureText(name).width) {
        // draw normally
        ctx.fillText(name, xPos, yPos);
      } else if (opt.textOverflow === 'wrap') {
        // draw with wrap
        let line = '';
        let yPosWithWrap = yPos;

        for (let jx = 0; jx < name.length; jx++) {
          const char = name[jx];
          const temp = `${line}${char}`;

          if (ctx.measureText(temp).width > seriesNameSpaceWidth) {
            ctx.fillText(line, xPos, yPosWithWrap);
            line = char;
            textLineCnt += 1;
            yPosWithWrap += textHeight;
          } else {
            line = temp;
          }
        }
        ctx.fillText(line, xPos, yPosWithWrap);
      } else {
        // draw with ellipsis
        const shortSeriesName = Util.truncateLabelWithEllipsis(name, seriesNameSpaceWidth, ctx);
        ctx.fillText(shortSeriesName, xPos, yPos);
      }

      ctx.save();

      // 3. Draw value
      ctx.fillStyle =
        typeof opt.fontColor.value === 'function'
          ? opt.fontColor.value(curTooltipInfo)
          : (opt.fontColor.value ?? opt.fontColor);
      ctx.textAlign = 'right';
      ctx.fillText(valueText, tooltipWidth - boxPadding.r, itemY);
      ctx.restore();
      ctx.closePath();

      // 4. add lineSpacing
      y += LINE_SPACING;
      textLineCnt += 1;
    }

    ctx.restore();
  },

  /**
   * Draw tooltip canvas for heatmap
   * @param {object} hitInfo    mousemove callback
   * @param {object} context    tooltip canvas context
   *
   * @returns {undefined}
   */
  drawToolTipForHeatMap(hitInfo, context) {
    const ctx = context;
    const items = hitInfo.items;
    const sId = hitInfo.hitId;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const hitColor = items[sId].color;
    const boxPadding = this.getBoxPadding();
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;
    const series = Object.values(this.seriesList)[0];
    const textHeight = this.getTextHeight();
    const seriesColorMarginRight = this.getColorMargin();

    let isShow = false;
    let valueText = hitItem.formatted;
    const { colorState, isGradient } = series;
    if (isGradient) {
      const { min, max } = series.valueOpt;
      const ratio = convertToPercent(hitItem.o - min, max - min);
      const { start, end } = colorState[0];
      isShow = (start <= ratio && ratio <= end) || hitItem.o === -1;
    } else {
      const colorItem = colorState.find(({ id }) => id === hitItem.cId);
      isShow = colorItem?.show;
      valueText = colorItem?.label ?? valueText;
    }

    if (!isShow) {
      this.tooltipClear();
      return;
    }

    // draw Tooltip header DOM
    if (this.axesX.length && this.axesY.length && opt.showHeader) {
      this.tooltipHeaderDOM.style.visibility = 'visible';
    } else {
      this.tooltipHeaderDOM.style.display = 'none';
    }

    this.setTooltipDOMStyle(opt);

    const tooltipWidth = this.tooltipDOM.offsetWidth;

    // draw tooltip contents (series, value combination)
    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    if (this.tooltipBodyDOM.style.overflowY === 'auto') {
      boxPadding.r += SCROLL_WIDTH;
    }

    const itemX = boxPadding.l + 2;
    const itemY = boxPadding.t + textHeight + 2;

    ctx.font = this.getFontStyle('contents');

    ctx.beginPath();

    if (typeof hitColor !== 'string') {
      ctx.fillStyle = Canvas.createGradient(
        ctx,
        isHorizontal,
        { x: itemX, y: itemY, w: 12, h: -12 },
        hitColor,
      );
    } else {
      ctx.fillStyle = hitColor;
    }

    const curTooltipInfo = {
      id: hitInfo.hitId,
      name: hitItem.y,
      value: valueText,
      dataId: items[sId].id,
    };

    // 1. Draw value color
    this.drawSeriesColorShape(ctx, opt.colorShape, { x: itemX, y: itemY });

    // 2. Draw value y names
    ctx.fillStyle =
      typeof opt.fontColor.label === 'function'
        ? opt.fontColor.label(curTooltipInfo)
        : (opt.fontColor.label ?? opt.fontColor);

    if (this.axesY.length) {
      ctx.fillText(
        this.axesY[hitAxis.y].getLabelFormat(hitItem.y),
        itemX + seriesColorMarginRight,
        itemY,
      );
    }

    // 3. Draw value
    ctx.textAlign = 'right';
    ctx.fillStyle =
      typeof opt.fontColor.value === 'function'
        ? opt.fontColor.value(curTooltipInfo)
        : (opt.fontColor.value ?? opt.fontColor);
    ctx.fillText(valueText, tooltipWidth - boxPadding.r, itemY);
    ctx.closePath();
  },

  /**
   *
   * @param hitInfo
   * @param context
   */
  drawTooltipForScatter(hitInfo, context) {
    const ctx = context;
    const items = hitInfo.items;
    const [, maxValue] = hitInfo.maxTip;
    const seriesKeys = this.alignSeriesList(Object.keys(items));
    const boxPadding = this.getBoxPadding();
    const opt = this.options.tooltip;
    const textHeight = this.getTextHeight();
    const seriesColorMarginRight = this.getColorMargin();

    // draw Tooltip header DOM
    if (this.axesX.length && this.axesY.length && opt.showHeader) {
      this.tooltipHeaderDOM.style.visibility = 'visible';
    } else {
      this.tooltipHeaderDOM.style.display = 'none';
    }

    let x = 2;
    let y = 2;

    x += Util.aliasPixel(x);
    y += Util.aliasPixel(y);

    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    if (this.tooltipBodyDOM.style.overflowY === 'auto') {
      boxPadding.r += SCROLL_WIDTH;
    }

    x += boxPadding.l;
    y += boxPadding.t;

    ctx.font = this.getFontStyle('contents');

    const seriesList = [];
    seriesKeys.forEach((seriesName) => {
      seriesList.push({
        data: items[seriesName].data,
        color: items[seriesName].color,
        name: items[seriesName].name,
      });
    });

    if (opt.sortByValue) {
      seriesList.sort((a, b) => {
        let prev = a.data.o;
        let next = b.data.o;

        if (prev === null || prev === undefined) {
          prev = a.data.y;
        }

        if (next === null || next === undefined) {
          next = b.data.y;
        }

        return next - prev;
      });
    }

    this.setTooltipDOMStyle(opt);

    // 루프 내에서 offsetWidth를 반복 읽으면 강제 동기 레이아웃이 발생하므로 한 번만 읽는다.
    const tooltipWidth = this.tooltipDOM.offsetWidth;

    let textLineCnt = 1;
    for (let ix = 0; ix < seriesList.length; ix++) {
      const gdata = seriesList[ix].data;
      const color = seriesList[ix].color;
      const name = seriesList[ix].name;
      const valueText = gdata.formatted;

      let itemX = x + 4;
      let itemY = y + textLineCnt * textHeight;
      itemX += Util.aliasPixel(itemX);
      itemY += Util.aliasPixel(itemY);

      ctx.beginPath();

      if (typeof color !== 'string') {
        ctx.fillStyle = Canvas.createGradient(
          ctx,
          false,
          { x: itemX - 4, y: itemY, w: 12, h: -12 },
          color,
        );
      } else {
        ctx.fillStyle = color;
      }

      const curTooltipInfo = {
        id: hitInfo.hitId,
        name: seriesList[ix].name,
        value: valueText,
        dataId: seriesList[ix].dataId,
      };

      // 1. Draw series color
      this.drawSeriesColorShape(ctx, opt.colorShape, { x: itemX, y: itemY });

      // 2. Draw series name
      ctx.fillStyle =
        typeof opt.fontColor.label === 'function'
          ? opt.fontColor.label(curTooltipInfo)
          : (opt.fontColor.label ?? opt.fontColor);

      const seriesNameSpaceWidth =
        opt.maxWidth -
        Math.round(ctx.measureText(maxValue).width) -
        boxPadding.l -
        boxPadding.r -
        seriesColorMarginRight -
        VALUE_MARGIN;
      const xPos = itemX + seriesColorMarginRight;
      const yPos = itemY;

      if (seriesNameSpaceWidth > ctx.measureText(name).width) {
        // draw normally
        ctx.fillText(name, xPos, yPos);
      } else if (opt.textOverflow === 'wrap') {
        // draw with wrap
        let line = '';
        let yPosWithWrap = yPos;

        for (let jx = 0; jx < name.length; jx++) {
          const char = name[jx];
          const temp = `${line}${char}`;

          if (ctx.measureText(temp).width > seriesNameSpaceWidth) {
            ctx.fillText(line, xPos, yPosWithWrap);
            line = char;
            textLineCnt += 1;
            yPosWithWrap += textHeight;
          } else {
            line = temp;
          }
        }
        ctx.fillText(line, xPos, yPosWithWrap);
      } else {
        // draw with ellipsis
        const shortSeriesName = Util.truncateLabelWithEllipsis(name, seriesNameSpaceWidth, ctx);
        ctx.fillText(shortSeriesName, xPos, yPos);
      }

      ctx.save();

      // 3. Draw value
      ctx.textAlign = 'right';
      ctx.fillStyle =
        typeof opt.fontColor.value === 'function'
          ? opt.fontColor.value(curTooltipInfo)
          : (opt.fontColor.value ?? opt.fontColor);
      ctx.fillText(valueText, tooltipWidth - boxPadding.r, itemY);
      ctx.restore();
      ctx.closePath();

      // 4. add lineSpacing
      y += LINE_SPACING;
      textLineCnt += 1;
    }

    ctx.restore();
  },

  setCustomTooltipLayoutPosition(hitInfo, e) {
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    if (!this.tooltipDOM) {
      return;
    }

    // drawCustomTooltip 은 사용자 formatter.html 의 루트 노드를 tooltipDOM 에 단독으로 붙이므로
    // (htmlToElement 가 firstChild 하나만 반환) 커스텀 루트는 항상 firstElementChild 다.
    // 특정 클래스명(ev-chart-tooltip-custom)에 의존하지 않아, 사용자가 임의 마크업을 써도 안전하다.
    let customTooltipEl = this.tooltipDOM.firstElementChild;
    // skip-redraw fast path 등으로 커스텀 엘리먼트가 비어 있을 수 있다. 같은 데이터 포인트에
    // 머물러 fast path 가 계속 redraw 를 건너뛰는 경우, 여기서 한 번 그려 복구한다.
    // (엘리먼트가 이미 있는 일반 경로에서는 재draw 하지 않으므로 비용/부작용 없음)
    // 드래그 중에는 그 fast path 가 꺼져 있어 이 프레임이 방금 그렸다 — 루트가 비어 있다는 것은
    // 같은 items 로 다시 불러도 결과가 같다는 뜻이라, 재draw 는 formatter 호출만 늘린다.
    const isDragging = this.dragInfo?.isMove;
    if (!customTooltipEl && !isDragging && hitInfo?.items && Object.keys(hitInfo.items).length) {
      this.drawCustomTooltip(hitInfo.items);
      customTooltipEl = this.tooltipDOM.firstElementChild;
    }

    if (!customTooltipEl) {
      return;
    }

    // 직전 배치가 걸어둔 폭 상한이 남아 있으면 자연 폭보다 작게 측정된다.
    this.tooltipDOM.style.maxWidth = '';
    this.tooltipDOM.style.display = 'block';
    const contentsHeight = customTooltipEl.offsetHeight;

    this.tooltipDOM.style.height = 'auto';
    this.tooltipBodyDOM.style.height = `${contentsHeight + 6}px`;

    // 상한이 tooltipDOM 에 걸리므로 판정도 자식(customTooltipEl)이 아닌 tooltipDOM 실측 폭으로 한다
    // — 커스텀 경로는 인라인 `border: 1px` 가 붙어 자식 폭보다 2px 넓다.
    const tooltipDOMSize = this.tooltipDOM?.getBoundingClientRect();
    this.placeTooltipDOM(mouseX, mouseY, tooltipDOMSize?.width, tooltipDOMSize?.height);
  },

  /**
   * 커서 옆 20px 에 툴팁을 두되, 가시 영역을 넘으면 반대 방향으로 반전한다.
   * 배치 지점에서 가시 영역 끝까지 남은 폭을 `max-width` 상한으로 걸어, 배치 이후 내용이 넓어지는
   * 경로(가상 스크롤 rAF 렌더·내부 스크롤바 출현·웹폰트 적용)에서도 레이아웃 단계에서 넘지 못하게 한다
   * — 사후 교정은 한 프레임 늦어 넘친 프레임이 그대로 그려진다(문서 가로 스크롤바 깜빡임).
   *
   * 가로 반전은 매 호출의 폭으로 다시 판정하지 않고 직전 방향을 유지한다. 폭은 hover 지점마다
   * 달라지므로(시리즈 이름·값 길이), 그때그때 판정하면 커서가 한 방향으로 움직이는 동안에도
   * 좌우가 번갈아 뒤집힌다 — 실측에서 폭 533→253 구간에 왼쪽→오른쪽 복귀가 잡혔다.
   *
   * 반전 배치는 좌표 대신 `translateX(-100%)` 로 **우단을 커서 왼쪽 20px 에 고정**한다.
   * 좌측을 `커서 - 폭 - 20` 으로 잡으면 배치 이후 폭이 커지는 경로(가상 스크롤 재렌더·
   * ResizeObserver 재측정)에서 툴팁이 커서 쪽으로 자라 커서를 덮는다 — 실측에서 배치 폭 404,
   * 직후 실제 폭 471(+65px)로 우단이 커서를 넘었다. 우단을 고정하면 왼쪽으로만 늘어난다.
   *
   * @param {number} mouseX  커서 pageX
   * @param {number} mouseY  커서 pageY
   * @param {number} width   tooltipDOM 실측 폭(테두리 포함) — 상한이 tooltipDOM 에 걸리므로 기준을 맞춘다
   * @param {number} height  tooltipDOM 실측 높이
   *
   * @returns {undefined}
   */
  placeTooltipDOM(mouseX, mouseY, width, height) {
    // 표시 직전이므로 예약된 debounce 숨김을 취소한다. 남겨두면 200ms 뒤 보이는 툴팁을 숨기고
    // 방향 기억까지 지워, 다음 배치가 반대편으로 튄다.
    this.hideTooltipDOM?.cancel?.();

    const view = getVisibleDocumentRect();
    const distanceMouseAndTooltip = 20;
    const rightAnchorX = mouseX + distanceMouseAndTooltip;
    const leftAnchorX = mouseX - distanceMouseAndTooltip;
    // 앵커에서 가시 영역 끝까지 남은 폭. 둘의 합은 항상 `가시 폭 - 40` 이라 한쪽은 반드시 양수다.
    const roomRight = view.right - rightAnchorX;
    const roomLeft = leftAnchorX - view.left;
    const fitsRight = width <= roomRight;
    const fitsLeft = width <= roomLeft;

    // 지금 방향으로 두면 가시 영역을 벗어나는 경우에만 전환한다(히스테리시스).
    // 단 어느 쪽에도 안 들어가면(툴팁이 가시 영역보다 넓음) 남은 폭이 넓은 쪽을 택한다 — 커서 위치만
    // 보는 판정이라 폭 변동에 흔들리지 않고, 상한이 0 이하가 되는 조합도 생기지 않는다.
    let flipX;
    if (!fitsRight && !fitsLeft) {
      flipX = roomLeft > roomRight;
    } else {
      flipX = this._tooltipFlipX ? fitsLeft : !fitsRight;
    }
    this._tooltipFlipX = flipX;

    const anchorX = flipX ? leftAnchorX : rightAnchorX;

    const expectedPosY = mouseY + distanceMouseAndTooltip;
    const roomBelow = view.bottom - expectedPosY;
    const roomAbove = mouseY - distanceMouseAndTooltip - view.top;
    // 아래에 안 들어가면 위로 반전한다. 가로와 달리 세로는 높이 상한을 걸지 않으므로(DECISIONS
    // 2026-09-14), 양쪽 모두 안 들어가는 경우까지 남은 공간이 넓은 쪽을 택하고 가시 영역 상단을
    // 하한으로 걸어야 반전 좌표가 음수가 돼 상단이 잘리는 것을 막을 수 있다.
    const flipY = height > roomBelow && roomAbove > roomBelow;
    const posY = flipY
      ? Math.max(view.top, mouseY - height - distanceMouseAndTooltip)
      : expectedPosY;

    // 상한도 앵커 기준이다 — 반전이면 앵커에서 가시 영역 좌단까지, 아니면 우단까지.
    const room = flipX ? roomLeft : roomRight;
    this.tooltipDOM.style.maxWidth = `${width <= room ? room : quantizeTooltipMaxWidth(room)}px`;
    // left/top 대신 transform을 사용해 합성(compositor) 레이어에서 이동시켜 레이아웃/리페인트를 회피한다.
    this.tooltipDOM.style.transform = flipX
      ? `translate3d(${anchorX}px, ${posY}px, 0) translateX(-100%)`
      : `translate3d(${anchorX}px, ${posY}px, 0)`;
  },

  resetTooltipPlacement() {
    this._tooltipFlipX = false;
  },

  /**
   * Draw User Custom Tooltip (tooltip > formatter > html)
   * call "formatter > html" and append to tooltip DOM
   * @param hitInfoItems
   * @param {object} [dragRange]  드래그 중일 때만 전달되는 { from, to }
   */
  drawCustomTooltip(hitInfoItems, dragRange) {
    const opt = this.options?.tooltip;
    if (!opt?.formatter?.html) return;

    // 가상 스크롤 행 높이 실측(_measureVisibleCustomTooltipRows)이 직전 배치의 폭 상한에 눌려
    // 줄바꿈된 높이로 굳는 것을 막는다 — 상한이 풀리면 폭 변화로 측정이 통째로 무효화된다.
    this.tooltipDOM.style.maxWidth = '';

    const itemsCount = Object.keys(hitInfoItems).length;

    // 가상 스크롤 경로 (자동/명시 활성 + 휴리스틱 성공 시)
    if (this._shouldVirtualizeCustomTooltip?.(itemsCount)) {
      const ok = this.drawCustomTooltipVirtual(hitInfoItems, dragRange);
      if (ok) return;
      // 휴리스틱 실패 시 기존 경로로 fallback
    }

    // 기존 경로 (전체 부착)
    this._teardownCustomTooltipVirtualScroll?.();
    this.tooltipDOM.innerHTML = '';

    const seriesList = [];
    Object.keys(hitInfoItems).forEach((sId) => {
      seriesList.push({
        sId,
        data: hitInfoItems[sId].data,
        color: hitInfoItems[sId].color,
        name: hitInfoItems[sId].name,
        dataId: hitInfoItems[sId].id,
        index: hitInfoItems[sId].index,
      });
    });

    // 드래그 중이 아니면 2번째 인자를 넘기지 않는다 — 기존 formatter 의 arity 를 그대로 둔다.
    let html;
    try {
      html = dragRange
        ? opt.formatter.html(seriesList, { dragRange })
        : opt.formatter.html(seriesList);
    } catch (err) {
      // 소비처 예외를 그대로 올리면 호출부가 overlay 를 비운 뒤라 그 프레임의 하이라이트와 드래그
      // 밴드까지 사라지고, update() 꼬리에서 나면 재렌더 예약 플래그가 정리되지 않는다. 가상 경로와
      // 같이 툴팁만 포기한다. 드래그 중에는 프레임마다 불리므로 경고는 인스턴스당 1회만 남긴다.
      if (!this._customTooltipWarnedThrow) {
        this._customTooltipWarnedThrow = true;
        // eslint-disable-next-line no-console
        console.warn('[evui] tooltip.formatter.html threw, tooltip skipped:', err);
      }
      this.tooltipDOM.style.display = 'none';
      this.resetTooltipPlacement();
      return;
    }
    const userCustomTooltipBody = Util.htmlToElement(html);
    if (userCustomTooltipBody) {
      this.tooltipDOM.appendChild(userCustomTooltipBody);
    }

    this.tooltipDOM.style.overflowY = 'hidden';
    this.tooltipDOM.style.backgroundColor = opt.backgroundColor;
    this.tooltipDOM.style.border = `1px solid ${opt.borderColor}`;
    this.tooltipDOM.style.color = opt.fontColor?.title ?? opt.fontColor;
  },

  /**
   * set style properties on tooltip DOM
   * @param tooltipOptions
   */
  setTooltipDOMStyle(tooltipOptions) {
    this.tooltipDOM.style.overflowY = 'hidden';
    this.tooltipDOM.style.backgroundColor = tooltipOptions.backgroundColor;
    this.tooltipDOM.style.border = `1px solid ${tooltipOptions.borderColor}`;
    this.tooltipDOM.style.color = tooltipOptions.fontColor?.title ?? tooltipOptions.fontColor;

    this.tooltipHeaderDOM.style.fontSize = `${tooltipOptions.fontSize.title}px`;
    this.tooltipHeaderDOM.style.fontFamily = this.getFontStyle('title');

    if (tooltipOptions.useShadow) {
      const shadowColor = `rgba(0, 0, 0, ${tooltipOptions.shadowOpacity})`;
      this.tooltipDOM.style.boxShadow = `2px 2px 2px ${shadowColor}`;
    }

    this.tooltipDOM.style.display = 'block';
  },

  /**
   * Draw graph item highlight
   * @param {object} hitInfo    mousemove callback
   * @param {object} ctx        overlayCanvas context
   *
   * @returns {undefined}
   */
  drawItemsHighlight(hitInfo, ctx) {
    Object.keys(hitInfo.items).forEach((sId) => {
      const series = this.seriesList[sId];
      series.itemHighlight(
        hitInfo.items[sId],
        ctx,
        hitInfo.items[sId].index,
        this.options?.unSelectedOpacity,
      );

      if (Util.isDoughnutHole(series.type)) {
        this.drawDoughnutHole(ctx);
      }
    });
  },

  /**
   * indicator 히트 영역과 선 길이를 계산한다.
   * 도메인 축(일반 차트 X / horizontal 차트 Y)은 데이터가 존재하는 픽셀 구간으로 제한해
   * 빈 구간에서 indicator 가 뜨지 않게 하고, 교차 축만 기존 ±EDGE_TOLERANCE 를 유지한다.
   *
   * @returns {object} { x1, x2, y1, y2, hitXMin, hitXMax, hitYMin, hitYMax }
   */
  getIndicatorHitBounds() {
    const options = this.options;
    const x1 = this.chartRect.x1 + this.labelOffset.left;
    const x2 = this.chartRect.x2 - this.labelOffset.right;
    const y1 = this.chartRect.y1 + this.labelOffset.top;
    const y2 = this.chartRect.y2 - this.labelOffset.bottom;

    // 데이터가 존재하는 픽셀 구간(여러 축의 합집합)을 집계한다.
    // Infinity로 시작해야 Math.min/Math.max가 calcDomainBounds 결과를 실제로 반영한다.
    // (x1/x2로 시작하면 bounds가 항상 [x1,x2] 내부라 집계가 차트 경계로 되돌아가 빈 구간 좁히기가 무효화된다)
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    // 범위를 못 구한 축이 차지하는 픽셀 구간은 알 수 없다. 나머지 축만으로 좁히면
    // 그 축의 데이터가 있는 구간까지 잘려나가므로, 하나라도 못 구하면 전체를 fallback 한다.
    let hasUnknownAxis = false;

    if (options.horizontal) {
      const ySteps = this.axesSteps?.y || [];
      for (let i = 0; i < ySteps.length; i += 1) {
        const bounds = calcDomainBounds(ySteps[i], this.axesRange?.y?.[i], y2, y2 - y1, true);
        if (bounds) {
          yMin = Math.min(yMin, bounds[0]);
          yMax = Math.max(yMax, bounds[1]);
        } else {
          hasUnknownAxis = true;
        }
      }
      // 도메인 bounds를 못 구한 축이 있는 경우(category/문자열 축 등) 차트 경계로 fallback
      if (hasUnknownAxis || !Number.isFinite(yMin)) {
        yMin = y1;
        yMax = y2;
      }
    } else {
      const xSteps = this.axesSteps?.x || [];
      for (let i = 0; i < xSteps.length; i += 1) {
        const bounds = calcDomainBounds(xSteps[i], this.axesRange?.x?.[i], x1, x2 - x1, false);
        if (bounds) {
          xMin = Math.min(xMin, bounds[0]);
          xMax = Math.max(xMax, bounds[1]);
        } else {
          hasUnknownAxis = true;
        }
      }
      // 도메인 bounds를 못 구한 축이 있는 경우(category/문자열 축 등) 차트 경계로 fallback
      if (hasUnknownAxis || !Number.isFinite(xMin)) {
        xMin = x1;
        xMax = x2;
      }
    }

    return {
      x1,
      x2,
      y1,
      y2,
      hitXMin: options.horizontal ? x1 - EDGE_TOLERANCE : xMin,
      hitXMax: options.horizontal ? x2 + EDGE_TOLERANCE : xMax,
      hitYMin: options.horizontal ? yMin : y1 - EDGE_TOLERANCE,
      hitYMax: options.horizontal ? yMax : y2 + EDGE_TOLERANCE,
    };
  },

  /**
   * Draw chart indicator with mousemove
   * @param {object} offset    mousemove callback
   * @param {string} color     indicator color
   *
   * @returns {undefined}
   */
  drawIndicator(offset, color) {
    const ctx = this.overlayCtx;
    const [offsetX, offsetY] = offset;
    const options = this.options;
    const bounds = this.getIndicatorHitBounds();

    if (
      offsetX >= bounds.hitXMin &&
      offsetX <= bounds.hitXMax &&
      offsetY >= bounds.hitYMin &&
      offsetY <= bounds.hitYMax
    ) {
      ctx.beginPath();
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      if (options.indicator?.segments) {
        ctx.setLineDash(options.indicator.segments);
      }

      if (options.horizontal) {
        ctx.moveTo(bounds.x1, offsetY + 0.5);
        ctx.lineTo(bounds.x2, offsetY + 0.5);
      } else {
        ctx.moveTo(offsetX + 0.5, bounds.y1);
        ctx.lineTo(offsetX + 0.5, bounds.y2);
      }

      ctx.stroke();
      ctx.restore();
      ctx.closePath();
    }
  },
  /**
   * Get hovered axis label with mousemove
   * @param {object} offset   mousemove callback
   *
   * @returns {number | null} hovered axis label
   */
  getTimeLabel(offset) {
    const options = this.options;

    if (
      options.syncHover === false ||
      (!options.horizontal && !options.axesX.every(({ type }) => type === 'time')) ||
      (options.horizontal && !options.axesY.every(({ type }) => type === 'time'))
    ) {
      return null;
    }

    const fromTime = +this.data.labels?.[0];
    const toTime = +this.data.labels?.[this.data.labels.length - 1];
    if (fromTime == null || toTime == null) {
      return null;
    }

    const [offsetX, offsetY] = offset;
    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    const isCategoryMode = options.horizontal
      ? options.axesY?.every((axis) => axis.categoryMode)
      : options.axesX?.every((axis) => axis.categoryMode);

    if (isCategoryMode) {
      const labelsCount = this.data.labels.length;
      if (!labelsCount) return null;
      let hoverRatio;

      if (options.horizontal) {
        const chartHeight = graphPos.y2 - graphPos.y1;
        hoverRatio = (offsetY - graphPos.y1) / chartHeight;
      } else {
        const chartWidth = graphPos.x2 - graphPos.x1;
        hoverRatio = (offsetX - graphPos.x1) / chartWidth;
      }

      const index = Math.min(Math.max(Math.floor(hoverRatio * labelsCount), 0), labelsCount - 1);
      return +this.data.labels[index];
    }

    if (options.horizontal) {
      const chartHeight = graphPos.y2 - graphPos.y1;
      const hoverYAxis = offsetY - graphPos.y1;
      const hoverTime = (hoverYAxis * (toTime - fromTime)) / chartHeight + fromTime;
      return Math.round(hoverTime);
    }
    const chartWidth = graphPos.x2 - graphPos.x1;
    const hoverXAxis = offsetX - graphPos.x1;
    const hoverTime = (hoverXAxis * (toTime - fromTime)) / chartWidth + fromTime;
    return Math.round(hoverTime);
  },
  /**
   * Draw chart indicator with other grouped chart's mousemove
   * @param {object} hoveredLabel   chart direction and hovered axis label
   *
   * @returns {undefined}
   */
  drawSyncedIndicator({ horizontal, label, mousePosition, dataLabel }) {
    if (!this._canDrawSyncedIndicator(horizontal, mousePosition)) {
      return;
    }

    if (dataLabel) {
      this.drawSyncedIndicatorForTooltip({ dataLabel, mousePosition });
      return;
    }

    const fromTime = +this.data.labels?.[0];
    const toTime = +this.data.labels?.[this.data.labels.length - 1];
    const [clientX, clientY] = mousePosition;
    const { top, bottom, left, right } = this.getChartDOMClientRect();

    const isHoveredChart = inRange(clientX, left, right) && inRange(clientY, bottom, top);
    if (isHoveredChart) {
      return;
    }

    this.overlayClear();
    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    if (horizontal) {
      const chartHeight = graphPos.y2 - graphPos.y1;
      const offsetY = (chartHeight * (label - fromTime)) / (toTime - fromTime) + graphPos.y1;
      this.drawIndicator([graphPos.x2, offsetY], this.options.indicator.color);
    } else {
      const chartWidth = graphPos.x2 - graphPos.x1;
      const offsetX = (chartWidth * (label - fromTime)) / (toTime - fromTime) + graphPos.x1;
      this.drawIndicator([offsetX, graphPos.y2], this.options.indicator.color);
    }
  },

  _canDrawSyncedIndicator(horizontal, mousePosition) {
    if (!mousePosition || !!horizontal !== !!this.options.horizontal) {
      return false;
    }

    return this._isTimeBasedSyncEnabled(horizontal) && this._hasValidTimeRange();
  },

  _isTimeBasedSyncEnabled(horizontal) {
    if (this.options.syncHover === false) return false;
    if (!this.data?.labels?.length) return false;

    const timeAxes = horizontal
      ? this.options.axesY.every(({ type }) => type === 'time')
      : this.options.axesX.every(({ type }) => type === 'time');

    return timeAxes;
  },

  _hasValidTimeRange() {
    const fromTime = +this.data.labels?.[0];
    const toTime = +this.data.labels?.[this.data.labels.length - 1];
    return fromTime != null && toTime != null;
  },

  /**
   * 제공된 dataLabel과 일치하는 Label이 있다면 indicator를 그림
   * @param {object} dataLabel   data label
   * @param {object} mousePosition   mouse position
   *
   * @returns {undefined}
   */
  drawSyncedIndicatorForTooltip({ dataLabel, mousePosition }) {
    if (!this.data?.labels || !dataLabel) {
      return;
    }

    const matchingLabelIndex = this.data.labels.findIndex(
      (label) => label?.valueOf() === dataLabel?.valueOf(),
    );
    if (matchingLabelIndex === -1) {
      this.overlayClear();
      return;
    }

    const { horizontal } = this.options;
    const rect = this.getChartDOMClientRect();
    const [mouseX, mouseY] = mousePosition;
    const isHoveredChart =
      inRange(mouseX, rect.left, rect.right) && inRange(mouseY, rect.bottom, rect.top);
    if (isHoveredChart) {
      return;
    }

    this.overlayClear();

    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    const labelsCount = this.data.labels.length;
    let indicatorPosition;

    if (horizontal) {
      const chartHeight = graphPos.y2 - graphPos.y1;
      const isCategoryMode = this.options.axesY?.some((axis) => axis.categoryMode);
      const isTimeAxis = this.options.axesY?.some((axis) => axis.type === 'time');

      let positionY;
      if (isCategoryMode) {
        positionY = graphPos.y1 + (chartHeight * (matchingLabelIndex + 0.5)) / labelsCount;
      } else if (isTimeAxis) {
        // 틱 위치와 동일하게 graphMin/graphMax 사용
        const axisStep = this.axesSteps?.y?.[0];
        const graphMin = axisStep?.graphMin ?? +this.data.labels?.[0];
        const graphMax = axisStep?.graphMax ?? +this.data.labels?.[this.data.labels.length - 1];
        positionY = graphPos.y1 + (chartHeight * (+dataLabel - graphMin)) / (graphMax - graphMin);
      } else {
        positionY = graphPos.y1 + (chartHeight * matchingLabelIndex) / (labelsCount - 1);
      }
      indicatorPosition = [graphPos.x2, positionY];
    } else {
      const chartWidth = graphPos.x2 - graphPos.x1;
      const isCategoryMode = this.options.axesX?.some((axis) => axis.categoryMode);
      const isTimeAxis = this.options.axesX?.some((axis) => axis.type === 'time');

      let positionX;
      if (isCategoryMode) {
        positionX = graphPos.x1 + (chartWidth * (matchingLabelIndex + 0.5)) / labelsCount;
      } else if (isTimeAxis) {
        // 틱 위치와 동일하게 graphMin/graphMax 사용
        const axisStep = this.axesSteps?.x?.[0];
        const graphMin = axisStep?.graphMin ?? +this.data.labels?.[0];
        const graphMax = axisStep?.graphMax ?? +this.data.labels?.[this.data.labels.length - 1];
        positionX = graphPos.x1 + (chartWidth * (+dataLabel - graphMin)) / (graphMax - graphMin);
      } else {
        positionX = graphPos.x1 + (chartWidth * matchingLabelIndex) / (labelsCount - 1);
      }
      indicatorPosition = [positionX, graphPos.y2];
    }

    this.drawIndicator(indicatorPosition, this.options.indicator.color);
  },

  /**
   * Clear tooltip canvas
   *
   * @returns {undefined}
   */
  tooltipClear() {
    this.clearRectRatio = this.pixelRatio < 1 ? this.pixelRatio : 1;

    this.tooltipCtx.clearRect(
      0,
      0,
      this.tooltipCanvas.width / this.clearRectRatio,
      this.tooltipCanvas.height / this.clearRectRatio,
    );

    this.tooltipDOM.style.display = 'none';
    this.resetTooltipPlacement();
  },

  /**
   * Order series list by groups
   * @param {array} sKeys    series list that is hit by mouse cursor. (not all of series)
   *
   * @returns {array} ordered series list by groups
   */
  alignSeriesList(sKeys) {
    const groups = this.data.groups;
    const seriesList = this.seriesList;
    const result = [];

    groups.forEach((group) => {
      group
        .slice()
        .reverse()
        .forEach((sId) => {
          const series = seriesList[sId];

          if (series && series.showLegend && sKeys.includes(sId)) {
            result.push(sId);
          }
        });
    });

    Object.keys(seriesList).forEach((sId) => {
      const series = seriesList[sId];

      if (!series.isExistGrp && series.showLegend && sKeys.includes(sId)) {
        result.push(sId);
      }
    });

    return result;
  },

  tooltipDestroy() {
    this._teardownCustomTooltipVirtualScroll?.();
    if (this.tooltipDOM) {
      this.tooltipDOM.remove();
      this.tooltipDOM = null;
    }
    if (this.plotLabelTooltipDOM) {
      this.plotLabelTooltipDOM.remove();
      this.plotLabelTooltipDOM = null;
    }
    this.isInitTooltip = false;
  },
};

export { calcDomainBounds };
export default modules;
