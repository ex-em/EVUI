export default class ChartDataStore {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    this.seriesList = [];
    this.maxValueInfo = {
      x: undefined,
      y: undefined,
      index: undefined,
      seriesIndex: undefined,
    };
    this.minValueInfo = {
      x: undefined,
      y: undefined,
      index: undefined,
      seriesIndex: undefined,
    };
    this.labelTextMaxInfo = {
      xLen: 0,
      xText: '',
      yLen: 0,
      yText: '',
    };
  }

  init() {
    if (!this.chartData) {
      throw new Error('[EVUI][ERROR][ChartDataStore]-Not found raw data');
    }

    const series = this.chartData.series;

    for (let ix = 0, ixLen = series.length; ix < ixLen; ix++) {
      this.addSeries(series[ix]);
      this.addValues(ix, series[ix].data);
    }
  }

  addSeries(param) {
    const series = {
      id: param.id,
      name: param.name,
      color: param.color,
      show: param.show === undefined ? true : param.show,
      point: param.point,
      pointSize: param.pointSize === undefined ? 4 : param.pointSize,
      axisIndex: {
        x: param.xAxisIndex === undefined ? 0 : param.xAxisIndex,
        y: param.yAxisIndex === undefined ? 0 : param.yAxisIndex,
      },
      min: null,
      max: null,
      minIndex: undefined,
      maxIndex: undefined,
      seriesIndex: this.seriesList.length,
      data: [],
      lineWidth: 2,
      fill: param.fill,
      fillColor: param.fillColor,
      toolTip: {},
      insertIndex: -1,
      dataIndex: 0,
      startPoint: 0,
    };

    this.seriesList.push(series);
  }

  addValue(seriesIndex, value, dataIndex) {
    if (this.seriesList === undefined) {
      return;
    }

    const series = this.seriesList[seriesIndex];
    let dataIdx = dataIndex;

    if (!series) {
      return;
    }

    if (!dataIdx) {
      dataIdx = series.data.length;
    }

    series.data[dataIdx] = value;

    if (series.show) {
      this.setMinMaxValue(series, value, dataIdx);
      this.setMaxLabelWidth(value);
    }
  }

  addValues(seriesIndex, values) {
    for (let ix = 0, ixLen = values.length; ix < ixLen; ix++) {
      this.addValue(seriesIndex, values[ix]);
    }
  }

  setMinMaxValue(seriesObj, valueObj, index) {
    const series = seriesObj;
    const value = valueObj;

    const x = value.x;
    const y = (+value.y);

    if (this.minValueInfo.y === undefined) {
      this.minValueInfo.x = x;
      this.minValueInfo.y = y;
      this.minValueInfo.index = index;
      this.minValueInfo.seriesIndex = series.seriesIndex;
    } else if (this.minValueInfo.y > y) {
      this.minValueInfo.x = x;
      this.minValueInfo.y = y;
      this.minValueInfo.index = index;
      this.minValueInfo.seriesIndex = series.seriesIndex;
    }

    if (series.min === undefined) {
      series.min = y;
      series.minIndex = index;
    } else if (series.min > y) {
      series.min = x;
      series.minIndex = index;
    }

    if (this.maxValueInfo.y === undefined || y >= this.maxValueInfo.y) {
      this.maxValueInfo.x = x;
      this.maxValueInfo.y = y;
      this.maxValueInfo.index = index;
      this.maxValueInfo.seriesIndex = series.seriesIndex;
    }

    if (y >= (series.max === undefined ? null : series.max)) {
      series.max = y;
      series.maxIndex = index;
    }
  }

  setMaxLabelWidth(value) {
    if ((`${value.x}`).length > this.labelTextMaxInfo.xLen) {
      this.labelTextMaxInfo.xText = `${value.x}`;
      this.labelTextMaxInfo.xLen = (`${value.x}`).length;
    }
    if ((`${value.y}`).length > this.labelTextMaxInfo.yLen) {
      this.labelTextMaxInfo.yText = `${value.y}`;
      this.labelTextMaxInfo.yLen = (`${value.y}`).length;
    }
  }

  getMaxDataCount() {
    let temp = 0;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        temp = Math.max(temp, this.seriesList[ix].data.length);
      }
    }

    return temp;
  }

  getSeriesList() {
    return this.seriesList;
  }

  getMaxValueInfo() {
    return this.maxValueInfo;
  }

  getMinValueInfo() {
    return this.minValueInfo;
  }

  getLabelTextMaxInfo() {
    return this.labelTextMaxInfo;
  }

  getYMaxValue() {
    const result = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show && this.seriesList[ix].max !== null) {
        if (this.seriesList[ix].max >= result.y) {
          result.x = this.seriesList[ix].data[this.seriesList[ix].maxIndex].x;
          result.y = this.seriesList[ix].max;
          result.index = this.seriesList[ix].maxIndex;
          result.seriesIndex = ix;
        }
      }
    }

    return result;
  }

  getYMinValue() {
    const result = {
      x: null,
      y: null,
      index: null,
      seriesIndex: null,
    };
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show && this.seriesList[ix].min !== null) {
        if (result.value === null) {
          result.x = this.seriesList[ix].data[this.seriesList[ix].minIndex].x;
          result.y = this.seriesList[ix].min;
          result.index = this.seriesList[ix].minIndex;
          result.seriesIndex = ix;
        } else if (this.seriesList[ix].min < result.y) {
          result.x = this.seriesList[ix].data[this.seriesList[ix].minIndex].x;
          result.y = this.seriesList[ix].min;
          result.index = this.seriesList[ix].minIndex;
          result.seriesIndex = ix;
        }
      }
    }
    return result;
  }

  getXMaxValue() {
    const result = {
      x: null,
      y: null,
      seriesIndex: null,
      dataIndex: null,
    };

    let data = null;
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        for (let jx = 0, jxLen = this.seriesList[ix].data.length; jx < jxLen; jx++) {
          data = this.seriesList[ix].data[jx];

          if (result.value === null) {
            result.value = data.x;
            result.dataIndex = jx;
            result.seriesIndex = ix;
          } else if (data.x && (data.x > result.value)) {
            result.value = data.x;
            result.dataIndex = jx;
            result.seriesIndex = ix;
          }
        }
      }
    }

    return result;
  }

  getXMinValue() {
    const result = {
      x: null,
      y: null,
      seriesIndex: null,
      dataIndex: null,
    };

    let data = null;
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        for (let jx = 0, jxLen = this.seriesList[ix].data.length; jx < jxLen; jx++) {
          data = this.seriesList[ix].data[jx];

          if (result.value === null) {
            result.value = data.x;
            result.dataIndex = jx;
            result.seriesIndex = ix;
          } else if (data.x && (data.x < result.value)) {
            result.value = data.x;
            result.dataIndex = jx;
            result.seriesIndex = ix;
          }
        }
      }
    }

    return result;
  }

  getAxisMinMaxValuePerSeries(type, index) {
    // let data = null;
    let min = null;
    let max = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].axisIndex[type] === index) {
        if (min === null || this.seriesList[ix].min < min) {
          min = this.seriesList[ix].min;
        }

        if (max === null || this.seriesList[ix].max > max) {
          max = this.seriesList[ix].max;
        }
        // for (let jx = 0, jxLen = this.seriesList[ix].data.length; jx < jxLen; jx++) {
        //   data = this.seriesList[ix].data[jx];
        //
        //   if (min === null || data[type] < min) {
        //     min = data[type];
        //   }
        //
        //   if (max === null || data[type] > max) {
        //     max = data[type];
        //   }
        // }
      }
    }

    return { min, max };
  }
}
