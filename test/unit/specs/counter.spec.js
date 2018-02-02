import { mount } from 'vue-test-utils';
import Counter from '../../../src/TDDTest/Counter2';

// 카운터 vue
describe('Counter', () => {
  let wrapper;

  beforeEach(() => {
    // TDD 진행 전에 vue 객체를 인터스화 시킨다.
    wrapper = mount(Counter);
  });

  it('defaults count 값 체크', () => {
    expect(wrapper.vm.count).to.equal(0);
  });

  it('increments button click 증가 체크', () => {
    expect(wrapper.vm.count).to.equal(0);

    wrapper.find('.increment').trigger('click');

    expect(wrapper.vm.count).to.equal(1);
  });

  it('decrements button click 감소체크', () => {
    wrapper.setData({ count: 5 });

    wrapper.find('.decrement').trigger('click'); // 4

    expect(wrapper.vm.count).to.equal(4);
  });

  // in only 사용하면 해당 테스트만 진행되고 다른 테스트는 진행 되지 않는다.
  // it.only('0 이상일때 감소 버튼 보여지는지 체크', () => {
  //   expect(wrapper.find('.decrement').hasStyle('display', 'none')).to.equal(true);
  //
  //   wrapper.setData({ count: 1 });
  //
  //   expect(wrapper.find('.decrement').hasStyle('display', 'none')).to.equal(false);
  // });

  it('html 현재 카운터 증가가 바인드 되서 같이 잘되는지 체크', () => {
    expect(wrapper.find('.count').html()).to.include(0);

    wrapper.find('button').trigger('click');

    expect(wrapper.find('.count').html()).to.include(1);
  });
});

