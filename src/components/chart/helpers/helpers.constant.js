export const AXIS_UNITS = {
  x: {
    rectStart: 'x1',
    rectEnd: 'x2',
    rectOffsetCounter: (position) => (position === 'top' ? 'y2' : 'y1'),
    rectOffset: (position) => (position === 'top' ? 'y1' : 'y2'),
  },
  y: {
    rectStart: 'y2',
    rectEnd: 'y1',
    rectOffsetCounter: (position) => (position === 'left' ? 'x2' : 'x1'),
    rectOffset: (position) => (position === 'left' ? 'x1' : 'x2'),
  },
};

export const COLOR = [
  '#2b99f0',
  '#8ac449',
  '#00C4C5',
  '#ffde00',
  '#ff7781',
  '#8470ff',
  '#75cd8e',
  '#48d1cc',
  '#fec64f',
  '#fe984f',
  '#0052ff',
  '#00a48c',
  '#83cfde',
  '#dfe32d',
  '#ff7d40',
  '#99c7ff',
  '#a5fee3',
  '#0379c9',
  '#eef093',
  '#ffa891',
  '#00c5cd',
  '#009bc7',
  '#cacaff',
  '#ffc125',
  '#df6264',
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
  pointHighlight: true,
  pointSize: 3,
  pointStyle: '',
  lineWidth: 2,
  fill: false,
  fillOpacity: 0.4,
  showLegend: true,
  passingValue: null,
  interpolation: 'none',
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
    decimalPoint: null,
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
  axisLineWidth: 1,
  showGrid: true,
  gridLineColor: '#C9CFDC',
  showAxisTick: true,
  showIndicator: false,
  timeFormat: 'mm:ss',
  range: null,
  interval: null,
  decimalPoint: 'auto',
  fixedSteps: false,
  scaleChange: false,
  labelStyle: {
    show: true,
    fontSize: 12,
    color: '#25262E',
    fontFamily: 'Roboto',
    fontWeight: 400,
    fitWidth: false,
    fitDir: 'right',
    alignToGridLine: false,
    padding: 0,
    fixWidth: undefined,
  },
  showLastLabel: false,
  lastLabelFontStyle: null,
  firstLabelFontStyle: null,
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
  scrollbar: {
    use: false,
    width: 14,
    height: 14,
    background: '#F2F2F2',
    showButton: true,
    thumbStyle: {
      background: '#929292',
      radius: 0,
    },
  },
};

export const PLOT_LABEL_HOVER_TIP_OPTION = {
  use: false,
  backgroundColor: '#4C4C4C',
  fontColor: '#FFFFFF',
  borderColor: null, // null이면 backgroundColor 와 동일 → 테두리 미표시
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 400,
  fontFamily: 'Roboto',
  useShadow: false,
  shadowOpacity: 0.25,
  padding: { top: 4, right: 8, bottom: 4, left: 8 },
};

export const PLOT_LINE_LABEL_OPTION = {
  show: false,
  fontSize: 12,
  fontColor: '#FF0000',
  fillColor: '#FFFFFF', // 박스 배경. rgba 허용 → opacity 지원
  lineColor: '#FF0000',
  lineWidth: 0,
  fontWeight: 400,
  fontFamily: 'Roboto',
  verticalAlign: 'middle',
  textAlign: 'center',
  textOverflow: 'none', // 'none', 'ellipsis'
  maxWidth: null,
  text: null, // 라벨 텍스트(=alias). showValue=false면 이 값을 그대로 표시
  borderRadius: 0, // 라벨 박스 모서리 반경
  gap: null, // 임계선↔라벨 박스 간격(px). null이면 자동(fontSize/4+2, X축 상단은 2)
  padding: null, // 라벨 박스 안쪽 여백. number 또는 { top, right, bottom, left }. null이면 fontSize/4
  pointer: {
    // 말풍선 꼬리. 방향은 배치 기준 자동, 크기 고정
    show: false,
    color: null, // null이면 박스 배경색(fillColor) 사용
  },
  position: 'outside', // 'outside'(plot 밖 우측 여백) | 'innerStart'(plot 안 좌측) | 'innerEnd'(plot 안 우측)
  showValue: false, // true → "text value" 합성 (value = 축 formatter)
  responsive: {
    valueOnlyBelow: null, // plot 너비 < 이 값 → value만
    hideBelow: null, // plot 너비 < 이 값 → 라벨 미노출
  },
  showTextOnHover: PLOT_LABEL_HOVER_TIP_OPTION, // value-only 상태에서 hover 시 text tooltip
};

export const PLOT_LINE_OPTION = {
  color: '#FF0000',
  lineWidth: 1,
  label: PLOT_LINE_LABEL_OPTION,
};

export const PLOT_BAND_OPTION = {
  color: '#FAE59D',
  border: null, // { color, width, segments } — start/end 모서리 stroke
};

export const HEAT_MAP_OPTION = {
  show: true,
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
  highlight: {
    stroke: {
      use: false,
      color: null,
      width: 1,
      radius: 0,
    },
    shadow: {
      use: true,
      offsetX: 0,
      offsetY: 0,
      blur: 4,
      color: '#959494',
    },
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
    size: 2.6784e9,
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

export const NICE_FRACTIONS = Object.freeze([1, 2, 5]);
