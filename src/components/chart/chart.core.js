import Model from './model';
import TimeScale from './scale/scale.time';
import LinearScale from './scale/scale.linear';
import LogarithmicScale from './scale/scale.logarithmic';
import StepScale from './scale/scale.step';
import Title from './plugins/plugins.title';
import Legend from './plugins/plugins.legend';

class EvChart {
  constructor(target, data, options) {
    Object.keys(Model).forEach(key => Object.assign(this, Model[key]));
    Object.assign(this, Title);
    Object.assign(this, Legend);

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

    this.seriesList = {};
    this.chartRect = {};
    this.showSeriesCount = 0;
    this.integratedLabels = this.data.labels.slice();
  }

  init() {
    const series = this.data.series;
    const data = this.data.data;
    const labels = this.data.labels;
    const groups = this.data.groups;

    const options = this.options;

    this.createSeriesSet(series, options.type);
    if (groups.length) {
      this.addGroupInfo(groups);
    }

    this.createDataSet(data, labels);
    this.minMax = this.getStoreMinMax();

    this.axesX = this.createAxes('x', options.axesX);
    this.axesY = this.createAxes('y', options.axesY);
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.initRect();
    this.drawChart();
  }

  initRect() {
    const opt = this.options;

    if (opt.title.show) {
      this.titleDOM = document.createElement('div');
      this.titleDOM.className = 'ev-chart-title';
      this.wrapperDOM.appendChild(this.titleDOM);

      this.initTitle();
      this.showTitle();
    }

    if (opt.legend.show) {
      this.legendDOM = document.createElement('div');
      this.legendDOM.className = 'ev-chart-legend';
      this.legendBoxDOM = document.createElement('div');
      this.legendBoxDOM.className = 'ev-chart-legend-box';
      this.resizeDOM = document.createElement('div');
      this.resizeDOM.className = 'ev-chart-resize-bar';
      this.ghostDOM = document.createElement('div');
      this.ghostDOM.className = 'ev-chart-resize-ghost';
      this.wrapperDOM.appendChild(this.resizeDOM);
      this.legendDOM.appendChild(this.legendBoxDOM);
      this.wrapperDOM.appendChild(this.legendDOM);
      this.initLegend();
      this.setLegendPosition(opt.legend.position);
    }
    this.chartRect = this.getChartRect();
  }

  drawChart() {
    this.labelRange = this.getAxesLabelRange();
    this.axesSteps = this.calculateSteps();
    this.drawAxis();
    this.drawSeries();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  drawSeries() {
    let showIndex = 0;
    Object.values(this.seriesList).forEach((series) => {
      series.draw({
        ctx: this.bufferCtx,
        chartRect: this.chartRect,
        labelOffset: this.labelOffset,
        axesSteps: this.axesSteps,
        isHorizontal: this.options.horizontal,
        showSeriesCount: this.showSeriesCount,
        integLabels: this.integratedLabels,
        thickness: this.options.thickness,
        showIndex,
      });

      if (series.show) {
        showIndex++;
      }
    });
  }

  createAxes(dir, axes) {
    const ctx = this.bufferCtx;
    const integLabels = this.integratedLabels;

    return axes.map((axis) => {
      switch (axis.type) {
        case 'linear':
          return new LinearScale(dir, axis, ctx);
        case 'time':
          return new TimeScale(dir, axis, ctx);
        case 'log':
          return new LogarithmicScale(dir, axis, ctx);
        case 'step':
          return new StepScale(dir, axis, ctx, integLabels);
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

  getLabelOffset() {
    const axesX = this.axesX;
    const axesY = this.axesY;
    const range = this.axesRange;
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
  update() {
    const options = this.options;
    const data = this.data.data;
    const labels = this.data.labels;
    const groups = this.data.groups;

    this.integratedLabels = labels.slice();
    if (groups.length) {
      this.addGroupInfo(groups);
    }
    this.createDataSet(data, labels);

    this.minMax = this.getStoreMinMax();
    this.axesX = this.createAxes('x', options.axesX);
    this.axesY = this.createAxes('y', options.axesY);
    this.axesRange = this.getAxesRange();
    this.labelOffset = this.getLabelOffset();

    this.render();
  }
  destroy() {}
  reset() {
    this.seriesList = {};
    this.minMax = null;
    this.axesX = null;
    this.axesY = null;
    this.axesRange = null;
    this.labelOffset = null;
    this.chartRect = null;

    this.titleDOM.remove();
    this.legendDOM.remove();
    this.resizeDOM.remove();
    this.ghostDOM.remove();
  }
  render() {
    this.clear();
    this.chartRect = this.getChartRect();
    this.drawChart();
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
}

export default EvChart;
