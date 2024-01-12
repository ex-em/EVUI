import { mobileCheck } from '@/common/utils';
import Model from './model';
import TimeScale from './scale/scale.time';
import LinearScale from './scale/scale.linear';
import LogarithmicScale from './scale/scale.logarithmic';
import StepScale from './scale/scale.step';
import TimeCategoryScale from './scale/scale.time.category';
import Title from './plugins/plugins.title';
import Legend from './plugins/plugins.legend';
import GradientLegend from './plugins/plugins.legend.gradient';
import Scrollbar from './plugins/plugins.scrollbar';
import Interaction from './plugins/plugins.interaction';
import Tooltip from './plugins/plugins.tooltip';
import Pie from './plugins/plugins.pie';
import Tip from './element/element.tip';

class EvChart {
  constructor(
    target,
    data,
    options,
    listeners,
    defaultSelectItemInfo,
    defaultSelectInfo,
    brushSeries,
  ) {
    Object.keys(Model).forEach(key => Object.assign(this, Model[key]));

    if (!options.brush) {
      Object.assign(this, Tooltip);
      Object.assign(this, Interaction);
      Object.assign(this, Tip);
      Object.assign(this, Legend);
      Object.assign(this, Pie);
      Object.assign(this, Title);
      Object.assign(this, Scrollbar);
    }

    if (options.type === 'heatMap' && options.legend.type === 'gradient') {
      Object.assign(this, GradientLegend);
    }

    this.isMobile = mobileCheck();
    this.brushSeries = brushSeries;
    this.target = target;
    this.data = data;
    this.options = options;
    this.listeners = listeners;

    this.wrapperDOM = document.createElement('div');
    this.wrapperDOM.className = options.brush ? 'ev-chart-brush-wrapper' : 'ev-chart-wrapper';
    this.chartDOM = document.createElement('div');
    this.chartDOM.className = options.brush ? 'ev-chart-brush-container' : 'ev-chart-container';
    this.wrapperDOM.appendChild(this.chartDOM);
    this.target.appendChild(this.wrapperDOM);

    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.setAttribute('style', 'display: block;');
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.setAttribute('style', 'display: block;');
    this.bufferCtx = this.bufferCanvas.getContext('2d');

    this.pixelRatio = window.devicePixelRatio || 1;
    this.oldPixelRatio = this.pixelRatio;

    this.chartDOM.appendChild(this.displayCanvas);

    if (!options.brush) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.setAttribute('style', 'display: block; z-index: 2;');
      this.overlayCanvas.setAttribute('class', 'overlay-canvas');
      this.overlayCtx = this.overlayCanvas.getContext('2d');

      this.chartDOM.appendChild(this.overlayCanvas);

      this.overlayCanvas.style.position = 'absolute';
      this.overlayCanvas.style.top = '0px';
      this.overlayCanvas.style.left = '0px';
    }


    this.isInitLegend = false;
    this.isInitTitle = false;
    this.isInit = false;
    this.scrollbar = {
      x: { isInit: false },
      y: { isInit: false },
    };
    this.seriesList = {};
    this.lastTip = { pos: null, value: null };
    this.seriesInfo = {
      charts: { pie: [], bar: [], line: [], scatter: [], heatMap: [] },
      count: 0,
    };

    this.defaultSelectItemInfo = defaultSelectItemInfo;
    this.defaultSelectInfo = defaultSelectInfo;
  }

  /**
   * Initialize chart object
   *
   * @returns {undefined}
   */
  init() {
    const { series, data, labels, groups } = this.data;
    const { type, axesX, axesY, tooltip, horizontal, realTimeScatter } = this.options;

    this.createSeriesSet(series, type, horizontal, groups);
    if (groups.length) {
      this.addGroupInfo(groups);
    }

    if (realTimeScatter?.use) {
      this.dataSet = {};
      this.createRealTimeScatterDataSet(data);
    } else {
      this.createDataSet(data, labels);
    }
    this.minMax = this.getStoreMinMax();

    this.initRect();

    this.axesX = this.createAxes('x', axesX);
    this.axesY = this.createAxes('y', axesY);

    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.initDefaultSelectInfo();

    this.drawChart();

    if (tooltip.use) {
      this.createTooltipDOM();
    }

    this.createEventFunctions?.();
    this.isInit = true;
  }

  /**
   * Initialize chart rectangle
   *
   * @returns {undefined}
   */
  initRect() {
    const opt = this.options;
    if (opt.title.show) {
      if (!this.isInitTitle) {
        this.initTitle();
      }

      this.showTitle();
    }

    if (opt.legend.show) {
      if (!this.isInitLegend) {
        this.initLegend();
      }

      this.setLegendPosition();
    }

    if (opt.axesX?.[0]?.scrollbar?.use || opt.axesY?.[0]?.scrollbar?.use) {
      this.initScrollbar();
    }

    this.chartRect = this.getChartRect();
  }

  /**
   * To draw canvas chart, it processes several sequential jobs
   * @param {any} [hitInfo=undefined]    from mousemove callback (object or object[] of undefined)
   *
   * @returns {undefined}
   */
  drawChart(hitInfo) {
    this.initScale();
    this.labelRange = this.getAxesLabelRange();
    this.axesSteps = this.calculateSteps();
    this.drawAxis(hitInfo);
    this.drawSeries(hitInfo);

    if (this.scrollbar?.x?.use || this.scrollbar?.y?.use) {
      this.initScrollbar();
      this.updateScrollbarPosition();
    }

    this.drawTip();

    if (
      this.bufferCanvas
      && this.bufferCanvas?.width > 1
      && this.bufferCanvas?.height > 1
    ) {
      this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
    }
  }

  /**
   * Draw each series
   * @param {any} [hitInfo=undefined]   legend mouseover callback (object or undefined)
   *
   * @returns {undefined}
   */
  drawSeries(hitInfo) {
    const {
      maxTip,
      selectLabel,
      selectItem,
      selectSeries,
      brush,
      displayOverflow,
    } = this.options;

    const opt = {
      ctx: this.bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      maxTipOpt: { background: maxTip.background, color: maxTip.color },
      selectLabel: { option: selectLabel, selected: this.defaultSelectInfo },
      selectSeries: { option: selectSeries, selected: this.defaultSelectInfo },
      selectItem: { option: selectItem, selected: this.defaultSelectItemInfo },
      overlayCtx: this.overlayCtx,
      isBrush: !!brush,
      displayOverflow,
    };

    let showIndex = 0;
    let showSeriesCount = 0;

    this.seriesInfo.charts.bar.forEach((series) => {
      if (this.seriesList[series].show) {
        showSeriesCount++;
      }
    });

    const duple = new Set();

    const chartKeys = Object.keys(this.seriesInfo.charts);
    for (let ix = 0; ix < chartKeys.length; ix++) {
      const chartType = chartKeys[ix];
      const chartTypeSet = this.seriesInfo.charts[chartType];

      for (let jx = 0; jx < chartTypeSet.length; jx++) {
        let series = this.seriesList[chartTypeSet[jx]];

        switch (chartType) {
          case 'line': {
            const legendHitInfo = hitInfo?.legend;

            series.draw({
              legendHitInfo,
              ...opt,
            });
            break;
          }
          case 'heatMap': {
            const legendHitInfo = hitInfo?.legend;

            series.draw({
              legendHitInfo,
              ...opt,
            });
            break;
          }
          case 'bar': {
            const legendHitInfo = hitInfo?.legend;
            const { thickness, cPadRatio, borderRadius } = this.options;

            series.draw({
              thickness,
              cPadRatio,
              borderRadius,
              showSeriesCount,
              showIndex,
              legendHitInfo,
              ...opt,
            });

            if (series.show) {
              showIndex++;
            }
            break;
          }
          case 'pie': {
            const selectInfo = this.lastHitInfo ?? { sId: this.defaultSelectItemInfo?.seriesID };
            const legendHitInfo = hitInfo?.legend;

            if (this.options.sunburst) {
              this.drawSunburst({
                selectInfo,
                legendHitInfo,
              });
            } else {
              this.drawPie({
                selectInfo,
                legendHitInfo,
              });
            }

            if (this.options.doughnutHoleSize > 0) {
              this.drawDoughnutHole();
            }
            break;
          }
          case 'scatter': {
            const legendHitInfo = hitInfo?.legend;

            let selectInfo;
            if (selectItem.use && selectItem.useSeriesOpacity) {
              const lastHitInfo = this.lastHitInfo;
              const defaultSelectInfo = this.defaultSelectItemInfo;

              if (lastHitInfo?.maxIndex || lastHitInfo?.maxIndex === 0) {
                selectInfo = {
                  seriesID: lastHitInfo.sId,
                  dataIndex: lastHitInfo.maxIndex,
                };
              } else if (defaultSelectInfo?.dataIndex || defaultSelectInfo?.dataIndex === 0) {
                selectInfo = { ...defaultSelectInfo };
              } else {
                selectInfo = null;
              }
            }

            if (this.options.realTimeScatter?.use) {
              series = this.seriesList[chartTypeSet.at(-1 - jx)];
            }

            series.draw({
              legendHitInfo,
              selectInfo,
              duple,
              ...opt,
            });
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  }

  /**
   * Draw Tip with hitInfo and defaultSelectItemInfo
   */
  drawTip() {
    let tipLocationInfo;

    if (this.lastHitInfo) {
      tipLocationInfo = this.lastHitInfo;
    } else if (this.defaultSelectItemInfo) {
      tipLocationInfo = this.getItem(this.defaultSelectItemInfo, false);
    } else if (this.defaultSelectInfo && this.options.selectLabel.use) {
      tipLocationInfo = this.getItem(this.defaultSelectInfo, false);
    } else {
      tipLocationInfo = null;
    }

    this.drawTips?.(tipLocationInfo);
  }

  /**
   * Create axes
   * @param {string} dir    axis direction
   * @param {array}  axes   axes array
   *
   * @returns {array} axes objects in array
   */
  createAxes(dir, axes = []) {
    const ctx = this.bufferCtx;

    const isHeatMapType = (this.options.type === 'heatMap');
    const labels = isHeatMapType ? this.data.labels[dir] : this.data.labels;

    const options = this.options;
    return axes.map((axis) => {
      switch (axis.type) {
        case 'linear':
          return new LinearScale(dir, axis, ctx, options);
        case 'time':
          if (axis.categoryMode) {
            return new TimeCategoryScale(dir, axis, ctx, labels, options);
          }
          return new TimeScale(dir, axis, ctx, options);
        case 'log':
          return new LogarithmicScale(dir, axis, ctx);
        case 'step':
          return new StepScale(dir, axis, ctx, labels, options);
        default:
          return false;
      }
    });
  }

  /**
   * Calculate min/max value, label and size information for each axis
   *
   * @returns {object} axes min/max information
   */
  getAxesRange() {
    /* eslint-disable max-len */
    const axesXMinMax = this.axesX.map((axis, index) => axis.calculateScaleRange(this.minMax.x[index], this.scrollbar.x, this.chartRect));
    const axesYMinMax = this.axesY.map((axis, index) => axis.calculateScaleRange(this.minMax.y[index], this.scrollbar.y, this.chartRect));
    /* eslint-enable max-len */

    return { x: axesXMinMax, y: axesYMinMax };
  }

  /**
   * Draw each axis
   *
   * @returns {undefined}
   */
  drawAxis(hitInfo) {
    this.axesX.forEach((axis, index) => {
      axis.draw(
        this.chartRect,
        this.labelOffset,
        this.axesSteps.x[index],
        hitInfo,
        this.defaultSelectInfo,
        this.data.labels);
    });

    this.axesY.forEach((axis, index) => {
      axis.draw(
        this.chartRect,
        this.labelOffset,
        this.axesSteps.y[index],
        hitInfo,
        this.defaultSelectInfo);
    });
  }

  /**
   * With each axis's min/max value and label information, calculate how many labels in each axis
   *
   * @returns {object} each axis's label steps in axes array
   */
  calculateSteps() {
    const axesXMinMax = this.axesX.map((axis, index) => {
      const range = {
        minValue: this.axesRange.x[index].min,
        maxValue: this.axesRange.x[index].max,
        minIndex: this.axesRange.x[index].minIndex,
        maxIndex: this.axesRange.x[index].maxIndex,
        minSteps: this.labelRange.x[index].min,
        maxSteps: this.labelRange.x[index].max,
      };
      return axis.calculateSteps(range);
    });

    const axesYMinMax = this.axesY.map((axis, index) => {
      const range = {
        minValue: this.axesRange.y[index].min,
        maxValue: this.axesRange.y[index].max,
        minIndex: this.axesRange.y[index].minIndex,
        maxIndex: this.axesRange.y[index].maxIndex,
        minSteps: this.labelRange.y[index].min,
        maxSteps: this.labelRange.y[index].max,
      };
      return axis.calculateSteps(range);
    });

    return { x: axesXMinMax, y: axesYMinMax };
  }

  /**
   * Calculate axis's min/max label steps
   *
   * @returns {object} axes's label range
   */
  getAxesLabelRange() {
    const axesXSteps = this.axesX.map((axis, index) => {
      const size = this.axesRange.x[index].size;
      return axis.calculateLabelRange('x', this.chartRect, this.labelOffset, size.width);
    });

    const axesYSteps = this.axesY.map((axis, index) => {
      const size = this.axesRange.y[index].size;
      return axis.calculateLabelRange('y', this.chartRect, this.labelOffset, size.height);
    });

    return { x: axesXSteps, y: axesYSteps };
  }

  /**
   * Reset devicePixelRatio for high DPI
   *
   * @returns {undefined}
   */
  initScale() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = this.displayCtx.webkitBackingStorePixelRatio
      || this.displayCtx.mozBackingStorePixelRatio
      || this.displayCtx.msBackingStorePixelRatio
      || this.displayCtx.oBackingStorePixelRatio
      || this.displayCtx.backingStorePixelRatio
      || 1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;

    if (this.oldPixelRatio !== this.pixelRatio) {
      this.oldPixelRatio = this.pixelRatio;
    }

    this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);

    if (this.overlayCtx) {
      this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
    }
  }

  /**
   * Get chart DOM size and set canvas size
   *
   * @returns {object} chart size information
   */
  getChartDOMRect() {
    const rect = this.chartDOM?.getBoundingClientRect();
    const width = rect?.width || 10;
    const height = rect?.height || 10;

    this.setWidth(width);
    this.setHeight(height);

    return { width, height };
  }

  /**
   * Calculate chart size
   *
   * @returns {object} chart size information
   */
  getChartRect() {
    const { width, height } = this.getChartDOMRect();

    const padding = this.options.padding;
    const xAxisTitleOpt = this.options.axesX?.[0]?.title;
    const yAxisTitleOpt = this.options.axesY?.[0]?.title;
    const titleMargin = 10;

    let xAxisTitleHeight = 0;
    if (xAxisTitleOpt?.use && xAxisTitleOpt?.text) {
      const fontSize = isNaN(xAxisTitleOpt?.fontSize) ? 12 : xAxisTitleOpt?.fontSize;
      xAxisTitleHeight = fontSize + titleMargin;
    }

    let yAxisTitleHeight = 0;
    if (yAxisTitleOpt?.use && yAxisTitleOpt?.text) {
      const fontSize = isNaN(yAxisTitleOpt?.fontSize) ? 12 : yAxisTitleOpt?.fontSize;
      yAxisTitleHeight = fontSize + titleMargin;
    }

    const xAxisScrollOpt = this.scrollbar.x;
    const yAxisScrollOpt = this.scrollbar.y;

    let xAxisScrollHeight = 0;
    if (xAxisScrollOpt?.use) {
      xAxisScrollHeight = xAxisScrollOpt?.height;
    }

    let yAxisScrollWidth = 0;
    if (yAxisScrollOpt?.use) {
      yAxisScrollWidth = yAxisScrollOpt?.width;
    }

    const horizontalPadding = padding.left + padding.right + yAxisScrollWidth;
    const verticalPadding = padding.top + padding.bottom
        + xAxisTitleHeight + yAxisTitleHeight + xAxisScrollHeight;
    const chartWidth = width > horizontalPadding ? width - horizontalPadding : width;
    const chartHeight = height > verticalPadding ? height - verticalPadding : height;

    const x1 = padding.left;
    const x2 = Math.max(width - padding.right - yAxisScrollWidth, x1 + 2);
    const y1 = padding.top + yAxisTitleHeight;
    const y2 = Math.max(height - padding.bottom - xAxisTitleHeight - xAxisScrollHeight, y1 + 2);

    return {
      x1,
      x2,
      y1,
      y2,
      chartWidth,
      chartHeight,
      width,
      height,
    };
  }

  /**
   * Set canvas width
   * @param {number} width    canvas width from chartDOM.width
   *
   * @returns {undefined}
   */
  setWidth(width) {
    if (!this.displayCanvas) {
      return;
    }

    this.displayCanvas.width = width * this.pixelRatio;
    this.displayCanvas.style.width = `${width}px`;
    this.bufferCanvas.width = width * this.pixelRatio;
    this.bufferCanvas.style.width = `${width}px`;

    if (this.overlayCanvas) {
      this.overlayCanvas.width = width * this.pixelRatio;
      this.overlayCanvas.style.width = `${width}px`;
    }
  }

  /**
   * Set canvas height
   * @param {number} height    canvas width from chartDOM.height
   *
   * @returns {undefined}
   */
  setHeight(height) {
    if (!this.displayCanvas) {
      return;
    }

    this.displayCanvas.height = height * this.pixelRatio;
    this.displayCanvas.style.height = `${height}px`;
    this.bufferCanvas.height = height * this.pixelRatio;
    this.bufferCanvas.style.height = `${height}px`;

    if (this.overlayCanvas) {
      this.overlayCanvas.height = height * this.pixelRatio;
      this.overlayCanvas.style.height = `${height}px`;
    }
  }

  /**
   * Calculate labels offset from chart rect (Axis 영역을 벗어나는 label 크기 계산)
   *
   * ex)
   * Y축 label의 넓이와 (X축 최소값 label 넓이 / 2) 중 넓은 값이 left label offset으로 처리됨
   *
   * 0 |
   *   |
   *   |
   * 0 ----------------------
   * hh:mm                 hh:mm
   *
   * @returns {object} label offset for edge
   */
  getLabelOffset() {
    const axesX = this.axesX;
    const axesY = this.axesY;
    const range = this.axesRange;
    const labelOffset = { top: 2, left: 2, right: 2, bottom: 2 };
    const labelBuffer = { width: 14, height: 4 };

    let lw = 0;
    let lh = 0;

    axesX.forEach((axis, index) => {
      if (axis.labelStyle?.show) {
        lw = range.x[index].size.width + labelBuffer.width;
        lh = range.x[index].size.height + labelBuffer.height;

        if (axis.position === 'bottom') {
          if (lh > labelOffset.bottom) {
            labelOffset.bottom = lh;
          }
        } else if (axis.position === 'top') {
          if (lh > labelOffset.top) {
            labelOffset.top = lh;
          }
        }

        labelOffset.left = (lw / 2) > labelOffset.left ? (lw / 2) : labelOffset.left;
        labelOffset.right = (lw / 2) > labelOffset.right ? (lw / 2) : labelOffset.right;
      }
    });

    axesY.forEach((axis, index) => {
      if (axis.labelStyle?.show) {
        lw = Math.max(range.y[index].size.width + labelBuffer.width, 42 + labelBuffer.width);

        if (axis.position === 'left') {
          if (lw > labelOffset.left) {
            labelOffset.left = lw;
          }
        } else if (axis.position === 'right') {
          if (lw > labelOffset.right) {
            labelOffset.right = lw;
          }
        }

        labelOffset.top = (lh / 2) > labelOffset.top ? (lh / 2) : labelOffset.top;
        labelOffset.bottom = (lh / 2) > labelOffset.bottom ? (lh / 2) : labelOffset.bottom;
      }
    });

    return labelOffset;
  }

  /**
   * To re-render chart, reset properties, canvas and then render chart.
   * @param {object} updateInfo   information for each components are needed to update
   *
   * @returns {undefined}
   */
  update(updateInfo) {
    const options = this.options;
    const data = this.data.data;
    const labels = this.data.labels;
    const groups = this.data.groups;
    const series = this.data.series;

    const { updateSeries, updateSelTip, updateLegend, updateData } = updateInfo;

    if (!this.isInit) {
      return;
    }

    this.updateScrollbar?.(updateData);

    this.resetProps();

    this.updateSeries = updateSeries;
    if (updateSeries) {
      this.seriesInfo = null;
      this.seriesList = null;
      this.lastTip = null;

      this.seriesInfo = {
        charts: {
          pie: [],
          bar: [],
          line: [],
          scatter: [],
          heatMap: [],
        },
        count: 0,
      };
      this.seriesList = {};
      this.lastTip = { pos: null, value: null };

      this.createSeriesSet(series, options.type, options.horizontal, groups);

      if (this.legendDOM) {
        this.updateLegend();
      }
    }

    if (updateSelTip.update) {
      this.lastTip.value = null;

      if (!updateSelTip.keepDomain) {
        this.lastTip.pos = null;
        this.lastHitInfo = null;
      }
    }

    if (groups.length) {
      this.addGroupInfo(groups);
    }

    if (this.options.realTimeScatter?.use) {
      if (!this.dataSet) {
        this.dataSet = {};
      }
      this.createRealTimeScatterDataSet(data);
    } else {
      this.createDataSet(data, labels);
    }

    // title update
    if (options.title.show) {
      if (!this.isInitTitle) {
        this.initTitle();
      } else {
        this.updateTitle();
      }

      this.showTitle();
    } else if (this.isInitTitle) {
      this.hideTitle();
    }

    if (options.legend.show) {
      const useTable = !!options.legend?.table?.use
        && options.type !== 'heatMap'
        && options.type !== 'scatter';

      if (!this.isInitLegend) {
        this.initLegend();
      } else if (updateSeries) {
        this.updateLegend();
      } else if (updateLegend) {
        this.forceUpdateLegend();
      } else if (useTable && updateData) {
        this.updateLegendTableValues();
      }

      this.setLegendPosition();
      this.updateLegendContainerSize();
      this.showLegend();
    } else if (this.isInitLegend) {
      this.hideLegend();
    }
    this.chartRect = this.getChartRect();

    this.minMax = this.getStoreMinMax();
    this.axesX = this.createAxes('x', options.axesX);
    this.axesY = this.createAxes('y', options.axesY);
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.initDefaultSelectInfo();

    this.render(updateInfo?.hitInfo);

    const isDragMove = this.dragInfo && this.drawSelectionArea;
    if (isDragMove) {
      this.drawSelectionArea(this.dragInfo);
    } else if (this.dragInfoBackup) {
      this.dragInfoBackup = null;
    }
  }

  /**
   * To re-render chart, reset properties
   *
   * @returns {undefined}
   */
  resetProps() {
    this.axesX[0] = null;
    this.axesY[0] = null;
    this.axesX = null;
    this.axesY = null;
    this.minMax = null;
    this.axesRange = null;
    this.labelOffset = null;
    this.chartRect = null;
    this.pieDataSet = [];
  }

  /**
   * Clear overlay canvas
   *
   * @returns {undefined}
   */
  overlayClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio);
  }

  /**
   * Clear display and buffer canvas
   *
   * @returns {undefined}
   */
  clear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;
    if (this.displayCanvas) {
      this.displayCtx.clearRect(0, 0, this.displayCanvas.width / this.clearRectRatio,
        this.displayCanvas.height / this.clearRectRatio);
    }
    if (this.bufferCanvas) {
      this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width / this.clearRectRatio,
        this.bufferCanvas.height / this.clearRectRatio);
    }
    if (this.overlayCanvas) {
      this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
        this.overlayCanvas.height / this.clearRectRatio);
    }
  }

  /**
   * Resize chart
   * @param {Function} promiseRes After evChart resize completes,
   *   callback completion status with promiseRes to draw a Brush over it.
   *
   * @returns {undefined}
   */
  resize(promiseRes) {
    this.clear();
    this.bufferCtx.restore();
    this.bufferCtx.save();

    this.initRect();
    this.initScale();
    this.chartRect = this.getChartRect();
    this.drawChart();

    if (promiseRes) {
      promiseRes(true);
    }
  }

  /**
   * Render chart
   * @param {any} [hitInfo=undefined]   hit item from mouse click/dblclick
   *
   * @returns {undefined}
   */
  render(hitInfo) {
    if (this.isInit) {
      this.clear();
      this.chartRect = this.getChartRect();
      this.drawChart(hitInfo);
    }
  }

  /**
   * destroy chart component
   *
   * @returns {undefined}
   */
  destroy() {
    if (!this.isInit) {
      return;
    }

    const target = this.target;

    if (this.options.legend.show) {
      if (this.legendBoxDOM) {
        this.legendBoxDOM.removeEventListener('click', this.onLegendBoxClick);
        this.legendBoxDOM.removeEventListener('mouseover', this.onLegendBoxOver);
        this.legendBoxDOM.removeEventListener('mouseleave', this.onLegendBoxLeave);
        if (this.options.legend.type === 'gradient') {
          this.legendBoxDOM.removeEventListener('mousedown', this.onLegendMouseDown);
        }
      }

      if (this.resizeDOM) {
        this.resizeDOM.removeEventListener('mousedown', this.onResizeMouseDown);
      }
    }

    if (this.overlayCanvas) {
      this.overlayCanvas.removeEventListener('mousemove', this.onMouseMove);
      this.overlayCanvas.removeEventListener('mouseleave', this.onMouseLeave);
      this.overlayCanvas.removeEventListener('dblclick', this.onDblClick);
      this.overlayCanvas.removeEventListener('click', this.onClick);
      this.overlayCanvas.removeEventListener('mousedown', this.onMouseDown);
      this.overlayCanvas.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('click', this.dragTouchSelectionEvent);
    }

    if (this.options.tooltip.use) {
      this.tooltipCanvas.remove();
      this.tooltipCanvas = null;
      this.tooltipDOM.remove();
      this.tooltipDOM = null;
    }

    this.wrapperDOM = null;
    this.chartDOM = null;
    this.legendDOM = null;
    this.legendBoxDOM = null;
    this.resizeDOM = null;
    this.ghostDOM = null;
    this.titleDOM = null;
    this.displayCanvas = null;
    this.bufferCanvas = null;
    this.overlayCanvas = null;

    while (target.hasChildNodes()) {
      target.removeChild(target.firstChild);
    }
  }

  /**
   * hide chart tooltip
   *
   * @returns {undefined}
   */
  hideTooltip() {
    if (this.options.tooltip.use && this.tooltipDOM?.style) {
      this.tooltipDOM.style.display = 'none';
    }
  }

  /**
   * init defaultSelectInfo (for selectLabel, selectSeries options)
   */
  initDefaultSelectInfo() {
    const {
      type: chartType,
      selectLabel,
      selectSeries,
    } = this.options;

    if (selectLabel.use) {
      let targetAxis = null;
      if (chartType === 'heatMap' && selectLabel?.useBothAxis) {
        targetAxis = this.defaultSelectInfo?.targetAxis;
      }

      this.defaultSelectInfo = !this.defaultSelectInfo?.dataIndex
        ? { dataIndex: [], label: [], data: [] }
        : this.getSelectedLabelInfoWithLabelData(this.defaultSelectInfo.dataIndex, targetAxis);
    }

    if (selectSeries.use && !this.defaultSelectInfo) {
      this.defaultSelectInfo = { seriesId: [] };
    }
  }
}

export default EvChart;
