import Vue from 'vue'
import { mount } from 'vue-test-utils';
import Container from '@/components/container/Container';
import ContainerFlex from '@/components/container/ContainerFlex';




function nextTick () {
  return new Promise((resolve) => Vue.nextTick(resolve))
}
/***
 * Container.vue
 * Container Component
 * TDD Start
 */

describe('Container Component', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = mount(Container);
  });

  it(' Vue 마운트 여부 확인', () => {

    expect(wrapper.element).to.be.ok

  });

  it(' class 반영 ', () => {

    //최초 스타일 넓이 높이 확인
    //디폴트 값 100%
    expect(wrapper.element.style.width).to.be.equal('100%');
    expect(wrapper.element.style.height).to.be.equal('100%');

    wrapper.setProps({
      wraperStyles: {'width':'500px' , 'height' : '300px'}
    });
    // console.debug(` A: ${wrapper.element.style.width} B: ${wrapper.vm.element.style.width}  C: ${wrapper.vm.wraperStyles}`);

    expect(wrapper.element.style.width).to.be.equal('500px');
    expect(wrapper.element.style.height).to.be.equal('300px');
  });

  it('props 검사 ', () => {

    const LAYOUT_VERTICAL = 'Vbox';
    wrapper.setProps({
      /**
       * Container  ID를 지정합니다.
       */
      id: {
        type: String,
        default: function () {
          return 'evui-'+ 'Container-' + this._uid;
        },
      },
      /**
       * Container 세로, 수직  지정합니다.
       */
      layout: {
        type: String,
        default: LAYOUT_VERTICAL,
      },
      /**
       * Container css style를 적용합니다.
       */
      wraperStyles: {
        type: Object,
        default: null,
      },
      /**
       * Container 넓이 설정합니다.
       */
      width: {
        type: [Number,String],
        default: '100%'
      },
      /**
       * Container 높이를 설정합니다.
       */
      height: {
        type: [Number,String],
        default: '100%'
      },
      /**
       * Container flex 비율로 넓이/높이를 지정합니다.
       */
      flex: {
        type: Number,
        default: null,
      },
    });

    expect(wrapper.vm.layout.default).to.be.equal('Vbox');
    expect(wrapper.vm.flex.default).to.be.equal(null);
    expect(wrapper.vm.wraperStyles.default).to.be.equal(null);
    expect(wrapper.vm.width.default).to.be.equal('100%');
    expect(wrapper.vm.height.default).to.be.equal('100%');


  });


  it(' mounted hooks call ', () => {


    const LAYOUT_VERTICAL = 'Vbox';

    const wrapper_mount = mount(Container, {
      data() {
        return {
          ParentHeight: null,
          ParentWidth: null,
          Parentlayout: null,
          SumFlex: 0,
        };
      },
      mounted(){
        if(this.$slots.default !== undefined){
          for(let ix= 0, ixLen = this.$slots.default.length-1; ix<=ixLen; ix++){
            let slotobj = this.$slots.default[ix];
            // 부모가 수직 수평인지에 따라 자식 class를 변경한다.
            slotobj.elm.className = this.layout === LAYOUT_VERTICAL ? 'layout-v' : 'layout-h'
          }
        }

        //da
        expect(this.$parent).to.be.an('undefined');
        expect(this.$data.ParentHeight).to.be.equal(null);
        expect(this.$data.ParentWidth).to.be.equal(null);
        expect(this.$data.Parentlayout).to.be.equal(null);
        expect(this.$data.SumFlex).to.be.equal(0);

        // 보모 존재 하면 부모 넓이/높이 값 추출
        if(this.$parent !== undefined && this.$parent.$el !== undefined){
          if(this.$parent.$el.id.indexOf('evui-Container') !== -1 ){
            this.$data.ParentWidth  = this.$parent.$el.style.width.split('px')[0];
            this.$data.ParentHeight = this.$parent.$el.style.height.split('px')[0];
            this.$data.Parentlayout =  this.$parent.layout;
            let childrenObj = this.$parent.$children;
            let Sumflex = 0;

            for(let ix =0 , ixlen = childrenObj.length; ix < ixlen; ix++ ){
              if(childrenObj[ix].flex === null || childrenObj[ix].flex === 0){
                Sumflex = 0;  //초기화처리
                break;
              }
              Sumflex += childrenObj[ix].flex;
            }
            this.$data.SumFlex = Sumflex;
          }
        }

      }
    })

    expect(wrapper_mount.vm.$el).to.be.ok;



  });


  it('component import 사용 테스트',  () =>{
    const ParentComponent = {
      template: `<div style="height: 400px; widht:100%">
                   <container
                          layout='Hbox'
                          :wraperStyles = "{ 'background-color' : '#FFF59D'}"
                          :width = "400"
                          :height = "400">     
                            <container
                               layout='Vbox'
                               :wraperStyles ="{ 'background-color' : '#FFCDD2'}"
                               :width = "100"
                               :height = "100"
                               :flex = 0.3>
                           </container>
                            <container
                               layout='Vbox'
                               :wraperStyles ="{ 'background-color' : '#FFCDD2'}"
                               :width = "100"
                               :height = "100"
                               :flex = 0.7>
                           </container>
                           
                             <container
                               layout='Vbox'
                               :wraperStyles ="{ 'background-color' : '#FFCDD2'}"
                               :width = "100"
                               :height = "100"
                               :flex = 0.3>
                           </container>
                            <container
                               layout='Vbox'
                               :wraperStyles ="{ 'background-color' : '#FFCDD2'}"
                               :width = "100"
                               :height = "100"
                               :flex = 0.7>
                           </container>
                           
                  </container>
               </div>`,
      components: {
        Container
      }
    }

    const pvm = mount(ParentComponent);
    const vm = pvm.vm.$children[0];

    nextTick().then(function () {

      expect(vm.$el.style.width).to.be.equal('400px');
      expect(vm.$el.style.height).to.be.equal('400px');
      expect(vm.$children).to.have.lengthOf('4');
      expect(vm.$slots.default[0].elm.attributes.flex.value).to.be.equal('0.3');


      // 보모 존재 하면 부모 넓이/높이 값 추출
      // if(vm.$parent !== undefined && vm.$parent.$el !== undefined){
      //   if(vm.$parent.$el.id.indexOf('evui-Container') !== -1 ){
      //     vm.$data.ParentWidth  = vm.$parent.$el.style.width.split('px')[0];
      //     vm.$data.ParentHeight = vm.$parent.$el.style.height.split('px')[0];
      //     vm.$data.Parentlayout =  vm.$parent.layout;
      //     let childrenObj = vm.$parent.$children;
      //     let Sumflex = 0;
      //
      //     for(let ix =0 , ixlen = childrenObj.length; ix < ixlen; ix++ ){
      //       if(childrenObj[ix].flex === null || childrenObj[ix].flex === 0){
      //         Sumflex = 0;  //초기화처리
      //         break;
      //       }
      //       Sumflex += childrenObj[ix].flex;
      //     }
      //     vm.$data.SumFlex = Sumflex;
      //   }
      // }

      // expect(wrapper_im.vm.$children[0].$el.style.height).to.be.equal('100px');
      // expect(wrapper_im.vm.$children[0].$el.style.height).to.be.equal('100px');

    })
    // vue 버그 관련 정보
    // This is expected behavior. To ensure the exact same visual output from the template, VNodes are created for whitespaces too.
    //   You can filter for non-text nodes by checking the presence of vnode.tag. Or, if you don't want any whitespaces at all, use vue-loader with preserveWhitespace: false.

    pvm.destroy();
  })




  describe('Container computed 테스트', () => {

    it(' classnames() ', () => {
      wrapper.setComputed({
        classnames:  [
          'Container'
          // `layout-${this.layout.slice(0, 1)}`
        ],
        // computed2: 'new-computed2'
      })
      expect(wrapper.vm.classnames).to.include.members(['Container'])
    });

    it('userSelectStyle() ', () => {

      wrapper.setProps({
        wraperStyles: {'background-color':'tomato'}
      });

      let wraperStyles =  typeof  wrapper.vm.wraperStyles === 'object' ? wrapper.vm.wraperStyles : null;
      let assignData = Object.assign({
        width     : '500px',
        height    : '300px',
      }, wraperStyles)

      wrapper.setComputed({
        userSelectStyle:  assignData
      })
      expect(wrapper.vm.userSelectStyle).to.include({'background-color':'tomato','width':'500px' , 'height' : '300px'})
    });

    it('ContainerWidth() ,ContainerHeight() ', () => {

      wrapper.setProps({
        width: 500,
        height: 500,
      });

      // 넓이 셋팅
      let WrapperWidth = typeof wrapper.vm.width === 'number' ? wrapper.vm.width + 'px' : wrapper.vm.width;

      wrapper.setComputed({
        ContainerWidth:  WrapperWidth
      })

      expect(wrapper.vm.ContainerWidth).to.be.equal('500px');

      // 높이 셋팅
      let WrapperHeight = typeof wrapper.vm.height === 'number' ? wrapper.vm.height + 'px' : wrapper.vm.height;
      wrapper.setComputed({
        ContainerHeight:  WrapperHeight
      })
      expect(wrapper.vm.ContainerHeight).to.be.equal('500px');
    });


  });

  after(() => {
    // TDD 진행 전에 vue 객체를 인터스화 시킨다.
    wrapper.destroy();
  });
});




/***
 * ContainerFlex.js
 * Flex 비율에 따라  넓이/높이 구하는 로직
 * TDD Start
 */

describe('ContainerFlex script', () => {

  it('ContainerFlex 객체 생성 여부 확인', () => {
    let Flex_props = new ContainerFlex({});

    expect(Flex_props).to.be.a('object');

    Flex_props = null;
  });

  it('ContainerFlex constructor 값 셋팅', () => {

    let Flex_props = new ContainerFlex({
      vm              : {},
      FlexTotalVal    : 2.2,
      parentWidth     : 800,
      layout          : "Hbox",
      flex            : 0.5
    });

    expect(Flex_props.vm).to.be.a('object');
    expect(Flex_props.FlexTotalVal).to.be.a('number');
    expect(Flex_props.parentWidth).to.be.a('number');
    expect(Flex_props.layout).to.be.a('string');
    expect(Flex_props.flex).to.be.a('number');

    Flex_props = null

  });


  describe('ContainerFlex', () => {

    describe('Method', () => {
      let Flex_props = new ContainerFlex({
        vm              : {},
        FlexTotalVal    : 2.2,
        parentWidth     : 800,
        layout          : "Hbox",
        flex            : 0.5
      });

      it('FlexWidth 메서드 확인 ', () => {
        // expect( Flex_props.FlexWidth()).to.be.instanceof(Flex_props);
        expect( Flex_props.FlexWidth()).to.be.a('number');
        expect( Flex_props.FlexWidth).to.be.a('function');
      });

      it('FlexWidth flex width 계산', () => {

        let FlexTotalVal = Flex_props.FlexTotalVal || 1;
        let parentWidth = Flex_props.parentWidth || 0;
        let layout = Flex_props.layout || '';
        let flex = Flex_props.flex || 1;

        expect( Flex_props.vm ).to.be.a('object');
        expect( FlexTotalVal ).to.be.a('number');
        expect( parentWidth ).to.be.a('number');
        expect( layout ).to.be.a('string');
        expect( flex ).to.be.a('number');

        // 컨테이너 비율 넓이 값 계산
        const ContainerRatioWidth = parentWidth / FlexTotalVal;
        // 컨테이너 안에 box flex 넓이 값 계산
        const flexWidth = Math.floor(ContainerRatioWidth) * flex;
        expect( flexWidth ).to.be.a('number');
        expect( flexWidth ).to.be.equal(181.5); // 계산 결과 값

      });
    });

    describe('Method', () => {
      let Flex_props = new ContainerFlex({
        vm              : {},
        FlexTotalVal    : 2.2,
        parentHeight     : 800,
        layout          : "Vbox",
        flex            : 0.5
      });
      it('FlexHeight 메서드 확인 ', () => {
        // expect( Flex_props.FlexWidth()).to.be.instanceof(Flex_props);
        expect( Flex_props.FlexHeight()).to.be.a('number');
        expect( Flex_props.FlexHeight).to.be.a('function')
      });

      it('FlexHeight flex height 계산', () => {

        let VueVm =  Flex_props.vm || null;
        let FlexTotalVal = Flex_props.FlexTotalVal || 1; // 값이 없으면 1 셋팅
        let parentHeight = Flex_props.parentHeight || 0;
        let layout = Flex_props.layout || '';
        let flex = Flex_props.flex || 1;

        expect( Flex_props.vm ).to.be.a('object');
        expect( FlexTotalVal ).to.be.a('number');
        expect( parentHeight ).to.be.a('number');
        expect( layout ).to.be.a('string');
        expect( flex ).to.be.a('number');

        expect(VueVm).to.include({});
        expect(FlexTotalVal).to.equal(2.2);
        expect(parentHeight).to.equal(800);
        expect(layout).to.equal("Vbox");
        expect(flex).to.equal(0.5);


        // 컨테이너 비율 넓이 값 계산
        const ContainerRatioHeight = parentHeight / FlexTotalVal;
        // 컨테이너 안에 box flex 넓이 값 계산
        const flexHeight = Math.floor(ContainerRatioHeight) * flex;
        expect( flexHeight ).to.be.a('number');
        expect( flexHeight ).to.be.equal(181.5); // 계산 결과 값


      });

    });


  });

});
