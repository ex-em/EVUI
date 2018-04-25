import DataStore from '@/components/chart/core/core.data';

const data = {
  series: [
    {
      id: 'series1',
      name: 'series-1',
      show: true,
      point: true,
      fill: true,
      stack: true,
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: [
        { x: '2018-05-25 05:10:00', y: 15 },
        { x: '2018-05-25 05:11:00', y: 10 },
        { x: '2018-05-25 05:13:00', y: 10 },
        { x: '2018-05-25 05:14:00', y: 13 },
        { x: '2018-05-25 05:15:00', y: 20 },
      ],
    },
  ],
};

const emptyData = {
  series: [{}],
};


const defMinMaxValue = {
  x: null,
  y: null,
  index: null,
  seriesIndex: null,
};

const defLabelTextMaxInfo = {
  xLen: 0,
  xText: '',
  yLen: 0,
  yText: '',
};

describe('Create Chart Data Store', () => {
  const dataSet = new DataStore({
    chartData: data,
  });

  it('Constructor Chart DataStore', ()=> {
    expect(dataSet.seriesList).to.be.eql([]);
    expect(dataSet.maxValueInfo).to.be.eql(defMinMaxValue);
    expect(dataSet.minValueInfo).to.be.eql(defMinMaxValue);
    expect(dataSet.labelTextMaxInfo).to.be.eql(defLabelTextMaxInfo);
  });
});

describe('Initialized Empty Data Store', () => {
  const defDataSet = new DataStore({
    chartData: emptyData,
  });

  defDataSet.init();
  const seriesList = defDataSet.seriesList[0];

  const expectDefaultSeries = {
    id: 'series-evui-0',
    name: 'unknown',
    color: undefined,
    show: true,
    point: false,
    pointSize: 4,
    axisIndex: { x: 0, y: 0 },
    min: null,
    max: null,
    minIndex: null,
    maxIndex: null,
    stack: false,
    stackArr: [],
    stackOffsetIndex: 0,
    seriesIndex: 0,
    data: [],
    lineWidth: 2,
    fill: false,
    fillColor: undefined,
    fillOpacity: 0.4,
    toolTip: {},
    insertIndex: -1,
    dataIndex: 0,
    startPoint: 0,
    horizontal: false,
  }

  it('Add Series Parameter Properties', ()=> {
    expect(seriesList).to.be.eql(expectDefaultSeries);
  });

  it('maxValueInfo', () => {
    expect(defDataSet.maxValueInfo).to.be.eql(defMinMaxValue);
  });

  it('minValueInfo', () => {
    expect(defDataSet.minValueInfo).to.be.eql(defMinMaxValue);
  });

  it('labelTextMaxInfo', () => {
    expect(defDataSet.labelTextMaxInfo).to.be.eql(defLabelTextMaxInfo);
  });
});

describe('Initialized Data Store', () => {
  const dataSet = new DataStore({
    chartData: data,
  });

  dataSet.init();
  const seriesList = dataSet.seriesList[0];

  const expectDefaultSeries = {
    id: 'series1',
    name: 'series-1',
    color: undefined,
    show: true,
    point: true,
    pointSize: 4,
    axisIndex: { x: 0, y: 0 },
    min: 10,
    max: 20,
    minIndex: 1,
    maxIndex: 4,
    stack: true,
    stackArr: [],
    stackOffsetIndex: 0,
    seriesIndex: 0,
    data: [
      { x: '2018-05-25 05:10:00', y: 15, point: true },
      { x: '2018-05-25 05:11:00', y: 10, point: true },
      { x: '2018-05-25 05:13:00', y: 10, point: true },
      { x: '2018-05-25 05:14:00', y: 13, point: true },
      { x: '2018-05-25 05:15:00', y: 20, point: true },
    ],
    lineWidth: 2,
    fill: true,
    fillColor: undefined,
    fillOpacity: 0.4,
    toolTip: {},
    insertIndex: -1,
    dataIndex: 0,
    startPoint: 0,
    horizontal: false,
  }

  it('Add Series Parameter Properties', ()=> {
    expect(seriesList).to.be.eql(expectDefaultSeries);
  });
});
