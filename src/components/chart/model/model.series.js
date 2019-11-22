import Line from '../element/element.line';
import Scatter from '../element/element.scatter';
import Bar from '../element/element.bar';
import TimeBar from '../element/element.bar.time';
import Pie from '../element/element.pie';

const modules = {
  createSeriesSet(series, defaultType) {
    Object.keys(series).forEach((key, index) => {
      const type = series[key].type || defaultType;
      this.seriesList[key] = this.addSeries({
        type,
        sId: key,
        sOpt: series[key],
        sIdx: index,
      });
    });
  },

  addSeries(param) {
    const type = param.type;
    const id = param.sId;
    const opt = param.sOpt;
    const idx = param.sIdx;

    if (type === 'line') {
      this.seriesInfo.charts.line.push(id);
      return new Line(id, opt, idx);
    } else if (type === 'scatter') {
      this.seriesInfo.charts.scatter.push(id);
      return new Scatter(id, opt, idx);
    } else if (type === 'bar') {
      this.seriesInfo.charts.bar.push(id);

      if (opt.timeMode) {
        return new TimeBar(id, opt, idx);
      }
      return new Bar(id, opt, idx);
    } else if (type === 'pie') {
      this.seriesInfo.charts.pie.push(id);
      return new Pie(id, opt, idx);
    }

    return false;
  },

  addGroupInfo(groups) {
    groups.forEach((group, gIdx) => {
      let interpolation = 0;
      group.reduce((prev, curr, sIdx) => {
        const series = this.seriesList[curr];

        series.stackIndex = sIdx + interpolation;
        series.groupIndex = gIdx;
        series.isExistGrp = true;
        series.bsId = prev;

        if (!series.show) {
          interpolation--;
        }

        return !series.show ? prev : curr;
      }, group[0]);
    });
  },
};

export default modules;
