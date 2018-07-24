import _ from 'lodash';
import DataStore from './data';

export default class PieDataStore extends DataStore {
  addValue(seriesIndex, value, dataIndex) {
    if (this.seriesList === undefined) {
      return;
    }
    // category 형태의 데이터냐 아니냐에 따라 x,y 처리
    const series = this.seriesList[seriesIndex];
    const tempValue = {};
    const isShow = (value === null) ? false : series.show;

    let dataIdx = dataIndex;

    if (!series) {
      return;
    }

    if (dataIndex === null || dataIndex === undefined) {
      dataIdx = series.cData.length;
    }

    if (!this.seriesGroupList[dataIdx]) {
      this.seriesGroupList[dataIdx] = {
        data: [],
        drawInfo: [],
        r2: 0,
        r1: 0,
        show: false,
      };
    }

    this.seriesGroupList[dataIdx].data.push({
      seriesIndex,
      data: value,
      show: isShow,
    });

    if (!this.seriesGroupList[dataIdx].show && isShow) {
      this.seriesGroupList[dataIdx].show = true;
    }


    series.cData[dataIdx] = value;
    series.oData[dataIdx] = value;

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
    this.seriesGroupList[groupIndex].data = _.orderBy(this.seriesGroupList[groupIndex].data, 'data', 'desc');
  }

  getGroupTotalValue(groupIndex) {
    const group = this.seriesGroupList[groupIndex].data;
    let totalValue = 0;

    for (let ix = 0, ixLen = group.length; ix < ixLen; ix++) {
      if (group[ix].data && group[ix].show) {
        totalValue += group[ix].data;
      }
    }

    return totalValue;
  }
}
