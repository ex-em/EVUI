<template>
  <div
    :class="classNames"
    :style="userSelectStyle"
    :flex="flexVal"
    @click="onCantainerClick">
    <slot/>
  </div>
</template>

<script>
  import ContainerFlex from './ContainerFlex';

  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';

  export default {


    props: {
      /** *
       *  Container 이름을 지정한다.
       *
       * */
      name: {
        type: String,
        default: 'Container',
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
        type: [String, Number],
        default: '100%',
      },
      /**
       * Container 높이를 설정합니다.
       */
      height: {
        type: [Number, String],
        default: '100%',
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
        parentHeight: null,
        parentWidth: null,
        parentLayout: null,
        sumFlex: 0,
      };
    },

    computed: {
      classNames() {
        return [
          'Container',
        ];
      },
      userSelectStyle() {
        const wrapperObj = typeof this.wrapperStyles === 'object' ? this.wrapperStyles : null;
        // let objs = [
        //     {
        //       width: this.containerWidth,
        //       height: this.containerHeight,
        //     }, this.wrapperStyles
        //   ],
        //   result =  objs.reduce(function (r, o) {
        //     Object.keys(o).forEach(function (k) {
        //       r[k] = o[k];
        //     });
        //     return r;
        //   }, {});
        return Object.assign({
          width: this.containerWidth,
          height: this.containerHeight,
        }, wrapperObj);
      },
      containerWidth() {
      if (this.$data.parentLayout === LAYOUT_HORIZONTAL && this.$data.sumFlex !== 0) {
          const flexdata = new ContainerFlex({
            vm: this,
            flexTotalVal: this.$data.sumFlex,
            parentWidth: this.$data.parentWidth,
            layout: this.$data.parentLayout,
            flex: this.flex,
          });
          return `${flexdata.FlexWidth()}px`;
        }
        return typeof this.width === 'number' ? `${this.width}px` : this.width.toString();
      },
      containerHeight() {
        if (this.$data.parentLayout === LAYOUT_VERTICAL && this.$data.sumFlex !== 0) {
          const flexdata = new ContainerFlex({
            vm: this,
            flexTotalVal: this.$data.sumFlex,
            parentHeight: this.$data.parentHeight,
            layout: this.$data.parentLayout,
            flex: this.flex,
          });

          return `${flexdata.FlexHeight()}px`;
        }
        return typeof this.height === 'number' ? `${this.height}px` : this.height;
      },
      flexVal() {
        return typeof this.flex === typeof null ? null : this.flex;
      },
    },
    mounted() {
      if (this.$children.length !== 0) {
          for (let ix = 0, ixLen = this.$children.length - 1; ix <= ixLen; ix += 1) {
            const slotobj = this.$children[ix];
            // 컨테이너가 아닌 dom은 class 반영 하지않는다.
            if (slotobj.name.indexOf('Container') !== -1) {
              // 부모가 수직 수평인지에 따라 자식 class를 변경한다.
              slotobj.$el.className = this.layout === LAYOUT_VERTICAL ? 'layout-v' : 'layout-h';
            }
          }
        }
      // 보모 존재 하면 부모 넓이/높이 값 추출
      if (this.$parent !== undefined && this.$parent.$el !== undefined
           && this.$parent.name !== undefined) {
        if (this.$parent.name.indexOf('Container') !== -1) {
          // % 넓이 인경우 환산 필요
          const ClientRect = this.$parent.$el.getBoundingClientRect();
          this.$data.parentWidth = ClientRect.width;
          this.$data.parentHeight = ClientRect.height;
          this.$data.parentLayout = this.$parent.layout;
          const childrenObj = this.$parent.$children;
          let sumFlex = 0;

          for (let ix = 0, ixlen = childrenObj.length; ix < ixlen; ix += 1) {
            if (childrenObj[ix].flex === null || childrenObj[ix].flex === 0) {
              sumFlex = 0; // 초기화처리
              break;
            }
            sumFlex += childrenObj[ix].flex;
          }
          this.$data.sumFlex = sumFlex;
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
      onCantainerClick(e) {
        this.$emit('onClickDiv', e);
      },

      childrenCnt() {
       return this.$children.length;
      },
      testCase() {
        return this.$children.length;
      },
      // findSider () {
      //   return this.$children.some(child => {
      //     return child.$options.name === 'Sider';
      //   });
      // },
    },
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
