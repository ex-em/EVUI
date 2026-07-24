import { defaultsDeep } from 'lodash-es';
import Canvas from '@/components/chart/helpers/helpers.canvas';
import { truthyNumber } from '@/common/utils';
import {
  AXIS_OPTION,
  AXIS_UNITS,
  PLOT_LINE_OPTION,
  PLOT_LINE_LABEL_OPTION,
  PLOT_BAND_OPTION,
} from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';

class Scale {
  constructor(type, axisOpt, ctx, options) {
    const merged = defaultsDeep({}, axisOpt, AXIS_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    this.type = type;
    this.ctx = ctx;
    this.units = AXIS_UNITS[this.type];
    this.options = options;

    if (!this.position) {
      this.position = type === 'x' ? 'bottom' : 'left';
    }
  }

  /**
   * Calculate axis's min/max label steps
   * @param {string} type           axis direction ('x', 'y')
   * @param {object} chartRect      chart size information
   * @param {object} labelOffset    chart label offset information
   * @param {number} tickSize       label's size
   *
   * @returns {object} label range
   */
  calculateLabelRange(type, chartRect, labelOffset, tickSize) {
    let chartSize;
    let axisOffset;
    let bufferedTickSize;

    if (type === 'x') {
      chartSize = chartRect.chartWidth;
      bufferedTickSize = Math.floor(tickSize * 1.2);
      axisOffset = [labelOffset.left, labelOffset.right];
    } else {
      chartSize = chartRect.chartHeight;
      axisOffset = [labelOffset.top, labelOffset.bottom];
      bufferedTickSize = tickSize + Math.floor(chartSize * 0.1);
    }

    const drawRange = chartSize - (axisOffset[0] + axisOffset[1]);
    const minSteps = 1;
    const maxSteps = Math.max(Math.floor(drawRange / bufferedTickSize), 1);

    return {
      min: minSteps,
      max: maxSteps,
    };
  }

  /**
   * Calculate min/max value, label and size information for axis
   * @param {object} minMax    min/max information
   * @param {object} scrollbarOpt scrollbar option
   *
   * @returns {object} min/max value and label
   */
  calculateScaleRange(minMax, scrollbarOpt) {
    let maxValue;
    let minValue;
    let isDefaultMaxSameAsMin = false;

    const range = scrollbarOpt?.use ? scrollbarOpt?.range : this.range;
    if (Array.isArray(range) && range?.length === 2) {
      if (this.options.type === 'heatMap') {
        maxValue = range[1] > +minMax.max ? +minMax.max : range[1];
        minValue = range[0] < +minMax.min ? +minMax.min : range[0];
      } else {
        maxValue = range[1];
        minValue = range[0];
      }
    } else if (typeof range === 'function') {
      [minValue, maxValue] = range(minMax.min, minMax.max);
    } else {
      maxValue = minMax.max;
      minValue = minMax.min;
    }

    if (this.autoScaleRatio) {
      maxValue = Math.ceil(maxValue * (this.autoScaleRatio + 1));
    }

    if (this.startToZero) {
      minValue = 0;
    }

    if (maxValue === minValue) {
      maxValue += 1;
      isDefaultMaxSameAsMin = true;
    }

    const minLabel = this.getLabelFormat(minValue);
    const maxLabel = this.getLabelFormat(maxValue, {
      isMaxValueSameAsMin: isDefaultMaxSameAsMin,
    });

    return {
      min: minValue,
      max: maxValue,
      minLabel,
      maxLabel,
      size: Util.calcTextSizeCanvas(
        maxLabel,
        Util.getLabelStyle(this.labelStyle),
        this.labelStyle?.padding,
      ),
    };
  }

  /**
   * return width what has max length
   * @param {string[]} notFormattedLabels
   * @param {object} chartRect - unused in base class, used in StepScale override
   * @param {string[]} extraFormattedLabels - 정수 라벨이 소수로 바뀔 때의 너비 팽창을 사전에 반영한다.
   * @reutrn number maxWidth
   */
  // eslint-disable-next-line no-unused-vars
  getLabelWidthHasMaxLength(notFormattedLabels, chartRect, extraFormattedLabels = []) {
    const labelStyle = Util.getLabelStyle(this.labelStyle);
    const formatted = (notFormattedLabels ?? []).map(label => this.getLabelFormat(label));
    const allLabels = [...formatted, ...extraFormattedLabels];

    return allLabels.reduce((max, formattedLabel) => {
      const width = Util.calcTextSizeCanvas(formattedLabel, labelStyle)?.width ?? 0;
      return Math.max(max, width);
    }, 0);
  }

  /**
   * With range information, calculate how many labels in axis
   * linear type은 scale.linear.js에서 처리
   * @param {object} range    min/max information
   *
   * @returns {object} steps, interval, min/max graph value
   */
  calculateSteps(range) {
    const { maxValue, minValue } = range;
    let { maxSteps } = range;

    let interval = this.getInterval(range);
    let increase = minValue;
    let numberOfSteps;

    while (increase < maxValue) {
      increase += interval;
    }

    const graphMax = increase;
    const graphMin = minValue;
    const graphRange = graphMax - graphMin;

    numberOfSteps = Math.round(graphRange / interval);

    if (maxValue === 1) {
      if (!this.decimalPoint) {
        interval = 1;
        numberOfSteps = 1;
        maxSteps = 1;
      } else if (maxSteps > 2) {
        interval = 0.2;
        numberOfSteps = 5;
        maxSteps = 5;
      } else {
        interval = 0.5;
        numberOfSteps = 2;
        maxSteps = 2;
      }
    }

    if (this.fixedSteps) {
      return {
        steps: numberOfSteps,
        interval,
        graphMin,
        graphMax,
      };
    }

    while (numberOfSteps > maxSteps) {
      interval *= 2;
      numberOfSteps = Math.round(graphRange / interval);
      interval = Math.ceil(graphRange / numberOfSteps);
    }

    if (graphMax - graphMin > numberOfSteps * interval) {
      interval = Math.ceil((graphMax - graphMin) / numberOfSteps);
    }

    return {
      steps: numberOfSteps,
      interval,
      graphMin,
      graphMax,
    };
  }

  /**
   * Draw Axis Title
   *
   * @param {object} chartRect      min/max information
   * @param {object} labelOffset    label offset information
   *
   * @returns {undefined}
   */
  drawAxisTitle(chartRect, labelOffset) {
    const titleOpt = this.title;

    if (!titleOpt?.use || isNaN(titleOpt.fontSize)) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.font = Util.getLabelStyle(titleOpt);
    ctx.fillStyle = titleOpt.color;
    ctx.textAlign = titleOpt.textAlign;

    const axisLinePosition = {
      xLeft: chartRect.x1 + labelOffset.left,
      xRight: chartRect.x2 - labelOffset.right,
      yTop: chartRect.y1,
    };

    let titleXPos;
    let titleYPos;

    const margin = 10;
    if (this.type === 'x') {
      titleXPos = axisLinePosition.xRight;
      titleYPos = chartRect.y2 + titleOpt.fontSize + margin;
    } else {
      titleYPos = axisLinePosition.yTop - titleOpt.fontSize - margin;
      titleXPos = axisLinePosition.xLeft;
    }

    if (titleXPos > 0 && titleYPos > 0) {
      ctx.fillText(titleOpt.text, titleXPos, titleYPos);
    }

    ctx.restore();
  }

  /**
   * Draw axis
   * @param {object} chartRect      min/max information
   * @param {object} labelOffset    label offset information
   * @param {object} stepInfo       label steps information
   * @param {object} hitInfo        hit information
   * @param {object} selectLabelInfo selected label information
   * @param {object} dataLabels     data label information, x axis only
   *
   * @returns {undefined}
   */
  draw(chartRect, labelOffset, stepInfo, hitInfo, selectLabelInfo, dataLabels) {
    const ctx = this.ctx;
    const options = this.options;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const steps = stepInfo.steps;
    const axisMin = stepInfo.graphMin;
    const axisMax = stepInfo.graphMax;
    const stepValue = stepInfo.interval;

    const startPoint = aPos[this.units.rectStart];
    const endPoint = aPos[this.units.rectEnd];
    const offsetPoint = aPos[this.units.rectOffset(this.position)];
    const offsetCounterPoint = aPos[this.units.rectOffsetCounter(this.position)];

    const AXIS_TICK_LENGTH = 5;

    let aliasPixel;

    this.drawAxisTitle(chartRect, labelOffset);

    // label font 설정
    ctx.font = Util.getLabelStyle(this.labelStyle);
    ctx.fillStyle = this.labelStyle.color;

    if (this.type === 'x') {
      ctx.textAlign = 'center';
      ctx.textBaseline = this.position === 'top' ? 'bottom' : 'top';
    } else {
      ctx.textAlign = this.position === 'left' ? 'right' : 'left';
      ctx.textBaseline = 'middle';
    }

    if (this.showAxis) {
      ctx.lineWidth = this.axisLineWidth;
      aliasPixel = Util.aliasPixel(ctx.lineWidth);

      ctx.beginPath();
      ctx.strokeStyle = this.axisLineColor;

      if (this.type === 'x') {
        ctx.moveTo(startPoint, offsetPoint + aliasPixel);
        ctx.lineTo(endPoint, offsetPoint + aliasPixel);
      } else {
        ctx.moveTo(offsetPoint + aliasPixel, startPoint);
        ctx.lineTo(offsetPoint + aliasPixel, endPoint);
      }
      ctx.stroke();
      ctx.closePath();
    }

    if (steps === 0 || axisMin === null) {
      return;
    }

    if (this.labelStyle?.show) {
      const distance = endPoint - startPoint;
      const labelGap = distance / steps;
      const ticks = [];
      const size = stepInfo.interval;
      let labelCenter = null;
      let linePosition = null;
      let offsetStartPoint = startPoint;
      let axisMinForLabel = axisMin;

      if (this.type === 'x' && options?.axesX[0].flow && dataLabels.length !== steps + 1) {
        const axisMinByMinutes = Math.floor(axisMin / size) * size;
        if (axisMinByMinutes !== +axisMin) {
          axisMinForLabel = axisMinByMinutes + size;
          offsetStartPoint += (distance / (axisMax - axisMin)) * (axisMinForLabel - axisMin);
        }
      }

      ctx.strokeStyle = this.gridLineColor;
      ctx.lineWidth = 1;
      aliasPixel = Util.aliasPixel(ctx.lineWidth);

      let labelText;
      for (let ix = 0; ix <= steps; ix++) {
        labelCenter = Math.round(offsetStartPoint + labelGap * ix);

        if (
          labelCenter <= endPoint ||
          this.type !== 'x' ||
          !options?.axesX[0].flow ||
          dataLabels.length === steps + 1
        ) {
          ctx.beginPath();
          ticks[ix] = axisMinForLabel + ix * stepValue;

          const isZeroLine = ticks[ix] === 0;
          if (isZeroLine && this.zeroLineColor) {
            ctx.strokeStyle = this.zeroLineColor;
          } else {
            ctx.strokeStyle = this.gridLineColor;
          }

          linePosition = labelCenter + aliasPixel;
          labelText = this.getLabelFormat(Math.min(axisMax, ticks[ix]), {
            prev: ticks[ix - 1] ?? '',
          });

          const isBlurredLabel =
            this.options?.selectLabel?.use &&
            this.options?.selectLabel?.useLabelOpacity &&
            this.options.horizontal === (this.type === 'y') &&
            selectLabelInfo?.dataIndex?.length &&
            !selectLabelInfo?.label
              .map((t) =>
                this.getLabelFormat(Math.min(axisMax, t), {
                  prev: ticks[ix - 1] ?? '',
                }),
              )
              .includes(labelText);

          let labelColor;
          if (ix === steps && this.lastLabelFontStyle) {
            ctx.font = Util.getLabelStyle(this.lastLabelFontStyle);
            labelColor = this.lastLabelFontStyle.color;
          } else if (ix === 0 && this.firstLabelFontStyle) {
            ctx.font = Util.getLabelStyle(this.firstLabelFontStyle);
            labelColor = this.firstLabelFontStyle.color;
          } else {
            ctx.font = Util.getLabelStyle(this.labelStyle);
            labelColor = this.labelStyle.color;
          }

          let defaultOpacity = 1;

          if (Util.getColorStringType(labelColor) === 'RGBA') {
            defaultOpacity = Util.getOpacity(labelColor);
          }

          ctx.fillStyle = Util.colorStringToRgba(
            labelColor,
            isBlurredLabel ? this.options?.unSelectedOpacity : defaultOpacity,
          );

          let labelPoint;

          if (this.type === 'x') {
            labelPoint = this.position === 'top' ? offsetPoint - 10 : offsetPoint + 10;
            if (options?.brush?.showLabel || !options?.brush) {
              ctx.fillText(this.checkFixWidth(labelText), labelCenter, labelPoint);
            }

            if (
              !isBlurredLabel &&
              options?.selectItem?.showLabelTip &&
              hitInfo?.label &&
              !this.options?.horizontal
            ) {
              const selectedLabel = this.getLabelFormat(
                Math.min(axisMax, hitInfo.label + 0 * stepValue),
              );
              if (selectedLabel === labelText) {
                const height = Math.round(ctx.measureText(this.labelStyle?.fontSize).width);
                Util.showLabelTip({
                  ctx: this.ctx,
                  width: Math.round(ctx.measureText(selectedLabel).width) + 10,
                  height,
                  x: labelCenter,
                  y: labelPoint + (height - 2),
                  borderRadius: 2,
                  arrowSize: 3,
                  text: labelText,
                  backgroundColor: options?.selectItem?.labelTipStyle?.backgroundColor,
                  textColor: options?.selectItem?.labelTipStyle?.textColor,
                });
              }
            }

            if (this.showAxisTick) {
              ctx.beginPath();
              ctx.strokeStyle = this.axisLineColor;
              ctx.moveTo(linePosition, offsetPoint);
              ctx.lineTo(linePosition, offsetPoint + AXIS_TICK_LENGTH);
              ctx.stroke();
              ctx.closePath();
            }

            if ((ix !== 0 || options?.axesX[0].flow) && this.showGrid) {
              ctx.beginPath();
              ctx.strokeStyle = this.gridLineColor;
              ctx.moveTo(linePosition, offsetPoint);
              ctx.lineTo(linePosition, offsetCounterPoint);
              ctx.stroke();
              ctx.closePath();
            }
          } else {
            labelPoint = this.position === 'left' ? offsetPoint - 10 : offsetPoint + 10;
            if (options?.brush?.showLabel || !options?.brush) {
              ctx.fillText(this.checkFixWidth(labelText), labelPoint, labelCenter);
            }

            if (ix === steps) {
              linePosition -= 1;
            }

            if (this.showAxisTick) {
              ctx.beginPath();
              ctx.strokeStyle = this.axisLineColor;
              ctx.moveTo(offsetPoint + (this.axisLineWidth ?? 1), linePosition);
              ctx.lineTo(offsetPoint - AXIS_TICK_LENGTH, linePosition);
              ctx.stroke();
              ctx.closePath();
            }

            if (ix !== 0 && this.showGrid) {
              ctx.beginPath();
              ctx.strokeStyle = this.gridLineColor;
              ctx.moveTo(offsetPoint, linePosition);
              ctx.lineTo(offsetCounterPoint, linePosition);
              ctx.stroke();
              ctx.closePath();
            }
          }
        }
      }
    }

    // plot(line/band/label)은 front 패스(drawPlots)로 분리 — 여기선 geometry 만 캐시한다.
    // (z-order: series 위·maxTip 아래. chart.core.drawForeground 에서 drawTip 앞에 호출)
    if (this.plotBands?.length || this.plotLines?.length) {
      this._plotGeom = { aPos, axisMin, axisMax, aliasPixel, chartRect, labelOffset };
    }
  }

  /**
   * plotLine/plotBand/label 그리기 (front 패스). draw() 가 캐시한 _plotGeom 으로 그린다.
   * ctx 는 호출부(chart.core.drawPlotsFront)가 axis.ctx 로 주입(main=buffer, worker=display).
   *
   * @returns {undefined}
   */
  drawPlots() {
    if (!(this.plotBands?.length || this.plotLines?.length) || !this._plotGeom) {
      return;
    }

    const { aPos, axisMin, axisMax, aliasPixel, chartRect, labelOffset } = this._plotGeom;
    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const padding = aliasPixel + 1;
    const minX = aPos.x1;
    const maxX = aPos.x2 + padding;
    const minY = aPos.y1 - padding; // top
    const maxY = aPos.y2; // bottom
    const bounds = { minX, maxX, minY, maxY };
    this.plotLabelHitRegions = [];

    this.plotBands?.forEach((plotBand) => {
      const mergedPlotBandOpt = defaultsDeep({}, plotBand, PLOT_BAND_OPTION);
      const {
        from: userDefinedFrom,
        to: userDefinedTo,
        label: labelOpt,
        border,
      } = mergedPlotBandOpt;
      const from = !Util.isNullOrUndefined(userDefinedFrom)
        ? Math.max(userDefinedFrom, axisMin)
        : axisMin;
      const to = !Util.isNullOrUndefined(userDefinedTo)
        ? Math.min(userDefinedTo, axisMax)
        : axisMax;

      let fromPos;
      let toPos;
      if (this.type === 'x') {
        fromPos = Canvas.calculateX(from, axisMin, axisMax, xArea, minX);
        toPos = Canvas.calculateX(to, axisMin, axisMax, xArea, minX);

        if (fromPos === null || toPos === null) {
          return;
        }

        this.setPlotBandStyle(mergedPlotBandOpt);
        this.drawXPlotBand(fromPos, toPos, minX, maxX, minY, maxY, border);
      } else {
        fromPos = Canvas.calculateY(from, axisMin, axisMax, yArea, maxY);
        toPos = Canvas.calculateY(to, axisMin, axisMax, yArea, maxY);

        if (fromPos === null || toPos === null) {
          return;
        }

        this.setPlotBandStyle(mergedPlotBandOpt);
        this.drawYPlotBand(fromPos, toPos, minX, maxX, minY, maxY, border);
      }

      this.drawPlotBandLabel(fromPos, toPos, labelOpt, bounds, chartRect, from, to);
    });

    this.plotLines?.forEach((plotLine) => {
      if (!Number.isFinite(+plotLine.value)) {
        return;
      }

      const mergedPlotLineOpt = defaultsDeep({}, plotLine, PLOT_LINE_OPTION);
      const { value, label: labelOpt } = mergedPlotLineOpt;

      let dataPos;
      if (this.type === 'x') {
        dataPos = Canvas.calculateX(value, axisMin, axisMax, xArea, minX);

        if (dataPos === null) {
          return;
        }

        this.setPlotLineStyle(mergedPlotLineOpt);
        this.drawXPlotLine(dataPos, minX, maxX, minY, maxY);
      } else {
        dataPos = Canvas.calculateY(value, axisMin, axisMax, yArea, maxY);

        if (dataPos === null) {
          return;
        }

        this.setPlotLineStyle(mergedPlotLineOpt);
        this.drawYPlotLine(dataPos, minX, maxX, minY, maxY);
      }

      this.drawPlotLineLabel(dataPos, labelOpt, bounds, chartRect, value);
    });
  }

  /**
   * Set plot line style
   * @param {object} plotLine      plotLine Options
   *
   * @returns {undefined}
   */
  setPlotLineStyle(plotLine) {
    const ctx = this.ctx;
    const { color, lineWidth } = plotLine;

    ctx.beginPath();
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.setLineDash(plotLine.segments ?? []);
  }

  /**
   * Set plot band style
   * @param {object} plotBand      plotBand Options
   *
   * @returns {undefined}
   */
  setPlotBandStyle(plotBand) {
    const ctx = this.ctx;
    const { color } = plotBand;

    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = color;
  }

  /**
   * Draw X Plot band
   * @param {number} fromDataX     From data's X Position
   * @param {number} toDataX       To data's X Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawXPlotBand(fromDataX, toDataX, minX, maxX, minY, maxY, border) {
    const ctx = this.ctx;

    if (!Number.isFinite(fromDataX) || !Number.isFinite(toDataX)) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(fromDataX, minY);
    ctx.lineTo(fromDataX, maxY);
    ctx.lineTo(toDataX, maxY);
    ctx.lineTo(toDataX, minY);
    ctx.lineTo(fromDataX, minY);

    ctx.fill();

    this.drawPlotBandBorder(border, [
      [fromDataX, minY, fromDataX, maxY],
      [toDataX, minY, toDataX, maxY],
    ]);

    ctx.restore();
    ctx.closePath();
  }

  /**
   * Draw X Plot line
   * @param {number} dataX         Data's X Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawXPlotLine(dataX, minX, maxX, minY, maxY) {
    const ctx = this.ctx;

    if (!Number.isFinite(dataX) || dataX < minX || dataX > maxX) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    let dataXPos = dataX;
    dataXPos += Util.aliasPixel(ctx.lineWidth);

    ctx.moveTo(dataXPos, maxY);
    ctx.lineTo(dataXPos, minY);

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * Draw Y Plot line
   * @param {number} dataY         Data's Y Position
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawYPlotLine(dataY, minX, maxX, minY, maxY) {
    const ctx = this.ctx;

    if (!Number.isFinite(dataY) || dataY > maxY || dataY < minY) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    let dataYPos = dataY;
    dataYPos += Util.aliasPixel(ctx.lineWidth);

    ctx.moveTo(minX, dataYPos);
    ctx.lineTo(maxX, dataYPos);

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * Draw Y Plot band
   * @param {number} fromDataY     From data's Y Position (bottom)
   * @param {number} toDataY       To data's Y Position (top)
   * @param {number} minX          Min X Position
   * @param {number} maxX          Max X Position
   * @param {number} minY          Min Y Position
   * @param {number} maxY          Max Y Position
   *
   * @returns {undefined}
   */
  drawYPlotBand(fromDataY, toDataY, minX, maxX, minY, maxY, border) {
    const ctx = this.ctx;

    if (!Number.isFinite(fromDataY) || !Number.isFinite(toDataY)) {
      ctx.closePath();
      ctx.restore();
      return;
    }

    ctx.moveTo(minX, fromDataY);
    ctx.lineTo(minX, toDataY);
    ctx.lineTo(maxX, toDataY);
    ctx.lineTo(maxX, fromDataY);
    ctx.lineTo(minX, fromDataY);

    ctx.fill();

    this.drawPlotBandBorder(border, [
      [minX, fromDataY, maxX, fromDataY],
      [minX, toDataY, maxX, toDataY],
    ]);

    ctx.restore();
    ctx.closePath();
  }

  /**
   * Stroke plot band's start/end edges with the given border style
   * @param {object|null} border   { color, width, segments }
   * @param {Array<number[]>} edges  각 edge 의 [x1, y1, x2, y2]
   *
   * @returns {undefined}
   */
  drawPlotBandBorder(border, edges) {
    if (!border || !(border.width > 0)) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = border.color ?? '#000000';
    ctx.lineWidth = border.width;
    ctx.setLineDash(border.segments ?? []);

    edges.forEach(([x1, y1, x2, y2]) => {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    });

    ctx.stroke();
    ctx.restore();
  }

  /**
   * get normalized options for plot label
   * @param {object} chartRect     chartRect
   * @param {object} labelOpt      plotLine label Options
   * @param {number} [value]       표시할 임계값(축 formatter 적용). null 이면 value 미표기
   *
   * @returns {object}
   */
  getNormalizedLabelOptions(chartRect, labelOpt, value = null) {
    const merged = defaultsDeep({}, labelOpt, PLOT_LINE_LABEL_OPTION);

    const ctx = this.ctx;
    const { maxWidth, responsive } = merged;
    const fontSize = merged.fontSize > 20 ? 20 : merged.fontSize;

    // 반응형 3단계 판정 (plot 너비 기준)
    const plotWidth = chartRect.chartWidth;
    const valueOnlyBelow = responsive?.valueOnlyBelow;
    const hideBelow = responsive?.hideBelow;
    const hidden = !Util.isNullOrUndefined(hideBelow) && plotWidth < hideBelow;
    const valueOnly =
      !hidden && !Util.isNullOrUndefined(valueOnlyBelow) && plotWidth < valueOnlyBelow;

    // 텍스트 결정 (alias=text, value=라벨 valueFormatter 우선, 없으면 축 formatter)
    const aliasText = merged.text != null ? String(merged.text) : '';
    const hasValue = !Util.isNullOrUndefined(value) && Number.isFinite(+value);
    // valueFormatter 계약은 (value) => string. 단, return 누락 등으로 null/undefined 를 반환하면
    // 리터럴 "null"/"undefined" 가 라벨에 그려지므로 축 formatter 로 폴백한다.
    // (number 등 그 외 반환값은 String() 으로 변환해 계산 결과를 살린다 — 축 formatter 폴백 아님)
    let formattedValue = '';
    if (merged.showValue && hasValue) {
      if (typeof merged.valueFormatter === 'function') {
        const custom = merged.valueFormatter(value);
        formattedValue = custom == null ? String(this.getLabelFormat(value)) : String(custom);
      } else {
        formattedValue = String(this.getLabelFormat(value));
      }
    }

    let label;
    if (merged.showValue) {
      label = valueOnly ? formattedValue : [aliasText, formattedValue].filter((t) => t).join(' ');
    } else {
      label = aliasText;
    }

    // 정확한 폭 측정을 위해 라벨 폰트를 먼저 적용 (save/restore 로 부수효과 차단)
    ctx.save();
    ctx.font = Util.getLabelStyle({ ...merged, fontSize });
    let displayLabel = label;
    let labelWidth = maxWidth ?? ctx.measureText(displayLabel).width;

    const plotLabelAreaWidth =
      this.type === 'y' ? chartRect.width - chartRect.chartWidth : (maxWidth ?? chartRect.width);

    if (
      merged.position === 'outside' &&
      plotLabelAreaWidth < ctx.measureText(displayLabel).width &&
      merged.textOverflow === 'ellipsis'
    ) {
      displayLabel = Util.truncateLabelWithEllipsis(label, plotLabelAreaWidth, ctx);
      labelWidth = ctx.measureText(displayLabel).width;
    }
    ctx.restore();

    // padding: number(단축) 또는 { top, right, bottom, left }(차트 padding·tooltip rowPadding 과 동일 형식)
    const defaultPad = fontSize / 4;
    const padOpt = merged.padding;
    let padTop = defaultPad;
    let padRight = defaultPad;
    let padBottom = defaultPad;
    let padLeft = defaultPad;
    if (typeof padOpt === 'number') {
      padTop = padOpt;
      padRight = padOpt;
      padBottom = padOpt;
      padLeft = padOpt;
    } else if (padOpt && typeof padOpt === 'object') {
      padTop = padOpt.top ?? defaultPad;
      padRight = padOpt.right ?? defaultPad;
      padBottom = padOpt.bottom ?? defaultPad;
      padLeft = padOpt.left ?? defaultPad;
    }

    return {
      ...merged,
      label: displayLabel,
      fontSize,
      labelWidth,
      padTop,
      padRight,
      padBottom,
      padLeft,
      lineGap: merged.gap != null ? merged.gap : defaultPad + 2, // 임계선↔박스 간격(gap 옵션 우선)
      borderRadius: Math.max(0, merged.borderRadius ?? 0),
      hidden,
      valueOnly,
      hoverText: aliasText, // value-only hover tooltip 에 표시할 원본 텍스트
    };
  }

  /**
   * Calculate position of plot band's label
   * @param {object} fromPos       from data position
   * @param {object} toPos         to data position
   * @param {object} labelOpt      label options
   * @param {object} maxX          max x position
   * @param {object} minY          min y position
   *
   * @returns {object}
   */
  getPlotBandLabelPosition(fromPos, toPos, labelOpt, bounds) {
    const { fontSize, labelWidth, padTop, padRight, padBottom, padLeft, position } = labelOpt;
    const { maxX } = bounds;

    if (fontSize <= 0) {
      return null;
    }

    const center = (fromPos + toPos) / 2;

    // X축(세로 밴드): 단일 라벨은 항상 plot 위(top), 밴드 중앙 기준 textAlign
    if (this.type === 'x') {
      return this.computeTopLabelBox(center, labelOpt, bounds);
    }

    // Y축 plot 안 배치: 밴드 중앙을 선처럼 취급
    if (position === 'innerStart' || position === 'innerEnd') {
      return this.computeInnerLabelBox(center, labelOpt, bounds);
    }

    // Y축 기존 바깥(우측 여백): plot 우측 끝(maxX) 바로 바깥에 박스를 두고 텍스트는 박스 안 중앙 정렬.
    const boxWidth = labelWidth + padLeft + padRight;
    const boxHeight = fontSize + padTop + padBottom;
    const left = maxX + padLeft;
    const right = left + boxWidth;
    let anchorY;
    switch (labelOpt.verticalAlign) {
      case 'top':
        anchorY = toPos;
        break;
      case 'bottom':
        anchorY = fromPos;
        break;
      case 'middle':
      default:
        anchorY = (fromPos + toPos) / 2;
        break;
    }
    const top = anchorY - boxHeight / 2;
    const bottom = anchorY + boxHeight / 2;

    return {
      textX: left + padLeft + labelWidth / 2,
      textY: top + padTop + fontSize / 2,
      textAlign: 'center',
      textBaseline: 'middle',
      box: { left, top, right, bottom },
      pointerEdge: 'left',
    };
  }

  /**
   * Calculate position of plot line's label
   * @param {object} dataPos       data position
   * @param {object} labelOpt      label options
   * @param {object} maxX          max x position
   * @param {object} minY          min y position
   *
   * @returns {undefined}
   */
  getPlotLineLabelPosition(dataPos, labelOpt, bounds) {
    const { fontSize, labelWidth, padTop, padRight, padBottom, padLeft, position } = labelOpt;
    const { maxX } = bounds;

    if (fontSize <= 0) {
      return null;
    }

    // X축(세로선): 항상 plot 위(top) + textAlign(좌/센터/우). position/verticalAlign 무시
    if (this.type === 'x') {
      return this.computeTopLabelBox(dataPos, labelOpt, bounds);
    }

    // Y축 plot 안 배치
    if (position === 'innerStart' || position === 'innerEnd') {
      return this.computeInnerLabelBox(dataPos, labelOpt, bounds);
    }

    // Y축 기존 바깥(우측 여백): plot 우측 끝(maxX) 바로 바깥에 박스를 두고 텍스트는 박스 안 중앙 정렬.
    // (textAlign:'left' + textX=maxX+labelWidth 는 텍스트가 박스를 넘어 우측 여백 밖으로 나가 안 보였음)
    const boxWidth = labelWidth + padLeft + padRight;
    const boxHeight = fontSize + padTop + padBottom;
    const left = maxX + padLeft;
    const right = left + boxWidth;
    let top;
    let bottom;
    switch (labelOpt.verticalAlign) {
      case 'top': // 선 위
        bottom = dataPos;
        top = bottom - boxHeight;
        break;
      case 'bottom': // 선 아래
        top = dataPos;
        bottom = top + boxHeight;
        break;
      case 'middle':
      default:
        top = dataPos - boxHeight / 2;
        bottom = dataPos + boxHeight / 2;
        break;
    }

    return {
      textX: left + padLeft + labelWidth / 2,
      textY: top + padTop + fontSize / 2,
      textAlign: 'center',
      textBaseline: 'middle',
      box: { left, top, right, bottom },
      pointerEdge: 'left',
    };
  }

  /**
   * X축 plot 라벨 박스 레이아웃 계산 — 항상 plot 위(top)에 배치하고 세로선(lineX) 기준
   * textAlign(좌/센터/우)으로 가로 정렬한다. 꼬리(pointer)는 아래로, 끝은 선(lineX)을 가리킨다.
   * @param {number} lineX     세로 임계선 x 좌표
   * @param {object} labelOpt  정규화된 라벨 옵션
   * @param {object} bounds    { minX, maxX, minY, maxY }
   *
   * @returns {object}
   */
  computeTopLabelBox(lineX, labelOpt, bounds) {
    const { labelWidth, fontSize, padTop, padRight, padBottom, padLeft, textAlign } = labelOpt;
    const { minY } = bounds;
    const boxWidth = labelWidth + padLeft + padRight;
    const boxHeight = fontSize + padTop + padBottom;
    // 박스 하단을 plot 상단 위로 띄워 꼬리 공간 확보. X축 라벨은 선에 조금 더 가깝게 내림.
    // gap 옵션 지정 시 그 값을, 아니면 기본 2px.
    const topGap = labelOpt.gap != null ? labelOpt.gap : 2;
    const bottom = minY - topGap;
    const top = bottom - boxHeight;

    // 좌/우 정렬 시 박스 모서리를 세로선에 바로 붙여 꼬리가 짧고 곧게 떨어지도록 한다.
    // (gap 만큼 띄우면 꼬리 밑변이 borderRadius+halfBase 인셋까지 밀려 길고 가늘게 슬랜트됨)
    const sideGap = 0;

    let left;
    let right;
    switch (textAlign) {
      case 'left': // 선 왼쪽
        right = lineX - sideGap;
        left = right - boxWidth;
        break;
      case 'right': // 선 오른쪽
        left = lineX + sideGap;
        right = left + boxWidth;
        break;
      default: // center
        left = lineX - boxWidth / 2;
        right = lineX + boxWidth / 2;
        break;
    }

    return {
      textX: left + padLeft + labelWidth / 2,
      textY: top + padTop + fontSize / 2,
      textAlign: 'center',
      textBaseline: 'middle',
      box: { left, top, right, bottom },
      pointerEdge: 'bottom',
      pointerTipX: lineX, // 꼬리 끝이 세로선을 가리킴
    };
  }

  /**
   * plot 안(좌/우 끝) 라벨 박스 레이아웃 계산.
   * 임계선(가로 또는 세로)을 기준으로 박스를 plot 안쪽 좌/우 끝에 배치하고 텍스트를 중앙 정렬한다.
   * @param {number} linePos   임계선 위치(type y → y좌표, type x → x좌표)
   * @param {object} labelOpt  정규화된 라벨 옵션
   * @param {object} bounds    { minX, maxX, minY, maxY }
   *
   * @returns {object}
   */
  computeInnerLabelBox(linePos, labelOpt, bounds) {
    const {
      labelWidth,
      fontSize,
      padTop,
      padRight,
      padBottom,
      padLeft,
      lineGap: gap,
      position,
      verticalAlign,
      textAlign,
    } = labelOpt;
    const { minX, maxX, minY, maxY } = bounds;
    const boxWidth = labelWidth + padLeft + padRight;
    const boxHeight = fontSize + padTop + padBottom;

    let left;
    let top;
    let right;
    let bottom;

    if (this.type === 'x') {
      // 세로 임계선: innerStart=상단, innerEnd=하단
      if (position === 'innerEnd') {
        bottom = maxY - gap;
        top = bottom - boxHeight;
      } else {
        top = minY + gap;
        bottom = top + boxHeight;
      }

      switch (textAlign) {
        case 'left':
          left = linePos + gap;
          right = left + boxWidth;
          break;
        case 'right':
          right = linePos - gap;
          left = right - boxWidth;
          break;
        default:
          left = linePos - boxWidth / 2;
          right = linePos + boxWidth / 2;
          break;
      }
    } else {
      // 가로 임계선: innerStart=좌측, innerEnd=우측
      if (position === 'innerEnd') {
        right = maxX - gap;
        left = right - boxWidth;
      } else {
        left = minX + gap;
        right = left + boxWidth;
      }

      switch (verticalAlign) {
        case 'top':
          bottom = linePos - gap;
          top = bottom - boxHeight;
          break;
        case 'bottom':
          top = linePos + gap;
          bottom = top + boxHeight;
          break;
        default:
          top = linePos - boxHeight / 2;
          bottom = linePos + boxHeight / 2;
          break;
      }
    }

    // 말풍선 꼬리 방향(자동): 선의 반대편 박스 변에서 선을 향해
    let pointerEdge;
    if (this.type === 'x') {
      pointerEdge = position === 'innerEnd' ? 'top' : 'bottom';
    } else if (verticalAlign === 'top') {
      pointerEdge = 'bottom';
    } else if (verticalAlign === 'bottom') {
      pointerEdge = 'top';
    } else {
      pointerEdge = null; // middle: 박스가 선 위에 걸침 → 꼬리 없음
    }

    return {
      // 텍스트는 padding 을 제외한 content 영역 중앙에 정렬
      textX: left + padLeft + labelWidth / 2,
      textY: top + padTop + fontSize / 2,
      textAlign: 'center',
      textBaseline: 'middle',
      box: { left, top, right, bottom },
      pointerEdge,
    };
  }

  /**
   * Calculate Values for drawing label
   * @param {object} labelOptions  plot line Label Options
   * @param {object} positions     x, y Position
   *
   * @returns {undefined}
   */
  drawPlotLabel(labelOptions, positions) {
    if (!positions) {
      return;
    }

    const { textX, textY, textAlign = 'left', textBaseline = 'alphabetic', box } = positions;
    const {
      label,
      fontSize,
      fontColor,
      fillColor,
      lineColor,
      lineWidth,
      borderRadius = 0,
    } = labelOptions;

    if (fontSize <= 0 || !box) {
      return;
    }

    const { left, top, right, bottom } = box;
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.font = Util.getLabelStyle(labelOptions);
    ctx.setLineDash([]);

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;

    const radius = Math.min(borderRadius, Math.abs(right - left) / 2, Math.abs(bottom - top) / 2);
    if (radius > 0) {
      ctx.moveTo(left + radius, top);
      ctx.lineTo(right - radius, top);
      ctx.arcTo(right, top, right, top + radius, radius);
      ctx.lineTo(right, bottom - radius);
      ctx.arcTo(right, bottom, right - radius, bottom, radius);
      ctx.lineTo(left + radius, bottom);
      ctx.arcTo(left, bottom, left, bottom - radius, radius);
      ctx.lineTo(left, top + radius);
      ctx.arcTo(left, top, left + radius, top, radius);
      ctx.closePath();
    } else {
      ctx.moveTo(left, bottom);
      ctx.lineTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
    }
    ctx.fill();

    if (lineWidth > 0) {
      ctx.stroke();
    }

    // 말풍선 꼬리(pointer): positions.pointerEdge 방향으로 박스와 이어 그린다 (색=pointer.color ?? fillColor)
    if (labelOptions.pointer?.show && positions.pointerEdge) {
      this.drawLabelPointer(
        box,
        positions.pointerEdge,
        labelOptions.pointer.color ?? fillColor,
        lineColor,
        lineWidth,
        positions.pointerTipX,
        radius,
      );
    }

    ctx.fillStyle = fontColor;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(label, textX, textY);
    ctx.closePath();
    ctx.restore();

    // #6 value-only 상태 + showTextOnHover.use + 원본 텍스트가 있을 때 hover hit 영역 수집
    if (labelOptions.valueOnly && labelOptions.showTextOnHover?.use && labelOptions.hoverText) {
      if (!this.plotLabelHitRegions) {
        this.plotLabelHitRegions = [];
      }
      this.plotLabelHitRegions.push({
        x: Math.min(left, right),
        y: Math.min(top, bottom),
        width: Math.abs(right - left),
        height: Math.abs(bottom - top),
        text: labelOptions.hoverText,
        style: labelOptions.showTextOnHover,
      });
    }
  }

  /**
   * 라벨 박스 말풍선 꼬리(삼각형)를 edge 방향으로 그린다. 밑변은 박스 변과 겹쳐 같은 색으로 합쳐지고,
   * 테두리(lineWidth>0)가 있으면 두 빗변만 stroke 한다. 크기는 고정.
   * @param {object} box        { left, top, right, bottom }
   * @param {string} edge       'top' | 'bottom' | 'left' | 'right'
   * @param {string} fillColor  꼬리 채움색
   * @param {string} lineColor  테두리색
   * @param {number} lineWidth  테두리 두께
   * @param {number} [aimX]     top/bottom 꼬리가 가리킬 x(선 위치). 미지정 시 박스 중앙
   *
   * @returns {undefined}
   */
  drawLabelPointer(box, edge, fillColor, lineColor, lineWidth, aimX, radius = 0) {
    const ctx = this.ctx;
    // maxTip 화살표(arrowSize=4, element.tip.js)와 동일한 크기로 맞춤
    const height = 4; // 꼬리 높이(고정, = maxTip arrowSize)
    const halfBase = 4; // 꼬리 밑변 절반(고정, = maxTip arrowSize)
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    // 둥근 모서리(borderRadius)를 침범하지 않도록 밑변 중심을 radius+halfBase 만큼 모서리에서 띄운다(maxTip 방식)
    const insetX = Math.min(radius + halfBase, (box.right - box.left) / 2);
    const insetY = Math.min(radius + halfBase, (box.bottom - box.top) / 2);
    const aim = aimX != null ? aimX : cx;
    const baseCx = Math.max(box.left + insetX, Math.min(box.right - insetX, aim));
    const baseCy = Math.max(box.top + insetY, Math.min(box.bottom - insetY, cy));

    let ax;
    let ay;
    let bx;
    let by;
    let tipX;
    let tipY;
    switch (edge) {
      case 'top':
        ax = baseCx - halfBase;
        ay = box.top;
        bx = baseCx + halfBase;
        by = box.top;
        tipX = aim;
        tipY = box.top - height;
        break;
      case 'left':
        ax = box.left;
        ay = baseCy - halfBase;
        bx = box.left;
        by = baseCy + halfBase;
        tipX = box.left - height;
        tipY = baseCy;
        break;
      case 'right':
        ax = box.right;
        ay = baseCy - halfBase;
        bx = box.right;
        by = baseCy + halfBase;
        tipX = box.right + height;
        tipY = baseCy;
        break;
      case 'bottom':
      default:
        ax = baseCx - halfBase;
        ay = box.bottom;
        bx = baseCx + halfBase;
        by = box.bottom;
        tipX = aim;
        tipY = box.bottom + height;
        break;
    }

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (lineWidth > 0) {
      // 밑변(박스와 겹침)은 제외하고 두 빗변만 stroke
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /**
   * plotLine 라벨 1개 렌더 (정규화 → 위치 계산 → 그리기). 밴드 모서리에도 재사용된다.
   * @param {number} dataPos   임계선 위치(px)
   * @param {object} labelOpt  라벨 옵션
   * @param {object} bounds    { minX, maxX, minY, maxY }
   * @param {object} chartRect chartRect
   * @param {number} [value]   표시할 값(축 formatter 적용)
   *
   * @returns {undefined}
   */
  drawPlotLineLabel(dataPos, labelOpt, bounds, chartRect, value = null) {
    if (!labelOpt?.show) {
      return;
    }

    const opts = this.getNormalizedLabelOptions(chartRect, labelOpt, value);
    if (opts.hidden) {
      return;
    }

    const positions = this.getPlotLineLabelPosition(dataPos, opts, bounds);
    this.drawPlotLabel(opts, positions);
  }

  /**
   * plotBand 라벨 렌더. showValue 면 from·to 양 끝에 각각, 아니면 단일 라벨.
   * @param {number} fromPos    from edge 위치(px)
   * @param {number} toPos      to edge 위치(px)
   * @param {object} labelOpt   라벨 옵션
   * @param {object} bounds     { minX, maxX, minY, maxY }
   * @param {object} chartRect  chartRect
   * @param {number} fromValue  from edge 값
   * @param {number} toValue    to edge 값
   *
   * @returns {undefined}
   */
  drawPlotBandLabel(fromPos, toPos, labelOpt, bounds, chartRect, fromValue, toValue) {
    if (!labelOpt?.show) {
      return;
    }

    if (labelOpt.showValue) {
      // 밴드 두 모서리 라벨은 자동 바깥쪽 배치.
      // Y축: 작은 값=선 아래(bottom)/큰 값=선 위(top). X축: 작은 값(좌 edge)=좌/큰 값(우 edge)=우.
      const fromLower = fromValue <= toValue;
      const fromOverride =
        this.type === 'x'
          ? { textAlign: fromLower ? 'left' : 'right' }
          : { verticalAlign: fromLower ? 'bottom' : 'top' };
      const toOverride =
        this.type === 'x'
          ? { textAlign: fromLower ? 'right' : 'left' }
          : { verticalAlign: fromLower ? 'top' : 'bottom' };
      this.drawPlotLineLabel(fromPos, { ...labelOpt, ...fromOverride }, bounds, chartRect, fromValue);
      this.drawPlotLineLabel(toPos, { ...labelOpt, ...toOverride }, bounds, chartRect, toValue);
      return;
    }

    const opts = this.getNormalizedLabelOptions(chartRect, labelOpt, null);
    if (opts.hidden) {
      return;
    }

    const positions = this.getPlotBandLabelPosition(fromPos, toPos, opts, bounds);
    this.drawPlotLabel(opts, positions);
  }

  /**
   * Check if the label width is greater than the fix width
   * @param {string} value label value
   * @returns
   */
  checkFixWidth(value) {
    const { fixWidth, fitDir } = this.labelStyle;

    if (truthyNumber(fixWidth) && fixWidth > 0) {
      return Util.truncateLabelWithEllipsis(value, fixWidth, this.ctx, fitDir);
    }
    return value;
  }
}

export default Scale;
