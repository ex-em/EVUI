import Line from '../element/element.line';

const module = {
  createSeriesSet(target, series, defaultType) {
    const slist = target;
    Object.keys(series).forEach((key, index) => {
      const type = series[key].type || defaultType;

      slist[key] = this.addSeries({
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
      return new Line(id, opt, idx);
    }

    return false;
  },

  addGroupInfo(target, groups) {
    groups.forEach((group, gIdx) => {
      let interpolation = 0;
      group.reduce((prev, curr, sIdx) => {
        const series = target[curr];

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

export default module;
