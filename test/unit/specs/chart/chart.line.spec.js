// import { shallow } from 'vue-test-utils';
import LineChart from '@/components/chart/charts/chart.line';

describe('Create Line Chart Default', () => {
  const targetDOM = document.createElement('div');
  targetDOM.setAttribute('style', 'width: 800px; height: 600px;');
  targetDOM.className = 'evui-chart';

  const chartData = { series: [] };
  const chartOptions = { xAxes: [], yAxes: [] };

  const chart = new LineChart(targetDOM, chartData, chartOptions);
  chart.createChart();

  it('Base Class Constructor Property', () => {
    expect(chart).to.be.ok;
    expect(chart.xAxes.length).to.be.equal(1);
    expect(chart.yAxes.length).to.be.equal(1);
  });
});

describe('Create Line Chart', () => {
  const targetDOM = document.createElement('div');
  targetDOM.setAttribute('style', 'width: 800px; height: 600px;');
  targetDOM.className = 'evui-chart';

  const chartData = {
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

  const chartOptions = {
    title: {
      text: 'BDD Title',
      show: true,
    },
    xAxes: [{
      type: 'time',
      tickFormat: 'hh:mm:ss',
      showGrid: true,
      position: 'bottom',
      interval: 'minute',
    }],
    yAxes: [{
      type: 'linear',
      showGrid: false,
      position: 'left',
    }],
  }

  const chart = new LineChart(targetDOM, chartData, chartOptions);

  // 1. Base Class Constructor Props
  it('Base Class Constructor Property', () => {
    expect(chart.labelOffset).to.be.eql({ top: 1, left: 1, right: 1, bottom: 1 });
    expect(chart.container).to.be.ok;
    expect(chart.container.className).to.be.equal('evui-chart-inner');
  });


  // 2. Constructor _.merge를 통해 나온 option값 검증
  it('Base Class Merged Option Object', () => {
    // Parameter
    expect(chart.options.title.text).to.be.equal('BDD Title');
    expect(chart.options.title.show).to.be.equal(true);
    // default Options
    expect(chart.options.title.color).to.be.equal('#000000');
    expect(chart.options.title.font).to.be.equal('15px Arial');
    expect(chart.options.title.height).to.be.equal(40);
    expect(chart.options.padding).to.be.eql({ top: 5, left: 5, right: 5, bottom: 5 });
  });
});
