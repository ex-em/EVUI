import { mount } from 'vue-test-utils';
import Chart from '@/components/chart/chart';

describe('Create Chart', () => {
  const wrapper = mount(Chart);
  const chart = wrapper.vm;

  it('Mounted chart Vue Component', () => {
    expect(chart.$el.getElementsByClassName('evui-chart-container')).to.exist;
  });

  it('Created Canvas Element', () => {
    expect(wrapper.contains('canvas')).to.exist;
  });




  // it('is Exist Chart.vue file?', () => {
  //   let vueFile = require('@/components/Chart/Chart');
  //   expect(vueFile.default.name).to.be.equal('sample-canvas');
  // });
  //
  // it('Create Canvas Object', () => {
  //   const canvas = chart.find('#sample-canvas');
  //   expect(canvas.contains('canvas')).toBe(true);
  // });
  //
  // it('Check Browser support', () => {
  //   expect(chart.vm.checkBrowserSupport).to.exist;
  // });
  //
  // it('Check typeof Browser support', () => {
  //   expect(typeof chart.vm.checkBrowserSupport).to.equal('function');
  // });


});
