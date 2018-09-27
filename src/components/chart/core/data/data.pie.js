import _ from 'lodash';
import DataStore from './data';

export default class PieDataStore extends DataStore {
  constructor(props) {
    super(props);

    this.graphData = [];
  }

  createChartDataSet() {
    const chartData = this.chartData.data;
    let meta;
    let data;

    for (let ix = 0, ixLen = chartData.length; ix < ixLen; ix++) {
      meta = chartData[ix][0];
      data = _.slice(chartData[ix], 1);

      this.addGraphDataSet(meta, data);
    }
  }

  addGraphDataSet(seriesId, data) {
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      if (!this.graphData[ix]) {
        this.graphData[ix] = { data: [], ir: 0, or: 0, total: 0, index: 0 };
      }

      this.addGraphData(seriesId, data[ix], ix); // 'series1', 100, 0
    }
  }

  addGraphData(sId, graphData, dsIndex = 0) {
    const ds = this.graphData[dsIndex];
    const gdata = ds.data;
    const series = this.seriesList[sId];

    if (series.show) {
      ds.total += (graphData || 0);
      gdata.push({ id: sId, value: graphData, sa: 0, ea: 0 });
    }
  }

  updateData() {
    this.graphData = [];

    this.createChartDataSet();
  }

  sortingDescDataSet(dsIndex) {
    this.graphData[dsIndex].data = _.orderBy(this.graphData[dsIndex].data, 'value', 'desc');
  }

  getDataSetTotalValue(dsIndex) {
    const ds = this.graphData[dsIndex].data;
    let totalValue = 0;
    let series;

    for (let ix = 0, ixLen = ds.length; ix < ixLen; ix++) {
      series = this.seriesList[ds[ix].id];

      if (ds[ix].value && series.show) {
        totalValue += ds[ix].value;
      }
    }

    return totalValue;
  }
}
