import { shallow } from 'vue-test-utils';
import Table from '@/components/table/table';

/***
 * Table.vue
 * Table Component
 * TDD Start
 * utils API URL : https://vue-test-utils.vuejs.org/en/api/options.html#other-options
 */
describe('Table Component', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = shallow(Table);
  });

  it('Dom 생성여부 확인', (done) => {

    // vue 인스턴스 생성 확인여부
    expect(wrapper.isVueInstance()).to.be.true;

    //마운트한 wrapper 존재여부
    expect(wrapper.exists()).to.be.true;

    // el요소 확인
    expect(wrapper.element).to.be.ok;

    //컴포넌트 Contain 확인
    expect(wrapper.contains('div.evui-grid')).to.be.true;

    done();
  });

});


