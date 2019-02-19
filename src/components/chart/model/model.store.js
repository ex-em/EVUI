const module = {
  createDataSet(data, label) {
    Object.keys(this.seriesList).forEach((key) => {
      const series = this.seriesList[key];

      if (data[key]) {
        if (series.isExistGrp && series.stackIndex) {
          const bs = this.seriesList[series.bsId];
          series.data = this.addSeriesStackDS(data[key], label, bs.data, series.stackIndex);
        } else {
          series.data = this.addSeriesDS(data[key], label);
        }

        series.minMax = this.getSeriesMinMax(series.data);
      }
    });
  },

  addSeriesStackDS(data, label, base, sIdx = 0) {
    const isHorizontal = this.options.horizontal;

    return data.map((curr, index) => {
      let bdata = base[index];
      let odata = curr;
      let ldata = label[index];
      let gdata = curr;

      if (gdata && typeof gdata === 'object') {
        odata = isHorizontal ? curr.x : curr.y;
        ldata = isHorizontal ? curr.y : curr.x;
        this.addIntegratedLabels(ldata);
      }

      if (sIdx > 0) {
        gdata = (isHorizontal ? bdata.x : bdata.y) + odata;
        bdata = bdata.y;
      } else {
        gdata = odata;
        bdata = 0;
      }

      return this.addData(gdata, ldata, odata, bdata);
    });
  },

  addSeriesDS(data, label) {
    const isHorizontal = this.options.horizontal;

    return data.map((curr, index) => {
      let gdata = curr;
      let ldata = label[index];

      if (gdata && typeof gdata === 'object') {
        gdata = isHorizontal ? curr.x : curr.y;
        ldata = isHorizontal ? curr.y : curr.x;
        this.addIntegratedLabels(ldata);
      }

      return this.addData(gdata, ldata);
    });
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

  addIntegratedLabels(value) {
    if (this.integratedLabels.indexOf(`${value}`) < 0) {
      this.integratedLabels.push(`${value}`);
    }
  },

  getSeriesMinMax(data) {
    const def = { minX: null, minY: null, maxX: null, maxY: null };

    if (data.length) {
      return data.reduce((acc, p) => {
        const minmax = acc;
        if (p.x < minmax.minX) {
          minmax.minX = (p.x === null) ? 0 : p.x;
        }
        if (p.y < minmax.minY) {
          minmax.minY = (p.y === null) ? 0 : p.y;
        }
        if (p.x > minmax.maxX) {
          minmax.maxX = (p.x === null) ? 0 : p.x;
        }
        if (p.y > minmax.maxY) {
          minmax.maxY = (p.y === null) ? 0 : p.y;
        }

        return minmax;
      }, { minX: data[0].x, minY: data[0].y, maxX: data[0].x, maxY: data[0].y });
    }

    return def;
  },

  getStoreMinMax() {
    const keys = Object.keys(this.seriesList);
    const def = {
      x: [{ min: null, max: null }],
      y: [{ min: null, max: null }],
    };

    if (keys.length) {
      const init = this.seriesList[keys[0]].minMax || def;

      return keys.reduce((acc, key) => {
        const minmax = acc;
        const series = this.seriesList[key];
        const smm = series.minMax;
        const axisX = series.xAxisIndex;
        const axisY = series.yAxisIndex;

        if (!minmax.x[axisX]) {
          minmax.x[axisX] = { min: null, max: null };
        }
        if (!minmax.y[axisY]) {
          minmax.y[axisY] = { min: null, max: null };
        }

        if (smm && series.show) {
          if (smm.minX < minmax.x[axisX].min) {
            minmax.x[axisX].min = smm.minX;
          }
          if (smm.maxX > minmax.x[axisX].max) {
            minmax.x[axisX].max = smm.maxX;
          }

          if (smm.minY < minmax.y[axisY].min) {
            minmax.y[axisY].min = smm.minY;
          }
          if (smm.maxY > minmax.y[axisY].max) {
            minmax.y[axisY].max = smm.maxY;
          }
        }

        return minmax;
      }, {
        x: [{ min: init.minX, max: init.maxX }],
        y: [{ min: init.minY, max: init.maxY }],
      });
    }

    return def;
  },
};

export default module;
