import { reverse } from 'lodash-es';

const modules = {
  createDataSet(data, label) {
    Object.keys(this.seriesInfo.charts).forEach((typeKey) => {
      const type = this.seriesInfo.charts[typeKey];

      if (type.length) {
        if (typeKey === 'pie') {
          if (this.options.sunburst) {
            this.createSunburstDataSet(data);
          } else {
            this.createPieDataSet(data, type);
          }
        } else {
          type.forEach((sId) => {
            const series = this.seriesList[sId];

            if (series && data[sId]) {
              if (series.isExistGrp && series.stackIndex) {
                const bs = this.seriesList[series.bsId];
                series.data = this.addSeriesStackDS(data[sId], label, bs.data, series.stackIndex);
              } else {
                series.data = this.addSeriesDS(data[sId], label);
              }
              series.minMax = this.getSeriesMinMax(series.data);
            }
          });
        }
      }
    });
  },

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

  createPieDataSet(data, pie) {
    this.pieDataSet = [];
    const ds = this.pieDataSet;

    pie.forEach((sId) => {
      data[sId].forEach((value, index) => {
        if (!ds[index]) {
          ds[index] = { data: [], ir: 0, or: 0, total: 0 };
        }

        if (this.seriesList[sId].show) {
          ds[index].total += value || 0;
          ds[index].data.push({ id: sId, value, sa: 0, ea: 0 });
        }
      });
    });

    ds.forEach((item) => {
      item.data.sort((a, b) => b.value - a.value);
    });
  },

  addSeriesStackDS(data, label, base, sIdx = 0) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];

    data.forEach((curr, index) => {
      let bdata = base[index];
      let odata = curr;
      let ldata = label[index];
      let gdata = curr;

      if (bdata != null && ldata != null) {
        if (gdata && typeof gdata === 'object') {
          odata = isHorizontal ? curr.x : curr.y;
          ldata = isHorizontal ? curr.y : curr.x;
        }

        if (sIdx > 0) {
          bdata = isHorizontal ? bdata.x : bdata.y;
          gdata = bdata + odata;
        } else {
          bdata = 0;
          gdata = odata;
        }

        sdata.push(this.addData(gdata, ldata, odata, bdata));
      }
    });

    return sdata;
  },

  addSeriesDS(data, label) {
    const isHorizontal = this.options.horizontal;
    const sdata = [];

    data.forEach((curr, index) => {
      let gdata = curr;
      let ldata = label[index];

      if (gdata && typeof gdata === 'object') {
        gdata = isHorizontal ? curr.x : curr.y;
        ldata = isHorizontal ? curr.y : curr.x;
      }

      if (ldata !== null) {
        sdata.push(this.addData(gdata, ldata));
      }
    });

    return sdata;
  },

  addData(gdata, ldata, odata = null, bdata = null) {
    let data;

    if (this.options.horizontal) {
      data = { x: gdata, y: ldata, o: odata, b: bdata, xp: null, yp: null, w: null, h: null };
    } else {
      data = { x: ldata, y: gdata, o: odata, b: bdata, xp: null, yp: null, w: null, h: null };
    }

    return data;
  },

  getSeriesMinMax(data) {
    const def = { minX: null, minY: null, maxX: null, maxY: null, maxDomain: null };
    const isHorizontal = this.options.horizontal;

    if (data.length) {
      return data.reduce((acc, p, index) => {
        const minmax = acc;
        if (p.x <= minmax.minX) {
          minmax.minX = (p.x === null) ? 0 : p.x;
        }
        if (p.y <= minmax.minY) {
          minmax.minY = (p.y === null) ? 0 : p.y;
        }
        if (p.x >= minmax.maxX) {
          minmax.maxX = (p.x === null) ? 0 : p.x;

          if (isHorizontal) {
            minmax.maxDomain = p.y;
            minmax.maxDomainIndex = index;
          }
        }
        if (p.y >= minmax.maxY) {
          minmax.maxY = (p.y === null) ? 0 : p.y;

          if (!isHorizontal) {
            minmax.maxDomain = p.x;
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
            if (smm.minX && ((!minmax.x[axisX].min || (smm.minX < minmax.x[axisX].min)))) {
              minmax.x[axisX].min = smm.minX;
            }
            if (!minmax.y[axisY].min || (smm.minY < minmax.y[axisY].min)) {
              minmax.y[axisY].min = smm.minY;
            }
          } else {
            if (!minmax.x[axisX].min || (smm.minX < minmax.x[axisX].min)) {
              minmax.x[axisX].min = smm.minX;
            }
            if (smm.minY && (!minmax.y[axisY].min || (smm.minY < minmax.y[axisY].min))) {
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
