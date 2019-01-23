import Model from './model';
import TimeScale from './scale/scale.time';
import LinearScale from './scale/scale.linear';
import LogarithmicScale from './scale/scale.logarithmic';

class EvChart {
  constructor(target, data, options) {
    Object.keys(Model).forEach((key) => {
      Object.assign(this, Model[key]);
    });

    this.target = target;
    this.data = data;
    this.options = options;

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

    this.chartDOM.appendChild(this.bufferCanvas);
    this.chartDOM.appendChild(this.overlayCanvas);

    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.top = '0px';
    this.overlayCanvas.style.left = '0px';
  }

  init() {
    this.seriesList = {};
    this.chartRect = {};

    this.initSeries();
    this.initStore();
    this.initAxes();
    this.drawChart();
  }

  initSeries() {
    const type = this.options.type;
    const series = this.data.series;
    const groups = this.data.groups;

    this.createSeriesSet(this.seriesList, series, type);

    if (groups.length) {
      this.addGroupInfo(this.seriesList, groups);
    }
  }

  initStore() {
    Model.Store.horizontal = !!this.options.horizontal;
    const data = this.data.data;
    const labels = this.data.labels;

    this.createDataSet(this.seriesList, data, labels);
    this.minMax = this.getStoreMinMax(this.seriesList);
  }

  initAxes() {
    this.axesX = this.createAxes('x', this.options.axesX, this.bufferCtx);
    this.axesY = this.createAxes('y', this.options.axesY, this.bufferCtx);
    this.axesRange = this.getAxesRange(this.axesX, this.axesY, this.minMax);
    this.labelOffset = this.getLabelOffset(this.axesX, this.axesY, this.axesRange);
    this.chartRect = this.getChartRect();

    this.labelRange = this.getAxesLabelRange({
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesX: this.axesX,
      axesY: this.axesY,
      axesRange: this.axesRange,
    });

    this.axesSteps = this.calculateSteps({
      axesX: this.axesX,
      axesY: this.axesY,
      axesRange: this.axesRange,
      labelRange: this.labelRange,
    });
  }

  drawChart() {
    this.drawAxis({
      axesX: this.axesX,
      axesY: this.axesY,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
    });

    this.drawSeries({
      seriesList: this.seriesList,
      ctx: this.bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
    });

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  drawSeries(param) {
    const slist = param.seriesList;
    const ctx = param.ctx;
    const rect = param.chartRect;
    const offset = param.labelOffset;
    const steps = param.axesSteps;

    Object.keys(slist).forEach((series) => {
      slist[series].draw(ctx, rect, offset, steps);
    });
  }

  createAxes(dir, axes, ctx) {
    return axes.map((axis) => {
      switch (axis.type) {
        case 'linear':
          return new LinearScale(dir, axis, ctx);
        case 'time':
          return new TimeScale(dir, axis, ctx);
        case 'log':
          return new LogarithmicScale(dir, axis, ctx);
        default:
          return false;
      }
    });
  }

  getAxesRange(axesX, axesY, minMax) {
    const axesXMinMax = axesX.map((axis, index) => axis.calculateScaleRange(minMax.x[index]));
    const axesYMinMax = axesY.map((axis, index) => axis.calculateScaleRange(minMax.y[index]));

    return { x: axesXMinMax, y: axesYMinMax };
  }

  drawAxis(param) {
    const axesX = param.axesX;
    const axesY = param.axesY;
    const rect = param.chartRect;
    const offset = param.labelOffset;
    const steps = param.axesSteps;

    axesX.forEach((axis, index) => axis.draw(rect, offset, steps.x[index]));
    axesY.forEach((axis, index) => axis.draw(rect, offset, steps.y[index]));
  }

  calculateSteps(param) {
    const axesX = param.axesX;
    const axesY = param.axesY;
    const aMinMax = param.axesRange;
    const lMinMax = param.labelRange;

    const axesXMinMax = axesX.map((axis, index) => {
      const range = {
        minValue: aMinMax.x[index].min,
        maxValue: aMinMax.x[index].max,
        minSteps: lMinMax.x[index].min,
        maxSteps: lMinMax.x[index].max,
      };
      return axis.calculateSteps(range);
    });

    const axesYMinMax = axesY.map((axis, index) => {
      const range = {
        minValue: aMinMax.y[index].min,
        maxValue: aMinMax.y[index].max,
        minSteps: lMinMax.y[index].min,
        maxSteps: lMinMax.y[index].max,
      };

      return axis.calculateSteps(range);
    });

    return { x: axesXMinMax, y: axesYMinMax };
  }

  getAxesLabelRange(param) {
    const rect = param.chartRect;
    const offset = param.labelOffset;
    const axesX = param.axesX;
    const axesY = param.axesY;
    const range = param.axesRange;

    const axesXSteps = axesX.map((axis, index) => {
      const size = range.x[index].size;
      return axis.calculateLabelRange('x', rect, offset, size.width);
    });

    const axesYSteps = axesY.map((axis, index) => {
      const size = range.y[index].size;
      return axis.calculateLabelRange('y', rect, offset, size.height);
    });

    return { x: axesXSteps, y: axesYSteps };
  }

  getChartRect() {
    const width = this.chartDOM.getBoundingClientRect().width || 10;
    const height = this.chartDOM.getBoundingClientRect().height || 10;

    this.setWidth(width);
    this.setHeight(height);

    const chartWidth = width - 8;
    const chartHeight = height - 8;

    const x1 = 4;
    const x2 = Math.max(width - 4, x1 + 2);
    const y1 = 4;
    const y2 = Math.max(height - 4, y1 + 2);

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

  getLabelOffset(axesX, axesY, range) {
    const labelOffset = { top: 2, left: 2, right: 2, bottom: 2 };
    const labelBuffer = { width: 20, height: 4 };

    let lw;
    let lh;

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
      lw = range.y[index].size.width + labelBuffer.width;

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
}

export default EvChart;
