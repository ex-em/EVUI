import _ from 'lodash';
import moment from 'moment';
import { Util, Console } from '@/common/utils';

export default class DataStore {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    this.seriesList = {};
    this.graphData = {};

    /**
     * Axis List는 Vertical일 경우 X축을 뜻하고 Horizontal의 경우 Y축을 뜻함
     * 예로 아래와 같은 input이 존재할 경우,
     * data: [
     *   ['x', '2018/01', '2018/02', '2018/03', '2018/04', '2018/05'],
     *   ['series1', 100, 200, 300, 400, 500],
     * ],
     * data[0]을 처리하기 위함.
     */
    this.axisList = { x: [], y: [] };
    this.xMinMax = [];
    this.yMinMax = [];
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

    if (this.chartData.data.length) {
      this.createChartDataSet();
    }
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
      name: param.name || `series-${Util.getId()}`,
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

    if (!this.graphData[id]) {
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
    const horizontal = !!(this.chartOptions.horizontal);

    const extSeries = {
      axisType: horizontal ? 'y' : 'x',
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
    let meta;
    let data;

    for (let ix = 0, ixLen = chartData.length; ix < ixLen; ix++) {
      meta = chartData[ix][0];
      data = _.slice(chartData[ix], 1);

      if (meta === 'x' || meta === 'y') {
        this.addAxisDataSet(meta, data);
      } else if (this.seriesList[meta]) {
        this.addGraphDataSet(meta, data);
      }
    }
  }

  /**
   * addAxisDataSet (addAxis + addAxisData)
   * 데이터 처리를 위한 X축 배열 파싱
   * @param axisType axisType
   * @param data (require) ex. ['x', '2018/01', '2018/02', '2018/03', '2018/04', '2018/05']
   * @param axisIndex
   */
  addAxisDataSet(axisType, data, axisIndex) {
    // ['2018/01', '2018/02', '2018/03', '2018/04', '2018/05'] 전체 추가
    const axis = this.axisList[axisType];
    const index = typeof axisIndex === 'number' ? axisIndex : axis.length;

    if (!data) {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Not found Axis DataSet.');
    }

    if (!axis[index]) {
      axis[index] = [];
    }

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      this.addAxisData(axisType, data[ix], index);
    }
  }

  /**
   * addAxisData
   * @param axisType 'x' or 'y' (require)
   * @param data string or number (require)
   * @param axisIndex number (require)
   * @param dataIndex number
   */
  addAxisData(axisType, data, axisIndex, dataIndex) {
    if (axisType !== 'x' && axisType !== 'y') {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Invalid Axis Type.');
    }

    const axis = this.axisList[axisType];
    const index = typeof axisIndex === 'number' ? axisIndex : axis.length;

    let axisOption;
    if (axisType === 'x') {
      axisOption = this.chartOptions.xAxes[index];
    } else {
      axisOption = this.chartOptions.yAxes[index];
    }

    if (!axis[index]) {
      axis[index] = [];
    }

    if (!axisOption) {
      Console.info('[EVUI][INFO][ChartDataStore]-Not found Axis Index');
      // data로 넘어온 axis 데이터가 option보다 많으면 무시
      return;
    }

    const axisArray = axis[index];

    let dateObj;
    let value;

    if (axisOption.labelType === 'time') {
      dateObj = moment(data);

      if (dateObj.isValid()) {
        value = +dateObj;
      } else {
        value = null;
      }
    } else {
      value = data;
    }


    if (value !== null && value !== undefined) {
      if (typeof dataIndex === 'number') {
        axisArray[dataIndex] = value;
      } else {
        axisArray.push(value);
      }

      // if (axisType === 'x') {
      //   this.setAxisXMinMax('', value, index);
      // } else {
      //   this.setAxisYMinMax('', value, index);
      // }
    }
  }

  /**
   * loop for addGraphData
   * @param seriesId (require)
   * @param data ex. [100,200,300,400,500]
   */
  addGraphDataSet(seriesId, data) {
    // this.addSeriesDataSet(meta, _.slice(data[ix], 1));
    // series1, [100, 200, 300, 400, 500],
    const series = this.seriesList[seriesId];
    const axisType = series.axisType;
    const axisIndex = axisType === 'x' ? series.xAxisIndex : series.yAxisIndex;

    if (!this.axisList[axisType][axisIndex]) {
      this.axisList[axisType][axisIndex] = [];
      this.createDummyAxis(axisType, axisIndex);
    }

    const axis = this.axisList[axisType][axisIndex];
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      this.addGraphData(seriesId, axis[ix], data[ix]);
    }
  }

  createDummyAxis(axisType, axisIndex) {
    const data = this.chartData.data;
    const axis = this.axisList[axisType][axisIndex];

    let option;
    let maxLength = 0;
    let min;
    let max;
    let minValue;
    let maxValue;

    if (axisType === 'x') {
      option = this.chartOptions.xAxes[axisIndex];
    } else {
      option = this.chartOptions.yAxes[axisIndex];
    }

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      if (maxLength <= data[ix].length - 1) {
        maxLength = data[ix].length - 1;
      }
    }

    if (option.range && option.range.length === 2) {
      min = option.range[0];
      max = option.range[1];

      if (option.labelType === 'time') {
        minValue = +moment(min);
        maxValue = +moment(max);
      } else {
        minValue = min;
        maxValue = max;
      }

      const tickSize = Math.floor((maxValue - minValue) / (maxLength - 1));
      for (let ix = 0; ix < maxLength; ix++) {
        axis.push(minValue + (tickSize * ix));
      }
    } else {
      for (let ix = 0; ix < maxLength; ix++) {
        axis.push(`${ix + 1}`);
      }
    }
  }

  /**
   * addGraphData
   * if axis === null, can be push invalid data
   * @param seriesId (require)
   * @param axisData axis value
   * @param graphData graph value
   * @param dataIndex dataIndex
   */
  addGraphData(seriesId, axisData, graphData, dataIndex) {
    const isHorizontal = !!this.chartOptions.horizontal;
    const data = this.graphData[seriesId];
    const series = this.seriesList[seriesId];
    const axisType = series.axisType;

    let axisOption;
    let axisIndex;
    let dateObj;
    let adata;
    let gdata;

    let index = typeof dataIndex === 'number' && dataIndex > -1 ? dataIndex : data.length;

    if (this.chartOptions.bufferSize) {
      if (data.length >= this.chartOptions.bufferSize) {
        data.shift();
        --index;
      }
    }

    if (axisType === 'x') {
      axisIndex = series.xAxisIndex;
      axisOption = this.chartOptions.xAxes[axisIndex];
    } else {
      axisIndex = series.yAxisIndex;
      axisOption = this.chartOptions.yAxes[axisIndex];
    }

    if (axisOption.labelType === 'time') {
      dateObj = moment(axisData === undefined ? null : axisData);

      if (dateObj.isValid()) {
        adata = +dateObj;
      } else {
        adata = null;
      }
    } else {
      adata = axisData;
    }

    if (graphData === undefined || graphData === null || isNaN(graphData) || +graphData < 0) {
      gdata = null;
    } else {
      gdata = +graphData;
    }

    if (adata) {
      if (isHorizontal) {
        data[index] = { x: gdata, y: adata, xp: null, yp: null, w: null, h: null };
      } else {
        data[index] = { x: adata, y: gdata, xp: null, yp: null, w: null, h: null };
      }

      if (series.show) {
        this.setMinMaxValue(seriesId, adata, gdata, index);
      }
    }
  }

  /**
   * set min max value by series
   * @param seriesId (require)
   * @param axisData axis value
   * @param graphData graph value
   * @param index dataIndex
   */
  setMinMaxValue(seriesId, axisData, graphData, index) {
    const series = this.seriesList[seriesId];

    if (series.min === null || series.min > graphData) {
      series.min = graphData;
      series.minIndex = index;
    }

    if (series.max === null || series.max < graphData) {
      series.max = graphData;
      series.maxIndex = index;
    }

    if (series.axisType === 'x') {
      this.setAxisXMinMax(seriesId, axisData);
      this.setAxisYMinMax(seriesId, graphData);
    } else {
      this.setAxisXMinMax(seriesId, graphData);
      this.setAxisYMinMax(seriesId, axisData);
    }
  }

  /**
   * set min max by axis
   * @param seriesId (require)
   * @param value
   * @param axisIndex
   */
  setAxisXMinMax(seriesId, value, axisIndex) {
    const series = this.seriesList[seriesId];
    const index = (seriesId && series) ? series.xAxisIndex : axisIndex;

    if (index === undefined) {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Invalid Series setAxisMinMax.');
    }

    if (value === null) {
      return;
    }

    if (!this.xMinMax[index]) {
      this.xMinMax[index] = { min: null, max: null, seriesId: null };
    }

    const xInfo = this.xMinMax[index];

    if (xInfo.min === null || xInfo.min > value) {
      xInfo.min = value;
      xInfo.minSId = seriesId;
    }

    if (xInfo.max === null || xInfo.max < value) {
      xInfo.max = value;
      xInfo.maxSId = seriesId;
    }
  }

  /**
   * set min max by axis
   * @param seriesId (require)
   * @param value
   * @param axisIndex
   */
  setAxisYMinMax(seriesId, value, axisIndex) {
    const series = this.seriesList[seriesId];
    const index = (seriesId && series) ? series.yAxisIndex : axisIndex;

    if (index === undefined) {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Invalid Series setAxisMinMax.');
    }

    if (value === null) {
      return;
    }

    if (!this.yMinMax[index]) {
      this.yMinMax[index] = { min: null, max: null, seriesId: null };
    }

    const yInfo = this.yMinMax[index];

    if (yInfo.min === null || yInfo.min > value) {
      yInfo.min = value;
      yInfo.minSId = seriesId;
    }

    if (yInfo.max === null || yInfo.max < value) {
      yInfo.max = value;
      yInfo.maxSId = seriesId;
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

  getAxisList() {
    return this.axisList;
  }

  updateData() {
    this.axisList = { x: [], y: [] };
    this.xMinMax = [];
    this.yMinMax = [];
    this.graphData = {};

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
