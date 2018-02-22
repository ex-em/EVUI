<template>
  <div
    :class="classNames"
    :style="userSelectStyle"
    :flex="flexVal"
    :id="cId"
    @mousedown="onMouseDown"
  >
    <slot/>
  </div>
</template>

<script>

  const LAYOUT_HORIZONTAL = 'hBox';
  const LAYOUT_VERTICAL = 'vBox';

  export default {


    props: {
      /** *
       *  Container id를 지정한다.
       *
       * */
      id: {
        type: String,
        default() {
          return `evui-container-${this._uid}`;
        },
      },
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
        default: null,
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
       * Container 최소넓이 설정합니다.
       */
      minWidth: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * Container 최대넓이 설정합니다.
       */
      maxWidth: {
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
       * Container 최소높이 설정합니다.
       */
      minHeight: {
        type: [String, Number],
        default: '50px',
      },
      /**
       * Container 최대높이 설정합니다.
       */
      maxHeight: {
        type: [String, Number],
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
        panelWidth: this.width,
        panelHeight: this.height,
        panelMinWidth: this.minWidth,
        panelMaxWidth: this.maxWidth,
        panelMinHeight: this.Height,
        panelMaxHeight: this.Height,
        panelFlex: this.flex,
        isResizing: false,
        iswrap: 'nowrap', // 칸 딱맞춤 삐져나오지 않음
      };
    },

    computed: {
      cId() {
        return this.id;
      },
      classNames() {
        return [
          'evui-container',
        ];
      },
      userSelectStyle() {
        const wrapperObj = typeof this.wrapperStyles === 'object' ? this.wrapperStyles : null;
        const styleObject = Object.assign({
          width: this.widthVal,
          height: this.heightVal,
          'min-width': this.minWidthVal,
          'max-width': this.maxWidthVal,
          'min-height': this.maxHeightVal,
          'max-height': this.minHeightVal,
          flex: this.flexVal,
          // 'flex-flow': flexLayout + this.iswrap,
        }, wrapperObj);
        // const resize = this.isResizing; // 리사이즈 바 존재 여부 체크
        // if (resize) {
        //   return Object.assign({
        //     cursor: layoutStr,
        //     // 'flex-flow': flexLayout + this.iswrap,
        //   }, styleObject);
        // }
        return styleObject;
      },
      widthVal: {
        get() {
          return typeof this.panelWidth === 'number' ? `${this.panelWidth}px` : this.panelWidth;
        },
        set(cData) {
          this.panelWidth = this.styleSizeValue(cData);
        },
      },
      minWidthVal: {
        get() {
          return typeof this.panelMinWidth === 'number' ? `${this.panelMinWidth}px` : this.panelMinWidth;
        },
        set(cData) {
          this.panelMinWidth = this.styleSizeValue(cData);
        },
      },
      maxWidthVal: {
        get() {
          return typeof this.panelMaxWidth === 'number' ? `${this.panelMaxWidth}px` : this.panelMaxWidth;
        },
        set(cData) {
          this.panelMaxWidth = this.styleSizeValue(cData);
        },
      },
      heightVal: {
        get() {
          return typeof this.panelHeight === 'number' ? `${this.panelHeight}px` : this.panelHeight;
        },
        set(cData) {
          this.panelHeight = this.styleSizeValue(cData);
        },
      },
      maxHeightVal: {
        get() {
          return typeof this.panelMaxHeight === 'number' ? `${this.panelMaxHeight}px` : this.panelMaxHeight;
        },
        set(cData) {
          this.panelMaxHeight = this.styleSizeValue(cData);
        },
      },
      minHeightVal: {
        get() {
          return typeof this.panelMinHeight === 'number' ? `${this.panelMinHeight}px` : this.panelMinHeight;
        },
        set(cData) {
          this.panelMinHeight = this.styleSizeValue(cData);
        },
      },
      flexVal: {
        get() {
          return typeof this.panelFlex === typeof null ? null : this.panelFlex;
        },
        set(cData) {
          if (cData !== null || typeof cData === 'number') {
            this.panelFlex = cData;
          } else {
            throw new Error('flex value only number');
          }
        },
      },


    },
    mounted() {
      if (this.layout !== null) {
        if (this.$parent === undefined || this.$parent.$el.className !== 'evui-container') {
          this.$el.className = this.layout === LAYOUT_VERTICAL ? 'evui-container-root layout-v'
                                                               : 'evui-container-root layout-h';
        } else {
          this.$el.className = this.layout === LAYOUT_VERTICAL ? 'evui-container layout-v'
                                                               : 'evui-container layout-h';
        }
      } else {
         this.$el.className = 'evui-container-content';
      }
    },
    created() {

    },
    methods: {
      onMouseDown({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
        console.log('실행');
        // 마우스 클릭 이벤트 발생
        /** *
         *  resizer : 사이즈 변경 되는 타켓 리사이즈 div 바
         *  initialPageX : 해당 div에 x 좌표
         *  initialPageY : 해당 div에 y 좌표
         */
        // 컨테이너 안에 여러개 사이즈바가 존재 하는경우 이벤트 여러번 발생함 이벤트 전파 막기 위함
        event.stopImmediatePropagation();
        // 타켓 대상 class Name 존재 여부 및 class 매칭 되는지 체크
        if (resizer.className && resizer.className.match('resizebar')) {
          const self = this;
          // 부모 컨테이너
          const container = self.$el;
          // 부모 컨테이너 layout 속성값 Vbox / Hbox
          const layout = self.layout;

          // const { $el: container, layout } = self;
          // previousElementSibling 같은레벨
          //   childElemnetCount - 자식 요소 숫자를 반환하되 텍스트 노드와 주석은 제외한다.
          //   firstElementChild -  첫 번째 자식 요소를 가리킨다.
          //   lastElementChild - 마지막 자식 요소를 가리킨다.
          //   previousElementSibling - 이전 형제 요소를 가리킨다.
          //   nextElementSibling - 다음 형제 요소를 가리킨다.
          // 사이즈 변경되는 컨테이너가 resizeContainer
          const resizeContainer = resizer.previousElementSibling;
          const {
            offsetWidth: initialresizeContainerWidth,
            offsetHeight: initialresizeContainerlHeight,
          } = resizeContainer;

          // sytle 값이 %인지 체크
          const usePercentageW = !!(`${resizeContainer.style.width}`).match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/);
          const usePercentageH = !!(`${resizeContainer.style.Height}`).match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/);
          // container 객체에 이벤트 리스너 연결
          const { addEventListener, removeEventListener } = container;
          // 리사이즈 함수 생성
          const resize = (initialSize, offset = 0) => {
            if (layout === LAYOUT_VERTICAL) {
              const containerHeight = container.clientHeight; // 실제 보여지는 dom 높이
              const resizeContainerlHeight = initialSize + offset;
              resizeContainer.style.height = usePercentageH ? `${(resizeContainerlHeight / containerHeight) * 100}%`
                                                            : `${resizeContainerlHeight}px`;
              return resizeContainer.style.height;
            }

            if (layout === LAYOUT_HORIZONTAL) {
              const containerWidth = container.clientWidth;
              const resizeContainerWidth = initialSize + offset;
              resizeContainer.style.width = usePercentageW ? `${(resizeContainerWidth / containerWidth) * 100}%`
                                                           : `${resizeContainerWidth}px`;
              return resizeContainer.style.width;
            }
            return 0;
          };

          // 리사이즈 체크
          self.isResizing = true;

          let size = resize();

          // resizeContainer 사이즈 변경 이벤트
          self.$emit('ResizeStart', resizeContainer, resizer, size);

          const onMouseMove = function onMouseMove({ pageX, pageY }) {
            size =
              layout === LAYOUT_VERTICAL
                ? resize(initialresizeContainerlHeight, pageY - initialPageY)
                : resize(initialresizeContainerWidth, pageX - initialPageX);
            self.$emit('onResizeContainer', resizeContainer, resizer, size);
          };

          const onMouseUp = function onMouseUp() {
            size =
              layout === LAYOUT_VERTICAL
                ? resize(resizeContainer.clientHeight)
                : resize(resizeContainer.clientWidth);

            self.isResizing = false;


            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);

            self.$emit('onResizeStop', resizeContainer, resizer, size);
          };

          // text를 드래이그해서 이동하는 경우 마우스 업 이벤트가 끝나지 않는 현상 발생
          const onDrag = function onDrag() {
            removeEventListener('mousemove', onMouseMove);
            removeEventListener('mouseup', onMouseUp);
          };
          addEventListener('drag', onDrag);
          addEventListener('mousemove', onMouseMove);
          addEventListener('mouseup', onMouseUp);
        }
      },
      styleSizeValue(gData) {
        if (typeof gData === 'number' || !isNaN(gData)) {
          return Number(gData);
        } else if (gData.match(/^(normal|(\d+(?:\.\d+)?)(%)?)$/)) {
          // .match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
          return gData;
        }
          throw new Error('number or % value');
      },
      getWidth() {
        return this.widthVal;
      },
      setWidth(cWidth) {
        this.widthVal = this.styleSizeValue(cWidth);
      },
      getHeight() {
        return this.heightVal;
      },
      setHeight(cHeight) {
        this.heightVal = this.styleSizeValue(cHeight);
      },
      getName() {
        return this.name;
      },
      getFlex() {
        return this.flexVal;
      },
      setFlex(cFlex) {
        let fData = 0;
        if (typeof cFlex === 'number') {
          fData = cFlex;
        } else {
          throw new Error('only number value');
        }
        this.flexVal = fData;
      },
      getMinWidth() {
        return this.minWidthVal;
      },
      setMinWidth(cMinWidth) {
        this.minWidthVal = this.styleSizeValue(cMinWidth);
      },
      getMinHeight() {
        return this.minWidthVal;
      },
      setMinHeight(cMinHeight) {
        this.minHeightVal = this.styleSizeValue(cMinHeight);
      },
      getMaxWidth() {
        return this.maxWidthVal;
      },
      setMaxWidht(cMaxWidth) {
        this.minWidthVal = this.styleSizeValue(cMaxWidth);
      },
      getMaxHeigth() {
        return this.maxHeightVal;
      },
      setMaxHeight(cMaxHeight) {
        this.maxHeightVal = this.styleSizeValue(cMaxHeight);
      },
      deleteFlex() {
        // removeProperty
        this.$el.style.removeProperty('flex');
        this.panelFlex = null; // 값 초기화 안해주면 computed 동작 안함.
      },
    },
  };
</script>

<style >
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .evui-container {
    display:flex;
  }
  .evui-container-root {
    display:flex;
    box-shadow: 0 4px 10px 0 rgba(0,0,0,0.2), 0 4px 20px 0 rgba(0,0,0,0.19);
  }
  .evui-container-content{
    /*border:1px solid #000000;*/
    margin:0px 1px 1px 1px;
  }
  .layout-h {
    flex-flow:row nowrap;
    position: relative;
  }

  .layout-v {
    flex-flow:column nowrap;
    position: relative;
  }

  .layout-h >.resizebar {
  width: 10px;
  height: 100%;
  cursor: col-resize;
  }
  .layout-h >.resizebar:before {
  display: block;
  content: "● ● ●";
  color: #999999;
  position: relative;
  top: 50%;
  left: 50%;
  margin-top: -25px;
  margin-left: -5px;
  /*border-left: 1px solid #ccc;*/
  /*border-right: 1px solid #ccc;*/
  }
  .layout-h >.resizebar:hover:before {
  color: #333333;
  }


  .layout-v >.resizebar {
    width: 100%;
    height: 10px;
    cursor: row-resize;
  }
  .layout-v >.resizebar:before {
    display: block;
    content: "● ● ●";
    color: #999999;
    position: relative;
    top: 50%;
    left: 50%;
    margin-top: -10px;
    margin-left: -5px;
    /*border-left: 1px solid #ccc;*/
    /*border-right: 1px solid #ccc;*/
  }
  .layout-v >.resizebar:hover:before {
    color: #333333;
  }
</style>
