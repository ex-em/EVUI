import { shallow } from 'vue-test-utils';
import inputNumber from '@/components/input/input.number';

describe('Create Input Number', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(inputNumber);
  });

  it('create Vue Component and HTML DOM', () => {
    expect(wrapper.isVueInstance()).to.be.true;
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.element).to.be.ok;
    expect(wrapper.contains('input')).to.be.true;
  });

  it('create setter', () => {
    expect(wrapper.vm.setValue).to.be.a('function');
  });

  it('check valid setter value', () => {
    expect(wrapper.vm.setValue).to.be.a('function');
  });

  after(() => {
    wrapper.destroy();
  });
});
