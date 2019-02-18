import _ from 'lodash-es';
import moment from 'moment';
import DataStore from './data';

export default class StackDataStore extends DataStore {
  getSeriesExtends(defaultSeries, param) {
    const chartType = this.chartOptions.type;
    const horizontal = !!(this.chartOptions.horizontal);
    const skey = Object.keys(this.seriesList);
    let extSeries;

    if (chartType === 'line') {
      extSeries = {
        horizontal,
        axisType: horizontal ? 'y' : 'x',
        xAxisIndex: param.xAxisIndex ? param.xAxisIndex : 0,
        yAxisIndex: param.yAxisIndex ? param.yAxisIndex : 0,
        point: param.point || false,
        pointSize: param.pointSize || 4,
        pointStyle: param.pointStyle || '',
        pointFill: param.pointFill || this.chartOptions.colors[skey.length],
        lineWidth: param.lineWidth || 2,
        fill: param.fill || false,
        fillColor: param.fillColor || this.chartOptions.colors[skey.length],
        fillOpacity: param.fillOpacity || 0.4,
      };
    } else if (chartType === 'bar') { // 'bar'
      extSeries = {
        horizontal,
        axisType: horizontal ? 'y' : 'x',
        xAxisIndex: param.xAxisIndex ? param.xAxisIndex : 0,
        yAxisIndex: param.yAxisIndex ? param.yAxisIndex : 0,
      };
    }

    return _.merge(defaultSeries, extSeries);
  }

  /**
   * loop for addGraphData
   * @param seriesId (require)
   * @param data ex. [100,200,300,400,500]
   */
  addGraphDataSet(seriesId, data) {
    const series = this.seriesList[seriesId];
    const axisType = series.axisType;
    const axisIndex = axisType === 'x' ? series.xAxisIndex : series.yAxisIndex;

    if (!this.axisList[axisType][axisIndex]) {
      this.axisList[axisType][axisIndex] = [];
      this.createDummyAxis(axisType, axisIndex);
    }

    const axis = this.axisList[axisType][axisIndex];

    this.setSeriesGroupInfo(seriesId);

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      this.addGraphStackData(seriesId, axis[ix], data[ix]);
    }
  }

  addGraphStackData(seriesId, axisData, graphData, dataIndex) {
    const isHorizontal = !!this.chartOptions.horizontal;
    const data = this.graphData[seriesId];
    const series = this.seriesList[seriesId];
    const axisType = series.axisType;

    let axisOption;
    let axisIndex;
    let dateObj;

    let adata; // axis
    let gdata; // graph
    let sdata; // sum

    let bSId;
    let bdata;
    let b;

    if (!series.isExistGrp) {
      this.setSeriesGroupInfo(seriesId);
    }

    const groupIndex = series.groupIndex;
    const stackIndex = series.stackIndex;


    if (axisType === 'x') {
      axisIndex = series.xAxisIndex;
      axisOption = this.chartOptions.xAxes[axisIndex];
    } else {
      axisIndex = series.yAxisIndex;
      axisOption = this.chartOptions.yAxes[axisIndex];
    }

    let index = typeof dataIndex === 'number' && dataIndex > -1 ? dataIndex : data.length;

    if (this.chartOptions.bufferSize) {
      if (data.length >= this.chartOptions.bufferSize) {
        data.shift();
        --index;
      }
    }

    if (groupIndex !== null && stackIndex) {
      bSId = this.findBaseSeries(seriesId);

      if (bSId !== false) {
        bdata = this.graphData[bSId][index];
      }
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
      gdata = groupIndex !== null ? 0 : null;
    } else {
      gdata = +graphData;
    }

    if (isHorizontal) {
      if (bdata && bdata.y === adata) {
        b = bdata.x || 0;
      } else {
        b = 0;
      }
    } else if (bdata && bdata.x === adata) {
      b = bdata.y || 0;
    } else {
      b = 0;
    }

    if (groupIndex !== null) {
      sdata = gdata + b;
    } else {
      sdata = gdata;
    }

    if (adata) {
      if (isHorizontal) {
        data[index] = { x: sdata, y: adata, b, i: gdata, xp: null, yp: null, w: null, h: null };
      } else {
        data[index] = { x: adata, y: sdata, b, i: gdata, xp: null, yp: null, w: null, h: null };
      }
      if (series.show) {
        this.setMinMaxValue(seriesId, adata, sdata, index);
      }
    }
  }

  findBaseSeries(seriesId) {
    const series = this.seriesList[seriesId];
    const groupIndex = series.groupIndex;
    const stackIndex = series.stackIndex;

    const groups = this.chartData.groups;
    const group = groups[groupIndex];

    let baseOffset = 1;
    let baseId = group[stackIndex - baseOffset];
    let baseSeries = this.seriesList[baseId];

    while (baseSeries && !baseSeries.show) {
      baseOffset += 1;

      if (stackIndex - baseOffset > -1) {
        baseId = group[stackIndex - baseOffset];
        baseSeries = this.seriesList[baseId];
      } else {
        baseId = false;
        break;
      }
    }

    return baseId;
  }

  setSeriesGroupInfo(seriesId) {
    const groups = this.chartData.groups;
    const series = this.seriesList[seriesId];

    let group;

    for (let ix = 0, ixLen = groups.length; ix < ixLen; ix++) {
      group = groups[ix];

      for (let jx = 0, jxLen = group.length; jx < jxLen; jx++) {
        if (group[jx] === seriesId) {
          series.stackIndex = jx;
          series.groupIndex = ix;
          series.isExistGrp = true;
          break;
        }
      }
    }
  }
  // static calculateBaseValue(series, index, value, comp) {
  //   if (series.cData[index + comp].y === null) {
  //     return null;
  //   }
  //
  //   const x1 = +new Date(series.cData[index + comp].x);
  //   const y1 = series.cData[index + comp].y;
  //   const x2 = +new Date(series.cData[index].x);
  //   const y2 = series.cData[index].y;
  //
  //   const slope = (y2 - y1) / (x2 - x1);
  //
  //   return ((slope * +new Date(value)) - (slope * x1)) + y1;
  // }
}
