import _ from 'lodash';
import moment from 'moment';
import { CHART_AXIS_TYPE } from '../core/core.constant';
import DataStore from '../core/data/data';
import StackDataStore from '../core/data/data.stack';
import Util from '../core/core.util';
import AxisAutoScale from '../core/axis/axis.scale.auto';
import AxisFixedScale from '../core/axis/axis.scale.fixed';
import AxisStepsScale from '../core/axis/axis.scale.steps';
import Legend from '../core/core.legend';

class BaseChart {
  constructor(target, data, options) {
    // step1. Create Chart Property Object.
    const defaultOptions = {
      colors: [
        '#2b99f0', '#8ac449', '#00C4C5', '#ffde00', '#ff7781', '#8470ff', '#75cd8e',
        '#48d1cc', '#fec64f', '#fe984f', '#0052ff', '#00a48c', '#83cfde', '#dfe32d',
        '#ff7d40', '#99c7ff', '#a5fee3', '#0379c9', '#eef093', '#ffa891', '#00c5cd',
        '#009bc7', '#cacaff', '#ffc125', '#df6264',
      ],
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      border: 2,
      title: {
        show: false,
        height: 40,
        text: '',
        style: {
          fontSize: 15,
          color: '#000',
          fontFamily: 'Droid Sans',
        },
      },
      legend: {
        show: true,
        position: 'right',
        color: '#000',
        inactive: '#aaa',
      },
      itemHighlight: true,
      seriesHighlight: true,
      useSelect: false,
      doughnutHoleSize: 0,
      reverse: false,
      bufferSize: null,
      horizontal: false,
      width: '100%',
      height: '100%',
      thickness: 1,
      useTooltip: true,
      useSelectionData: false,
    };

    const defaultData = {
      series: {},
      groups: [],
      data: [],
    };

    this.labelOffset = { top: 2, left: 2, right: 2, bottom: 2 };

    // set chart properties
    this.options = _.merge({}, defaultOptions, options);
    this.data = _.merge({}, defaultData, data);

    this.options.type = this.options.type.toLowerCase();

    if (CHART_AXIS_TYPE[this.options.type] === 'axis') {
      this.setAxesOptions();
    }

    // step2. Create Target DOM Wrapper
    const targetRect = target.getBoundingClientRect();

    const targetWidth = targetRect.width - 10 || 10;
    const targetHeight = targetRect.height - 10 || 10;

    this.wrapperDOM = document.createElement('div');
    this.wrapperDOM.className = 'ev-chart-wrapper';
    this.wrapperDOM.style.width = `${targetWidth}px`;
    this.wrapperDOM.style.height = `${targetHeight}px`;
    this.wrapperDOM.style.display = 'block';
    this.chartDOM = document.createElement('div');
    this.chartDOM.className = 'ev-chart-container';
    this.chartDOM.style.width = `${targetWidth}px`;
    this.chartDOM.style.height = `${targetHeight}px`;

    if (target === null) {
      throw new Error('[EVUI][ERROR][Chart]-Not found Target for rendering Chart');
    } else {
      this.wrapperDOM.appendChild(this.chartDOM);
      target.appendChild(this.wrapperDOM);
    }

    // step3. Create Chart Canvas
    this.createCanvas();

    // step4. Create Component of Chart.
    // 4-1. store
    this.createDataStore();
    this.store.init();

    // 4-2. title
    if (this.options.title.show) {
      this.createTitle();
    }

    // 4-3. legend
    if (this.options.legend.show) {
      this.createLegend();
      this.legend.init();
    }

    // step5. Calculate Size.
    this.chartRect = this.getChartRect();

    this.xMinMax = this.store.getXMinMax();
    this.yMinMax = this.store.getYMinMax();
    this.axisList = this.store.getAxisList();
    this.seriesList = this.store.getSeriesList();
    this.graphData = this.store.getGraphData();


    // step6. tooltip
    if (this.options.useTooltip) {
      this.createTooltip();
    }
    // step6. Add EventListener
    this.overlayCanvas.onmousemove = this.mouseMoveEvent.bind(this);
    this.overlayCanvas.onmouseout = this.mouseOutEvent.bind(this);
    this.resizeEvent = this.resize.bind(this);

    window.addEventListener('resize', this.resizeEvent);
  }

  createCanvas() {
    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.setAttribute('style', 'display: block;');
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.setAttribute('style', 'display: block;');
    this.bufferCtx = this.bufferCanvas.getContext('2d');
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.setAttribute('style', 'display: block;');
    this.overlayCtx = this.overlayCanvas.getContext('2d');


    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio || 1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;
    this.oldPixelRatio = this.pixelRatio;

    this.chartDOM.appendChild(this.displayCanvas);
    this.chartDOM.appendChild(this.overlayCanvas);

    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.top = '0px';
    this.overlayCanvas.style.left = '0px';
  }

  createDataStore() {
    if (this.data.groups.length) {
      this.store = new StackDataStore({
        chartData: this.data,
        chartOptions: this.options,
      });
    } else {
      this.store = new DataStore({
        chartData: this.data,
        chartOptions: this.options,
      });
    }
  }

  createLegend() {
    const seriesList = this.store.getSeriesList();
    const groups = this.data.groups;

    this.legend = new Legend({
      wrapperDOM: this.wrapperDOM,
      chartDOM: this.chartDOM,
      chartOptions: this.options,
      seriesList,
      groups,
      overlayCanvas: this.overlayCanvas,
      resize: this.resize.bind(this),
      updateChart: this.updateChart.bind(this),
      overlayClear: this.overlayClear.bind(this),
      seriesHighlight: this.seriesHighlight.bind(this),
    });
  }

  createTooltip() {
    const skey = Object.keys(this.seriesList);
    const groups = this.data.groups;

    let series;


    this.tooltipDOM = document.createElement('div');
    this.tooltipDOM.className = 'ev-chart-tooltip';
    this.tooltipDOM.style.display = 'none';

    this.tooltipTitleDOM = document.createElement('div');
    this.tooltipTitleDOM.className = 'ev-chart-tooltip-title';

    this.ulDOM = document.createElement('ul');
    this.ulDOM.className = 'ev-chart-tooltip-ul';

    this.tooltipDOM.appendChild(this.tooltipTitleDOM);
    this.tooltipDOM.appendChild(this.ulDOM);

    if (groups.length) {
      for (let ix = 0, ixLen = groups.length; ix < ixLen; ix++) {
        const group = groups[ix];
        for (let jx = group.length - 1; jx >= 0; jx--) {
          series = this.seriesList[group[jx]];

          if (series.show) {
            this.createTooltipDOM(group[jx]);
          }
        }
      }
    }

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = this.seriesList[skey[ix]];

      if (!series.isExistGrp && series.show) {
        this.createTooltipDOM(skey[ix]);
      }
    }
    document.body.appendChild(this.tooltipDOM);
  }

  createTooltipDOM(seriesId) {
    const series = this.seriesList[seriesId];

    const liDOM = document.createElement('li');
    liDOM.className = 'ev-chart-tooltip-li';
    liDOM.setAttribute('data-series-id', seriesId);

    const colorDOM = document.createElement('span');
    colorDOM.className = 'ev-chart-tooltip-color';
    colorDOM.style.backgroundColor = series.color;

    const nameDOM = document.createElement('span');
    nameDOM.className = 'ev-chart-tooltip-name';
    nameDOM.textContent = series.name;

    const colonDOM = document.createElement('span');
    colonDOM.className = 'ev-chart-tooltip-colon';
    colonDOM.textContent = ' : ';

    const valueDOM = document.createElement('span');
    valueDOM.className = 'ev-chart-tooltip-value';

    liDOM.appendChild(colorDOM);
    liDOM.appendChild(nameDOM);
    liDOM.appendChild(colonDOM);
    liDOM.appendChild(valueDOM);
    this.ulDOM.appendChild(liDOM);
  }

  setAxesOptions() {
    const paramXAxes = this.options.xAxes;
    const paramYAxes = this.options.yAxes;
    const type = this.options.type;
    const hasGroup = !!this.data.groups.length;

    const defaultXAxis = {
      position: 'bottom',
      min: null,
      max: null,
      autoScaleRatio: null,
      isSetMinZero: type === 'bar' || hasGroup,
      showGrid: false,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      labelIndicatorColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: null,
      timeFormat: null,
      tickSize: null,
      range: null,
      labelHeight: 20,
      labelStyle: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Droid Sans',
      },
    };

    const defaultYAxis = {
      position: 'left',
      min: null,
      max: null,
      autoScaleRatio: null,
      isSetMinZero: type === 'bar' || hasGroup,
      showGrid: true,
      axisLineColor: '#b4b6ba',
      gridLineColor: '#e7e9ed',
      labelIndicatorColor: '#e7e9ed',
      gridLineWidth: 1,
      ticks: null,
      timeFormat: null,
      tickSize: null,
      range: null,
      labelWidth: null,
      labelStyle: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Droid Sans',
      },
    };

    if (paramXAxes) {
      for (let ix = 0, ixLen = paramXAxes.length; ix < ixLen; ix++) {
        paramXAxes[ix] = _.merge({}, defaultXAxis, paramXAxes[ix]);
      }
    } else {
      this.options.xAxes = [defaultXAxis];
    }

    if (paramYAxes) {
      for (let ix = 0, ixLen = paramYAxes.length; ix < ixLen; ix++) {
        paramYAxes[ix] = _.merge({}, defaultYAxis, paramYAxes[ix]);
      }
    } else {
      this.options.yAxes = [defaultYAxis];
    }
  }

  getChartRect() {
    const padding = this.constructor.getPadding(this.options.padding);

    let width = this.chartDOM.getBoundingClientRect().width || 10;
    let height = this.chartDOM.getBoundingClientRect().height || 10;

    const legendOption = this.options.legend;

    if (legendOption.show) {
      switch (legendOption.position) {
        case 'top':
        case 'bottom':
          height -= (this.legend.legendHeight + 12);
          break;
        case 'left':
        case 'right':
          width -= this.legend.legendWidth;
          this.legend.legendDOM.style.height = `${height}px`;
          this.legend.resizeDOM.style.height = `${height}px`;
          break;
        default:
          break;
      }
    }

    this.setWidth(width);
    this.setHeight(height);

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

    const ctx = this.bufferCtx;
    const xMinMax = this.xMinMax;
    const yMinMax = this.yMinMax;

    // 축의 Label 길이 중 가장 큰 value를 기준으로 label offset을 계산.
    // label offset의 buffer size 20px
    for (let ix = 0, ixLen = yAxes.length; ix < ixLen; ix++) {
      ctx.font = Util.getLabelStyle(yAxes[ix]);

      if (yAxes[ix].timeFormat !== null) {
        labelText = `${moment(yMinMax[ix].max).format(yAxes[ix].timeFormat)}`;
      } else {
        labelText = `${yMinMax[ix].max}`;
      }

      labelSize = Math.ceil(this.bufferCtx.measureText(labelText).width) || 0;

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
      ctx.font = Util.getLabelStyle(xAxes[ix]);

      if (xAxes[ix].timeFormat !== null) {
        labelText = `${moment(xMinMax[ix].max).format(xAxes[ix].timeFormat)}`;
      } else {
        labelText = `${xMinMax[ix].max}`;
      }

      labelSize = Math.ceil(this.bufferCtx.measureText(labelText).width) || 0;

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
    this.titleDOM = document.createElement('div');
    this.titleDOM.style.fontSize = titleObj.style.fontSize;
    this.titleDOM.style.color = titleObj.style.color;
    this.titleDOM.style.fontFamily = titleObj.style.fontFamily;
    this.titleDOM.textContent = titleObj.text;

    const height = this.chartDOM.getBoundingClientRect().height;

    if (titleObj.show) {
      this.titleDOM.style.display = 'block';
      this.wrapperDOM.style.paddingTop = `${titleObj.height}px`;
      this.chartDOM.style.height = `${height - titleObj.height}px`;
    } else {
      this.titleDOM.style.display = 'none';
      this.wrapperDOM.style.paddingTop = '0';
      this.chartDOM.style.height = `${height + titleObj.height}px`;
    }

    this.titleDOM.className = 'ev-chart-title';
    this.titleDOM.style.height = `${titleObj.height}px`;
    this.titleDOM.style.lineHeight = `${titleObj.height}px`;
    this.wrapperDOM.appendChild(this.titleDOM);
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
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
          });
          break;
        case 'step':
          xAxisObj = new AxisStepsScale({
            type: 'x',
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisData: this.axisList.x[ix] || [],
          });
          break;
        case 'auto':
        default:
          xAxisObj = new AxisAutoScale({
            type: 'x',
            chartRect: this.chartRect,
            options: this.options.xAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
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
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
          });
          break;
        case 'step':
          yAxisObj = new AxisStepsScale({
            type: 'y',
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
            axisData: this.axisList.y[ix] || [],
          });
          break;
        case 'auto':
        default:
          yAxisObj = new AxisAutoScale({
            type: 'y',
            chartRect: this.chartRect,
            options: this.options.yAxes[ix],
            ctx: this.bufferCtx,
            labelOffset: this.labelOffset,
          });
          break;
      }

      this.yAxes.push(yAxisObj);
    }

    for (let ix = 0, ixLen = this.xAxes.length; ix < ixLen; ix++) {
      this.xAxes[ix].createAxis(this.xMinMax[ix]);
    }

    for (let ix = 0, ixLen = this.yAxes.length; ix < ixLen; ix++) {
      this.yAxes[ix].createAxis(this.yMinMax[ix]);
    }
  }

  calculateX(value, xAxisIndex, isReqSp) {
    const maxValue = this.xAxes[xAxisIndex].axisMax;
    const minValue = this.xAxes[xAxisIndex].axisMin;
    let convertValue;

    if (value === null) {
      return null;
    }

    if (this.options.xAxes[xAxisIndex].labelType === 'time') {
      convertValue = +moment(value);
    } else {
      convertValue = value;
    }

    if (convertValue > maxValue || convertValue < minValue) {
      return null;
    }

    const sp = isReqSp ? this.chartRect.x1 + this.labelOffset.left : 0;
    const scalingFactor = this.drawingXArea() / (maxValue - minValue);
    return Math.ceil(sp + (scalingFactor * (convertValue - (minValue || 0))));
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
      convertValue = +moment(value);
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

    return Math.floor(calcY);
  }

  calculateXP(point, xAxisIndex, isReqSp) {
    const maxValue = this.xAxes[xAxisIndex].axisMax;
    const minValue = this.xAxes[xAxisIndex].axisMin;
    let convertValue;

    if (point === null) {
      return null;
    }

    const sp = isReqSp ? this.chartRect.x1 + this.labelOffset.left : 0;
    const value = Math.ceil((((point - sp) * (maxValue - minValue)) /
      this.drawingXArea()) + minValue);


    if (this.options.xAxes[xAxisIndex].labelType === 'time') {
      convertValue = +moment(value);
    } else {
      convertValue = value;
    }

    return convertValue;
  }

  calculateYP(point, yAxisIndex, invert) {
    const maxValue = this.yAxes[yAxisIndex].axisMax;
    const minValue = this.yAxes[yAxisIndex].axisMin;
    let convertValue;

    if (point === null) {
      return null;
    }
    const sp = this.chartRect.y1 + this.labelOffset.top;
    const value = Math.ceil((((point - sp) * (maxValue - minValue)) / this.drawingYArea()));


    if (this.options.yAxes[yAxisIndex].labelType === 'time') {
      convertValue = +moment(value);
    } else {
      convertValue = value;
    }

    if (!invert) {
      convertValue = maxValue - convertValue;
    }

    return convertValue;
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

  findHitItem(offset, graphData) {
    const mouseY = offset[1];
    const index = this.findHitAxisX(offset[0], graphData);
    const skey = Object.keys(graphData);

    let gdata;
    let sId = null;

    if (index !== null && index > -1) {
      for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
        gdata = graphData[skey[ix]];

        if (gdata[index].yp !== null &&
          mouseY >= (gdata[index].yp - 10) && mouseY <= (gdata[index].yp + 10)) {
          sId = skey[ix];
          break;
        }
      }
    }

    return { index, sId };
  }

  findHitAxisX(mouseX, graphData) {
    const x2 = this.chartRect.x2 - this.labelOffset.right;
    const x1 = this.chartRect.x1 + this.labelOffset.left;
    const width = x2 - x1;

    const skey = Object.keys(graphData);
    let sId;

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      if (this.seriesList[skey[ix]].show) {
        sId = skey[ix];
        break;
      }
    }

    const gdata = graphData[sId];

    if (mouseX >= (x1 - 10) && mouseX <= (x2 + 10)) {
      const index = Math.round(((gdata.length - 1) / width) * (mouseX - x1));

      if (mouseX <= (gdata[index].xp + 10) && mouseX >= (gdata[index].xp - 10)) {
        return index;
      }
    }

    return null;
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
      this.resize();
    }
    if (devicePixelRatio !== backingStoreRatio) {
      this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);
      this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
    }
  }

  resize() {
    if (!this.chartDOM) {
      return;
    }

    const offset = this.chartDOM.getBoundingClientRect();
    const bufferCtx = this.bufferCtx;

    if (offset) {
      bufferCtx.restore();
      bufferCtx.save();
      bufferCtx.scale(this.pixelRatio, this.pixelRatio);

      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(this.updateChart.bind(this), 50);
      this.legend.updateLegendPosition();
    }

    window.removeEventListener('mousemove', this.resizeEvent, false);
  }

  updateChart() {
    if (!this.chartRect.width || !this.chartRect.height ||
      this.chartRect.width < 1 || this.chartRect.height < 1) {
      return;
    }

    this.store.updateData();
    this.graphData = this.store.getGraphData();
    this.xMinMax = this.store.getXMinMax();
    this.yMinMax = this.store.getYMinMax();
    this.axisList = this.store.getAxisList();

    this.chartRect = this.getChartRect();
    this.initScale();

    this.clearDraw();
    this.drawChart();
  }

  overlayClear() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio);
  }

  clearDraw() {
    this.clearRectRatio = (this.pixelRatio < 1) ? this.pixelRatio : 1;

    this.displayCtx.clearRect(0, 0, this.displayCanvas.width / this.clearRectRatio,
      this.displayCanvas.height / this.clearRectRatio);
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width / this.clearRectRatio,
      this.bufferCanvas.height / this.clearRectRatio);
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / this.clearRectRatio,
      this.overlayCanvas.height / this.clearRectRatio);
  }


  mouseMoveEvent(e) {
    const graphData = this.graphData;
    const offset = this.getMousePosition(e);
    const item = this.findHitItem(offset, graphData);

    if (this.selectBox && this.selectBox.active) {
      return;
    }

    this.overlayClear();

    if (this.options.useTooltip && item.sId !== null) {
      const series = this.seriesList[item.sId];
      const axisType = series.axisType;
      const axisIndex = axisType === 'x' ? series.xAxisIndex : series.yAxisIndex;
      const axis = axisType === 'x' ? this.xAxes[axisIndex] : this.yAxes[axisIndex];

      let adata = this.axisList[axisType][axisIndex][item.index];

      if (axis.options.timeFormat) {
        adata = moment(adata).format(axis.options.timeFormat);
      }

      this.showTooltip(offset, e, item, graphData, adata);
    } else {
      this.hideTooltip();
    }

    if (this.options.itemHighlight) {
      if (item && this.itemHighlight) {
        this.itemHighlight(item);
      }
    }
  }

  showTooltip(offset, e, item, graphData, adata) {
    const index = item.index;

    if (index === null) {
      this.tooltipDOM.style.display = 'none';
      return;
    }

    const offsetX = offset[0];
    const offsetY = offset[1];

    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    if ((offsetX >= (graphPos.x1 - 1) && offsetX <= (graphPos.x2))
      && (offsetY >= (graphPos.y1 - 1) && offsetY <= (graphPos.y2 + 1))) {
      this.tooltipTitleDOM.textContent = adata || '';

      const listDOM = this.ulDOM.children;
      let sId;
      let series;
      let valueDOM;
      let gdata;

      for (let ix = 0, ixLen = listDOM.length; ix < ixLen; ix++) {
        sId = listDOM[ix].dataset.seriesId;
        series = this.seriesList[sId];

        if (series.groupIndex === null) {
          gdata = graphData[sId][index].y;
        } else {
          gdata = graphData[sId][index].i;
        }


        if (series && series.show) {
          listDOM[ix].style.display = 'block';
          valueDOM = listDOM[ix].children[3];
          valueDOM.textContent = gdata;
        } else {
          listDOM[ix].style.display = 'none';
        }
      }

      this.tooltipDOM.style.display = 'block';

      if (offsetX > ((graphPos.x2 * 4) / 5) || clientX > ((bodyWidth * 4) / 5)) {
        this.tooltipDOM.style.left = `${mouseX - (this.tooltipDOM.clientWidth + 10)}px`;
      } else {
        this.tooltipDOM.style.left = `${mouseX + 15}px`;
      }

      if (offsetY > ((graphPos.y2 * 3) / 4) || clientY > ((bodyHeight * 3) / 4)) {
        this.tooltipDOM.style.top = `${mouseY - (this.tooltipDOM.clientHeight + 5)}px`;
      } else {
        this.tooltipDOM.style.top = `${mouseY + 10}px`;
      }
    } else {
      this.tooltipDOM.style.display = 'none';
    }
  }

  hideTooltip() {
    this.tooltipDOM.style.display = 'none';
  }

  getMousePosition(evt) {
    let mouseX;
    let mouseY;

    const e = evt.originalEvent || evt;
    const boundingRect = this.overlayCanvas.getBoundingClientRect();

    if (e.touches) {
      mouseX = e.touches[0].clientX - boundingRect.left;
      mouseY = e.touches[0].clientY - boundingRect.top;
    } else {
      mouseX = e.clientX - boundingRect.left;
      mouseY = e.clientY - boundingRect.top;
    }

    return [mouseX, mouseY];
  }

  mouseOutEvent() {
    if (!this.selectBox || (this.selectBox && !this.selectBox.active)) {
      this.overlayClear();
    }

    if (this.options.useTooltip) {
      this.hideTooltip();
    }
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
