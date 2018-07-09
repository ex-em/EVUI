import _ from 'lodash';
import Util from '@/common/utils';

export default class ChartDataStore {
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
    if (this.structType === 'array') {
      this.createArraySeries();
    } else {
      this.createTreeSeries();
    }
  }

  createArraySeries() {
    const series = this.chartData.series;

    for (let ix = 0, ixLen = series.length; ix < ixLen; ix++) {
      this.addSeries(series[ix]);

      // 초기 데이터가 존재할 경우 addValues로 데이터 처리.
      if (series[ix].data && series[ix].data.length) {
        this.addValues(ix);
      }
    }
  }

  createTreeSeries() {
    // 나중에 refactoring. (sunburst chart용)
    this.initTreeData();
    this.createTreeDummy();
  }

  initTreeData() {
    const series = this.chartData.series;
    const lvl = 0;

    for (let ix = 0, ixLen = series.length; ix < ixLen; ix++) {
      this.addSeries(series[ix]);

      const seriesNode = this.seriesList[this.seriesList.length - 1];
      seriesNode.lvl = lvl;
      seriesNode.parentIndex = -1;
      seriesNode.data = seriesNode.inputData;

      const pIndex = seriesNode.parentIndex;

      if (!this.seriesGroupList[lvl]) {
        this.seriesGroupList[lvl] = {};
      }

      if (!this.seriesGroupList[lvl][pIndex]) {
        this.seriesGroupList[lvl][pIndex] = { totalValue: 0, node: [] };
      }

      this.seriesGroupList[lvl][pIndex].totalValue += seriesNode.data;
      this.seriesGroupList[lvl][pIndex].node.push({
        parentIndex: seriesNode.parentIndex,
        seriesIndex: seriesNode.seriesIndex,
        data: seriesNode.data,
        hasChild: !!seriesNode.children.length,
      });

      for (let jx = 0, jxLen = seriesNode.children.length; jx < jxLen; jx++) {
        this.traversalDFS(seriesNode.children[jx], seriesNode.seriesIndex);
      }
    }
  }

  traversalDFS(item, parentIndex) {
    this.addSeries(item);
    const seriesNode = this.seriesList[this.seriesList.length - 1];
    const lvl = this.seriesList[parentIndex].lvl + 1;

    seriesNode.lvl = lvl;
    seriesNode.parentIndex = parentIndex;
    seriesNode.data = item.data;

    if (!this.seriesGroupList[lvl]) {
      this.seriesGroupList[lvl] = {};
    }
    if (!this.seriesGroupList[lvl][parentIndex]) {
      this.seriesGroupList[lvl][parentIndex] = { totalValue: 0, node: [] };
    }

    this.seriesGroupList[lvl][parentIndex].totalValue += seriesNode.data;
    this.seriesGroupList[lvl][parentIndex].node.push({
      parentIndex: seriesNode.parentIndex,
      seriesIndex: seriesNode.seriesIndex,
      data: seriesNode.data,
      hasChild: !!seriesNode.children.length,
    });

    for (let ix = 0, ixLen = seriesNode.children.length; ix < ixLen; ix++) {
      this.traversalDFS(seriesNode.children[ix], seriesNode.seriesIndex);
    }
  }

  createTreeDummy() {
    let node;
    let keys;

    for (let ix = 0, ixLen = this.seriesGroupList.length - 1; ix < ixLen; ix++) {
      keys = Object.keys(this.seriesGroupList[ix]);
      for (let jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
        node = this.seriesGroupList[ix][keys[jx]].node;

        for (let kx = 0, kxLen = node.length; kx < kxLen; kx++) {
          if (!node[kx].hasChild) {
            this.seriesGroupList[ix + 1][node[kx].seriesIndex] = {
              totalValue: node[kx].data,
              node: [{
                parentIndex: node[kx].seriesIndex,
                seriesIndex: this.seriesList.length,
                data: node[kx].data,
                hasChild: false,
                isDummy: true,
              }],
            };
          }
        }
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
      data: this.structType === 'array' ? [] : null,
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

    if (this.axisType === 'axis') {
      if (Object.hasOwnProperty.call(value, 'x') || Object.hasOwnProperty.call(value, 'y')) {
        tempValue.x = Object.hasOwnProperty.call(value, 'x') ? value.x : null;
        tempValue.y = Object.hasOwnProperty.call(value, 'y') ? value.y : null;
      } else if (this.horizontal) {
        tempValue.x = value;
        tempValue.y = category[dataIdx] ? category[dataIdx] : null;
      } else {
        tempValue.x = category[dataIdx] ? category[dataIdx] : null;
        tempValue.y = value;
      }
    } else {
      if (!this.seriesGroupList[dataIdx]) {
        this.seriesGroupList[dataIdx] = [];
      }
      this.seriesGroupList[dataIdx].push({ seriesIndex, data: value, show: series.show });
    }

    if (this.bufferSize) {
      if (series.data.length > this.bufferSize) {
        series.data.shift();
        series.inputData.shift();

        --dataIdx;
        --series.maxIndex;
        --series.minIndex;
      }
    }

    if (this.axisType === 'axis') {
      series.data[dataIdx] = tempValue;
      series.data[dataIdx].point = series.point;

      series.inputData[dataIdx] = value;
    } else {
      series.data[dataIdx] = value;

      series.inputData[dataIdx] = value;
    }

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
    // const rawSeries = this.chartData.series;
    let res = null;

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (seriesId === this.seriesList[ix].id) {
        res = this.seriesList[ix].show ? res : null;
        break;
      }

      if (this.seriesList[ix].stack && this.seriesList[ix].show) {
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

    if (dataIdx === null || dataIdx === undefined) {
      dataIdx = cSeries.data.length;
    }

    const base = bSeries.data[dataIdx];
    const stackValue = {
      x: this.horizontal ? value + base.x : category[dataIdx],
      y: this.horizontal ? category[dataIdx] : value + base.y,
      b: this.horizontal ? (base.x || 0) : (base.y || 0),
      point: true,
    };

    cSeries.data[dataIdx] = stackValue;
    cSeries.inputData[dataIdx] = value;
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

    if (this.bufferSize) {
      if (cSeries.data.length > this.bufferSize) {
        cSeries.data.shift();
        cSeries.inputData.shift();

        --dataIdx;
        --cSeries.maxIndex;
        --cSeries.minIndex;
      }
    }

    if (dataIndex === null || dataIndex === undefined) {
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

    cSeries.data[dataIdx] = stackValue;
    cSeries.inputData[dataIdx] = value;
    cSeries.hasAccumulate = true;
    if (cSeries.show) {
      this.setMinMaxValue(cSeries, stackValue, dataIdx);
      this.setMaxLabelWidth(stackValue);
    }
  }

  addValues(seriesIndex) {
    const baseIndex = this.findBaseSeries(this.seriesList[seriesIndex].id);
    const values = this.seriesList[seriesIndex].inputData;

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

    const x = this.horizontal ? +value.x : value.x;
    const y = this.horizontal ? value.y : +value.y;

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

  getSeriesGroupList() {
    return this.seriesGroupList;
  }

  getLabelTextMaxInfo() {
    return this.labelTextMaxInfo;
  }

  sortingDescGroupData(groupIndex) {
    this.seriesGroupList[groupIndex] = _.orderBy(this.seriesGroupList[groupIndex], 'data', 'desc');
  }

  getGroupTotalValue(groupIndex) {
    const group = this.seriesGroupList[groupIndex];
    let totalValue = 0;

    for (let ix = 0, ixLen = group.length; ix < ixLen; ix++) {
      if (group[ix].data && group[ix].show) {
        totalValue += group[ix].data;
      }
    }

    return totalValue;
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
    this.seriesGroupList.length = 0;

    if (this.structType === 'array') {
      this.initArraySeries();
    } else {
      this.seriesList.length = 0;
      this.createTreeSeries();
    }
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

    if (this.structType === 'array') {
      series.data.length = 0;
    } else {
      series.data = null;
    }

    series.hasAccumulate = false;
    series.min = null;
    series.minIndex = null;
    series.max = null;
    series.maxIndex = null;
  }
}
