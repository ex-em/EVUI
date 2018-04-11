import _ from 'lodash';
import moment from 'moment';
import DataStore from '../core/core.data';

class BaseChart {
  constructor(target, data, options) {
    // default chart info
    const defaultOptions = {
      colors: ['#2b99f0', '#8ac449', '#009697', '#959c2c', '#004ae7', '#01cc00', '#15679a',
        '#43bcd7', '#e76627', '#5C8558', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE',
        '#BCF061', '#B26600', '#27358F', '#A4534D', '#B89630', '#A865B4', '#254763', '#536859',
        '#E9F378', '#888A79', '#D67D4B', '#2BEC69', '#4A2BEC', '#2BBEEC', '#DDACDF',
      ],
      title: {
        text: '',
        font: '15px Arial',
        color: '#000000',
        height: 40,
        show: false,
      },
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
    };

    this.labelOffset = { top: 1, left: 1, right: 1, bottom: 1 };

    this.options = _.merge({}, defaultOptions, options);
    this.data = data;

    this.container = document.createElement('div');
    this.container.className = 'evui-chart-inner';


    if (target === null) {
      throw new Error('[EVUI][ERROR][Chart]-Not found Target for rendering Chart');
    } else {
      target.appendChild(this.container);
    }

    this.createCanvas();
    this.createAxesOptions();

    this.dataSet = new DataStore({
      chartData: this.data,
    });

    this.dataSet.init();
    this.chartRect = this.getChartRect();
  }

  createAxesOptions() {
    const paramXAxes = this.options.xAxes;
    const paramYAxes = this.options.yAxes;

    const defaultXAxis = {
      position: 'bottom',
      type: 'linear',
      show: true,
      color: '#eeeeee',
      min: null,
      max: null,
      minIndex: undefined,
      maxIndex: undefined,
      autoScaleRatio: null,
      showGrid: true,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: undefined,
      tickFormat: undefined,
      tickSize: null,
      labelHeight: 20,
      labelStyle: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'normal',
      },
    };

    const defaultYAxis = {
      position: 'left',
      type: 'linear',
      show: true,
      color: '#eeeeee',
      min: 0,
      max: null,
      minIndex: undefined,
      maxIndex: undefined,
      autoScaleRatio: 0.1,
      showGrid: true,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: undefined,
      tickFormat: undefined,
      tickSize: null,
      labelWidth: undefined,
      labelStyle: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'normal',
      },
    };

    if (paramXAxes && paramXAxes.length) {
      for (let ix = 0, ixLen = paramXAxes.length; ix < ixLen; ix++) {
        paramXAxes[ix] = _.merge({}, defaultXAxis, paramXAxes[ix]);
      }
    } else {
      this.options.xAxes = [defaultXAxis];
    }

    if (paramYAxes && paramYAxes.length) {
      for (let ix = 0, ixLen = paramYAxes.length; ix < ixLen; ix++) {
        paramYAxes[ix] = _.merge({}, defaultYAxis, paramYAxes[ix]);
      }
    } else {
      this.options.yAxes = [defaultYAxis];
    }
  }

  createCanvas() {
    this.displayCanvas = document.createElement('canvas');
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio || 1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;

    this.container.appendChild(this.bufferCanvas);
  }

  getChartRect() {
    const width = this.container.getBoundingClientRect().width || 0;
    const height = this.container.getBoundingClientRect().height || 0;
    this.setWidth(width);
    this.setHeight(height);

    const padding = this.constructor.getPadding(this.options.padding);
    const chartWidth = width - (padding.left + padding.right);
    const chartHeight = height - (padding.top + padding.bottom);

    const x1 = padding.left;
    const x2 = Math.max(width - padding.right, x1 + 1);
    const y1 = padding.top;
    const y2 = Math.max(height - padding.bottom, y1 + 1);

    return {
      x1,
      x2,
      y1,
      y2,
      padding,
      chartWidth,
      chartHeight,
      width,
      height,
    };
  }

  setLabelOffset() {
    let maxValue;
    let labelSize;

    for (let ix = 0, ixLen = this.options.yAxes.length; ix < ixLen; ix++) {
      maxValue = this.dataSet.getYValueAxisPerSeries(ix).max || 0;
      if (this.options.yAxes[ix].tickFormat !== undefined &&
        this.options.yAxes[ix].type === 'time') {
        maxValue = moment(maxValue).format(this.options.yAxes[ix].tickFormat);
      }
      labelSize = this.bufferCtx.measureText(`${maxValue}`).width;
      if (this.options.yAxes[ix].position === 'left') {
        if (labelSize > this.labelOffset.left) {
          this.labelOffset.left = labelSize + 20; // 20은 buffer value.
        }
      } else if (this.options.yAxes[ix].position === 'right') {
        if (labelSize > this.labelOffset.right) {
          this.labelOffset.right = labelSize + 20; // 20은 buffer value.
        }
      }
    }

    for (let ix = 0, ixLen = this.options.xAxes.length; ix < ixLen; ix++) {
      // X축 라벨 넓이의 반이 right offset을 넘는다면
      // 아직 X축의 위치 (left, right) 에 따른 로직은 미완성 상태.
      maxValue = this.dataSet.getLabelTextMaxInfo().xText;
      if (this.options.xAxes[ix].tickFormat !== undefined &&
        this.options.xAxes[ix].type === 'time') {
        maxValue = moment(maxValue).format(this.options.yAxes[ix].tickFormat);
        labelSize = this.bufferCtx.measureText(maxValue).width;

        if (Math.round(labelSize / 2) > this.labelOffset.right) {
          this.labelOffset.right = Math.round(labelSize / 2);
        }
      }

      labelSize = this.options.xAxes[ix].labelStyle.fontSize * 2 || 0;
      if (this.options.xAxes[ix].position === 'bottom') {
        if (labelSize > this.labelOffset.bottom) {
          this.labelOffset.bottom = labelSize;
        }
      } else if (this.options.xAxes[ix].position === 'top') {
        if (labelSize > this.labelOffset.top) {
          this.labelOffset.top = labelSize;
        }
      }
    }
  }

  createTitle() {
    const titleObj = this.options.title;
    this.titleContainer = document.createElement('div');
    this.titleContainer.textContent = titleObj.text;

    if (titleObj.show) {
      this.titleContainer.style.display = 'block';
      this.container.style.paddingTop = `${titleObj.height}px`;
    } else {
      this.titleContainer.style.display = 'none';
      this.container.style.paddingTop = '0';
    }

    this.titleContainer.className = 'evui-chart-title';
    this.titleContainer.style.height = `${titleObj.height}px`;
    this.container.appendChild(this.titleContainer);
  }

  setWidth(width) {
    if (!this.displayCanvas) {
      return;
    }
    this.displayCanvas.width = width * this.pixelRatio;
    this.displayCanvas.style.width = `${width}px`;
    this.bufferCanvas.width = width * this.pixelRatio;
    this.bufferCanvas.style.width = `${width}px`;
  }

  setHeight(height) {
    if (!this.displayCanvas) {
      return;
    }
    this.displayCanvas.height = height * this.pixelRatio;
    this.displayCanvas.style.height = `${height}px`;
    this.bufferCanvas.height = height * this.pixelRatio;
    this.bufferCanvas.style.height = `${height}px`;
  }

  static getPadding(padding) {
    return typeof padding === 'number' ? {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
    } : {
      top: padding.top,
      right: padding.right,
      bottom: padding.bottom,
      left: padding.left,
    };
  }
}

export default BaseChart;
