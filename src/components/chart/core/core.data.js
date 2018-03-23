import _ from 'lodash';

export default {
  setData(data) {
    this.data = data;
  },

  createDataStore() {
    this.seriesInfo = {};
    this.dataSet = {};

    for (let ix = 0, ixLen = this.data.length; ix < ixLen; ix++) {
      this.seriesInfo[this.data[ix].id] = {
        label: this.data[ix].label,
        use: this.data[ix].use,
        minMaxXValue: [_.minBy(this.data[ix].data, 'x').x, _.maxBy(this.data[ix].data, 'x').x],
        minMaxYValue: [_.minBy(this.data[ix].data, 'y').y, _.maxBy(this.data[ix].data, 'y').y],
      };
      this.dataSet[this.data[ix].id] = this.data[ix].data;
    }
  },

  getDataRange() {
    let minX;
    let maxX;
    let minY;
    let maxY;
    let xValues;
    let yValues;
    let init = false;
    let series;

    const keys = Object.keys(this.seriesInfo);
    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      series = this.seriesInfo[keys[ix]];

      if (series.use) {
        xValues = series.minMaxXValue;
        yValues = series.minMaxYValue;

        if (!init) {
          minX = xValues[0];
          maxX = xValues[1];
          minY = yValues[0];
          maxY = yValues[1];

          init = true;
        }

        minX = minX < xValues[0] ? minX : xValues[0];
        maxX = maxX > xValues[1] ? maxX : xValues[1];
        minY = minY < yValues[0] ? minY : yValues[0];
        maxY = maxY > yValues[1] ? maxY : yValues[1];
      }
    }

    return { minX, maxX, minY, maxY };
  },

  // getMaxDataYValue() {
  //   const data = this.dataStore.data;
  //   const keys = Object.keys(data);
  //   let seriesData;
  //   let maxYValue = 0;
  //
  //   for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
  //     seriesData = data[keys[ix]];
  //     for (let jx = 0, jxLen = seriesData.length; jx < jxLen; jx++) {
  //       maxYValue = +seriesData[jx].y > maxYValue ? +seriesData[jx].y : maxYValue;
  //     }
  //   }
  //
  //   return maxYValue;
  // },

  // getYRatio(chartHeight) {
  //   return chartHeight / this.getMaxDataYValue();
  // },

};
