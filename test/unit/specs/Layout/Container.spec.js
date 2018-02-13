import { shallow } from 'vue-test-utils';
import Container from '@/components/Container/Container';
import ContainerFlex from '@/components/Container/ContainerFlex';



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
    expect(wrapper.isVueInstance()).to.be.true

    //마운트한 wrapper 존재여부
    expect(wrapper.exists()).to.be.true

    // el요소 확인
    expect(wrapper.element).to.be.ok

    //컴포넌트 Contain 확인
    expect(wrapper.contains('div')).to.be.true
    //dom 클래스 반영 확인
    expect(wrapper.classes()).to.include('Container')

    // dom El 찾기
    const div = wrapper.find('div')
    expect(div.is('div')).to.be.true

    //dom El 모두 찾기
    const div2 = wrapper.findAll('div').at(0)
    expect(div2.is('div')).to.be.true

    done();
  });

  it('props 검증', (done) => {

    expect(wrapper.props().id).to.be.equal("evui-"+ "Container-" + wrapper.vm._uid)
    expect(wrapper.props().layout).to.be.equal("Vbox")
    expect(wrapper.props().wrapperStyles).to.be.equal(null)
    expect(wrapper.props().width).to.be.equal("100%")
    expect(wrapper.props().height).to.be.equal("100%")
    expect(wrapper.props().flex).to.be.equal(null)
    done();

  });

  it('props 검증2', (done) => {

    const wrapper2 = shallow(Container, {
      propsData: {
        layout: "Hbox",
        wrapperStyles : {'background-color':'red'},
        width : "400px",
        height : "400px",
        flex : 0.3
      }
    })

    expect(wrapper2.props().layout).to.be.equal("Hbox")
    expect(wrapper2.props().wrapperStyles).to.include({'background-color':'red'})
    expect(wrapper2.props().width).to.be.equal("400px")
    expect(wrapper2.props().height).to.be.equal("400px")
    expect(wrapper2.props().flex).to.be.equal(0.3)

    // style 반영 확인
    expect(wrapper2.hasStyle('display','block')).to.be.true

    done();




    wrapper2.destroy();
  });

  it('Method 존재 여부 확인', (done) => {

    expect(wrapper.vm.childrenCnt).to.be.not.a('undefined');
    expect(wrapper.vm.testCase).to.be.not.a('undefined');
    done();

  });

  it('emitte 체크', (done) => {

    expect(wrapper.vm.childrenCnt).to.be.not.a('undefined');
    expect(wrapper.vm.testCase).to.be.not.a('undefined');
    done();

  });

  it('Computed 체크', (done) => {
    const wrapper2 = shallow(Container);

    wrapper2.setProps({  layout: "Hbox",
      wrapperStyles : {'background-color':'red'},
      width : "400px",
      height : "400px",
      flex : 0.3
    })

    expect(wrapper2.vm.userSelectStyle).to.include({width: "400px", height: "400px",'background-color':'red'});
    expect(wrapper2.vm.containerWidth).to.include("400px");

    done();

    wrapper2.destroy();
  });

  after(() => {
    // TDD 진행 전에 vue 객체를 소멸한다.
    wrapper.destroy();
  });

})

/***
 * ContainerFlex.js
 * Flex 비율에 따라  넓이/높이 구하는 로직
 * TDD Start
 */

describe('ContainerFlex script', () => {

  it('ContainerFlex 객체 생성 여부 확인', () => {
    let flexProps = new ContainerFlex({});

    expect(flexProps).to.be.a('object');

    flexProps = null;
  });

  it('ContainerFlex constructor 값 셋팅', () => {

    let flexProps = new ContainerFlex({
      vm              : {},
      flexTotalVal    : 2.2,
      parentWidth     : 800,
      layout          : "Hbox",
      flex            : 0.5
    });

    expect(flexProps.vm).to.be.a('object');
    expect(flexProps.flexTotalVal).to.be.a('number');
    expect(flexProps.parentWidth).to.be.a('number');
    expect(flexProps.layout).to.be.a('string');
    expect(flexProps.flex).to.be.a('number');

    flexProps = null

  });


  describe('ContainerFlex', () => {

    describe('Method', () => {
      let flexProps = new ContainerFlex({
        vm              : {},
        flexTotalVal    : 2.2,
        parentWidth     : 800,
        layout          : "Hbox",
        flex            : 0.5
      });

      it('FlexWidth 메서드 확인 ', () => {
        // expect( flexProps.FlexWidth()).to.be.instanceof(flexProps);
        expect( flexProps.FlexWidth()).to.be.a('number');
        expect( flexProps.FlexWidth).to.be.a('function');
      });

      it('FlexWidth flex width 계산', () => {

        let flexTotalVal = flexProps.flexTotalVal || 1;
        let parentWidth = flexProps.parentWidth || 0;
        let layout = flexProps.layout || '';
        let flex = flexProps.flex || 1;

        expect( flexProps.vm ).to.be.a('object');
        expect( flexTotalVal ).to.be.a('number');
        expect( parentWidth ).to.be.a('number');
        expect( layout ).to.be.a('string');
        expect( flex ).to.be.a('number');

        // 컨테이너 비율 넓이 값 계산
        const ContainerRatioWidth = parentWidth / flexTotalVal;
        // 컨테이너 안에 box flex 넓이 값 계산
        const flexWidth = Math.floor(ContainerRatioWidth) * flex;
        expect( flexWidth ).to.be.a('number');
        expect( flexWidth ).to.be.equal(181.5); // 계산 결과 값

      });
    });

    describe('Method', () => {
      let flexProps = new ContainerFlex({
        vm              : {},
        flexTotalVal    : 2.2,
        parentHeight     : 800,
        layout          : "Vbox",
        flex            : 0.5
      });
      it('FlexHeight 메서드 확인 ', () => {
        // expect( flexProps.FlexWidth()).to.be.instanceof(flexProps);
        expect( flexProps.FlexHeight()).to.be.a('number');
        expect( flexProps.FlexHeight).to.be.a('function')
      });

      it('FlexHeight flex height 계산', () => {

        let VueVm =  flexProps.vm || null;
        let flexTotalVal = flexProps.flexTotalVal || 1; // 값이 없으면 1 셋팅
        let parentHeight = flexProps.parentHeight || 0;
        let layout = flexProps.layout || '';
        let flex = flexProps.flex || 1;

        expect( flexProps.vm ).to.be.a('object');
        expect( flexTotalVal ).to.be.a('number');
        expect( parentHeight ).to.be.a('number');
        expect( layout ).to.be.a('string');
        expect( flex ).to.be.a('number');

        expect(VueVm).to.include({});
        expect(flexTotalVal).to.equal(2.2);
        expect(parentHeight).to.equal(800);
        expect(layout).to.equal("Vbox");
        expect(flex).to.equal(0.5);


        // 컨테이너 비율 넓이 값 계산
        const ContainerRatioHeight = parentHeight / flexTotalVal;
        // 컨테이너 안에 box flex 넓이 값 계산
        const flexHeight = Math.floor(ContainerRatioHeight) * flex;
        expect( flexHeight ).to.be.a('number');
        expect( flexHeight ).to.be.equal(181.5); // 계산 결과 값


      });

    });


  });

});

//
//
// function nextTick () {
//   return new Promise((resolve) => Vue.nextTick(resolve))
// }
// /***
//  * Container.vue
//  * Container Component
//  * TDD Start
//  */
//
// describe('Container Component', () => {
//
//   beforeEach(() => {
//     // vue 인스턴트 활성화
//   });
//
//   const LAYOUT_HORIZONTAL = 'Hbox';
//   const LAYOUT_VERTICAL = 'Vbox';
//   it(' shallowed hooks call ', () => {
//
//
//     // const LAYOUT_VERTICAL = 'Vbox';
//
//     const wrapper_shallow = shallow(Container, {
//
//
//       name: 'Container',
//
//       props: {
//         /**
//          * Container  ID를 지정합니다.
//          */
//         id: {
//           type: String,
//           default: function () {
//             return 'evui-'+ 'Container-' + this._uid;
//           },
//         },
//         /**
//          * Container 세로, 수직  지정합니다.
//          */
//         layout: {
//           type: String,
//           default: LAYOUT_VERTICAL,
//         },
//         /**
//          * Container css style를 적용합니다.
//          */
//         wrapperStyles: {
//           type: Object,
//           default: null,
//         },
//         /**
//          * Container 넓이 설정합니다.
//          */
//         width: {
//           type: [String,Number],
//           default: '100%'
//         },
//         /**
//          * Container 높이를 설정합니다.
//          */
//         height: {
//           type: [Number,String],
//           default: '100%'
//         },
//         /**
//          * Container flex 비율로 넓이/높이를 지정합니다.
//          */
//         flex: {
//           type: Number,
//           default: null,
//         },
//         name: {
//           type: String
//         },
//       },
//
//       data() {
//         return {
//           ParentHeight: null,
//           ParentWidth: null,
//           Parentlayout: null,
//           SumFlex: 0,
//         };
//       },
//
//       computed: {
//         C_id(){
//           return this.id;
//         },
//         classnames() {
//           return [
//             'Container'
//             // `layout-${this.layout.slice(0, 1)}`
//           ];
//         },
//         userSelectStyle() {
//           this.wrapperStyles =  typeof  this.wrapperStyles === 'object' ? this.wrapperStyles : null;
//           return Object.assign({
//             width     : this.ContainerWidth,
//             height    : this.ContainerHeight,
//           }, this.wrapperStyles);
//         },
//         ContainerWidth(){
//
//           if(this.$data.Parentlayout=== LAYOUT_HORIZONTAL && this.$data.SumFlex !== 0){
//             let flexdata =new ContainerFlex({
//               vm              : this,
//               flexTotalVal    : this.$data.SumFlex,
//               parentWidth     : this.$data.ParentWidth,
//               layout          : this.$data.Parentlayout,
//               flex            : this.flex
//             });
//             return flexdata.FlexWidth()+'px';
//           }
//           return  typeof this.width === 'number' ? this.width + 'px' : this.width.toString();
//         },
//         ContainerHeight(){
//           if(this.$data.Parentlayout === LAYOUT_VERTICAL && this.$data.SumFlex !== 0){
//             let flexdata =new ContainerFlex({
//               vm              : this,
//               flexTotalVal    : this.$data.SumFlex,
//               parentHeight    : this.$data.ParentHeight,
//               layout          : this.$data.Parentlayout,
//               flex            : this.flex
//             });
//
//             return flexdata.FlexHeight()+'px';
//           }
//           return  typeof this.height === 'number' ? this.height + 'px' : this.height;
//         }
//       },
//         mounted(){
//             this.test_k();
//
//
//         },
//       methods: {
//         test_k() {
//           return true;
//         },
//       }
//
//     })
//
//
//     nextTick().then(function () {
//
//     })
//
//
//
//     expect(wrapper_shallow.vm.$el).to.be.ok;
//
//
//
//   });
//
// });
//
//
