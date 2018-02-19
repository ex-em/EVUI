import { shallow } from 'vue-test-utils';
import Chart from '@/components/chart/chart';

describe('Create Chart', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = shallow(Chart);
  });

  it('DOM 생성 확인', () => {
    // vue 인스턴스 생성 확인여부
    expect(wrapper.isVueInstance()).to.be.true;

    //마운트한 wrapper 존재여부
    expect(wrapper.exists()).to.be.true;

    // el요소 확인
    expect(wrapper.element).to.be.ok;

    //컴포넌트 Contain 확인
    expect(wrapper.contains('div.evui-chart-container')).to.be.true;
  });
});
