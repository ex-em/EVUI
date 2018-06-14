import { shallow } from 'vue-test-utils';
import Chart from '@/components/chart/chart';

describe('Verification Chart Vue Component', () => {
  let defaultChart;

  beforeEach(() => {
    defaultChart = shallow(Chart);
  });
  // 1. Vue Component 검증
  it('Create Vue Component and HTML DOM', () => {
    expect(defaultChart.isVueInstance()).to.be.true;
    expect(defaultChart.exists()).to.be.true;
    expect(defaultChart.element).to.be.ok;
    expect(defaultChart.contains('div.evui-chart')).to.be.true;
    expect(defaultChart.find('canvas')).to.be.ok;
  });
  // 2. 기본 Vue Copmpoennt Props 검증
  it('Verifying property default value', () => {
    expect(defaultChart.props().data).to.be.eql({ series: [] });
    expect(defaultChart.props().options).to.be.eql({ type: 'line', xAxes: [], yAxes: [] });
  });

  // 3. 사용자 정의 Vue Component Props 검증
  it('Verifying property custom value', () => {
    const customChart = shallow(Chart, {
      propsData: {
        options: {
          type: 'LINE',
          width: '100%',
          height: '100%',
          title: {
            text: 'BDD Title',
            style: '20px Arial',
            color: '#000000',
            height: 50,
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
        },
        data: {
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
        },
      }
    });

    expect(customChart.props().options.type).to.be.equal('LINE');
    expect(customChart.props().options.width).to.be.equal('100%');
    expect(customChart.props().options.title.text).to.be.equal('BDD Title');
    expect(customChart.props().options.xAxes[0].type).to.be.equal('time');
    expect(customChart.props().options.yAxes[0].type).to.be.equal('linear');

    expect(customChart.props().data.series[0].id).to.be.equal('series1');
    expect(customChart.props().data.series[0].point).to.be.equal(true);
    expect(customChart.props().data.series[0].data[0].y).to.be.equal(15);

    customChart.destroy();
  });

  it('Verifying Vue Method', () => {
    expect(defaultChart.vm.getChartSize).to.be.a('function');
  });

  after(() => {
    defaultChart.destroy();
  });
});
