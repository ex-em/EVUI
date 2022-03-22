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
   *
   * @returns {undefined}
   */
  createSeriesSet(series, defaultType, isHorizontal) {
    Object.keys(series).forEach((key, index) => {
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
      return new HeatMap(id, opt, index);
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

        if (!series.show) {
          interpolation--;
        }

        return !series.show ? prev : curr;
      }, group[0]);
    });
  },
};

export default modules;
