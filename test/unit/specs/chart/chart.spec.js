import { shallow } from 'vue-test-utils';
import Chart from '@/components/chart/chart';

describe('Create Chart', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = shallow(Chart);
  });

  it('create Vue Component and HTML DOM', () => {
    expect(wrapper.isVueInstance()).to.be.true;
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.element).to.be.ok;
    expect(wrapper.contains('div.evui-chart-wrapper')).to.be.true;
    expect(wrapper.find('canvas')).to.be.ok;
  });

  it('props default value', () => {
    expect(wrapper.props().name).to.be.equal('Chart');
    expect(wrapper.props().width).to.be.equal('100%');
    expect(wrapper.props().height).to.be.equal('100%');
    expect(wrapper.props().chartData).to.be.eql([]);
    expect(wrapper.props().margin).to.be.eql({ top: 0, left: 0, right: 0, bottom: 0 });
  });

  it('props custom value', () => {
    const sampleData = [
      { x: '2000', y: 5.0 },
      { x: '2010', y: 6.0 },
      { x: '2020', y: 4.5 }
    ];

    const customWrapper = shallow(Chart, {
      propsData: {
        name: 'Test Name',
        width : 500,
        height: 600,
        chartData: sampleData
      }
    });

    expect(customWrapper.props().name).to.be.equal('Test Name');
    expect(customWrapper.props().width).to.be.equal(500);
    expect(customWrapper.props().height).to.be.equal(600);
    expect(customWrapper.props().chartData).to.be.eql(sampleData);

    customWrapper.destroy();
  });

  it('exist method', () => {
    expect(wrapper.vm.checkCanvasElement).to.be.a('function');
    expect(wrapper.vm.getMaxDataYValue).to.be.a('function');
    expect(wrapper.vm.render).to.be.a('function');
    expect(wrapper.vm.renderChart).to.be.a('function');
    expect(wrapper.vm.renderBackground).to.be.a('function');
    expect(wrapper.vm.renderText).to.be.a('function');
    expect(wrapper.vm.renderLinesAndLabels).to.be.a('function');
    expect(wrapper.vm.drawLine).to.be.a('function');
    expect(wrapper.vm.renderData).to.be.a('function');
    expect(wrapper.vm.getXInc).to.be.a('function');
  });

  it('check computed', () => {
    let customWrapper = shallow(Chart, {
      propsData: {
        width : 800,
        height: 600
      }
    });

    expect(customWrapper.vm.chartStyle.width).to.be.equal('800px');
    expect(customWrapper.vm.chartStyle.height).to.be.equal('600px');

    customWrapper = shallow(Chart, {
      propsData: {
        width : 50,
        height: '100%'
      }
    });

    expect(customWrapper.vm.chartStyle.width).to.be.equal('50px');
    expect(customWrapper.vm.chartStyle.height).to.be.equal('100%');

    customWrapper.destroy();
  });

  it('Check Method Output', () => {
    const sampleData = [
      { x: '2000', y: 5.0 },
      { x: '2010', y: 6.0 },
      { x: '2020', y: 4.5 }
    ];

    const customWrapper = shallow(Chart, {
      propsData: {
        name: 'Test Name',
        width : 800,
        height: 600,
        chartData: sampleData,
        margin: { top: 40, left: 75, right: 0, bottom: 75 }
      }
    });

    expect(customWrapper.vm.getXInc()).to.be.equal(-26);
    expect(customWrapper.vm.maxYValue).to.be.equal(6.0);
  });

  after(() => {
    wrapper.destroy();
  });
});
