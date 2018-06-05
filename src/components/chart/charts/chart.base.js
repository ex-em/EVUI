import _ from 'lodash';
import moment from 'moment';
import { CHART_AXIS_TYPE } from '../core/core.constant';
import DataStore from '../core/core.data';
import Util from '../core/core.util';
import AxisAutoScale from '../core/axis/axis.scale.auto';
import AxisFixedScale from '../core/axis/axis.scale.fixed';
import AxisStepsScale from '../core/axis/axis.scale.steps';

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
        font: '15px Droid Sans',
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
      horizontal: false,
      border: 2,
      doughnutHoleSize: 0,
      reverse: false,
    };

    this.labelOffset = { top: 1, left: 1, right: 1, bottom: 1 };

    this.options = _.merge({}, defaultOptions, options);
    this.data = data;

    this.container = document.createElement('div');
    this.container.className = 'evui-chart-inner';

    const chartAxisType = CHART_AXIS_TYPE[this.options.type];

    if (target === null) {
      throw new Error('[EVUI][ERROR][Chart]-Not found Target for rendering Chart');
    } else {
      target.appendChild(this.container);
    }

    this.createCanvas();
    if (chartAxisType === 'axis') {
      this.createAxesOptions();
    }

    this.dataSet = new DataStore({
      chartData: this.data,
      structureType: this.options.type.toLowerCase() === 'sunburst' ? 'tree' : 'array',
      horizontal: this.options.horizontal,
      chartAxisType,
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
      minIndex: null,
      maxIndex: null,
      autoScaleRatio: null,
      showGrid: true,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: null,
      tickFormat: null,
      tickSize: null,
      labelHeight: 20,
      labelStyle: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Droid Sans',
      },
    };

    const defaultYAxis = {
      position: 'left',
      type: 'linear',
      show: true,
      color: '#eeeeee',
      min: 0,
      max: null,
      minIndex: null,
      maxIndex: null,
      autoScaleRatio: 0.1,
      showGrid: true,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: null,
      tickFormat: null,
      tickSize: null,
      labelWidth: null,
      labelStyle: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Droid Sans',
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
    // 완성 뒤 displayCanvas를 append하도록 변경 필요. (중요**)
    this.container.appendChild(this.bufferCanvas);
  }

  getChartRect() {
    const width = this.container.getBoundingClientRect().width || 10;
    const height = this.container.getBoundingClientRect().height || 10;
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
    let labelText;
    let labelSize;

    const labelBuffer = 20;
    const xAxes = this.options.xAxes;
    const yAxes = this.options.yAxes;

    // 축의 Label 길이 중 가장 큰 value를 기준으로 label offset을 계산.
    // label offset의 buffer size 20px
    for (let ix = 0, ixLen = yAxes.length; ix < ixLen; ix++) {
      this.bufferCtx.font = Util.getLabelStyle(yAxes[ix]);
      labelText = this.dataSet.getLabelTextMaxInfo(ix).yText || '';
      labelSize = this.bufferCtx.measureText(`${labelText}`).width || 0;

      if (yAxes[ix].labelType === 'time') {
        labelSize = moment(labelText);

        if (yAxes[ix].tickFormat) {
          labelSize = labelSize.format(yAxes[ix].tickFormat);
        }
      }

      if (yAxes[ix].position === 'left') {
        if (labelSize > this.labelOffset.left) {
          this.labelOffset.left = labelSize + labelBuffer;
        }
      } else if (yAxes[ix].position === 'right') {
        if (labelSize > this.labelOffset.right) {
          this.labelOffset.right = labelSize + labelBuffer;
        }
      }
    }

    for (let ix = 0, ixLen = xAxes.length; ix < ixLen; ix++) {
      this.bufferCtx.font = Util.getLabelStyle(xAxes[ix]);
      labelText = this.dataSet.getLabelTextMaxInfo(ix).xText || '';
      if (xAxes[ix].labelType === 'time') {
        labelText = moment(labelText);
        if (xAxes[ix].tickFormat) {
          labelText = labelText.format(xAxes[ix].tickFormat);
        }
      }

      labelSize = this.bufferCtx.measureText(`${labelText}`).width || 0;
      if (Math.round(labelSize / 2) > this.labelOffset.right) {
        this.labelOffset.right = Math.round(labelSize / 2) + labelBuffer;
      }

      if (Math.round(labelSize / 2) > this.labelOffset.left) {
        this.labelOffset.left = Math.round(labelSize / 2) + labelBuffer;
      }

      labelSize = this.options.xAxes[ix].labelStyle.fontSize * 2 || 2;
      if (xAxes[ix].position === 'bottom') {
        if (labelSize > this.labelOffset.bottom) {
          this.labelOffset.bottom = labelSize;
        }
      } else if (xAxes[ix].position === 'top') {
        if (labelSize > this.labelOffset.top) {
          this.labelOffset.top = labelSize;
        }
      }
    }
  }

  createTitle() {
    const titleObj = this.options.title;
    this.titleContainer = document.createElement('div');
    this.titleContainer.style.font = titleObj.style;
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

  createAxis() {
    let xAxisObj;
    let yAxisObj;

    this.xAxes = [];
    this.yAxes = [];

    for (let ix = 0, ixLen = this.options.xAxes.length; ix < ixLen; ix++) {
      switch (this.options.xAxes[ix].scaleType) {
        case 'fix':
          xAxisObj = new AxisFixedScale({
            type: 'x',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            horizontal: this.options.horizontal,
          });
          break;
        case 'step':
          xAxisObj = new AxisStepsScale({
            type: 'x',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            category: this.data.category,
            horizontal: this.options.horizontal,
          });
          break;
        case 'auto':
        default:
          xAxisObj = new AxisAutoScale({
            type: 'x',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            horizontal: this.options.horizontal,
          });
          break;
      }

      this.xAxes.push(xAxisObj);
    }

    for (let ix = 0, ixLen = this.options.yAxes.length; ix < ixLen; ix++) {
      switch (this.options.yAxes[ix].scaleType) {
        case 'fix':
          yAxisObj = new AxisFixedScale({
            type: 'y',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            horizontal: this.options.horizontal,
          });
          break;
        case 'step':
          yAxisObj = new AxisStepsScale({
            type: 'y',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            category: this.data.category,
            horizontal: this.options.horizontal,
          });
          break;
        case 'auto':
        default:
          yAxisObj = new AxisAutoScale({
            type: 'y',
            dataSet: this.dataSet,
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisIndex: ix,
            horizontal: this.options.horizontal,
          });
          break;
      }

      this.yAxes.push(yAxisObj);
    }

    for (let ix = 0, ixLen = this.xAxes.length; ix < ixLen; ix++) {
      this.xAxes[ix].createAxis();
    }

    for (let ix = 0, ixLen = this.yAxes.length; ix < ixLen; ix++) {
      this.yAxes[ix].createAxis();
    }
  }

  calculateX(value, xAxisIndex) {
    const maxValue = this.xAxes[xAxisIndex].axisMax;
    const minValue = this.xAxes[xAxisIndex].axisMin;
    let convertValue;

    if (value === null) {
      return null;
    }

    if (this.options.xAxes[xAxisIndex].labelType === 'time') {
      convertValue = +moment(value)._d;
    } else {
      convertValue = value;
    }

    if (convertValue > maxValue || convertValue < minValue) {
      return undefined;
    }

    const scalingFactor = this.drawingXArea() / (maxValue - minValue);
    return (this.chartRect.x1 + this.labelOffset.left) +
      (scalingFactor * (convertValue - (minValue || 0)));
  }

  calculateY(value, yAxisIndex, invert) {
    const maxValue = this.yAxes[yAxisIndex].axisMax;
    const minValue = this.yAxes[yAxisIndex].axisMin;
    let convertValue;
    let calcY;

    if (value === null) {
      return null;
    }

    if (this.options.yAxes[yAxisIndex].labelType === 'time') {
      convertValue = +moment(value)._d;
    } else {
      convertValue = value;
    }

    if (convertValue > maxValue || convertValue < minValue) {
      return null;
    }
    // Bar차트의 fillRect처리를 위해 invert값 추가 하여 Y값을 처리
    const scalingFactor = this.drawingYArea() / (maxValue - minValue);
    if (invert) {
      calcY = -(scalingFactor * (convertValue - (minValue || 0)));
    } else {
      calcY = (this.chartRect.y2 - this.labelOffset.bottom) -
        (scalingFactor * (convertValue - (minValue || 0)));
    }

    return calcY;
  }

  drawingXArea() {
    return this.chartRect.chartWidth - (this.labelOffset.left + this.labelOffset.right);
  }

  drawingYArea() {
    return this.chartRect.chartHeight - (this.labelOffset.top + this.labelOffset.bottom);
  }

  drawPoint(ctx, style, radius, x, y) {
    let edgeLength;
    let xOffset;
    let yOffset;
    let height;
    let size;

    if (isNaN(radius) || radius <= 0) {
      return;
    }

    let offset;
    let leftX;
    let topY;
    let sideSize;

    switch (style) {
      // Default includes circle
      case 'triangle':
        ctx.beginPath();
        edgeLength = (3 * radius) / Math.sqrt(3);
        height = (edgeLength * Math.sqrt(3)) / 2;
        ctx.moveTo(x - (edgeLength / 2), y + (height / 3));
        ctx.lineTo(x + (edgeLength / 2), y + (height / 3));
        ctx.lineTo(x, y - ((2 * height) / 3));
        ctx.closePath();
        ctx.fill();
        break;
      case 'rect':
        size = (1 / Math.SQRT2) * radius;
        ctx.beginPath();
        ctx.fillRect(x - size, y - size, 2 * size, 2 * size);
        ctx.strokeRect(x - size, y - size, 2 * size, 2 * size);
        break;
      case 'rectRounded':
        offset = radius / Math.SQRT2;
        leftX = x - offset;
        topY = y - offset;
        sideSize = Math.SQRT2 * radius;
        ctx.beginPath();
        this.roundedRect(ctx, leftX, topY, sideSize, sideSize, radius / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'rectRot':
        size = (1 / Math.SQRT2) * radius;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y - size);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cross':
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y - radius);
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      case 'crossRot':
        ctx.beginPath();
        xOffset = Math.cos(Math.PI / 4) * radius;
        yOffset = Math.sin(Math.PI / 4) * radius;
        ctx.moveTo(x - xOffset, y - yOffset);
        ctx.lineTo(x + xOffset, y + yOffset);
        ctx.moveTo(x - xOffset, y + yOffset);
        ctx.lineTo(x + xOffset, y - yOffset);
        ctx.closePath();
        break;
      case 'star':
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y - radius);
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        xOffset = Math.cos(Math.PI / 4) * radius;
        yOffset = Math.sin(Math.PI / 4) * radius;
        ctx.moveTo(x - xOffset, y - yOffset);
        ctx.lineTo(x + xOffset, y + yOffset);
        ctx.moveTo(x - xOffset, y + yOffset);
        ctx.lineTo(x + xOffset, y - yOffset);
        ctx.closePath();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      case 'dash':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + radius, y);
        ctx.closePath();
        break;
      default:
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.stroke();
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
