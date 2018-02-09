<template>
  <div
      :class="classnames"
      :style="userSelectStyle"
      :flex="flexVal"
      :id ="C_id">
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
    },

    data() {
      return {
        ParentHeight: null,
        ParentWidth: null,
        Parentlayout: null,
        SumFlex: 0,
      };
    },

    computed: {
      C_id(){
        return this.id;
      },
      classnames() {
        return [
          'Container'
          // `layout-${this.layout.slice(0, 1)}`
        ];
      },
      userSelectStyle() {
        this.wraperStyles =  typeof  this.wraperStyles === 'object' ? this.wraperStyles : null;
        return Object.assign({
          width     : this.ContainerWidth,
          height    : this.ContainerHeight,
        }, this.wraperStyles);
      },
      ContainerWidth(){

        if(this.$data.Parentlayout=== LAYOUT_HORIZONTAL && this.$data.SumFlex !== 0){
          let flexdata =new ContainerFlex({
            vm              : this,
            FlexTotalVal    : this.$data.SumFlex,
            parentWidth     : this.$data.ParentWidth,
            layout          : this.$data.Parentlayout,
            flex            : this.flex
          });

          return flexdata.FlexWidth()+'px';
        }
       return  typeof this.width === 'number' ? this.width + 'px' : this.width;
      },
      ContainerHeight(){
        // console.log( this.$data.Parentlayout , this ,  this.$data.SumFlex )
        if(this.$data.Parentlayout === LAYOUT_VERTICAL && this.$data.SumFlex !== 0){
          let flexdata =new ContainerFlex({
            vm              : this,
            FlexTotalVal    : this.$data.SumFlex,
            parentHeight     : this.$data.ParentHeight,
            layout          : this.$data.Parentlayout,
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

       if(this.$slots.default !== undefined){
         for(let ix= 0, ixLen = this.$slots.default.length-1; ix<=ixLen; ix++){
            let slotobj = this.$slots.default[ix];
            // 부모가 수직 수평인지에 따라 자식 class를 변경한다.
            slotobj.elm.className = this.layout === LAYOUT_VERTICAL ? 'layout-v' : 'layout-h'
         }
       }
       // 보모 존재 하면 부모 넓이/높이 값 추출
       if(this.$parent !== undefined && this.$parent.$el !== undefined){
          if(this.$parent.$el.id.indexOf('evui-Container') !== -1 ){
            this.$data.ParentWidth  = this.$parent.$el.style.width.split('px')[0];
            this.$data.ParentHeight = this.$parent.$el.style.height.split('px')[0];
            this.$data.Parentlayout =  this.$parent.layout;
            // console.log(this.$data.Parentlayout);
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


    },
    created() {
      // this.cantainerSize = {
      //   'width': typeof this.width === 'number' ? this.width + 'px' : this.width,
      //   'height': typeof this.height === 'number' ? this.height + 'px' : this.height
      // };
    },
    methods: {
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
