import throttle from '@/common/utils.throttle';
import Model from './model';
import TimeScale from './scale/scale.time';
import LinearScale from './scale/scale.linear';
import LogarithmicScale from './scale/scale.logarithmic';
import StepScale from './scale/scale.step';
import TimeCategoryScale from './scale/scale.time.category';
import Title from './plugins/plugins.title';
import Legend from './plugins/plugins.legend';
import Interaction from './plugins/plugins.interaction';
import Tooltip from './plugins/plugins.tooltip';
import Pie from './plugins/plugins.pie';
import Tip from './element/element.tip';

class EvChart {
  constructor(target, data, options, listeners) {
    Object.keys(Model).forEach(key => Object.assign(this, Model[key]));
    Object.assign(this, Title);
    Object.assign(this, Legend);
    Object.assign(this, Interaction);
    Object.assign(this, Tooltip);
    Object.assign(this, Pie);
    Object.assign(this, Tip);

    this.target = target;
    this.data = data;
    this.options = options;
    this.listeners = listeners;

    this.wrapperDOM = document.createElement('div');
    this.wrapperDOM.className = 'ev-chart-wrapper';
    this.chartDOM = document.createElement('div');
    this.chartDOM.className = 'ev-chart-container';
    this.wrapperDOM.appendChild(this.chartDOM);
    this.target.appendChild(this.wrapperDOM);

    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.setAttribute('style', 'display: block;');
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.setAttribute('style', 'display: block;');
    this.bufferCtx = this.bufferCanvas.getContext('2d');
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.setAttribute('style', 'display: block;');
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    this.pixelRatio = window.devicePixelRatio || 1;
    this.oldPixelRatio = this.pixelRatio;

    this.chartDOM.appendChild(this.displayCanvas);
    this.chartDOM.appendChild(this.overlayCanvas);

    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.top = '0px';
    this.overlayCanvas.style.left = '0px';

    this.isInitLegend = false;
    this.isInitTitle = false;
    this.isInit = false;
    this.seriesList = {};
    this.lastTip = { pos: null, value: null };
    this.seriesInfo = {
      charts: { pie: [], bar: [], line: [], scatter: [] },
      count: 0,
    };
  }

  init() {
    const { series, data, labels, groups } = this.data;
    const { type, axesX, axesY, tooltip } = this.options;

    this.createSeriesSet(series, type);
    if (groups.length) {
      this.addGroupInfo(groups);
    }

    this.createDataSet(data, labels);
    this.minMax = this.getStoreMinMax();

    this.axesX = this.createAxes('x', axesX);
    this.axesY = this.createAxes('y', axesY);
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.initRect();
    this.bufferCtx.save();
    this.drawChart();

    if (tooltip.use) {
      this.createTooltipDOM();

      if (tooltip.throttledMove) {
        this.onMouseMove = throttle(this.onMouseMove, 30);
      }
    }

    this.createEventFunctions();
    this.isInit = true;
  }

  initRect() {
    const opt = this.options;
    if (opt.title.show) {
      this.createTitle();
      this.initTitle();
      this.showTitle();
    }

    if (opt.legend.show) {
      this.initLegend();
      this.setLegendPosition();
    }
    this.chartRect = this.getChartRect();
  }

  drawChart(hitInfo) {
    this.labelRange = this.getAxesLabelRange();
    this.axesSteps = this.calculateSteps();
    this.drawAxis();
    this.drawSeries();
    this.createTipInfo(hitInfo);
    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  drawSeries() {
    const thickness = this.options.thickness;
    const isHorizontal = this.options.horizontal;
    const maxTip = this.options.maxTip;

    const opt = {
      ctx: this.bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      maxTipOpt: { background: maxTip.background, color: maxTip.color },
      isHorizontal,
    };

    let showIndex = 0;
    let showSeriesCount = 0;

    this.seriesInfo.charts.bar.forEach((series) => {
      if (this.seriesList[series].show) {
        showSeriesCount++;
      }
    });

    const chartKeys = Object.keys(this.seriesInfo.charts);
    for (let ix = 0; ix < chartKeys.length; ix++) {
      const chartType = chartKeys[ix];
      const chartTypeSet = this.seriesInfo.charts[chartType];

      for (let jx = 0; jx < chartTypeSet.length; jx++) {
        const series = this.seriesList[chartTypeSet[jx]];

        if (chartType === 'line' || chartType === 'scatter') {
          series.draw(opt);
        } else if (chartType === 'bar') {
          series.draw({ thickness, showSeriesCount, showIndex, ...opt });

          if (series.show) {
            showIndex++;
          }
        } else {
          if (this.options.sunburst) {
            this.drawSunburst();
          } else {
            this.drawPie();
          }

          if (this.options.doughnutHoleSize > 0) {
            this.drawDoughnutHole();
          }
          break;
        }
      }
    }
  }

  createAxes(dir, axes = []) {
    const ctx = this.bufferCtx;
    const labels = this.data.labels;

    return axes.map((axis) => {
      switch (axis.type) {
        case 'linear':
          return new LinearScale(dir, axis, ctx);
        case 'time':
          if (axis.categoryMode) {
            return new TimeCategoryScale(dir, axis, ctx);
          }
          return new TimeScale(dir, axis, ctx);
        case 'log':
          return new LogarithmicScale(dir, axis, ctx);
        case 'step':
          return new StepScale(dir, axis, ctx, labels);
        default:
          return false;
      }
    });
  }

  getAxesRange() {
    /* eslint-disable max-len */
    const axesXMinMax = this.axesX.map((axis, index) => axis.calculateScaleRange(this.minMax.x[index]));
    const axesYMinMax = this.axesY.map((axis, index) => axis.calculateScaleRange(this.minMax.y[index]));
    /* eslint-enable max-len */

    return { x: axesXMinMax, y: axesYMinMax };
  }

  drawAxis() {
    this.axesX.forEach((axis, index) => {
      axis.draw(this.chartRect, this.labelOffset, this.axesSteps.x[index]);
    });

    this.axesY.forEach((axis, index) => {
      axis.draw(this.chartRect, this.labelOffset, this.axesSteps.y[index]);
    });
  }

  calculateSteps() {
    const axesXMinMax = this.axesX.map((axis, index) => {
      const range = {
        minValue: this.axesRange.x[index].min,
        maxValue: this.axesRange.x[index].max,
        minSteps: this.labelRange.x[index].min,
        maxSteps: this.labelRange.x[index].max,
      };
      return axis.calculateSteps(range);
    });

    const axesYMinMax = this.axesY.map((axis, index) => {
      const range = {
        minValue: this.axesRange.y[index].min,
        maxValue: this.axesRange.y[index].max,
        minSteps: this.labelRange.y[index].min,
        maxSteps: this.labelRange.y[index].max,
      };

      return axis.calculateSteps(range);
    });

    return { x: axesXMinMax, y: axesYMinMax };
  }

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

  initScale() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio || 1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;

    if (this.oldPixelRatio !== this.pixelRatio) {
      this.oldPixelRatio = this.pixelRatio;
    }

    this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);
    this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
  }

  getChartRect() {
    const rect = this.chartDOM.getBoundingClientRect();
    const width = rect.width || 10;
    const height = rect.height || 10;
    const padding = { top: 20, right: 2, left: 2, bottom: 4 };

    this.setWidth(width);
    this.setHeight(height);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const x1 = padding.left;
    const x2 = Math.max(width - padding.right, x1 + 2);
    const y1 = padding.top;
    const y2 = Math.max(height - padding.bottom, y1 + 2);

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

  setWidth(width) {
    if (!this.displayCanvas) {
      return;
    }

    this.displayCanvas.width = width * this.pixelRatio;
    this.displayCanvas.style.width = `${width}px`;
    this.bufferCanvas.width = width * this.pixelRatio;
    this.bufferCanvas.style.width = `${width}px`;
    this.overlayCanvas.width = width * this.pixelRatio;
    this.overlayCanvas.style.width = `${width}px`;
  }

  setHeight(height) {
    if (!this.displayCanvas) {
      return;
    }

    this.displayCanvas.height = height * this.pixelRatio;
    this.displayCanvas.style.height = `${height}px`;
    this.bufferCanvas.height = height * this.pixelRatio;
    this.bufferCanvas.style.height = `${height}px`;
    this.overlayCanvas.height = height * this.pixelRatio;
    this.overlayCanvas.style.height = `${height}px`;
  }

  getLabelOffset() {
    const axesX = this.axesX;
    const axesY = this.axesY;
    const range = this.axesRange;
    const labelOffset = { top: 2, left: 2, right: 2, bottom: 2 };
    const labelBuffer = { width: 14, height: 4 };

    let lw = 0;
    let lh = 0;

    axesX.forEach((axis, index) => {
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
    });

    axesY.forEach((axis, index) => {
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
    });

    return labelOffset;
  }

  update(updateSeries, updateTip) {
    const options = this.options;
    const data = this.data.data;
    const labels = this.data.labels;
    const groups = this.data.groups;
    const series = this.data.series;

    if (!this.isInit) {
      return;
    }

    this.resetProps();

    if (updateSeries) {
      delete this.seriesInfo;
      delete this.seriesList;
      delete this.lastTip;

      this.seriesInfo = {
        charts: {
          pie: [],
          bar: [],
          line: [],
          scatter: [],
        },
        count: 0,
      };
      this.seriesList = {};
      this.lastTip = { pos: null, value: null };

      this.createSeriesSet(series, options.type);

      if (this.legendDOM) {
        this.resetLegend();
      }
    }

    if (updateTip) {
      this.lastTip = { pos: null, value: null };
    }

    if (groups.length) {
      this.addGroupInfo(groups);
    }

    this.createDataSet(data, labels);

    this.minMax = this.getStoreMinMax();
    this.axesX = this.createAxes('x', options.axesX);
    this.axesY = this.createAxes('y', options.axesY);
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    // title update
    if (options.title.show) {
      if (!this.isInitTitle) {
        this.initTitle();
      }

      this.showTitle();
    } else if (this.isInitTitle) {
      this.hideTitle();
    }

    if (options.legend.show) {
      if (!this.isInitLegend) {
        this.initLegend();
      } else if (updateSeries) {
        this.updateLegend();
      }

      this.setLegendPosition();
      this.updateLegendContainerSize();
      this.showLegend();
    } else if (this.isInitLegend) {
      this.hideLegend();
    }

    this.render();
  }

  resetProps() {
    delete this.minMax;
    delete this.axesX;
    delete this.axesY;
    delete this.axesRange;
    delete this.labelOffset;
    delete this.chartRect;
    delete this.pieDataSet;

    this.pieDataSet = [];
  }

  overlayClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio);
  }

  clear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.displayCtx.clearRect(0, 0, this.displayCanvas.width / this.clearRectRatio,
      this.displayCanvas.height / this.clearRectRatio);
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width / this.clearRectRatio,
      this.bufferCanvas.height / this.clearRectRatio);
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio);
  }

  render() {
    this.clear();
    this.chartRect = this.getChartRect();
    this.initScale();
    this.drawChart();
  }

  resize() {
    this.bufferCtx.restore();
    this.bufferCtx.save();

    this.initScale();
    this.render();
  }

  redraw(hitInfo) {
    this.clear();
    this.chartRect = this.getChartRect();
    this.initScale();
    this.drawChart(hitInfo);
  }

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
}

export default EvChart;
