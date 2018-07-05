export const AXIS_UNITS = {
  x: {
    pos: 'x',
    len: 'width',
    dir: 'horizontal',
    rectStart: 'x1',
    rectEnd: 'x2',
    rectOffsetCounter(position) {
      return position === 'top' ? 'y2' : 'y1';
    },
    rectOffset(position) {
      return position === 'top' ? 'y1' : 'y2';
    },
  },
  y: {
    pos: 'y',
    len: 'height',
    dir: 'vertical',
    rectStart: 'y2',
    rectEnd: 'y1',
    rectOffsetCounter(position) {
      return position === 'left' ? 'x2' : 'x1';
    },
    rectOffset(position) {
      return position === 'left' ? 'x1' : 'x2';
    },
  },
};

export const CHART_DATA_STRUCT = {
  bar: 'array',
  line: 'array',
  scatter: 'array',
  pie: 'array',
  sunburst: 'tree',
};

export const CHART_AXIS_TYPE = {
  bar: 'axis',
  line: 'axis',
  scatter: 'axis',
  pie: 'axisless',
  sunburst: 'axisless',
};

export const TIME_INTERVALS = {
  millisecond: {
    common: true,
    size: 1,
    steps: [1, 2, 5, 10, 20, 50, 100, 250, 500],
  },
  second: {
    common: true,
    size: 1000,
    steps: [1, 2, 5, 10, 30],
  },
  minute: {
    common: true,
    size: 60000,
    steps: [1, 2, 5, 10, 30],
  },
  hour: {
    common: true,
    size: 3600000,
    steps: [1, 2, 3, 6, 12],
  },
  day: {
    common: true,
    size: 86400000,
    steps: [1, 2, 5],
  },
  week: {
    common: false,
    size: 604800000,
    steps: [1, 2, 3, 4],
  },
  month: {
    common: true,
    size: 2.628e9,
    steps: [1, 2, 3],
  },
  quarter: {
    common: false,
    size: 7.884e9,
    steps: [1, 2, 3, 4],
  },
  year: {
    common: true,
    size: 3.154e10,
  },
};
