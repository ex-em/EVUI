import { shallow } from 'vue-test-utils';
import Container from '@/components/container/container';

/***
 * Container.vue
 * Container Component
 * TDD Start
 * utils API URL : https://vue-test-utils.vuejs.org/en/api/options.html#other-options
 */
describe('Container Component', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = shallow(Container);
  });

  it('Dom 생성여부 확인', (done) => {

    // vue 인스턴스 생성 확인여부
    expect(wrapper.isVueInstance()).to.be.true;

    //마운트한 wrapper 존재여부
    expect(wrapper.exists()).to.be.true;

    // el요소 확인
    expect(wrapper.element).to.be.ok;

    //컴포넌트 Contain 확인
    expect(wrapper.contains('div')).to.be.true;

    // dom El 찾기
    const domobj = wrapper.find('div');
    expect(domobj.is('div')).to.be.true;

    //dom El 모두 찾기
    const DomobjAll = wrapper.findAll('div').at(0);
    expect(DomobjAll.is('div')).to.be.true;

    done();
  });

  it('props 검증', (done) => {

    expect(wrapper.props().layout).to.be.equal(null);
    expect(wrapper.props().wrapperStyles).to.be.equal(null);
    expect(wrapper.props().width).to.be.equal('100%');
    expect(wrapper.props().height).to.be.equal('100%');
    expect(wrapper.props().minWidth).to.be.equal('50px');
    expect(wrapper.props().maxWidth).to.be.equal('100%');
    expect(wrapper.props().minHeight).to.be.equal('50px');
    expect(wrapper.props().maxHeight).to.be.equal('100%');
    expect(wrapper.props().flex).to.be.equal(null);
    done();

  });

  it('props 검증 데이타 변경', (done) => {

    const custormWrapper = shallow(Container, {
      propsData: {
        layout: 'hBox',
        wrapperStyles : {'background-color':'red'},
        width : '400px',
        height : '400px',
        minWidth: '100px',
        maxWidth:'500px',
        minHeight: '50px',
        maxHeight: '500px',
        flex : 0.3
      }
    });

    expect(custormWrapper.props().layout).to.be.equal('hBox');
    expect(custormWrapper.props().wrapperStyles).to.include({'background-color':'red'});
    expect(custormWrapper.props().width).to.be.equal('400px');
    expect(custormWrapper.props().height).to.be.equal('400px');
    expect(custormWrapper.props().minWidth).to.be.equal('100px');
    expect(custormWrapper.props().maxWidth).to.be.equal('500px');
    expect(custormWrapper.props().minHeight).to.be.equal('50px');
    expect(custormWrapper.props().maxHeight).to.be.equal('500px');
    expect(custormWrapper.props().flex).to.be.equal(0.3);


    done();

    custormWrapper.destroy();
  });

  it('Method 존재 여부 확인', (done) => {
    // 함수 존재 확인
    expect(wrapper.vm.onMouseDown).to.be.a('function');
    // 함수 파라미터 갯수 확인
    expect(wrapper.vm.onMouseDown._length).to.be.equal(1);

    expect(wrapper.vm.styleSizeValue).to.be.a('function');
    expect(wrapper.vm.styleSizeValue._length).to.be.equal(1);

    expect(wrapper.vm.getWidth).to.be.a('function');
    expect(wrapper.vm.getWidth._length).to.be.equal(0);

    expect(wrapper.vm.setWidth).to.be.a('function');
    expect(wrapper.vm.setWidth._length).to.be.equal(1);

    expect(wrapper.vm.getHeight).to.be.a('function');
    expect(wrapper.vm.getHeight._length).to.be.equal(0);

    expect(wrapper.vm.setHeight).to.be.a('function');
    expect(wrapper.vm.setHeight._length).to.be.equal(1);

    expect(wrapper.vm.getName).to.be.a('function');
    expect(wrapper.vm.onMouseDown._length).to.be.equal(1);

    expect(wrapper.vm.getFlex).to.be.a('function');
    expect(wrapper.vm.getFlex._length).to.be.equal(0);

    expect(wrapper.vm.setFlex).to.be.a('function');
    expect(wrapper.vm.setFlex._length).to.be.equal(1);

    expect(wrapper.vm.getMinWidth).to.be.a('function');
    expect(wrapper.vm.getMinWidth._length).to.be.equal(0);

    expect(wrapper.vm.setMinWidth).to.be.a('function');
    expect(wrapper.vm.setMinWidth._length).to.be.equal(1);

    expect(wrapper.vm.getMinHeight).to.be.a('function');
    expect(wrapper.vm.getMinHeight._length).to.be.equal(0);

    expect(wrapper.vm.setMinHeight).to.be.a('function');
    expect(wrapper.vm.setMinHeight._length).to.be.equal(1);

    expect(wrapper.vm.getMaxWidth).to.be.a('function');
    expect(wrapper.vm.getMaxWidth._length).to.be.equal(0);

    expect(wrapper.vm.setMaxHeight).to.be.a('function');
    expect(wrapper.vm.setMaxHeight._length).to.be.equal(1);

    expect(wrapper.vm.getMaxWidth).to.be.a('function');
    expect(wrapper.vm.getMaxWidth._length).to.be.equal(0);

    expect(wrapper.vm.deleteFlex).to.be.a('function');
    expect(wrapper.vm.deleteFlex._length).to.be.equal(0);

    done();

  });

  it('Method Input/output 확인', (done) => {
    // 함수 존재 확인
    expect(wrapper.vm.onMouseDown).to.be.a('function');
    // 함수 파라미터 갯수 확인
    expect(wrapper.vm.onMouseDown._length).to.be.equal(1);

    expect(wrapper.vm.styleSizeValue(100)).to.be.equal(100);
    expect(wrapper.vm.styleSizeValue('100%')).to.be.equal('100%');

    expect(wrapper.vm.getWidth()).to.be.equal('100%');

    wrapper.vm.setWidth('300'); // input
    expect(wrapper.vm.widthVal).to.be.equal('300px'); //output

    expect(wrapper.vm.getHeight()).to.be.equal('100%');

    wrapper.vm.setHeight('100%'); // input
    expect(wrapper.vm.heightVal).to.be.equal('100%'); // output

    expect(wrapper.vm.getName()).to.be.equal('Container');

    expect(wrapper.vm.getFlex()).to.be.equal(null);

    wrapper.vm.setFlex(3); // input
    expect(wrapper.vm.flexVal).to.be.equal(3); // output

    expect(wrapper.vm.getMinWidth()).to.be.equal('50px');

    expect(wrapper.vm.getMinHeight()).to.be.equal('50px');

    wrapper.vm.setMinWidth(100);  // input
    expect(wrapper.vm.minWidthVal).to.be.equal('100px');// output

    wrapper.vm.setMinHeight(200); // input
    expect(wrapper.vm.minHeightVal).to.be.equal('200px');// output

    expect(wrapper.vm.getMaxWidth()).to.be.equal('100%');// output

    wrapper.vm.setMaxHeight(300); // input
    expect(wrapper.vm.maxHeightVal).to.be.equal('300px');// output

    expect(wrapper.vm.getMaxWidth()).to.be.equal('100%');// output

    wrapper.vm.deleteFlex(); // input
    expect(wrapper.vm.panelFlex).to.be.equal(null);// output

    done();

  });

  // it('emit 체크', (done) => {
  //
  //   const wrapperEmit = shallow(containerbox);
  //   // emit 실행
  //   wrapperEmit.vm.onMouseDown({'target':'test' , 'pageX' : 'test2' , 'pageY' : 'test2'});
  //   // emit 생성 확인
  //   expect(wrapper.emitted().onClickDiv).to.be.ok;
  //   // 파라미터 개수 확인
  //   expect(wrapper.emitted().onClickDiv[0].length).to.be.equal(3);
  //
  //   done();
  //
  // });

  it('Computed 체크', (done) => {
    const custormWrapper = shallow(Container);

    custormWrapper.setProps({  layout: 'hBox',
      wrapperStyles : {'background-color':'red'},
      width : '400px',
      height : '400px',
      flex : 0.3
    });

    expect(custormWrapper.vm.userSelectStyle).to.include({width: '400px', height: '400px','background-color':'red'});
    expect(custormWrapper.vm.containerWidth).to.include('400px');

    done();

    custormWrapper.destroy();
  });

  after(() => {
    // TDD 진행 전에 vue 객체를 소멸한다.
    wrapper.destroy();
  });

});


