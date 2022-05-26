import { convertToPercent } from '@/common/utils';
import debounce from '@/common/utils.debounce';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';

const TITLE_HEIGHT = 30;
const TEXT_HEIGHT = 14;
const LINE_SPACING = 8;
const COLOR_MARGIN = 16;
const VALUE_MARGIN = 50;
const SCROLL_WIDTH = 17;
let fontStyle = 'normal normal lighter 14px Roboto';

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
    this.setFontFamily();

    this.tooltipBodyDOM.appendChild(this.tooltipCanvas);
    this.tooltipDOM.appendChild(this.tooltipHeaderDOM);
    this.tooltipDOM.appendChild(this.tooltipBodyDOM);

    document.body.appendChild(this.tooltipDOM);

    if (this.options.tooltip.debouncedHide) {
      this.hideTooltipDOM = debounce(() => {
        this.tooltipDOM.style.display = 'none';
      }, 200);
    } else {
      this.hideTooltipDOM = () => {
        this.tooltipDOM.style.display = 'none';
      };
    }
  },

  /**
   * set tooltip's font style
   */
  setFontFamily() {
    const fontFamily = this.options?.tooltip?.fontFamily ?? 'Roboto';
    fontStyle = `normal normal lighter 14px ${fontFamily}`;
    this.tooltipHeaderDOM.style.fontFamily = fontFamily;
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
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const opt = this.options.tooltip;


    // calculate and decide width of canvas El(contentsWidth)
    ctx.save();
    ctx.font = fontStyle;
    const isHorizontal = !!this.options.horizontal;
    const label = isHorizontal ? items[hitInfo.hitId]?.data?.y : items[hitInfo.hitId]?.data?.x;
    const tooltipValue = label?.length > maxSeries.length ? label : maxSeries;
    const nw = Math.round(ctx.measureText(tooltipValue).width);
    const vw = Math.round(ctx.measureText(maxValue).width);
    const expectedContentsWidth = nw + vw + boxPadding.l + boxPadding.r
      + COLOR_MARGIN + VALUE_MARGIN + SCROLL_WIDTH;
    const contentsWidth = expectedContentsWidth > opt.maxWidth
      ? opt.maxWidth
      : expectedContentsWidth;


    // Calculate height of canvas El(tooltip body El) with wrapped line count
    let textLineCnt = opt.textOverflow === 'wrap' ? 0 : seriesLen;

    if (opt.textOverflow === 'wrap') {
      const seriesNameSpaceWidth = opt.maxWidth - (Math.round(ctx.measureText(maxValue).width)
        + boxPadding.l + boxPadding.r + COLOR_MARGIN + VALUE_MARGIN + SCROLL_WIDTH);

      // count wrap line
      const seriesNames = Object.values(items).map(s => s.name);
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
    const expectedContentsHeight = boxPadding.t
      + (textLineCnt * TEXT_HEIGHT)
      + (seriesLen * LINE_SPACING)
      + boxPadding.b;

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
    this.tooltipHeaderDOM.style.height = opt.textOverflow === 'wrap' ? 'auto' : `${TITLE_HEIGHT}px`;
    this.tooltipDOM.style.height = 'auto';
    this.tooltipBodyDOM.style.height = `${contentsHeight + 6}px`;


    // set tooltipDOM's positions
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;
    const distanceMouseAndTooltip = 20;
    const maximumPosX = bodyWidth - contentsWidth - distanceMouseAndTooltip;
    const maximumPosY = bodyHeight - (TITLE_HEIGHT + contentsHeight) - distanceMouseAndTooltip;
    const expectedPosX = mouseX + distanceMouseAndTooltip;
    const expectedPosY = mouseY + distanceMouseAndTooltip;
    const reversedPosX = mouseX - contentsWidth - distanceMouseAndTooltip;
    const reversedPosY = mouseY - (TITLE_HEIGHT + contentsHeight) - distanceMouseAndTooltip;
    this.tooltipDOM.style.left = expectedPosX > maximumPosX
      ? `${reversedPosX}px`
      : `${expectedPosX}px`;
    this.tooltipDOM.style.top = expectedPosY > maximumPosY
      ? `${reversedPosY}px`
      : `${expectedPosY}px`;
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
    const sId = hitInfo.hitId;
    const hitItem = items[sId].data;
    const hitAxis = items[sId].axis;
    const [, maxValue] = hitInfo.maxTip;
    const seriesKeys = this.alignSeriesList(Object.keys(items));
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;
    const titleFormatter = opt.formatter?.title;

    // draw tooltip Title(axis label) and add style class for wrap line about too much long label.
    if (this.axesX.length && this.axesY.length) {
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

    ctx.font = fontStyle;

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
          prev = isHorizontal ? a.data.x : a.data.y;
        }

        if (next === null || next === undefined) {
          next = isHorizontal ? b.data.x : b.data.y;
        }
        return next - prev;
      });
    }

    this.setTooltipDOMStyle(opt);

    let textLineCnt = 1;
    for (let ix = 0; ix < seriesList.length; ix++) {
      const gdata = seriesList[ix].data;
      const color = seriesList[ix].color;
      const name = seriesList[ix].name;
      const valueText = gdata.formatted;

      let itemX = x + 4;
      let itemY = y + (textLineCnt * TEXT_HEIGHT);
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

      // 1. Draw series color
      ctx.fillRect(itemX - 4, itemY - 12, 12, 12);
      ctx.fillStyle = opt.fontColor;

      // 2. Draw series name
      ctx.textBaseline = 'Bottom';
      const seriesNameSpaceWidth = opt.maxWidth - Math.round(ctx.measureText(maxValue).width)
        - boxPadding.l - boxPadding.r - COLOR_MARGIN - VALUE_MARGIN;
      const xPos = itemX + COLOR_MARGIN;
      const yPos = itemY;

      if (seriesNameSpaceWidth > ctx.measureText(name).width) { // draw normally
        ctx.fillText(name, xPos, yPos);
      } else if (opt.textOverflow === 'wrap') { // draw with wrap
        let line = '';
        let yPosWithWrap = yPos;

        for (let jx = 0; jx < name.length; jx++) {
          const char = name[jx];
          const temp = `${line}${char}`;

          if (ctx.measureText(temp).width > seriesNameSpaceWidth) {
            ctx.fillText(line, xPos, yPosWithWrap);
            line = char;
            textLineCnt += 1;
            yPosWithWrap += TEXT_HEIGHT;
          } else {
            line = temp;
          }
        }
        ctx.fillText(line, xPos, yPosWithWrap);
      } else { // draw with ellipsis
        const shortSeriesName = Util.truncateLabelWithEllipsis(name, seriesNameSpaceWidth, ctx);
        ctx.fillText(shortSeriesName, xPos, yPos);
      }

      ctx.save();

      // 3. Draw value
      ctx.textAlign = 'right';
      ctx.fillText(valueText, this.tooltipDOM.offsetWidth - boxPadding.r, itemY);
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
    const boxPadding = { t: 8, b: 8, r: 20, l: 16 };
    const isHorizontal = this.options.horizontal;
    const opt = this.options.tooltip;
    const titleFormatter = opt.formatter?.title;
    const series = Object.values(this.seriesList)[0];

    let isShow = false;
    const { colorState, isGradient } = series;
    if (isGradient) {
      const { min, max } = series.valueOpt;
      const ratio = convertToPercent(hitItem.o - min, max - min);
      const { start, end } = colorState[0];
      isShow = (start <= ratio && ratio <= end) || hitItem.o === -1;
    } else {
      isShow = colorState.find(({ id }) => id === hitItem.cId)?.show;
    }

    if (!isShow) {
      this.tooltipClear();
      return;
    }

    // draw tooltip Title(axis label) and add style class for wrap line about too much long label.
    if (this.axesX.length) {
      if (titleFormatter) {
        this.tooltipHeaderDOM.textContent = titleFormatter({
          x: hitItem.x,
          y: hitItem.y,
        });
      } else {
        this.tooltipHeaderDOM.textContent = this.axesX[hitAxis.x].getLabelFormat(hitItem.x);
      }
    }

    if (opt.textOverflow) {
      this.tooltipHeaderDOM.classList.add(`ev-chart-tooltip-header--${opt.textOverflow}`);
    }

    this.setTooltipDOMStyle(opt);

    // draw tooltip contents (series, value combination)
    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    if (this.tooltipBodyDOM.style.overflowY === 'auto') {
      boxPadding.r += SCROLL_WIDTH;
    }

    const itemX = boxPadding.l + 2;
    const itemY = boxPadding.t + TEXT_HEIGHT + 2;
    const valueText = hitItem.formatted;

    ctx.font = fontStyle;

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

    // 1. Draw value color
    ctx.fillRect(itemX - 4, itemY - 12, 12, 12);
    ctx.fillStyle = opt.fontColor;

    // 2. Draw value y names
    ctx.textBaseline = 'Bottom';
    if (this.axesY.length) {
      ctx.fillText(this.axesY[hitAxis.y].getLabelFormat(hitItem.y), itemX + COLOR_MARGIN, itemY);
    }

    // 3. Draw value
    ctx.textAlign = 'right';
    ctx.fillText(valueText, this.tooltipDOM.offsetWidth - boxPadding.r, itemY);
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
    const boxPadding = { t: 8, b: 8, r: 8, l: 8 };
    const opt = this.options.tooltip;

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

    ctx.font = fontStyle;

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

    let textLineCnt = 1;
    for (let ix = 0; ix < seriesList.length; ix++) {
      const gdata = seriesList[ix].data;
      const color = seriesList[ix].color;
      const name = seriesList[ix].name;
      const valueText = gdata.formatted;

      let itemX = x + 4;
      let itemY = y + (textLineCnt * TEXT_HEIGHT);
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

      // 1. Draw series color
      ctx.fillRect(itemX - 4, itemY - 12, 12, 12);
      ctx.fillStyle = opt.fontColor;

      // 2. Draw series name
      ctx.textBaseline = 'Bottom';
      const seriesNameSpaceWidth = opt.maxWidth - Math.round(ctx.measureText(maxValue).width)
        - boxPadding.l - boxPadding.r - COLOR_MARGIN - VALUE_MARGIN;
      const xPos = itemX + COLOR_MARGIN;
      const yPos = itemY;

      if (seriesNameSpaceWidth > ctx.measureText(name).width) { // draw normally
        ctx.fillText(name, xPos, yPos);
      } else if (opt.textOverflow === 'wrap') { // draw with wrap
        let line = '';
        let yPosWithWrap = yPos;

        for (let jx = 0; jx < name.length; jx++) {
          const char = name[jx];
          const temp = `${line}${char}`;

          if (ctx.measureText(temp).width > seriesNameSpaceWidth) {
            ctx.fillText(line, xPos, yPosWithWrap);
            line = char;
            textLineCnt += 1;
            yPosWithWrap += TEXT_HEIGHT;
          } else {
            line = temp;
          }
        }
        ctx.fillText(line, xPos, yPosWithWrap);
      } else { // draw with ellipsis
        const shortSeriesName = Util.truncateLabelWithEllipsis(name, seriesNameSpaceWidth, ctx);
        ctx.fillText(shortSeriesName, xPos, yPos);
      }

      ctx.save();

      // 3. Draw value
      ctx.textAlign = 'right';
      ctx.fillText(valueText, this.tooltipDOM.offsetWidth - boxPadding.r, itemY);
      ctx.restore();
      ctx.closePath();

      // 4. add lineSpacing
      y += LINE_SPACING;
      textLineCnt += 1;
    }

    ctx.restore();
  },

  /**
   * set style properties on tooltip DOM
   * @param tooltipOptions
   */
  setTooltipDOMStyle(tooltipOptions) {
    this.tooltipDOM.style.overflowY = 'hidden';
    this.tooltipDOM.style.backgroundColor = tooltipOptions.backgroundColor;
    this.tooltipDOM.style.border = `1px solid ${tooltipOptions.borderColor}`;
    this.tooltipDOM.style.color = tooltipOptions.fontColor;

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
      series.itemHighlight(hitInfo.items[sId], ctx);

      if (Util.isDoughnutHole(series.type)) {
        this.drawDoughnutHole(ctx);
      }
    });
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
    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };
    const mouseXIp = 1; // mouseInterpolation
    const mouseYIp = 10;

    if (offsetX >= (graphPos.x1 - mouseXIp) && offsetX <= (graphPos.x2 + mouseXIp)
      && offsetY >= (graphPos.y1 - mouseYIp) && offsetY <= (graphPos.y2 + mouseYIp)) {
      if (this.options.horizontal) {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(graphPos.x1, offsetY + 0.5);
        ctx.lineTo(graphPos.x2, offsetY + 0.5);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(offsetX + 0.5, graphPos.y1);
        ctx.lineTo(offsetX + 0.5, graphPos.y2);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
      }
    }
  },

  /**
   * Clear tooltip canvas
   *
   * @returns {undefined}
   */
  tooltipClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width / this.clearRectRatio,
      this.tooltipCanvas.height / this.clearRectRatio);

    this.tooltipDOM.style.display = 'none';
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
      group.slice().reverse().forEach((sId) => {
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
};

export default modules;
