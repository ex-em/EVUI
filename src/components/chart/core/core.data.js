import Util from '@/common/utils';

export default class ChartDataStore {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    this.seriesList = [];
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

    if (!dataIdx) {
      dataIdx = series.data.length;
    }

    if (Object.hasOwnProperty.call(value, 'x') || Object.hasOwnProperty.call(value, 'y')) {
      tempValue.x = Object.hasOwnProperty.call(value, 'x') ? value.x : null;
      tempValue.y = Object.hasOwnProperty.call(value, 'y') ? value.y : null;
    } else {
      tempValue.x = category[dataIdx] ? category[dataIdx] : null;
      tempValue.y = value;
    }
    series.data[dataIdx] = tempValue;
    series.data[dataIdx].point = series.point;

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

  findBaseSeries(seriesId) {
    const rawSeries = this.chartData.series;
    let res = null;

    for (let ix = 0; ix < rawSeries.length; ++ix) {
      if (seriesId === rawSeries[ix].id) {
        break;
      }

      if (rawSeries[ix].stack) {
        res = ix;
      }
    }

    return res;
  }

  addCategoryStackValue(currSeriesIndex, value, baseSeriesIndex, dataIndex) {
    if (this.seriesList === undefined) {
      return;
    }

    let dataIdx = dataIndex;
    const cSeries = this.seriesList[currSeriesIndex];
    const bSeries = this.seriesList[baseSeriesIndex];
    const category = this.chartData.category;

    if (!cSeries || !bSeries) {
      return;
    }

    if (!dataIdx) {
      dataIdx = cSeries.data.length;
    }

    const base = bSeries.data[dataIdx];
    const stackValue = {
      x: category[dataIdx],
      y: value + base.y,
      b: base.y || 0,
      point: true,
    };

    cSeries.data.push(stackValue);
    cSeries.hasAccumulate = true;
    if (cSeries.show) {
      this.setMinMaxValue(cSeries, stackValue, dataIdx);
      this.setMaxLabelWidth(stackValue);
    }
  }

  addStackValue(currSeriesIndex, value, baseSeriesIndex, dataIndex) {
    // Base값을 Series에 배열로 하나로 안달고, 각 Value에다가 집어넣은 이유는
    // 나중에 RTM용 차트에서 각 Value값을 넣고 빼고 하기 때문에...그를 대비함.
    // Base 데이터가 null이 들어갈 때 혹은 X값의 좌표가 일치 하지 않을 때
    // 하나의 값에 여러개의 Base Stack이 붙기 때문.
    // 1차원 배열에 X Y를 달아 처리하면 어디까지 지워야하는지 찾아야함
    if (this.seriesList === undefined) {
      return;
    }
    let dataIdx = dataIndex;
    const cSeries = this.seriesList[currSeriesIndex];
    const bSeries = this.seriesList[baseSeriesIndex];

    if (!cSeries || !bSeries) {
      return;
    }

    if (!dataIdx) {
      dataIdx = cSeries.data.length;
    }
    dataIdx += cSeries.stackOffsetIndex;

    const base = bSeries.data[dataIdx];
    const basePrev = bSeries.data[dataIdx - 1];
    const lastCurrValue = dataIdx === 0 ? cSeries.data[0] : cSeries.data[dataIdx];
    const stackValue = {
      x: value.x,
      y: value.y + base.y,
      b: [],
      point: true,
    };

    const stackBase = stackValue.b;
    if (value.x === base.x) {
      if (value.y !== null) {
        if (dataIdx > 0 && base.y === null) {
          stackValue.y = value.y;
          lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
          stackBase.push({ x: value.x, y: 0 });
        } else if (dataIdx > 0 && basePrev.y === null) {
          stackBase.push({ x: value.x, y: 0 });
          stackBase.push({ x: value.x, y: base.y });
        } else {
          stackBase.push({ x: value.x, y: base.y });
        }
      } else {
        stackValue.y = null;
      }
    } else if (value.x < base.x) {
      if (basePrev.y !== null) {
        const convertBase = this.constructor.calculateBaseValue(bSeries, dataIdx, value.x, -1);
        cSeries.stackOffsetIndex -= 1;

        if (value.y !== null) {
          if (dataIdx > 0 && base.y === null) {
            stackValue.y = value.y;
            lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
            stackBase.push({ x: value.x, y: 0 });
          } else if (dataIdx > 0 && basePrev.y === null) {
            stackBase.push({ x: value.x, y: 0 });
          } else {
            stackBase.push({ x: value.x, y: convertBase });
          }
        } else {
          stackValue.y = null;
        }
      } else {
        lastCurrValue.b.push({ x: value.x, y: 0 });
      }
    } else if (value.x > base.x) {
      cSeries.data.push({
        x: base.x,
        y: base.y,
        b: [{ x: base.x, y: base.y }],
        point: false,
      });

      if (basePrev.y !== null) {
        if (value.y !== null) {
          stackValue.y = bSeries.data[dataIdx + 1].y + value.y;
          if (dataIdx > 0 && base.y === null) {
            lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
            stackBase.push({ x: value.x, y: 0 });
          } else if (dataIdx > 0 && basePrev.y === null) {
            stackBase.push({ x: value.x, y: 0 });
            stackBase.push({ x: value.x, y: base.y });
          } else {
            stackBase.push({ x: base.x, y: base.y });
            if (bSeries.data[dataIdx + 1].y === null) {
              stackBase.push({ x: base.x, y: 0 });
              stackBase.push({ x: value.x, y: 0 });
            } else {
              stackBase.push({ x: value.x, y: bSeries.data[dataIdx + 1].y });
            }
          }
        } else {
          stackValue.y = null;
        }
      } else {
        lastCurrValue.b.push({ x: value.x, y: 0 });
      }
    }

    cSeries.data.push(stackValue);
    cSeries.hasAccumulate = true;
    if (cSeries.show) {
      this.setMinMaxValue(cSeries, stackValue, dataIdx);
      this.setMaxLabelWidth(stackValue);
    }
  }

  addValues(seriesIndex, values) {
    const baseIndex = this.findBaseSeries(this.seriesList[seriesIndex].id);

    if (!values) {
      return;
    }

    for (let ix = 0, ixLen = values.length; ix < ixLen; ix++) {
      if (this.seriesList[seriesIndex].stack && baseIndex !== null) {
        if (this.chartData.category) {
          this.addCategoryStackValue(seriesIndex, values[ix], baseIndex);
        } else {
          this.addStackValue(seriesIndex, values[ix], baseIndex);
        }
      } else {
        this.addValue(seriesIndex, values[ix]);
      }
    }
  }

  setMinMaxValue(seriesObj, valueObj, index) {
    const series = seriesObj;
    const value = valueObj;

    const x = value.x;
    const y = (+value.y);

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
        if (result.value === null || this.seriesList[ix].min < result.y) {
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

          if (result.x === null || (data.x && (data.x > result.x))) {
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

          if (result.x === null || (data.x && (data.x < result.x))) {
            result.value = data.x;
            result.dataIndex = jx;
            result.seriesIndex = ix;
          }
        }
      }
    }

    return result;
  }

  getYValueAxisPerSeries(index) {
    let min = null;
    let max = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].axisIndex.y === index) {
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
      if (this.seriesList[ix].axisIndex.x === index) {
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
}
