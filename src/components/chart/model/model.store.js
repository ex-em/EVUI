import { reverse } from 'lodash-es';
import Util from '../helpers/helpers.util';

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
          seriesIDs.forEach((seriesID) => {
            const series = this.seriesList[seriesID];
            const sData = data[seriesID];

            if (series && sData) {
              series.data = this.addSeriesDSforScatter(sData);
              series.minMax = this.getSeriesMinMax(series.data);
            }
          });
        } else if (typeKey === 'heatMap') {
          seriesIDs.forEach((seriesID) => {
            const series = this.seriesList[seriesID];
            const sData = data[seriesID];

            if (series && sData) {
              series.labels = label;
              series.data = this.addSeriesDSForHeatMap(sData);
              series.minMax = this.getSeriesMinMax(series.data);
              series.valueOpt = this.getSeriesValueOptForHeatMap(series);
            }
          });
        } else {
          seriesIDs.forEach((seriesID) => {
            const series = this.seriesList[seriesID];
            const sData = data[seriesID];

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
   * Take data to create data for each series
   * @param {array} data data array for each series
   * @param {object}  label   chart label
   *
   * @returns {array} data info added position and etc
   */
  addSeriesDSForHeatMap(data) {
    return data.map(({ x, y, value }) => ({
      x,
      y,
      o: value,
      xp: null,
      yp: null,
      w: null,
      h: null,
      dataColor: null,
      cId: null,
    }));
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
      gdataValue = gdata ?? null;
    }

    if (odata !== null && typeof odata === 'object') {
      odataValue = odata.value;
      odataColor = odata.color;
    } else {
      odataValue = odata ?? null;
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

  getSeriesValueOptForHeatMap(series) {
    const { data, colorState, isGradient } = series;
    const colorOpt = this.options.heatMapColor;
    const categoryCnt = colorOpt.categoryCnt;
    const decimalPoint = colorOpt.decimalPoint;

    let minValue;
    let maxValue = 0;

    let isExistError = false;
    data.forEach(({ o: value }) => {
      if (maxValue < value) {
        maxValue = Math.max(maxValue, value);
      }

      if (value < 0) {
        isExistError = true;
      } else if (minValue === undefined) {
        minValue = value;
      } else {
        minValue = Math.min(minValue, value);
      }
    });

    if (
      isExistError
      && !isGradient
      && colorState.length === categoryCnt
    ) {
      colorState.push({
        id: `color#${categoryCnt}`,
        color: colorOpt.error,
        state: 'normal',
        show: true,
      });
    }

    let interval = maxValue > minValue ? Math.floor((maxValue - minValue) / categoryCnt) : 1;
    if ((maxValue - minValue) <= categoryCnt) {
      if (decimalPoint > 0) {
        interval = +((maxValue - minValue) / categoryCnt).toFixed(decimalPoint);
      } else {
        interval = 1;
      }
    }

    return {
      min: minValue,
      max: maxValue,
      interval,
      existError: isExistError,
      decimalPoint,
    };
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

  getItem(selectedInfo, useApproximate = false) {
    const { seriesID, dataIndex } = selectedInfo;

    let itemPosition;
    if ('seriesID' in selectedInfo) {
      const dataInfo = this.getDataByValues(seriesID, dataIndex);

      if (!dataInfo || !dataInfo?.xp || !dataInfo?.yp) {
        return null;
      }

      itemPosition = [this.getItemByPosition([dataInfo.xp, dataInfo.yp], useApproximate)];
    } else {
      const seriesList = Object.entries(this.seriesList);
      let firShowSeriesID;

      for (let i = 0; i < seriesList.length; i++) {
        const [id, info] = seriesList[i];

        if (info.show) {
          firShowSeriesID = id;
          break;
        }
      }

      itemPosition = dataIndex.map((idx) => {
        const dataInfo = this.getDataByValues(firShowSeriesID, idx);

        if (!dataInfo) {
          return null;
        }

        return this.getItemByPosition([dataInfo?.xp ?? 0, dataInfo?.yp ?? 0], useApproximate);
      });
    }

    return itemPosition;
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
    const seriesIDs = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxType = null;
    let maxLabel = null;
    let maxValuePos = null;
    let maxValue = null;
    let maxSeriesID = '';
    let acc = 0;
    let useStack = false;
    let maxIndex = null;

    for (let ix = 0; ix < seriesIDs.length; ix++) {
      const seriesID = seriesIDs[ix];
      const series = this.seriesList[seriesID];
      const findFn = useApproximate ? series.findApproximateData : series.findGraphData;

      if (findFn) {
        const item = findFn.call(series, offset, isHorizontal);
        const data = item.data;
        const index = item.index;

        if (data) {
          if (Util.isPieType(item.type)) {
            maxLabel = seriesID;
            maxSeriesID = seriesID;
            maxValuePos = (data.ea - data.sa) / 2;
            maxValue = data.o;
            maxIndex = data.index;
            maxType = item.type;
          } else {
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

              if (maxValue === null || maxValue <= g) {
                maxValue = g;
                maxSeriesID = seriesID;
                maxLabel = ldata;
                maxValuePos = lp;
                maxIndex = index;
                maxType = series.type;
              }
            }
          }
        }
      }
    }

    return {
      type: maxType,
      label: maxLabel,
      pos: maxValuePos,
      value: maxValue ?? 0,
      sId: maxSeriesID,
      acc,
      useStack,
      maxIndex,
    };
  },

  /**
   * Find seriesId by position x and y
   * @param {array}   offset          position x and y
   *
   * @returns {object} clicked series id
   */
  getSeriesIdByPosition(offset) {
    const [clickedX, clickedY] = offset;
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };
    const valueAxes = this.axesY[0];
    const labelAxes = this.axesX[0];
    const valueStartPoint = aPos[valueAxes.units.rectStart];
    const valueEndPoint = aPos[valueAxes.units.rectEnd];
    const labelStartPoint = aPos[labelAxes.units.rectStart];
    const labelEndPoint = aPos[labelAxes.units.rectEnd];

    const result = { sId: null };

    if (clickedY > valueEndPoint && clickedY < valueStartPoint
      && clickedX < labelEndPoint && clickedX > labelStartPoint) {
      let hitSeries;
      let positionList;
      const hitItem = this.findHitItem(offset);
      const hitSeriesList = Object.keys(hitItem.items);

      switch (this.options.type) {
        case 'line': {
          const orderedSeriesList = this.seriesInfo.charts.line;
          const isStackChart = Object.values(this.seriesList).some(({ stackIndex }) => stackIndex);

          if (hitSeriesList.length) { // 클릭한 위치에 data 가 존재하는 경우
            if (isStackChart) {
              positionList = orderedSeriesList.filter(sId => hitSeriesList.includes(sId))
                .map(sId => ({ sId, position: hitItem.items[sId]?.data?.yp }));
              hitSeries = positionList.find(({ position }) => clickedY > position)?.sId;
            } else {
              hitSeries = Object.entries(hitItem.items).find(([, { hit }]) => hit)?.[0];
            }
          } else { // 클릭한 위치에 data 가 존재하지 않는 경우
            const visibleSeriesList = orderedSeriesList.filter(sId => this.seriesList[sId].show);
            positionList = visibleSeriesList.map(sId => ({
              sId,
              position: this.seriesList[sId].data?.map(({ xp, yp }) => [xp, yp]),
            }));
            const dataIndex = positionList[0].position?.findIndex(([xp]) => xp >= clickedX);
            const vectorList = positionList.map(({ sId, position }) => ({
              sId,
              vector: { start: position[dataIndex - 1], end: position[dataIndex] },
            }));

            const isEmptyVector = (arr => !arr || !Array.isArray(arr) || arr?.length !== 2);

            // canvas 의 클릭 위치값은 제 4 사분면의 위치이므로 clickedY, y1, y2 의 값은 음수를 취한다.
            if (isStackChart) {
              hitSeries = vectorList.find(({ vector }) => {
                if (isEmptyVector(vector?.start) && isEmptyVector(vector?.end)) {
                  return false;
                }

                const [x1, y1] = vector.start;
                const [x2, y2] = vector.end;
                const v1 = [x2 - x1, y1 - y2];
                const v2 = [x2 - clickedX, clickedY - y2];
                const xp = v1[0] * v2[1] - v1[1] * v2[0];

                return vector.start.every(v => typeof v === 'number')
                  && vector.end.every(v => typeof v === 'number')
                  && xp > 0;
              })?.sId;
            } else {
              hitSeries = vectorList.find(({ vector }) => {
                if (isEmptyVector(vector?.start) && isEmptyVector(vector?.end)) {
                  return false;
                }

                const [x1, y1] = vector.start;
                const [x2, y2] = vector.end;
                const a = (y1 - y2) / (x2 - x1);
                const b = -1;
                const c = -y1 - a * x1;
                const distance = Math.abs(a * clickedX - b * clickedY + c)
                  / Math.sqrt(a ** 2 + b ** 2);

                return distance < 3;
              })?.sId;
            }
          }
          break;
        }
        default:
          break;
      }

      result.sId = hitSeries;
    }

    return result;
  },
  /**
   * Find label info by position x and y
   * @param {array}   offset          position x and y
   *
   * @returns {object} clicked label information
   */
  getLabelInfoByPosition(offset) {
    const [x, y] = offset;
    const aPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    const { horizontal, selectLabel } = this.options;
    const scale = horizontal ? this.axesY[0] : this.axesX[0];
    const startPoint = aPos[scale.units.rectStart];
    const endPoint = aPos[scale.units.rectEnd];

    let labelIndex;
    let hitInfo;
    if (scale?.labels?.length) {
      const labelGap = (endPoint - startPoint) / scale.labels.length;
      const index = Math.floor(((horizontal ? y : x) - startPoint) / labelGap);
      labelIndex = scale.labels.length > index ? index : -1;
    } else {
      let offsetX;
      if (x < startPoint) {
        offsetX = startPoint;
      } else if (x > endPoint) {
        offsetX = endPoint;
      } else {
        offsetX = x;
      }

      hitInfo = this.getItemByPosition([offsetX, y], selectLabel?.useApproximateValue);
      labelIndex = hitInfo.maxIndex ?? -1;
    }

    return {
      labelIndex,
      hitInfo,
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
            if (smm.minX !== null
                && ((minmax.x[axisX].min === null || (smm.minX < minmax.x[axisX].min)))) {
              minmax.x[axisX].min = smm.minX;
            }
            if (minmax.y[axisY].min === null || (smm.minY < minmax.y[axisY].min)) {
              minmax.y[axisY].min = smm.minY;
            }
          } else {
            if (minmax.x[axisX].min === null || (smm.minX < minmax.x[axisX].min)) {
              minmax.x[axisX].min = smm.minX;
            }
            if (smm.minY !== null
                && (minmax.y[axisY].min === null || (smm.minY < minmax.y[axisY].min))) {
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

  /**
   * Get Aggregations (
   * @returns {{}}
   */
  getAggregations() {
    const allData = this.data.data;
    const series = this.data.series;
    const aggregationDataSet = {};
    const seriesIds = Object.keys(series);

    seriesIds?.forEach((sId) => {
      const dataList = allData[sId].map(data => (data?.value ? data.value : data));
      const last = (dataList[dataList.length - 1]);

      const dataListExcludedNull = dataList.filter(value => value !== undefined && value !== null);
      const min = (Math.min(...dataListExcludedNull));
      const max = (Math.max(...dataListExcludedNull));
      const total = (dataListExcludedNull.reduce((a, b) => a + b, 0));
      const avg = (total / dataListExcludedNull.length || 0);

      if (!Util.checkSafeInteger(min)
        || !Util.checkSafeInteger(max)
        || !Util.checkSafeInteger(avg)
        || !Util.checkSafeInteger(total)
        || !Util.checkSafeInteger(last)
      ) {
        console.warn('[EVUI][Chart] The aggregated value exceeds 9007199254740991 or less then -9007199254740991.');
      }

      aggregationDataSet[sId] = { min, max, avg, total, last };
    });

    return aggregationDataSet;
  },
};

export default modules;
