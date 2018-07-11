import _ from 'lodash';
import Util from '@/common/utils';
import DataStore from './data';

export default class PieDataStore extends DataStore {
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
    this.initArraySeries();
  }

  getSeriesGroupList() {
    return this.seriesGroupList;
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
}
