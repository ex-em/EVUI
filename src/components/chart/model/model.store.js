import { reverse } from 'lodash-es';

const modules = {
  /**
   * Take chart data and labels to create normalized data and min/max info
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   *
   * @returns {undefined}
   */
  createDataSet(data, label) {
    Object.keys(this.seriesInfo.charts).forEach((typeKey) => {
      const seriesIDs = this.seriesInfo.charts[typeKey];

      if (seriesIDs.length) {
        if (typeKey === 'pie') {
          if (this.options.sunburst) {
            this.createSunburstDataSet(data);
          } else {
            this.createPieDataSet(data, seriesIDs);
          }
        } else if (typeKey === 'scatter') {
          seriesIDs.forEach((sId) => {
            const series = this.seriesList[sId];
            const sData = data[sId];

            if (series && sData) {
              series.data = this.addSeriesDSforScatter(sData);
              series.minMax = this.getSeriesMinMax(series.data);
            }
          });
        } else {
          seriesIDs.forEach((sId) => {
            const series = this.seriesList[sId];
            const sData = data[sId];

            if (series && sData) {
              if (series.isExistGrp && series.stackIndex) {
                series.data = this.addSeriesStackDS(sData, label, series.bsIds, series.stackIndex);
              } else {
                series.data = this.addSeriesDS(sData, label);
              }
              series.minMax = this.getSeriesMinMax(series.data);
            }
          });
        }
      }
    });
  },

  /**
   * Take chart data and to create normalized pie data
   * @param {object}  data    chart series info
   *
   * @returns {undefined}
   */
  createSunburstDataSet(data) {
    this.pieDataSet = [];
    const ds = this.pieDataSet;
    const sunburstQueue = [];

    for (let ix = 0; ix < data.length; ix++) {
      const slice = data[ix];
      const series = this.seriesList[slice.id];
      let showChildren = false;

      if (!ds[0]) {
        ds[0] = { ir: 0, or: 0, total: 0, data: [] };
      }

      if (series.show) {
        ds[0].total += slice.value || 0;
        ds[0].data.push({ parent: '$ev-root', id: slice.id, value: slice.value, sa: 0, ea: 0 });

        if (slice.children) {
          for (let jx = 0; jx < slice.children.length; jx++) {
            const childSeries = this.seriesList[slice.children[jx].id];
            if (childSeries.show) {
              showChildren = true;
            }
            sunburstQueue.push({ parent: slice.id, data: slice.children[jx], depth: 1 });
          }
        } else {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: 1 });
        }

        if (!showChildren) {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: 1 });
        }
      }
    }

    ds[0].data.sort((a, b) => b.value - a.value);

    while (sunburstQueue.length) {
      const item = sunburstQueue.shift();
      const parent = item.parent;
      const slice = item.data;
      const depth = item.depth;
      let showChildren = false;

      if (!ds[depth]) {
        ds[depth] = { ir: 0, or: 0, total: {}, data: [] };
      }

      if (!ds[depth].total[parent]) {
        ds[depth].total[parent] = 0;
      }

      const series = this.seriesList[slice.id];
      if (slice.id === 'dummy') {
        ds[depth].data.push({ parent, id: 'dummy', value: slice.value, sa: 0, ea: 0 });
        ds[depth].total[parent] += slice.value;
      } else if (series && series.show) {
        ds[depth].data.push({ parent, id: slice.id, value: slice.value, sa: 0, ea: 0 });
        ds[depth].total[parent] += slice.value;

        if (slice.children) {
          for (let ix = 0; ix < slice.children.length; ix++) {
            if (this.seriesList[slice.children[ix].id].show) {
              showChildren = true;
            }
            sunburstQueue.push({ parent: slice.id, data: slice.children[ix], depth: depth + 1 });
          }
        } else {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: depth + 1 });
        }

        if (!showChildren) {
          const dummy = {
            id: 'dummy',
            value: slice.value,
          };
          sunburstQueue.push({ parent: slice.id, data: dummy, depth: depth + 1 });
        }
      }

      ds[depth].data.sort((a, b) => b.value - a.value);
    }
  },

  /**
   * Take chart data and to create normalized pie data
   * @param {object}  data    chart data
   * @param {String[]}  seriesIDs     chart series info
   *
   * @returns {undefined}
   */
  createPieDataSet(data, seriesIDs) {
    this.pieDataSet = [];
    const ds = this.pieDataSet;
    ds[0] = { data: [], ir: 0, or: 0, total: 0 };

    seriesIDs.forEach((sId) => {
      if (this.seriesList[sId].show) {
        const value = data[sId][0] ?? 0;
        ds[0].total += value;
        ds[0].data.push({ id: sId, value, sa: 0, ea: 0 });
      }
    });

    ds.forEach((item) => {
      item.data.sort((a, b) => b.value - a.value);
    });
  },

  /**
   * Take data and label to create stack data for each series
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   * @param {array}   bsIds   stacked base data ID List
   * @param {number}  sIdx    series ordered index
   *
   * @returns {array} data for each series
   */
  addSeriesStackDS(data, label, bsIds, sIdx = 0) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];

    const getBaseDataPosition = (baseIndex, dataIndex) => {
      const nextBaseSeriesIndex = baseIndex - 1;
      const baseSeries = this.seriesList[bsIds[baseIndex]];
      const baseDataList = baseSeries.data;
      const baseData = baseDataList[dataIndex];
      const position = isHorizontal ? baseData?.x : baseData?.y;

      if (position == null || !baseSeries.show) {
        if (nextBaseSeriesIndex > -1) {
          return getBaseDataPosition(nextBaseSeriesIndex, dataIndex);
        }

        return 0;
      }

      return position;
    };

    data.forEach((curr, index) => {
      const baseIndex = bsIds.length - 1 < 0 ? 0 : bsIds.length - 1;
      let bdata = getBaseDataPosition(baseIndex, index); // base(previous) series data
      let odata = curr; // current series original data
      let ldata = label[index]; // label data
      let gdata = curr; // current series data which added previous series's value

      if (bdata != null && ldata != null) {
        if (gdata && typeof gdata === 'object' && (curr.x || curr.y)) {
          odata = isHorizontal ? curr.x : curr.y;
          ldata = isHorizontal ? curr.y : curr.x;
        }

        const oData = odata?.value ?? odata;
        if (sIdx > 0) {
          if (oData != null) {
            gdata = bdata + oData;
          } else {
            gdata = null;
            bdata = 0;
          }
        } else {
          bdata = 0;
          gdata = oData;
        }

        sdata.push(this.addData(gdata, ldata, odata, bdata));
      }
    });

    return sdata;
  },

  /**
   * Take data and label to create data for each series
   * @param {object}  data    chart series info
   * @param {object}  label   chart label
   *
   * @returns {array} data for each series
   */
  addSeriesDS(data, label) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];

    data.forEach((curr, index) => {
      let gdata = curr;
      let ldata = label[index];

      if (gdata && typeof gdata === 'object' && (curr.x || curr.y)) {
        gdata = isHorizontal ? curr.x : curr.y;
        ldata = isHorizontal ? curr.y : curr.x;
      }

      if (ldata !== null) {
        sdata.push(this.addData(gdata, ldata, gdata));
      }
    });

    return sdata;
  },

  /**
   * Take data to create data for each series
   * @param {array}  data   data array for each series
   * @returns {array} data info added position and etc
   */
  addSeriesDSforScatter(data) {
    return data.map((item) => {
      const ldata = item.x;
      const gdata = {
        value: item.y,
        color: item?.color || null,
      };

      return this.addData(gdata, ldata, gdata);
    });
  },

  /**
   * Take data to create data object for graph
   * @param {object}  gdata    graph data (y-axis value for vertical chart)
   * @param {object}  ldata    label data (x-axis value for vertical chart)
   * @param {object}  odata    original data (without stacked value)
   * @param {object}  bdata    base data (stacked value)

   * @returns {object} data for each graph point
   */
  addData(gdata, ldata, odata = null, bdata = null) {
    let data;
    let gdataValue = null;
    let odataValue = null;
    let gdataColor = null;
    let odataColor = null;

    if (gdata !== null && typeof gdata === 'object') {
      gdataValue = gdata.value;
      gdataColor = gdata.color;
    } else {
      gdataValue = gdata;
    }

    if (odata !== null && typeof odata === 'object') {
      odataValue = odata.value;
      odataColor = odata.color;
    } else {
      odataValue = odata;
    }

    if (this.options.horizontal) {
      data = { x: gdataValue, y: ldata, o: odataValue, b: bdata };
    } else {
      data = { x: ldata, y: gdataValue, o: odataValue, b: bdata };
    }

    data.xp = null;
    data.yp = null;
    data.w = null;
    data.h = null;
    data.dataColor = gdataColor ?? odataColor;

    return data;
  },

  /**
   * Take series data to create min/max info for each series
   * @param {object}  data    series data
   *
   * @returns {object} min/max info for series
   */
  getSeriesMinMax(data) {
    const def = { minX: null, minY: null, maxX: null, maxY: null, maxDomain: null };
    const isHorizontal = this.options.horizontal;

    if (data.length) {
      return data.reduce((acc, p, index) => {
        const minmax = acc;
        const px = p.x?.value || p.x;
        const py = p.y?.value || p.y;

        if (px <= minmax.minX) {
          minmax.minX = (px === null) ? 0 : px;
        }
        if (py <= minmax.minY) {
          minmax.minY = (py === null) ? 0 : py;
        }
        if (px >= minmax.maxX) {
          minmax.maxX = (px === null) ? 0 : px;

          if (isHorizontal && px !== null) {
            minmax.maxDomain = py;
            minmax.maxDomainIndex = index;
          }
        }
        if (py >= minmax.maxY) {
          minmax.maxY = (py === null) ? 0 : py;

          if (!isHorizontal && py !== null) {
            minmax.maxDomain = px;
            minmax.maxDomainIndex = index;
          }
        }

        return minmax;
      }, {
        minX: data[0].x,
        minY: data[0].y,
        maxX: data[0].x,
        maxY: data[0].y,
        maxDomain: isHorizontal ? data[0].y : data[0].x,
        maxDomainIndex: 0,
      });
    }

    return def;
  },

  /**
   * Get graph items for each series by label index
   * @param {number} labelIndex  label index
   *
   * @returns {object} graph item
   */
  getItemByLabelIndex(labelIndex) {
    if (labelIndex < 0) {
      return false;
    }

    const sIds = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxl = null;
    let maxp = null;
    let maxg = null;
    let maxSID = '';
    let acc = 0;
    let useStack = false;
    let findInfo = false;

    if (labelIndex > -1) {
      for (let ix = 0; ix < sIds.length; ix++) {
        const sId = sIds[ix];
        const series = this.seriesList[sId];
        const data = series.data[labelIndex];

        if (data && series.show && series.showLegend) {
          const ldata = isHorizontal ? data.y : data.x;
          const lp = isHorizontal ? data.yp : data.xp;

          if (ldata !== null && ldata !== undefined) {
            const g = isHorizontal ? data.o || data.x : data.o || data.y;

            if (series.stackIndex) {
              acc += !isNaN(data.o) ? data.o : 0;
              useStack = true;
            } else {
              acc += data.y;
            }

            if (maxg === null || maxg <= g) {
              maxg = g;
              maxSID = sId;
              maxl = ldata;
              maxp = lp;
            }
          }
        }
      }

      findInfo = {
        label: maxl,
        pos: maxp,
        value: maxg === null ? 0 : maxg,
        sId: maxSID,
        acc,
        useStack,
        maxIndex: labelIndex,
      };
    }

    return findInfo;
  },

  getItem({ seriesID, dataIndex }, useApproximate = false) {
    const dataInfo = this.getDataByValues(seriesID, dataIndex);
    return this.getItemByPosition([dataInfo.xp, dataInfo.yp], useApproximate);
  },
  /**
   *
   * @param seriesID
   * @param dataIndex
   * @returns {*}
   */
  getDataByValues(seriesID, dataIndex) {
    const series = this.seriesList[seriesID];
    if (!series || isNaN(dataIndex) || dataIndex < 0 || series?.data.length <= dataIndex) {
      return false;
    }

    return series.data[dataIndex];
  },

  /**
   * Find graph item by position x and y
   * @param {array}   offset          position x and y
   * @param {boolean} useApproximate  if it's true. it'll look for closed item on mouse position
   *
   * @returns {object} clicked item information
   */
  getItemByPosition(offset, useApproximate = false) {
    const sIds = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxl = null;
    let maxp = null;
    let maxg = null;
    let maxSID = '';
    let acc = 0;
    let useStack = false;
    let maxIndex = null;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];
      const findFn = useApproximate ? series.findApproximateData : series.findGraphData;

      if (findFn) {
        const item = findFn.call(series, offset, isHorizontal);
        const data = item.data;
        const index = item.index;

        if (data) {
          const ldata = isHorizontal ? data.y : data.x;
          const lp = isHorizontal ? data.yp : data.xp;

          if (ldata !== null && ldata !== undefined) {
            const g = isHorizontal ? data.o || data.x : data.o || data.y;

            if (series.stackIndex) {
              acc += !isNaN(data.o) ? data.o : 0;
              useStack = true;
            } else {
              acc += data.y;
            }

            if (maxg === null || maxg <= g) {
              maxg = g;
              maxSID = sId;
              maxl = ldata;
              maxp = lp;
              maxIndex = index;
            }
          }
        }
      }
    }

    return {
      label: maxl,
      pos: maxp,
      value: maxg === null ? 0 : maxg,
      sId: maxSID,
      acc,
      useStack,
      maxIndex,
    };
  },

  /**
   * Create min/max information for all of data
   * @property seriesList
   *
   * @returns {object} min/max info for all of data
   */
  getStoreMinMax() {
    const keys = Object.keys(this.seriesList);
    const isHorizontal = this.options.horizontal;
    const def = {
      x: [{ min: null, max: null }],
      y: [{ min: null, max: null }],
    };

    if (keys.length) {
      return keys.reduce((acc, key) => {
        const minmax = acc;
        const series = this.seriesList[key];
        const smm = series.minMax;
        const axisX = series.xAxisIndex;
        const axisY = series.yAxisIndex;

        if (!minmax.x[axisX]) {
          minmax.x[axisX] = { min: null, max: null, maxSID: null };
        }
        if (!minmax.y[axisY]) {
          minmax.y[axisY] = { min: null, max: null, maxSID: null };
        }

        if (smm && series.show) {
          if (!isHorizontal) {
            if (smm.minX && ((minmax.x[axisX].min === null || (smm.minX < minmax.x[axisX].min)))) {
              minmax.x[axisX].min = smm.minX;
            }
            if (minmax.y[axisY].min === null || (smm.minY < minmax.y[axisY].min)) {
              minmax.y[axisY].min = smm.minY;
            }
          } else {
            if (minmax.x[axisX].min === null || (smm.minX < minmax.x[axisX].min)) {
              minmax.x[axisX].min = smm.minX;
            }
            if (smm.minY && (minmax.y[axisY].min === null || (smm.minY < minmax.y[axisY].min))) {
              minmax.y[axisY].min = smm.minY;
            }
          }
          if (smm.maxX >= minmax.x[axisX].max) {
            minmax.x[axisX].max = smm.maxX;
            minmax.x[axisX].maxSID = key;
          }
          if (smm.maxY >= minmax.y[axisY].max) {
            minmax.y[axisY].max = smm.maxY;
            minmax.y[axisX].maxSID = key;
          }
        }

        return minmax;
      }, {
        x: [{ min: null, max: null, maxSID: null }],
        y: [{ min: null, max: null, maxSID: null }],
      });
    }

    return def;
  },

  calculateAngle() {
    const pieDataSet = this.pieDataSet;

    let slice;
    let value;
    let parent;
    let totalValue;

    let sliceAngle;
    let startAngle;
    let endAngle;
    let totalAngle;
    let isDummy;

    const dummyIndex = [];
    const saStore = {
      '$ev-root': 1.5 * Math.PI,
    };

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      isDummy = true;

      for (let jx = 0; jx < pie.data.length; jx++) {
        slice = pie.data[jx];
        value = slice.value;

        if (isDummy) {
          isDummy = slice.id === 'dummy';
        }

        if (!ix) {
          startAngle = saStore['$ev-root'];
          sliceAngle = 2 * Math.PI * (value / pie.total);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;
          saStore['$ev-root'] += sliceAngle;
        } else {
          parent = this.getParentInfo(ix - 1, slice.parent);
          if (!parent) {
            break;
          }

          if (!saStore[slice.parent]) {
            saStore[slice.parent] = parent.sa;
          }

          startAngle = saStore[slice.parent];
          totalAngle = parent.ea - parent.sa;
          totalValue = pie.total[slice.parent] || 0;
          sliceAngle = totalAngle * (value / totalValue);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;

          saStore[slice.parent] += sliceAngle;
        }
      }

      if (isDummy) {
        dummyIndex.push(ix);
      }
    }

    for (let ix = 0; ix < dummyIndex.length; ix++) {
      this.pieDataSet.splice(dummyIndex, 1);
    }

    if (this.options.reverse) {
      this.pieDataSet = reverse(this.pieDataSet);
    }
  },

  getParentInfo(depth, parentId) {
    for (let ix = depth; ix >= 0; ix--) {
      const pie = this.pieDataSet[ix];
      for (let jx = 0; jx < pie.data.length; jx++) {
        if (pie.data[jx].id === parentId) {
          return pie.data[jx];
        }
      }
    }

    return null;
  },
};

export default modules;
