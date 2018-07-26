import _ from 'lodash';
import DataStore from './data';

export default class StackDataStore extends DataStore {
  getSeriesExtends(defaultSeries, param) {
    const chartType = this.chartOptions.type;
    let extSeries;

    if (chartType === 'line') {
      extSeries = {
        axisIndex: {
          x: param.xAxisIndex ? param.xAxisIndex : 0,
          y: param.yAxisIndex ? param.yAxisIndex : 0,
        },
        point: param.point || false,
        pointSize: param.pointSize || 4,
        pointStyle: param.pointStyle || '',
        pointFill: param.pointFill || this.chartOptions.colors[this.seriesList.length],
        lineWidth: param.lineWidth || 2,
        fill: param.fill || false,
        fillColor: param.fillColor || this.chartOptions.colors[this.seriesList.length],
        fillOpacity: param.fillOpacity || 0.4,
        stackArr: [],
        stackOffsetIndex: 0,
      };
    } else if (chartType === 'bar') { // 'bar'
      extSeries = {
        axisIndex: {
          x: param.xAxisIndex ? param.xAxisIndex : 0,
          y: param.yAxisIndex ? param.yAxisIndex : 0,
        },
        stackArr: [],
        stackOffsetIndex: 0,
      };
    }

    return _.merge(defaultSeries, extSeries);
  }

  addValues(seriesIndex) {
    const isStack = this.chartOptions.stack;
    const isCategory = this.chartData.category;

    const baseIndex = this.findBaseSeries(this.seriesList[seriesIndex].id);
    const values = this.seriesList[seriesIndex].oData;

    for (let ix = 0, ixLen = values.length; ix < ixLen; ix++) {
      if (isStack && baseIndex !== null) {
        if (isCategory) {
          this.addCategoryStackValue(seriesIndex, values[ix], baseIndex);
        } else {
          this.addStackValue(seriesIndex, values[ix], baseIndex);
        }
      } else {
        this.addValue(seriesIndex, values[ix]);
      }
    }
  }

  addCategoryStackValue(currSeriesIndex, value, baseSeriesIndex, dataIndex) {
    if (this.seriesList === undefined) {
      return;
    }

    let dataIdx = dataIndex;
    const cSeries = this.seriesList[currSeriesIndex];
    const bSeries = this.seriesList[baseSeriesIndex];
    const category = this.chartData.category;

    if (!cSeries || !bSeries) {
      return;
    }

    if (dataIdx === null || dataIdx === undefined) {
      dataIdx = cSeries.cData.length;
    }

    const base = bSeries.cData[dataIdx];
    const stackValue = {
      x: this.chartOptions.horizontal ? value + base.x : category[dataIdx],
      y: this.chartOptions.horizontal ? category[dataIdx] : value + base.y,
      b: this.chartOptions.horizontal ? (base.x || 0) : (base.y || 0),
      point: true,
    };

    cSeries.cData[dataIdx] = stackValue;
    cSeries.oData[dataIdx] = value;
    cSeries.hasAccumulate = true;
    if (cSeries.show) {
      this.setMinMaxValue(cSeries, stackValue, dataIdx);
      this.setMaxLabelWidth(stackValue);
    }
  }

  addStackValue(currSeriesIndex, value, baseSeriesIndex, dataIndex) {
    // Base값을 Series에 배열로 하나로 안달고, 각 Value에다가 집어넣은 이유는
    // 나중에 RTM용 차트에서 각 Value값을 넣고 빼고 하기 때문에...그를 대비함.
    // Base 데이터가 null이 들어갈 때 혹은 X값의 좌표가 일치 하지 않을 때
    // 하나의 값에 여러개의 Base Stack이 붙기 때문.
    // 1차원 배열에 X Y를 달아 처리하면 어디까지 지워야하는지 찾아야함
    if (this.seriesList === undefined) {
      return;
    }
    let dataIdx = dataIndex;
    const cSeries = this.seriesList[currSeriesIndex];
    const bSeries = this.seriesList[baseSeriesIndex];

    if (!cSeries || !bSeries) {
      return;
    }

    if (this.chartOptions.bufferSize) {
      if (cSeries.cData.length > this.chartOptions.bufferSize) {
        cSeries.cData.shift();
        cSeries.oData.shift();

        --dataIdx;
        --cSeries.maxIndex;
        --cSeries.minIndex;
      }
    }

    if (dataIndex === null || dataIndex === undefined) {
      dataIdx = cSeries.cData.length;
    }
    dataIdx += cSeries.stackOffsetIndex;

    const base = bSeries.cData[dataIdx];
    const basePrev = bSeries.cData[dataIdx - 1];
    const lastCurrValue = dataIdx === 0 ? cSeries.cData[0] : cSeries.cData[dataIdx];
    const stackValue = {
      x: value.x,
      y: value.y + base.y,
      b: [],
      point: true,
    };

    const stackBase = stackValue.b;
    if (value.x === base.x) {
      if (value.y !== null) {
        if (dataIdx > 0 && base.y === null) {
          stackValue.y = value.y;
          lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
          stackBase.push({ x: value.x, y: 0 });
        } else if (dataIdx > 0 && basePrev.y === null) {
          stackBase.push({ x: value.x, y: 0 });
          stackBase.push({ x: value.x, y: base.y });
        } else {
          stackBase.push({ x: value.x, y: base.y });
        }
      } else {
        stackValue.y = null;
      }
    } else if (value.x < base.x) {
      if (basePrev.y !== null) {
        const convertBase = this.constructor.calculateBaseValue(bSeries, dataIdx, value.x, -1);
        cSeries.stackOffsetIndex -= 1;

        if (value.y !== null) {
          if (dataIdx > 0 && base.y === null) {
            stackValue.y = value.y;
            lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
            stackBase.push({ x: value.x, y: 0 });
          } else if (dataIdx > 0 && basePrev.y === null) {
            stackBase.push({ x: value.x, y: 0 });
          } else {
            stackBase.push({ x: value.x, y: convertBase });
          }
        } else {
          stackValue.y = null;
        }
      } else {
        lastCurrValue.b.push({ x: value.x, y: 0 });
      }
    } else if (value.x > base.x) {
      cSeries.cData.push({
        x: base.x,
        y: base.y,
        b: [{ x: base.x, y: base.y }],
        point: false,
      });

      if (basePrev.y !== null) {
        if (value.y !== null) {
          stackValue.y = bSeries.cData[dataIdx + 1].y + value.y;
          if (dataIdx > 0 && base.y === null) {
            lastCurrValue.b.push({ x: lastCurrValue.b[lastCurrValue.b.length - 1].x, y: 0 });
            stackBase.push({ x: value.x, y: 0 });
          } else if (dataIdx > 0 && basePrev.y === null) {
            stackBase.push({ x: value.x, y: 0 });
            stackBase.push({ x: value.x, y: base.y });
          } else {
            stackBase.push({ x: base.x, y: base.y });
            if (bSeries.cData[dataIdx + 1].y === null) {
              stackBase.push({ x: base.x, y: 0 });
              stackBase.push({ x: value.x, y: 0 });
            } else {
              stackBase.push({ x: value.x, y: bSeries.cData[dataIdx + 1].y });
            }
          }
        } else {
          stackValue.y = null;
        }
      } else {
        lastCurrValue.b.push({ x: value.x, y: 0 });
      }
    }

    cSeries.cData[dataIdx] = stackValue;
    cSeries.oData[dataIdx] = value;
    cSeries.hasAccumulate = true;
    if (cSeries.show) {
      this.setMinMaxValue(cSeries, stackValue, dataIdx);
      this.setMaxLabelWidth(stackValue);
    }
  }
}
