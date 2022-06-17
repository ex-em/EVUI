export const AXIS_UNITS = {
  x: {
    rectStart: 'x1',
    rectEnd: 'x2',
    rectOffsetCounter: position => (position === 'top' ? 'y2' : 'y1'),
    rectOffset: position => (position === 'top' ? 'y1' : 'y2'),
  },
  y: {
    rectStart: 'y2',
    rectEnd: 'y1',
    rectOffsetCounter: position => (position === 'left' ? 'x2' : 'x1'),
    rectOffset: position => (position === 'left' ? 'x1' : 'x2'),
  },
};

export const COLOR = [
  '#2b99f0', '#8ac449', '#00C4C5', '#ffde00', '#ff7781', '#8470ff', '#75cd8e',
  '#48d1cc', '#fec64f', '#fe984f', '#0052ff', '#00a48c', '#83cfde', '#dfe32d',
  '#ff7d40', '#99c7ff', '#a5fee3', '#0379c9', '#eef093', '#ffa891', '#00c5cd',
  '#009bc7', '#cacaff', '#ffc125', '#df6264',
];

// export const COLOR = [
//   '#00C8FC', '#00F1CD', '#C19F87', '#008FD2', '#93F7FE', '#00FC78', '#0058DE',
//   '#3BDEFF', '#254763', '#BAEDF9', '#A24E3D', '#1FD017', '#F1D3B6', '#AFC9C9',
//   '#498700', '#3650FE', '#8786EF', '#68FBFB', '#BCF061', '#CBD3EA',
// ];

export const LINE_OPTION = {
  show: true,
  highlight: {
    defaultSize: 4,
    maxSize: 6,
    maxShadowSize: 10,
    maxShadowOpacity: 0.4,
  },
  xAxisIndex: 0,
  yAxisIndex: 0,
  point: true,
  pointSize: 3,
  pointStyle: '',
  lineWidth: 2,
  fill: false,
  fillOpacity: 0.4,
  showLegend: true,
};

export const BAR_OPTION = {
  show: true,
  highlight: {
    pointSize: 5,
  },
  xAxisIndex: 0,
  yAxisIndex: 0,
  category: true,
  showLegend: true,
  showValue: {
    use: false,
    fontSize: 12,
    textColor: '#000000',
    formatter: null,
    decimalPoint: 0,
  },
};

export const PIE_OPTION = {
  show: true,
  showLegend: true,
  stroke: {
    show: true,
    color: '#FFFFFF',
    lineWidth: 2,
  },
  showValue: {
    use: false,
    fontSize: 12,
    textColor: '#000000',
    formatter: null,
  },
};

export const AXIS_OPTION = {
  min: null,
  max: null,
  autoScaleRatio: null,
  startToZero: false,
  showAxis: true,
  axisLineColor: '#C9CFDC',
  showGrid: true,
  gridLineColor: '#C9CFDC',
  showIndicator: false,
  timeFormat: 'mm:ss',
  range: null,
  interval: null,
  decimalPoint: null,
  labelStyle: {
    show: true,
    fontSize: 12,
    color: '#25262E',
    fontFamily: 'Roboto',
    fontWeight: 400,
    fitWidth: false,
    fitDir: 'right',
    alignToGridLine: false,
  },
  title: {
    use: false,
    text: null,
    fontWeight: 400,
    fontSize: 12,
    fontFamily: 'Roboto',
    textAlign: 'right',
    fontStyle: 'normal',
    color: '#808080',
  },
};

export const PLOT_LINE_OPTION = {
  color: '#FF0000',
  lineWidth: 1,
};

export const PLOT_LINE_LABEL_OPTION = {
  show: false,
  fontSize: 12,
  fontColor: '#FF0000',
  fillColor: '#FFFFFF',
  lineColor: '#FF0000',
  lineWidth: 0,
  fontWeight: 400,
  fontFamily: 'Roboto',
  verticalAlign: 'middle',
  textAlign: 'center',
  textOverflow: 'none', // 'none', 'ellipsis'
  maxWidth: null,
};

export const PLOT_BAND_OPTION = {
  color: '#FAE59D',
};

export const HEAT_MAP_OPTION = {
  show: true,
  highlight: {
    maxShadowOpacity: 0.4,
    brightness: 150,
  },
  xAxisIndex: 0,
  yAxisIndex: 0,
  showLegend: true,
  showValue: {
    use: false,
    fontSize: 12,
    textColor: '#000000',
    formatter: null,
    decimalPoint: 0,
  },
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
