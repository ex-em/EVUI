import _ from 'lodash';
import DataStore from '../core/core.data';
import ChartYAxis from '../core/core.yaxis';
import ChartXAxis from '../core/core.xaxis';
import ChartBrush from '../core/core.brush';
import Util from '../core/core.util';

export default class BaseChart {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
    this.toFixedNumber = 3;
    this.dataBufferSize = 60;

    this.displayCanvas = document.createElement('canvas');
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d');
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    this.container = document.createElement('div');
    this.container.className = 'evui-chart-outer';
    this.chartContainer = document.createElement('div');
    this.chartContainer.className = 'evui-chart-inner';

    this.chartContainer.appendChild(this.displayCanvas);
    this.chartContainer.appendChild(this.overlayCanvas);

    this.container.appendChild(this.chartContainer);

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      this.displayCtx.webkitBackingStorePixelRatio ||
      this.displayCtx.mozBackingStorePixelRatio ||
      this.displayCtx.msBackingStorePixelRatio ||
      this.displayCtx.oBackingStorePixelRatio ||
      this.displayCtx.backingStorePixelRatio || 1;

    this.pixelRatio = devicePixelRatio / backingStoreRatio;

    // default chart info
    const defaultProps = {
      colors: ['#2b99f0', '#8ac449', '#009697', '#959c2c', '#004ae7', '#01cc00', '#15679a',
        '#43bcd7', '#e76627', '#5C8558', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE',
        '#BCF061', '#B26600', '#27358F', '#A4534D', '#B89630', '#A865B4', '#254763', '#536859',
        '#E9F378', '#888A79', '#D67D4B', '#2BEC69', '#4A2BEC', '#2BBEEC', '#DDACDF',
      ],
      title: {
        text: '',
        font: '15px Arial',
        color: '#000000',
        align: 'center',
        height: 40,
        show: false,
      },
      xAxes: [{
        position: 'bottom',
        axisTitle: '',
        showAxisTitle: false,
        axisTitleStyle: '12px Arial',
        unit: 'number',
        show: true,
        mode: undefined,
        min: null,
        max: null,
        autoScaleRatio: null,
        ticks: undefined,
        tickLength: 3,
        tickDecimals: undefined,
        labelHeight: 20,
        labelStyle: {
          fontSize: 13,
          color: '#333',
          fontFamily: 'normal',
        },
      }],
      yAxes: [{
        position: 'left',
        axisTitle: '',
        showAxisTitle: false,
        axisTitleStyle: '12px Arial',
        unit: 'number',
        show: true,
        mode: undefined,
        min: 0,
        minIndex: undefined,
        max: null,
        maxIndex: undefined,
        autoScaleRatio: 0.2,
        ticks: undefined,
        tickLength: undefined,
        tickDecimals: undefined,
        scale: 0,
        labelWidth: undefined,
        labelStyle: {
          fontSize: 13,
          color: '#333',
          fontFamily: 'normal',
        },
      }],
      grid: {
        gridLineWidth: 1,
        gridLineColor: '#f1f1f1',
        showXLine: true,
        showYLine: true,
        padding: 0,
        border: {
          color: '#eee',
        },
        mouseActiveRadius: 10,
      },
      series: {
        lines: {
          show: true,
          lineWidth: 2,
          fill: false,
          fillColor: undefined,
          steps: false,
        },
        point: {
          show: false,
          lineWidth: 3,
          color: '#fff',
          fill: true,
          fillColor: undefined,
          radius: 3,
        },
      },
    };

    const defaultStyles = {
      width: '100%',
      height: '100%',
      background: '#FFFFFF',
    };

    const defaultData = {
      series: [],
      data: {},
    };

    this.props = _.merge({}, defaultProps, this.props);
    this.styles = _.merge({}, defaultStyles, this.styles);
    this.data = _.merge({}, defaultData, this.data);

    if (this.target === null) {
      throw new Error('[EVUI][ERROR][Chart]-Not found Target for rendering Chart');
    } else {
      this.target.appendChild(this.container);
    }
  }

  init() {
    // setting chart layout
    this.width = this.chartContainer.offsetWidth;
    this.height = this.chartContainer.offsetHeight;
    this.setWidth(this.width);
    this.setHeight(this.height);

    // setting chart data
    this.initChartData();

    // setting chart options (title, legend ...)
    if (this.props.title.show) {
       this.createTitle();
    }

    // chart draw
    this.draw();
  }

  initChartData() {
    const ds = new DataStore({
      chartData: this.data,
    });

    ds.init();

    this.seriesList = ds.getSeriesList();
    this.maxValueInfo = ds.getMaxValueInfo();
    this.minValueInfo = ds.getMinValueInfo();
    this.labelTextMaxInfo = ds.getLabelTextMaxInfo();
    this.valuesMaxCount = ds.getMaxDataCount();
    this.yMaxValue = ds.getYMaxValue();
    this.yMinValue = ds.getYMinValue();
    this.xMaxValue = ds.getXMaxValue();
  }

  createTitle() {
    const titleObj = this.props.title;
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

  draw() {
    this.createChartGrid();
    this.createChartAxis();

    const brush = new ChartBrush({
      type: 'line',
      ctx: this.bufferCtx,
      seriesList: this.seriesList,
      offset: this.offset,
      colors: this.props.color,
      minValueInfo: this.yAxis.getAxisMinValue(),
      seriesProps: this.props.series,
    });

    brush.draw();
    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createChartGrid() {
    this.offset = {
      grid: {
        x: undefined,
        x2: undefined,
        y: undefined,
        y2: undefined,
      },
      xAxis: {
        steps: undefined,
        labelWidth: 0,
        point: [],
      },
      yAxis: {
        steps: undefined,
        stepValue: undefined,
        min: undefined,
        max: undefined,
        startPoint: undefined,
        endPoint: undefined,
        labelWidth: 0,
        point: undefined,
      },
    };

    this.calculateYRange();
    this.calculateGridOffset();
    this.calculateXRange();
  }

  calculateYRange() {
    const yAxes = this.props.yAxes;
    const padding = this.props.grid.padding;

    let axisMax = null;
    let axisMin = null;
    let axisLabelFontSize = null;
    let axisMaxScale = null;

    for (let ix = 0, ixLen = yAxes.length; ix < ixLen; ix++) {
      if (ix === 0) {
        axisMax = yAxes[ix].max;
        axisMin = yAxes[ix].min;
        axisLabelFontSize = +yAxes[ix].labelStyle.fontSize;
        axisMaxScale = yAxes[ix].autoScaleRatio;
      } else if (ix > 0) {
        axisMax = yAxes[ix].max > axisMax ? yAxes[ix].max : axisMax;
        axisMin = yAxes[ix].min < axisMin ? yAxes[ix].min : axisMin;
        axisLabelFontSize = +yAxes[ix].labelStyle.fontSize > axisLabelFontSize ?
          +yAxes[ix].labelStyle.fontSize : axisLabelFontSize;
        axisMaxScale = yAxes[ix].autoScaleRatio > axisMaxScale ?
          yAxes[ix].autoScaleRatio : axisMaxScale;
      }
    }

    let startPoint = axisLabelFontSize;
    let endPoint = this.height - Math.max((axisLabelFontSize * 2) - 5, 22);

    startPoint += padding;
    endPoint -= padding;

    const drawYRange = endPoint - startPoint;

    const minSteps = 2;
    const maxSteps = Math.floor(drawYRange / (axisLabelFontSize * 2));
    let skipFitting = (minSteps >= maxSteps);

    let maxValue = axisMax === null ? this.yMaxValue.y : axisMax;
    if (axisMax === null && axisMaxScale !== null) {
      maxValue *= (axisMaxScale + 1);
    }

    let minValue = axisMin === null ? this.yMinValue.y : axisMin;
    const startFromZero = true;
    const integersOnly = true;

    if (maxValue < 1) {
      maxValue = 1;
    }

    if (maxValue === minValue) {
      maxValue += 0.5;
      if (minValue >= 0.5 && !startFromZero) {
        minValue -= 0.5;
      } else {
        // Make up a whole number above the values
        maxValue += 0.5;
      }
    }

    const valueRange = Math.abs(maxValue - minValue);
    const rangeMagnitude = Util.calculateMagnitude(valueRange);
    const graphMax = Math.ceil(maxValue / ((1 * (10 ** rangeMagnitude)))) * (10 ** rangeMagnitude);
    const graphMin = (startFromZero) ? 0 :
      Math.floor(minValue / (1 * (10 ** rangeMagnitude))) * (10 ** rangeMagnitude);
    const graphRange = graphMax - graphMin;
    let stepValue = 10 ** rangeMagnitude;
    let numberOfSteps = Math.round(graphRange / stepValue);

    if (maxValue === 1) {
      stepValue = 0.2;
      numberOfSteps = 5;
    }

    // If we have more space on the graph we'll use it to give more definition to the data
    while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
      if (numberOfSteps > maxSteps) {
        stepValue *= 2;
        numberOfSteps = Math.round(graphRange / stepValue);

        if (numberOfSteps % 1 !== 0) {
          skipFitting = true;
        }
      } else if (integersOnly && rangeMagnitude >= 0) {
        if ((stepValue / 2) % 1 === 0) {
          stepValue /= 2;
          numberOfSteps = Math.round(graphRange / stepValue);
        } else {
          break;
        }
      } else {
        stepValue /= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      }
    }

    if (skipFitting) {
      numberOfSteps = minSteps;
      stepValue = graphRange / numberOfSteps;
    }

    this.offset.yAxis.steps = numberOfSteps;
    this.offset.yAxis.stepValue = stepValue;
    this.offset.yAxis.isStepValueFloat = (`${stepValue}`).indexOf('.') > -1;
    this.offset.yAxis.min = graphMin;
    this.offset.yAxis.max = Math.round((graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;
    this.offset.yAxis.startPoint = startPoint;
    this.offset.yAxis.endPoint = endPoint;

    this.offset.grid.y = startPoint;
    this.offset.grid.y2 = endPoint;

    if (endPoint - startPoint < 30) {
      this.offset.yAxis.steps = 1;
      this.offset.yAxis.stepValue = graphRange;
    }
  }

  calculateGridOffset() {
    const yAxes = this.props.yAxes;

    const xLabelWidth =
      this.bufferCtx.measureText(Util.xLabelFormat(this.labelTextMaxInfo.xText)).width + 20;

    const yLabelWidth =
      this.bufferCtx.measureText(Util.yLabelFormat(this.offset.yAxis.max)).width + 20;

    this.xScalePaddingRight = Math.round((xLabelWidth / 2) + 3);

    for (let ix = 0, ixLen = yAxes.length; ix < ixLen; ix++) {
      if (yAxes[ix].position === 'left') {
        if (yAxes[ix].labelWidth === undefined) {
          this.xScalePaddingLeft =
            Math.round((xLabelWidth / 2 > yLabelWidth) ? xLabelWidth / 2 : yLabelWidth);
        } else {
          this.xScalePaddingLeft = yAxes[ix].labelWidth;
        }
      } else if (yAxes[ix].position === 'right') {
        // 미완성 로직
        if (yAxes[ix].labelWidth === undefined) {
          this.xScalePaddingRight =
            Math.round((xLabelWidth / 2 > yLabelWidth) ? xLabelWidth / 2 : yLabelWidth);
        } else {
          this.xScalePaddingRight = yAxes[ix].labelWidth;
        }
      }
    }

    this.offset.grid.x = this.xScalePaddingLeft;
    this.offset.grid.x2 = this.width - this.xScalePaddingRight;

    this.maxXLabelWidth = xLabelWidth;
    this.maxYLabelWidth = yLabelWidth;
  }

  calculateXRange() {
    this.standardSeries = this.seriesList[this.xMaxValue.seriesIndex];
    const xAxes = this.props.xAxes;

    let tickLengthMax = null;

    if (!this.standardSeries || !this.standardSeries.data) {
      return;
    }

    if (this.standardSeries.data[0]) {
      this.offset.xAxis.min = this.standardSeries.data[0].x;
    }

    const xLabelWidth = this.maxXLabelWidth;
    const point = this.offset.xAxis.point;

    let step;

    for (let ix = 0, ixLen = xAxes.length; ix < ixLen; ix++) {
      if (ix === 0) {
        tickLengthMax = xAxes[ix].tickLength;
      } else if (ix > 0) {
        tickLengthMax = xAxes[ix].tickLength > tickLengthMax ? xAxes[ix].tickLength : tickLengthMax;
      }
    }

    if (tickLengthMax === null) {
      step = Math.ceil(this.valuesMaxCount /
        ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight) / xLabelWidth));
    } else {
      step = Math.ceil(this.valuesMaxCount / tickLengthMax);

      if (tickLengthMax >
        (this.width - this.xScalePaddingLeft - this.xScalePaddingRight) / xLabelWidth) {
        step = Math.ceil(this.valuesMaxCount /
          ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight) / xLabelWidth));
      }
    }

    const pixel = Util.aliasPixel(this.bufferCtx.lineWidth);

    for (let ix = 0; ix < this.valuesMaxCount; ix++) {
      point[ix] = this.calculateXIndex(ix) + pixel;
    }

    this.offset.xAxis.max = this.standardSeries.data[this.standardSeries.data.length - 1].x;
    this.offset.xAxis.step = step;
    this.offset.grid.x = point[0];
  }

  calculateXIndex(index) {
    const innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);
    const valueWidth = innerWidth / Math.max(this.valuesMaxCount - 1, 1);

    return (valueWidth * index) + this.xScalePaddingLeft;
  }

  createChartAxis() {
    this.yAxis = new ChartYAxis({
      ctx: this.bufferCtx,
      offset: this.offset,
      yAxes: this.props.yAxes,
      grid: this.props.grid,
      sizeInfo: {
        width: this.width,
        height: this.height,
        xScalePaddingLeft: this.xScalePaddingLeft,
        xScalePaddingRight: this.xScalePaddingRight,
      },
    });

    this.xAxis = new ChartXAxis({
      ctx: this.bufferCtx,
      offset: this.offset,
      xAxes: this.props.xAxes,
      grid: this.props.grid,
      sizeInfo: {
        width: this.width,
        height: this.height,
        xScalePaddingLeft: this.xScalePaddingLeft,
        xScalePaddingRight: this.xScalePaddingRight,
      },
      standardSeries: this.standardSeries,
      valuesMaxCount: this.valuesMaxCount,
    });

    this.yAxis.createYAxis();
    this.xAxis.createXAxis();
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
}
