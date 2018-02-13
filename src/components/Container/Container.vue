<template>
  <div
    :class="classnames"
    :style="userSelectStyle"
    :flex="flexVal"
    :id ="c_id"
    @click="OnCantainerClick">
    <slot></slot>
  </div>
</template>

<script>
  import ContainerFlex from './ContainerFlex.js';

  const LAYOUT_HORIZONTAL = 'Hbox';
  const LAYOUT_VERTICAL = 'Vbox';

  export default {
    name: 'Container',

    props: {
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
      wrapperStyles: {
        type: Object,
        default: null,
      },
      /**
       * Container 넓이 설정합니다.
       */
      width: {
        type: [String,Number],
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
      }
    },

    data() {
      return {
        parentHeight: null,
        parentWidth: null,
        parentLayout: null,
        sumflex: 0,
      };
    },

    computed: {
      c_id(){
        return this.id;
      },
      classnames() {
        return [
          'Container'
          // `layout-${this.layout.slice(0, 1)}`
        ];
      },
      userSelectStyle() {
        this.wrapperStyles =  typeof  this.wrapperStyles === 'object' ? this.wrapperStyles : null;
        return Object.assign({
          width     : this.containerWidth,
          height    : this.containerHeight,
        }, this.wrapperStyles);
      },
      containerWidth(){

      if(this.$data.parentLayout=== LAYOUT_HORIZONTAL && this.$data.sumflex !== 0){
          let flexdata =new ContainerFlex({
            vm              : this,
            FlexTotalVal    : this.$data.sumflex,
            parentWidth     : this.$data.parentWidth,
            layout          : this.$data.parentLayout,
            flex            : this.flex
          });
          return flexdata.FlexWidth()+'px';
        };
        return  typeof this.width === 'number' ? this.width + 'px' : this.width.toString();
      },
      containerHeight(){
        if(this.$data.parentLayout === LAYOUT_VERTICAL && this.$data.sumflex !== 0){
          let flexdata =new ContainerFlex({
            vm              : this,
            FlexTotalVal    : this.$data.sumflex,
            parentHeight    : this.$data.parentHeight,
            layout          : this.$data.parentLayout,
            flex            : this.flex
          });

          return flexdata.FlexHeight()+'px';
        }
        return  typeof this.height === 'number' ? this.height + 'px' : this.height;
      },
      flexVal(){
        return typeof this.flex === 'null' ? null : this.flex;
      }
    },
    mounted(){
      if(this.$children.length !== 0){
          for(let ix= 0, ixLen = this.$children.length-1; ix<=ixLen; ix++){
            let slotobj = this.$children[ix];
            // 컨테이너가 아닌 dom은 class 반영 하지않는다.
            if( slotobj.id.indexOf('evui-Container') === -1)continue;
            // 부모가 수직 수평인지에 따라 자식 class를 변경한다.
            slotobj.$el.className = this.layout === LAYOUT_VERTICAL ? 'layout-v' : 'layout-h'
          }
        }
      // 보모 존재 하면 부모 넓이/높이 값 추출
      if(this.$parent !== undefined && this.$parent.$el !== undefined){
        if(this.$parent.$el.id.indexOf('evui-Container') !== -1 ){
          //% 넓이 인경우 환산 필요
          let ClientRect = this.$parent.$el.getBoundingClientRect();
          this.$data.parentWidth  = ClientRect.width;
          this.$data.parentHeight = ClientRect.height;
          this.$data.parentLayout =  this.$parent.layout;

          let childrenObj = this.$parent.$children;
          let sumflex = 0;

          for(let ix =0 , ixlen = childrenObj.length; ix < ixlen; ix++ ){
            if(childrenObj[ix].flex === null || childrenObj[ix].flex === 0){
              sumflex = 0;  //초기화처리
              break;
            }
            sumflex += childrenObj[ix].flex;
          }
          this.$data.sumflex = sumflex;
        }
      }


    },
    created() {
      // this.cantainerSize = {
      //   'width': typeof this.width === 'number' ? this.width + 'px' : this.width,
      //   'height': typeof this.height === 'number' ? this.height + 'px' : this.height
      // };
    },
    methods: {
      OnCantainerClick(e) {
        this.$emit('onClickDiv',e);
      },

      childrenCnt() {
       return this.$children.length;
      },
      testCase(obj,param) {
        return this.$children.length;
      },
      // findSider () {
      //   return this.$children.some(child => {
      //     return child.$options.name === 'Sider';
      //   });
      // },
    }
  };

</script>

<style >
  .Container {
    /*display: flex;*/
    display:block;
    /*border:1px solid #000000;*/
  }

  .layout-h {
    display:inline-block;
    float:left;
    position: relative;
    /*border:1px solid #000000;*/
  }

  .layout-v {
    /*border:1px solid #000000;*/
    display: block;
    position: relative;
    /*margin-bottom:3px;*/
    /*display:table-cell;*/
    /*flex-direction: row;*/
  }

  /*.multipane > div {*/
  /*position: relative;*/
  /*z-index: 1;*/
  /*}*/
</style>
