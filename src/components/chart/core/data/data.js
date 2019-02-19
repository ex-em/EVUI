import _ from 'lodash-es';
import moment from 'moment';

export default class DataStore {
  constructor(props) {
    this.chartOptions = props.chartOptions;
    this.chartData = props.chartData;

    this.seriesList = {};
    this.graphData = {};

    this.labelList = [];
    this.axisList = { x: [], y: [] };
    this.xMinMax = [];
    this.yMinMax = [];
    this.sIdx = 0;
  }

  /**
   * DataStore Initialize
   * if this chart has series of data parameter, add parameter into graphData.
   * @exec addSeries(), createChartDataSet();
   */
  init() {
    const series = this.chartData.series;
    const seriesKeys = Object.keys(series);

    for (let ix = 0, ixLen = seriesKeys.length; ix < ixLen; ix++) {
      this.addSeries(seriesKeys[ix], series[seriesKeys[ix]]);
    }

    this.createChartDataSet();
  }

  /**
   * Add series Information to this.seriesList
   * If it has extends props, execute extends function
   * @param id (require)
   * @param param (require)
   * @output this.seriesList[id] = series
   * @output this.graphData[id] = []
   */
  addSeries(id, param) {
    if (typeof id !== 'string') {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Not found series id value.');
    }

    if (typeof param !== 'object') {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Not found input series object.');
    }

    const skey = Object.keys(this.seriesList);

    let series;
    const defaultSeries = {
      name: param.name || `series-${this.sIdx++}`,
      color: param.color || this.chartOptions.colors[skey.length],
      show: param.show === undefined ? true : param.show,
      min: null,
      max: null,
      minIndex: null,
      maxIndex: null,
      seriesIndex: this.seriesList.length,
      data: [],
      insertIndex: -1,
      dataIndex: 0,
      startPoint: 0,
      highlight: {
        pointSize: param.highlight ? (param.highlight.size || 5) : 5,
      },
      groupIndex: null,
      stackIndex: null,
      isExistGrp: false,
    };

    if (this.getSeriesExtends) {
      series = this.getSeriesExtends(defaultSeries, param);
    }

    if (!this.seriesList[id]) {
      this.seriesList[id] = series;
    }

    if (!this.graphData[id] && this.chartOptions.type !== 'pie') {
      this.graphData[id] = [];
    }
  }

  /**
   * Add to extend property.
   * @param defaultSeries (require)
   * @param param (require)
   * @return extended series object
   */
  getSeriesExtends(defaultSeries, param) {
    const chartType = this.chartOptions.type;
    const skey = Object.keys(this.seriesList);

    const extSeries = {
      xAxisIndex: param.xAxisIndex ? param.xAxisIndex : 0,
      yAxisIndex: param.yAxisIndex ? param.yAxisIndex : 0,
      point: param.point || chartType === 'scatter',
      pointSize: param.pointSize || 4,
      pointStyle: param.pointStyle || '',
      pointFill: param.pointFill || this.chartOptions.colors[skey.length],
      lineWidth: param.lineWidth || 2,
      fill: param.fill || false,
      fillColor: param.fillColor || this.chartOptions.colors[skey.length],
      fillOpacity: param.fillOpacity || 0.4,
    };

    return _.merge(defaultSeries, extSeries);
  }

  /**
   * If this chart has data parameter, execute this function.
   * data: [
   *    ['x', '2018/01', '2018/02', '2018/03', '2018/04', '2018/05'],
   *    ['series1', 100, 200, 300, 400, 500],
   * ],
   * must have set axis data.
   * @exec this.addAxisDataSet();
   * @exec this.graphDataSet
   */
  createChartDataSet() {
    const chartData = this.chartData.data;
    const keys = Object.keys(chartData);
    const labels = this.chartData.labels;

    let data;

    if (this.chartData.labels) {
      this.addAxisLabels(labels);
    }

    for (let ix = 0; ix < keys.length; ix++) {
      data = chartData[keys[ix]];
      this.addGraphDataSet(keys[ix], data);
    }
  }

  /**
   * addAxisLabels (addAxis + addAxisData)
   * 데이터 처리를 위한 X축 배열 파싱
   * @param labels ex. ['2018/01', '2018/02', '2018/03', '2018/04', '2018/05']
   */
  addAxisLabels(labels) {
    for (let ix = 0, ixLen = labels.length; ix < ixLen; ix++) {
      this.addAxisLabel(labels[ix], ix);
    }
  }

  /**
   * addAxisLabel
   * @param label string or number (require)
   * @param labelIndex number
   */
  addAxisLabel(label, labelIndex = -1) {
    const labelList = this.labelList;
    const options = this.chartOptions;
    const horizontal = options.horizontal;

    let axisOption;
    if (horizontal) {
      axisOption = this.chartOptions.yAxes[0];
    } else {
      axisOption = this.chartOptions.xAxes[0];
    }

    let dateObj;
    let value;

    if (axisOption.labelType === 'time') {
      dateObj = moment(new Date(label));

      if (dateObj.isValid()) {
        value = +dateObj;
      } else {
        value = null;
      }
    } else {
      value = label;
    }


    if (value !== null && value !== undefined && labelList.indexOf(value) < 0) {
      if (typeof labelIndex === 'number' && labelIndex > -1) {
        labelList[labelIndex] = value;
      } else {
        labelList.push(value);
      }
    }

    this.calcAxisLMinMax(value);
  }

  /**
   * loop for addGraphData
   * @param seriesId (require)
   * @param data ex. [100,200,300,400,500] or [{ x: '', y: '' }]
   */
  addGraphDataSet(seriesId, data) {
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      this.addGraphData(seriesId, data[ix]);
    }
  }

  /**
   * addGraphData
   * @param seriesId (require)
   * @param value graph value
   * @param dataIndex dataIndex
   */
  addGraphData(seriesId, value, dataIndex = -1) {
    const options = this.chartOptions;
    const horizontal = options.horizontal;

    const series = this.seriesList[seriesId];
    const labelIndex = horizontal ? series.yAxisIndex : series.xAxisIndex;
    const labelAxisOption = horizontal ? options.yAxes[labelIndex] : options.xAxes[labelIndex];

    const labelAxisType = horizontal ? 'y' : 'x';
    const graphAxisType = horizontal ? 'x' : 'y';

    const sgData = this.graphData[seriesId];
    const index = (typeof dataIndex === 'number' && dataIndex > -1) ? dataIndex : sgData.length;

    let date;
    let ldata;
    let gdata;

    if (typeof value === 'object' && value) {
      gdata = value[graphAxisType];
      ldata = value[labelAxisType];
    } else {
      if (value === null || isNaN(value)) {
        gdata = null;
      } else {
        gdata = +value;
      }

      ldata = this.labelList[index];
    }

    if (labelAxisOption.labelType === 'time') {
      date = moment(ldata === undefined ? null : new Date(ldata));

      if (date.isValid()) {
        ldata = +date;
      } else {
        ldata = null;
      }
    }

    if (horizontal) {
      sgData[index] = { x: gdata, y: ldata, xp: null, yp: null, w: null, h: null };
    } else {
      sgData[index] = { x: ldata, y: gdata, xp: null, yp: null, w: null, h: null };
    }

    if (series.show) {
      this.setMinMaxValue(seriesId, ldata, gdata, index);
    }
  }

  /**
   * set min max value by series
   * @param seriesId (require)
   * @param labelData domain value
   * @param graphData graph value
   * @param index dataIndex
   */
  setMinMaxValue(seriesId, labelData, graphData, index) {
    const series = this.seriesList[seriesId];

    if (series.min === null || series.min > graphData) {
      series.min = graphData;
      series.minIndex = index;
    }

    if (series.max === null || series.max < graphData) {
      series.max = graphData;
      series.maxIndex = index;
    }

    this.calcAxisLMinMax(labelData);
    this.calcAxisGMinMax(seriesId, graphData);
  }

  calcAxisLMinMax(value) {
    if (value === null) {
      return;
    }

    const options = this.chartOptions;
    const horizontal = options.horizontal;
    let lMinMax;

    if (horizontal) {
      if (!this.yMinMax[0]) {
        this.yMinMax[0] = { min: null, max: null };
      }

      lMinMax = this.yMinMax[0];
    } else {
      if (!this.xMinMax[0]) {
        this.xMinMax[0] = { min: null, max: null };
      }

      lMinMax = this.xMinMax[0];
    }

    if (lMinMax.min === null || lMinMax.min > value) {
      lMinMax.min = value;
    }

    if (lMinMax.max === null || lMinMax.max < value) {
      lMinMax.max = value;
    }
  }

  calcAxisGMinMax(seriesId, value) {
    if (value === null) {
      return;
    }

    const series = this.seriesList[seriesId];
    const options = this.chartOptions;
    const horizontal = options.horizontal;
    const index = horizontal ? series.xAxisIndex : series.yAxisIndex;
    let gMinMax;

    if (horizontal) {
      if (!this.xMinMax[index]) {
        this.xMinMax[index] = { min: null, max: null, seriesId: null };
      }

      gMinMax = this.xMinMax[index];
    } else {
      if (!this.yMinMax[index]) {
        this.yMinMax[index] = { min: null, max: null, seriesId: null };
      }

      gMinMax = this.yMinMax[index];
    }

    if (gMinMax.min === null || gMinMax.min > value) {
      gMinMax.min = value;
      gMinMax.minSId = seriesId;
    }

    if (gMinMax.max === null || gMinMax.max < value) {
      gMinMax.max = value;
      gMinMax.maxSId = seriesId;
    }
  }

  getSeriesList() {
    return this.seriesList;
  }

  getXMinMax() {
    return this.xMinMax;
  }

  getYMinMax() {
    return this.yMinMax;
  }

  getGraphData() {
    return this.graphData;
  }

  getLabelList() {
    return this.labelList;
  }

  updateData() {
    this.axisList = { x: [], y: [] };
    this.xMinMax = [];
    this.yMinMax = [];
    this.graphData = {};
    this.seriesList = {};

    const seriesData = this.chartData.series;
    const seriesKeys = Object.keys(seriesData);

    for (let ix = 0, ixLen = seriesKeys.length; ix < ixLen; ix++) {
      this.addSeries(seriesKeys[ix], seriesData[seriesKeys[ix]]);
    }

    const sKeys = Object.keys(this.seriesList);
    let series;

    for (let ix = 0, ixLen = sKeys.length; ix < ixLen; ix++) {
      series = this.seriesList[sKeys[ix]];
      series.min = null;
      series.minIndex = null;
      series.max = null;
      series.maxIndex = null;
      series.isExistGrp = false;
      series.groupIndex = null;
      series.stackIndex = null;

      if (!this.graphData[sKeys[ix]]) {
        this.graphData[sKeys[ix]] = [];
      }
    }

    this.createChartDataSet();
  }
}
