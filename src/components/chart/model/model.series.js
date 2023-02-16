import Line from '../element/element.line';
import Scatter from '../element/element.scatter';
import Bar from '../element/element.bar';
import TimeBar from '../element/element.bar.time';
import Pie from '../element/element.pie';
import HeatMap from '../element/element.heatmap';

const modules = {
  /**
   * Takes series information to create series list.
   * @param {object}  series          chart series info
   * @param {string}  defaultType     default series type in options
   * @param {boolean} isHorizontal    determines if a horizontal option's value
   * @param {object}  groups          group info
   *
   * @returns {undefined}
   */
  createSeriesSet(series, defaultType, isHorizontal, groups) {
    let seriesKeys = Object.keys(series);

    if (this.options.overlapping.use) {
      seriesKeys = this.getOverlappingSeriesKeys(series, defaultType, groups);
    }

    seriesKeys.forEach((key, index) => {
      const type = series[key].type || defaultType;
      this.seriesList[key] = this.addSeries({
        type,
        id: key,
        opt: series[key],
        index,
        isHorizontal,
      });
    });
  },

  getOverlappingSeriesKeys(series, defaultType, groups) {
    const barSeries = [];
    const otherSeries = [];
    const allGroups = groups.flat();

    Object.keys(series).forEach((key) => {
      const type = series[key].type || defaultType;
      const isOverlappingBar = type === 'bar' && allGroups.length;

      if (isOverlappingBar) {
        const overlappingIdx = allGroups.findIndex(group => group === key);
        barSeries.push({ key, overlappingIdx });
      } else {
        otherSeries.push({ key });
      }
    });

    // 큰 값을 가지는 series가 먼저 그려지도록 groups에서 지정한 순서의 역순으로 정렬
    barSeries.sort((a, b) => b.overlappingIdx - a.overlappingIdx);

    return [...barSeries, ...otherSeries]
        .map(({ key }) => key);
  },

  /**
   * Takes series information to create series list.
   * @param {object} param   series info
   *
   * @returns {object} object for proper series type
   */
  addSeries(param) {
    const { type, id, opt, index, isHorizontal } = param;

    if (type === 'line') {
      this.seriesInfo.charts.line.push(id);
      return new Line(id, opt, index);
    } else if (type === 'scatter') {
      this.seriesInfo.charts.scatter.push(id);
      return new Scatter(id, opt, index);
    } else if (type === 'bar') {
      this.seriesInfo.charts.bar.push(id);

      if (opt.timeMode) {
        return new TimeBar(id, opt, index, isHorizontal);
      }
      return new Bar(id, opt, index, isHorizontal);
    } else if (type === 'pie') {
      this.seriesInfo.charts.pie.push(id);
      return new Pie(id, opt, index);
    } else if (type === 'heatMap') {
      this.seriesInfo.charts.heatMap.push(id);
      const { heatMapColor, legend } = this.options;
      const isGradient = legend.type === 'gradient';
      return new HeatMap(id, opt, heatMapColor, isHorizontal, isGradient);
    }

    return false;
  },

  /**
   * Set series group to create stack chart
   * @param {object} groups   group info
   *
   * @returns {undefined}
   */
  addGroupInfo(groups) {
    groups.forEach((group, gIdx) => {
      let interpolation = 0;
      group.reduce((prev, curr, sIdx) => {
        const series = this.seriesList[curr];

        series.stackIndex = sIdx + interpolation;
        series.groupIndex = gIdx;
        series.isExistGrp = true;
        series.bsId = prev;
        series.bsIds = group.filter((item, idx) => item !== curr && sIdx > idx);
        series.isOverlapping = this.options.overlapping.use;

        if (!series.show) {
          interpolation--;
        }

        return !series.show ? prev : curr;
      }, group[0]);
    });
  },
};

export default modules;
