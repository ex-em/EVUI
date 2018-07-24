import Util from '@/common/utils';
import DataStore from './data';

export default class SunburstDataStore extends DataStore {
  init() {
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
      inputData: param.data || null,
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
    let dataIdx = dataIndex;

    if (!series) {
      return;
    }

    if (dataIndex === null || dataIndex === undefined) {
      dataIdx = series.data.length;
    }

    if (!this.seriesGroupList[dataIdx]) {
      this.seriesGroupList[dataIdx] = [];
    }
    this.seriesGroupList[dataIdx].push({ seriesIndex, data: value, show: series.show });

    if (this.chartOptions.bufferSize) {
      if (series.data.length > this.bufferSize) {
        series.data.shift();
        series.inputData.shift();

        --dataIdx;
        --series.maxIndex;
        --series.minIndex;
      }
    }
    series.data[dataIdx] = value;

    series.inputData[dataIdx] = value;

    if (series.show) {
      this.setMinMaxValue(series, tempValue, dataIdx);
      this.setMaxLabelWidth(tempValue);
    }
  }

  getSeriesGroupList() {
    return this.seriesGroupList;
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
    this.seriesList.length = 0;
    this.initTreeData();
    this.createTreeDummy();
  }
}
