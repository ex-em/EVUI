import _ from 'lodash';
import Util from '@/common/utils';

export default class DataStore {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    this.maxValueInfo = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };

    this.minValueInfo = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };

    this.labelTextMaxInfo = {
      xLen: 0,
      xText: '',
      yLen: 0,
      yText: '',
    };

    if (!this.chartData || !this.chartData.series) {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Not found raw data');
    }
  }

  init() {
    const series = this.chartData.series;

    for (let ix = 0, ixLen = series.length; ix < ixLen; ix++) {
      this.addSeries(series[ix]);

      // 초기 데이터가 존재할 경우 addValues로 데이터 처리.
      if (series[ix].data && series[ix].data.length) {
        this.addValues(ix);
      }
    }
  }

  addSeries(param) {
    let series;
    const defaultSeries = {
      id: param.id || `series-${Util.getId()}`,
      name: param.name || `series-${Util.getId()}`,
      color: param.color || this.chartOptions.colors[this.seriesList.length],
      show: param.show || true,
      min: null,
      max: null,
      minIndex: null,
      maxIndex: null,
      seriesIndex: this.seriesList.length,
      oData: param.data || [], // original Data
      cData: [], // computed Data
      insertIndex: -1,
      dataIndex: 0,
      startPoint: 0,
      highlight: {
        show: false,
        item: param.highlight ? (param.highlight.item || 5) : 5,
        series: param.highlight ? (param.highlight.series || 4) : 4,
      },
      drawInfo: {
        xPoint: [],
        yPoint: [],
        width: [],
        height: [],
      },
    };

    if (this.getSeriesExtends) {
      series = this.getSeriesExtends(defaultSeries, param);
    }

    // const series = {
    //   id: param.id ? param.id : `series-${Util.getId()}`,
    //   name: param.name ? param.name : `series-${Util.getId()}`,
    //   color: param.color ? param.color : this.chartOptions.colors[this.seriesList.length],
    //   show: param.show ? param.show : true,
    //          point: param.point ? param.point : false,
    //          pointSize: param.pointSize ? param.pointSize : 4,
    //          pointStyle: param.pointStyle ? param.pointStyle : '',
    //          pointFill: param.pointFill ? param.pointFill : '#fff',
    //   axisIndex: {
    //     x: param.xAxisIndex ? param.xAxisIndex : 0,
    //     y: param.yAxisIndex ? param.yAxisIndex : 0,
    //   },
    //   min: null,
    //   max: null,
    //   minIndex: null,
    //   maxIndex: null,
    //   stack: param.stack ? param.stack : false,
    //   stackArr: [],
    //   stackOffsetIndex: 0,
    //   seriesIndex: this.seriesList.length,
    //   data: [],
    //          lineWidth: param.lineWidth ? param.lineWidth : 2,
    //          fill: param.fill ? param.fill : false,
    //          fillColor: param.fillColor ? param.fillColor : '#fff',
    //          fillOpacity: param.fillOpacity ? param.fillOpacity : 0.4,
    //   toolTip: {},
    //   insertIndex: -1,
    //   dataIndex: 0,
    //   startPoint: 0,
    //   horizontal: param.horizontal ? param.horizontal : false,
    //   children: param.children ? param.children : [],
    //   parentIndex: null,
    //   inputData: param.data || (this.structType === 'array' ? [] : null),
    //   hasAccumulate: false,
    //   pointHighlight: param.pointHighlight ? param.pointHighlight : 5,
    //   seriesHighlight: param.seriesHighlight ? param.seriesHighlight : 4,
    //   isHighlight: false,
    // };

    this.seriesList.push(series);
  }

  getSeriesExtends(defaultSeries, param) {
    const extSeries = {
      axisIndex: {
        x: param.xAxisIndex ? param.xAxisIndex : 0,
        y: param.yAxisIndex ? param.yAxisIndex : 0,
      },
      point: param.point || false,
      pointSize: param.pointSize || 4,
      pointStyle: param.pointStyle || '',
      pointFill: param.pointFill || this.chartOptions.colors[this.seriesList.length],
      lineWidth: param.lineWidth || 2,
      fill: param.fill || false,
      fillColor: param.fillColor || this.chartOptions.colors[this.seriesList.length],
      fillOpacity: param.fillOpacity || 0.4,
    };

    return _.merge(defaultSeries, extSeries);
  }

  addValue(seriesIndex, value, dataIndex) {
    if (this.seriesList === undefined) {
      return;
    }
    // category 형태의 데이터냐 아니냐에 따라 x,y 처리
    const series = this.seriesList[seriesIndex];
    const tempValue = {};
    const category = this.chartData.category;
    let dataIdx = dataIndex;

    if (!series) {
      return;
    }

    if (dataIndex === null || dataIndex === undefined) {
      dataIdx = series.cData.length;
    }

    if (Object.hasOwnProperty.call(value, 'x') || Object.hasOwnProperty.call(value, 'y')) {
      tempValue.x = Object.hasOwnProperty.call(value, 'x') ? value.x : null;
      tempValue.y = Object.hasOwnProperty.call(value, 'y') ? value.y : null;
    } else if (this.chartOptions.horizontal) {
      tempValue.x = value;
      tempValue.y = category[dataIdx] ? category[dataIdx] : null;
    } else {
      tempValue.x = category[dataIdx] ? category[dataIdx] : null;
      tempValue.y = value;
    }

    if (this.chartOptions.bufferSize) {
      if (series.cData.length > this.chartOptions.bufferSize) {
        series.cData.shift();
        series.oData.shift();

        --dataIdx;
        --series.maxIndex;
        --series.minIndex;
      }
    }
    series.cData[dataIdx] = tempValue;
    series.cData[dataIdx].point = series.point;

    series.oData[dataIdx] = value;

    if (series.show) {
      this.setMinMaxValue(series, tempValue, dataIdx);
      this.setMaxLabelWidth(tempValue);
    }
  }

  static calculateBaseValue(series, index, value, comp) {
    if (series.cData[index + comp].y === null) {
      return null;
    }

    const x1 = +new Date(series.cData[index + comp].x);
    const y1 = series.cData[index + comp].y;
    const x2 = +new Date(series.cData[index].x);
    const y2 = series.cData[index].y;

    const slope = (y2 - y1) / (x2 - x1);

    return ((slope * +new Date(value)) - (slope * x1)) + y1;
  }

  addValues(seriesIndex) {
    const values = this.seriesList[seriesIndex].oData;

    for (let ix = 0, ixLen = values.length; ix < ixLen; ix++) {
      this.addValue(seriesIndex, values[ix]);
    }
  }

  setMinMaxValue(seriesObj, valueObj, index) {
    const series = seriesObj;
    const value = valueObj;

    const x = this.chartOptions.horizontal ? +value.x : value.x;
    const y = this.chartOptions.horizontal ? value.y : +value.y;

    if (this.minValueInfo.y === null || this.minValueInfo.y > y) {
      this.minValueInfo.x = x;
      this.minValueInfo.y = y;
      this.minValueInfo.index = index;
      this.minValueInfo.seriesIndex = series.seriesIndex;
    }

    if (series.min === null || series.min > y) {
      series.min = y;
      series.minIndex = index;
    }

    if (this.maxValueInfo.y === null || y >= this.maxValueInfo.y) {
      this.maxValueInfo.x = x;
      this.maxValueInfo.y = y;
      this.maxValueInfo.index = index;
      this.maxValueInfo.seriesIndex = series.seriesIndex;
    }

    if (y >= (series.max === null ? null : series.max)) {
      series.max = y;
      series.maxIndex = index;
    }
  }

  setMaxLabelWidth(value) {
    if (value.x !== null && (`${value.x}`).length > this.labelTextMaxInfo.xLen) {
      this.labelTextMaxInfo.xText = `${value.x}`;
      this.labelTextMaxInfo.xLen = (`${value.x}`).length;
    }
    if (value.y !== null && (`${value.y}`).length > this.labelTextMaxInfo.yLen) {
      this.labelTextMaxInfo.yText = `${value.y}`;
      this.labelTextMaxInfo.yLen = (`${value.y}`).length;
    }
  }

  getSeriesList() {
    return this.seriesList;
  }

  getLabelTextMaxInfo() {
    return this.labelTextMaxInfo;
  }

  getYValueAxisPerSeries(index) {
    let min = null;
    let max = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].axisIndex.y === index && this.seriesList[ix].show) {
        if (min === null || this.seriesList[ix].min < min) {
          min = this.seriesList[ix].min;
        }

        if (max === null || this.seriesList[ix].max > max) {
          max = this.seriesList[ix].max;
        }
      }
    }

    return { min, max };
  }

  getXValueAxisPerSeries(index) {
    let data;
    let min = null;
    let max = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].axisIndex.x === index && this.seriesList[ix].show) {
        data = this.seriesList[ix].cData;

        for (let jx = 0, jxLen = data.length; jx < jxLen; jx++) {
          if (min === null || data[jx].x < min) {
            min = data[jx].x;
          }

          if (max === null || data[jx].x > max) {
            max = data[jx].x;
          }
        }
      }
    }

    return { min, max };
  }

  findBaseSeries(seriesId) {
    // const rawSeries = this.chartData.series;
    let res = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (seriesId === this.seriesList[ix].id) {
        res = this.seriesList[ix].show ? res : null;
        break;
      }

      if (this.chartOptions.stack && this.seriesList[ix].show) {
        res = ix;
      }
    }

    return res;
  }

  updateData() {
    this.maxValueInfo = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };
    this.minValueInfo = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };
    this.labelTextMaxInfo = {
      xLen: 0,
      xText: '',
      yLen: 0,
      yText: '',
    };

    this.initArraySeries();
  }

  initArraySeries() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      this.initializeSeries(ix);
      const series = this.seriesList[ix];

      if (series.oData && series.oData.length) {
        this.addValues(ix);
      }
    }
  }

  initializeSeries(seriesIndex) {
    const series = this.seriesList[seriesIndex];

    series.cData.length = 0;
    series.drawInfo.xPoint = [];
    series.drawInfo.yPoint = [];
    series.drawInfo.width = [];
    series.drawInfo.height = [];
    series.hasAccumulate = false;
    series.min = null;
    series.minIndex = null;
    series.max = null;
    series.maxIndex = null;
  }
}
