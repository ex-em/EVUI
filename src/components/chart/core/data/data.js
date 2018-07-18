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
    const series = {
      id: param.id === undefined ? `series-${Util.getId()}` : param.id,
      name: param.name === undefined ? 'unknown' : param.name,
      color: param.color,
      show: param.show === undefined ? true : param.show,
      point: param.point === undefined ? false : param.point,
      pointSize: param.pointSize === undefined ? 4 : param.pointSize,
      pointStyle: param.pointStyle === undefined ? '' : param.pointStyle,
      axisIndex: {
        x: param.xAxisIndex === undefined ? 0 : param.xAxisIndex,
        y: param.yAxisIndex === undefined ? 0 : param.yAxisIndex,
      },
      min: null,
      max: null,
      minIndex: null,
      maxIndex: null,
      stack: param.stack === undefined ? false : param.stack,
      stackArr: [],
      stackOffsetIndex: 0,
      seriesIndex: this.seriesList.length,
      data: [],
      lineWidth: param.lineWidth === undefined ? 2 : param.lineWidth,
      fill: param.fill === undefined ? false : param.fill,
      fillColor: param.fillColor,
      fillOpacity: param.fillOpacity === undefined ? 0.4 : param.fillOpacity,
      toolTip: {},
      insertIndex: -1,
      dataIndex: 0,
      startPoint: 0,
      horizontal: param.horizontal === undefined ? false : param.horizontal, // 현재 미사용
      children: param.children === undefined ? [] : param.children,
      parentIndex: null,
      inputData: param.data || (this.structType === 'array' ? [] : null),
      hasAccumulate: false,
    };

    this.seriesList.push(series);
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
      dataIdx = series.data.length;
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
      if (series.data.length > this.chartOptions.bufferSize) {
        series.data.shift();
        series.inputData.shift();

        --dataIdx;
        --series.maxIndex;
        --series.minIndex;
      }
    }
    series.data[dataIdx] = tempValue;
    series.data[dataIdx].point = series.point;

    series.inputData[dataIdx] = value;

    if (series.show) {
      this.setMinMaxValue(series, tempValue, dataIdx);
      this.setMaxLabelWidth(tempValue);
    }
  }

  static calculateBaseValue(series, index, value, comp) {
    if (series.data[index + comp].y === null) {
      return null;
    }

    const x1 = +new Date(series.data[index + comp].x);
    const y1 = series.data[index + comp].y;
    const x2 = +new Date(series.data[index].x);
    const y2 = series.data[index].y;

    const slope = (y2 - y1) / (x2 - x1);

    return ((slope * +new Date(value)) - (slope * x1)) + y1;
  }

  addValues(seriesIndex) {
    const values = this.seriesList[seriesIndex].inputData;

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
        data = this.seriesList[ix].data;

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

      if (series.inputData && series.inputData.length) {
        this.addValues(ix);
      }
    }
  }

  initializeSeries(seriesIndex) {
    const series = this.seriesList[seriesIndex];

    series.data.length = 0;
    series.hasAccumulate = false;
    series.min = null;
    series.minIndex = null;
    series.max = null;
    series.maxIndex = null;
  }
}
