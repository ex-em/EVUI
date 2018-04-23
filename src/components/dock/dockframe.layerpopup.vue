<template>
  <div
    ref="evuiLayerPopup"
    :style="style"
    :class="{
      active: enabled,
      dragging: dragging,
      resizing: resizing,
    }"
    class="evui-layerpopup"
    @mousedown.stop="layerEleDown"
  >
    <div v-if="resizable">
      <div
        v-for="handle in handles"
        :key="handle"
        :style="{ display: enabled ? 'block' : 'none'}"
        :class="'reszie-' + handle"
        class="evui-popup-resize"
        @mousedown.stop.prevent="handleDown(handle, $event)"
      />

    </div>
    <div
      :style="popupguideSize"
      :class="isGuideLine ? 'div-guide-show': 'div-guide-hide'"
      class="evui-popup-resize-guide"/>
    <div
      :style="popupSize"
      class="evui-popup-all-layout"
    >
      <div class="evui-popup-container">
        <div class="evui-popup-head">
          <div class="evui-pop-container-title">
            <label
              class="popup-title"
            >{{ title }}</label>
          </div>
          <a
            href="#"
            class="evui-popup-maxsize"
            @click="fillParent"
          >ㅁ</a>
          <a
            href="#"
            class="evui-popup-close"
            @click="removePopup">Χ</a>
        </div>
        <div class="evui-popup-content">
          <slot/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import utils from '@/common/container.utils';

export default {
  replace: true,
  name: 'DockFrameLayerPopup',
  props: {
    /**
     *  exemComponent
     * */
    exemComponent: {
      type: Object,
      default: null,
    },
    /**
     * 레이어 팝업이 활성화 상태 여부 확인
     */
    active: {
      type: Boolean, default: true,
    },
    /**
     * 드래이그 가능 여부 확인
     */
    draggable: {
      type: Boolean, default: true,
    },
    /**
     * title를 적용합니다.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * 사이즈 변경 여부 확인
     */
    resizable: {
      type: Boolean, default: true,
    },
    /**
     * guide 넓이 설정
     */
    gw: {
      type: Number,
      default: 200,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * guide 높이 설정
     */
    gh: {
      type: Number,
      default: 200,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * 초기 넓이 설정
     */
    w: {
      type: Number,
      default: 300,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * 초기 높이 설정
     */
    h: {
      type: Number,
      default: 300,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * 최소 넓이 설정
     */
    minw: {
      type: Number,
      default: 200,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * 최소 높이 설정
     */
    minh: {
      type: Number,
      default: 200,
      validator(val) {
        return val > 0;
      },
    },
    /**
     * 초기 x축
     */
    x: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number';
      },
    },
    /**
     * 초기 Y축
     */
    y: {
      type: Number,
      default: 10,
      validator(val) {
        return typeof val === 'number';
      },
    },
    /**
     * guide x축
     */
    gx: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number';
      },
    },
    /**
     * guide Y축
     */
    gy: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number';
      },
    },
    /**
     * Z index 값
     */
    z: {
      type: [String, Number],
      default: 'auto',
      validator(val) {
        const valid = (typeof val === 'string') ? val === 'auto' : val >= 0;
        return valid;
      },
    },
    /**
     * 리사이즈 핸들
     tl - 왼쪽 상단
     tm - 상단 중간
     tr - 맨 위 오른쪽
     mr - 중간 오른쪽
     br - 오른쪽 하단
     bm - 중간 하단
     bl - 왼쪽 하단
     ml - 왼쪽 중간
     */
    handles: {
      type: Array,
      default() {
        return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
      },
      validator(val) {
        const s = new Set(['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']);

        return new Set(val.filter(h => s.has(h))).size === val.length;
      },
    },
    /**
     * 드래이그 선택 요소
     * */
    dragHandle: {
      type: String,
      default: '.evui-pop-container-title',
    },
    /**
     * 드래이그 초기화 방지
     * */
    dragCancel: {
      type: String,
      default: null,
    },
    /**
     * 마우스 드래이그 이동 가능한 축 설정
     */
    axis: {
      type: String,
      default: 'both',
      validator(val) {
        return ['x', 'y', 'both'].indexOf(val) !== -1;
      },
    },
    /**
     *부모 영역 안에서만 이동 가능 여부
      */
    parent: {
      type: Boolean, default: true,
    },
    /**
     *최대 크기 설정
     */
    maximize: {
      type: Boolean, default: true,
    },
    // 필수 속성 없으면 구동안됨
    vmMain: {
      type: Object, default: null,
    },
  },
  data() {
    return {
      top: this.y,
      left: this.x,
      width: this.w,
      height: this.h,
      resizing: false,
      dragging: false,
      enabled: this.active,
      handle: null,
      zIndex: this.z,
      maximizeTop: 0,
      maximizeLeft: 0,
      maximizeWidth: 0,
      maximizeHeight: 0,
      isMaximize: true,
      isGuideLine: false,
      guideTop: this.gy,
      guideLeft: this.gx,
      guideWidth: this.gw,
      guideHeight: this.gh,
      currentDroppable: null, // 팝업창 드레이그 위치에 해당되는 DockFrame Dom 담는다.
      popupTitle: this.title, // 팝업 제목을 add dock 제목으로 전달한다.
      addDockPosition: null, // addDock 위치 정보를 담는다.
      vmDock: null, // 해당 Dock  Vm 객체 담는다.
      vmMainFrame: this.vmMain, // 해당 Dock  Vm 객체 담는다.
      isRootPos: null, // maindockframe에 위치를 선택하면 true  , Dockframe 위치를 선택하면 false  , 초기값 null
      evuiComponent: this.exemComponent, // 팝업에 있는 컴포넌트 obj
    };
  },

  computed: {
    style() {
      return {
        top: `${this.top}px`,
        left: `${this.left}px`,
        width: `${this.width}px`,
        height: `${this.height}px`,
        zIndex: this.zIndex,
      };
    },
    popupSize() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },
    popupguideSize() {
      return {
        top: `${this.guideTop}px`,
        left: `${this.guideLeft}px`,
        width: `${this.guideWidth + 3}px`,
        height: `${this.guideHeight + 3}px`,
      };
    },
    titleVal: {
      get() {
        return this.popupTitle;
      },
      set(cData) {
        this.popupTitle = cData;
      },
    },
  },

  watch: {
    // active(val) {
    //   this.enabled = val;
    // },
    z(val) {
      if (val >= 0 || val === 'auto') {
        this.zIndex = val;
      }
    },
  },

  created() {
    // 초기 변수값
    // 부모 div 정보
    this.parentX = 0;
    this.parentW = 9999;
    this.parentY = 0;
    this.parentH = 9999;

    this.mouseX = 0;
    this.mouseY = 0;
    // down 이벤트 move에 사용
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.elmX = 0;
    this.elmY = 0;

    this.elmW = 0;
    this.elmH = 0;
  },
  mounted() {
    // document.documentElement.addEventListener('mousemove', this.layerMove, true);
    // document.documentElement.addEventListener('mousedown', this.layerDown, true);
    // document.documentElement.addEventListener('mouseup', this.layerUp, true);
    // Capturing 방식 이벤트 전달 최상위 부모부터 target element까지 순차적으로 내려오면서 이벤트
    // 전달 한다.
    this.$el.parentNode.addEventListener('mousemove', this.layerMove, true);
    this.$el.parentNode.addEventListener('mousedown', this.layerDown, true);
    this.$el.parentNode.addEventListener('mouseup', this.layerUp, true);
    // layer Dom 초기 좌표 셋팅
    this.elmX = parseInt(this.$el.style.left, 10);
    this.elmY = parseInt(this.$el.style.top, 10);
    // layer Dom 초기 넓이 높이 셋팅
    this.elmW = this.$el.offsetWidth || this.$el.clientWidth;
    this.elmH = this.$el.offsetHeight || this.$el.clientHeight;


    this.init();
  },
  beforeDestroy() {
    this.$el.parentNode.removeEventListener('mousemove', this.layerMove, true);
    this.$el.parentNode.removeEventListener('mousedown', this.layerDown, true);
    this.$el.parentNode.removeEventListener('mouseup', this.layerUp, true);
    // document.documentElement.removeEventListener('mousemove', this.layerMove, true);
    // document.documentElement.removeEventListener('mousedown', this.layerDown, true);
    // document.documentElement.removeEventListener('mouseup', this.layerUp, true);
  },

  methods: {
    vmSelectId(parentVm, id) {
     const parentObject = parentVm.$children;
     const parentLength = parentObject.length;
       for (let ix = 0; ix < parentLength; ix++) {
         const vmInstance = parentObject[ix];
            // 같은 id를 찾으면 빠져나옴
              if (vmInstance.dataRef === id) {
                this.vmDock = vmInstance;
              }
           if (vmInstance.$children.length !== 0) {
                // Dock 인 vm만 돌린다  가장 겉에만 잡고 찾기
                if (vmInstance.$el.className.match('dock') !== null) {
                  this.vmSelectId(vmInstance, id);
                }
           }
       }
    },
    init() {
      // 최소 넓이 높이 체크
      if (this.minw > this.w) {
        this.width = this.minw;
      }
      if (this.minh > this.h) {
        this.height = this.minh;
      }
     // 부모 영역 제한
      if (this.parent) {
        const parentW = parseInt(this.$el.parentNode.clientWidth, 10);
        const parentH = parseInt(this.$el.parentNode.clientHeight, 10);

        this.parentW = parentW;
        this.parentH = parentH;
        // 부모 넓이 보다 자식 더 크면 부모넓이 사용
        if (this.w > this.parentW) this.width = parentW;

        if (this.h > this.parentH) this.height = parentH;
        // 초기  가드라인 셋팅
        this.guideHeight = this.width;
        this.guideWidth = this.height;

        if ((this.x + this.w) > this.parentW) this.width = parentW - this.x;

        if ((this.y + this.h) > this.parentH) this.height = parentH - this.y;
      }
      // Dom size 정의
      this.elmW = this.width;
      this.elmH = this.height;
      // resizing 이벤트 생성
      this.$emit('resizing', this.left, this.top, this.width, this.height);
    },
    layerEleDown(e) {
      const target = e.target || e.srcElement;
      if (this.$el.contains(target)) {
        if (
          // dragHandle  체크
          (this.dragHandle &&
            !utils.matchesSelectorToParentElements(target, this.dragHandle, this.$el)) ||
          (this.dragCancel &&
            utils.matchesSelectorToParentElements(target, this.dragCancel, this.$el))) {
          return;
        }
        this.allLayerPopUpzindex();
        this.zIndex = 10;
        // if (this.draggable) {
           this.dragging = true;
        // }
      }
    },
    layerDown(e) {
      this.mouseX = e.pageX || e.clientX + this.$el.parentNode.scrollLeft;
      this.mouseY = e.pageY || e.clientY + this.$el.parentNode.scrollTop;

      // 마우스 다운 지점 정보저장
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;

      // const target = e.target || e.srcElement;
      // const regex = new RegExp('reszie-([trmbl]{2})', '');

      // if (!this.$el.contains(target) && !regex.test(target.className)) {
      //   if (this.enabled) {
      //     this.enabled = false;
      //
      //     this.$emit('deactivated');
      //     this.$emit('update:active', false);
      //   }
      // }
    },
    // layerPopup resize
    handleDown(handle, e) {
      this.handle = handle;
      this.handleX = e.pageX;
      this.handleY = e.pageY;
      if (!this.isGuideLine) {
        this.guideLeft = -1;
        this.guideTop = -1;
      }
      // layerPopup 가이드 라인 활성화
      this.isGuideLine = true;

      // if (e.stopPropagation) e.stopPropagation();
      // if (e.preventDefault) e.preventDefault();
      // resize 여부
      this.resizing = true;
    },
    fillParent() {
      // 부모가 존재 하고 , 리사이즈 가능하고 , 최대사이즈 가능할 때
      if (!this.parent || !this.resizable || !this.maximize) return;

      if (this.isMaximize) {
        // 사이즈를 최대화 하기전 정보를 남긴다.
        this.maximizeTop = this.top;
        this.maximizeLeft = this.left;
        this.maximizeWidth = this.width;
        this.maximizeHeight = this.height;

        // 최대화
        if (this.axis === 'x' || this.axis === 'both') {
          this.width = this.parentW;
          this.left = 0;
        }

        if (this.axis === 'y' || this.axis === 'both') {
          this.height = this.parentH;
          this.top = 0;
        }
        this.isMaximize = false;
        this.elmX = 0;
        this.elmY = 0;
        this.zIndex = 999;
      } else {
        // 원래 사이즈로 원복
        if (this.axis === 'x' || this.axis === 'both') {
          this.width = this.maximizeWidth;
          this.left = this.maximizeLeft;
        }

        if (this.axis === 'y' || this.axis === 'both') {
          this.height = this.maximizeHeight;
          this.top = this.maximizeTop;
        }
        this.isMaximize = true;
        // 최소화 하게되면 diffx가 0이라 값이 좌표값이 잘못됨 저장해놓은 좌표 할당
        this.elmX = this.maximizeLeft;
        this.elmY = this.maximizeTop;
        this.zIndex = 10;
      }

        this.$emit('resizing', this.left, this.top, this.width, this.height);
    },
    layerMove(e) {
      // layer popup Drag div 클릭
      // 마우스 좌표 선택
      this.mouseX = e.pageX || e.clientX + this.$el.parentNode.scrollLeft;
      this.mouseY = e.pageY || e.clientY + this.$el.parentNode.scrollTop;
      const diffX = (this.mouseX - this.lastMouseX);
      const diffY = (this.mouseY - this.lastMouseY);
      // this.mouseOffX = this.mouseOffY;
      // this.mouseOffY = 0;
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      //
      // this.parentOffsetLet = this.$parent.$el.offsetLeft;
      // this.parentOffsetTop = this.$parent.$el.offsetTop;
      // // 마우스 무브 사이즈
      // const dX = diffX;
      // const dY = diffY;


      // layer popup resize div 클릭
      let resizeX = null;
      let resizeY = null;
      let resizeTop = null;
      let resizeLeft = null;
      resizeX = (this.mouseX - this.handleX);
      resizeY = (this.mouseY - this.handleY);
      // layer size 변경 처리
      if (this.resizing) {
        // reight resize
        if (this.handle.indexOf('r') >= 0) {
          // 최소 사이즈
          if (this.elmW + resizeX > this.minw) {
            this.elmW = this.width + resizeX;
          }
        }
        // bottom resize
        if (this.handle.indexOf('b') >= 0) {
          if (this.elmH + resizeY > this.minh) {
            this.elmH = this.height + resizeY;
          }
        }

       // top rezise
        if (this.handle.indexOf('t') >= 0) {
          if (this.elmH - resizeY > this.minh) {
            resizeTop = resizeY;
            this.elmY = this.top + resizeY;
            this.elmH = this.height - resizeY;
          }
          if (this.handle.indexOf('tl') === -1) {
            resizeLeft = -1;
          }
        }

       // left resize
        if (this.handle.indexOf('l') >= 0) {
          if (this.elmW - resizeX > this.minw) {
            resizeLeft = resizeX;
            this.elmX = this.left + resizeX;
            this.elmW = this.width - resizeX;
          }
          if (this.handle.indexOf('tl') === -1) {
            resizeTop = -1;
          }
        }

        this.guideTop = resizeTop;
        this.guideLeft = resizeLeft;
        this.guideWidth = this.elmW;
        this.guideHeight = this.elmH;

        this.$emit('resizing', this.left, this.top, this.width, this.height);
      } else if (this.dragging) {
        // layer drag 처리
        if (this.parent) {
          this.elmX = this.left + diffX;
          this.elmY = this.top + diffY;

          this.dockCantainerSelectX = this.$el.parentNode.offsetLeft;
          this.dockCantainerSelectY = this.$el.parentNode.offsetTop;

          // maindockFrame에서만 움직인다
        if ((e.pageX >= this.dockCantainerSelectX &&
        this.dockCantainerSelectX + this.$el.parentNode.getBoundingClientRect().width >= e.pageX) &&
        (e.pageY >= this.dockCantainerSelectY &&
       this.dockCantainerSelectY + this.$el.parentNode.getBoundingClientRect().height >= e.pageY)) {
          // root 도킹 이미지 활성화
          this.isSelectLayer(true, this.vmMainFrame);
          // this.vmMainFrame.isSelectLayerPopup = true;
            // ============== 팝업 아래 Dom 찾기 시작 ==============
            // 순간 숨겨버려서 위치값 가져온다.
            this.$el.hidden = true;
            const dockPos = document.querySelectorAll('.selectlayerShow');
            // 해당 dom obj는 top , left , bottom , right 이미지에 대한 dom이다
            const dockPosAttr = document.elementFromPoint(e.clientX, e.clientY);
            if (dockPos.length) {
              [].forEach.call(dockPos, (el) => {
                const hiddenDom = el;
                hiddenDom.style.display = 'none';
              });
            }
            // 해당 dom은 hidden dev 뺀 속성들이다.
            const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            if (dockPos.length) {
              [].forEach.call(dockPos, (el) => {
                const hiddenDom = el;
                hiddenDom.style.display = null;
              });
            }
            this.$el.hidden = false;
            const droppableBelow = elemBelow.closest('.dockcontainer');
            const resizeBelow = elemBelow.closest('.resizebar');
            // ============== 팝업 아래 Dom찾기 끝 ==============


            // 팝업이 독컨테이너 안에 속하면 css 변경 처리 작업 다른 Dock로 옴겨 갔을 때
            if (this.currentDroppable !== droppableBelow && this.currentDroppable !== null) {
              this.currentDroppable.classList.remove('select-Dock-border');
              this.currentDroppable = null;
              // 다른 dock으로 이동하게 되면 초기화 처리 해준다.
              this.isSelectLayer(false, this.vmDock);
              this.vmDock = null;
            }
            // dock 위에 올라가면 class를 입혀 표시해준다.
            if (droppableBelow !== null && !droppableBelow.className.match('select-Dock-border')) {
              droppableBelow.classList.add('select-Dock-border');
              this.currentDroppable = droppableBelow;
            }
            // dockframe 객체를 담는다.
            if (droppableBelow !== null && this.vmDock === null) {
              this.vmSelectId(this.vmMainFrame, droppableBelow.getAttribute('data-ref'));
              this.isSelectLayer(true, this.vmDock);
            }
            // 이미 존재하지만 마우스 업버튼으로 false가 된경우 다시 true 만들어준다
            if (this.vmDock !== null && !this.vmDock.isSelectLayerPopup) {
              this.isSelectLayer(true, this.vmDock);
            }
            // if (resizeBelow !== null && this.addDockPosition !== null && this.vmDock !== null) {
            //   this.isSelectLayer(true, this.vmDock);
            // }
            // addDocking pos 값 추출  && hidden layer 영역 표시
            const addDockPos = dockPosAttr.getAttribute('pos');
            if (addDockPos !== null) {
              this.addDockPosition = addDockPos;
              if (dockPosAttr.className.match('root')) {
                this.isRootPos = true;
              } else {
                this.isRootPos = false;
              }
              this.dockPostionLayerSize(addDockPos, droppableBelow, resizeBelow);
            } else {
              // 초기화 처리
              this.addDockPosition = null;
            }
          }


          if (this.axis === 'x' || this.axis === 'both') {
            this.left = this.elmX;
          }
          if (this.axis === 'y' || this.axis === 'both') {
            this.top = this.elmY;
          }

          this.$emit('dragging', this.left, this.top);
        }
      }
    },
    layerUp() {
      // 리사이즈  마우스 업이벤트.
      if (this.resizing) {
        // layerPopup 가이드 라인 비활성화
        this.isGuideLine = false;

        // guide resize 변경
        // layerPopup 사이즈/좌표 적용
        // this.left = this.guideLeft;
        // this.top = this.guideTop;
        // top rezise
        if (this.handle.indexOf('t') >= 0) {
          this.top = this.elmY;
          this.height = this.elmH;
        }
        // bottom resize
        if (this.handle.indexOf('b') >= 0) {
          this.height = this.elmH;
        }
        // left resize
        if (this.handle.indexOf('l') >= 0) {
          this.left = this.elmX;
          this.width = this.elmW;
        }
        // reight resize
        if (this.handle.indexOf('r') >= 0) {
          this.width = this.elmW;
        }
        // guid line 값 변경 된 값으로 셋팅
        this.guideLeft = this.left;
        this.guideTop = this.top;

        // 변경된 사이즈로 변경 초기화
        this.elmW = this.width;
        this.elmH = this.height;
        this.guideWidth = this.elmW;
        this.guideHeight = this.elmH;
        this.resizing = false;
        this.$emit('resizestop', this.left, this.top, this.width, this.height);
      }
      // layerpopup 드래이그 무빙 처리
      if (this.dragging) {
        if (this.vmDock !== null) {
          // dock객체 존재 할때만
          this.isSelectLayer(false, this.vmDock);
        }

          // 추후 도킹 추가 될떄마다 data Map 생성
        if (this.isRootPos !== null && this.addDockPosition !== null) { // 도킹을 선택했다.
          if (this.vmMainFrame.$el.children[0].querySelector('.dockcontainer') === null) { // 제일 처음 도킹
            this.rootCreateDockFrame('root');
          } else if (this.isRootPos) {
            // root 도킹 여부 판단
            this.addRootDockFrame();
          } else {
            this.addDockFrame();
          }
        }
        //  선택 된 도킹 영역 class 삭제
        if (this.currentDroppable !== null) {
          this.currentDroppable.classList.remove('select-Dock-border');
          this.currentDroppable = null;
        }
        // 드래이그 무빙 끝나면 도킹상태 flag 다시 변경  root 바로 밑 자식
        this.isSelectLayer(false, this.vmMainFrame);
        this.dragging = false;
        this.$emit('dragstop', this.left, this.top);
      }
      this.handle = null;
      this.elmX = this.left;
      this.elmY = this.top;
    },
    dockPostionLayerSize(pos, isDockContainer, isResizeBelow) {
      let rootObject = this.vmMainFrame;
      // root에서 도킹인제 dock에서 도킹인지 확인
      if (!this.isRootPos) {
        rootObject = this.vmDock;
      }
      const rootFrameSize = rootObject.$el.getBoundingClientRect();
      let hiddenLayerStyle = null;
      if (isDockContainer === null && isResizeBelow === null) {
        switch (pos) {
          case 'top':
            hiddenLayerStyle = { width: '100%', height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'left':
            hiddenLayerStyle = { width: '100%', height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'right':
            hiddenLayerStyle = { width: '100%', height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'bottom':
            hiddenLayerStyle = { width: '100%', height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          default :
            hiddenLayerStyle = { width: '0px', height: '0px', bottom: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
        }
      } else {
        switch (pos) {
          case 'top':
            hiddenLayerStyle = { width: '100%', height: `${rootFrameSize.height / 2}px`, top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'left':
            hiddenLayerStyle = { width: `${rootFrameSize.width / 2}px`, height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'right':
            hiddenLayerStyle = { width: `${rootFrameSize.width / 2}px`, height: '100%', top: '0px', right: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'bottom':
            hiddenLayerStyle = { width: '100%', height: `${rootFrameSize.height / 2}px`, bottom: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          case 'tab': // tab
            hiddenLayerStyle = { width: '100%', height: '100%', top: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
            break;
          default :
            hiddenLayerStyle = { width: '0px', height: '0px', bottom: '0px', left: '0px' };
            rootObject.hiddenLayerStyle = hiddenLayerStyle;
        }
      }
      return pos;
    },
    // 제일 처음 도킹 어떤 포지션을 선택하든 (무조건 화면 풀 사이즈)
    rootCreateDockFrame(type) {
      // frame root vm
      const rootFrameVm = this.vmMainFrame;
      const rootFrameVmSize = rootFrameVm.$el.getBoundingClientRect();
      const wrapperSize = { width: `${rootFrameVmSize.width}px`, height: `${rootFrameVmSize.height}px` };
      // const pos = this.addDockPosition;
      if (type === 'root') {
        rootFrameVm.addRootDockLayout = 'root';
        rootFrameVm.addDockTitle = this.popupTitle;
        rootFrameVm.evuiComponent = this.evuiComponent;
        rootFrameVm.addDockSize = wrapperSize;
        rootFrameVm.addRootDockFrame('root');
      }
      // 드래이그 무빙 끝나면 도킹상태 flag 다시 변경  root 바로 밑 자식
      this.isSelectLayer(false, this.vmMainFrame);
      // 도킹 완료되면 팝업을 삭제한다.
      this.removePopup();
    },
    // Dockframe 추가
    addDockFrame() {
      const rootFrameVm = this.vmMainFrame;
      const dockFrame = this.vmDock;
      // subDockFrame 객체 반환
      this.vmSelectId(rootFrameVm, dockFrame.$el.parentNode.getAttribute('data-ref'));
      const subDockFrame = this.vmDock;
      const dockPosition = this.addDockPosition;
      // const targetDock = this.vmDock;
      const targetSize = dockFrame.$el.getBoundingClientRect();
      // 도킹에 필요한 정보
      const wrapperSize = { width: `${targetSize.width}`, height: `${targetSize.height}`, type: 'inner' };
      wrapperSize.newDockFrameId = dockFrame;
      wrapperSize.insertTargetId = subDockFrame;
      switch (dockPosition) {
        case 'top':
          rootFrameVm.addRootDockLayout = 'top';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.evuiComponent = this.evuiComponent;
          // wrapperSize.height /= 2;
          // wrapperSize.height -= 2; // 리사이즈 바 빼준다.
          rootFrameVm.addDockSize = wrapperSize;
          dockFrame.$el.style.width = `${wrapperSize.width}px`;
          dockFrame.$el.style.height = `${(wrapperSize.height / 2) - 2}px`;
          break;
        case 'left':
          rootFrameVm.addRootDockLayout = 'left';
          rootFrameVm.addDockTitle = this.popupTitle;
          // wrapperSize.width /= 2;
          // wrapperSize.width -= 2; // 리사이즈 바 빼준다.
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          dockFrame.$el.style.width = `${(wrapperSize.width / 2) - 2}px`;
          dockFrame.$el.style.height = `${wrapperSize.height}px`;
          break;
        case 'right':
          rootFrameVm.addRootDockLayout = 'right';
          rootFrameVm.addDockTitle = this.popupTitle;
          // wrapperSize.width /= 2;
          // wrapperSize.width -= 2; // 리사이즈 바 빼준다.
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          dockFrame.$el.style.width = `${(wrapperSize.width / 2) - 2}px`;
          dockFrame.$el.style.height = `${wrapperSize.height}px`;
          break;
        case 'bottom':
          rootFrameVm.addRootDockLayout = 'bottom';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.evuiComponent = this.evuiComponent;
          // wrapperSize.height /= 2;
          // wrapperSize.height -= 2; // 리사이즈 바 빼준다.
          rootFrameVm.addDockSize = wrapperSize;
          dockFrame.$el.style.width = `${wrapperSize.width}px`;
          dockFrame.$el.style.height = `${(wrapperSize.height / 2) - 2}px`;
          break;
        case 'tab': // tab 아직 구상되지 않음.
          break;
        default :
      }
      // 동적 컴포넌트 추가
      rootFrameVm.addDockFrame(dockPosition);
      // 드래이그 무빙 끝나면 도킹상태 flag  변경 도킹 top,left,right,bottom 이미지 view
      this.isSelectLayer(false, this.vmMainFrame);
      // 도킹 완료되면 팝업을 삭제한다.
      this.removePopup();
    },
    // Root Dockfrmae 추가 함수 dockframe.main.vue와 연동 되어있다.
    addRootDockFrame() {
      const rootFrameVm = this.vmMainFrame;
      const dockPosition = this.addDockPosition;
      // const targetDock = this.vmDock;
      const targetSize = rootFrameVm.$el.getBoundingClientRect();
      const wrapperSize = { width: `${targetSize.width}`, height: `${targetSize.height}`, type: 'root' };
      switch (dockPosition) {
        case 'top':
          rootFrameVm.addRootDockLayout = 'top';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          break;
        case 'left':
          rootFrameVm.addRootDockLayout = 'left';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          break;
        case 'right':
          rootFrameVm.addRootDockLayout = 'right';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          break;
        case 'bottom':
          rootFrameVm.addRootDockLayout = 'bottom';
          rootFrameVm.addDockTitle = this.popupTitle;
          rootFrameVm.addDockSize = wrapperSize;
          rootFrameVm.evuiComponent = this.evuiComponent;
          break;
        default :
      }
      // 동적 컴포넌트 추가
      rootFrameVm.addRootDockFrame(dockPosition);
      // 드래이그 무빙 끝나면 도킹상태 flag  변경 도킹 top,left,right,bottom 이미지 view
      this.isSelectLayer(false, this.vmMainFrame);
      // 도킹 완료되면 팝업을 삭제한다.
      this.removePopup();
    },
    // 도킹이미지 show or hide
    isSelectLayer(flag, vm) {
      const vmObj = vm;
      vmObj.isSelectLayerPopup = flag;
    },
    // 레어어 팝업이 여러개 있을때 클릭한 팝업 zindex 값을 수정한다.
    allLayerPopUpzindex() {
      const popUp = document.documentElement.getElementsByClassName('evui-layerpopup');
      const popUpLength = popUp.length;
      for (let ix = 0; ix < popUpLength; ix++) {
        const popUpDom = popUp[ix];
        popUpDom.style.zIndex = 'auto';
      }
    },
    // 레이어팝업 소멸 시킨다.
    removePopup() {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
    },
  },
};
</script>

<style scoped>
  .evui-layerpopup {
    position: absolute;
    box-sizing: border-box;
    z-index: 500;
  }
  /**
  * 리사이즈 핸들
  tl - 왼쪽 상단
  tm - 상단 중간
  tr - 맨 위 오른쪽
  mr - 중간 오른쪽
  br - 오른쪽 하단
  bm - 중간 하단
  bl - 왼쪽 하단
  ml - 왼쪽 중간
  */
  .evui-popup-resize {
    box-sizing: border-box;
    display: none;
    position: absolute;
    font-size: 1px;
    background: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .reszie-tl {
    width: 5px;
    height: 5px;
    top: -6px;
    left: -6px;
    cursor: nw-resize;
    z-index: 11;
  }
  .reszie-tm {
    width: 100%;
    height: 5px;
    top: -6px;
    /*left: 50%;*/
    /*margin-left: -5px;*/
    cursor: n-resize;
    z-index: 11;
  }
  .reszie-tr {
    width: 5px;
    height: 5px;
    top: -6px;
    right: -6px;
    cursor: ne-resize;
    z-index: 11;
  }
  .reszie-ml {
    width: 5px;
    height: 100%;
    /*top: 50%;*/
    /*margin-top: -5px;*/
    left: -6px;
    cursor: w-resize;
    z-index: 11;
  }
  .reszie-mr {
    width: 5px;
    height: 100%;
    /*top: 50%;*/
    /*margin-top: -5px;*/
    right: -6px;
    cursor: e-resize;
    z-index: 11;
  }
  .reszie-bl {
    width: 5px;
    height: 5px;
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
    z-index: 11;
  }
  .reszie-bm {
    width: 100%;
    height: 5px;
    bottom: -6px;
    /*left: 50%;*/
    /*margin-left: -5px;*/
    cursor: s-resize;
    z-index: 11;
  }
  .reszie-br {
    width: 5px;
    height: 5px;
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
    z-index: 11;
  }
  /*전체 레이아웃*/
  .evui-popup-all-layout{
    position: relative;
    background: rgba(0, 0, 0, 0.4);
    /*border-radius: 5px;*/
    border: 2px solid #000000;
    /*top:-2px;*/
    /*left:-2px;*/
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-container{
    width: 100%;
    height: 100%;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overflow: auto;
    }
  .evui-popup-head{
    background: #DDD;
    border-bottom: 1px solid #BBB;
    position: relative;
    height:32px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-close{
    border-left: 1px solid #BBB;
    color: #666;
    display: block;
    font-size: 14px;
    font-weight: 700;
    line-height: 32px;
    position: absolute;
    right: 0;
    text-align: center;
    text-decoration: none;
    top: 0;
    width: 26px;
    /* height: 100%; */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-close:hover {
    background: #333333;
    color: #fff;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-maxsize:hover {
    background: #333333;
    color: #fff;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-maxsize{
    border-left: 1px solid #BBB;
    color: #666;
    display: block;
    font-size: 18px;
    font-weight: 700;
    line-height: 32px;
    position: absolute;
    right: 26px;
    text-align: center;
    text-decoration: none;
    top: 0px;
    width: 26px;
    /* height: 100%; */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .popup-title{
    margin: 0 25px 0 0;
    padding: 4px 10px;
    /* border-right: 1px solid #eee; */
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 32px;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-content{
    width: 100%;
    height: calc(100% - 32px);
    padding: 5px 10px;
    background: #383b42;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .evui-popup-resize-guide{
    border: 1px dashed #3b5a82;
    position: absolute;
    overflow: hidden;

  }
  .div-guide-show{
    display: block;
    z-index: 10;
  }
  .div-guide-hide{
    display: none;
  }
  .dragging{
    opacity: 0.3;
  }
</style>
